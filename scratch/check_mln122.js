const fs = require('fs');

function checkFile(filepath) {
  console.log(`\nAnalyzing file: ${filepath}`);
  if (!fs.existsSync(filepath)) {
    console.log("File does not exist.");
    return;
  }
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  console.log(`Total questions: ${data.length}`);
  
  let optCounts = {};
  let badAnswers = 0;
  let sampleBads = [];
  
  data.forEach((q, idx) => {
    const optLen = Object.keys(q.options || {}).length;
    optCounts[optLen] = (optCounts[optLen] || 0) + 1;
    
    if (!q.answer || !/^[A-D]+$/i.test(q.answer)) {
      badAnswers++;
    }
    
    if (optLen !== 4) {
      sampleBads.push({ id: q.id, question: q.question.substring(0, 60), optLen, options: q.options, answer: q.answer });
    }
  });
  
  console.log("Option counts distribution:", optCounts);
  console.log("Bad answers count:", badAnswers);
  console.log("First 10 questions with option count != 4:");
  sampleBads.slice(0, 10).forEach(b => {
    console.log(`- ID: ${b.id} | Len: ${b.optLen} | Ans: ${b.answer} | Q: ${b.question}...`);
    console.log(`  Options:`, JSON.stringify(b.options));
  });
}

console.log("--- BEFORE PARSE_MLN122 ---");
checkFile('questions_mln122.json');

console.log("\nRunning parse_mln122.js...");
require('../parse_mln122.js');
console.log("--- AFTER PARSE_MLN122 ---");
checkFile('questions_mln122.json');
