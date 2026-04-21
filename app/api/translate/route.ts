import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase';
import { getDailyResetText, hasSafetyFlag, sanitizeInput } from '@/lib/utils';
import { TRANSLATION_SYSTEM_PROMPT } from '@/lib/constants';

const requestLog = new Map<string, number[]>();

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('cb-access-token')?.value;

  if (!token || token === 'demo') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const admin = createServiceClient();
  const { data: authData } = await supabase.auth.getUser(token);
  const user = authData.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = Date.now();
  const windowStart = now - 60_000;
  const userEvents = (requestLog.get(user.id) ?? []).filter((ts) => ts > windowStart);
  if (userEvents.length >= 5) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }
  userEvents.push(now);
  requestLog.set(user.id, userEvents);

  const sessionCount = Number(cookieStore.get('cb-session-count')?.value ?? '0');
  if (sessionCount >= 10) {
    return NextResponse.json({ error: 'Session limit reached. Please log in again.' }, { status: 440 });
  }

  const body = await request.json();
  const input = sanitizeInput(body.input ?? '');
  const senderRole = body.senderRole === 'Worker' ? 'Worker' : 'Owner';
  const trade = body.trade ?? 'General Labor';
  const jobName = sanitizeInput(body.jobName ?? 'Untitled Job');

  if (!input) return NextResponse.json({ error: 'Input required' }, { status: 400 });

  const today = new Date().toISOString().slice(0, 10);
  const { data: usageRows } = await admin
    .from('usage')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .limit(1);

  const usage = usageRows?.[0];
  if ((usage?.translation_count ?? 0) >= 20) {
    return NextResponse.json({ error: getDailyResetText() }, { status: 403 });
  }

  const sourceLanguage = senderRole === 'Owner' ? 'English' : 'Spanish';
  const targetLanguage = senderRole === 'Owner' ? 'Spanish' : 'English';
  const safetyFlag = hasSafetyFlag(sourceLanguage === 'English' ? input : '');

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
        {
          role: 'system',
          content: TRANSLATION_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `Trade: ${trade}\nSource language: ${sourceLanguage}\nTarget language: ${targetLanguage}\nInstruction: Preserve tone, structure, urgency, and practical field wording.\nText to translate: ${input}`
        }
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

  const response = NextResponse.json({ translated, safetyFlag, usageRemaining: 20 - ((usage?.translation_count ?? 0) + 1) });
  response.cookies.set('cb-session-count', `${sessionCount + 1}`, { path: '/', maxAge: 60 * 60 * 8 });
  return response;
}
