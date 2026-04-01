function saveSettings() {
  const toSave = {
    ...globalData.settings,
    curriculumTiers: globalData.filters.curriculumTiers,
    sentenceTypes: globalData.filters.sentenceTypes
  };
  localStorage.setItem("french_settings", JSON.stringify(toSave));
}

const savedSettings = JSON.parse(localStorage.getItem("french_settings")) || {};

// --- Global State ---
let globalData = {
  verbs: {},
  functionalSchema: {},
  sentenceSchema: {},
  progress: JSON.parse(localStorage.getItem("french_mastery")) || {},
  filters: {
    curriculumTiers: savedSettings.curriculumTiers || ["tier_1"],
    sentenceTypes: savedSettings.sentenceTypes || ["affirmative"],
  },
  settings: {
    adaptive_mode: savedSettings.adaptive_mode !== undefined ? savedSettings.adaptive_mode : true,
    new_verb_ratio: savedSettings.new_verb_ratio !== undefined ? savedSettings.new_verb_ratio : 0.3,
    pressure_mode: savedSettings.pressure_mode !== undefined ? savedSettings.pressure_mode : true,
    timer_duration: savedSettings.timer_duration !== undefined ? savedSettings.timer_duration : 4000,
    cefr_level: savedSettings.cefr_level !== undefined ? savedSettings.cefr_level : 0,
    cached_mastery: savedSettings.cached_mastery || { "tier_1": "--", "tier_2": "--", "tier_3_all": "--" }
  },
};

let currentQ = null;
let timerInterval = null;
let timerEndTime = 0;
let timeIsUp = false;
let isAdvancing = false;
let typingLeniencyAdded = false;

let sessionState = {
  currentQ: 0,
  totalQ: 20,
  startMastery: {},
  memoriesStrengthened: 0
};

const CEFR_LEVELS = ["A1", "A2", "B1", "B2"];
const SCENARIO_MAP = {
  "food": "📍 À TABLE / NOURRITURE",
  "drink_desire": "📍 EXPRIMER UN SOUHAIT",
  "places_to_go": "📍 SE DÉPLACER / VOYAGE",
  "places_to_stay": "📍 RESTER SUR PLACE",
  "things_to_do": "📍 ACTIVITÉS / ACTIONS",
  "things_to_finish": "📍 TERMINER UNE TÂCHE",
  "things_to_say": "📍 COMMUNICATION",
  "things_to_ask": "📍 POSER UNE QUESTION",
  "things_to_know": "📍 SAVOIR / CONNAISSANCES",
  "things_to_see": "📍 OBSERVATION VISUELLE",
  "things_to_hear": "📍 ÉCOUTE / OUIE",
  "things_to_take": "📍 SAISIR / PRENDRE",
  "things_to_give": "📍 OFFRIR / ÉCHANGER",
  "things_to_put": "📍 PLACER DES OBJETS / S'HABILLER",
  "things_to_hold": "📍 TENIR / MAINTENIR",
  "things_to_wait_for": "📍 LA GESTION DU TEMPS",
  "things_to_believe": "📍 CROYANCES",
  "things_to_think": "📍 RÉFLEXION / OPINIONS",
  "things_to_love": "📍 PRÉFÉRENCES",
  "things_to_pass": "📍 PASSER LE TEMPS",
  "things_to_leave_behind": "📍 LAISSER SUR PLACE",
  "departures": "📍 DÉPARTS",
  "states": "📍 ÉTAT PHYSIQUE / MENTAL",
  "possessions": "📍 PROPRIÉTÉ / BESOINS",
  "actions_can_must": "📍 OBLIGATIONS / CAPACITÉS",
  "topics": "📍 SUJETS DE CONVERSATION",
  "hygiene": "📍 SOINS PERSONNELS"
};

// --- 1. Initialization ---
function syncUITheme() {
  const toggle = document.getElementById("toggle");
  if (!toggle) return;

  // If the 'dark-mode' class is present on the html element, check the box
  const isDark = document.documentElement.classList.contains("dark-mode");
  toggle.checked = isDark;
}

// --- 1. Initialization ---
function syncImmediateUIState() {
  syncUITheme();
  
  const cefrSlider = document.getElementById("cefr-level-slider");
  if (cefrSlider) cefrSlider.value = globalData.settings.cefr_level;

  const pressureToggle = document.getElementById("pressure-toggle");
  if (pressureToggle) {
    pressureToggle.checked = globalData.settings.pressure_mode;
    document.getElementById("timer-setting").style.display = globalData.settings.pressure_mode ? "block" : "none";
  }
  
  const timerSlider = document.getElementById("timer-slider");
  if (timerSlider) {
    const currentDur = globalData.settings.timer_duration / 1000;
    // Invert for display: dur of 10s -> slider value 2 (Left)
    timerSlider.value = 12 - currentDur;
    document.getElementById("timer-val").innerText = currentDur;
  }
  
  const revisionToggle = document.getElementById("revision-toggle");
  if (revisionToggle) {
    revisionToggle.checked = globalData.settings.adaptive_mode;
  }

  // Pre-fill button badges with cached percentages to prevent pop-in
  ["tier_1", "tier_2", "tier_3_all"].forEach(cat => {
    const badge = document.querySelector(`button[data-id="${cat}"] .mastery-badge`);
    if (badge) {
      const val = globalData.settings.cached_mastery[cat];
      badge.innerText = val !== "--" ? `${val}%` : "--%";
    }
  });

  // Visually highlight active buttons using cached filters
  updateFilterUI("type-filters", globalData.filters.curriculumTiers);
  updateFilterUI("question-type-filters", globalData.filters.sentenceTypes);
}

async function initApp() {
  try {
    // Init Audio Engine ASAP so browser fetches voices
    AudioService.init();

    // Run all DOM syncs immediately before the async call yields the thread
    syncImmediateUIState();

    // Release CSS transition lock AFTER the first two paints
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.remove("preload");
      });
    });

    // Fetch all schemas simultaneously
    const [vReq, fReq, sReq, eReq, nReq] = await Promise.all([
      fetch("verbs_db.json"),
      fetch("verb_functional_schema.json"),
      fetch("sentence_schema.json"),
      fetch("verb_stems_and_endings_db.json"),
      fetch("nouns_db.json"),
    ]);

    // These are the main data sources for your app, loaded once at the start and stored in globalData for easy access throughout the app's lifecycle.
    globalData.verbs = await vReq.json();
    globalData.functionalSchema = await fReq.json();
    globalData.sentenceSchema = await sReq.json();
    globalData.endings = await eReq.json();
    globalData.nouns = await nReq.json();

    const intensitySlider = document.getElementById("intensity-slider");
    if (intensitySlider) {
      intensitySlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value);
        globalData.settings.fsrs_penalty = (10 - val) / 10;
        const labels = ["", "Very Gentle", "Gentle", "Relaxed", "Moderate", "Balanced", "Firm", "Strict", "Hard", "Vicious"];
        document.getElementById("intensity-val").innerText = labels[val];
        saveSettings();
      });
    }

    renderFilters();
    setupEventListeners();
  } catch (err) {
    console.error("Critical Error: Could not load JSON schemas.", err);
    alert("Check your console. JSON files must be in the same folder as script.js.");
  }
}

// Theme Toggle Logic
function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("french_theme", isDark ? "dark" : "light");
}

// Function to handle Curriculum Tier button clicks
function toggleFilter(category) {
  const index = globalData.filters.curriculumTiers.indexOf(category);
  if (index > -1) {
    if (globalData.filters.curriculumTiers.length > 1) {
      globalData.filters.curriculumTiers.splice(index, 1);
    }
  } else {
    globalData.filters.curriculumTiers.push(category);
  }
  updateFilterUI("type-filters", globalData.filters.curriculumTiers);
  saveSettings();
}

function getTierMilestone(tierId, percentage) {
  if (tierId === "tier_1") {
    if (percentage < 20) return "Milestone: Apprentissage des bases 🌱";
    if (percentage < 40) return "Milestone: Vous pouvez commander un café ☕";
    if (percentage < 60) return "Milestone: Survie d'un week-end à Paris 🥖";
    if (percentage < 80) return "Milestone: Conversations de base 🗣️";
    return "Milestone: Maîtrise de la survie 🏆";
  } else if (tierId === "tier_2") {
    if (percentage < 20) return "Milestone: Élargissement du vocabulaire 🌱";
    if (percentage < 40) return "Milestone: Gestions des imprévus 📞";
    if (percentage < 60) return "Milestone: Raconter des histoires 📖";
    if (percentage < 80) return "Milestone: Indépendance linguistique 🌍";
    return "Milestone: Maîtrise du quotidien 🏆";
  } else {
    // tier_3_all
    if (percentage < 20) return "Milestone: Défi linguistique 🌱";
    if (percentage < 40) return "Milestone: Compréhension intermédiaire 📚";
    if (percentage < 60) return "Milestone: Discussions complexes 💡";
    if (percentage < 80) return "Milestone: Polyvalence totale 🎭";
    return "Milestone: Maîtrise absolue 👑";
  }
}

function calculateTierMastery(tierId) {
  const tier = globalData.functionalSchema.verb_functional_schema.curriculum_tiers[tierId];
  if (!tier) return { percentage: 0, verbsEncountered: 0, totalVerbs: 0 };
  let verbList = tier.verbs === "ALL_VERBS" ? Object.keys(globalData.verbs) : tier.verbs;
  
  let totalStability = 0;
  let count = 0;
  let encounteredVerbs = new Set();
  
  for (const progressId in globalData.progress) {
    const baseVerb = Object.keys(globalData.verbs).find(v => progressId.startsWith(v));
    if (baseVerb && verbList.includes(baseVerb)) {
       totalStability += globalData.progress[progressId].stability;
       count++;
       encounteredVerbs.add(baseVerb);
    }
  }
  
  let percent = 0;
  if (count > 0) {
    const avgStability = totalStability / count;
    percent = Math.min(100, Math.round((avgStability / 30) * 100)) || 0;
  }
  return { percentage: percent, verbsEncountered: encounteredVerbs.size, totalVerbs: verbList.length };
}

function renderFilters() {
  const tiers = globalData.functionalSchema.verb_functional_schema.curriculum_tiers || {};
  
  Object.keys(tiers).forEach(cat => {
    const masteryData = calculateTierMastery(cat);
    const mastery = masteryData.percentage;
    const encountered = masteryData.verbsEncountered;
    const total = masteryData.totalVerbs;
    
    globalData.settings.cached_mastery[cat] = mastery > 0 ? mastery : "--";
    
    const badge = document.querySelector(`button[data-id="${cat}"] .mastery-badge`);
    if (badge) {
      badge.innerText = mastery > 0 ? `${mastery}%` : "--%";
    }
    
    const statsElem = document.querySelector(`button[data-id="${cat}"] .tier-stats`);
    if (statsElem) {
      statsElem.innerText = `${encountered}/${total} verbs`;
    }
    
    const titleElem = document.querySelector(`button[data-id="${cat}"] .tier-milestone`);
    if (titleElem) {
      titleElem.innerText = getTierMilestone(cat, mastery);
    }
  });

  saveSettings();
  updateFilterUI("type-filters", globalData.filters.curriculumTiers);
  updateFilterUI("question-type-filters", globalData.filters.sentenceTypes);
}

function toggleSentenceType(type) {
  const index = globalData.filters.sentenceTypes.indexOf(type);
  if (index > -1) {
    if (globalData.filters.sentenceTypes.length > 1) {
      globalData.filters.sentenceTypes.splice(index, 1);
    }
  } else {
    globalData.filters.sentenceTypes.push(type);
  }
  updateFilterUI("question-type-filters", globalData.filters.sentenceTypes);
  saveSettings();
}

// Helper to keep the buttons looking "active"
function updateFilterUI(containerId, activeList) {
  const container = document.getElementById(containerId);
  const buttons = container.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => {
    // Check if the button's text or a data-id matches
    const isActive = activeList.includes(btn.getAttribute("data-id"));
    btn.classList.toggle("active", isActive);
  });
}

function startDrill() {
  document.getElementById("setup").classList.add("hidden");
  document.getElementById("summary").classList.add("hidden");
  document.getElementById("drill").classList.remove("hidden");

  // Snapshot starting mastery
  sessionState.currentQ = 0;
  sessionState.memoriesStrengthened = 0;
  const tiers = globalData.functionalSchema.verb_functional_schema.curriculum_tiers || {};
  Object.keys(tiers).forEach(cat => {
    sessionState.startMastery[cat] = calculateTierMastery(cat);
  });

  showNextQuestion();
}

// --- 2. The Logic Engine ---

function getAllowedGrammar(currentCefr) {
  const userMaxIdx = CEFR_LEVELS.indexOf(currentCefr);
  const allowed = { tenses: [], negations: [] };

  // Get Tenses from Functional Schema
  const moods = globalData.functionalSchema.verb_functional_schema.moods;
  for (const moodKey in moods) {
    if (moods[moodKey].levels.some((l) => CEFR_LEVELS.indexOf(l) <= userMaxIdx)) {
      const tenses = moods[moodKey].tenses;
      for (const tenseKey in tenses) {
        if (tenses[tenseKey].levels.some((l) => CEFR_LEVELS.indexOf(l) <= userMaxIdx)) {
          allowed.tenses.push({ mood: moodKey, tense: tenseKey });
        }
      }
    }
  }

  // Get Negations from Sentence Schema
  const negs = globalData.sentenceSchema.negation_logic;
  for (const negKey in negs) {
    if (negs[negKey].levels.some((l) => CEFR_LEVELS.indexOf(l) <= userMaxIdx)) {
      allowed.negations.push(negKey);
    }
  }

  return allowed;
}

// This function determines the correct stem for a given verb, tense, and person.
function getStem(verbKey, verb, tense, personIdx) {
  // 1. Check for Irregular Override first (B1/B2 logic)
  const irregulars = globalData.endings.irregular_stems;
  if (irregulars[verbKey]) {
    const tenseData = irregulars[verbKey][tense] || irregulars[verbKey]["present"];
    return Array.isArray(tenseData) ? tenseData[personIdx] : tenseData;
  }
  if (verb.category === "ir_irregular") {
    // Singular (je, tu, il) drops 3 letters ("tir"); Plural (nous, vous, ils) drops 2 ("ir")
    return personIdx < 3 ? verbKey.slice(0, -3) : verbKey.slice(0, -2);
  }

  // 2. Regular Logic (A1/A2 logic)
  if (tense === "futur_simple" || tense === "conditionnel_present") {
    return verbKey.endsWith("re") ? verbKey.slice(0, -1) : verbKey;
  }

  // Default fallback with developer alert
  const defaultStem = verbKey.slice(0, -2);
  const stem = verb.stems?.default;

  if (!stem) {
    console.warn(`[Stem Fallback] No stem defined for "${verbKey}". Using slice: ${defaultStem}`);
    return defaultStem;
  }

  return Array.isArray(stem) ? stem[personIdx] : stem;
}

// THE CONJUGATION ENGINE - Dynamically builds verb forms using stems and schema endings.
function conjugate(verbKey, subjectKey, tense) {
  let verb = globalData.verbs[verbKey];
  if (!verb) {
    // const strippedKey = verbKey.replace(/^s[e']_?/i, "");
    // verb = globalData.verbs[strippedKey];
    if (!verb) {
      verb = globalData.verbs[`se_${verbKey}`] || globalData.verbs[`s'${verbKey}`];
    }
  }

  if (!verb) {
    console.error(`[Data Error] Verb "${verbKey}" was not found in verbs_db.json.`);
    return `[${verbKey} NOT FOUND]`;
  }

  const allEndings = globalData.endings.ending_groups; // The main source of truth for endings, organized by category/mood/tense
  const persons = ["je", "tu", "il", "nous", "vous", "ils"];
  const personIdx = persons.indexOf(["elle", "on"].includes(subjectKey) ? "il" : ["elles"].includes(subjectKey) ? "ils" : subjectKey);

  // FULL IRREGULAR CHECK: If the verb has its own array for this tense, use it!
  // This handles ["suis", "es", "est"...] for être present immediately.
  if (verb.stems && Array.isArray(verb.stems[tense])) {
    return verb.stems[tense][personIdx];
  }

  // Stem calculation is separate from ending retrieval, allowing for more complex logic and irregularities.
  const stem = getStem(verbKey, verb, tense, personIdx);

  // GET THE ENDING: Find the right group in your database
  const categoryData = globalData.endings.ending_groups[verb.category];

  // Safety check: If category is "full_irregulars" but not in endings_db
  if (!categoryData) {
    // If it's a compound tense, we can still return the participle
    if (tense === "passé_composé") return verb.stems?.past_participle || "[Missing Participle]";
    return `[Missing Data for ${verb.category}]`;
  }

  let groupEndings = null;
  // Explicitly determine the mood key based on the tense name
  const moodKey = tense.includes("impératif") ? "imperative" : "indicative";

  if (categoryData[moodKey] && categoryData[moodKey][tense]) {
    groupEndings = categoryData[moodKey][tense];
  }

  // Adjust the index for 3-item imperative arrays
  const finalIdx = moodKey === "imperative" && groupEndings.length === 3 ? [1, 3, 4].indexOf(personIdx) : personIdx;

  // 3. FALLBACKS: Handle missing tenses or compound tenses
  if (!groupEndings && tense === "passé_composé") {
    return verb.stems?.past_participle || "[MISSING PARTICIPLE]";
  }
  if (!groupEndings) {
    return `[ENDINGS NOT FOUND FOR ${verb.category}]`;
  }

  // 4. COMBINE: Apply the specific ending to the calculated stem
  const ending = Array.isArray(groupEndings) ? groupEndings[finalIdx] : groupEndings;
  if (ending === undefined || ending === null) {
    console.error(`[Data Error] No ending found for: ${verb.category} > ${moodKey} > ${tense} at index ${finalIdx}`);
    return `${stem}[MISSING_ENDING]`;
  }

  const conjugatedVerb = stem + ending;

  // Add the reflexive pronoun dynamically if the verb is reflexive
  if (verb.reflexive) {
    const isElided = /^[aeiouh]/i.test(conjugatedVerb);
    const pronoun = globalData.endings.pronouns.reflexive[isElided ? "elided" : "standard"][personIdx];
    return `${pronoun} ${conjugatedVerb}`;
  }

  return conjugatedVerb;
}

function showNextQuestion() {
  sessionState.currentQ++;
  const sessionProgress = document.getElementById("session-progress");
  if (sessionProgress) {
    sessionProgress.innerText = `Question ${sessionState.currentQ} / ${sessionState.totalQ}`;
  }

  clearInterval(timerInterval);
  timeIsUp = false;
  typingLeniencyAdded = false;

  // Called on page load and when slider changes
  const slider = document.getElementById("cefr-level-slider"); // Get current CEFR level from slider
  const currentCefr = CEFR_LEVELS[slider.value]; // Update label

  // This function filters the tenses and negations based on the user's CEFR level, using the "levels" property in your schemas.
  const grammar = getAllowedGrammar(currentCefr);

  // Determine allowed verbs from active tiers
  let verbKeys = [];
  const activeTiers = globalData.filters.curriculumTiers;
  const tiers = globalData.functionalSchema.verb_functional_schema.curriculum_tiers || {};
  
  activeTiers.forEach(tierId => {
    if (tiers[tierId]) {
      if (tiers[tierId].verbs === "ALL_VERBS") {
         verbKeys = Object.keys(globalData.verbs);
      } else {
         verbKeys = verbKeys.concat(tiers[tierId].verbs);
      }
    }
  });

  verbKeys = [...new Set(verbKeys)].filter(v => globalData.verbs[v]);

  // SAFETY: If a filter combination results in 0 verbs, default to all verbs
  if (verbKeys.length === 0) {
    verbKeys = Object.keys(globalData.verbs);
  }

  // Pick Tense
  const tenseInfo = grammar.tenses[Math.floor(Math.random() * grammar.tenses.length)];

  const now = Date.now();
  const isNewContentRoll = Math.random() < globalData.settings.new_verb_ratio;

  // Find verbs the user has never seen (New)
  const newVerbs = verbKeys.filter((key) => {
    const id = `${key}_${tenseInfo.tense}`;
    return !globalData.progress[id];
  });

  // Find verbs that are due (Review)
  const dueVerbs = verbKeys.filter((key) => {
    const id = `${key}_${tenseInfo.tense}`;
    return globalData.progress[id] && globalData.progress[id].due <= now;
  });

  let verbKey;

  // THE SEAMLESS PICKER LOGIC:
  if (isNewContentRoll && newVerbs.length > 0) {
    // Force a new verb to keep things fresh
    verbKey = newVerbs[Math.floor(Math.random() * newVerbs.length)];
  } else if (dueVerbs.length > 0) {
    // Prioritize due verbs
    verbKey = dueVerbs[Math.floor(Math.random() * dueVerbs.length)];
  } else {
    // If nothing is due and no new verbs are left, pick totally random
    verbKey = verbKeys[Math.floor(Math.random() * verbKeys.length)];
  }

  let verb = globalData.verbs[verbKey];

  let negKey = null;
  let isQuestion = false;

  if (negKey) {
    const negLogic = globalData.sentenceSchema.negation_logic[negKey];

    // Check for explicit "Avoid" rules
    const shouldAvoid = negLogic.avoid_tenses?.includes(tenseInfo.tense);

    // Check for "Preferred" rules (if they exist, prefer them)
    const isPreferred = negLogic.preferred_tenses ? negLogic.preferred_tenses.includes(tenseInfo.tense) : true;

    if (shouldAvoid || !isPreferred) {
      negKey = "standard_negation"; // Fall back to the most basic, safest negation
    }
  }
  // DECIDE SENTENCE TYPE (Respecting your new buttons)
  const activeTypes = globalData.filters.sentenceTypes;
  const chosenType = activeTypes[Math.floor(Math.random() * activeTypes.length)];

  if (chosenType === "negative") {
    negKey = grammar.negations[Math.floor(Math.random() * grammar.negations.length)];

    // Safety check for avoid_tenses (e.g., ne...plus + passé composé)
    if (negKey && globalData.sentenceSchema.negation_logic[negKey].avoid_tenses?.includes(tenseInfo.tense)) {
      negKey = "standard_negation";
    }
  } else if (chosenType === "question") {
    isQuestion = true;
  }

  // 4. Assemble the sentence (Ensure assembleSentence accepts the isQuestion flag)
  currentQ = assembleSentence(verbKey, tenseInfo, negKey, currentCefr, isQuestion);

  // 5. Update UI
  const tenseName = tenseInfo.tense.replace("_", " ");
  const verbName = verbKey.charAt(0).toUpperCase() + verbKey.slice(1);

  document.getElementById("verb-info").innerText = verbName;
  
  let tenseText = tenseName;
  if (tenseInfo.tense === "impératif_present") {
    tenseText += ` — (${currentQ.subject})`;
  }
  
  let tenseElem = document.getElementById("tense-info");
  if(tenseElem) {
      tenseElem.innerText = `(${tenseText})`;
  }

  const scenarioBadge = document.getElementById("scenario-display");
  if (scenarioBadge) {
    scenarioBadge.innerText = SCENARIO_MAP[verb.noun_category] || "📍 Situation générale";
  }

  // Update UI
  document.getElementById("sentence-display").innerText = currentQ.french;
  // document.getElementById("translation-display").innerText = `${verb.translation.en_ing} (${tenseName})`;
  const selectedVerbData = globalData.verbs[verbKey];
  document.getElementById("translation-display").innerText = `${selectedVerbData.translation.en_ing} (${tenseName})`;

  const inputField = document.getElementById("answer-input");
  const checkBtn = document.getElementById("check-btn");
  const nextBtn = document.getElementById("next-btn");

  inputField.value = "";
  checkBtn.disabled = true; // This triggers the CSS opacity and cursor rules
  checkBtn.classList.remove("hidden");
  if (nextBtn) nextBtn.classList.add("hidden");
  document.getElementById("feedback").classList.add("hidden");
  inputField.focus();
  inputField.style.borderColor = "var(--border)";

  const timerContainer = document.getElementById("timer-container");
  const timerFill = document.getElementById("timer-fill");
  if (timerContainer && timerFill) {
    if (globalData.settings.pressure_mode) {
      timerContainer.classList.remove("hidden");
      timerFill.style.width = "100%";
      timerFill.className = "timer-bar-fill";
      
      const duration = globalData.settings.timer_duration;
      timerEndTime = Date.now() + duration;
      
      timerInterval = setInterval(() => {
        let remaining = timerEndTime - Date.now();
        
        const hasContent = inputField.value.trim().length > 0;
        if (remaining <= 0 && hasContent && !typingLeniencyAdded) {
          remaining = 1000;
          timerEndTime = Date.now() + 1000;
          typingLeniencyAdded = true;
        }
        
        if (remaining <= 0) {
          clearInterval(timerInterval);
          remaining = 0;
          handleTimeUp();
        }
        
        let percent = (remaining / duration) * 100;
        if (percent > 100) percent = 100;
        timerFill.style.width = `${percent}%`;
        
        if (percent < 25) {
          timerFill.className = "timer-bar-fill danger";
        } else if (percent < 50) {
          timerFill.className = "timer-bar-fill warning";
        }
      }, 50);
    } else {
      timerContainer.classList.add("hidden");
    }
  }
}

function handleTimeUp() {
  timeIsUp = true;
  document.getElementById("check-btn").disabled = true;
  document.getElementById("check-btn").classList.add("hidden");
  const nextBtn = document.getElementById("next-btn");
  if (nextBtn) nextBtn.classList.remove("hidden");
  
  recordProgress(currentQ.verbId, false);
  
  const feedback = document.getElementById("feedback");
  feedback.className = "incorrect";
  feedback.classList.remove("hidden");
  feedback.innerHTML = `
    <div style="margin-bottom: 8px;">
      Temps écoulé! Tapez la réponse: <strong>${currentQ.answer}</strong>
    </div>
  `;
}

function getRandomSubject() {
  const subjects = ["je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles"];
  return subjects[Math.floor(Math.random() * subjects.length)];
}

function assembleSentence(verbKey, tenseInfo, negKey, currentLevel, isQuestion) {
  let verb = globalData.verbs[verbKey];

  // 1. Strip "se_" or "s'" case-insensitively to get the clean base verb
  const baseKey = verbKey.toLowerCase().replace(/^s[e']_?/i, "");

  // 2. Subject Selection (Restricted for Imperative)
  let subKey;
  if (tenseInfo.tense === "impératif_present") {
    const imperativeSubjects = ["tu", "nous", "vous"];
    subKey = imperativeSubjects[Math.floor(Math.random() * imperativeSubjects.length)];
  } else {
    subKey = getRandomSubject();
  }

  const persons = globalData.functionalSchema.pronouns?.subjects || ["je", "tu", "il", "nous", "vous", "ils"];
  const personIdx = persons.indexOf(["elle", "on"].includes(subKey) ? "il" : ["elles"].includes(subKey) ? "ils" : subKey);

  // 3. Conjugation Logic: Clean underscores from the engine result
  let conjugated =
    tenseInfo.tense === "passé_composé"
      ? `${conjugate(verb.auxiliary || "avoir", subKey, "present")} ${verb.stems.past_participle}`
      : // : conjugate(baseKey, subKey, tenseInfo.tense);
        conjugate(verbKey, subKey, tenseInfo.tense);
  // Strip any reflexive prefix or underscores that might have leaked from the engine
  // conjugated = conjugated.replace(/^s[e']_?/i, "").replace("_", "");
  // Only strip underscores if the string is NOT an error message (doesn't start with '[')
  if (!conjugated.startsWith("[")) {
    conjugated = conjugated.replace(/^s[e']_?/i, "").replace("_", "");
  }

  // 4. Reflexive Logic: Assemble the final answer the user must type
  let answerText = conjugated;
  if (verb.reflexive) {
    const source = tenseInfo.tense === "impératif_present" ? verb.imperative_present : verb.present;
    // Safety check for null values in your imperative array [null, "lave-toi", ...]
    answerText = source && source[personIdx] ? source[personIdx] : conjugated;
  }

  const finalAnswer = applyElision(answerText);

  // 5. Formula Selection
  const preVerb = negKey ? "ne " : "";
  const neg2 = negKey ? globalData.sentenceSchema.negation_logic[negKey].particles[1] : "";
  const blank = "__________";
  const isCompound = tenseInfo.tense === "passé_composé";

  let formula;
  if (tenseInfo.tense === "impératif_present") {
    formula = "{pre_verb_particles} {conjugated_verb} {negation_particle_2} {main_verb} {noun_object}!";
  } else if (isQuestion) {
    formula = globalData.sentenceSchema.interrogative_logic.est_ce_que.formula;
  } else {
    formula = "{subject} {pre_verb_particles} {conjugated_verb} {negation_particle_2} {main_verb} {noun_object}.";
  }

  // 6. Noun Selection
  let activeCategory = verb.noun_category;
  if (!globalData.nouns[activeCategory]) activeCategory = verb.transitivity === "intransitive" ? "place" : "activity";
  const nounsAtLevel = globalData.nouns[activeCategory] || { A1: ["quelque chose"] };
  const availableNouns = nounsAtLevel[currentLevel] || nounsAtLevel["A1"] || ["quelque chose"];
  const nounChoice = availableNouns[Math.floor(Math.random() * availableNouns.length)];

  // 7. Final Assembly & Cleanup
  let french = formula
    .replace("{subject}", isCompound || tenseInfo.tense !== "impératif_present" ? subKey : "")
    .replace("{pre_verb_particles}", preVerb)
    .replace("{conjugated_verb}", verb.reflexive || !isCompound ? blank : finalAnswer.split(" ")[0])
    .replace("{negation_particle_2}", neg2)
    .replace("{main_verb}", isCompound && !verb.reflexive ? blank : "")
    .replace("{noun_object}", nounChoice);

  french = applyElision(french).replace(/\s+/g, " ").trim();
  french = french.charAt(0).toUpperCase() + french.slice(1);

  return { french: french, answer: finalAnswer, verbId: `${verbKey}_${tenseInfo.tense}`, subject: subKey };
}

// --- 3. UI & Helper Functions ---

function processCorrectCorrection() {
  if (isAdvancing) return;
  isAdvancing = true;
  
  const inputField = document.getElementById("answer-input");
  inputField.style.borderColor = "var(--success)";
  inputField.disabled = true;
  
  let resolvedSentence = currentQ.french.replace(/_+/g, currentQ.answer);
  resolvedSentence = applyElision(resolvedSentence);
  document.getElementById("sentence-display").innerText = resolvedSentence;
  
  if (typeof AudioService !== "undefined") AudioService.speak(resolvedSentence);
  
  setTimeout(() => {
    isAdvancing = false;
    inputField.disabled = false;
    if (sessionState.currentQ >= sessionState.totalQ) {
      showSessionSummary();
    } else {
      showNextQuestion();
    }
  }, 1000);
}

function applyElision(str) {
  return str
    .replace(/\b(ne|me|te|se|je|que|le|la|de)\s+([aeiouhâêîôû])/gi, "$1'$2")
    .replace(/[ea]'/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function setupEventListeners() {
  const inputField = document.getElementById("answer-input");
  const checkBtn = document.getElementById("check-btn");

  // Enable/Disable Verify button based on input length
  inputField.addEventListener("input", () => {
    const currentContent = inputField.value.trim().length > 0;
    if (timeIsUp) {
      if (inputField.value.trim().toLowerCase() === currentQ.answer.toLowerCase()) {
        inputField.style.borderColor = "var(--success)";
      } else {
        inputField.style.borderColor = "var(--border)";
      }
    } else {
      checkBtn.disabled = !currentContent;
      inputField.style.borderColor = "var(--border)";
    }
  });

  document.getElementById("check-btn").addEventListener("click", checkAnswer);
  document.getElementById("next-btn").addEventListener("click", () => {
    if (timeIsUp) {
      const inputField = document.getElementById("answer-input");
      if (inputField.value.trim().toLowerCase() !== currentQ.answer.toLowerCase()) {
        inputField.classList.add("shake");
        setTimeout(() => inputField.classList.remove("shake"), 300);
        return;
      }
      processCorrectCorrection();
      return;
    }
    if (sessionState.currentQ >= sessionState.totalQ) {
      showSessionSummary();
    } else {
      showNextQuestion();
    }
  });

  const pressureToggle = document.getElementById("pressure-toggle");
  if (pressureToggle) {
    pressureToggle.addEventListener("change", (e) => {
      globalData.settings.pressure_mode = e.target.checked;
      document.getElementById("timer-setting").style.display = e.target.checked ? "block" : "none";
      saveSettings();
    });
  }

  const timerSlider = document.getElementById("timer-slider");
  if (timerSlider) {
    timerSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value);
      // Invert: Left(2) -> 10s, Right(10) -> 2s
      const actualSeconds = 12 - val;
      globalData.settings.timer_duration = actualSeconds * 1000;
      document.getElementById("timer-val").innerText = actualSeconds;
      saveSettings();
    });
  }

  const revisionToggle = document.getElementById("revision-toggle");
  if (revisionToggle) {
    revisionToggle.addEventListener("change", (e) => {
      globalData.settings.adaptive_mode = e.target.checked;
      saveSettings();
    });
  }

  const cefrSlider = document.getElementById("cefr-level-slider");
  
  // The background gradient is now handled via pure CSS, so just logic here
  cefrSlider.addEventListener("input", (e) => {
    globalData.settings.cefr_level = parseInt(e.target.value);
    saveSettings();
    showNextQuestion();
  });

  document.getElementById("answer-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const feedback = document.getElementById("feedback");

      // We define hasContent here so it's available to this function
      const hasContent = inputField.value.trim().length > 0;

      // If feedback is visible, the user is done with this question
      if (!feedback.classList.contains("hidden")) {
        if (timeIsUp) {
          if (inputField.value.trim().toLowerCase() === currentQ.answer.toLowerCase()) {
            processCorrectCorrection();
          } else {
            inputField.classList.add("shake");
            setTimeout(() => inputField.classList.remove("shake"), 300);
          }
        } else {
          if (sessionState.currentQ >= sessionState.totalQ) {
            showSessionSummary();
          } else {
            showNextQuestion();
          }
        }
      }
      // Only allow 'Check' if there is at least 1 character
      else if (hasContent && !timeIsUp) {
        checkAnswer();
      }
    }
  });
}

function checkAnswer() {
  if (timeIsUp) return;
  clearInterval(timerInterval);

  const input = document.getElementById("answer-input").value.trim().toLowerCase(); // We trim and lowercase the input for a more forgiving comparison. You can enhance this with more sophisticated normalization if desired.
  const isCorrect = input === currentQ.answer.toLowerCase(); // This is the core correctness check. Depending on how strict you want to be, you could implement more complex logic here (e.g., ignoring accents, allowing common misspellings, etc.).

  const feedback = document.getElementById("feedback"); // We update the feedback text and styling based on correctness. The CSS classes "correct" and "incorrect" will handle the colors and icons.

  feedback.className = isCorrect ? "correct" : "incorrect";
  feedback.classList.remove("hidden"); // We show the feedback element, which was hidden by default. The user can then click "Next" or press Enter to proceed to the next question.

  document.getElementById("check-btn").classList.add("hidden");
  const nextBtn = document.getElementById("next-btn");
  if (nextBtn) nextBtn.classList.remove("hidden");

  if (!isCorrect) {
    timeIsUp = true; // Force them to type the correct answer before proceeding
    document.getElementById("check-btn").disabled = true;
  }

  const stabilityValue = recordProgress(currentQ.verbId, isCorrect);
  const strengthPercent = Math.min(100, Math.round((stabilityValue / 30) * 100)) || 0;
  
  // Update Mastery UI on the buttons dynamically
  renderFilters();

  // Resolve the string blanks into a grammatically correct French sentence
  let resolvedSentence = currentQ.french.replace(/_+/g, currentQ.answer);
  resolvedSentence = applyElision(resolvedSentence);

  // Audio-visual loop
  if (isCorrect) {
    // Visually mutate the UI to show the completed sentence for psychological closure
    document.getElementById("sentence-display").innerText = resolvedSentence;
    
    // Read the fully resolved grammar string
    if (typeof AudioService !== "undefined") {
      AudioService.speak(resolvedSentence);
    }
  }

  // Verification Logs
  console.log(`--- Progress Update for: ${currentQ.verbId} ---`);
  console.log(`Raw Stability: ${stabilityValue.toFixed(2)}`);
  console.log(`Memory Strength: ${strengthPercent}%`);
  const intervalDays = Math.max(1, Math.round(stabilityValue));
  let etat = intervalDays < 2 ? "À revoir" : (intervalDays < 7 ? "Familier" : "Solide");

  if (isCorrect) sessionState.memoriesStrengthened++;

  feedback.innerHTML = `
  <div style="margin-bottom: 8px;">
    ${isCorrect ? "Correct! 🎉" : `Incorrect. Answer: <strong>${currentQ.answer}</strong>`}
  </div>
  <div class="memory-meter-container">
    <div style="display: flex; justify-content: space-between;">
      <span>État : ${etat} (Rappel : ${intervalDays} j)</span>
      <span>${strengthPercent}%</span>
    </div>
    <div class="memory-bar-bg">
      <div class="memory-bar-fill" style="width: ${strengthPercent}%"></div>
    </div>
  </div>
`;
  return stabilityValue;
}

// This function implements a simplified version of the FSRS algorithm to track the user's progress with each verb and tense combination. It updates the stability and difficulty based on whether the user's answer was correct, and calculates when the next review should be due.
function recordProgress(verb_id, isCorrect) {
  if (!globalData.progress[verb_id]) {
    globalData.progress[verb_id] = {
      stability: 1.0,
      difficulty: 5.0,
      last_seen: Date.now(),
      due: Date.now(),
    };
  }

  const record = globalData.progress[verb_id];
  const now = Date.now();
  const daysSinceLast = Math.max(0.1, (now - record.last_seen) / (1000 * 60 * 60 * 24));

  if (isCorrect) {
    const recallFactor = Math.exp(record.difficulty * -0.1);
    record.stability = record.stability * (1 + recallFactor * daysSinceLast);
    record.difficulty = Math.max(1, record.difficulty - 0.1);
  } else {
    // Binary Penalty logic: 0.2 for science, 0.8 for gentle
    const penalty = globalData.settings.adaptive_mode ? 0.2 : 0.8;
    record.stability = record.stability * penalty;
    record.difficulty = Math.min(10, record.difficulty + 0.5);
  }

  const intervalDays = Math.max(1, Math.round(record.stability));
  console.log(`Next review scheduled in: ${intervalDays} day(s)`);
  record.due = now + intervalDays * 24 * 60 * 60 * 1000;
  record.last_seen = now;

  localStorage.setItem("french_mastery", JSON.stringify(globalData.progress));
  return record.stability || 1.0;
}

function toggleDarkMode() {
  // Toggle class on <html> to match the 'Theme Guard' logic
  const isDark = document.documentElement.classList.toggle("dark-mode");
  localStorage.setItem("french_theme", isDark ? "dark" : "light");
}

function showSessionSummary() {
  document.getElementById("drill").classList.add("hidden");
  document.getElementById("summary").classList.remove("hidden");
  
  const container = document.getElementById("summary-stats-container");
  container.innerHTML = "";
  
  container.innerHTML += `
    <div class="stat-card">
      <h3>Mémoires Renforcées</h3>
      <div class="main-stat">${sessionState.memoriesStrengthened}</div>
      <div class="delta">+${sessionState.memoriesStrengthened} connexions consolidées</div>
    </div>
  `;
  
  const activeTiers = globalData.filters.curriculumTiers;
  activeTiers.forEach(cat => {
    const endMastery = calculateTierMastery(cat);
    const startMastery = sessionState.startMastery[cat] || { percentage: 0, verbsEncountered: 0 };
    
    let percentDelta = endMastery.percentage - startMastery.percentage;
    let verbsDelta = endMastery.verbsEncountered - startMastery.verbsEncountered;
    
    const baseBtn = document.querySelector(`button[data-id="${cat}"]`);
    if (!baseBtn) return;
    const tierNameElement = baseBtn.querySelector('.tier-title');
    let tierName = "Niveau";
    if (tierNameElement) {
        tierName = tierNameElement.textContent.split("%")[0].trim();
    }
    
    container.innerHTML += `
      <div class="stat-card">
        <h3>${tierName}</h3>
        <div class="main-stat">${endMastery.percentage}%</div>
        <div class="delta">${percentDelta > 0 ? '+' : ''}${percentDelta}% (+${verbsDelta} nouveaux verbes)</div>
      </div>
    `;
  });
}

function startAnotherSession() {
  startDrill();
}

function returnToMenu() {
  document.getElementById("summary").classList.add("hidden");
  document.getElementById("setup").classList.remove("hidden");
  renderFilters();
}

// Start the app
document.addEventListener("DOMContentLoaded", initApp);
