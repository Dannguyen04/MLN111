const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function extractText(pdfRelativePath, txtRelativePath) {
  const pdfPath = path.join(__dirname, pdfRelativePath);
  const txtPath = path.join(__dirname, txtRelativePath);
  
  if (!fs.existsSync(pdfPath)) {
    console.error(`PDF not found at: ${pdfPath}`);
    return;
  }
  
  console.log(`Extracting ${pdfRelativePath} ...`);
  const parser = new PDFParse({ url: pdfPath });
  
  try {
    const result = await parser.getText();
    const text = typeof result === 'string' ? result : result.text;
    fs.writeFileSync(txtPath, text, 'utf-8');
    console.log(`Saved raw text to: ${txtRelativePath} (Total length: ${text.length} chars)`);
    parser.destroy();
  } catch (err) {
    console.error(`Failed to extract ${pdfRelativePath}:`, err);
  }
}

async function run() {
  await extractText(
    'docs/MLN111-CHUẨN-NHUNG-HOÀNG-Flashcards-_-Quizlet.pdf',
    'docs/mln111_raw.txt'
  );
  await extractText(
    'docs/Thẻ ghi nhớ_ MLN122 - CHUẨN NHUNG HOÀNG _ Quizlet.pdf',
    'docs/mln122_raw.txt'
  );
  console.log("Extraction complete!");
}

run();
