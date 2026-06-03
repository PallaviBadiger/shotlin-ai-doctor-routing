const express = require("express");
const router  = express.Router();

const prisma  = require('../lib/prisma');
const { authenticate, authorize } = require("../middleware/auth.middleware");
const upload  = require("../middleware/upload");

const ocrService        = require('../services/ocr.service');
const fallbackService   = require('../services/fallback.service');
const geminiService     = require('../services/gemini.service');
const assignmentService = require('../services/assignment.service');

function ok(res, data, status = 200)  { return res.status(status).json({ success: true, data }); }
function fail(res, msg, status = 400) { return res.status(status).json({ success: false, error: msg }); }

// POST /api/reports/upload
router.post("/upload", authenticate, authorize("PATIENT"), upload.single("report"), async (req, res) => {
  try {
    if (!req.file) return fail(res, 'report file is required', 400);

    const { symptoms } = req.body;
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!patientProfile) return fail(res, 'Patient profile not found', 404);

    const report = await prisma.patientReport.create({
      data: {
        patientProfileId: patientProfile.id,
        filePath:         req.file.path,
        fileType:         req.file.mimetype,
        symptoms:         typeof symptoms === 'string' ? symptoms : '',
        status:           'PENDING',
      },
    });

    return ok(res, { id: report.id });
  } catch (e) {
    return fail(res, e?.message || String(e), 500);
  }
});

// POST /api/reports/:id/extract-text
router.post("/:id/extract-text", authenticate, authorize("PATIENT"), async (req, res) => {
  try {
    const report = await prisma.patientReport.findUnique({
      where:   { id: req.params.id },
      include: { patient: true },
    });

    if (!report) return fail(res, 'Report not found', 404);
    if (report.patient.userId !== req.user.id) return fail(res, 'Forbidden', 403);

    const { manualTranscript } = req.body;

    let transcript       = '';
    let extractionFailed = false;

    try {
      transcript = await ocrService.extractText(report.filePath);
    } catch (e) {
      extractionFailed = true;
    }

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      extractionFailed = true;
    }

    if (extractionFailed) {
      transcript = typeof manualTranscript === 'string' ? manualTranscript : '';
    }

    await prisma.patientReport.update({
      where: { id: report.id },
      data:  { reportTranscript: transcript || null, status: 'EXTRACTED' },
    });

    return ok(res, { reportId: report.id, extractionFailed });
  } catch (e) {
    return fail(res, e?.message || String(e), 500);
  }
});

// POST /api/reports/:id/analyze
router.post("/:id/analyze", authenticate, authorize("PATIENT"), async (req, res) => {
  try {
    const report = await prisma.patientReport.findUnique({
      where:   { id: req.params.id },
      include: { patient: true },
    });

    if (!report) return fail(res, 'Report not found', 404);
    if (report.patient.userId !== req.user.id) return fail(res, 'Forbidden', 403);

    // Use transcript if available, fall back to symptoms
    const textToAnalyze = report.reportTranscript || report.symptoms || '';
    if (!textToAnalyze.trim()) return fail(res, 'No text available for analysis.', 400);

    let analysis;
    let modelUsed;

    try {
      const useGemini = process.env.USE_GEMINI === 'true' && process.env.GEMINI_API_KEY;
      if (useGemini) {
        analysis  = await geminiService.analyze(textToAnalyze);
        modelUsed = 'GEMINI_FLASH';
      } else {
        analysis  = fallbackService.analyze(textToAnalyze);
        modelUsed = 'FALLBACK_RULE_ENGINE';
      }
    } catch (e) {
      analysis  = fallbackService.analyze(textToAnalyze);
      modelUsed = 'FALLBACK_RULE_ENGINE';
    }

    const normalizedAnalysis = {
      suggestedCategory:    analysis?.suggestedCategory,
      confidence:           typeof analysis?.confidence === 'number' ? analysis.confidence : 0,
      urgency:              analysis?.urgency,
      reason:               analysis?.reason,
      keywords:             Array.isArray(analysis?.keywords) ? analysis.keywords : [],
      manualReviewRequired: Boolean(analysis?.manualReviewRequired),
      source:               modelUsed === 'GEMINI_FLASH' ? 'GEMINI_FLASH' : 'FALLBACK_RULE_ENGINE',
    };

    analysis  = normalizedAnalysis;
    modelUsed = analysis.source === 'GEMINI_FLASH' ? 'GEMINI_FLASH' : 'FALLBACK_RULE_ENGINE';

    await prisma.aIAnalysisLog.upsert({
      where:  { reportId: report.id },
      update: { inputTranscript: textToAnalyze, modelUsed, responseJson: JSON.stringify(analysis), success: true, errorMessage: null },
      create: { reportId: report.id, inputTranscript: textToAnalyze, modelUsed, responseJson: JSON.stringify(analysis), success: true },
    });

    const assignment = await assignmentService.assign(
      report.id,
      analysis.suggestedCategory,
      { assignedBy: 'AI', skipAutoAssignment: Boolean(analysis.manualReviewRequired) }
    );

    await prisma.patientReport.update({
      where: { id: report.id },
      data:  { status: assignment ? 'ASSIGNED' : 'ANALYZED' },
    });

    return ok(res, { analysis, modelUsed });
  } catch (e) {
    return fail(res, e?.message || String(e), 500);
  }
});

// GET /api/reports/my
router.get("/my", authenticate, authorize("PATIENT"), async (req, res) => {
  try {
    const patientProfile = await prisma.patientProfile.findUnique({
      where:  { userId: req.user.id },
      select: { id: true },
    });

    if (!patientProfile) return fail(res, 'Patient profile not found', 404);

    const reports = await prisma.patientReport.findMany({
      where:   { patientProfileId: patientProfile.id },
      include: {
        aiAnalysis: true,
        assignment: { include: { doctor: { include: { user: true } } } },
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
        aiSuggestedCategory: analysis.suggestedCategory || null,
        aiUrgency:           analysis.urgency || null,
      };
    });

    return ok(res, normalized);
  } catch (e) {
    return fail(res, e?.message || String(e), 500);
  }
});

// GET /api/reports/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const report = await prisma.patientReport.findUnique({
      where:   { id: req.params.id },
      include: {
        patient:    true,
        aiAnalysis: true,
        assignment: { include: { doctor: true } },
      },
    });
    if (!report) return fail(res, 'Report not found', 404);
    return ok(res, report);
  } catch (e) {
    return fail(res, e?.message || String(e), 500);
  }
}); 

module.exports = router;