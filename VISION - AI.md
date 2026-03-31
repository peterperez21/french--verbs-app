# The AI-generated Problem Statement
The core issue you are facing is the common language-learning gap between passive recognition and active production. While your current study routine—such as podcasts and graded readers—has successfully built your ability to understand rules and recognize conjugations when reading or listening (A2 level), it fundamentally lacks high-frequency production practice.

As a result, your "retrieval" phase is slow, causing you to stutter when trying to retrieve forms fluently under the time pressure of speaking or writing. You might only see a specific conjugation 3–5 times a week, but moving from simple recognition to a permanent fixture in your active "toolkit" requires 50–100 recalls. A dedicated app is the ideal solution to bridge this gap, easily providing the targeted, high-volume production practice necessary to produce conjugations on demand.

# The Solution Proposal

To move from A2 toward B1/B2 and actually feel comfortable talking, your app needs to shift from testing knowledge to automating production. Since you want to move from just recognizing a form to having it in your "toolkit," the app needs to bridge the gap between a grammar worksheet and a real-time conversation. The app should be a verb conjugation drilling tool built on spaced repetition.

What it should NOT do: It shouldn't be a quiz where you just recognize the right answer from options — that feels good but doesn't build the production muscle you need. And it shouldn't try to teach you new grammar; that's your teacher's job. This app's only job is cementing what you've already been introduced to.

# App Ideas
## Context and Real-Life Situations

Here is a synthesized version that combines these concepts into one single, cohesive, and practical idea that would work for any user of the app.

### Concept: Context-Driven Scenario Drills

**The Core Idea:** 
Move away from traditional, isolated verb tables (e.g., just conjugating *aller* or *manger / nous*) by anchoring every drill in a practical, real-world context. Instead of asking the user to solve a math-like grammar problem, the app presents a "mini situation" that forces the user to map the conjugation directly to a functional communication need.

**Why it Works:** 
When speaking in real life, you don't think in pronouns and infinitive verbs; you think about the thought you want to express in a specific environment. This approach bridges the gap between rote memorization and actual fluency by shifting the brain from "How do I conjugate this?" to "How do I communicate my need right now?"

**What it Looks Like in Practice:**
Every drill card is built around a functional "Survival Situation" (e.g., at a bakery, navigating a train station, small talk). The app provides the setting first, framing the grammar as the tool needed to solve the interaction.

**Example Card Format:**
*   **The Scenario:** You are at a bakery.
*   **The Building Blocks:** Subject: *je* | Verb: *vouloir* | Tense: *conditionnel*
*   **The Functional Fragment (The Drill):** Je ______ un croissant.
*   **The Answer:** *voudrais*

**Scenarios** 
Including, but not limited to:
Shopping, restaurants, train stations, visiting family (adults and kids), playground with kids, small talk, etc.

## Spaced Repetition & Error Tracking

### Concept: Spaced Repetition (FSRS) & Error Tracking

**The Core Idea:** 
To move verbs from short-term to long-term memory, the app implements a Spaced Repetition System (SRS) powered by the FSRS algorithm (Anki style) to track your unique "forgetting curve." A single worksheet isn't enough to cement a rule; instead, the app resurfaces conjugations right before you are likely to forget them, ensuring your entire "toolkit" stays sharp over time.

**The "Recycling" Engine in Practice:** 
The app eliminates multiple-choice questions, instead prompting you to actively produce conjugations from scratch (typed or spoken) under time pressure. In short daily sessions (e.g., 10 minutes a day), you are given micro-sentence production contexts:

*   **Prompt:** Subject: *je* | Verb: *aller* | Tense: *futur proche* | Situation: *tomorrow*
*   **User produces:** *je vais aller*

After you answer, the app checks your submission and you rate the difficulty. The FSRS algorithm then schedules your next review—if you easily get *nous faisons* right today, it might hide it for 4 days; if you struggle, you'll see it again tomorrow. Cards should be organized by the tenses and verbs your teacher introduces to reinforce your curriculum.

**Error Tracking & Targeted Review:** 
The app maintains a detailed profile of your weak spots, distinguishing your accuracy across specific person/tense combinations (e.g., *aller* in the *imparfait* at 40% vs. *prendre* in the *présent* at 90%). It uses this data to heavily target the forms you struggle with the most, efficiently bridging the gap between classroom learning and long-term fluency.

## Active Production Under Pressure

### Core Feature: "Mode Pression" (Conjugation Under Pressure)
To bridge the gap between knowing grammar rules and conversational fluency, the app trains instant verb retrieval using a "Pressure Cooker" mechanic. By forcing users to retrieve conjugations within a tight time window, the app builds "speech brain" rather than "homework brain."

**Feature Mechanics:**
1. **The Timer Bar**: Every question features a visual 4-second progress bar (shrinking from green to red, acting like a burning fuse).
2. **Strict Production**: No multiple-choice questions. Users must actively type the correctly conjugated verb out of thin air.
3. **Muscle Memory on Failure**: If the timer runs out or the user answers incorrectly, the correct answer is revealed and the FSRS algorithm scores it as a failure. Crucially, the user is then *forced* to physically type the correct answer into the input field before they can proceed to the next question. This physical action builds the muscle memory of producing the right word.
4. **Typing Leniency**: To accommodate fine motor delays without compromising strict timing, the timer grants a 1-second hidden grace period if the user is actively typing when the clock hits zero.
5. **Default State**: "Mode Pression" is the default way to practice, though it can be toggled off or the timer duration adjusted in the setup configuration for gentle, initial learning of a new tense.

## Core Feature: Vocabulary Curriculum Tracks (80/20 Rule)

To accelerate practical fluency, the app organizes verbs not by grammatical endings (e.g., `-Er` vs `-Ir`), but by conversational frequency and utility. 

**Feature Mechanics:**
1. **Frequency-First Tiers**: Verbs are grouped into practical, freely selectable Curriculum Tracks:
   - *Tier 1 (The Core 20)*: The absolute essential survival verbs (*être, avoir, faire, aller, dire...*).
   - *Tier 2 (Everyday 50)*: The next layer of vital conversational verbs.
   - *Tier 3 (All Verbs)*: The complete database for advanced practice.
2. **Decoupled Grammar & Vocabulary**: The CEFR slider strictly controls the grammatical complexity (tenses and sentence structures, ranging from the *Présent* to the *Subjonctif*), while the selected Tier controls the vocabulary. This allows B2 learners to practice complex, nuanced grammar using simple "Survival" verbs, perfectly mirroring realistic conversational scenarios.
3. **Self-Paced Progression**: While the Tiers are visually sorted to show progression and encourage users to build their foundation first, they remain freely selectable. Mastery percentages are displayed next to each button to indicate "leveling up" without artificially gamifying or aggressively locking content.

## Core Feature: Audio-Visual Integration

To unfreeze you in conversation, the app must glue the sound of the word to the spelling. We achieve this by focusing heavily on Audio-Playback rather than unreliable Speech Recognition.

**Feature Mechanics:**
1. **Zero-Friction TTS Engine**: Instead of requiring thousands of expensive, pre-recorded audio clips, the app hooks directly into the browser's native `SpeechSynthesis` API. This instantly provides highly accurate French pronunciation dynamically, with zero backend dependency.
2. **The Audio-Visual Loop**: The moment you submit a correct answer, the browser immediately reads the fully assembled French sentence aloud. This ensures you hear the correct pronunciation of the conjugation in context *every single time* you successfully pull it from memory, solving the issue of freezing when it's time to speak.
3. **Auditory "Call and Response" Drills**: Instead of building a separate, isolated mode, auditory training is built directly into the core Spaced Repetition loop. Specific cards are formatted as a "Question Transformation" (i.e., the prompt is an audio question: *"Tu manges une pomme ?"*; you must type the response). The TTS automatically reads the prompt when the card appears, forcing you to rely on listening comprehension while under the pressure of the timer.

## Core Architecture: Community, Engineering & Sustainability

To keep the application highly sustainable and free to host, the engineering architecture avoids backend complexity while still providing a robust experience for general users.

**Feature Mechanics:**
1. **Zero-Cost Sustainability (Local Storage)**: The app has no backend database, no user accounts, and no authentication. FSRS progress (the "forgetting curve" data) is saved securely and entirely within the user's browser `localStorage`. This guarantees 100% free static hosting (e.g., via GitHub Pages or Vercel) forever. Progress is intentionally tied to a single device/browser to avoid complex syncing architecture.
2. **Open-Source Scenarios**: To source the vast B2-level "Situations" needed (e.g., "Office Culture" vs. "Bakery"), the app will not feature an in-app contribution UI. Instead, the grammar banks (`sentence_schema.json`) will remain open-source. French speakers who want to contribute new Scenario Packs can simply submit a Pull Request to the GitHub repository.
3. **Frictionless Onboarding**: Rather than overwhelming new users with an exhaustive multi-page wizard to build a curriculum, the app's visual Configuration Dashboard serves as the onboarding. The CEFR grammar slider paired with the Vocabulary Tiers allows users to intelligently and immediately self-select their starting point.

## App Structure: Advanced Mechanics & Personalization

To maximize the efficiency of short, 5-minute daily sessions, the app consolidates complex mechanics into a single, seamless interaction loop.

**Feature Mechanics:**
1. **Unified Spaced Repetition Flow**: Instead of fragmenting the app into separate menus (Speed Drills, Context, Speaking, Mini-Conversations), all learning formats are unified into the core flashcard pool. A user might receive a single-sentence speed drill, followed immediately by an auditory question, followed by a two-line "Conversation Builder" dialogue. This streamlined UX guarantees a productive 5-minute session without the user having to manage their own time or switch modes.
2. **Algorithmic Personalization (Zero Busywork)**: The app completely avoids manual curation features (like tagging verbs studied in class or building manual "Weak Spot" lists). Instead, the FSRS algorithm handles 100% of personalization invisibly. It inherently targets and surfaces the exact person/tense combinations the user struggles with the most. Users simply select their target Curriculum Tier, and the app automatically adapts to their individual learning curve.
3. **Fuzzy Matching Coaching**: To prevent the frustration of strict grading on French's notoriously subtle silent endings (e.g., typing *mangeait* instead of *mangeaient*), the app utilizes a "Fuzzy Match" system. If a user correctly conjugates the stem and tense but misses a silent plural agreement, the app detects the proximity error. Instead of harshly penalizing the user with an FSRS failure, it displays an intelligent coaching tooltip (e.g., "Careful: The subject is Plural"), transforming a sterile test into an active tutor.