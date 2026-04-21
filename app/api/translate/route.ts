import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase';
import { getDailyResetText, hasSafetyFlag, sanitizeInput } from '@/lib/utils';
import { TRANSLATION_SYSTEM_PROMPT } from '@/lib/constants';

const requestLog = new Map<string, number[]>();
const DEMO_DAILY_LIMIT = 5;
const DEMO_SESSION_LIMIT = 3;

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('cb-access-token')?.value;
  const isDemo = token === 'demo' || cookieStore.get('cb-demo')?.value === '1';

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const input = sanitizeInput(body.input ?? '');
  const senderRole = body.senderRole === 'Worker' ? 'Worker' : 'Owner';
  const trade = body.trade ?? 'General Labor';
  const jobName = sanitizeInput(body.jobName ?? 'Untitled Job');

  if (!input) return NextResponse.json({ error: 'Input required' }, { status: 400 });

  const sourceLanguage = senderRole === 'Owner' ? 'English' : 'Spanish';
  const targetLanguage = senderRole === 'Owner' ? 'Spanish' : 'English';
  const safetyFlag = hasSafetyFlag(sourceLanguage === 'English' ? input : '');

  const sessionCount = Number(cookieStore.get('cb-session-count')?.value ?? '0');
  const maxSessionCount = isDemo ? DEMO_SESSION_LIMIT : 10;
  if (sessionCount >= maxSessionCount) {
    return NextResponse.json({ error: isDemo ? 'Demo session limit reached. Create an account for more translations.' : 'Session limit reached. Please log in again.' }, { status: 440 });
  }

  const rateKey = isDemo ? 'demo-user' : token;
  const now = Date.now();
  const windowStart = now - 60_000;
  const userEvents = (requestLog.get(rateKey) ?? []).filter((ts) => ts > windowStart);
  if (userEvents.length >= 5) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }
  userEvents.push(now);
  requestLog.set(rateKey, userEvents);

  let usageCount = 0;
  let userId: string | null = null;

  if (!isDemo) {
    const supabase = createServerClient();
    const admin = createServiceClient();
    const { data: authData } = await supabase.auth.getUser(token);
    const user = authData.user;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    userId = user.id;

    const today = new Date().toISOString().slice(0, 10);
    const { data: usageRows } = await admin
      .from('usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .limit(1);

    const usage = usageRows?.[0];
    usageCount = usage?.translation_count ?? 0;
    if (usageCount >= 20) {
      return NextResponse.json({ error: getDailyResetText() }, { status: 403 });
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        max_output_tokens: 300,
        input: [
          { role: 'system', content: TRANSLATION_SYSTEM_PROMPT },
          { role: 'user', content: `Trade: ${trade}\nTranslate from ${sourceLanguage} to ${targetLanguage}: ${input}` }
        ]
      })
    });

    if (!openAIResponse.ok) {
      return NextResponse.json({ error: 'Translation unavailable. Please try again.' }, { status: 500 });
    }

    const payload = await openAIResponse.json();
    const translated = payload.output_text?.trim() || 'Translation unavailable. Please try again.';

    let jobId = body.jobId as string | undefined;
    if (!jobId) {
      const { data: newJob } = await admin
        .from('jobs')
        .insert({ user_id: user.id, name: jobName })
        .select('id')
        .single();
      jobId = newJob?.id;
    }

    await admin.from('translations').insert({
      user_id: user.id,
      job_id: jobId,
      job_name: jobName,
      sender_role: senderRole,
      original_text: input,
      translated_text: translated,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      trade,
      safety_flag: safetyFlag
    });

    if (!usage) {
      await admin.from('usage').insert({ user_id: user.id, date: today, translation_count: 1 });
    } else {
      await admin.from('usage').update({ translation_count: usage.translation_count + 1 }).eq('id', usage.id);
    }

    const response = NextResponse.json({ translated, safetyFlag, usageRemaining: 20 - (usageCount + 1) });
    response.cookies.set('cb-session-count', `${sessionCount + 1}`, { path: '/', maxAge: 60 * 60 * 8 });
    return response;
  }

  const demoDailyCount = Number(cookieStore.get('cb-demo-count')?.value ?? '0');
  if (demoDailyCount >= DEMO_DAILY_LIMIT) {
    return NextResponse.json({ error: 'Demo limit reached. Create an account for more translations.' }, { status: 403 });
  }

  const openAIResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      max_output_tokens: 220,
      input: [
        { role: 'system', content: `${TRANSLATION_SYSTEM_PROMPT} Keep demo translations short, natural, and practical.` },
        { role: 'user', content: `Trade: ${trade}\nTranslate from ${sourceLanguage} to ${targetLanguage}: ${input}` }
      ]
    })
  });

  if (!openAIResponse.ok) {
    return NextResponse.json({ error: 'Translation unavailable. Please try again.' }, { status: 500 });
  }

  const payload = await openAIResponse.json();
  const translated = payload.output_text?.trim() || 'Translation unavailable. Please try again.';
  const response = NextResponse.json({
    translated,
    safetyFlag,
    usageRemaining: DEMO_DAILY_LIMIT - (demoDailyCount + 1),
    demoMode: true
  });
  response.cookies.set('cb-demo-count', `${demoDailyCount + 1}`, { path: '/', maxAge: 60 * 60 * 8 });
  response.cookies.set('cb-session-count', `${sessionCount + 1}`, { path: '/', maxAge: 60 * 60 * 8 });
  return response;
}
