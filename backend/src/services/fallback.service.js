const RULES = [
  {
    category: 'Cardiologist',
    keywords: ['ecg', 'ekg', 'chest pain', 'chest discomfort', 'cardiac', 'heart', 'blood pressure', 'hypertension', 'palpitation', 'angina', 'troponin']
  },
  {
    category: 'Dermatologist',
    keywords: ['rash', 'skin', 'itch', 'eczema', 'psoriasis', 'acne', 'allergy', 'hives', 'lesion', 'dermatitis', 'hair loss']
  },
  {
    category: 'Orthopedic',
    keywords: ['bone', 'fracture', 'joint', 'knee', 'back pain', 'spine', 'x-ray', 'xray', 'muscle pain', 'arthritis', 'osteoporosis']
  },
  {
    category: 'General Physician',
    keywords: ['fever', 'cold', 'cough', 'flu', 'weakness', 'fatigue', 'headache', 'vomiting', 'nausea', 'diarrhea', 'general']
  }
];

function analyze(transcript) {
  const lower  = transcript.toLowerCase();
  let best     = { category: 'General Physician', score: 0 };
  const found  = [];

  for (const rule of RULES) {
    const hits = rule.keywords.filter(k => lower.includes(k));
    if (hits.length > best.score) {
      best  = { category: rule.category, score: hits.length };
      found.push(...hits);
    }
  }

  return {
    suggestedCategory:   best.category,
    confidence:          Math.min(best.score * 0.15 + 0.3, 0.85),
    urgency:             'MEDIUM',
    reason:              `Keyword match: ${found.slice(0, 3).join(', ') || 'general symptoms'}`,
    keywords:            found.slice(0, 5),
    manualReviewRequired: best.score < 2,
    source:              'FALLBACK_RULE_ENGINE'
  };
}

module.exports = { analyze };