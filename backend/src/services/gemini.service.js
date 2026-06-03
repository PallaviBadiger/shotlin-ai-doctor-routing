const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const ALLOWED_CATEGORIES = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Orthopedic',
];

function extractFirstJsonObject(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return null;

  // Remove markdown fences first
  const noFences = trimmed.replace(/```json/gi, '```').replace(/```/g, '');

  // Attempt direct parse
  try {
    return JSON.parse(noFences);
  } catch {}

  // Fallback: find first {...} block
  const match = noFences.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function analyze(transcript) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are a medical report router. Analyze this medical transcript and return ONLY valid JSON with no explanation.

Transcript:
"""${transcript}"""

Return JSON with this exact structure:
{
  "suggestedCategory": "one of: General Physician, Cardiologist, Dermatologist, Orthopedic",
  "confidence": 0.0 to 1.0,
  "urgency": "LOW | MEDIUM | HIGH",
  "reason": "brief reason under 100 characters",
  "keywords": ["keyword1", "keyword2"],
  "manualReviewRequired": true or false
}

IMPORTANT: You must NOT diagnose the patient, recommend medicine, or suggest treatment. Only route to a doctor category.

Return ONLY the JSON object. Do not wrap it in Markdown fences.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const parsed = extractFirstJsonObject(text);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Gemini returned invalid JSON');
  }

  // Normalize and validate required fields
  const suggestedCategory = ALLOWED_CATEGORIES.includes(parsed.suggestedCategory)
    ? parsed.suggestedCategory
    : 'General Physician';

  const confidence = typeof parsed.confidence === 'number' && !Number.isNaN(parsed.confidence)
    ? Math.max(0, Math.min(1, parsed.confidence))
    : 0;

  const urgency = ['LOW', 'MEDIUM', 'HIGH'].includes(parsed.urgency) ? parsed.urgency : 'MEDIUM';

  const reason = typeof parsed.reason === 'string' ? parsed.reason.slice(0, 100) : '';
  const keywords = Array.isArray(parsed.keywords)
    ? parsed.keywords.filter(k => typeof k === 'string').slice(0, 10)
    : [];

  const manualReviewRequired = Boolean(parsed.manualReviewRequired);

  return {
    suggestedCategory,
    confidence,
    urgency,
    reason,
    keywords,
    manualReviewRequired,
  };
}

module.exports = { analyze };
