const fs = require('fs');

const verbs = JSON.parse(fs.readFileSync('verbs_db.json', 'utf8'));
const nouns = JSON.parse(fs.readFileSync('nouns_db.json', 'utf8'));

let output = "# Semantic Audit Log\n\n";

for (const [verbKey, verbData] of Object.entries(verbs)) {
    const category = verbData.noun_category;
    output += `## Verb: ${verbKey.toUpperCase()}\n`;
    output += `**Category Map**: \`${category}\`\n\n`;
    
    if (nouns[category]) {
        for (const level of ["A1", "A2", "B1"]) {
            if (nouns[category][level]) {
                nouns[category][level].forEach(noun => {
                    output += `- [Subject] [${verbKey}] ${noun}\n`;
                });
            }
        }
    } else {
        output += `- **ERROR**: Noun category '${category}' completely missing from nouns_db.json!\n`;
    }
    output += "\n";
}

fs.writeFileSync('C:\\Users\\Peter\\.gemini\\antigravity\\brain\\84a8eb13-10bb-4dae-a819-a3072db47563\\qa_audit_log.md', output);
console.log("Audit complete. File saved to qa_audit_log.md");
