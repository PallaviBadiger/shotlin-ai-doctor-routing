-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PATIENT', 'ADMIN', 'DOCTOR');

-- CreateEnum
CREATE TYPE "DoctorCategory" AS ENUM ('GENERAL_PHYSICIAN', 'CARDIOLOGIST', 'DERMATOLOGIST', 'ORTHOPEDIC', 'NEUROLOGIST', 'GYNECOLOGIST', 'PEDIATRICIAN', 'ENT_SPECIALIST', 'DIABETOLOGIST');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'EXTRACTED', 'ANALYZED', 'ASSIGNED', 'REVIEWED');

-- CreateEnum
CREATE TYPE "AssignedBy" AS ENUM ('AI', 'ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PATIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "DoctorCategory" NOT NULL,
    "specialization" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_reports" (
    "id" TEXT NOT NULL,
    "patientProfileId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "symptoms" TEXT NOT NULL,
    "reportTranscript" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_assignments" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
    "assignedBy" "AssignedBy" NOT NULL DEFAULT 'AI',
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_analysis_logs" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "inputTranscript" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "responseJson" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_analysis_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patient_profiles_userId_key" ON "patient_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profiles_userId_key" ON "doctor_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_assignments_reportId_key" ON "doctor_assignments"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_analysis_logs_reportId_key" ON "ai_analysis_logs"("reportId");

-- AddForeignKey
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_profiles" ADD CONSTRAINT "doctor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_reports" ADD CONSTRAINT "patient_reports_patientProfileId_fkey" FOREIGN KEY ("patientProfileId") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_assignments" ADD CONSTRAINT "doctor_assignments_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "patient_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_assignments" ADD CONSTRAINT "doctor_assignments_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analysis_logs" ADD CONSTRAINT "ai_analysis_logs_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "patient_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
