const prisma = require('../lib/prisma')

const categoryMap = {
  'General Physician':  'GENERAL_PHYSICIAN',
  'Cardiologist':       'CARDIOLOGIST',
  'Dermatologist':      'DERMATOLOGIST',
  'Orthopedic':         'ORTHOPEDIC',
  'Neurologist':        'NEUROLOGIST',
  'Gynecologist':       'GYNECOLOGIST',
  'Pediatrician':       'PEDIATRICIAN',
  'ENT Specialist':     'ENT_SPECIALIST',
  'Diabetologist':      'DIABETOLOGIST',
}

function toEnum(category) {
  if (!category) return 'GENERAL_PHYSICIAN'
  // Already an enum value
  if (Object.values(categoryMap).includes(category)) return category
  // Map from display name
  return categoryMap[category] || 'GENERAL_PHYSICIAN'
}

async function assign(reportId, suggestedCategory, { assignedBy = 'AI', skipAutoAssignment = false } = {}) {
  if (skipAutoAssignment) {
    await prisma.patientReport.update({
      where: { id: reportId },
      data:  { status: 'ANALYZED' },
    });
    return null;
  }

  const categoryEnum = toEnum(suggestedCategory)

  // Find an available doctor in the suggested category
  let doctor = await prisma.doctorProfile.findFirst({
    where: { category: categoryEnum, available: true },
  });

  // Fallback to General Physician if none found
  if (!doctor) {
    doctor = await prisma.doctorProfile.findFirst({
      where: { category: 'GENERAL_PHYSICIAN', available: true },
    });
  }

  if (!doctor) return null;

  const assignment = await prisma.doctorAssignment.upsert({
    where:  { reportId },
    update: { doctorProfileId: doctor.id, assignedBy },
    create: { reportId, doctorProfileId: doctor.id, assignedBy },
  });

  await prisma.patientReport.update({
    where: { id: reportId },
    data:  { status: 'ASSIGNED' },
  });

  return assignment;
}

module.exports = { assign };