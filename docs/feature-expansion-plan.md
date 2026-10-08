# Study Studio feature expansion plan

Prepared October 6, 2026. Status: **priorities 1–3, confidence/acronyms, tooltips, Towson theme, precise textbook links, diagram arrows and correct-diagram comparison implemented; remaining features planned**.

Updated October 8, 2026: added **F24 partial-credit MCQs, F25 immediate sample-exam advancement on submit, and F26 ATM sequence / airline use-case comparison teaching**. F24–F26, F22–F23 (cheat sheet and mistake suggestions), and F03 (improvement trends and confidence calibration) are now implemented; see the October 8 implementation record for verification. See [scoring-and-diagram-teaching-plan.md](scoring-and-diagram-teaching-plan.md) for requirements, source reconciliation, and acceptance checks.

This plan extends the completed MVP in `docs/implementation-plan.md`. The authorized October 6 subset is recorded in `docs/implementation-plan.md`; the feature inventory below retains the full future scope. Token figures estimate future implementation work; they are not actual usage or an approved spending limit.

## Confirmed requirements and original baseline

- Multiple users means **individual accounts with progress synced across devices**, confirmed by the user.
- **Every question requires an explicit confidence choice before submission**, confirmed by the user. Do not preselect Medium and treat it as an answer.
- Implemented feature: a bounded, editable **8.5 × 11-inch cheat-sheet reference**, fixed handwriting-sized text, and suggestions after low-scoring questions. See [cheat-sheet-plan.md](cheat-sheet-plan.md) for implemented defaults and acceptance criteria.
- October 8 additions: partial-credit multiple-choice scoring; automatic sample-exam navigation after a successful question submit; and sequence-versus-use-case teaching using the supplied ATM withdrawal and Airline Support System class solutions. Preserve the passenger, check-in representative, baggage management system, TSA, check-in variants, baggage, boarding-pass, security, boarding, and change-flight requirements in the linked detailed plan.
- Prioritize multiple-choice practice based on the user's latest exam guidance. The supplied professor review gives formats but no numeric weighting; the app's default mix must remain labeled as a practice configuration.
- Original bank before this update: 17 single-answer multiple-choice questions (MCQs), 22 short-answer items, three cases, and two diagram exercises, covering six chapters and 22 blueprint rows.
- Original persistence before this update: attempts and saved diagrams persisted locally; ordinary practice sessions and unfinished mock sessions did not resume after reload. There are no accounts, database, or runtime AI calls.
- Topic mastery and next-study ranking already exist. Improvement over time, a stable finite study session, and a live ordinary-practice score do not.
- Original correct/incorrect feedback shared one visual treatment. Diagram arrow support exists for directed connections; the workspace does not reveal an authored solution graph after grading.

## Confidence behavior

The current Low / Medium / High control records the learner's reported certainty with an attempt. It does **not** change correctness, the 0–3 written self-score, the diagram score, or mastery. `src/lib/mastery.ts` maps Low to 0, Medium to 0.5, and High to 1, averages recent confidence, and adds `(1 - confidence)` to next-study rank. Lower confidence therefore increases review priority. The dashboard displays mean confidence.

The implemented control starts unselected, requires a choice before submitting any answer/diagram, and explains this behavior beside the control. Pre-answer confidence is frozen at submission; changing confidence after reading the answer must not overwrite the original observation. The calibration view in Progress shows exact MCQ accuracy by confidence and high-confidence errors, keeping certainty separate from accuracy.

## Estimation method

**k = 1,000 engineering-agent tokens.** Ranges include relevant file/source reads, reasoning, code/content authoring, focused tests, and ordinary repair cycles. Each row is incremental in the proposed sequence; shared groundwork and final integration are separate rows to avoid counting them repeatedly. They are judgment estimates, not measured benchmarks. Large context replays, substantial requirements changes, provider/setup problems, and lengthy content review can increase actual usage.

Totals exclude tokens charged by the app's future AI API, subscription/hosting/database fees, and human review time. Allow **20% contingency** beyond the base estimate. Track actual usage and re-estimate after each stage before committing the next stage's budget. Token spend cannot be converted reliably to dollars until the implementation model and billing terms are selected.

**HIGH IMPACT** means the change substantially improves learning feedback, exam preparation, continuity, or the explicitly requested multi-user use case. Medium impact means useful usability or presentation work. Delivery order also considers dependencies and cost; high impact does not automatically mean implement first.

## Feature inventory and projected implementation spend

| ID | Requested feature | Impact | Stage | Status | Implementation and acceptance target | Tokens |
|---|---|---|---|---|---|---:|
| F00 | Shared groundwork | HIGH IMPACT · enabling | 0 | Partial groundwork | Extract session/answer/scoring interfaces from the compact components; introduce versioned question/attempt/session contracts and migration fixtures. Preserve existing behavior and the current regression suite. Limit refactoring to these features' needs. | 10–18k |
| F01 | Multiple users | **HIGH IMPACT** | 4 | Planned | Account sign-in/out, per-user cloud records, cross-device resume, and an explicit import of existing local progress into the signed-in account. Enforce ownership on the server. | 25–45k |
| F02 | Save study-session state | **HIGH IMPACT** | 1 | Complete | Save the exact queue, ordering, current item, answer drafts, confidence, feedback state, scored items, mode/settings, and diagram draft. Resume ordinary practice and unfinished mocks without reshuffling or duplicate attempts. | 12–20k |
| F03 | Record improvement statistics | **HIGH IMPACT** | 3 | Complete | Persist session summaries and item-level results; show first-try accuracy, score trends, per-topic gaps, repeat recovery, completed volume, and confidence calibration. Separate self-scores and objective scores; no runtime AI evaluation exists. | 12–20k |
| F04 | Select-all-that-apply MCQs | **HIGH IMPACT** | 2 | Complete | Add a discriminated multiple-answer type, checkbox interaction, correct-choice IDs, per-option reasoning, and exact-set grading. Update practice, mock, storage, scoring, and missed-question queues. | 8–14k |
| F05 | `5/20` and session progress bar | **HIGH IMPACT** | 1 | Complete | Separate “Question 5 of 20” from “4 of 20 submitted.” Progress measures unique submitted items, supports resume, and reaches completion once. Provide accessible text and progress semantics. | 4–7k |
| F06 | Explain and require confidence | Medium | 1 | Complete | Start with no selection and require Low / Medium / High before every question's submission, including cases, diagrams, and mock items. Explain that it informs review priority and does not affect the answer score. | 3–5k |
| F07 | Helpful tooltips | Medium | 1 | Complete | Add keyboard/focus/touch-accessible help for confidence, scores, progress, saving/sync, sources, question types, and diagram relationships. Essential instructions stay visible. | 3–6k |
| F08 | Towson University color theme | Medium | 1 | Complete | Apply verified gold, black, graphite, white, and gray tokens across pages and diagrams. Preserve contrast, focus visibility, and semantic feedback colors. | 4–7k |
| F09 | Red “Review this one” treatment | **HIGH IMPACT** | 1 | Complete | Incorrect feedback gets a red heading, border/icon, and readable pale background; correct feedback gets a distinct success treatment. Do not communicate correctness by color alone. | 1–2k |
| F10 | Explicit Correct / Incorrect labels | **HIGH IMPACT** | 1 | Complete | Use “Correct” and “Incorrect — review this one” for objectively graded MCQs. Written answers show their evaluation type; diagrams show semantic score/criteria rather than claiming all partially correct answers are simply wrong. | 1–2k |
| F11 | Specific textbook further reading | **HIGH IMPACT** | 2 | Complete | Map every topic and question to a verified chapter, section, printed page/range, and local PDF page. Add “Read more” links at topic, question, and individual-option/concept level where relevant. | 8–14k |
| F12 | Find and incorporate online quiz material | Medium · availability-dependent | 2 | Planned | Maintain a source/review register; identify textbook edition and exact course matches; incorporate suitable links and original source-grounded practice or authorized imports. Validate answers against the course sources before publishing. | 8–16k |
| F13 | Expand the MCQ bank | **HIGH IMPACT** | 2 | Complete | Grow from 17 to **100 total MCQs**, targeting about 80 single-answer and 20 multiple-answer items across all 22 rows. Include scenarios and plausible misconception-based distractors. Make default sessions MCQ-heavy and adjustable. | 30–55k |
| F14 | AI short-answer accuracy percentage | **HIGH IMPACT** | 5 | Planned | Add server-side rubric-based evaluation with a visible 0–100% AI-estimated content score, criterion-level feedback, cited sources, uncertainty/abstention, and retry/self-check fallback. Calibrate against reviewed example answers. | 18–32k |
| F15 | Live score and pass percentage | **HIGH IMPACT** | 1 | Complete | Show correct/scored counts and earned points divided by scored points, plus remaining/pending evaluations. Support a learner-configurable practice target; show whether current performance meets that target. | 4–8k |
| F16 | Automatically advance after recording | **HIGH IMPACT** | 1 | Complete | After a successful record, show feedback and a short cancelable countdown, then advance. Provide Next now, Stay/review, and an auto-advance setting. Written questions wait for a recorded evaluation/self-score. | 4–7k |
| F17 | Spell out acronyms | Medium | 1 | Complete | Add a reusable glossary and first-use expansions such as “XP (Extreme Programming)” and “MCQ (multiple-choice question).” Audit prompts, choices, explanations, and help. Do not invent expansions for ordinary names such as Scrum. | 2–4k |
| F18 | AI clarity review of questions/answers | **HIGH IMPACT** | 2 | Planned | Run a bounded editorial pass grounded in the relevant lecture/textbook excerpts. Flag ambiguity, weak distractors, unclear explanations, and answer-key inconsistencies; publish reviewed revisions with stable IDs, versions, sources, and before/after changes. | 12–22k |
| F19 | Additional diagram examples | **HIGH IMPACT** | 3 | Planned | Expand from two to **eight total exercises**: four context models and four use-case diagrams, with guided worked examples and semantic keys. Stay inside the reviewed diagram scope. | 10–18k |
| F20 | Visible diagram arrows | **HIGH IMPACT** | 3 | Complete | Make required directional relationships clear in the editor and solution: include/extend/generalization and explicitly directed context links. Correct UML arrowheads and relationship labels; preserve undirected actor associations/context links where appropriate. | 4–7k |
| F21 | Display the correct diagram | **HIGH IMPACT** | 3 | Complete | After submission, render the authored solution alongside the learner's graph, with missing/wrong relations highlighted and textual feedback. Allow exploration without overwriting saved work. Mock solutions remain hidden until final submission. | 4–7k |
| F22 | Bounded printable cheat-sheet reference | **HIGH IMPACT** | 1b | Complete | Editable one-page 8.5 × 11-inch sheet; fixed handwriting-sized font and spacing, actual rendered-space limit, remaining-space indicator, save/resume, backup, and print / Save as PDF. No shrinking or silent overflow. | 12–20k |
| F23 | Recommend notes after low scores | **HIGH IMPACT** | 1b | Complete | Offer an editable correct-concept note after a saved/revealed score below 2/3; respect mock/pending feedback rules, deduplicate, persist dismissal, pause auto-advance, and require user choice before adding. | 4–7k |
| F24 | Partial credit on MCQs | **HIGH IMPACT** | 1c | Complete | Versioned fractional scoring for select-all responses and authored single-answer choice weights where justified; separate earned points from exact correctness; preserve historical scores and explain partial credit in practice/final mock review. | TBD |
| F25 | Auto-advance on sample-exam submit | **HIGH IMPACT** | 1c | Complete | Existing mock navigation has a three-second countdown. Add immediate advancement after a successful saved submission, with configurable alternatives, no early answer reveal, and explicit final exam submission. | TBD |
| F26 | Sequence versus use-case teaching | **HIGH IMPACT** | 3a | Complete | ATM withdrawal sequence walkthrough and Airline Support System use-case example from the two class-solution PDFs; guided comparison, accessible diagrams/text, comprehension checks, and explicit source/request include-arrow reconciliation. | TBD |
| QA | Final integrated verification and handoff | HIGH IMPACT · enabling | Release | Ongoing per release | Verify migrations, accounts, cross-device sync, session resume, all formats, score math, offline replay, AI failure handling, source links, sheet capacity/print pagination, accessibility, mobile layout, and production build. Document operation and limits. | 14–26k |

## Recommended delivery order

| Stage | Work | Dependencies | Token subtotal |
|---|---|---|---:|
| 0 | Focused shared groundwork (F00) | Current MVP | 10–18k |
| 1 | Durable sessions and clearer learning UI (F02, F05–F10, F15–F17) | Stage 0 | 38–68k |
| 1b | Bounded cheat sheet and low-score suggestions (F22–F23) | Existing saved attempts, feedback, session/storage contracts | 16–27k |
| 1c | Partial-credit MCQs and immediate sample-exam navigation (F24–F25) | Versioned scoring/session contracts and migration checks | TBD |
| 2 | MCQ format/content expansion and further reading (F04, F11–F13, F18) | Session and scoring contracts; authoritative source mapping | 66–121k |
| 3 | Improvement reporting and diagram teaching (F03, F19–F21) | Recorded sessions, versioned questions, authored diagram keys | 30–52k |
| 3a | ATM sequence / airline use-case teaching (F26) | Reviewed class-solution PDFs and sourced instructional content | TBD |
| 4 | Accounts and cross-device synchronization (F01) | Owner-ready session/storage model; selected hosting/auth/database | 25–45k |
| 5 | Runtime AI short-answer evaluation (F14) | Account/server boundary, sources, rubrics, evaluation fixtures | 18–32k |
| Release | Integrated regression and handoff (QA) | All stages | 14–26k |
| **Original base total** | F00–F23 and QA; excludes October 8 additions | | **217–389k** |
| **Original planning budget with 20% contingency** | Excludes F24–F26; rounded allowance, not a spending authorization | | **260–470k** |

The new sheet feature adds **18–31k** including additional integrated checks (**22–38k** with contingency). Recommend it next after the already delivered session/feedback priorities; it does not depend on accounts or runtime AI. Full-plan totals include estimates for delivered rows and are not a remaining-work budget.

F24–F26 and their additional QA are not included in those original totals. Implementation usage was not metered; the detailed plan records the delivered scoring and navigation defaults.

The original first-release recommendation was stages 0–1 plus F04, F11, and F13: saved sessions, explicit feedback, live score/progress, and a substantially larger MCQ bank. Those rows total **94–169k** before final release verification and contingency. Complete the remaining stages to fulfill the full requested feature set.

The stages are review checkpoints, not instructions to stop midway if the user later authorizes the entire plan. No accounts, paid services, API keys, deployment, or app feature changes are created during this planning task.

## Implementation design and acceptance details

### 1. Session and storage contracts

Introduce `StudySession` with a stable ID, owner reference, mode, status (`active`, `completed`, `abandoned`), item IDs/order, content versions or item snapshots, current index, drafts, pre-answer confidence, per-item submission/evaluation state, settings, timestamps, and revision. Session queues must not change just because recording a result removes an item from a weak/missed filter.

Distinguish a submitted answer from its evaluation. Add question version, selected-choice IDs, evaluation source (`objective`, `self`, `AI`), rubric results, elapsed active time where measured, and session linkage to attempts. Score revisions update an evaluation record instead of creating a misleading extra first attempt. Multi-topic cases contribute once to the session score, with separate topic attribution.

Use schema v2 and explicit v1 migration. Back up legacy data, preserve IDs/timestamps/confidence/saved graphs, and do not silently assign all historical activity to whichever account signs in first. Autosave text drafts after a short debounce, persist confidence changes immediately, and save diagram drafts at appropriate change boundaries. Persist submission before advancing. Storage/sync failure leaves the question in place with a recovery message.

Tests: reload on an unanswered item, after submission, during feedback, and before mock completion; restore case fields, multiple-answer selections, and diagrams; preserve the exact randomized queue; duplicate submit/refresh must not duplicate attempts; invalid backups must preserve the existing record.

### 2. Progress, feedback, score, and auto-advance

- Default new study sessions to a finite 20-item queue. Suggested MCQ-heavy mock mix: 16 MCQs, two short answers, one case, one diagram. This is a configurable practice mix, not a claim about professor weighting.
- Show the current position, submitted completion fraction, scored fraction, and live score separately. An answer awaiting AI or self-assessment can be submitted but not scored.
- Before October 8, MCQ scoring used binary exact-set correctness. F24 now provides a versioned partial-credit policy while retaining exact correctness separately; see the detailed plan for the proposed formula and authored single-answer weights. Selecting every option must not earn credit, and historical scores must retain their original policy.
- Label the score “Practice accuracy/score.” A configurable practice target may start at 70% as an app setting, visibly editable. “Currently meets target” is different from passing a real midterm; final completion shows the session result against the selected target.
- In ordinary practice, recommend a three-second auto-advance countdown after successful recording, with Stay/review and Next now. Pausing or focusing feedback cancels the countdown. Persist the setting; announce navigation and focus the next prompt. Do not move on when recording fails.
- In mocks, keep answer correctness and explanations hidden until the final submission. A visible completion count is safe; any live objective score must be deliberately enabled as a feedback/mock setting because it can reveal correctness before the final review. Default mock mode shows recorded/scored counts and reveals accuracy at completion.
- F25 adds immediate mock advancement after a successful saved question submit, with manual/countdown alternatives. The last answer leads to final-submit controls, never automatic exam completion or solution reveal.
- Explain confidence in plain language. Require an explicit selection on every question before submission. No score modifier, no default confidence, and no after-feedback overwrite of pre-answer confidence.

Likely files: session repository and hooks; session header/progress component; shared answer feedback, confidence input, and help components; updates to `PracticeCard`, `PracticeRunner`, `MockExamRunner`, `MockSummary`, and storage schemas.

### 3. Improvement reporting

Implemented F03 in Progress: derive statistics from saved responses and evaluations, beyond the last ten topic scores. Show daily trends, first-try exact MCQ accuracy, chapter gaps, volume/sample size, matched repeat recovery, recurring low scores, and high-confidence errors. Filters cover 7/30/all days, chapter, method, and MCQ scoring policy; each trend cohort identifies format, content version, method, scoring policy/version, difficulty, and practice/mock mode.

Keep question difficulty/content version, scoring method, and attempted counts visible so changing the bank or AI rubric does not silently look like learning improvement. Repeated exposure and different practice mixes are different comparison conditions. Show “not enough comparable attempts” rather than presenting a precise improvement claim from one answer. No active-time measurement is claimed in this delivery. Numerical matched improvement requires at least three comparable items. Pending evaluations are excluded from scored denominators; unfinished mocks are hidden. Legacy unknown versions remain separate, with same-second grouping of identical multi-topic case rows disclosed.

Tests: repeat attempts do not inflate first-try accuracy; a multi-topic case is not double-counted in an overall session; pending evaluations do not enter the scored denominator; history remains scoped to this browser; cloud ownership awaits F01.

### 4. Question quality, acronyms, and MCQ-first content

Target 100 MCQs total, including approximately 20 select-all items, distributed across the existing 22 blueprint rows. Use definitions, distinctions, applied scenarios, and common misconceptions; add MCQ practice to the already-scoped topics without presenting that practice format as a professor-confirmed per-chapter format.

Each item needs stable choice IDs, a validated key, per-choice reasoning, difficulty, topic/concept references, original lecture citations, further-reading references, provenance, and content version/review status. Run duplicate/near-duplicate checks, coverage checks, answer-position checks, and ambiguity review. A multiple-answer item has at least two correct options and at least one incorrect option.

The editorial AI pass uses relevant source excerpts and produces suggested revisions or flags. Preserve the original record until the revised key/explanation is checked; AI agreement alone is not validation. Record actual provider token usage separately if an external AI API is used for this pass. Scope this estimate to one substantive editorial pass with limited revisions; additional content rounds need a revised budget.

### 5. Textbook index and online source integration

The local file is **Ian Sommerville, Software Engineering, tenth edition, Global Edition**, with 812 PDF pages. Spot checks show printed page 19 at PDF page 20, printed page 45 at PDF page 46, and printed page 105 at PDF page 106. Verify every mapping rather than assuming one offset applies to all front matter, figures, and index pages.

The original `TB-*` source records used `page: 1`; these locators have now been repaired. Maintain the verified mappings in `src/content/textbookReadings.json` and replace future broad placeholders with precise references and a separate `FurtherReading` structure: edition, chapter, section, concept/index term, printed page start/end, PDF page start/end, local document URL, and optional official web resource. Keep original professor/lecture citations distinct from supplementary reading. Map individual answer-option misconceptions to the relevant reading when helpful.

Research findings as of October 6, 2026:

| Source | Finding | Planned treatment |
|---|---|---|
| [Author's tenth-edition site](https://software-engineering-book.com/) | Official textbook resource hub with chapter presentations, videos, case studies, and supplements. | Link matched supporting resources and use them to check original explanations. |
| [Author's instructor guide](https://software-engineering-book.com/instructors/) | Describes chapter quizzes and solution materials available through Pearson to accredited instructors. | Register as a potential authorized source. Use only material made available with the appropriate access/reuse rights; no promise of access to this bank. |
| [Author's supplements](https://software-engineering-book.com/downloads/) | Public supplementary reading and sample chapters. | Add scoped further-reading links; do not expand exam topics. |
| [Pearson textbook page](https://www.pearson.com/en-us/subject-catalog/p/Sommerville-Software-Engineering-10th-Edition/P200000003258) | Official tenth-edition description and chapter structure. | Verify edition/chapter identity; the local Global Edition supplies actual PDF locators. |
| [Towson AIT listing on Course Hero](https://www.coursehero.com/sitemap/schools/82-Towson-University/departments/141892-AIT/) | Third-party course labels exist, but the material is not established as current professor-approved practice. | Candidate discovery only; verify author, institution, term, scope, answer correctness, access, and reuse before importing. |

Searches did **not** establish a public, verified Fall 2026 AIT 624 / COSC 612 quiz bank from this instructor. Course codes also match unrelated institutions, and some third-party quiz pages contain weak or mismatched answer sets. Do not import a bank based only on its title. The user's supplied review and lectures remain the authority.

Create a resource register with URL, owner, edition/course/term, checked date, relevant blueprint IDs, access/reuse status, and review decision. Incorporation can mean an attributed external practice link or an original question grounded in verified teaching sources. Full question-bank imports require suitable permission/license and review. If a quiz source is unavailable, continue with the scoped original bank and record that outcome explicitly.

### 6. Towson theme and helpful notes

Use Towson's [official color guidance](https://www.towson.edu/brand/visual-guidelines/color.html): Gold `#FFBB00`, Black `#151500`, Graphite `#3C3C3C`, White `#FFFFFF`, and Glen Mist `#DDDDDD`. Use dark text on gold. Treat red/green feedback as functional status colors, with labels/icons and contrast checks, rather than using university gold to mean correctness.

Centralize theme/status variables so page cards, buttons, progress indicators, controls, and diagram nodes use consistent tokens. Preserve the existing responsive layout. Tooltips support hover and keyboard focus; touch users can open a help popover. Essential scoring, confidence, and save-state explanations must not be available only through hover. Check 4.5:1 text contrast and keyboard focus across the themed application. Color theming does not require adding an official logo or claiming university endorsement.

### 7. Diagram teaching and notation

Add six new source-grounded exercises to the existing two: four context exercises and four use-case exercises total. Include simple and exam-style prompts, authored solution graphs, accepted label alternatives, boundary criteria, relationship types/directions, and common mistakes. Add guided examples with progressive reveal as well as unassisted practice.

“Diagrams must include arrows” means arrows where the modeled relationship has direction. Use-case actor associations are normally undirected; adding an arrow to every line would teach misleading notation. Include points to included behavior, extend points to the base use case, and generalization uses an appropriate hollow triangle pointing to the general element. Directed context/data interactions use the explicitly authored direction; ordinary context relationships can remain undirected. Expose this distinction in the relationship picker and tooltip.

After submission, provide side-by-side learner and authored diagrams, highlighted differences, readable relationship labels/arrowheads, and a textual equivalent. Preserve the learner graph when revealing or manipulating a solution. Reuse `exampleGraph` and the semantic grader, extending accepted solutions only when authored. Hidden-until-final-submit behavior remains in mock mode.

Tests: arrowhead type/direction, include/extend semantics, undirected associations, labels at desktop/mobile zoom, no layout penalty, solution reveal timing, and no overwrite of saved student work.

F26 adds the explicitly requested supplementary comparison of sequence and use-case diagrams using the ATM withdrawal and Airline Support System activity solutions. Preserve the specified airline actors/goals, explain sequence message order and ATM alternatives, and show the source's include-arrow differences from the user's requested model. This teaching feature does not add sequence grading or claim sequence diagrams are confirmed midterm scope. See [scoring-and-diagram-teaching-plan.md](scoring-and-diagram-teaching-plan.md).

### 8. Accounts, cloud storage, and sync

Choose a managed authentication service and PostgreSQL-backed repository compatible with the existing Next.js app. Confirm provider/hosting credentials and operating budget at implementation; do not provision them in this planning task. The token estimate assumes one standard provider integration, individual learner accounts, and no university single sign-on, organizations, instructor administration, or social features.

Data model: user, study session, submitted response/attempt, evaluation/version, saved diagram/draft, preferences, and sync operations. Shared course content remains versioned and read-only for learners. The server derives the owner from the authenticated session and checks it on every read/write. A client-supplied user ID is never sufficient authorization.

Preserve offline studying through a per-user local store and pending-operation queue. Sync with idempotent operation/attempt IDs, ordered session revisions, and explicit conflict handling. Merge immutable attempts by ID; use revision checks and a learner-visible resolution for conflicting drafts rather than silently replacing an answer. Show saved locally, syncing, synced, offline, and sync-error states.

At first sign-in, offer a preview/import of existing local progress into that account. Namespace caches by owner, cancel stale requests on sign-out/account change, and prevent a previous user's data from appearing in the new account. Update the current service worker to cache a public offline shell/assets, never globally cache personalized account documents or authenticated APIs. Cloud writes require valid server authentication; queued offline work syncs after connectivity and authentication return.

Tests: two accounts on the same browser; another device resumes the same queue/draft; offline replay causes no duplicate attempts; expired auth preserves pending work; no cross-user read/write/cache exposure; export/import/reset/deletion behavior is explicit about local versus cloud data.

### 9. AI short-answer evaluation

Add a server-only evaluation endpoint behind the account boundary. Supply the authored prompt, expected concepts/rubric, model answer, limited relevant course excerpts, and submitted response. Use structured output validated at runtime. Do not ship provider credentials to the browser.

Evaluate concept accuracy and coverage, not matching wording to the model answer. The displayed percentage is **AI-estimated rubric accuracy**, not the probability the student will pass or a calibrated professor grade. Compute the percentage from criterion scores and documented weights; show correct, missing, and contradictory concepts with source-linked explanation. Keep provider/model version, rubric/content version, usage, and evaluation status so results are reproducible and comparable.

Prepare reviewed correct, partially correct, incorrect, paraphrased, terse, and conflicting-answer fixtures. Check grading consistency and error cases before enabling the feature. If evidence is inadequate or results conflict, return an uncertain/review-needed state instead of a fabricated percentage. Provide manual self-check/override without deleting the original AI evaluation. Rate-limit calls, cap source/context sizes, use request IDs for retries, and track usage per owner. Do not resend full textbooks or unrelated personal data.

Runtime budget estimate, separate from engineering tokens: **about 0.8–2.0k input + 0.2–0.6k output tokens per normal short-answer evaluation** (1.0–2.6k total), excluding retries. For 100 evaluations, roughly **100–260k API tokens**. An external content-editing call might use **2–5k API tokens per item**; actual source excerpt length and output format determine the spend. These are planning assumptions, not provider guarantees. Select the model and estimate dollar costs using current pricing at implementation.

### 10. Bounded cheat-sheet reference

Deliver F22–F23 according to [cheat-sheet-plan.md](cheat-sheet-plan.md). Implemented defaults are one portrait side, fixed 14-point text / 20-point line spacing, and half-inch margins. Enforce actual rendered page capacity. Offer editable, source-linked notes after qualifying saved low scores; do not insert automatically or expose unfinished mock solutions. Existing sheet notes remain under user control. Include persistence/migration, backup, keyboard/mobile/offline, and single-page print/PDF verification. **Complete as recommendation item 4.**

## Full expansion completion criteria

- All 26 requested feature rows (F01–F26), plus enabling F00 and QA, have an acceptance result and implementation token usage recorded against their estimates; record October 8 actual usage as unmetered rather than inventing a token total.
- Sessions resume without losing work or duplicating attempts; users sync across devices without sharing private progress.
- Select-all MCQs, first-try accuracy, live scores, target status, completion counts, and multi-topic case totals use tested, explicit formulas.
- Required confidence, correct/incorrect feedback, source links, acronym expansions, tooltips, and auto-advance work with keyboard and touch.
- The 100-question MCQ bank and eight diagram exercises retain valid course-source links and reviewed semantic keys.
- Correct diagrams and AI evaluations obey feedback/reveal rules; uncertainty and unavailable services are handled visibly.
- Cheat-sheet content stays within a fixed-size Letter page; low-score suggestions respect reveal timing, user choice, and capacity.
- Partial-credit scores retain exact correctness and policy versions; immediate sample-exam advancement saves once and keeps final submission explicit.
- ATM/airline teaching matches the reviewed source pages and clearly distinguishes the requested redraw from handwritten source-arrow directions.
- Existing MVP regressions plus new schema/migration, account isolation, sync, AI evaluation, accessibility, mobile, offline, and production-build checks pass.
- Update the product specification, source map, README, and implementation record to reflect the new account/AI behavior. Preserve the original MVP completion history.

## Scope decisions for implementation

Confirmed: synced accounts and required confidence. Proposed defaults still open to adjustment: 100 MCQs, eight diagram exercises, 20-item sessions, 70% practice target, and a three-second cancelable auto-advance delay. These are implementation defaults, not exam facts. Authentication/database/AI providers and exact operating costs remain selections for the implementation stage.

October 8 delivered additions: F24 partial credit with a versioned deduction formula and authored single-answer weights; F25 immediate advancement as the new-session mock default with manual/countdown alternatives; F26 source-grounded diagram teaching. Existing practice countdown behavior and historical scoring are preserved.

## Delivered subset — October 6

Save/resume, fixed queues, progress counts/bar, 100 MCQs (20 select-all), exact-set scoring, red incorrect feedback, live practice accuracy/target, cancelable auto-advance, required locked confidence, and expanded acronyms are implemented. Existing data migrates to browser-local storage v2. Tooltips, Towson colors, 29 precise textbook section/index mappings, semantic arrowheads/direction cues, and side-by-side correct-diagram review are also complete. The account/sync, AI, extra-diagram-exercise, and online-quiz features above are still future work; the entire feature inventory is not marked complete. See the implementation record for validation and operating limits.

October 8 recommendation items **4 and 5** are delivered: F22–F23 add the one-page reference editor and revealed-low-score suggestions; F03 adds response-based trends and confidence calibration. Storage v4 preserves v0–v3 history, exports/imports sheet and decisions, and backs up the original data. No account, runtime AI, database, dependency, or deployment was added. Structural refactoring remains deferred.
