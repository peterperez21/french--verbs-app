[ ] Drill Configuration Controls
    [ ] CEFR Levels slider 
        - cumulative, from A1 to B2
        - filters all other (see below) verb/sentence parameters and sentence typed aligned with the selected level(s)
    [ ] Verb Group filter buttons (-er, -ir (r), -ir (i), -re, -oir, irregular)
        - multi-select
    [ ] Sentence Type filter buttons (Affirmative, Negative, Question)
        - multi-select
[ ] Questions
[ ] Mastery
    [ ] 5 button/badge Mastery
        - 5 in a row to earn "mastery" for a given X
        - 5 buttons turn to a "mastered" Trophy
    [ ] FSRS
        [ ] 5 x Mastery to SRS
        [ ] Mastery Trophy gets progressively dusty with time or incorrect answers
            [ ] App tells the user about this trophy behavior and that they will see the question again sooner when they get their first SRS answer wrong
        [ ] Dust Levels are reversed with correct answers, eventually returning to a shiny trophy

This is a brilliant refinement of the "Maintenance" logic. By moving to **FSRS (Free Spaced Repetition Scheduler)** and using the **"Dusty Trophy"** metaphor, you solve the emotional problem of "losing" progress while still enforcing the scientific need for review.

Here is your updated **System Behavior Audit** for the "Final" version of the app. This map ensures that when you or an LLM refactor the JS code, these behaviors stay intact.

---

### 1. The Mastery & SRS Logic Table

| State | Trigger | System Behavior | UI / Visual Change |
| --- | --- | --- | --- |
| **Learning** | User starts new verb/tense/person | Track `consecutive_correct` (count 0-5). | 5 clear buttons/dots. |
| **Gaining Mastery** | `consecutive_correct == 5` | Set `is_mastered = true`. Initialize FSRS parameters ($S$, $D$, $R$). | 5 dots merge/transform into a **Shiny Gold Trophy**. |
| **SRS Decay** | Time passes (per FSRS) | Retrievability ($R$) decreases. | Trophy gets **Dusty** (Level 1 $\rightarrow$ 5). |
| **SRS Success** | Correct answer during review | Update FSRS: Increase Stability ($S$). Recalculate next date. | Dust is removed; Trophy becomes **Shiny** again. |
| **SRS Failure** | Incorrect answer during review | Update FSRS: Decrease Stability ($S$), Increase Difficulty ($D$). | Trophy stays **Max Dusty**. App triggers the "Failure Script." |

---

### 2. The "Dusty Trophy" UX Workflow

The "Dust" is the visual representation of the **Retrievability ($R$)** score from the FSRS algorithm.

* **Shiny (R > 90%):** You just learned this or just reviewed it. You are highly likely to remember it.
* **Light Dust (R = 70-80%):** It’s been a few days. Time for a "maintenance" check.
* **Heavy Dust (R < 60%):** You are at risk of forgetting.
* **The Reset:** When they get an answer wrong, the app doesn't take the trophy away. It says:
> *"Your trophy for **-ir verbs (Vous)** is looking a bit neglected! To get it back to its former glory, we’re going to practice this more frequently for a while."*



---

### 3. FSRS Behavior (The "Maintenance" Engine)

For your B2-level app, the logic shouldn't just be "review every 4 days." It should follow the **FSRS principles** to be truly efficient:

1. **Stability ($S$):** How long the memory lasts. A correct answer *multiplies* $S$.
2. **Difficulty ($D$):** How "hard" this combo is for you. A wrong answer *increases* $D$.
3. **The Failure Loop:** If the user misses an SRS question, the FSRS logic **shrinks the interval significantly**. If they normally saw it every 10 days, they might now see it in 2 days.
* **Audit Check:** Ensure the code doesn't just set the date to "tomorrow," but uses the FSRS formula to find the new "Stability" point.



---

### 4. Updating the Data Structure

To support this without breaking the app, you need a **User Profile** (separate from your `verbs.json`) that tracks these specific metrics.

**Recommended `user_profile.json` structure:**

```json
"mastery_data": {
  "manger_pres_vous": {
    "consecutive_correct": 5,
    "is_mastered": true,
    "fsrs": {
      "stability": 15.2,
      "difficulty": 4.5,
      "last_review": "2026-02-26T09:00:00Z",
      "next_review": "2026-03-12T09:00:00Z"
    },
    "dust_level": 0 
  }
}

```

### 5. Why this protects your "Vibe-Coding"

When you audit the "Final" JS code, you can now specifically look for the **"Trophy Guardrail"**:

* Search the code for `is_mastered`.
* Ensure there is **no code** that sets `is_mastered = false`.
* If the LLM tries to write a function that deletes the trophy on a wrong answer, you can point to this map and say: *"No, the behavior is: Keep the trophy, increase the dust, and shorten the FSRS interval."*

**Would you like me to generate the "Failure Script" text that the app should display to the user when they hit that first SRS wrong answer?** This will help set the right encouraging tone for your A1-B2 learners.