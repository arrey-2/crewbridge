import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase';
import { getDailyResetText, hasSafetyFlag, sanitizeInput } from '@/lib/utils';
import { TRANSLATION_SYSTEM_PROMPT } from '@/lib/constants';

const requestLog = new Map<string, number[]>();

function extractTranslation(payload: any): string | null {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) return payload.output_text.trim();
  const pieces = payload?.output?.flatMap((item: any) => item?.content ?? []) ?? [];
  const text = pieces
    .map((c: any) => c?.text)
    .filter(Boolean)
    .join(' ')
    .trim();
  return text || null;
}

async function requestTranslation(input: string, trade: string, sourceLanguage: string, targetLanguage: string) {
  const hasKey = Boolean(process.env.OPENAI_API_KEY);
  if (!hasKey) {
    console.error('[translate] OPENAI_API_KEY missing. Translation service not configured.');
    return { ok: false as const, error: 'Translation service is not configured right now.' };
  }

  try {
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
          {
            role: 'user',
            content: `Trade: ${trade}\nSource language: ${sourceLanguage}\nTarget language: ${targetLanguage}\nInstruction: Preserve tone, structure, urgency, and practical field wording.\nText to translate: ${input}`
          }
        ]
      })
    });

    const rawText = await openAIResponse.text();
    if (!openAIResponse.ok) {
      console.error('[translate] OpenAI request failed', {
        status: openAIResponse.status,
        body: rawText,
        hasOpenAIKey: hasKey
      });
      return { ok: false as const, error: 'Translation unavailable. Please try again.' };
    }

    let payload: any;
    try {
      payload = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('[translate] Unable to parse OpenAI response JSON', { rawText, parseErr });
      return { ok: false as const, error: 'Translation unavailable. Please try again.' };
    }

    const translated = extractTranslation(payload);
    if (!translated) {
      console.error('[translate] OpenAI response contained no translatable text', { payload });
      return { ok: false as const, error: 'Translation unavailable. Please try again.' };
    }

    return { ok: true as const, translated };
  } catch (err) {
    console.error('[translate] Unexpected translation error', {
      err,
      hasOpenAIKey: hasKey
    });
    return { ok: false as const, error: 'Translation unavailable. Please try again.' };
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('cb-access-token')?.value;
  const isDemo = cookieStore.get('cb-demo')?.value === '1' || token === 'demo';

  const body = await request.json();
  const input = sanitizeInput(body.input ?? '');
  const senderRole = body.senderRole === 'Worker' ? 'Worker' : 'Owner';
  const trade = body.trade ?? 'General Labor';
  const jobName = sanitizeInput(body.jobName ?? 'Untitled Job');

  if (!input) return NextResponse.json({ error: 'Input required' }, { status: 400 });

  const sourceLanguage = senderRole === 'Owner' ? 'English' : 'Spanish';
  const targetLanguage = senderRole === 'Owner' ? 'Spanish' : 'English';
  const safetyFlag = hasSafetyFlag(sourceLanguage === 'English' ? input : '');

  if (isDemo) {
    const demoSessionId = cookieStore.get('cb-demo-session')?.value || crypto.randomUUID();
    const now = Date.now();
    const windowStart = now - 60_000;
    const key = `demo:${demoSessionId}`;
    const events = (requestLog.get(key) ?? []).filter((ts) => ts > windowStart);
    if (events.length >= 5) return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    events.push(now);
    requestLog.set(key, events);

    const demoCount = Number(cookieStore.get('cb-demo-count')?.value ?? '0');
    if (demoCount >= 10) return NextResponse.json({ error: 'Demo limit reached. Start a new demo session from login.' }, { status: 403 });

    const translationResult = await requestTranslation(input, trade, sourceLanguage, targetLanguage);
    if (!translationResult.ok) return NextResponse.json({ error: translationResult.error }, { status: 500 });

    const response = NextResponse.json({ translated: translationResult.translated, safetyFlag, usageRemaining: 10 - (demoCount + 1), demo: true });
    response.cookies.set('cb-demo-session', demoSessionId, { path: '/', maxAge: 60 * 60 * 8 });
    response.cookies.set('cb-demo-count', `${demoCount + 1}`, { path: '/', maxAge: 60 * 60 * 8 });
    return response;
  }

  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerClient();
  const admin = createServiceClient();
  const { data: authData } = await supabase.auth.getUser(token);
  const user = authData.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = Date.now();
  const windowStart = now - 60_000;
  const userEvents = (requestLog.get(user.id) ?? []).filter((ts) => ts > windowStart);
  if (userEvents.length >= 5) return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  userEvents.push(now);
  requestLog.set(user.id, userEvents);

  const sessionCount = Number(cookieStore.get('cb-session-count')?.value ?? '0');
  if (sessionCount >= 10) return NextResponse.json({ error: 'Session limit reached. Please log in again.' }, { status: 440 });

  const today = new Date().toISOString().slice(0, 10);
  const { data: usageRows } = await admin.from('usage').select('*').eq('user_id', user.id).eq('date', today).limit(1);
  const usage = usageRows?.[0];
  if ((usage?.translation_count ?? 0) >= 20) return NextResponse.json({ error: getDailyResetText() }, { status: 403 });

  const translationResult = await requestTranslation(input, trade, sourceLanguage, targetLanguage);
  if (!translationResult.ok) return NextResponse.json({ error: translationResult.error }, { status: 500 });

  let jobId = body.jobId as string | undefined;
  if (!jobId) {
    const { data: newJob } = await admin.from('jobs').insert({ user_id: user.id, name: jobName }).select('id').single();
    jobId = newJob?.id;
  }

  await admin.from('translations').insert({
    user_id: user.id,
    job_id: jobId,
    job_name: jobName,
    sender_role: senderRole,
    original_text: input,
    translated_text: translationResult.translated,
    source_language: sourceLanguage,
    target_language: targetLanguage,
    trade,
    safety_flag: safetyFlag
  });

  if (!usage) await admin.from('usage').insert({ user_id: user.id, date: today, translation_count: 1 });
  else await admin.from('usage').update({ translation_count: usage.translation_count + 1 }).eq('id', usage.id);

  const response = NextResponse.json({ translated: translationResult.translated, safetyFlag, usageRemaining: 20 - ((usage?.translation_count ?? 0) + 1) });
  response.cookies.set('cb-session-count', `${sessionCount + 1}`, { path: '/', maxAge: 60 * 60 * 8 });
  return response;
}
