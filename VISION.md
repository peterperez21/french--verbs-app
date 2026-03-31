# Vision: Maîtrise des Verbes Français

> This document describes what the app is for, who it serves, and the key product and design decisions that should stay true even as the implementation evolves.

---

## 1. Purpose and audience

- **Your context:** You are learning French to communicate with your French nephews, navigate independently in France, and potentially work there. Your current level is A2. The app is being built for you first and then shared with others.
- **Target users:** French learners at **CEFR A1–B2**. When we evaluate features or UX, we consider the needs of beginners (A1) through independent users (B2), not only your current level.
- **Ultimate goal for learners:** **Acquire and maintain recall of conjugations in order to support real conversations in French.** Success is measured by whether users can recall and apply verb forms spontaneously in family, travel, and professional contexts—not only by scores inside the app.
- **Principle to encode:** Make it easy for A1–B2 learners to move from **drill** to **spoken sentence**. Prefer contextualised practice (full sentences, negation, questions) over isolated forms whenever possible.
- **Simplicity of Choice:** Keep the burden of choice small so learners can focus on practicing. The user is only asked to make 3 decisions: CEFR level, verb endings, and sentence type. The CEFR level acts as a powerful lever that hides the complexity of many other elements such as tense and mood.

---

## 2. What the app is (elevator pitch)

This is a French verb conjugation practice app that drills **conjugations in context**. Each question presents a short sentence shell (affirmative, negative, or interrogative) and asks the learner to supply the correct conjugated form.

The learner controls:

- **CEFR level** via a slider (A1–B2), which determines which tenses, moods, and sentence patterns are available.
- **Verb groups** (e.g. `-er`, regular `-ir`, irregular `-ir`, `-re`, `-oir`, full irregulars) through multi-select filters.
- **Sentence types** (affirmative, negative, question) through multi-select filters.

Behind the scenes, the app:

- Uses structured JSON schemas for verbs, tenses, sentence patterns, endings, and nouns.
- Builds sentences dynamically using those schemas and a conjugation engine.
- Tracks learner performance with a spaced-repetition style model (FSRS-like) stored locally in the browser.
- Adapts question selection to blend **new** material and **due** reviews.

The current version is a **single-page web app** (HTML/CSS/JS) with **localStorage-based progress** and no authentication. It is designed to be used for free and shared with teachers and other learners.

---

## 3. Core design principles

These principles should guide future changes and refactors.

- **3.1 CEFR as the primary filter**
  - **The Objective (Cognitive load management):** If an A1 learner is spending 90% of their brainpower trying to understand a complex B2 noun or syntax structure, they have no cognitive bandwidth left for the actual task: conjugating the verb. CEFR filtering isolates the difficulty purely to the verb.
  - The CEFR level slider is the **top-level constraint** on content.
  - It determines which tenses, moods, and negation patterns are allowed by pruning the functional and sentence schemas.
  - Verb group filters and sentence-type filters operate **within** what CEFR has already allowed.

- **3.2 Conjugation in context**
  - **The Objective (Bridging the gap):** To move from declarative knowledge (reciting a verb table) to procedural knowledge (using it in real-time speech). By wrapping the verb in a sentence, we train the brain's parsing pathways simultaneously with its conjugation pathways.
  - Practice is centered on **full sentences**, not decontextualized verb tables.
  - Negatives and questions are first-class: learners should encounter all three modes (affirmative, negative, interrogative) early and often, with difficulty scaled by CEFR.
  - Whenever possible, use CEFR-appropriate nouns and situations that map to real-life interactions (family, travel, work).

- **3.3 Mastery and SRS behavior**
  - **The Objective (Emotional resilience):** Adult learners frequently quit due to the demoralization of "losing" progress. "Polishing dust" reframes forgetting from "I am failing" to "I am maintaining."
  - Each verb–tense (and where relevant, person) combination can be tracked for performance.
  - **Mastery** is earned by a sequence of correct answers (e.g. five in a row) and is represented visually (5-dot bar, then a trophy metaphor).
  - **Trophies are never taken away.** Wrong answers increase “dust” and cause the SRS system to shorten the review interval; correct answers polish the trophy and lengthen the interval again.
  - The SRS implementation is allowed to improve over time, but it should always:
    - Respect prior stored data instead of resetting everything.
    - Support the emotional goal of “maintenance” rather than “losing all my progress.”

- **3.4 Data over UI**
  - **The Objective (Future-proofing):** By treating language as a structured dataset rather than hardcoded UI text, we leave the door open for future features (like generative AI audio, text-to-speech, or alternative testing modes) without rewriting the core application.
  - When in doubt, prefer **rich, extensible data structures** over fragile UI assumptions.
  - Example: store progress as an object (`{ stability, difficulty, last_seen, due }`) rather than a single number so you can layer more sophisticated SRS behavior later without rewriting data.
  - Design schemas so that adding verbs, tenses, or new sentence types rarely requires rewriting existing questions or code paths.

- **3.5 Accessible and mobile-friendly**
  - The app should be usable on both desktop and mobile with comfortable tap targets and readable text.
  - Interactions should be simple and forgiving for A1 learners: clear feedback, obvious next actions, and minimal clutter.

---

## 4. Nuances and Challenges to the Vision

We recognize that our approach has limitations that need to be actively mitigated:

- **The "Text-Input" Fallacy:** The goal is spoken sentences, but the app primarily tests typing/reading. We acknowledge that typing a conjugated verb uses different cognitive pathways than speaking it. Text input remains crucial for practice in public spaces (like a train), but we must seek ways to bridge to speech (e.g. spoken conjugation features).
- **The "Fill-in-the-Blank" Tunnel Vision:** Learners tend to "game" the system by scanning only for the subject pronoun and a temporal marker, ignoring the rest of the sentence. 
- **The SRS "Grind" Risk:** Pure spaced repetition can be highly efficient but boring. *Mitigation Idea: We need more varied context or "Conjugation Concordance Stories" to keep intrinsic motivation high.*
- **CEFR Rigidity vs. Natural Language:** Strict adherence to CEFR levels can result in sanitized, unnatural French, as native speakers use idiomatic structures even when speaking simply. *Mitigation Idea: Look for opportunities to introduce common idiomatic expressions that are easy to parse even at lower levels.*

---

## 5. Current state (as of early 2026)

This is a snapshot of what the app currently does. Update this section when you ship major changes.

- **In scope**
  - CEFR slider (A1–B2) that drives which tenses and negations are available via the functional and sentence schemas.
  - Verb group filter buttons for `-er`, regular/irregular `-ir`, `-re`, `-oir`, and full irregulars.
  - Sentence-type filter buttons for affirmative, negative, and questions.
  - A conjugation engine that:
    - Uses category-based stem and ending logic from the endings database.
    - Handles many irregular stems and full-irregular paradigms.
    - Supports reflexive verbs and compound tenses such as **passé composé**.
  - Sentence assembly logic that:
    - Builds affirmative, negative, and _est-ce que_ questions using `sentence_schema.json`.
    - Applies CEFR-aware negation logic (e.g. `ne...plus`, `ne...jamais`) with tenses to use/avoid.
    - Selects nouns from `nouns_db.json` by category and CEFR level.
  - Spaced-repetition style review (FSRS-inspired) that:
    - Stores per-item `stability`, `difficulty`, `last_seen`, and `due` in `localStorage` under the `french_mastery` key.
    - Balances new content with due reviews, with an “intensity” slider affecting how aggressively stability is penalized.
  - Light/dark theme toggle, with preference persisted across sessions.

- **Data files**
  - `verbs_db.json` – verb entries, including categories, translations, auxiliary verbs, stems, and metadata.
  - `verb_functional_schema.json` – moods, tenses, CEFR levels, and English equivalents.
  - `sentence_schema.json` – interrogative and negation logic, placement rules, and CEFR levels for sentence structures.
  - `verb_stems_and_endings_db.json` – stem overrides and ending groups by category/mood/tense.
  - `nouns_db.json` – noun choices grouped by semantic category and CEFR level.

---

## 6. Desired direction (roadmap)

This section summarizes the direction from existing task notes and guidance. For implementation details, see `Tasks.txt` and `Feature List.groovy`.

- **Near-term goals**
  - Round out content and behavior for the full A1–B2 range, including:
    - B2-level questions and tenses already planned in the functional schema.
    - A solid, gentle A1 experience (limited tenses, simpler negation and question forms).
  - Improve mobile friendliness: layout tuned for phones, tap-friendly buttons, legible text sizes.
  - Validate verb conjugation data and alignment between schemas (e.g. that every `verbId` used in logic has corresponding definitions).
  - Explore a CEFR mode toggle (cumulative vs discrete) and decide how it interacts with progress:
    - Cumulative: A higher level includes all lower-level content.
    - Discrete: Each level can be drilled in isolation.
    - Decide whether progress carries across modes or is tracked separately.

- **Medium-term goals**
  - Implement the visible mastery/trophy system on top of the existing FSRS data:
    - 5-dot mastery bar that turns into a trophy when a combination is mastered.
    - Dust levels on trophies based on retrievability, with clear learner messaging.
    - A “mastered verbs” or “strength overview” screen so learners (and teachers) can see what is solid.
  - Expand verb coverage and sentence variety by leveraging the schemas, rather than hardcoding examples.
  - Refine question-generation so the app can deliberately target weak spots (high difficulty, low stability, or long time since last seen).
  - **Spoken conjugation practice:** A mode focused on speaking the conjugations (using Web Speech API), without worrying about perfect pronunciation grading.
  - **Diagnostic Auto-Progression:** Instead of requiring the user to manually flip between cumulative and discrete CEFR modes to progress, build a system that dynamically advances the CEFR difficulty as stability across current-level verbs hits a threshold. (The user should ideally pick a *starting* CEFR level to avoid trudging through overly easy content).
  - **Alternative Testing Modes:**
    - **Self-Assessed Recall (The Anki Model):** Optionally allow the user to see a sentence with a blank, speak/think the answer, click "Reveal", and grade themselves (Hard, Good, Easy) for faster repetitions. (I don't know if I'm sold on this yet, but I'm leaving it in here so I can think on it.)
    - **Audio-First Prompts:** Provide dual audio/text versions of prompts, or audio-only prompts, so users must first comprehend the audio context to conjugate correctly.
  - Implement the visible mastery/trophy system on top of the existing FSRS data:
    - 5-dot mastery bar that turns into a trophy when a combination is mastered. (I'm not abandoning this yet, but I'm leaning toward just using the FSRS data directly.)
    - Dust levels on trophies based on retrievability, with clear learner messaging.
    - A “mastered verbs” or “strength overview” screen so learners (and teachers) can see what is solid.
  - Expand verb coverage and sentence variety by leveraging the schemas, rather than hardcoding examples.
  - Refine question-generation so the app can deliberately target weak spots (high difficulty, low stability, or long time since last seen).

- **Longer-term possibilities**
  - Static hosting and simple sharing (e.g. GitHub Pages, Netlify) so teachers can use the app with students.
  - A lightweight “share result” mechanism that copies a concise summary of recent performance for email or messaging.
  - Potential multi-device sync in the future (without committing yet to user accounts or paid support).
  - **Conjugation Concordance Stories:** A short, 3-sentence paragraph where the user has to conjugate multiple verbs to complete a mini-narrative. A powerful replacement for static dialogs to test narrative tenses (like Imparfait vs. Passé Composé).

- **Explicit open questions**
  - How exactly should progress behave when a learner frequently switches between CEFR levels or between cumulative and discrete modes?
  - Which additional sentence patterns (e.g. inversion questions) should be introduced at which levels, and how much complexity is appropriate for A1 vs B2?
  - How much explicit grammar explanation, if any, should be surfaced inside the app vs left to external teaching contexts?

---

## 7. Out of scope / non-goals (for now)

These are deliberately not part of the current vision. They can change later, but new features should not assume them.

- No backend, login system, or user accounts yet.
- No paid product or formal support obligations; the app is shared freely with teachers and learners.
- No C1/C2 content yet; keep focus on A1–B2.
- No heavy analytics or tracking beyond what is necessary for SRS and basic UX decisions.

---

## 8. How to use this document

- When starting a new feature or refactor, skim:
  - **Section 1–3** to check that the idea aligns with the purpose, audience, and core principles.
  - **Section 4–5** to see what already exists and what is planned.
- When working with an LLM or collaborator, ask them to read `VISION.md` plus any relevant schema or JavaScript file before coding.
- When your goals change (e.g. adding login, monetization, or C1 content), update this document so it remains a trustworthy source of truth.
