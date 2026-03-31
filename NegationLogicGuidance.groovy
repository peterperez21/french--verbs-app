Negation in French is famously a "sandwich"—the two parts of the negation wrap around the verbal element. For a developer, the challenge isn't the words themselves, but **where the "bread" (the negation markers) is placed** based on the tense and mood provided by your Verb Schema.

Here is the high-level **Negation Logic** for your Sentence Schema.

---

### 1. The Negation Components

You have the "Anchor" (*Ne*) and the "Qualifier" (the part that changes the meaning).

| Qualifier | Meaning | CEFR Level |
| --- | --- | --- |
| **Pas** | Not | A1 |
| **Plus** | No more / No longer | A2 |
| **Jamais** | Never | A2 |
| **Rien** | Nothing | B1 |
| **Personne** | Nobody | B1 |
| **Que** | Only (Restrictive) | B2 |

---

### 2. The Placement Rules (The "Sandwich" Logic)

The placement of the qualifier changes depending on whether the verb is **Simple** or **Compound**.

#### A. Simple Tenses (Présent, Imparfait, Futur Simple)

The negation wraps around the single conjugated verb.

* **Formula:** `Subject` + `ne` + `Verb` + `Qualifier`
* *Example:* Je **ne** mange **pas**.

#### B. Compound Tenses (Passé Composé, Plus-que-parfait, etc.)

The negation wraps around the **Auxiliary verb**, not the past participle.

* **Formula:** `Subject` + `ne` + `Auxiliary` + `Qualifier` + `Past Participle`
* *Example:* Je **n'**ai **pas** mangé.

#### C. Dual-Verb Structures (Futur Proche, Modal Verbs)

The negation wraps around the **conjugated verb** (the "go" or "want" part), leaving the infinitive outside.

* **Formula:** `Subject` + `ne` + `Conjugated Verb` + `Qualifier` + `Infinitive`
* *Example:* Je **ne** vais **pas** manger. (I am not going to eat).

#### D. The Infinitive Exception

When the verb is in the infinitive (often after "to" or "for"), the sandwich collapses. Both parts of the negation move to the **front**.

* **Formula:** `ne` + `pas` + `Infinitive`
* *Example:* Merci de **ne pas** fumer. (Thank you for **not** smoking).

---

### 3. The "Personne" & "Rien" Logic (B1-B2)

At the intermediate level, your schema needs a "Special Case" for *Personne* and *Rien* because they can act as the **Subject** of the sentence.

* **As Object:** *Je ne vois **personne**.* (Standard sandwich)
* **As Subject:** ***Personne** ne me voit.* (The qualifier starts the sentence).

---

### 4. Logic Constraints for your App

* **Vowel Elision:** If the verb starts with a vowel, `ne` must become `n'`.
* **Slider Impact (A1):** The app only generates `ne...pas`.
* **Slider Impact (B1+):** The app starts using `ne...plus` or `ne...jamais` and accounts for the Infinitive Exception.

### Next Step in the Schema

Negation is relatively "fixed," but it gets interesting when you add **Pronouns** into the mix. The pronouns like to squeeze inside the sandwich (*Je **ne le** vois **pas***).

Would you like to map out the **Pronoun Placement** logic next, or move on to the **Interrogative Logic**?