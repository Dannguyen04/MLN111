const fs = require('fs');

function replaceHomoglyphs(text) {
  const map = {
    '\u0410': 'A', '\u0412': 'B', '\u0421': 'C', '\u0415': 'E', '\u041e': 'O',
    '\u0420': 'P', '\u0422': 'T', '\u0425': 'X', '\u0430': 'a', '\u0441': 'c',
    '\u0435': 'e', '\u043e': 'o', '\u0440': 'p', '\u0445': 'x', '\u0443': 'y'
  };
  return text.split('').map(char => map[char] || char).join('');
}

const rawText = replaceHomoglyphs(fs.readFileSync('docs/mln122_raw.txt', 'utf8'));
const lines = rawText.split('\n');

const query = process.argv[2] || 'cơ chế';
console.log(`Searching for "${query}" (case-insensitive)...`);

lines.forEach((line, idx) => {
  if (line.toLowerCase().includes(query.toLowerCase())) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
