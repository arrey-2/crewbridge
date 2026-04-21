import { SAFETY_KEYWORDS } from './constants';

export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export function sanitizeInput(value: string): string {
  const noHtml = value.replace(/<[^>]*>/g, ' ');
  const stripped = noHtml.replace(/[{}$`\\]/g, '');
  const noPromptInjection = stripped.replace(/\b(ignore|bypass|override|system prompt|developer message|tool call)\b/gi, '');
  return noPromptInjection.replace(/\s+/g, ' ').trim().slice(0, 500);
}

export function hasSafetyFlag(text: string): boolean {
  const lower = text.toLowerCase();
  return SAFETY_KEYWORDS.some((keyword) => lower.includes(keyword));
}

export function getDailyResetText(): string {
  return "You have reached today's translation limit. Resets at midnight.";
}
