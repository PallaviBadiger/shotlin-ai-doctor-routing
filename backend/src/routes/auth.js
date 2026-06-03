const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma  = require('../lib/prisma');
const { authenticate } = require('../middleware/auth.middleware');

function ok(res, data, status = 200)  { return res.status(status).json({ success: true, data }); }
function fail(res, msg, status = 400) { return res.status(status).json({ success: false, error: msg }); }

// POST /api/auth/register
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name required'),
  body('age').isInt({ min: 1, max: 120 }).withMessage('Valid age required'),
  body('gender').isIn(['Male', 'Female', 'Other', 'Prefer not to say']).withMessage('Gender required'),
  body('phone').optional(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return fail(res, errors.array()[0].msg, 422);
  }

  try {
    const { email, password, name, age, gender, phone } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return fail(res, 'Email already registered', 409);

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email, password: hashed, role: 'PATIENT',
        patientProfile: { create: { name, age: parseInt(age), gender, phone: phone || '' } },
      },
      include: { patientProfile: true },
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return ok(res, {
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.patientProfile.name }
    }, 201);
  } catch (e) {
    return fail(res, e?.message || String(e), 500);
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Login validation errors:', errors.array());
    return fail(res, errors.array()[0].msg, 422);
  }

  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where:   { email },
      include: { patientProfile: true, doctorProfile: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return fail(res, 'Invalid email or password', 401);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const profile = user.patientProfile || user.doctorProfile;
    return ok(res, {
      token,
      user: { id: user.id, email: user.email, role: user.role, name: profile?.name || 'Admin' },
    });
  } catch (e) {
    return fail(res, e?.message || String(e), 500);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: {
        id: true, email: true, role: true, createdAt: true,
        patientProfile: true, doctorProfile: true,
      },
    });
    if (!user) return fail(res, 'User not found', 404);
    return ok(res, user);
  } catch (e) {
    return fail(res, e?.message || String(e), 500);
  }
});

module.exports = router;