# V.O.I.D — Voice Operated Insurance Dispute

Auto-appeal your insurance denial. NPI audit + ERISA letter generator.

## What it does

1. Upload your insurance denial letter (PDF or image)
2. AI extracts the denial code and reviewing doctor's NPI
3. Hits the real US government NPPES registry to audit the doctor's specialty
4. Detects specialty mismatches (e.g. a Pediatrician reviewing an adult spine MRI)
5. Generates a legally-grounded ERISA appeal letter citing Section 503

## Live

[v-o-i-d.vercel.app](https://v-o-i-d.vercel.app)

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS + Cormorant Garamond / DM Mono
- Google Gemini 2.5 Flash
- NPPES Government Registry API (free)

## Setup

```bash
cp .env.example .env.local
# Add your GEMINI_API_KEY from aistudio.google.com
npm install
npm run dev
```

## Environment Variables

```
GEMINI_API_KEY=        # from aistudio.google.com
NEXT_PUBLIC_APP_URL=   # your deployed URL
```
