# Fall 2026 Midterm Source Map

This map is the source of truth for all study-guide concepts and practice questions. Cite source IDs in content records; do not cite an unlisted source. The midterm review defines scope and formats. Lecture PDFs define course content; matching HTML is an alternate representation of the same lecture. Textbook references clarify only the listed topics.

## Source IDs

| ID | Source | Locator / role |
|---|---|---|
| `MR-P1` | `Midterm review Fall 2026.pdf` | PDF page 1. Primary authority for scope and stated question formats. |
| `L1-Pn` | `Chp1 Introduction.pdf` | Replace `n` with PDF page number. `Chp1 Introduction.html` is an alternate representation. |
| `L2-Pn` | `Chp2 Software Process.pdf` | Replace `n` with PDF page number. `Chp2 Software Process.html` is an alternate representation. |
| `L3-Pn` | `Chp3 Agile Development 1.pdf` | Replace `n` with PDF page number. `Chp3 Agile Development 1.html` is an alternate representation. |
| `L4-Pn` | `Chp4 Requirements Engineering.pdf` | Replace `n` with PDF page number. `Chp4 Requirements Engineering.html` is an alternate representation. |
| `L5-Pn` | `Chp5 Architecture Design .pdf` | Preserve the trailing space before `.pdf` in the filename. `Chp5 Architecture Design .html` is an alternate representation. |
| `L6-Pn` | `Chp6 System Modelling.pdf` | Replace `n` with PDF page number. `Chp6 System Modelling.html` is an alternate representation. |
| `TB-1` | `Software Engineering - Ian Sommerville.pdf` | Ch. 1, printed pp. 19–30 (§§1.1–1.2); supplementary to Chapter 1 lectures. |
| `TB-2` | Same textbook PDF | Ch. 2, printed pp. 45–64 (§§2.1–2.3); supplementary to Chapter 2 lecture. |
| `TB-3` | Same textbook PDF | Ch. 3, printed pp. 75–91 (§§3.1–3.3); supplementary to Chapter 3 lecture. |
| `TB-4` | Same textbook PDF | Ch. 4, printed pp. 105–137 (§§4.1–4.6); supplementary to Chapter 4 lecture. |
| `TB-5` | Same textbook PDF | Ch. 5, printed pp. 141–148 (§§5.1–5.2); supplementary to Chapter 6 lecture. |
| `TB-6` | Same textbook PDF | Ch. 6, printed pp. 171–195 (§§6.1–6.4); supplementary to Chapter 5 lecture. |
| `TB-7` | Same textbook PDF | Ch. 7, §7.1, printed p. 198 onward; optional context for the lecture's object-oriented decomposition comparison only. |

The course lecture numbering and textbook chapter numbering diverge for modeling and architecture: course Chapter 5 is architecture (textbook Ch. 6); course Chapter 6 is system modeling (textbook Ch. 5). Use the course numbering in the app's topic hierarchy.

## Topic-to-source map

| Exam topic | Midterm review | Lecture | Textbook | Expected skill | Priority |
|---|---|---|---|---|---|
| Software definition and engineering scope | `MR-P1`, Ch. 1, short answers | `L1-P3–P5`, `L1-P11` | `TB-1` | Know definition; understand scope | MEDIUM |
| Four Ps: People, Product, Process, Project | `MR-P1`, Ch. 1, short answers | `L1-P14–P21` | `TB-1` background only | Know and explain; apply to project | HIGH |
| Software change and evolution | `MR-P1`, Ch. 1, short answers | `L1-P12`, `L1-P20` | `TB-1` | Understand evolution and cost implications | HIGH |
| Software engineering ethics | `MR-P1`, Ch. 1, short answers | `L1-P27–P29` | `TB-1` | Know responsibilities; apply to scenario | MEDIUM |
| Process activities and process description | `MR-P1`, Ch. 2, case study/MCQ/short answer | `L2-P3–P8`, `L2-P40` | `TB-2` | Understand and apply process concepts | HIGH |
| Plan-driven vs. agile | `MR-P1`, Ch. 2, case study/MCQ/short answer | `L2-P9–P10` | `TB-2`, `TB-3` | Compare and select with reasons | HIGH |
| Waterfall, incremental, reuse-oriented models | `MR-P1`, Ch. 2, case study/MCQ/short answer | `L2-P11–P34` | `TB-2` | Compare models; apply to scenario | HIGH |
| Coping with change and rework cost | `MR-P1`, Ch. 2, case study/MCQ/short answer | `L2-P57–P60` | `TB-2` | Apply change/rework concepts to case | CRITICAL |
| Agile principles | `MR-P1`, Ch. 3, MCQ/short answer | `L3-P8–P11` | `TB-3` | Know, explain, and apply principles | HIGH |
| XP practices and test-first development | `MR-P1`, Ch. 3, MCQ/short answer | `L3-P16–P24`, `L3-P34–P41` | `TB-3` | Identify practice and explain its purpose | HIGH |
| Scrum components and cycle | `MR-P1`, Ch. 3, MCQ/short answer | `L3-P41–P56` | `TB-3` | Know roles/artifacts/events; apply cycle | HIGH |
| User/system and functional/non-functional requirements | `MR-P1`, Ch. 4, case study/short answer; review explicitly emphasizes requirement types | `L4-P6–P15` | `TB-4` | Classify and justify requirements | CRITICAL |
| Elicitation, stakeholder issues, interviews | `MR-P1`, Ch. 4, case study/short answer | `L4-P18–P30` | `TB-4` | Apply elicitation methods to case | CRITICAL |
| Natural-language specification | `MR-P1`, Ch. 4, case study/short answer | `L4-P31–P36` | `TB-4` | Identify ambiguity; improve clarity | CRITICAL |
| Use-case template and diagram | `MR-P1`, Ch. 4, case study/short answer | `L4-P36–P45`; diagram-specific concepts in `L6-P16–P29` | `TB-4`, `TB-5` | Build and interpret specification/diagram | CRITICAL |
| Requirements validation and testing | `MR-P1`, Ch. 4, case study/short answer | `L4-P48–P57` | `TB-4` | Select checks/techniques; make requirements testable | CRITICAL |
| Requirements management planning | `MR-P1`, Ch. 4, case study/short answer | `L4-P96–P98` | `TB-4` | Explain identification, change, traceability, tools | HIGH |
| System/architectural views | `MR-P1`, Ch. 5, MCQ/short answer/true-false | `L5-P4–P19` | `TB-6` | Distinguish views and apply to concern | HIGH |
| Application architecture types | `MR-P1`, Ch. 5, MCQ/short answer/true-false | `L5-P47–P53` | `TB-6` | Classify architecture type and explain | HIGH |
| Functional vs. object-oriented design | `MR-P1`, Ch. 5, MCQ/short answer/true-false | `L5-P54–P59` | `TB-7` optional | Compare decomposition approaches | HIGH |
| System perspectives and context models | `MR-P1`, Ch. 6, case study/MCQ | `L6-P4–P7` | `TB-5` | Choose perspective; model system context/boundary | CRITICAL |
| Use-case diagrams | `MR-P1`, Ch. 6, case study/MCQ | `L6-P16–P34` | `TB-5` | Construct/interpret diagram from case | CRITICAL |

## Citation and provenance rules

- **Professor source:** transcribed or directly represented course content, with one or more `L*` IDs and (where relevant) the controlling `MR-P1` ID.
- **Source-derived:** an explanation, example, or practice item synthesized from cited lecture material. Retain lecture source IDs; textbook IDs may clarify but may not expand the scope.
- **AI-generated:** not needed for the initial content set. If introduced later, provide the relevant lecture source context before generation, label the output as AI-generated, and persist its source IDs and review status.
- Use PDF page locators for stable citation. The HTML copy may help inspect the same slide but is not a second independent source.
- The supplied class-activity solution PDFs (`Use Case Diagram class activity solution.pdf`, `Sequence diagram class activity solution.pdf`, and `Test First Developement Class Activity Solution.pdf`) are not required to establish exam scope. Consult them only if the instructor's exercise method is needed to clarify an already in-scope topic; do not use them to add topics.

## October 6 question-bank expansion

Added 63 original single-answer scenarios and 20 original select-all items, for 100 MCQs total across all 22 blueprint rows. Records retain the existing row’s lecture citations and `MR-P1`, with per-choice explanations, stable choice IDs, and version 1. New MCQ practice on a topic does not alter the professor’s listed formats or imply a numeric exam weighting. No outside or restricted question bank was imported. Acronym expansions clarify existing source-derived text without changing source identifiers. Precise textbook index/page mapping remains planned.

## Verified textbook section and index locators — October 6

The app now supplies supplementary reading for every one of the 22 blueprint rows, all 122 questions, three cases, and both diagram exercises. `src/content/textbookReadings.json` contains 29 verified section/index mappings; questions about refactoring, test-first development, pair programming, transactions, and language processing use narrower relevant subsections. Cases deduplicate readings across their linked concepts. The guide, blueprint, practice, and diagram review expose these references.

Verified source: Ian Sommerville, *Software Engineering*, tenth edition, Global Edition, 812 PDF pages. Original local file SHA-256: `cabeeeae791371a199f28372b0f4695a760877953333528f101e7f747988bd22`. Content validation checks this identity to prevent silently retaining locators after replacing the book. Each section start, printed/PDF range endpoint, and subject-index term was checked against the local text; representative source pages and index pages were rendered for visual review. The recorded main-body ranges use a verified printed-to-PDF difference of one page; the registry stores both values explicitly rather than calculating it in the UI.

Existing broad `TB-1`–`TB-7` source IDs are preserved and repaired to real PDF pages. Course lecture chapter 5 (architecture) corresponds to textbook chapter 6; lecture chapter 6 (modeling) corresponds to textbook chapter 5. The four Ps and the functional/object-oriented comparison retain explanatory notes distinguishing lecture terminology from supplemental book material. Include/extend/generalization teaching follows the lecture's notation, not an assumption that every textbook association must have an arrow.

| Blueprint row | Textbook section | Printed pages | PDF pages | Subject-index PDF page |
|---|---|---:|---:|---:|
| software | 1.1 · Professional software development | 19–23 | 20–24 | 797 |
| four-ps | 1.1.1 · Software engineering and product qualities | 21–24 | 22–25 | 797 |
| evolution | 2.2.4 · Software evolution | 60–61 | 61–62 | 785 |
| ethics | 1.2 · Software engineering ethics | 28–30 | 29–31 | 797 |
| activities | 2.2 · Process activities | 54–61 | 55–62 | 798 |
| plan-agile | 2.1 · Software process models | 45–47 | 46–48 | 791 |
| models | 2.1 · Software process models | 45–54 | 46–55 | 801 |
| change | 2.3 · Coping with change | 61–65 | 62–66 | 793 |
| principles | 3.1 · Agile methods | 75–77 | 76–78 | 778 |
| xp | 3.2 · Agile development techniques | 77–84 | 78–85 | 785 |
| xp | 3.2.2 · Refactoring | 80–81 | 81–82 | 793 |
| xp | 3.2.3 · Test-first development | 81–83 | 82–84 | 800 |
| xp | 3.2.4 · Pair programming | 83–84 | 84–85 | 791 |
| scrum | 3.3 · Agile project management | 84–87 | 85–88 | 796 |
| types | 4.1 · Functional and non-functional requirements | 105–111 | 106–112 | 794 |
| elicitation | 4.3 · Requirements elicitation | 112–120 | 113–121 | 794 |
| specification | 4.4.1–4.4.2 · Natural language and structured specifications | 121–124 | 122–125 | 794 |
| use-template | 4.4.3 · Use cases | 125–126 | 126–127 | 801 |
| validation | 4.5 · Requirements validation | 129–130 | 130–131 | 794 |
| management | 4.6.1–4.6.2 · Requirements management planning and change management | 132–134 | 133–135 | 794 |
| views | 6.2 · Architectural views | 173–175 | 174–176 | 779 |
| applications | 6.4 · Application architectures | 184–191 | 185–192 | 779 |
| applications | 6.4.1 · Transaction processing systems | 186–187 | 187–188 | 800 |
| applications | 6.4.3 · Language processing systems | 189–191 | 190–192 | 788 |
| decomposition | 7.1 · Object-oriented design using the UML | 198–199 | 199–200 | 790 |
| decomposition | 6.3.4 · Pipe and filter | 182–184 | 183–185 | 791 |
| context | Chapter introduction · System modeling perspectives | 139–140 | 140–141 | 799 |
| context | 5.1 · Context models | 141–144 | 142–145 | 782 |
| use-diagrams | 5.2.1 · Use case modeling | 144–146 | 145–147 | 801 |
