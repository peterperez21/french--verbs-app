//In your JavaScript (The Engine)
//Your generateSentence function needs a "Reflexive Check." If verb.reflexive === true, it must fetch the correct pronoun from the map and inject it into the {pre_verb_particles} slot.

// Inside your generator
let particles = "";
if (verb.reflexive) {
  const pronoun = functional_schema.reflexive_logic.pronoun_map[subjectKey];
  particles += pronoun + " ";
}
if (isNegative) {
  particles += "ne ";
}

// Result for "Tu" + "se laver" + negative:
// "{pre_verb_particles}" becomes "te ne" -> (Elision) -> "te n'"
