# V.O.I.D — Voice Operated Insurance Dispute

So, I built this because I was looking at how insurance companies deny claims and people just... accept it. They don't know they have legal rights. They don't know the doctor who denied their claim might be a pediatrician reviewing an adult spine MRI. And they definitely don't know what ERISA is.

That's basically what V.O.I.D. solves. You upload your denial letter, it does the hard work, and you get a legally-grounded appeal letter ready to send.

**Live:** [v-o-i-d.vercel.app](https://v-o-i-d.vercel.app)

---

## What it actually does

The whole thing works in 4 steps.

You upload your denial letter (PDF or image), the app reads it using Gemini AI and pulls out the denial code, claim number, and the reviewing doctor's NPI number. The next thing it does is hit the real NPPES government registry — that's a free US government database that has every licensed doctor in the country — and checks the doctor's specialty. If a pediatrician denied an adult spine MRI, the app flags that as a specialty mismatch. That's a real, documentable legal fact that insurance companies have to respond to.

From there it generates a formal ERISA appeal letter citing Section 503, the specific denial code, the doctor's actual name and NPI, and your personal details. The letter is editable before you download or copy it.

---

## Why this is different from just asking ChatGPT

I get this question a lot, so let me explain it properly.

When you paste a denial letter into ChatGPT you get a generic appeal letter. V.O.I.D. does three things ChatGPT can't do on its own. First, it hits the real NPPES government registry in real time so that you get actual verified data about the reviewing doctor, not a guess. Second, it automatically builds the legal argument around what it finds — if there's a specialty mismatch, that goes in the letter as a documented federal violation, not just a complaint. Third, the whole workflow is one upload. You don't need to know what ERISA is, what a denial code means, or how to write a legal letter. The system handles all of that so that you can focus on what matters.

---

## How the system works

```
Upload denial letter (PDF / JPG / PNG)
        ↓
Gemini AI extracts:
  - Denial code (e.g. CO-197)
  - Claim number + Policy ID
  - Reviewing doctor's NPI number
        ↓
NPPES Government Registry API lookup
  - Real doctor name
  - Real specialty
  - Specialty mismatch detection
        ↓
Findings ranked by legal impact:
  - Specialty mismatch (HIGH)
  - Policy contradiction (MEDIUM)
  - ERISA Section 503 grounds (GROUNDS)
        ↓
Gemini generates personalized ERISA letter
with your name, contact info, and DOB
        ↓
Edit → Copy → Download PDF
```

---

## Stack

I built this over a weekend using Next.js 14 App Router with TypeScript so that there's no type mismatches blowing up the flow, Tailwind CSS for styling, and Gemini 2.5 Flash for the AI work. The NPI lookup uses the free NPPES API from the US government — no API key needed for that part.

- **Framework:** Next.js 14 App Router + TypeScript (strict mode)
- **Styling:** Tailwind CSS + Cormorant Garamond + DM Mono
- **AI:** Google Gemini 2.5 Flash (with fallback chain to 2.0 Flash → 2.0 Flash Lite)
- **NPI Lookup:** NPPES Government Registry API (free, no key needed)
- **Deployment:** Vercel

---

## The design

So the design is something I spent a lot of time on. Most legal or insurance tools feel cold and clinical. I went with a warm parchment and muted gold palette so that it feels like a premium private law firm, not a random AI wrapper. Cormorant Garamond for headlines gives it that legal authority feel, and DM Mono for the UI text gives it precision.

The page transitions use a full-screen ink wipe — a dark overlay sweeps down and retracts on every navigation. It takes 650ms and fires at the midpoint so there's never a flash of unstyled content.

---

## Setting it up locally

To get this running, we need to do three things here: cloning the repo, adding your Gemini API key, and then starting the dev server.

```bash
git clone https://github.com/Ch-Suharsha/V.O.I.D.git
cd V.O.I.D
cp .env.example .env.local
npm install
npm run dev
```

Then open `.env.local` and add your Gemini API key from [aistudio.google.com](https://aistudio.google.com).

```
GEMINI_API_KEY=your_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

That's it. The app will be running at `localhost:3000`.

---

## Environment Variables

| Variable | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) — free tier available |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL or `http://localhost:3000` for local dev |

---

## Project structure

```
app/
  page.tsx                  ← Upload screen
  processing/page.tsx       ← Processing animation
  findings/page.tsx         ← Findings + appeal strength
  letter/page.tsx           ← Generated letter + download
  api/
    analyze/route.ts        ← PDF parsing + Gemini extraction
    npi/route.ts            ← NPPES government registry lookup
    letter/route.ts         ← ERISA letter generation
components/
  Nav.tsx
  WipeTransition.tsx
  StepDots.tsx
lib/
  types.ts                  ← All TypeScript interfaces
  constants.ts              ← No magic strings
  npiLookup.ts              ← Direct NPPES API calls
  geminiWithFallback.ts     ← Model fallback chain
  hooks/
    useWipe.ts              ← Page transition hook
```

---

## A few things I learned building this

I thought this would be easier and could be done in a day but it took the whole weekend. The processing screen had a race condition in the step animation — the async/await loop was trapping React state closures so the sequence would stall after step 1. Fixed it by rewriting it as a state machine where each step's completion triggers the next one.

The NPI lookup was also tricky at first because I was calling the NPPES API through an internal Next.js route, and serverless functions can't reliably call themselves via HTTP. So I moved the lookup logic into a shared `lib/npiLookup.ts` file and call it directly from the analyze route — much cleaner.

The Gemini API rate limits on the free tier are pretty tight (20 requests per day on 2.5 Flash). I added a fallback chain so that when the primary model hits its quota it automatically tries the next one without the user ever seeing an error.

---

## What's next

From my experience, the biggest thing missing right now is a way to handle cases where the NPI lookup doesn't find a mismatch — the letter still needs to be strong even without that ground. I want to add more ERISA-specific language for different denial codes so that the letter is more targeted based on the actual reason for denial.

Also thinking about adding a way to upload the Evidence of Coverage so that the policy contradiction finding is more specific rather than a generic reference to Section 4-6.

---

And that's the whole thing. Hoping you guys find it useful, feel free to reach out if you have any questions or want to build on top of it.
