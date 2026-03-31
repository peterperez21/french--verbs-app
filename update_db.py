import json
import os

def update_json_file(filename, new_data):
    # Create file if it doesn't exist with an empty list
    if not os.path.exists(filename):
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump([], f)

    # Read existing data
    with open(filename, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            data = []

    # Check for duplicate IDs to prevent double-entry
    existing_ids = {item.get('id') for item in data}
    added_count = 0

    for entry in new_data:
        if entry.get('id') not in existing_ids:
            data.append(entry)
            added_count += 1
    
    # Save back to file
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    
    print(f"Successfully added {added_count} new entries to {filename}.")

if __name__ == "__main__":
    # --- VERB BATCH ---
    verbs_batch = [
        {
            "id": 1,
            "verb": "parler",
            "translation": "to speak/talk",
            "level": "A1",
            "group": "regular -er",
            "auxiliary": "avoir",
            "past_participle": "parlé",
            "conjugations": {
                "present": ["parle", "parles", "parle", "parlons", "parlez", "parlent"],
                "imparfait": ["parlais", "parlais", "parlait", "parlions", "parliez", "parlaient"],
                "futur_simple": ["parlerai", "parleras", "parlera", "parlerons", "parlerrez", "parleront"],
                "conditionnel_présent": ["parlerais", "parlerais", "parlerait", "parlerions", "parleriez", "parleraient"],
                "subjonctif_présent": ["parle", "parles", "parle", "parlions", "parliez", "parlent"]
            }
        },
        {
            "id": 2,
            "verb": "être",
            "translation": "to be",
            "level": "A1",
            "group": "irregular",
            "auxiliary": "avoir",
            "past_participle": "été",
            "conjugations": {
                "present": ["suis", "es", "est", "sommes", "êtes", "sont"],
                "imparfait": ["étais", "étais", "était", "étions", "étiez", "étaient"],
                "futur_simple": ["serai", "seras", "sera", "serons", "serez", "seront"],
                "conditionnel_présent": ["serais", "serais", "serait", "serions", "seriez", "seraient"],
                "subjonctif_présent": ["sois", "sois", "soit", "soyons", "soyez", "soient"]
            }
        },
        {
            "id": 3,
            "verb": "se laver",
            "translation": "to wash oneself",
            "level": "A2",
            "group": "reflexive",
            "auxiliary": "être",
            "past_participle": "lavé",
            "conjugations": {
                "present": ["me lave", "te laves", "se lave", "nous lavons", "vous lavez", "se lavent"],
                "imparfait": ["me lavais", "te lavais", "se lavait", "nous lavions", "vous laviez", "se lavaient"],
                "futur_simple": ["me laverai", "te laveras", "se lavera", "nous laverons", "vous laverez", "se laveront"],
                "conditionnel_présent": ["me laverais", "te laverais", "se laverait", "nous laverions", "vous laveriez", "se laveraient"],
                "subjonctif_présent": ["me lave", "te laves", "se lave", "nous lavions", "vous laviez", "se lavent"]
            }
        }
    ]

    # --- QUESTIONS BATCH ---
    questions_batch = [
        {
            "id": 1001,
            "verb_id": 1,
            "tense": "present",
            "level": "A1",
            "sentence_fr": "Nous ___ français ensemble.",
            "sentence_en": "We are speaking French together.",
            "answer": "parlons",
            "clue": "parler"
        },
        {
            "id": 1002,
            "verb_id": 2,
            "tense": "futur_simple",
            "level": "A1",
            "sentence_fr": "Demain, je ___ à Paris.",
            "sentence_en": "Tomorrow, I will be in Paris.",
            "answer": "serai",
            "clue": "être"
        },
        {
            "id": 1003,
            "verb_id": 3,
            "tense": "present",
            "level": "A2",
            "sentence_fr": "Tu ___ avant de dormir ?",
            "sentence_en": "Do you wash yourself before sleeping?",
            "answer": "te laves",
            "clue": "se laver"
        }
    ]

    # Run the updates
    update_json_file('verbs.json', verbs_batch)
    update_json_file('questions.json', questions_batch)