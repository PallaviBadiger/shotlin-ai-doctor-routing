const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data in correct order
  await prisma.aIAnalysisLog.deleteMany();
  await prisma.doctorAssignment.deleteMany();
  await prisma.patientReport.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.user.deleteMany();

  const SALT = 10;

  // ─── Admin ────────────────────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      email: 'admin@shotlin.com',
      password: await bcrypt.hash('Admin@1234', SALT),
      role: 'ADMIN'
    }
  });
  console.log('✅ Admin created');

  // ─── Doctors ──────────────────────────────────────────────────────────────
  const doctors = [
    {
      email: 'dr.sharma@shotlin.com',
      name:  'Dr. Priya Sharma',
      category: 'GENERAL_PHYSICIAN',
      specialization: 'General Medicine, Preventive Care',
      experience: 12
    },
    {
      email: 'dr.mehta@shotlin.com',
      name:  'Dr. Rohan Mehta',
      category: 'CARDIOLOGIST',
      specialization: 'Interventional Cardiology, ECG Analysis',
      experience: 15
    },
    {
      email: 'dr.reddy@shotlin.com',
      name:  'Dr. Ananya Reddy',
      category: 'DERMATOLOGIST',
      specialization: 'Clinical Dermatology, Skin Disorders',
      experience: 9
    },
    {
      email: 'dr.khan@shotlin.com',
      name:  'Dr. Farhan Khan',
      category: 'ORTHOPEDIC',
      specialization: 'Orthopedic Surgery, Joint Replacement',
      experience: 18
    }
  ];

  for (const d of doctors) {
    await prisma.user.create({
      data: {
        email: d.email,
        password: await bcrypt.hash('Doctor@1234', SALT),
        role: 'DOCTOR',
        doctorProfile: {
          create: {
            name:           d.name,
            category:       d.category,
            specialization: d.specialization,
            experience:     d.experience,
            available:      true
          }
        }
      }
    });
  }
  console.log('✅ 4 Doctors created');

  // ─── Patient ──────────────────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      email: 'patient@shotlin.com',
      password: await bcrypt.hash('Patient@1234', SALT),
      role: 'PATIENT',
      patientProfile: {
        create: {
          name:   'Arjun Verma',
          age:    34,
          gender: 'Male',
          phone:  '9876543210'
        }
      }
    }
  });
  console.log('✅ Patient created');

  console.log('\n🎉 Seed complete. Test credentials:');
  console.log('   Admin   → admin@shotlin.com       / Admin@1234');
  console.log('   Doctor  → dr.sharma@shotlin.com   / Doctor@1234');
  console.log('   Doctor  → dr.mehta@shotlin.com    / Doctor@1234');
  console.log('   Doctor  → dr.reddy@shotlin.com    / Doctor@1234');
  console.log('   Doctor  → dr.khan@shotlin.com     / Doctor@1234');
  console.log('   Patient → patient@shotlin.com     / Patient@1234');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());