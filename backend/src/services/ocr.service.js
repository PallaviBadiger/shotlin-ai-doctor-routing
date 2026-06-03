const Tesseract = require('tesseract.js');
const pdfParse  = require('pdf-parse');
const fs        = require('fs');
const path      = require('path');

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    const buffer = fs.readFileSync(filePath);
    const data   = await pdfParse(buffer);
    return data.text;
  }

  // Image: JPG/PNG
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
    logger: () => {}  // suppress logs
  });
  return text;
}

module.exports = { extractText };