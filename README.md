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

The demo works without a key. Live reports require a successful Gemini response; missing keys or API failures show an error rather than substituting sample results.

## User flow

1. **Profile:** enter name, work email, company, position, and industry. All five fields are required for a live audit.
2. **Three questions:** describe the business challenge, existing assets, and the customer moment to improve. Each question has a full-width video and a free-text answer. Videos start with sound enabled; play/pause and mute/unmute controls are available. A browser that blocks audible autoplay requires a click to play.
3. **Results:** submitting the third answer shows a full-screen spinner labeled “Generating your report.” The completed report appears automatically, with no waiting-page questions or extra continue button. Explore the asset matrix, compare asset families, review the recommended first move, and save or print the report.

Answers and profile entries stay in memory while navigating the flow. Reloading the page clears them. “Start again” returns to the profile and preserves entries for editing.

## Demo mode

Select **View demo report** on the initial page. No form completion or API request is needed.

The demo opens a prefilled Globe example focused on benefit discovery after a top-up, with 15 assets across all four matrix quadrants. The fictional three-answer brief lives in `app/data/demo-audit.ts`. The diagnosis, asset bars, radar profile, readiness scale and SMS comparison test follow that same objective. All demo ratings remain explicitly illustrative.

The demo uses the same report layout and content rules as live results and is labeled as illustrative, not a live Globe audit. Its service-link review remains a gate before testing. **Start my audit** returns to the initial form without replacing the user's entries with demo data.

## Gemini integration

```text
Browser → POST /api/generate-insights → Google Gemini API → standardized report
```

The server sends the profile fields and three answers to Gemini. It requests structured JSON, applies the shared report rules, and returns the result to the browser.

The final question's **Build my report** button starts generation once. The results view displays a loading state until the report arrives. If the request fails, the user can retry or return to edit their answers.

The route tries the configured model, then its alternate model list. If all attempts fail, it returns an error so the user can retry. Report source values are `gemini` or `demo`; there is no heuristic or mock-data fallback for live results.

### Grounding in client answers

Live generation applies the initial-assessment framework in `ownedmedia.pdf` (pages 2–5), summarized in `lib/audit-framework.ts`, to the three submitted answers. It interprets the business tension from Q1, inventories assets from Q2, and maps the audience moment from Q3. Working interpretations and proposed tests may synthesize or paraphrase these answers; an exact quotation is not required for the assessment to appear. Optional quotes are checked before display, and `answerRefs` links analysis to Q1/Q2/Q3.

The report charts working 1–5 assessments, not invented utilization percentages: 1 weak, 3 mixed/conditional, 5 strong. Asset bars use the existing potential/readiness ratings. The radar and Likert scale use the framework's six dimensions, with whole-point dimension ratings. Unknowns are never plotted as zero: their cells remain unselected, bars remain unfilled, and radar vertices/segments are omitted. Live matrix placement remains relative to this client's objective.

Recommendations are proposed actions, not claims about existing operations. Missing owners, permissions and other operational facts become focused confirmation questions rather than erasing the business assessment. Safeguards are stop/resolve gates before activation. Demo data is isolated in `app/data/demo-audit.ts` and is used only through the explicit demo action. An API response without a substantive business-tension overview and proposed test is rejected and retried using the alternate model list.

The app has no database or email-delivery integration. Profile details and answers are not saved by the application; live generation sends them to Google for processing.

## Report standard

Every report uses the same visual layout and scales. The client's three free-text answers remain the inputs; their assessment is presented through charts, with one short explanatory sentence per chart and per readiness scale. Live score explanations and the radar recommendation come from Gemini; the UI does not infer explanations from score thresholds. Missing explanations are shown as unconfirmed. Labels and pilot steps are brief phrases; long narratives and sample-answer panels are omitted.

| Section | Standard |
| --- | --- |
| Business focus | A short diagnosis and one sentence framing the business objective. |
| Opportunity map | Up to 16 assets on the full-width matrix, or a compact list when readiness is unknown; the selected asset has one next-step caption. |
| Where to focus | Paired potential/readiness bars for the six highest-potential assets, on a 1–5 scale. |
| Opportunity profile | Six-axis radar showing audience contact, brand fit, audience utility, access/ownership, rights/safeguards and delivery/learning. Unknown axes create gaps. |
| Before you test | Five-point Likert-style scales for the three readiness dimensions, each with one sentence from Gemini explaining its rating using the client's answers. |
| One small test | A numbered audience → touchpoint → change diagram, owner label and one combined measurement/safeguard sentence. |

All four matrix quadrants remain visible, including those with no mapped assets. Classification is a working relative assessment, not a validated benchmark or a universal cutoff. Unverified readiness is not classified as low.

| Potential | Readiness | Quadrant |
| --- | --- | --- |
| High | Low | Find the unlock |
| High | High | Pilot now |
| Low | Low | Park & monitor |
| Low | High | Supporting role |

Content limits keep the layout consistent:

- Diagnosis: 8 words; summary and opportunity hypothesis: 36 words each.
- Asset names: 5 words; score notes: one sentence, up to 24 words.
- Asset-family explanations: one sentence, up to 28 words, grounded in the client's answers or explicitly conditional when current use is unknown.
- Other report fields: 12 words.

`lib/report-visuals.ts` limits displayed captions to one sentence and provides shared rating/label helpers. Visual captions do not add metrics or turn unknowns into scores.

The shared normalizer caps text and score ranges, checks optional quotes, keeps family order stable, anchors candidate names to the supplied inventory, and withholds placement when a score is unknown. It preserves paraphrased analysis and proposed tests. Demo numbers are illustrative and never substituted into live reports.

## Project structure

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Profile state, question definitions, navigation, demo entry, and menu logo. |
| `app/api/generate-insights/route.ts` | Answer-grounded Gemini prompt and model attempts; errors never substitute a sample report. |
| `app/types/audit.ts` | Profile, answers, asset scores, and report types. |
| `app/data/demo-audit.ts` | Prefilled Globe profile and example report. |
| `components/IntroSlide.tsx` | Initial profile form and demo button. |
| `components/QuestionSlide.tsx` | Video controls, answer input, and validation. |
| `components/ReportLoading.tsx` | Results loading state, retry action, and return to answers on error. |
| `components/FinalBentoSlide.tsx` | Shared report layout and print action. |
| `components/graphs/` | Opportunity matrix, asset-rating bars, six-axis radar and five-point readiness scales. |
| `lib/report-visuals.ts` | Single-sentence captions, compact labels and safe rating helpers. |
| `lib/report-standard.ts` | Report normalization and text limits. |
| `lib/audit-framework.ts` | Initial-assessment guidance drawn from the PDF's five-step scan, rating guide, and opportunity card. |
| `lib/empty-audit.ts` | Unknown-value defaults with no preset scores or fictional client facts. |
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

Keep the report layout and chart conventions shared between demo and Gemini results. When changing the report contract, update its types, prompt, normalizer, unknown-value defaults, demo data, and this README together.
