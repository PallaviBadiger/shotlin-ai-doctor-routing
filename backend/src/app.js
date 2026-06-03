const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const path        = require('path');
const config      = require('./config/env');
const { notFound, globalError } = require('./middleware/error.middleware');

const authRoutes  = require('./modules/auth/auth.routes');

const app = express();

// ─── Security headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      config.frontendUrl,
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// ─── Rate limiting ───────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 min
  max:      20,
  message:  { success: false, error: 'Too many requests, please try again later' }
});

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Request logging ──────────────────────────────────────────────────────────
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
}

// ─── Static files (uploaded reports) ─────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', config.uploadDir)));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'OK', timestamp: new Date().toISOString() });
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
// Day 2+ routes added here:
// app.use('/api/doctors',  doctorRoutes);
// app.use('/api/reports',  reportRoutes);
// app.use('/api/admin',    adminRoutes);

// ─── 404 + global error handler ───────────────────────────────────────────────
app.use(notFound);
app.use(globalError);

app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
});

module.exports = app;