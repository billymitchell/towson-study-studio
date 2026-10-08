# Partial credit, sample-exam navigation, and diagram teaching

Requested October 8, 2026. **Implemented after the user authorized features 1, 2, and 3.** Extends the backlog with F24–F26. App changes are local; no deployment was performed.

## F24 — Partial credit on multiple-choice questions

**Requirement:** award partial credit for partially correct multiple-choice responses and explain how the points were earned. Support ordinary practice and the sample/mock exam.

Before this update, both single-answer and select-all questions used binary exact-set scoring in `src/lib/questions.ts`. The delivered implementation distinguishes exact correctness from fractional points and preserves the old policy for existing sessions.

### Delivered scoring policy

- Add a saved session scoring policy (`exact` or `partial`) with a policy version. Default: partial credit for new sessions; retain exact scoring for existing sessions and historical attempts.
- For select-all items, normalized points are `max(0, correctlySelected / totalCorrect - incorrectlySelected / totalIncorrect)`. Clamp to 0–1. Omitting a correct option reduces credit; selecting an incorrect option reduces credit. Selecting every option earns zero, and a response earns full credit only when the selected set exactly matches the key.
- Example with two correct and two incorrect options: one correct selection earns 50%; both correct selections earn 100%; both correct plus one incorrect earn 50%; all four options earn 0%.
- For single-answer questions, allow explicit source-reviewed per-choice credit when a distractor demonstrates partial understanding. The correct answer earns 100%; authored partial-credit weights must be strictly between 0% and 100%; wrong options without an authored partial-credit rationale earn 0%. Do not invent fractional weights from learner confidence or arbitrary similarity. Review and version each changed question key before enabling its weights.
- The formula, default mode, and individual choice weights are app practice policies, not professor-assigned grading rules. Show the selected policy and rationale in the app.

### Development todos and acceptance

- [x] Separate exact correctness from earned points in scoring, feedback, attempts, session summaries, mastery, missed queues, and future trends. Show **Partially correct — X% credit** for qualifying responses; keep exact-answer accuracy available separately from mean earned points.
- [x] Add validated authored choice weights and explanations where appropriate, plus content/scoring versions. Preserve immutable submitted responses and confidence.
- [x] Persist the scoring policy with session snapshots and attempts. Migrate existing data without recalculating previous scores; include the new fields in export/import and reload recovery.
- [x] Apply the same policy in practice and final mock review. During an unfinished mock, hide points, answer keys, and per-option explanations.
- [x] Document how fractional scores affect the existing below-2/3 missed queue, mastery, practice target, and F23 note suggestions. These remain study settings, not an exam-grade prediction.
- [x] Verify exact matches, omissions, incorrect selections, select-everything, fractional single-answer weights, rounding, invalid weights, historical results, reloads, and mock reveal timing.

## F25 — Auto-advance on sample-exam question submit

**Requirement:** submitting a sample/mock exam question automatically moves to the next question.

Before this update, mock items used a three-second cancelable countdown. New mocks now navigate immediately after a successful save; countdown and manual settings remain available.

### Development todos and acceptance

- [x] Add a persisted mock navigation setting with immediate advancement as the default for new sample exams. Offer manual/countdown alternatives for learners who need them; preserve settings in existing sessions.
- [x] Require a valid response and explicit confidence, save the submission and new position, then advance once. Failed validation or storage writes preserve the draft and current question; retries must not duplicate attempts or skip questions.
- [x] Apply submission-based advancement to MCQs, short answers, cases, and diagrams. Written answers do not wait for self-assessment during a mock; grading remains part of the final review.
- [x] Keep correctness, scores, explanations, diagram solutions, and low-score note suggestions hidden until explicit final exam submission.
- [x] On the last question, save and show the completion/final-submit controls. Never finish the entire exam or reveal answers automatically.
- [x] Focus and announce the next question. Verify keyboard/touch behavior, setting persistence, reload recovery, all question formats, previous-item navigation, double submits, last-question behavior, and failed writes.

## F26 — Understand sequence diagrams versus use-case diagrams

**Requirement:** teach the difference using the supplied ATM withdrawal sequence solution and Airline Support System use-case solution. Include readable diagrams, explanations, an accessible text equivalent, guided walkthroughs, and short comprehension checks in the study guide.

Both source PDFs were rendered and visually inspected on October 8; each has one image-based page with no extractable text:

- `Sequence diagram class activity solution.pdf`, PDF page 1.
- `Use Case Diagram class activity solution.pdf`, PDF page 1.

This is an explicitly requested supplementary teaching feature. The professor's existing midterm blueprint still establishes assessed scope. Do not imply that sequence diagrams are confirmed exam questions or silently introduce a sequence-diagram editor/grader; that would require a separate feature scope.

### Comparison to teach

| Dimension | Use-case diagram | Sequence diagram |
|---|---|---|
| Main question | Who uses the system, and which goals/services does it support? | Who sends which message to whom, and in what order, during one scenario? |
| Main elements | Actors, system boundary, use-case ovals, associations, include/extend/generalization | Participants, lifelines, activation bars, messages, returns, guarded alternative fragments |
| Time | Connections describe participation and relationships; they do not establish chronological order | Read messages from top to bottom to follow the interaction order |
| Level of detail | Overview of system capabilities and external roles | Detailed realization of one interaction, including alternative outcomes |
| Requested example | Airline Support System: check in, check baggage, boarding, change flight | ATM withdrawal: client, ATM, and bank system exchanging messages |

Include a bridge explanation: a hypothetical ATM use-case overview could name **Withdraw cash**, while the supplied sequence diagram shows a particular withdrawal interaction. Label that bridge as an app-authored comparison, not another supplied solution.

### ATM withdrawal — source-grounded walkthrough

Use the source labels **Client**, **: ATM**, and **bankSystem : BankSystem** and explain that the client is the user, the ATM coordinates the interaction, and the bank system is another participant.

1. Client → ATM: insert a card.
2. ATM → itself: verify the card.
3. Client → ATM: enter the card PIN (personal identification number).
4. ATM → itself: check the PIN.
5. Client → ATM: choose the amount to withdraw.
6. ATM → BankSystem: check funds in the client's account for `requestedAmount`.
7. Explain the source's `alt` fragment as alternative paths with guards:
   - **Transaction approved:** bank returns permission; ATM gives money and returns the card.
   - **Transaction rejected:** bank returns rejection; ATM displays rejection details and returns the card.
   - **Card blocked:** bank returns a blocked-card response; ATM keeps the card and displays blocking information.

Annotate the vertical lifelines, activation bars, self-calls, solid message arrows, dashed returns, and branch guards. The branches are alternatives, not three successive steps. Preserve the source's ordering and distinguish an annotated redraw from the original image.

### Airline Support System — requested model

Place use cases inside an **Airline Support System** boundary and these actors outside it:

| Actor | Requested role / associations |
|---|---|
| Passenger | Check in, check baggage, receive an issued boarding pass, boarding, and change flight. Include participation in security check as shown in the source. |
| Check-in representative | Check in and issue boarding pass; retain the source's participation in check baggage and change flight in the source walkthrough. |
| Baggage management system | External system participating in check baggage. Explain that actors can be systems as well as people. |
| TSA (Transportation Security Administration) | Participates in security check. |

Requested use cases and relationships:

- **Check in** has **Mobile check in**, **Online check in**, and **Terminal check in** variants. Show use-case generalization with hollow triangles from each variant toward **Check in**, following the source; they are alternatives, not three mandatory includes.
- Passenger is associated with **Check in**, **Check baggage**, **Issue boarding pass**, **Boarding**, and **Change flight**; check-in representative is associated with **Issue boarding pass** and **Check in**.
- **Check in → Issue boarding pass** is an `«include»` relationship: issuing the pass is included in check-in, as requested.
- **Issue boarding pass → Security check** is an `«include»` relationship: security check is included in issuing the pass, as requested. TSA is associated with **Security check**.
- Preserve **Boarding** and **Change flight** as passenger goals. The source also shows **Boarding → Issue boarding pass** as an include; explain it in the source walkthrough, without interpreting it as a chronological arrow.
- Use ordinary undirected actor associations. An include arrow points from the including use case to the included use case; a generalization triangle points toward the general use case. Include means required reused behavior under the modeled scenario, not simply “this happens next.”

### Source-versus-request reconciliation

The handwritten source's arrows visibly point **Issue boarding pass → Check in** and **Security check → Issue boarding pass**, whereas the user's requested inclusion semantics imply **Check in → Issue boarding pass** and **Issue boarding pass → Security check**. Preserve both facts in the teaching design:

- Show/link the original instructor solution without silently editing it.
- Provide an annotated, app-authored redraw of the user's requested model using the directions specified above.
- Explain the two direction differences beside the diagrams and in their text equivalents; do not attribute the revised relationships to the instructor or penalize an answer solely for matching the original without explaining the distinction.
- Treat the airline relationships as assumptions of this class exercise. Do not claim that the example describes actual airline/TSA operational requirements.

### Development todos and acceptance

- [x] Add this comparison to the study guide, linking from the modeling and use-case topics. Keep instructional examples available independently of hidden mock answer solutions.
- [x] Register page-specific class-activity citations in validated runtime content when implementing; ship/link the referenced PDFs and include offline source behavior. Registered IDs: `ACT-SEQ-P1` and `ACT-UC-P1` (registered in runtime source content).
- [x] Render the ATM sequence accurately and the airline source plus requested-model annotations legibly on desktop and mobile, with zoom and accessible text descriptions.
- [x] Add guided highlighting for actors/use cases versus participants/messages, message ordering, ATM branches, mobile/online/terminal generalization, and include direction.
- [x] Add comprehension checks: choose the diagram for a question, order ATM messages, identify alternative outcomes, distinguish an actor from a use case, and interpret include/generalization without treating them as time order.
- [x] Review factual/source fidelity, arrow types/directions, acronym expansions, mobile readability, keyboard access, offline links, and separation from mock-answer reveal rules.

## Delivery and estimates

F24–F26 were delivered together, with domain and browser regression coverage. F19 additional graded exercises remains separate future work. No accounts or runtime AI are needed. Engineering token usage was not metered; the older full-plan token totals do not include F24–F26. The single-answer bank currently has one source-reviewed half-credit distractor; all unannotated wrong options still earn zero.
