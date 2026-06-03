const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const prisma  = require('../lib/prisma');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const geminiService     = require('../services/gemini.service');
const fallbackService   = require('../services/fallback.service');
const assignmentService = require('../services/assignment.service');

function ok(res, data, status = 200)  { return res.status(status).json({ success: true, data }); }
function fail(res, msg, status = 400) { return res.status(status).json({ success: false, error: msg }); }

router.get('/stats', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const [totalReports, totalDoctors, totalPatients, reviewed, assigned, pending] = await Promise.all([
      prisma.patientReport.count(),
      prisma.doctorProfile.count(),
      prisma.patientProfile.count(),
      prisma.patientReport.count({ where: { status: 'REVIEWED' } }),
      prisma.patientReport.count({ where: { status: 'ASSIGNED' } }),
      prisma.patientReport.count({ where: { status: 'PENDING' } }),
    ]);
    return ok(res, { totalReports, totalDoctors, totalPatients, reviewed, assigned, pending });
  } catch (e) {
    return fail(res, e?.message || String(e), 500);
  }
});

router.get('/reports', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const reports = await prisma.patientReport.findMany({
      include: {
        patient:    true,
        aiAnalysis: true,
        assignment: { include: { doctor: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const normalized = reports.map(r => {
      let analysis = {};
      if (r.aiAnalysis?.responseJson) {
        try { analysis = JSON.parse(r.aiAnalysis.responseJson); } catch {}
      }
      return {
        ...r,
        fileName:            r.filePath?.split('/').pop() || r.filePath,
        aiSuggestedCategory: analysis.suggestedCategory || null,
        aiUrgency:           analysis.urgency || null,
      };
    });
    return ok(res, normalized);
  } catch (e) {
    return fail(res, e?.message || String(e), 500);
  }
});

router.patch('/reports/:id/assign-doctor', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { doctorProfileId } = req.body;
    if (!doctorProfileId) return fail(res, 'doctorProfileId required');
    const assignment = await prisma.doctorAssignment.upsert({
      where:  { reportId: req.params.id },
      update: { doctorProfileId, assignedBy: 'ADMIN' },
      create: { reportId: req.params.id, doctorProfileId, assignedBy: 'ADMIN' },
      include: { doctor: true },
    });
    await prisma.patientReport.update({
      where: { id: req.params.id },
      data:  { status: 'ASSIGNED' },
    });
    return ok(res, assignment);
  } catch (e) {
    return fail(res, e?.message || String(e), 500);
  }
});

router.post('/reports/:id/reanalyze', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const report = await prisma.patientReport.findUnique({ where: { id: req.params.id } });
    if (!report) return fail(res, 'Report not found', 404);
    if (!report.reportTranscript) return fail(res, 'No transcript available', 400);
    let analysis;
    let modelUsed = 'FALLBACK_RULE_ENGINE';
    try {
      if (process.env.USE_GEMINI === 'true' && process.env.GEMINI_API_KEY) {
        analysis  = await geminiService.analyze(report.reportTranscript);
        modelUsed = 'GEMINI_FLASH';
      } else {
        analysis = fallbackService.analyze(report.reportTranscript);
      }
    } catch {
      analysis = fallbackService.analyze(report.reportTranscript);
    }
    await prisma.aIAnalysisLog.upsert({
      where:  { reportId: report.id },
      update: { inputTranscript: report.reportTranscript, modelUsed, responseJson: JSON.stringify(analysis), success: true },
      create: { reportId: report.id, inputTranscript: report.reportTranscript, modelUsed, responseJson: JSON.stringify(analysis), success: true },
    });
    await assignmentService.assign(report.id, analysis.suggestedCategory);
    return ok(res, { analysis, modelUsed });
  } catch (e) {
    return fail(res, e?.message || String(e), 500);
  }
});

router.get('/patients', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const patients = await prisma.patientProfile.findMany({
      include: {
        user:    { select: { id: true, email: true, createdAt: true } },
        reports: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, patients);
  } catch (e) {
    return fail(res, e?.message || String(e), 500);
  }
});

router.get('/doctors', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      include: {
        user:        { select: { id: true, email: true } },
        assignments: { select: { id: true, reviewedAt: true } },
      },
      orderBy: { name: 'asc' },
    });
    return ok(res, doctors);
  } catch (e) {
    return fail(res, e?.message || String(e), 500);
  }
});

router.post('/doctors', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { email, password, name, category, specialization, experience, bio } = req.body;
    if (!email || !password || !name || !category) return fail(res, 'email, password, name, and category are required');
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return fail(res, 'Email already registered', 409);
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email, password: hashed, role: 'DOCTOR',
        doctorProfile: {
          create: {
            name, category, experience: parseInt(experience) || 0,
            specialization: specialization || '',
            bio: bio || null,
            available: true,
          },
        },
      },
      include: { doctorProfile: true },
    });
    return ok(res, { id: user.id, email: user.email, doctorProfile: user.doctorProfile }, 201);
  } catch (e) {
    return fail(res, e?.message || String(e), 500);
  }
});

module.exports = router;
