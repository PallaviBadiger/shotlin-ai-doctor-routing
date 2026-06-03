require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const path        = require('path');
const fs          = require('fs');
const prisma = require('./lib/prisma');

const authRoutes    = require('./routes/auth');
const reportRoutes  = require('./routes/reports');
const doctorRoutes  = require('./routes/doctors');
const adminRoutes   = require('./routes/admin');

const app    = express();


// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message:  { success: false, error: 'Too many requests, please try again later.' },
});

// Body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, '..', uploadDir)));

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth',    authLimiter, authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/admin',   adminRoutes);

// NOTE: Intentionally NOT mounting ./routes/doctorPanel.
// There is no stable routes/doctorPanel.js file (a file exists as "Doctorpanel · JS"),
// which causes startup to fail with "Cannot find module".

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err?.message || String(err));
  const status = err?.statusCode || 500;
  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : err?.message || String(err),
  });
});

// Start server
const PORT = parseInt(process.env.PORT) || 5000;

async function start() {
  try {
    await prisma.$connect();
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Gemini AI: ${process.env.USE_GEMINI === 'true' ? 'enabled' : 'disabled'}`);
    });
  } catch (err) {
    console.error('Failed to start:', err.message);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

start();

module.exports = app;