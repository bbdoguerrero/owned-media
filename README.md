# Owned Media Audit

A BBDO Guerrero audit tool that helps brands find more value in assets they already own. Answer three video-led questions to get a visual opportunity map and a focused first test.

Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and the Google Gen AI SDK. The interface uses a black, red, and white palette, the BBDO Guerrero logo, and a locally hosted Special Gothic Expanded font.

## Run locally

Use Node.js 20.9 or later and npm.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For live Gemini results, create `.env.local` from `.env.example` if you do not already have one. Keep an existing configuration intact.

```dotenv
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.5-flash
```

`GEMINI_MODEL` is optional; the default is `gemini-2.5-flash`. Restart the development server after changing environment variables. The API key stays on the server and must not use a `NEXT_PUBLIC_` prefix. Local environment files are ignored by Git.

The demo works without a key. If the key is missing or API generation fails, the live flow returns a heuristic fallback report.

## User flow

1. **Profile:** enter name, work email, company, position, and industry. All five fields are required for a live audit.
2. **Three questions:** describe the business challenge, existing assets, and the customer moment to improve. Each question has a full-width video and a free-text answer. Videos start with sound enabled; play/pause and mute/unmute controls are available. A browser that blocks audible autoplay requires a click to play.
3. **While you wait:** optionally select Underused, Split across teams, Mostly functional, or Ready to grow, and add thoughts in a textarea.
4. **Results:** explore the asset matrix, compare asset families, review the recommended first move, and save or print the report.

Answers and profile entries stay in memory while navigating the flow. Reloading the page clears them. “Start again” returns to the profile and preserves entries for editing.

## Demo mode

Select **View demo report** on the initial page. No form completion or API request is needed.

The demo opens a prefilled Globe example with 15 assets across all four matrix quadrants. It uses the same report layout and content rules as live results and is labeled as illustrative, not a live Globe audit. **Start my audit** returns to the initial form without replacing the user's entries with demo data.

## Gemini integration

```text
Browser → POST /api/generate-insights → Google Gemini API → standardized report
```

The server sends the profile fields, three answers, and any submitted waiting-page thoughts to Gemini. It requests structured JSON, applies the shared report rules, and returns the result to the browser.

An initial report is generated on the waiting page. If the user adds a perspective or thoughts, selecting **View report** generates an updated report using that input. Typing does not send a request on every edit.

The route tries the configured model, then its built-in fallback model list. If all attempts fail, it generates a heuristic report. Report source values are `gemini`, `heuristic-fallback`, or `demo`.

The app has no database or email-delivery integration. Profile details and answers are not saved by the application; live generation sends them to Google for processing.

## Report standard

Every report uses the same section order, labels, diagram styles, and scales. The client's answers determine the assets, scores, diagnosis, and recommendations.

| Section | Standard |
| --- | --- |
| Asset opportunities | Full-width potential × readiness matrix at the top, with up to 16 named assets. Selecting an asset shows its next step and scores. |
| Business focus | One diagnosis and one short summary of the client's challenge. |
| Asset families | Recognition, Data, Story & Content, and Physical, in that order. Current use and potential share a 0–100 scale; one family is highlighted. |
| First move | Potential and readiness scores on a 1–5 scale, with three supporting dimensions each. Details are collapsed by default. |
| Customer moment | One touchpoint, its current experience, and the desired next step. |
| First test | One audience, one touchpoint, one change, plus a measure, owner, and guardrail. |
| This week | One immediate action. |

All four matrix quadrants remain visible, including those with no mapped assets. A score of 3 or above is high; a score below 3 is low.

| Potential | Readiness | Quadrant |
| --- | --- | --- |
| High | Low | Find the unlock |
| High | High | Pilot now |
| Low | Low | Park & monitor |
| Low | High | Supporting role |

Content limits keep the layout consistent:

- Diagnosis: 6 words; summary: 20 words.
- Asset names: 5 words; score notes: 6 words.
- Other report fields: 12 words.

The shared normalizer caps text and score ranges, keeps family order stable, removes duplicate matrix assets, and derives quadrants from scores. Scores and percentages are directional estimates, not measured business performance. Heuristic reports use starting assumptions that need validation.

## Project structure

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Profile state, question definitions, navigation, demo entry, and menu logo. |
| `app/api/generate-insights/route.ts` | Gemini prompt, model attempts, and heuristic fallback. |
| `app/types/audit.ts` | Profile, answers, asset scores, and report types. |
| `app/data/demo-audit.ts` | Prefilled Globe profile and example report. |
| `components/IntroSlide.tsx` | Initial profile form and demo button. |
| `components/QuestionSlide.tsx` | Video controls, answer input, and validation. |
| `components/ProcessingSlide.tsx` | Generation status and optional waiting-page input. |
| `components/FinalBentoSlide.tsx` | Shared report layout and print action. |
| `components/graphs/` | Asset matrix, family bars, and opportunity score summary. |
| `lib/report-standard.ts` | Report normalization and text limits. |
| `lib/audit-matrix.ts` | Quadrant rules and matrix validation. |
| `app/globals.css` | Shared styling, responsive matrix, and print rules. |
| `public/` | Local logo, font, and question videos. |

## Checks and production

```bash
npm run lint
npx tsc --noEmit
npm run build
npm start
```

For deployment, configure `GEMINI_API_KEY` and optionally `GEMINI_MODEL` in the hosting environment. Local environment files are not included automatically. The application needs a server runtime for its POST route.

## Working on this project

Read `AGENTS.md` and the relevant guides in `node_modules/next/dist/docs/` before changing Next.js code. This project uses version-specific APIs and a Turbopack configuration for Tailwind CSS.

Keep the report layout and chart conventions shared between demo, Gemini, and fallback results. When changing the report contract, update its types, prompt, normalizer, fallback, demo data, and this README together.
