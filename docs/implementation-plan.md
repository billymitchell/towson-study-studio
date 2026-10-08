# Study App Implementation Plan

Feature expansion requested October 6, 2026 is planned in [feature-expansion-plan.md](feature-expansion-plan.md), with impact labels, per-feature token estimates, confirmed synced-account and required-confidence behavior, and phased acceptance criteria. Priorities 1–3 plus required confidence and acronym expansion are now implemented; see the October 6 update below. The five UI/diagram/textbook features below are also delivered; remaining expansion features are planned. The original MVP completion record remains intact.

## October 8 reference sheet and learning trends

The user authorized recommendation items **4 and 5**; delivered feature rows **F22–F23 and F03**.

- `/cheat-sheet` provides personal/source-based text, headings and bullets, editing/reordering/deleting, persistent drafts, source/response metadata, and a scaled or actual-size preview. Portrait Letter, 14-point Geist, 20-point line spacing, half-inch margins, and block spacing are fixed. Actual rendered wrapping and height enforce capacity; overflow or failed writes preserve saved notes and editable proposed text. Font failure blocks capacity-dependent saves/print. Print uses saved notes only, with Letter/100%/no-header-footer instructions.
- Saved, revealed scores strictly below 2/3 offer source-linked correct-concept reminders from authored explanations, models, or missed diagram criteria. Pending written evaluations and unfinished mocks reveal none. Repeated concept misses offer an update to the existing user-controlled note, not a duplicate; added/dismissed decisions persist per response. Qualifying suggestions hold ordinary-practice advancement, and opening/editing/dismissing persists a pause. No note is inserted or removed automatically.
- Progress now shows first-try exact MCQ accuracy, objective and self-score averages separately, daily comparable-score charts/tables, volume/pending counts, chapter gaps, matched repeat recovery, recurring low scores, and confidence calibration/high-confidence errors. History counts each response once, including multi-topic cases. First tries are assigned before filters. Cohorts separate format, content/scoring versions, method, difficulty, and practice/mock mode; numerical improvement requires at least three matched items. Legacy grouping, unknown versions, browser-local dates, and sample limitations are explained.
- Storage v4 migrates v0–v3 while preserving all prior results and settings, retains pre-v4 and earlier migration backups, and includes notes/drafts/decisions in export/import. Import validates actual sheet fit before replacement. Stable new response IDs prevent topic-row duplication. Service-worker cache v5 includes the sheet route and fixed font; the unmodified bundled Geist font has its OFL license alongside it. No dependency, account, runtime AI, database, or deployment was added. Structural refactoring remains deferred.

Verification: content/source validation, strict typecheck, **56 domain tests**, production build with **11 app routes**, and **41 browser tests** passed. New acceptance coverage includes rendered overflow and long words, retained drafts and failed saves, note CRUD/order, migration and backup restore, font failure/recovery, strict suggestion thresholds and final-only mock reveal, deduplication/dismissal/auto-advance, canonical trends and filters, accessibility, mobile and offline use. Short and nearly full browser-generated PDFs were inspected with PDFKit: each is one 612 × 792-point Letter page, with 14-point text and no clipping. Engineering-agent token usage was not metered.

## October 8 scoring, sample-exam navigation, and diagram teaching

The user authorized implementing recommendation items 1, 2, and 3; delivered feature rows **F24–F26**.

- New study sessions default to partial-credit MCQs. Select-all points reward correct selections and deduct incorrect selections using the documented normalized formula; selecting everything earns zero. Exact scoring is selectable for new sessions and remains the default for migrated sessions. One version-2 single-answer question has an authored, source-reviewed 50% choice; other unannotated distractors earn zero. Feedback labels partial understanding explicitly and shows its rationale.
- Practice score reports earned points separately from exact-answer MCQ accuracy. Session snapshots and generated attempts retain scoring policy/version and exact correctness. Storage v3 migrates v0/v1/v2 without revising historical scores, backs up original pre-v3 data on the first successful write, retains prior backups, and includes the fields in export/import.
- New sample exams advance immediately after successfully submitting any format. Answer and next position save together; failed saves keep the question/draft, duplicate submissions cannot skip items, and keyboard focus follows the next prompt, including the lazily loaded diagram editor. Manual/countdown settings remain available. The last answer still requires explicit final exam submission before points, explanations, and solutions appear.
- Added `/study/diagrams`, linked from the study guide, modeling/use-case topics, and diagram workspace. Validated JSON supplies the ATM message sequence and approved/rejected/blocked alternatives, all four airline actors and requested goals/relationships, guided highlighting, accessible text equivalents, enlargement, and six unscored comprehension checks. Original instructor images and PDFs are preserved. The annotated airline redraw explains the two handwritten include-direction differences from the requested model. Sequence teaching stays supplementary to the confirmed exam blueprint.
- Service-worker cache v4 includes the new lesson route and caches opened lesson images/activity PDFs for offline use. No new dependencies, accounts, provider calls, or deployment were introduced. Structural refactoring remains deferred.

Verification: content/source validation, strict typecheck, **45 domain tests**, production build with **10 app routes**, and **32 browser tests** passed. Browser checks cover fractional single/select-all credit, exact accuracy, migration/backups, atomic immediate navigation in all formats, failed writes, final-only mock reveal, accessible lesson controls/diagrams, desktop/mobile layouts, and offline lesson/source access. Desktop/mobile screenshots were inspected; final label/arrow refinements received focused browser checks. Engineering token usage was not metered.

## October 6 implementation update

Authorized scope: priority 1 save/resume and progress; priority 2 MCQ-first content and select-all; priority 3 feedback, active accuracy, and safe auto-advance; plus required confidence and acronym expansions. These priorities are distinct from the full plan’s numbered phases.

- Storage v2 preserves existing attempts/diagrams/completed mocks, migrates v0/v1, retains a pre-v2 backup, and stores versioned finite session snapshots with fixed question/choice order, position, drafts, confidence, submitted responses, self-check selections, and settings. Saves are synchronous; feedback and advancing require a successful save. Deterministic attempt IDs prevent duplicate submissions. Completed and active sessions reopen through Progress.
- Original bank expanded from 17 to **100 multiple-choice questions**: 80 single-answer and 20 select-all, covering every blueprint row. Select-all keys vary between two and three correct options. Choice IDs, original lecture/review references, explanations for every option, and content versions are validated. Existing 22 written questions, three cases, and two diagrams remain. No external question bank was imported.
- Live header shows question position, submitted fraction/progress, scored/pending item counts, normalized practice accuracy, and a configurable default 70% practice target. Pending self-checks are excluded from accuracy; multi-topic cases count once per session. Mock accuracy/feedback appears only after explicit final submission.
- Feedback says Correct/Incorrect, with red incorrect treatment and per-option missed/incorrect selection labels. Three-second auto-advance has Stay and review / Next now controls, can be disabled, pauses on review focus or a hidden tab, and cannot advance after failed saves.
- Confidence starts unset and is required before submitting every question or diagram. Submitted confidence is immutable and never modifies scores. Inline notes explain its effect on review priority. Acronyms are expanded in authored content and a guide glossary.
- Practice sessions default to 20 items or the available filtered count. Chapter, queue, style, and length configure a new session without mutating the current queue. The default mock has 16 choice questions, two short answers, one case, and one diagram; mix is configurable.

Final validation passed: strict typecheck, content validation (122 questions), **29 domain tests**, production build (all nine app routes), and **21 browser acceptance tests**. Browser coverage includes migration, fixed missed queues, storage failure/recovery, confidence gating, exact-set feedback, persisted drafts/settings, mock reveal/diagram capture, accessibility, mobile, and offline practice. Screenshots are under `test-results/` (generated artifacts).

Engineering tokens were not metered for this turn; estimates in the expansion plan remain estimates. Runtime AI token spend is zero because this change adds no provider calls. Accounts/sync, historical improvement statistics, AI evaluation, textbook locators/online quiz import, Towson theme/tooltips, and extra diagram examples remain deferred. Structural refactoring stays paused.

## October 6 UI, diagram, and textbook update

Authorized and delivered: **F07 tooltips, F08 Towson colors, F11 precise textbook links, F20 arrowheads/direction cues, and F21 correct-diagram comparison**.

- Towson palette verified against the [official university color guidance](https://www.towson.edu/brand/visual-guidelines/color.html): gold `#FFBB00`, black `#151500`, graphite `#3C3C3C`, white, Glen Mist `#DDDDDD`, and Old Gold `#CC9900`. UI surfaces, navigation, actions, progress, and diagrams use common tokens. Correct/incorrect status colors remain distinct and include explicit labels.
- Shared help supports hover, keyboard focus, Escape dismissal, click/touch toggling, outside dismissal, and viewport-constrained placement. Notes cover confidence, scoring, progress, local saving, course sources, textbook locators, question types, self-checks, auto-advance, and diagram notation. Essential instructions remain visible; reviewing help pauses active answer auto-advance. Tooltips stay inside the main landmark; reading blocks use appropriate heading levels and grouping.
- Submitted diagrams now show the learner's graph and authored correct graph side by side on wide screens and stacked on small screens. Wrong placement/type, wrong direction/relation/labels, extras, and duplicate connections receive red outlines/text with explicit ✕ notes. Missing items/links appear in the review list. Preview spacing is normalized; saved coordinates and submitted graphs are preserved. Previews fit the available width initially and provide Enlarge / Fit controls for inspecting labels and arrows. Editing starts new work and hides prior comparison without changing recorded attempts. Mock solutions remain hidden until final submission.
- Canvas and previews share relationship notation: dashed include/extend with open arrows; solid generalization with a hollow triangle; filled arrows for explicitly directed context links; no arrow for undirected links. Labels use include/extend stereotypes. Direction hints explain From/To, and a Reverse direction control can correct a saved connection. Marker IDs are unique across every canvas/preview.
- Added **29 verified textbook section/index mappings** covering all 22 blueprint rows, all 122 questions, three cases, and two diagrams. Guide/blueprint/practice/review display edition, chapter/section, printed and PDF page ranges, and index lookup links. Applicable questions receive narrower subsection links. Repaired old broad textbook source URLs while preserving IDs. Book identity is checked by SHA-256 during content validation; lecture scope remains authoritative. See the locator table in `docs/source-map.md`.
- Updated the offline cache version for new assets. Source PDFs are cached when opened/fetched online and remain available offline.

Final verification: **36 domain tests**, **25 browser acceptance tests**, strict typecheck, source/content validation with textbook identity, and production build for all nine routes passed. Browser checks include nine route-level accessibility scans plus tooltip-open and diagram-review scans, desktop/mobile layouts, hover/keyboard/touch help, migration/recovery, mock reveal timing, graph preservation, SVG arrowheads, actual PDF/index URLs, and offline PDF fetching. Desktop/mobile screenshots and the diagram comparison were inspected. Relevant textbook section/index pages were rendered for visual review and checked against extracted text.

No new dependencies, accounts, AI API calls, or deployment were introduced. Structural refactoring and the cheat-sheet feature remain deferred. Implementation-agent token usage was not metered; plan ranges remain estimates.

## Bounded cheat-sheet reference — original planning record

The user requested an editable 8.5 × 11-inch sheet with fixed handwriting-sized text, limited capacity, and suggested reference notes after low-scoring questions. **Originally planned; implemented October 8 as recorded above.** See [cheat-sheet-plan.md](cheat-sheet-plan.md), feature rows F22–F23. Proposed defaults: one portrait side, 14-point font / 20-point line height, half-inch margins; actual rendered overflow is rejected. Suggestions require saved/revealed scores below 2/3 and explicit user choice. HIGH IMPACT; incremental estimate **18–31k engineering tokens**, or **22–38k with contingency**, including additional checks. Structural refactoring remains paused.

## October 8 backlog additions — planning only

Added F24 partial-credit MCQs, F25 immediate sample-exam advancement after a successful question submit, and F26 sequence-versus-use-case teaching with the ATM withdrawal and Airline Support System class-activity solutions. Both one-page PDFs were rendered and visually inspected; the detailed plan records the airline include-arrow differences between the handwritten solution and the requested model. See [scoring-and-diagram-teaching-plan.md](scoring-and-diagram-teaching-plan.md) and the expanded inventory. No app code, runtime content, scoring behavior, or deployment changed. Structural refactoring remains deferred.

## Guardrails

- Execution authorized on October 5, 2026: complete milestones 1–7 as the MVP, then pause before structural refactoring.
- `docs/exam-blueprint.md` defines the exam blueprint; `docs/source-map.md` is the source-of-truth map for content and question references; `docs/app-spec.md` defines UX and data behavior.
- Keep course content in validated JSON, not React components. Every concept/question/case/diagram exercise must retain one or more source IDs.
- Validate milestone behavior with focused checks; require the integrated production build and acceptance suite to pass before marking the MVP complete.

## Execution decisions

- One local Next.js application; no hosting, accounts, database, analytics, or AI dependency.
- Ship all seven milestones together, with focused content/domain tests and browser checks across the integrated flows.
- Use Zod runtime schemas for JSON and stored-data validation, React Flow for the semantic diagram editor, Vitest for domain tests, and Playwright for browser acceptance checks.
- Keep the authored bank finite and source-derived. Represent every one of the 22 blueprint rows. Practice difficulty and the adjustable mock mix are app choices, never professor-assigned weights.
- Persist attempts and diagrams through a versioned local-storage adapter. Corrupt or unsupported data blocks writes until the learner imports a valid backup or explicitly resets it; exporting the raw backup preserves the original but does not unblock writes.
- Refactoring is deferred until MVP acceptance checks pass. Repairs needed to meet acceptance criteria are part of MVP execution.

## Execution status

Milestones 1–7: **complete** on October 5, 2026. **Paused before structural refactoring**, as requested.

| Milestone | Delivered |
|---|---|
| 1. Foundation | Next.js 16 / React / strict TypeScript / Tailwind; responsive shell; Zod-validated JSON, source registry, and hierarchy checks. |
| 2. Blueprint and guide | Six chapters, all 22 blueprint rows and concepts; objectives, priority/format/search filters, definitions, explanations, examples, mistakes, related concepts, and working lecture PDF page links. |
| 3. Recall and written practice | 17 four-option MCQs with distractor explanations; 22 short-answer items; hidden-until-submit feedback; explicit 0–3 self-check, confidence, topic/mixed/weak/missed queues, and empty states. |
| 4. Cases | Three source-derived, multi-concept cases; structured response fields, hidden models, rubrics, common mistakes, related concepts, and relevant visual diagram examples. |
| 5. Diagrams | React Flow context/use-case editors; node and connection operations, keyboard alternatives, save/reset/reload; semantic feedback for missing/extra elements, type, boundary, relation, direction, and label. |
| 6. Progress | Versioned local storage with supported v0 migration, preserved corrupt data and actionable recovery, export/import/reset, mastery, confidence, recency, repeated misses, and ranked next-study queue. |
| 7. Integrated MVP | Adjustable four-format mock, final-only solution reveal, atomic objective-score/session persistence, item-based score summary, written self-checks, and review reopened from Progress. Production offline route/asset caching; local run/help documentation. |

### Final verification

- `npm run validate`: passed; six chapters, 22 subtopics/concepts, 39 questions, three cases, two diagrams.
- `npm run typecheck`: passed with strict TypeScript.
- `npm test`: **17 passed**; citations/hierarchy, MCQ structure, semantic aliases/layout/direction/labels/extras, storage round-trip/migration/corruption, mastery, missed retries, queue ordering, and mock mix.
- `npm run build`: passed; all nine app routes are statically prerendered.
- `npm run test:e2e`: **16 passed**; source PDF resolution; answer reveal; written/case self-scores; both diagram types and save/reload; corruption/export/invalid import/reset; complete mock and persisted review; nine route-level axe scans; desktop/mobile checks; offline navigation and recording.
- `npm audit`: zero vulnerabilities after updating the test runner to the patched version.
- Desktop/mobile screenshots and the use-case workspace visually inspected. No browser page errors in the core study/practice flow.

### MVP operating limits

- Run locally using the commands in `README.md`; no external deployment was requested or performed.
- Progress is browser-local. Export backups before clearing browser data or moving devices. An unfinished mock and unsaved diagram changes remain in memory; completed mock sessions and saved diagrams persist.
- Offline caching runs in production, after the initial successful cache install. Individual source PDFs need to be opened online before they can be read offline.
- The content bank is app-authored and source-derived, not a set of professor-authored exam questions. Written scores require learner self-assessment. Mock counts and averages are illustrative, not exam weights.

### Refactoring boundary — deferred

Do not begin this work without a subsequent instruction:

- Format the compact MVP components and split large practice, diagram, and progress render blocks into smaller components.
- Extract shared input/filter/feedback controls and domain hooks while preserving the passing acceptance suite.
- Refine storage/repository interfaces and lazy-load graph features consistently.
- Extend content depth and practice variants only after source review; do not add exam scope.

The original milestone definitions below remain as the acceptance baseline.

## Milestone 1 — Scaffold the app and typed content foundation

**Goal**

Create the smallest working Next.js application shell and a type-safe, source-linked content foundation.

**Files / components likely needed**

- `package.json`, Next.js/TypeScript/Tailwind configuration, `app/layout.tsx`, `app/page.tsx`, global styles.
- `src/content/types.ts`, `src/content/sources.json`, `src/content/topics.json`.
- `src/content/validate.ts` and focused tests.
- `src/components/AppShell.tsx`, navigation and accessible page landmarks.

**Data structures**

- `Source`, `Topic`, `Subtopic`, and `Concept` types; priorities, question formats, skills, provenance, and `sourceIds`.
- Initial source registry populated from `docs/source-map.md` and top-level course PDFs.

**Dependencies**

- Next.js, React, TypeScript, Tailwind CSS; test runner selected from project setup.
- No database, auth, or AI service.

**Acceptance criteria**

- App starts and builds with strict TypeScript checks.
- Source/topic data loads from JSON and rejects unknown or missing source IDs.
- Navigation and shell work at desktop and mobile widths and are keyboard navigable.
- No course facts are hard-coded in UI components.

## Milestone 2 — Exam blueprint and study guide

**Goal**

Provide a browsable blueprint and a source-cited, hierarchical guide for all mapped topics.

**Files / components likely needed**

- `src/content/subtopics.json`, `src/content/concepts.json`.
- `app/blueprint/page.tsx`, `app/study/page.tsx`, topic/concept detail components.
- `src/lib/contentRepository.ts`, filters for priority and review format.
- Tests for topic hierarchy, objectives, and source links.

**Data structures**

- Complete topic/subtopic/concept records with `KNOW`, `UNDERSTAND`, `APPLY` goals.
- Each concept has definition, explanation, example, common mistake, related concepts, source IDs, and provenance.

**Dependencies**

- Milestone 1 content types, source registry, and shell.

**Acceptance criteria**

- All six exam chapters and every blueprint row are represented.
- A learner can navigate topic → subtopic → concept and see skills, priority, and source citations.
- Search/filtering does not omit source labels or create topics outside the review scope.

## Milestone 3 — Multiple-choice and short-answer practice

**Goal**

Implement source-grounded recall and written-response practice with answer reveal after submission.

**Files / components likely needed**

- `src/content/questions.json`, question/rubric types, question repository.
- `app/practice/multiple-choice/page.tsx`, `app/practice/short-answer/page.tsx`.
- `src/components/MultipleChoiceQuestion.tsx`, `ShortAnswerQuestion.tsx`, `AnswerFeedback.tsx`.
- Unit/component tests for answer reveal, distractors, rubric checklist, and source display.

**Data structures**

- MCQ with exactly four choices, correct option, explanation, per-distractor explanation, topic, difficulty, and source IDs.
- Short-answer question with model answer, expected concepts, scoring rubric, source IDs.
- `Attempt` response including selected option or text, result/score, confidence, and timestamp.

**Dependencies**

- Milestones 1–2. Use reviewed question data; do not require AI.

**Acceptance criteria**

- Answers/models remain hidden until submission.
- Every MCQ has four choices and a correct answer; incorrect choices each have a reason.
- Short answers show model response and an explicit 0–3 self-check rubric after submission; do not claim automatic semantic grading.
- Questions can be launched by topic, mixed, weak, and missed-question filters once progress data is available; unavailable filters show a useful empty state.

## Milestone 4 — Case-study practice

**Goal**

Let the learner apply multiple mapped concepts to course-grounded scenarios.

**Files / components likely needed**

- `src/content/caseStudies.json`, case/rubric validation.
- `app/practice/cases/page.tsx`, `src/components/CaseStudyRunner.tsx`, `CaseStudyFeedback.tsx`.
- Case rendering, structured response fields, and source displays.
- Tests for hidden solutions, completion flow, rubric, and source traceability.

**Data structures**

- Scenario with several prompts, model solution, relevant concepts, rubric, common mistakes, optional linked diagram exercise, and source IDs.
- `Attempt` record per response/overall case score.

**Dependencies**

- Milestones 1–3; reuse the content repository, answer feedback, and attempt shape.

**Acceptance criteria**

- Case questions require applying multiple concepts from the blueprint.
- Model solution and example diagram remain hidden until the learner submits/completes the case.
- Feedback includes rubric, source references, relevant concepts, and common mistakes.
- Difficulty is labeled Basic, Intermediate, Exam-Level, or Challenge without implying professor-assigned levels.

## Milestone 5 — Diagram workspace

**Goal**

Provide editable and savable semantic diagram practice for the assessed context-model and use-case-diagram topics.

**Files / components likely needed**

- `src/content/diagramExercises.json`, diagram-specific TypeScript types.
- `app/practice/diagrams/page.tsx`, `src/components/DiagramEditor.tsx`, `DiagramToolbar.tsx`, `DiagramFeedback.tsx`.
- `src/lib/diagramGrader.ts`, semantic comparison tests, editor interaction tests.

**Data structures**

- Diagram exercise with `diagramType`, required node/edge criteria, accepted alternatives, prompt, and source IDs.
- Saved diagram with typed nodes/edges, exercise ID, source IDs, and update timestamp.

**Dependencies**

- Milestones 1–4; add React Flow (or selected equivalent) only at this milestone.

**Acceptance criteria**

- User can add, move, rename, delete nodes; add/label connections; add context actors/systems or use-case actors as appropriate; reset and save.
- Editor supports only context models and use-case diagrams for the initial exam scope.
- Grading reports missing/extra nodes, wrong/missing connections, direction, and labels against an authored semantic key; layout differences alone do not reduce the score.
- Keyboard-accessible controls and non-canvas feedback expose diagram operations and grading results.

## Milestone 6 — Persistence, mastery, dashboard, and next-study queue

**Goal**

Persist personal study activity and explain what to study next.

**Files / components likely needed**

- `src/lib/storage/adapter.ts`, `localStorageAdapter.ts`, versioned record envelope/migrations.
- `src/lib/mastery.ts`, `src/lib/nextStudy.ts`.
- `app/progress/page.tsx`, `src/components/ProgressDashboard.tsx`, `NextStudyCard.tsx`.
- Tests for persistence, migration/error handling, score aggregation, status, and queue ordering.

**Data structures**

- Persisted `Attempt`, `MasteryRecord` derived from attempts, and `SavedDiagram`.
- Versioned local-storage schema; optional user export/import format.

**Dependencies**

- Milestones 3–5 provide attempt-producing practice modes and saved diagram data.

**Acceptance criteria**

- Attempts and diagrams survive reloads; invalid/unreadable storage produces an explicit recovery message rather than silently resetting.
- Topic scores, repeated misses, confidence, and last-studied time update consistently from attempts.
- Strong / Developing / Weak status and next-study order use blueprint priority, low mastery, repeated errors, and recency.
- Learner can export or intentionally clear personal data before relying on browser-local persistence.

## Milestone 7 — Mock midterm and release hardening

**Goal**

Integrate formats into a mock exam and verify the full MVP without suggesting unprovided exam weights.

**Files / components likely needed**

- `app/mock-midterm/page.tsx`, `src/components/MockExamRunner.tsx`, summary/review view.
- `src/lib/mockExam.ts` for a transparent, adjustable practice mix.
- End-to-end tests, accessibility checks, content completeness checks, and user-facing help/source notes.

**Data structures**

- Mock session referencing existing source-linked question, case, and diagram exercise IDs.
- Session responses and final summary stored through the attempt adapter.

**Dependencies**

- Milestones 1–6.

**Acceptance criteria**

- Mock sessions can contain MCQ, short answer, case-study, and in-scope diagram work.
- The app labels the format mix as a practice configuration, not professor-provided weighting.
- Review shows submitted responses, explanations/rubrics, and source references; no solution is exposed early.
- All MVP paths pass focused tests, accessibility smoke checks, strict type-check, and production build.
