// Data extracted from your JSON files
const verbsDB = {
  manger: {
    category: "er_regular",
    cefr: "A1",
    translation: "eat",
    auxiliary: "avoir",
    stems: { default: "mang" },
    reflexive: false,
  },
  finir: {
    category: "ir_regular",
    cefr: "A1",
    translation: "finish",
    auxiliary: "avoir",
    stems: { default: "fin", plural: "finiss" },
    reflexive: false,
  },
  attendre: {
    category: "re_regular",
    cefr: "A2",
    translation: "wait",
    auxiliary: "avoir",
    stems: { default: "attend" },
    reflexive: false,
  },
  se_laver: {
    category: "er_regular",
    cefr: "A1",
    translation: "wash oneself",
    auxiliary: "être",
    stems: { default: "lav" },
    reflexive: true,
  },
};

const endingsDB = {
  er_regular: { present: ["e", "es", "e", "ons", "ez", "ent"] },
  ir_regular: { present: ["is", "is", "it", "issons", "issez", "issent"] },
  re_regular: { present: ["s", "s", "", "ons", "ez", "ent"] },
};

const pronouns = ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"];
const reflexivePronouns = ["me", "te", "se", "nous", "vous", "se"];

const verbSelect = document.getElementById("verb-select");
const tenseSelect = document.getElementById("tense-select");
const output = document.getElementById("conjugation-output");

// Initialize App
function init() {
  Object.keys(verbsDB).forEach((v) => {
    let opt = new Option(v, v);
    verbSelect.add(opt);
  });

  ["present"].forEach((t) => {
    let opt = new Option(t.replace("_", " "), t);
    tenseSelect.add(opt);
  });

  verbSelect.addEventListener("change", conjugate);
  tenseSelect.addEventListener("change", conjugate);
  conjugate();
}

function conjugate() {
  const verbKey = verbSelect.value;
  const verbData = verbsDB[verbKey];
  const category = verbData.category;
  const endings = endingsDB[category]["present"];

  document.getElementById("translation-info").innerText =
    `Meaning: To ${verbData.translation}`;
  document.getElementById("cefr-badge").innerText = verbData.cefr;

  output.innerHTML = "";

  pronouns.forEach((p, i) => {
    let stem = verbData.stems.default;

    // Handle IR plural stem logic from your DB
    if (category === "ir_regular" && i > 2 && verbData.stems.plural) {
      stem = verbData.stems.plural;
    }

    let reflexive = verbData.reflexive ? reflexivePronouns[i] + " " : "";
    let fullVerb = reflexive + stem + endings[i];

    const div = document.createElement("div");
    div.className = "conjugation-item";
    div.innerHTML = `<span class="pronoun">${p}</span> ${fullVerb}`;
    output.appendChild(div);
  });
}

init();
