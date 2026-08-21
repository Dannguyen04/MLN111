const fs = require('fs');

const data = JSON.parse(fs.readFileSync('questions.json', 'utf-8'));
const q = data.find(item => item.id === 357);

if (q) {
  console.log("=== Question #357 ===");
  console.log("Question:", q.question);
  console.log("Options:", q.options);
  console.log("Answer:", q.answer);
  console.log("Note:", q.note);
} else {
  console.log("Question #357 not found.");
}
