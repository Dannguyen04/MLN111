const fs = require('fs');

const questions = JSON.parse(fs.readFileSync('questions_mln122.json', 'utf8'));
const rawText = fs.readFileSync('docs/mln122_raw.txt', 'utf8');

console.log(`Total questions: ${questions.length}`);
console.log("Checking questions with fewer than 4 options:");

let count = 0;
questions.forEach(q => {
  const optKeys = Object.keys(q.options || {});
  if (optKeys.length < 4) {
    count++;
    console.log(`\n----------------------------------------`);
    console.log(`JSON Question #${q.id} (Options count: ${optKeys.length}, Answer: ${q.answer}):`);
    console.log(`Q: ${q.question}`);
    console.log(`Options:`, q.options);
    
    // Find where this question starts in rawText
    // We clean up non-alphanumeric to find it
    const cleanQ = q.question.toLowerCase().replace(/[^a-z0-9]/g, '');
    const rawLines = rawText.split('\n');
    let foundIdx = -1;
    for (let i = 0; i < rawLines.length; i++) {
      const lineClean = rawLines[i].toLowerCase().replace(/[^a-z0-9]/g, '');
      if (lineClean && cleanQ.includes(lineClean) && lineClean.length > 10) {
        foundIdx = i;
        break;
      }
    }
    
    if (foundIdx !== -1) {
      console.log(`Raw text surrounding line ${foundIdx + 1}:`);
      const start = Math.max(0, foundIdx - 2);
      const end = Math.min(rawLines.length - 1, foundIdx + 12);
      for (let j = start; j <= end; j++) {
        console.log(`  ${j+1}: ${rawLines[j].trim()}`);
      }
    } else {
      console.log(`Could not find question start in raw text.`);
    }
  }
});

console.log(`\nTotal questions with < 4 options: ${count}`);
