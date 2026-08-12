const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, 'MLN111_FE.docx.md');
const outputPath = path.join(__dirname, 'questions.json');

// Helper to normalize Cyrillic characters to Latin look-alikes
function normalizeText(text) {
  if (!text) return '';
  return text
    .replace(/\u0410/g, 'A') // Cyrillic A
    .replace(/\u0412/g, 'B') // Cyrillic B
    .replace(/\u0421/g, 'C') // Cyrillic C
    .replace(/\u0415/g, 'E') // Cyrillic E
    .replace(/\u0430/g, 'a') // Cyrillic a
    .replace(/\u0435/g, 'e') // Cyrillic e
    .replace(/\u0441/g, 'c') // Cyrillic c
    .replace(/\u0406/g, 'I') // Cyrillic I
    .replace(/\u0456/g, 'i'); // Cyrillic i
}

function parse() {
  const content = fs.readFileSync(mdPath, 'utf8');
  const rawLines = content.split(/\r?\n/);
  
  let questions = [];
  let currentQ = null;
  let state = 'QUESTION'; // 'QUESTION', 'OPTIONS', 'ANSWER_AND_NOTE'

  // Helper to parse option
  function parseOption(line) {
    const norm = normalizeText(line);
    const match = norm.match(/^\s*([A-E])\s*[\.\)]\s*(.*)/i);
    if (match) {
      return {
        letter: match[1].toUpperCase(),
        text: match[2].trim()
      };
    }
    return null;
  }

  // Helper to parse question number
  function parseQuestionNumber(line) {
    const match = line.match(/^\s*(\d+)\.\s*(.*)/);
    if (match) {
      return {
        num: parseInt(match[1]),
        text: match[2].trim()
      };
    }
    return null;
  }

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (line === '') {
      if (state === 'ANSWER_AND_NOTE' && currentQ) {
        currentQ.note += '\n';
      }
      continue;
    }

    const qNum = parseQuestionNumber(line);
    const opt = parseOption(line);

    if (qNum) {
      if (currentQ) {
        questions.push(currentQ);
      }
      currentQ = {
        id: qNum.num,
        question: qNum.text,
        options: {},
        answer: '',
        note: ''
      };
      state = 'QUESTION';
    } else if (opt) {
      if (!currentQ) {
        currentQ = {
          id: questions.length + 1,
          question: '',
          options: {},
          answer: '',
          note: ''
        };
      }
      currentQ.options[opt.letter] = opt.text;
      state = 'OPTIONS';
    } else {
      if (state === 'QUESTION') {
        if (currentQ) {
          currentQ.question += (currentQ.question ? ' ' : '') + line;
        } else {
          currentQ = {
            id: questions.length + 1,
            question: line,
            options: {},
            answer: '',
            note: ''
          };
        }
      } else if (state === 'OPTIONS') {
        // Find answer letter(s)
        const cleanLine = normalizeText(line).replace(/[\*\s\(\)]/g, '').toUpperCase();
        const optionKeys = Object.keys(currentQ.options);
        const isAnswerFormat = optionKeys.some(k => normalizeText(line).toUpperCase().startsWith(k)) && line.length < 50;

        if (isAnswerFormat) {
          let ans = '';
          for (let char of cleanLine) {
            if (optionKeys.includes(char)) {
              ans += char;
            } else {
              break;
            }
          }
          if (ans) {
            currentQ.answer = ans;
            currentQ.note = line.substring(line.toUpperCase().indexOf(ans) + ans.length).trim();
            state = 'ANSWER_AND_NOTE';
          } else {
            currentQ.note += (currentQ.note ? ' ' : '') + line;
            state = 'ANSWER_AND_NOTE';
          }
        } else {
          currentQ.note += (currentQ.note ? ' ' : '') + line;
          state = 'ANSWER_AND_NOTE';
        }
      } else if (state === 'ANSWER_AND_NOTE') {
        // Lookahead to see if next block is a new question
        let isNextQuestion = false;
        let nextLineIndex = i;
        while (nextLineIndex + 1 < rawLines.length) {
          nextLineIndex++;
          const nextLine = rawLines[nextLineIndex].trim();
          if (nextLine === '') continue;
          if (parseOption(nextLine)) {
            isNextQuestion = true;
          }
          break;
        }

        if (isNextQuestion) {
          if (currentQ) {
            questions.push(currentQ);
          }
          currentQ = {
            id: questions.length + 1,
            question: line,
            options: {},
            answer: '',
            note: ''
          };
          state = 'QUESTION';
        } else {
          currentQ.note += (currentQ.note ? ' \n' : '') + line;
        }
      }
    }
  }

  if (currentQ) {
    questions.push(currentQ);
  }

  // Post-process cleaning and custom patches
  questions = questions.map(q => {
    q.question = q.question.trim().replace(/\\-/g, '-').replace(/\\\*/g, '*');
    q.note = q.note.trim().replace(/\\-/g, '-').replace(/\\\*/g, '*');

    // Remove any trailing parenthesis or garbage from question
    if (q.question.startsWith('(') && q.question.endsWith(')')) {
      q.question = q.question.substring(1, q.question.length - 1).trim();
    }

    // Try to recover answers from notes if answer is empty
    if (!q.answer && q.note) {
      const firstChar = q.note[0].toUpperCase();
      if (Object.keys(q.options).includes(firstChar)) {
        q.answer = firstChar;
        q.note = q.note.substring(1).trim();
      }
    }

    // Custom Patch for Q176 (short answer question)
    if (q.id === 176 && q.question.includes('Quy luật lượng chất')) {
      q.question = "Một sinh viên chuẩn bị bài thuyết trình trong một tháng theo cách thức: Tuần đầu phác thảo đề cương và hàng ngày dành 30 phút sửa chữa bổ sung hoàn thiện. Vào buổi thuyết trình sinh viên đã có một bản thảo hoàn chỉnh. Công việc trên đã diễn ra theo quy luật, nguyên lý nào?";
      q.answer = "Quy luật lượng chất";
      q.options = {};
      q.note = "";
    }

    // Custom Patch for the unnumbered question about world outlook core
    if (q.question.includes('Hạt nhân hợp lý của thế giới quan khoa học là chủ nghĩa nào')) {
      q.answer = "C"; // Duy vật biện chứng
      // clean up trailing parenthesis if present
      q.question = q.question.replace(/^\s*\(\*Học hiểu câu hỏi để trả lời câu:\*\s*/i, '').replace(/\)$/, '').trim();
    }

    return q;
  });

  // Re-index questions to ensure unique, consecutive IDs
  questions.forEach((q, idx) => {
    q.id = idx + 1;
  });

  fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
  console.log(`Successfully parsed and saved ${questions.length} questions to ${outputPath}`);
}

parse();
