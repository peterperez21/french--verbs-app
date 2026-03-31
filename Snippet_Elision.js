function applyFrenchElision(sentence) {
  return sentence.replace(
    /\b(je|ne|me|te|se|le|la|que|de)\s([aeiouhâêîôû])/gi,
    (match, p1, p2) => {
      return p1.slice(0, -1) + "'" + p2;
    },
  );
}

const finalResult = applyFrenchElision(rawSentence);

console.log("--- B1 COMPLEX INVERSION TEST ---");
console.log("Raw construction:", rawSentence);
console.log("Final French:", finalResult);
