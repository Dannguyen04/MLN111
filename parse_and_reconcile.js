const fs = require('fs');
const path = require('path');

// Translate Cyrillic homoglyphs to standard Latin characters
function replaceHomoglyphs(text) {
  const map = {
    '\u0410': 'A', // Cyrillic А
    '\u0412': 'B', // Cyrillic В
    '\u0421': 'C', // Cyrillic С
    '\u0415': 'E', // Cyrillic Е
    '\u041e': 'O', // Cyrillic О
    '\u0420': 'P', // Cyrillic Р
    '\u0422': 'T', // Cyrillic Т
    '\u0425': 'X', // Cyrillic Х
    '\u0430': 'a', // Cyrillic а
    '\u0441': 'c', // Cyrillic с
    '\u0435': 'e', // Cyrillic е
    '\u043e': 'o', // Cyrillic о
    '\u0440': 'p', // Cyrillic р
    '\u0445': 'x', // Cyrillic х
    '\u0443': 'y'  // Cyrillic у
  };
  return text.split('').map(char => map[char] || char).join('');
}

// Helper to clean text contents (remove watermarks, phone numbers, clean whitespace)
function cleanText(text) {
  if (!text) return '';
  let cleaned = text;
  
  // Remove Quizlet watermark variations
  cleaned = cleaned.replace(/\(?NHUNG\s*HOÀNG\)?/gi, '');
  cleaned = cleaned.replace(/\(?NHUNG\s*\n\s*HOÀNG\)?/gi, '');
  cleaned = cleaned.replace(/NHUNG\s+HOÀNG/gi, '');
  
  // Remove phone numbers e.g. (073- 356-8678) or similar, handling arbitrary spaces
  cleaned = cleaned.replace(/\(?\d{3}\s*-\s*\d{3}\s*-\s*\d{4}\)?/g, '');
  
  // Clean multiple whitespaces and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Fix minor punctuation spacing issues if any (e.g. "là(NHUNG HOÀNG)" => "là")
  cleaned = cleaned.replace(/\s+([,\.\?\!])/g, '$1');
  
  return cleaned;
}

// Preprocess raw text from Quizlet PDF export to remove page numbers, headers, footers
function preprocessRawText(rawText, subjectCode) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim());
  const cleanLines = [];
  
  for (let line of lines) {
    if (line === '') continue;
    if (line.startsWith('http://') || line.startsWith('https://')) continue;
    if (line.includes('Flashcards | Quizlet') || line.includes('Thẻ ghi nhớ:') || line.includes('studiers from')) continue;
    if (line.includes('NHUNG HOÀNG SOURCE') || line.includes('reviews)') || line.includes('đánh giá)')) continue;
    if (line.includes('Terms in this set') || line.includes('Thuật ngữ trong học phần này')) continue;
    if (/^MLN(111|122)\s*-\s*NHUNG\s*HOÀNG/i.test(line)) continue;
    if (/^MLN(111|122)\s*-\s*CHUẨN/i.test(line)) continue;
    if (line === 'Save' || line === 'Lưu' || line === 'Groups' || line === 'Thêm vào lịch') continue;
    if (/^--\s*\d+\s+of\s+\d+\s*--$/i.test(line)) continue;
    if (/^\d{2}:\d{2}\s+\d+\/\d+\/\d+/i.test(line)) continue;
    
    cleanLines.push(line);
  }
  
  return cleanLines;
}

// State-machine parser to parse cleaned lines into structured question objects
function parseCleanLines(lines) {
  const questions = [];
  
  let currentQuestionText = [];
  let currentOptions = { A: [], B: [], C: [], D: [] };
  let currentOptionKey = null;
  let currentAnswer = null;
  let currentNoteLines = [];
  
  // States: 'QUESTION', 'OPTIONS', 'ANSWER', 'NOTE'
  let state = 'QUESTION';
  let openBrackets = 0;
  
  function saveCurrentQuestion() {
    if (currentQuestionText.length > 0) {
      // Build options object
      const optionsObj = {};
      Object.keys(currentOptions).forEach(key => {
        const text = cleanText(currentOptions[key].join(' '));
        if (text) {
          optionsObj[key] = text;
        }
      });
      
      // Only add if we have options (avoids saving garbage headings at the very start)
      if (Object.keys(optionsObj).length > 0) {
        questions.push({
          question: cleanText(currentQuestionText.join(' ')),
          options: optionsObj,
          answer: currentAnswer ? currentAnswer.trim().toUpperCase() : '',
          note: cleanText(currentNoteLines.join(' '))
        });
      }
    }
    
    // Reset accumulators
    currentQuestionText = [];
    currentOptions = { A: [], B: [], C: [], D: [] };
    currentOptionKey = null;
    currentAnswer = null;
    currentNoteLines = [];
    state = 'QUESTION';
    openBrackets = 0;
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line is an option indicator e.g. "A. ", "A . ", "A  "
    const optionMatch = line.match(/^([A-D])\s*[\.\s]\s*(.*)$/i);
    
    if (optionMatch && state !== 'NOTE') {
      const matchedKey = optionMatch[1].toUpperCase();
      // If we are in QUESTION state, we only transition to OPTIONS on Option A/a
      if (state === 'QUESTION' && matchedKey !== 'A') {
        // Do not transition, treat as part of the question
      } else {
        state = 'OPTIONS';
        currentOptionKey = matchedKey;
        currentOptions[currentOptionKey].push(optionMatch[2]);
        continue;
      }
    }
    
    // If we are in OPTIONS state and encounter an answer key
    // Answer keys in Quizlet are isolated letters A, B, C, D (or multiple e.g. BCD) on their own line
    const isAnswerKey = /^[A-D]+$/i.test(line);
    if (state === 'OPTIONS' && isAnswerKey) {
      state = 'ANSWER';
      currentAnswer = line;
      continue;
    }
    
    if (state === 'QUESTION') {
      currentQuestionText.push(line);
    } else if (state === 'OPTIONS') {
      // Continue option text if it is split on multiple lines
      if (currentOptionKey) {
        currentOptions[currentOptionKey].push(line);
      }
    } else if (state === 'ANSWER' || state === 'NOTE') {
      // If we encounter a line starting with '(' in ANSWER or NOTE state, it's a note (e.g. alternate question)
      if (line.startsWith('(') || state === 'NOTE') {
        state = 'NOTE';
        currentNoteLines.push(line);
        
        // Track parenthesis to find the end of the note block
        for (let char of line) {
          if (char === '(') openBrackets++;
          if (char === ')') openBrackets--;
        }
        
        if (openBrackets <= 0) {
          // Note bracket closed, next line will start a new question
          saveCurrentQuestion();
        }
      } else {
        // Not a note, so it must be the start of a new question
        saveCurrentQuestion();
        currentQuestionText.push(line);
      }
    }
  }
  
  // Save the last question
  saveCurrentQuestion();
  
  return questions;
}

// Calculate Jaccard similarity index between two strings (word-based)
function getJaccardSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/g, '');
  
  const words1 = new Set(s1.split(/\s+/).filter(w => w.length > 0));
  const words2 = new Set(s2.split(/\s+/).filter(w => w.length > 0));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// Merge old JSON explanations and keywords into new parsed questions using 1-to-1 greedy matching
function reconcileQuestions(parsedList, oldList) {
  const pairs = [];
  
  // Calculate similarity for all possible pairs
  for (let newIdx = 0; newIdx < parsedList.length; newIdx++) {
    for (let oldIdx = 0; oldIdx < oldList.length; oldIdx++) {
      const sim = getJaccardSimilarity(parsedList[newIdx].question, oldList[oldIdx].question);
      if (sim >= 0.80) {
        pairs.push({ newIdx, oldIdx, sim });
      }
    }
  }
  
  // Sort pairs by similarity descending
  pairs.sort((a, b) => b.sim - a.sim);
  
  const matchedNew = new Set();
  const matchedOld = new Set();
  const newToOldMap = new Map();
  
  for (let pair of pairs) {
    if (!matchedNew.has(pair.newIdx) && !matchedOld.has(pair.oldIdx)) {
      matchedNew.add(pair.newIdx);
      matchedOld.add(pair.oldIdx);
      newToOldMap.set(pair.newIdx, oldList[pair.oldIdx]);
    }
  }
  
  const reconciledList = parsedList.map((newQ, index) => {
    const resultQ = {
      id: index + 1, // Reset ID to sequential order
      question: newQ.question,
      options: newQ.options,
      answer: newQ.answer,
      note: newQ.note,
      explanation: "",
      keywords: ""
    };
    
    const matchedOldQ = newToOldMap.get(index);
    if (matchedOldQ) {
      resultQ.explanation = matchedOldQ.explanation || "";
      resultQ.keywords = matchedOldQ.keywords || "";
      
      // Merge notes if both exist
      if (matchedOldQ.note && matchedOldQ.note.trim() !== "") {
        if (!resultQ.note) {
          resultQ.note = matchedOldQ.note;
        } else if (resultQ.note.indexOf(matchedOldQ.note) === -1) {
          resultQ.note = `${resultQ.note} | Ghi chú cũ: ${matchedOldQ.note}`;
        }
      }
    }
    
    return resultQ;
  });
  
  return { reconciledList, matchedCount: matchedNew.size };
}

// Perform verification on final questions list
function validateList(list, subjectName) {
  console.log(`\n--- Validation Report for ${subjectName} ---`);
  let invalidAnswers = 0;
  let nonFourOptions = 0;
  
  list.forEach((q, idx) => {
    // Check answer format
    if (!q.answer || !/^[A-D]+$/i.test(q.answer)) {
      invalidAnswers++;
      console.warn(`[WARN] Question #${q.id} has invalid answer: "${q.answer}"`);
    }
    // Check number of options
    const optionKeys = Object.keys(q.options);
    if (optionKeys.length !== 4) {
      nonFourOptions++;
      console.warn(`[WARN] Question #${q.id} has ${optionKeys.length} options (Expected 4)`);
    }
  });
  
  console.log(`Total questions: ${list.length}`);
  console.log(`Questions with invalid answer format: ${invalidAnswers}`);
  console.log(`Questions with options length != 4: ${nonFourOptions}`);
}

async function run() {
  // 1. Process MLN111
  console.log("================= PROCESSING MLN111 =================");
  const raw111 = replaceHomoglyphs(fs.readFileSync('docs/mln111_raw.txt', 'utf-8'));
  const old111 = JSON.parse(fs.readFileSync('questions.json', 'utf-8'));
  
  const cleanLines111 = preprocessRawText(raw111, 'MLN111');
  const parsed111 = parseCleanLines(cleanLines111);
  console.log(`Parsed ${parsed111.length} questions from MLN111 PDF.`);
  
  const { reconciledList: final111, matchedCount: matched111 } = reconcileQuestions(parsed111, old111);
  console.log(`Matched and merged metadata for ${matched111} / ${parsed111.length} questions.`);
  
  validateList(final111, 'MLN111');
  fs.writeFileSync('questions.json', JSON.stringify(final111, null, 2), 'utf-8');
  console.log("Saved reconciled MLN111 questions to questions.json");
  
  // 2. Process MLN122
  console.log("\n================= PROCESSING MLN122 =================");
  const raw122 = replaceHomoglyphs(fs.readFileSync('docs/mln122_raw.txt', 'utf-8'));
  const old122 = JSON.parse(fs.readFileSync('questions_mln122.json', 'utf-8'));
  
  const cleanLines122 = preprocessRawText(raw122, 'MLN122');
  const parsed122 = parseCleanLines(cleanLines122);
  console.log(`Parsed ${parsed122.length} questions from MLN122 PDF.`);
  
  const { reconciledList: final122, matchedCount: matched122 } = reconcileQuestions(parsed122, old122);
  console.log(`Matched and merged metadata for ${matched122} / ${parsed122.length} questions.`);
  
  validateList(final122, 'MLN122');
  fs.writeFileSync('questions_mln122.json', JSON.stringify(final122, null, 2), 'utf-8');
  console.log("Saved reconciled MLN122 questions to questions_mln122.json");
}

run().catch(console.error);
