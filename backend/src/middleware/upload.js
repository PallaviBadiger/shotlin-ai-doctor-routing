const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the uploads directory path
const UPLOAD_PATH = path.join(process.cwd(), 'uploads');

// Ensure the directory exists synchronously at startup
if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

/**
 * Storage configuration for medical reports.
 * Uses unique filenames to prevent overwriting existing files.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

/**
 * File filter to ensure only valid medical report formats are accepted.
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit files to 5MB
  },
});

module.exports = upload;