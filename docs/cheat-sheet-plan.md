# Bounded cheat-sheet reference — implemented

Requested October 6, 2026; implemented October 8, 2026 as recommendation item 4, feature rows F22–F23. **Complete. HIGH IMPACT.**

Let a learner curate the concepts they most need onto one printable 8.5 × 11-inch reference sheet. The user can add their own notes and accept suggested notes after low-scoring questions. Limited space and a fixed handwriting-sized font encourage choosing useful reminders.

## Confirmed requirements and implemented defaults

| Setting | Implemented behavior |
|---|---|
| Paper size | **8.5 × 11 inches**, with a hard one-page limit. |
| Orientation / sides | Portrait, one side. A second side is not included in the initial feature. |
| Font | Fixed **14-point** readable font, **20-point line height**. This is a handwriting-size proxy, not a claim that everyone's handwriting has one size. PDF verification confirms one Letter page at 14-point type; printed readability can be checked at actual size. |
| Margins | **0.5 inch** on each side, leaving a 7.5 × 10-inch content area. |
| Density | Fixed font, line spacing, margins, and block spacing. No shrink-to-fit, variable font sizes, or extra pages. |
| Content | Short editable text notes, headings, bullet lists, and acronym expansions. Freeform diagrams, images, rich formatting, and multiple sheets are later scope. |
| Recommendations | Suggest a note after a successfully saved, revealed answer with normalized score **below 2/3**, matching the existing missed-question threshold. |
| Persistence | Save notes, order, source/attempt links, and dismissed suggestions across reloads; include them in backup export/import. |
| Output | Printable single-page preview and browser Print / Save as PDF at Letter size and 100% scale, with browser headers/footers disabled. |

Font size, line height, margins, and single-sided orientation are the implemented defaults. The requested paper size, fixed handwriting-sized text, bounded space, editable content, and low-score suggestions are requirements.

## Learner flow

1. Open **Cheat sheet** from navigation. Show an empty Letter-page preview, remaining-space indicator, and Add note control.
2. Enter a concise note or heading. Preview its wrapping at the fixed size. Edit, reorder, or delete existing notes to make room.
3. After a low-scoring question, feedback offers **Suggested reference note** with the relevant correct concept, a brief reason for suggesting it, and course-source links. Offer **Edit and add**, **Dismiss**, or **Open sheet**. Recommendations never insert content automatically.
4. Show the proposed note's space cost before committing it. When full, preserve the current sheet and the proposed text; explain that the learner must shorten the note or remove another note. Rejected additions must not silently truncate text or erase saved notes.
5. Save and resume the sheet independently of the active study session. Print or save a single-page PDF matching the preview.

A qualifying undecided suggestion holds ordinary-practice auto-advance; opening or editing it persistently pauses the existing countdown so the question does not disappear during review. Dismissing a suggestion does not change the recorded answer, confidence, or score.

## Space enforcement

Use one logical page with physical dimensions and an identical layout for editor preview and print. A small-screen preview may scale visually; its logical page, font size, wrapping, and capacity must remain unchanged.

Measure the actual rendered notes, including wrapping, line breaks, headings, spacing, and optional title. A remaining-space bar reports used printable area. Word/character counts can be secondary guidance, but are not the capacity rule: different words and explicit newlines consume different space.

Check both vertical and horizontal fit after the font is ready and after every proposed add/edit/reorder, import, and print preparation. Handle long unbroken strings and pasted content consistently. Reject committing overflow, preserve the proposed edit for correction, and never hide overflow in the printed output. Use the same font and layout settings across supported devices; font loading failure must not silently change capacity.

Keep source/attempt metadata outside the printed content unless the learner explicitly includes a short source label. Printable headings and any labels consume space normally. Print verification must confirm one Letter page, fixed text size, no clipped notes, and no unexpected second page.

## Recommendation rules

- Use persisted evaluations, not unsaved selections or confidence alone. Incorrect single-answer/select-all items qualify; written self-scores 0 or 1 qualify; a score of 2/3 does not. Diagram results below 2/3 may suggest a textual reminder for a specifically missed criterion.
- Show a concise correct principle or misconception correction from the existing authored explanation/model/diagram criteria. Do not suggest copying the learner's incorrect response. Existing course content supplies candidates; no runtime AI service is required.
- Keep topic, item/content version, attempt/evaluation ID, source IDs, and whether the text is authored or user-edited. Let the learner inspect and edit the suggestion before adding it.
- Mock suggestions remain hidden until explicit final mock submission. Written items remain ineligible while their evaluation is pending. Neither the sheet page nor its suggestion list may reveal a mock answer early.
- Group repeated suggestions for the same concept; offer to review/update an existing note rather than creating duplicates. Prioritize repeated misses and high-confidence errors among qualifying items. A dismissed suggestion stays dismissed for that attempt; later mistakes may surface it again.
- Notes never auto-delete after improvement. The user decides which references deserve the limited space.

## Data and implementation sequence

1. Introduce versioned `ReferenceSheet` and `ReferenceNote` records plus per-attempt suggestion decisions. Store owner, page/layout version, ordered note IDs, text, optional topic/concept/source/attempt references, timestamps, and revision. Storage v4 preserves all existing v0–v3 data and retains original migration backups; validate imports against the same page limits.
2. Implement the fixed-layout editor, capacity validation, ordering, local persistence, and backup integration. Build browser print styles from the same layout. The initial sheet is browser-local; later accounts/sync must isolate and synchronize it with other owner records.
3. Connect suggestions to revealed saved evaluations in practice and completed mock review. Integrate Stay and review behavior, editable candidate text, deduplication, and dismissal state.
4. Verify editor, persistence/migration, print/PDF pagination, recommendation thresholds/reveal timing, accessibility, mobile scaling, and offline use. Add user-facing instructions and update the implementation record when delivered.

## Impact and projected token spend

Engineering-agent estimates; **k = 1,000 tokens**. These are planning ranges, not actual usage or spending authorization.

| Work | Impact | Estimated tokens |
|---|---|---:|
| F22: fixed-page editor, capacity, persistence/migration, export/import, printing | **HIGH IMPACT** | 12–20k |
| F23: low-score suggestions, editing, deduplication, reveal/auto-advance integration | **HIGH IMPACT** | 4–7k |
| Additional integrated verification beyond the existing QA estimate | Enabling | 2–4k |
| **Incremental total** | | **18–31k** |
| **With 20% contingency** | Rounded estimate | **22–38k** |

Runtime AI API token spend: **zero for this implementation**. AI summarization and graphical notes would require separate scope and estimates. Delivered using saved attempts and authored, source-linked explanations. Engineering-agent usage was not metered; the estimates above remain historical planning ranges.

## Acceptance criteria

- The user can add, edit, reorder, delete, save, reload, back up, and restore notes.
- Preview and printed/PDF output fit exactly one 8.5 × 11-inch page at the fixed configured size; overflow, bulk paste, long lines, and font readiness are tested. Printing does not reduce the font to fit more data.
- Rejected additions or edits preserve both the saved sheet and proposed text. Full-capacity suggestions remain editable without removing existing notes.
- Low-score suggestions use the correct explanation, respect the strict threshold and pending evaluations, and never appear before mock review is allowed.
- Repeat suggestions do not duplicate notes; dismissal survives reload; opening a suggestion pauses auto-advance.
- Capacity remains consistent on mobile and desktop, controls work with keyboard/touch, save failures preserve existing data, and offline editing/backup rules remain compatible with the app.

## Delivery verification

The fixed-layout editor, rendered capacity checks, per-response decisions, storage v4 migration, backup/import, offline font caching, and practice/completed-mock feedback integration are implemented. Browser verification covers note editing/reordering/deleting, whitespace retention, long-word wrapping, rejected overflow with draft recovery, font failure and recovery, backup restore, failed saves, thresholds and mock reveal, deduplication/dismissal, accessibility, mobile scaling, and offline use. Short and nearly full printed PDFs each contain exactly one 612 × 792-point Letter page with 14-point type and no clipped content. See [implementation-plan.md](implementation-plan.md) for integrated verification details.
