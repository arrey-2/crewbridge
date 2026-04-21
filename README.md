# CrewBridge

CrewBridge is a bilingual construction-site communication app built with Next.js 14, Supabase, and OpenAI translation via secure server routes.

## Setup

1. Copy `.env.example` to `.env.local` and fill values.
2. Install dependencies: `npm install`
3. Apply `supabase/schema.sql` to your Supabase project.
4. Run app: `npm run dev`

## Security highlights

- OpenAI API key is used only in `/api/translate`.
- Authenticated user required for API translation.
- Input sanitization and locked system prompt.
- Daily/session/rate limits enforced.
