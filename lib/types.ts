export type Trade = 'Plumbing' | 'Electrical' | 'HVAC' | 'Framing' | 'General Labor';
export type SenderRole = 'Owner' | 'Worker';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  trade: Trade | null;
  role: SenderRole | null;
  onboarding_complete: boolean;
  created_at: string;
}

export interface TranslationLog {
  id: string;
  user_id: string;
  job_id: string;
  job_name: string;
  sender_role: SenderRole;
  original_text: string;
  translated_text: string;
  source_language: 'English' | 'Spanish';
  target_language: 'English' | 'Spanish';
  trade: Trade;
  safety_flag: boolean;
  created_at: string;
}
