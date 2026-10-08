# Study Studio

A personal, source-linked midterm study app for Fall 2026 AIT 624 / COSC 612. Covers the six chapters and 22 topic rows in the supplied review.

## Run locally

Requires Node.js 20.9 or newer and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. For the production app, including offline caching:

```sh
npm run build
npm start
```

The production server is currently the recommended mode for studying. Keep the app open online until its service worker finishes caching the routes. Study/practice navigation then works offline. PDF sources are cached individually when opened online. Development mode does not install the offline worker.

## Features

- Exam blueprint and searchable study guide: six chapters, 22 source-derived concepts, KNOW / UNDERSTAND / APPLY objectives, priorities, review formats, and lecture PDF page links.
- 100 multiple-choice questions (80 single-answer and 20 select-all) and 22 short-answer questions, plus three multi-concept cases. Answers are revealed after submission; written answers use checklist feedback and explicit 0–3 self-assessment.
- [Towson black/gold palette](https://www.towson.edu/brand/visual-guidelines/color.html) throughout the UI, with accessible contextual help for scoring, confidence, progress, saving, sources, and diagrams. Help works with hover, keyboard, and touch.
- Precise textbook section/page/index links for every topic row and practice item. The local tenth Global Edition has 29 verified reading mappings, with printed and PDF page numbers shown separately.
- Two React Flow exercises: context model and use-case diagram. Add, move, rename, delete, connect, label, reset, and save; keyboard-accessible forms supplement the canvas. Grading uses authored semantic criteria rather than layout. After submission, compare the learner and correct diagrams with highlighted differences. Include/extend use open arrows; generalization uses a hollow triangle; undirected associations remain undirected. Mock solutions remain hidden until final submission.
- Fixed, saved study sessions with reload recovery for question order, selected answers, written/case drafts, mock diagram drafts, confidence, self-check checklists, and question position. Resume or review sessions from Progress.
- Required pre-answer confidence starts unselected for every question and diagram; submitted confidence is locked. Explanatory notes and expanded acronyms (including XP / Extreme Programming) appear in course content, with a glossary in the guide.
- Correct, partially correct, and incorrect feedback; earned-point practice scores and separate exact-answer MCQ accuracy. New sessions default to partial credit, with exact scoring available. Ordinary practice retains a three-second cancelable auto-advance.
- New sample exams advance immediately after a saved answer in every format, with countdown/manual alternatives. Final submission stays explicit and reveals scores/solutions.
- Interactive sequence-versus-use-case lesson at `/study/diagrams`: sourced ATM withdrawal walkthrough with three alternative outcomes, airline actors/goals/relationships, original class-solution images/PDFs, accessible text, zoom, and comprehension checks. The airline redraw explains its include-direction differences from the instructor image.
- One-page cheat sheet at `/cheat-sheet`: editable/reorderable text, headings and bullets; fixed 14-point type, actual rendered-space enforcement, persistent drafts, backup, and Letter-size Print / Save as PDF. Saved mistakes offer editable source-linked reminders; repeated concepts update existing notes and dismissal persists.
- Learning trends in Progress: first-try exact MCQ accuracy, daily comparable-score trends, objective versus self-score breakdowns, matched repeat recovery, chapter gaps, and confidence calibration with high-confidence errors. Filters and sample counts explain comparison limits.
- Local attempts, confidence, saved diagrams, chapter mastery, next-study queue, missed/weak practice, export/import, and intentional reset. Corrupt or unsupported data preserves the original and pauses writes until recovery.
- Adjustable mock midterm with all four formats. Solutions stay hidden until final submission. Objective scores and all responses are saved together; written scores can be recorded from the final review or reopened under Progress.

## Data and scope

Course content lives in `src/content/*.json`, validated with Zod and cross-reference checks. `docs/exam-blueprint.md` controls scope; `docs/source-map.md` defines citations. Course facts stay outside UI components. Examples and questions are labeled `SOURCE_DERIVED`; they are app-authored practice, not the professor's exam questions. Priorities, difficulty, score thresholds, and mock counts are study aids, not professor-assigned weights or predictions.

Mastery averages the last ten scores per chapter. Strong requires three or more attempts and at least 80%; Developing starts at 50%; otherwise Weak. Unpracticed chapters are shown separately. Queue rank combines chapter priority, low mastery, capped repeated misses, recency, and confidence. A case can record one topic attempt for each chapter it covers. Session practice score counts each item once: mean earned points over scored items only; written items stay pending until a 0–3 self-check is recorded. New sessions use select-all partial credit: `max(0, correct selections / total correct options - incorrect selections / total incorrect options)`. Selecting every option earns zero; an exact match earns full credit. Single-answer fractional credit requires an authored rationale; the revised post-delivery engineering question has one reviewed half-credit choice. Exact-answer accuracy remains separate from earned points. Scoring mode is chosen for a new session and is fixed for that session; older sessions/results retain exact scoring. The default 70% target is a learner practice setting, not an exam pass prediction.

Storage is versioned browser `localStorage`, with no accounts, external analytics, database, or external AI service. Export a backup before clearing browser data. Import replaces progress after confirmation and validation. Practice and unfinished mock sessions persist, including mock diagram drafts. Standalone diagram practice still requires the Save diagram button to preserve edits. Storage v0/v1/v2/v3 migrates to v4, including the reference sheet and suggestion decisions. Older sessions retain exact scoring and countdown navigation, preserving their scores and snapshots. Original data is backed up before the first v4 write; earlier migration backups are retained. Solutions are hidden by the interface, not protected from someone inspecting the bundled JSON.

## Cheat-sheet printing and trends

Print saved notes with **Letter paper, portrait, 100% scale, and browser headers/footers disabled**. The app checks actual wrapped content using the same fixed font and layout as the preview; overflow is rejected while your proposed text stays editable. The self-hosted, unmodified Geist font is distributed with its OFL license in `public/fonts`. If the font fails to load, capacity-dependent saving and printing wait for recovery. Offline caching includes the font and editor.

Trends count each submitted response once, including multi-topic cases. Pending written evaluations count toward volume but not scored averages. Unfinished mocks contribute nothing until final submission. First-try accuracy uses the first saved submission per item/content version across all history, even when filters change. Trend cohorts keep format, content version, evaluation method, MCQ scoring policy/version, difficulty, and practice/mock mode separate. Objective points and self-assessments have separate denominators. Matched recovery requires the same item/version and scoring conditions; a numeric improvement claim requires at least three comparable items. Older records with unknown versions stay in distinct cohorts, and identical legacy case rows within the same second are grouped. Dates use this browser's time zone. These are study observations, not an exam prediction.

## Verify

```sh
npm run validate
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Browser tests use a separately running production server at port 3000. By default they use installed Google Chrome on macOS; set `PLAYWRIGHT_CHROME_PATH` for a different executable. Without installed Chrome, run `npx playwright install chromium` and set `PLAYWRIGHT_USE_BUNDLED=1`.

## Handoff

All seven MVP milestones and the October 6 priorities 1–3 plus required confidence/acronym expansions are implemented. Tooltips, Towson colors, precise textbook links, diagram arrowheads, and correct-diagram comparison are also delivered. The execution record in `docs/implementation-plan.md` lists final verification and the deferred refactoring boundary. Accounts/cloud sync, AI evaluation/editorial review, verified online quiz integration, and additional diagram exercises remain in the expansion plan. Structural refactoring remains paused.

October 8 features F24–F26 are implemented: partial-credit MCQs, immediate sample-exam advancement, and ATM/airline diagram teaching. See [the detailed requirements](docs/scoring-and-diagram-teaching-plan.md) and [feature inventory](docs/feature-expansion-plan.md). Older sessions keep their original scoring/navigation settings. Recommendation items 4 and 5 are also implemented: the bounded cheat sheet with mistake-based suggestions (F22–F23), and improvement trends with confidence calibration (F03). These changes are local source changes; deployment is a separate release action.

## Deployment

The live app is available at https://towson-study-studio-billy-mitchells-projects.vercel.app without Vercel sign-in. A GitHub link appears in the footer on every page.

The code is maintained in the public [GitHub repository](https://github.com/billymitchell/towson-study-studio). Vercel builds this Next.js app with `npm ci` and `npm run build`, configured in `vercel.json`.

To release with the Vercel CLI after signing in:

```sh
vercel link --yes --team billy-mitchells-projects --project towson-study-studio
vercel project inspect --non-interactive
vercel deploy --prod --skip-domain
vercel inspect <deployment-url>
vercel curl / --deployment <deployment-url>
vercel promote <deployment-url>
```

Local Vercel account/project metadata and environment files are ignored. Only runtime course PDFs in `public/sources` are shipped; original duplicate files at the repository root are excluded. Study progress remains in each browser's local storage; deploying does not add cloud synchronization.
