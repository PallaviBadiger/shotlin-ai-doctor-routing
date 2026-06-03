require('dotenv').config();

const config = {
  port:         parseInt(process.env.PORT) || 5000,
  nodeEnv:      process.env.NODE_ENV || 'development',
  jwtSecret:    process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadDir:    process.env.UPLOAD_DIR || 'uploads',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB) || 10,
  geminiApiKey: process.env.GEMINI_API_KEY,
  useGemini:    process.env.USE_GEMINI === 'true',
  frontendUrl:  process.env.FRONTEND_URL || 'http://localhost:3000'
};

// Fail fast if critical config is missing
const required = ['jwtSecret'];
for (const key of required) {
  if (!config[key]) throw new Error(`Missing required env var: ${key}`);
}

module.exports = config;