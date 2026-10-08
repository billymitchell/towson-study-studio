# Personal Midterm Study App — Product Specification

## Implemented scoring, navigation, and diagram lesson — October 8, 2026

- New sessions default to partial-credit MCQs; exact scoring remains selectable for new sessions. Select-all points are `max(0, correctlySelected / totalCorrect - incorrectlySelected / totalIncorrect)`. Single-answer fractional credit requires a validated, authored choice weight and rationale. Confidence never changes points.
- Persist scoring policy/version and exact correctness independently from earned points. Show practice score plus separate exact-answer MCQ accuracy. Historical scores and session snapshots retain their original policy. Storage v3 migrates v0/v1/v2 and backs up pre-v3 data on first successful write.
- New sample exams submit and navigate immediately in one saved operation across all four formats. Allow countdown/manual alternatives. Failed writes retain the question/draft; repeated submits do not skip items. The last response requires explicit Finish mock before any scores or solutions appear.
- The study guide and diagram workspace link to `/study/diagrams`: a source-backed ATM sequence walkthrough and Airline Support System use-case example, with guided highlighting, alternatives, accessible text, zoom, original images/PDFs, and six unscored lesson checks. Explain the handwritten include-arrow differences from the requested redraw. Sequence teaching is supplementary; it does not change confirmed midterm scope or add a sequence editor/grader.

## Implemented session update — October 6, 2026 (historical baseline)

- Finite sessions hold frozen item/choice snapshots, index, per-item drafts, explicit pre-answer confidence, immutable submissions, self-check selections, status, revision/timestamps, and settings in storage v2. Existing v0/v1 attempts, diagrams, and completed mocks migrate intact. Active practice and mock sessions resume on reload and from Progress links.
- The bank has 80 single-answer and 20 select-all MCQs. Select-all has two or three correct options and requires an exact set, without partial credit. Option IDs persist independently of display order; legacy numeric answers remain supported.
- Require unset-to-explicit Low/Medium/High confidence before every submission, including diagrams. Confidence influences review ranking but never correctness or percentage. Lock it at submission. Expand acronyms in learner-facing content and expose a glossary.
- Show question position, submitted count/progress bar, scored/pending counts, and practice accuracy as the mean normalized item score over evaluated items only. Multi-topic cases count once in a session. Written responses enter accuracy after an explicit 0–3 self-score. The configurable 70% default is a practice target, not an exam prediction.
- A successful persisted submission/evaluation enables a three-second auto-advance. Stay and review, review focus, or hiding the tab pauses it; a checkbox disables it. Saving errors preserve existing storage and block submissions/advance. Final mock submission remains explicit; all solutions/objective scores stay hidden beforehand.
- Starting a new configured session leaves older queues/drafts available under Progress. New filters cannot remove a successfully retried item from its existing missed queue. Export/import includes all sessions; valid imports can recover corrupt storage. Standalone diagram editing retains explicit Save diagram.


## Implemented UI, diagrams, and reading update — October 6, 2026

- Theme the full application using verified Towson gold/black/graphite/white/gray tokens. Preserve accessible text/focus contrast and explicit red/green correctness indicators.
- Shared help supports hover, keyboard, Escape, click/touch, outside dismissal, and constrained positioning. Keep essential notes visible. Opening or focusing review help pauses an active answer countdown.
- After diagram submission, show submitted and authored correct graphs together, with explicit issue labels and red outlines for incorrect elements/connections. Missing items/links appear in textual feedback. Preserve saved learner data, accept equivalent labels/layouts, fit previews to the available width with an optional enlarged scroll view, and hide mock solutions until final submission.
- Render dashed open arrows for include/extend, solid hollow-triangle arrows for generalization, and filled context arrows only for directed relationships. Undirected actor/context links have no arrow. Explain source/target direction and provide a reverse control. SVG marker identifiers must be unique.
- Display verified textbook edition/chapter/section, printed/PDF page ranges, and specific subject-index links for topics, questions, cases, and diagrams. Prefer relevant narrow subsections; deduplicate case readings. Retain lecture scope/provenance and clarify mismatched supplemental terminology. Validation checks the local textbook fingerprint.

## Implemented cheat sheet and learning trends — October 8, 2026

Provide an editable, space-limited **8.5 × 11-inch reference sheet** with fixed handwriting-sized text. Implemented defaults are one portrait side, 14-point font, 20-point line spacing, and half-inch margins. Capacity follows actual rendered layout; additions/edits cannot shrink the font, spill onto a second page, clip content, or silently truncate notes. Show remaining space; allow editing/reordering/deleting, persistent save/backup, and single-page printing / Save as PDF.

After a saved, revealed score below 2/3, recommend a concise correct-concept note with source links. Users can edit/add or dismiss it; recommendations do not insert automatically. Group repeated concept suggestions, preserve dismissal, and pause auto-advance while reviewing a suggestion. Pending evaluations and unfinished mocks cannot reveal suggestions. Implemented at `/cheat-sheet`; details and acceptance are in [cheat-sheet-plan.md](cheat-sheet-plan.md).

Progress includes first-try exact MCQ accuracy, daily score trends with separate comparable cohorts, response volume, chapter gaps, matched repeat recovery, recurring low scores, and Low/Medium/High confidence calibration. Objective results and written self-assessments stay separate. Pending evaluations contribute only to volume; active mocks are excluded. Multi-topic cases count once overall. First submissions are determined before filters; cohorts distinguish content/scoring versions, format, method, difficulty, and practice/mock mode. At least three matched items are required for a numerical improvement claim. Dates are browser-local; unknown-version legacy results stay separate.

Storage v4 adds the ordered reference sheet, editable draft, revisions/source links, and per-response suggestion decisions. Migration preserves v0–v3 activity and historical scoring with pre-v4 and earlier backups. A stable response ID links new multi-topic attempt rows. Import checks shape, references, response consistency, and actual page fit before replacing data. Fixed-font failure disables capacity-dependent saves/print; save or overflow failure preserves existing notes and proposed text. The sheet route and fixed font are cached offline.

## Purpose and scope

Prepare one student for the Fall 2026 AIT 624 / COSC 612 midterm by organizing review-derived topics and lecture-grounded material for recall, explanation, application, and diagram practice. `docs/exam-blueprint.md` and `docs/source-map.md` define what content belongs in the app.

The exam review describes formats, not question counts or weighting. The app must not imply that a mock exam's distribution is the professor's distribution. Use the professor's chapter/topic scope and stated formats; do not add textbook-only topics.

## Exam-aligned MVP

1. **Exam blueprint:** browse the six review chapters, subtopics, priorities, formats, skills, and source references.
2. **Study guide:** navigate Topic → Subtopic → Concept. Each concept provides definition, explanation, course-derived example, common mistake, related concepts, source IDs, and **KNOW / UNDERSTAND / APPLY** objectives.
3. **Multiple-choice practice:** four plausible options, one correct answer, explanation, a reason each distractor is wrong, topic, difficulty, and source IDs. Modes: topic, mixed, weak areas, missed questions, and mock exam.
4. **Short-answer practice:** keep the model answer hidden until submission. Then show the learner's response, model answer, required concepts, a self-check checklist for correct/missing concepts, and a 0–3 rubric (0 incorrect, 1 partial, 2 mostly correct, 3 complete). Record score and confidence. No automatic semantic evaluation is claimed in the local-only MVP.
5. **Case-study practice:** source-grounded scenarios with related questions (problem, relevant concepts, recommendation, model/diagram when applicable, reasoning). Hide solutions until submission. Afterwards show model solution, explanation, concepts, rubric, relevant example diagram where applicable, source IDs, and common mistakes. Difficulty: Basic, Intermediate, Exam-Level, Challenge.
6. **Diagram workspace:** interactive, saveable diagrams limited initially to the assessed **context model** and **use-case diagram** types. Users can add, move, rename, and delete nodes; add and label connections; add actors/entities appropriate to the type; reset; and save. Grade semantics (required/missing/extra elements, connections, direction, and labels) rather than visual layout. Do not require pixel-perfect matching.
7. **Progress and next-study recommendation:** record attempts, correctness, practice scores, last studied, confidence, and mastery by topic. Display Strong / Developing / Weak and a clear “What should I study next?” recommendation based on exam priority, low mastery, repeated mistakes, and time since review.
8. **Mock midterm:** combine the professor-listed formats (MCQ, short answer, case study, and an in-scope diagram question). State clearly that counts/weights are an illustrative practice mix unless the professor later provides exact weighting. Support review of submitted answers.

## Content authority, provenance, and question quality

- `MR-P1` controls scope and expected question formats. Lectures control definitions, terminology, methods, diagrams, and examples. Textbook material may clarify a mapped topic only.
- Each piece of study content and each question carries one or more source IDs from `docs/source-map.md`.
- Identify provenance as `PROFESSOR_SOURCE`, `SOURCE_DERIVED`, or `AI_GENERATED`. Source-derived and AI-generated material must retain the cited course sources; AI generation is not allowed without supplying relevant source context first.
- The first release uses reviewed, structured course content rather than an unconstrained question generator. AI generation is optional future work, not a dependency for the MVP.
- MCQ distractors must be plausible and specifically explained; cases must apply multiple course concepts. Avoid implying the course states an answer when it is an app-authored explanation.
- Do not add sequence/class/activity/state diagram practice to the initial exam scope just because those subjects appear in the modeling deck.

## User and data model

Use a topic hierarchy and reusable data rather than embedding course facts in React components:

```text
Topic
  id, title, reviewChapter, priority, formats[], sourceIds[]
Subtopic
  id, topicId, title, objectives[], sourceIds[]
Concept
  id, subtopicId, title, definition, explanation, example,
  commonMistake, relatedConceptIds[], skills[], sourceIds[], provenance
Question
  id, topicId, subtopicId, type, difficulty, prompt, choices[],
  answer, explanation, distractorExplanations[], rubric[], sourceIds[], provenance
CaseStudy
  id, topicIds[], difficulty, scenario, prompts[], modelSolution,
  rubric[], commonMistakes[], diagramExerciseId?, sourceIds[], provenance
DiagramExercise
  id, topicId, diagramType, prompt, requiredElements[],
  requiredConnections[], acceptableAlternatives[], sourceIds[], provenance
Attempt
  id, itemId, topicId, itemType, response, result, score, confidence,
  completedAt, sourceIds[]
MasteryRecord
  topicId, attempts, correctCount, scoreSummary, confidence,
  lastStudiedAt, mastery, status
SavedDiagram
  id, exerciseId, topicId, diagramType, nodes[], edges[],
  updatedAt, sourceIds[]
```

Use discriminated question and diagram types in TypeScript so MCQ-specific choices and diagram-specific edges are not optional fields on unrelated records. Keep stable IDs and version the stored-progress envelope.

## Diagram grading criteria

- **Context model:** system under design, relevant external systems/actors, boundary placement, and connections that represent context relationships.
- **Use-case diagram:** external actors, user-goal use cases, system boundary, actor-use-case associations, and any include/extend/generalization relationship explicitly required by the prompt.
- Grade each criterion against an authored semantic key, accepting equivalent labels or layouts where the concept is the same. Surface missing/extra elements and incorrect or reversed relations without treating harmless layout differences as errors.
- Save the student's graph as node/edge data plus exercise and source IDs; render through React Flow or an equivalent React graph library.

## Progress logic

Each completed practice item appends an attempt; topic summaries are derived from attempts rather than independently editable totals. A first mastery/status implementation can use a documented threshold/rubric and classify topics as **Strong**, **Developing**, or **Weak**. Next-study ranking should combine:

1. Exam priority from the blueprint.
2. Low topic mastery / Weak status.
3. Repeated errors or missed questions.
4. Elapsed time since last study.

Do not present mastery as an exam prediction or claim statistical calibration from a small personal dataset.

## Technical choices

- **UI:** Next.js, React, TypeScript, Tailwind CSS.
- **Content:** version-controlled JSON files, validated against TypeScript schemas at load/build time. JSON is the simplest reviewable, diffable format for a small, stable, single-course content set; it also keeps content outside UI components.
- **Progress and saved work:** browser `localStorage` behind a typed, versioned storage adapter for the first personal-use release. The expected volume is small; this avoids a database service and persistence dependency. Include export/import or a clear reset path before relying on it for durable records. If attempts, diagrams, or content grow materially, the adapter can move to IndexedDB without changing content/UI models.
- **IndexedDB:** defer for MVP; appropriate if storage volume, query complexity, or offline content grows beyond simple personal records.
- **SQLite:** do not use initially; a local database/WASM or server integration adds setup and migration complexity without an MVP benefit.
- **Authentication / cloud database / multi-user:** out of scope.
- **AI:** no external AI service required by the MVP. If added later, make it opt-in, send only selected source context, keep generated output labeled and source-linked, and provide a review step before treating it as study content.

## Non-functional requirements and acceptance

- All core study modes must remain usable without network access after the app and content are loaded.
- Core interactions must be keyboard accessible and announce feedback/status changes.
- Do not reveal MCQ answers, short-answer models, or case-study solutions before the student's submission.
- Persist attempts and saved diagrams across reloads; validate stored shape/version and surface an actionable message if data cannot be read or migrated.
- Keep source references visible in content and feedback.
- At minimum, tests cover source-linked content validation, each interaction/reveal path, diagram semantic criteria, storage round-trips/migration, mastery aggregation, and next-study ordering.
- No analytics, accounts, or third-party service calls in the MVP.
