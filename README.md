# Shotlin — AI Doctor Routing Platform

An intelligent healthcare SaaS platform that uses Google Gemini AI to parse medical reports, classify them by specialty, and automatically route them to the appropriate doctor.

\## ?? Live Demo

\*\*Frontend:\*\* https://shotlin-ai-doctor-routing.vercel.app

\*\*Backend:\*\* https://shotlin-backend.onrender.com

\*\*Demo Video:\*\* https://drive.google.com/file/d/1DMdvh3s4Vzi2aThnpnsw64saYTZaviJY/view?usp=drive\_link



\## Test Credentials

| Role | Email | Password |

|---|---|---|

| Admin | admin@shotlin.com | Admin@1234 |

| Doctor | dr.mehta@shotlin.com | Doctor@1234 |

| Patient | patient@shotlin.com | Patient@1234 |Features

* Role-based authentication (Admin, Doctor, Patient)
* Patient report upload with OCR text extraction (JPG/PNG/PDF)
* AI-powered medical report analysis and doctor routing
* Automatic doctor assignment based on specialization
* Admin dashboard with full oversight and manual override
* Doctor dashboard with assigned report review
* Patient dashboard with report history and status tracking

## Tech Stack

|Layer|Technology|
|-|-|
|Frontend|Next.js 14, Tailwind CSS, Zustand|
|Backend|Node.js, Express.js|
|Database|PostgreSQL, Prisma ORM|
|AI|Google Gemini Flash + rule-based fallback|
|Auth|JWT, bcryptjs|
|File Processing|Multer, Tesseract.js (OCR)|

## Setup Instructions

### Prerequisites

* Node.js v18+
* PostgreSQL
* npm

### 1\. Clone the repository

\\\\ash
git clone https://github.com/PallaviBadiger/shotlin-ai-doctor-routing.git
cd shotlin-ai-doctor-routing/shotlin
\\\\

### 2\. Backend setup

\\\\ash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
\\\\

### 3\. Frontend setup

\\\\ash
cd ../frontend
cp .env.local.example .env.local
npm install
npm run dev
\\\\

## Test Credentials

|Role|Email|Password|
|-|-|-|
|Admin|admin@shotlin.com|Admin@1234|
|Doctor|dr.mehta@shotlin.com|Doctor@1234|
|Patient|patient@shotlin.com|Patient@1234|

## Environment Variables

### backend/.env

\\  
DATABASE\_URL=postgresql://user:password@localhost:5432/shotlin\_db
PORT=5000
JWT\_SECRET=your\_jwt\_secret\_key\_here
JWT\_EXPIRES\_IN=7d
GEMINI\_API\_KEY=your\_gemini\_api\_key\_here
USE\_GEMINI=true
FRONTEND\_URL=http://localhost:3000
\\\\

### frontend/.env.local

\\  
NEXT\_PUBLIC\_API\_URL=http://localhost:5000
\\\\

## Roadmap

* Email notifications on report assignment
* Doctor availability toggle
* Mobile responsiveness polish
* Report PDF export
* Production deployment

