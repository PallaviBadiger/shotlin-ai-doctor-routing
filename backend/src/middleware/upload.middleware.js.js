const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const config = require('../config/env');

// Ensure uploads dir exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadDir),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext    = path.extname(file.originalname).toLowerCase();
    cb(null, `report-${unique}${ext}`);
  }
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];

const fileFilter = (req, file, cb) => {
  const ext  = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedMimeTypes.includes(mime) && allowedExtensions.includes(ext)) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 }
});

module.exports = upload;