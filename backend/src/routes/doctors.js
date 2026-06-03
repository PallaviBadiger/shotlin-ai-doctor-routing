const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middleware/auth.middleware');

function ok(res, data, status = 200) { return res.status(status).json({ success: true, data }); }
function fail(res, msg, status = 400) { return res.status(status).json({ success: false, error: msg }); }

// GET /api/doctors
router.get('/', authenticate, async (req, res) => {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      include: { user: { select: { id: true, email: true, role: true } } },
      orderBy: { name: 'asc' },
    });
    return ok(res, doctors);
  } catch (e) {
    return fail(res, e?.message || String(e), 500);
  }
});

// GET /api/doctors/my-reports — reports assigned to the logged-in doctor
router.get('/my-reports', authenticate, authorize('DOCTOR'), async (req, res) => {
  try {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!doctorProfile) return fail(res, 'Doctor profile not found', 404);

    const reports = await prisma.patientReport.findMany({
      where: { assignment: { doctorProfileId: doctorProfile.id } },
      include: {
        patient:    true,
        aiAnalysis: true,
        assignment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, reports);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// GET /api/doctors/assigned-reports — alias for my-reports
router.get('/assigned-reports', authenticate, authorize('DOCTOR'), async (req, res) => {
  try {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!doctorProfile) return fail(res, 'Doctor profile not found', 404);

    const reports = await prisma.patientReport.findMany({
      where: { assignment: { doctorProfileId: doctorProfile.id } },
      include: {
        patient:    true,
        aiAnalysis: true,
        assignment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, reports);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// GET /api/doctors/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const doctor = await prisma.doctorProfile.findUnique({
      where:   { id: req.params.id },
      include: { user: { select: { id: true, email: true } }, assignments: true },
    });
    if (!doctor) return fail(res, 'Doctor not found', 404);
    return ok(res, doctor);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// PATCH /api/doctors/:id
router.patch('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, category, specialization, experience, available, bio } = req.body;
    const doctor = await prisma.doctorProfile.update({
      where: { id: req.params.id },
      data: {
        ...(name           !== undefined && { name }),
        ...(category       !== undefined && { category }),
        ...(specialization !== undefined && { specialization }),
        ...(experience     !== undefined && { experience: parseInt(experience) }),
        ...(available      !== undefined && { available: Boolean(available) }),
        ...(bio            !== undefined && { bio }),
      },
    });
    return ok(res, doctor);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

module.exports = router;