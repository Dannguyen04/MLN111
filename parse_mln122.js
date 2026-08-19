const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, 'mln122_source (1).md');
const outputPath = path.join(__dirname, 'questions_mln122.json');

function normalizeText(str) {
  if (!str) return '';
  return str
    .replace(/\r/g, '')
    .replace(/\u0410/g, 'A').replace(/\u0412/g, 'B').replace(/\u0421/g, 'C').replace(/\u0415/g, 'E')
    .replace(/\u0430/g, 'a').replace(/\u0435/g, 'e').replace(/\u0441/g, 'c')
    .replace(/\u0406/g, 'I').replace(/\u0456/g, 'i')
    .replace(/\s+/g, ' ')
    .trim();
}

function applyPatches(questions) {
  let cleaned = [];

  for (let q of questions) {
    let qText = q.question;

    // Patch 1: Trong các nhà kinh điển...
    if (qText.includes("tự do cạnh tranh đẻ ra tập trung sản xuất")) {
      q.question = "Trong các nhà kinh điển của chủ nghĩa Mác - Lênin, ai là người khái quát về nguyên nhân ra đời của chủ nghĩa tư bản độc quyền bằng câu: \"tự do cạnh tranh đẻ ra tập trung sản xuất và sự tập trung sản xuất này, khi phát triển tới một mức độ nhất định lại dẫn tới độc quyền\"?";
      q.options = {
        "A": "Ph. Ăngghen",
        "B": "C. Mác",
        "C": "Ph. Ăngghen và C. Mác",
        "D": "V.I. Lênin"
      };
      q.answer = "D";
    }

    // Patch 2: Tuần hoàn tư bản công nghiệp
    else if (qText.includes("Tuần hoàn tư bản công nghiệp là sự thống nhất")) {
      q.question = "Tuần hoàn tư bản công nghiệp là sự thống nhất của ba hình thái tuần hoàn:";
      q.options = {
        "A": "Tư bản lưu thông, tư bản sản xuất và tư bản hàng hóa",
        "B": "Tư bản tiền tệ, tư bản sản xuất và tư bản cho vay",
        "C": "Tư bản tiền tệ, tư bản sản xuất và tư bản hàng hóa",
        "D": "Tư bản tiền tệ, tư bản trao đổi và tư bản hàng hóa"
      };
      q.answer = "C";
      q.note = "Kiểu hỏi khác: Ba giai đoạn vận động của tuần hoàn tư bản công nghiệp là: -> Lưu thông - sản xuất - lưu thông";
    }

    // Patch 3: Hai hàng hoá trao đổi được với nhau vì
    else if (qText.includes("Hai hàng hoá trao đổi được với nhau vì")) {
      q.question = "Hai hàng hoá trao đổi được với nhau vì:";
      q.options = {
        "A": "Có lượng thời gian hao phí lao động xã hội cần thiết để sản xuất ra chúng bằng nhau.",
        "B": "Chúng cùng là sản phẩm của lao động.",
        "C": "Các phương án trả lời đều đúng"
      };
      q.answer = "C";
    }

    // Patch 4: Thuật ngữ kinh tế-chính trị
    else if (qText.includes("Thuật ngữ \"kinh tế- chính trị\" được sử")) {
      q.question = "Thuật ngữ \"kinh tế - chính trị\" được sử dụng lần đầu tiên vào năm nào?";
      q.options = {
        "A": "1615",
        "B": "1616",
        "C": "1617",
        "D": "1618"
      };
      q.answer = "A";
      q.note = "Kiểu hỏi khác: Ai là người đầu tiên đưa ra khái niệm \"kinh tế-chính trị\"? -> Antoine Montchrétien";
    }

    // Patch 5: Về mặt lượng giữa p' và m'
    else if (qText.includes("Vê mặt lượng giữa p' và m' thì")) {
      q.question = "Về mặt lượng giữa p' và m' thì:";
      q.options = {
        "A": "p' luôn nhỏ hơn m'",
        "B": "p' luôn lớn hơn m'",
        "C": "p' bằng m'"
      };
      q.answer = "A";
    }

    // Patch 6: m' = giá trị thặng dư
    else if (qText.includes("Các công thức tính tỷ suất giá trị thặng dư dưới đây")) {
      q.question = "Các công thức tính tỷ suất giá trị thặng dư dưới đây, công thức nào đúng?";
      q.options = {
        "A": "m' = giá trị thặng dư / tư bản khả biến * 100%",
        "B": "m' = thời gian lao động tất yếu / thời gian lao động cần thiết * 100%",
        "C": "m' = thời gian lao động thặng dư / lao động cần thiết * 100%",
        "D": "m' = giá trị sức lao động / giá trị thặng dư * 100%"
      };
      q.answer = "A";
    }

    // Patch 7: Điều gì xảy ra nếu cung thấp hơn cầu
    else if (qText.includes("Điều gì xảy ra nếu cung thấp hơn cầu")) {
      q.question = "Điều gì xảy ra nếu cung thấp hơn cầu?";
      q.options = {
        "A": "Giá cả cao hơn giá trị",
        "B": "Giá cả thấp hơn giá trị",
        "C": "Giá cả bằng giá trị",
        "D": "Giá trị cao hơn giá cả"
      };
      q.answer = "A";
    }

    // Patch 8: Unmerge multi-questions in last row if any
    else if (qText.includes("Quá trình sản xuất là sự kết hợp của các yếu tố nào")) {
      cleaned.push({
        question: "Quá trình sản xuất là sự kết hợp của các yếu tố nào?",
        options: {
          "A": "Sức lao động với đối tượng lao động và tư liệu lao động",
          "B": "Lao động với đối tượng lao động và tư liệu lao động",
          "C": "Sức lao động với công cụ lao động",
          "D": "Lao động với sự điều tiết, quản lý của nhà tư bản"
        },
        answer: "A",
        note: ""
      });

      cleaned.push({
        question: "Nội dung nào không phải là tác động tích cực của hội nhập kinh tế quốc tế?",
        options: {
          "A": "Hội nhập kinh tế quốc tế làm gia tăng sự cạnh tranh",
          "B": "Tạo điều kiện mở rộng thị trường, tiếp thu khoa học công nghệ, vốn, chuyển dịch cơ cấu kinh tế trong nước",
          "C": "Tạo cơ hội để nâng cao chất lượng nguồn nhân lực",
          "D": "Tạo điều kiện thúc đẩy hội nhập các linh vực văn hóa, chính trị, củng cố an ninh - quốc phòng"
        },
        answer: "A",
        note: ""
      });

      cleaned.push({
        question: "Đâu là các đại diện tiêu biểu của trường phái kinh tế chính trị cổ điển Anh?",
        options: {
          "A": "William Petty, A. Smith, David Ricardo",
          "B": "Pierre Boisguillebert, Francois Quesnay, Jacques Turgot",
          "C": "William Stafford, Thomas Mun, Gasparo Scaruffi",
          "D": "Antonio Serra, A. Montchrétien, Francois Quesnay"
        },
        answer: "A",
        note: ""
      });

      cleaned.push({
        question: "Đặc trưng phổ biến của nền kinh tế thị trường là gì?",
        options: {
          "A": "Có sự đa dạng của các chủ thể kinh tế, nhiều hình thức sở hữu, thị trường đóng vai trò quyết định trong việc phân bổ các nguồn lực xã hội; giá cả được hình thành theo nguyên tắc thị trường; là nền kinh tế mở",
          "B": "Có sự đa dạng của các chủ thể kinh tế, nhiều hình thức sở hữu, thị trường đóng vai trò quyết định trong việc phân bổ các nguồn lực xã hội; giá cả được hình thành theo nguyên tắc thị trường; là nền kinh tế đóng",
          "C": "Có sự đa dạng của các chủ thể kinh tế, nhiều hình thức sở hữu; nhà nước đóng vai trò quyết định trong việc phân bổ các nguồn lực xã hội, giá cả được hình thành theo nguyên tắc thị trường, là nền kinh tế đóng",
          "D": "Có sự đa dạng của các chủ thể kinh tế, nhiều hình thức sở hữu; thị trường đóng vai trò quyết định trong việc phân bổ các nguồn lực xã hội; giá cả được hình thành theo quy luật cung - cầu; là nền kinh tế mở"
        },
        answer: "A",
        note: ""
      });

      cleaned.push({
        question: "Tư bản thương nghiệp của chủ nghĩa tư bản là:",
        options: {
          "A": "Là một bộ phận của tư bản nông nghiệp tách ra phục vụ quá trình lưu thông hàng hóa",
          "B": "Là một bộ phận của tư bản công nghiệp tách ra phục vụ quá trình lưu thông hàng hóa",
          "C": "Là một bộ phận của tư bản cho vay tách ra phục vụ quá trình lưu thông hàng hóa",
          "D": "Là một bộ phận của tư bản thương nghiệp tách ra phục vụ quá trình lưu thông hàng hóa"
        },
        "answer": "B",
        "note": ""
      });
      continue;
    }

    cleaned.push(q);
  }

  // Re-assign continuous IDs
  cleaned.forEach((q, idx) => {
    q.id = idx + 1;
  });

  return cleaned;
}

function parseMarkdownTable() {
  const content = fs.readFileSync(mdPath, 'utf8');
  const lines = content.split('\n');

  let rawTableRows = [];
  let currentPipeLine = '';

  for (let line of lines) {
    let trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.includes(':----') || trimmed === '| ---- |' || trimmed.startsWith('| ---')) continue;

    if (trimmed.startsWith('|')) {
      if (currentPipeLine) {
        rawTableRows.push(currentPipeLine);
      }
      currentPipeLine = trimmed;
    } else if (currentPipeLine) {
      currentPipeLine += ' ' + trimmed;
    }
  }
  if (currentPipeLine) {
    rawTableRows.push(currentPipeLine);
  }

  let mergedRows = [];
  for (let row of rawTableRows) {
    let parts = row.split('|').map(p => p.trim());
    if (parts.length < 3) continue;

    let col1 = parts[1];
    let col2 = parts[2];

    if (!col1 && !col2) continue;
    if (col1 === '-----' || col1 === ':----' || col1 === '---') continue;

    if (mergedRows.length > 0) {
      let prev = mergedRows[mergedRows.length - 1];
      let col1Norm = normalizeText(col1);
      
      const isContinuation = 
        !col2 || 
        col1Norm.match(/^([a-d]\.|\d{4}|5000 USD|bốc lột|10000 đối|tư \d+|hàng hóa|bản |nhất của|Tư bản|a\. Tư|b\. Tư|c\. Tư|d\. Tư)/i);

      if (isContinuation && !col1Norm.match(/^(\d+\.|\*\*[A-Z]|\|\s*Biểu)/)) {
        prev.col1 += ' ' + col1;
        if (col2) prev.col2 = (prev.col2 ? prev.col2 + ' ' : '') + col2;
        continue;
      }
    }

    mergedRows.push({ col1, col2 });
  }

  let parsedQuestions = [];

  for (let i = 0; i < mergedRows.length; i++) {
    let { col1, col2 } = mergedRows[i];
    col1 = normalizeText(col1);
    col2 = normalizeText(col2);

    if (!col1 || col1 === '-----') continue;

    let answer = '';
    let note = '';

    const ansMatch = col2.match(/^([A-Ea-e]+)\b(?:\s*[\*\(\[]?(.*)[\*\)\]]?)?/i);
    if (ansMatch) {
      answer = ansMatch[1].toUpperCase();
      let rawNote = ansMatch[2] || '';
      note = rawNote.replace(/^[\*\(\s]+/, '').replace(/[\*\)\s]+$/, '').trim();
    } else {
      answer = col2.toUpperCase();
    }

    let { question, options } = smartExtractQuestionAndOptions(col1);

    parsedQuestions.push({
      id: parsedQuestions.length + 1,
      question: question,
      options: options,
      answer: answer,
      note: note
    });
  }

  let finalQuestions = applyPatches(parsedQuestions);
  let finalIssues = finalQuestions.filter(q => Object.keys(q.options).length < 2);

  console.log(`Parsed Final Total: ${finalQuestions.length}`);
  console.log(`Remaining Questions with issues (< 2 options): ${finalIssues.length}`);

  fs.writeFileSync(outputPath, JSON.stringify(finalQuestions, null, 2));
}

function smartExtractQuestionAndOptions(col1) {
  let optionsObj = {};
  let questionText = col1;
  const letters = ['A', 'B', 'C', 'D', 'E'];

  const optMatches = [...col1.matchAll(/(?:^|\s+)([A-Ea-e])[\.\)\-]\s+/g)];
  if (optMatches.length >= 2) {
    questionText = col1.substring(0, optMatches[0].index).trim();
    for (let m = 0; m < optMatches.length; m++) {
      let letter = optMatches[m][1].toUpperCase();
      let start = optMatches[m].index + optMatches[m][0].length;
      let end = (m + 1 < optMatches.length) ? optMatches[m + 1].index : col1.length;
      optionsObj[letter] = col1.substring(start, end).trim();
    }
    return { question: questionText, options: optionsObj };
  }

  let qMarkIdx = col1.indexOf('?');
  if (qMarkIdx !== -1) {
    questionText = col1.substring(0, qMarkIdx + 1).trim();
    let optionsText = col1.substring(qMarkIdx + 1).trim();
    optionsObj = parseOptionsText(optionsText);
    if (Object.keys(optionsObj).length >= 2) {
      return { question: questionText, options: optionsObj };
    }
  }

  const mathMatches = [...col1.matchAll(/(?:^|\s+)(p'=\s*|m'=\s*)/g)];
  if (mathMatches.length >= 2) {
    questionText = col1.substring(0, mathMatches[0].index).trim();
    for (let m = 0; m < mathMatches.length; m++) {
      let letter = letters[m];
      let start = mathMatches[m].index;
      let end = (m + 1 < mathMatches.length) ? mathMatches[m + 1].index : col1.length;
      optionsObj[letter] = col1.substring(start, end).trim();
    }
    return { question: questionText, options: optionsObj };
  }

  let minQIdx = Math.min(15, Math.floor(col1.length * 0.20));
  const capRegex = /\s+([A-ZÂĂĐÊÔƠƯ0-9][a-zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ0-9\/]*)/g;
  let candidateSplits = [];
  let match;
  while ((match = capRegex.exec(col1)) !== null) {
    if (match.index >= minQIdx) {
      candidateSplits.push(match.index);
    }
  }

  for (let splitIdx of candidateSplits) {
    let qCandidate = col1.substring(0, splitIdx).trim();
    let optCandidate = col1.substring(splitIdx).trim();

    let testOpts = parseOptionsText(optCandidate);
    if (Object.keys(testOpts).length >= 3) {
      questionText = qCandidate;
      optionsObj = testOpts;
      return { question: questionText, options: optionsObj };
    }
  }

  const specialMatch = col1.match(/(.*?)\s+(c\/v|T\/T|m\/v|CH\/ch)\s+(.*)/);
  if (specialMatch) {
    questionText = specialMatch[1].trim();
    let remaining = specialMatch[2] + ' ' + specialMatch[3];
    let parts = remaining.split(/\s+/);
    parts.forEach((p, idx) => {
      if (idx < letters.length) optionsObj[letters[idx]] = p;
    });
    return { question: questionText, options: optionsObj };
  }

  return { question: col1, options: optionsObj };
}

function parseOptionsText(optionsText) {
  optionsText = optionsText.trim();
  let optionsObj = {};
  const letters = ['A', 'B', 'C', 'D', 'E'];

  if (!optionsText) return optionsObj;

  if (optionsText.includes(';')) {
    let parts = optionsText.split(';').map(s => s.trim()).filter(Boolean);
    parts.forEach((p, i) => {
      if (i < letters.length) optionsObj[letters[i]] = p;
    });
    return optionsObj;
  }

  const years = optionsText.match(/\b(19\d\d|20\d\d|16\d\d|17\d\d|18\d\d)\b/g);
  if (years && years.length >= 3) {
    years.forEach((y, i) => {
      if (i < letters.length) optionsObj[letters[i]] = y;
    });
    return optionsObj;
  }

  const capRegex = /(?:^|\s+)([A-ZÂĂĐÊÔƠƯ0-9][a-zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ0-9]*)/g;
  let matches = [...optionsText.matchAll(capRegex)];

  let startIndices = [];
  for (let m of matches) {
    let idx = m.index === 0 ? 0 : m.index + m[0].indexOf(m[1]);
    startIndices.push(idx);
  }

  let validIndices = [];
  for (let idx of startIndices) {
    if (validIndices.length === 0) {
      validIndices.push(idx);
    } else {
      let prevIdx = validIndices[validIndices.length - 1];
      if (idx - prevIdx >= 3) {
        validIndices.push(idx);
      }
    }
  }

  if (validIndices.length >= 3) {
    let chosenIndices = validIndices;
    if (validIndices.length > 4) {
      chosenIndices = validIndices.slice(0, 4);
    }
    for (let i = 0; i < chosenIndices.length; i++) {
      let start = chosenIndices[i];
      let end = (i + 1 < chosenIndices.length) ? chosenIndices[i + 1] : optionsText.length;
      let val = optionsText.substring(start, end).trim();
      if (val) optionsObj[letters[i]] = val;
    }
  }

  return optionsObj;
}

parseMarkdownTable();
