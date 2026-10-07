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
- Explicit correct/incorrect feedback with red incorrect states, live practice accuracy, submitted-count progress bar, configurable practice target, and a three-second cancelable auto-advance after successful recording.
- Local attempts, confidence, saved diagrams, chapter mastery, next-study queue, missed/weak practice, export/import, and intentional reset. Corrupt or unsupported data preserves the original and pauses writes until recovery.
- Adjustable mock midterm with all four formats. Solutions stay hidden until final submission. Objective scores and all responses are saved together; written scores can be recorded from the final review or reopened under Progress.

## Data and scope

Course content lives in `src/content/*.json`, validated with Zod and cross-reference checks. `docs/exam-blueprint.md` controls scope; `docs/source-map.md` defines citations. Course facts stay outside UI components. Examples and questions are labeled `SOURCE_DERIVED`; they are app-authored practice, not the professor's exam questions. Priorities, difficulty, score thresholds, and mock counts are study aids, not professor-assigned weights or predictions.

Mastery averages the last ten scores per chapter. Strong requires three or more attempts and at least 80%; Developing starts at 50%; otherwise Weak. Unpracticed chapters are shown separately. Queue rank combines chapter priority, low mastery, capped repeated misses, recency, and confidence. A case can record one topic attempt for each chapter it covers. Session accuracy counts each item once: mean normalized score over scored items only; written items stay pending until a 0–3 self-check is recorded. Select-all scoring requires every correct choice and no incorrect choices, with no partial credit. The default 70% target is a learner practice setting, not an exam pass prediction.

Storage is versioned browser `localStorage`, with no accounts, analytics, database, or external AI service. Export a backup before clearing browser data. Import replaces progress after confirmation and validation. Practice and unfinished mock sessions persist, including mock diagram drafts. Standalone diagram practice still requires the Save diagram button to preserve edits. Storage v0/v1 migrates to v2; the original legacy data is copied to a separate local backup on the first successful write. Solutions are hidden by the interface, not protected from someone inspecting the bundled JSON.

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

All seven MVP milestones and the October 6 priorities 1–3 plus required confidence/acronym expansions are implemented. Tooltips, Towson colors, precise textbook links, diagram arrowheads, and correct-diagram comparison are also delivered. The execution record in `docs/implementation-plan.md` lists final verification and the deferred refactoring boundary. Accounts/cloud sync, improvement trends, AI evaluation/editorial review, verified online quiz integration, additional diagram exercises, and the bounded cheat sheet remain in the expansion plan. Structural refactoring remains paused.

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
