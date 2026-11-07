# CivicPulse AI
> **"Your City. Your Voice. Our Smarter Future."**
> AI-Powered Smart Civic Issue Detection, Reporting, Duplicate Deduplication & Resolution Platform

---

## 1. Executive Overview

**CivicPulse AI** is an enterprise-grade civic technology platform that empowers citizens to report public infrastructure defects (road potholes, overflowing garbage bins, mainline water leakages, drainage blockages, broken streetlights) and enables municipal authorities and department field officers to monitor, prioritize, dispatch, and verify resolutions transparently.

### Key Capabilities
- **AI Computer Vision (YOLO + Gemini 3.8 Multimodal)**: Real-time visual defect classification, confidence scoring (e.g. 96%), and bounding-box spatial coordinates over uploaded photos.
- **Intelligent Duplicate Deduplication**: Compares incoming reports against active neighborhood complaints using Haversine distance (<300m) and NLP semantic matching; converts redundant complaints into citizen endorsements (`+1`).
- **Mathematical Priority Engine**: Transparent 0–100 score weighing safety risks (30 pts), defect severity (25 pts), proximity to sensitive zones (schools/hospitals, 20 pts), unresolved duration (15 pts), and citizen endorsements (10 pts).
- **Interactive OpenStreetMap & Leaflet Geolocation**: GPS geolocation, interactive pin-dropping, category color coding, and cluster views.
- **AI Voice Reporting Assistant**: Speech-to-text intake in **English** and **ಕನ್ನಡ (Kannada)** with automated extraction of issue title, category, and missing information prompts.
- **Before-and-After Resolution Verification**: Photographic proof comparison powered by AI visual audit to prevent false closures before administrative sign-off.
- **3 Role-Based Consoles**:
  1. **Citizen Portal** (Issue reporting, GPS picker, voice draft, timeline tracker, community upvoting, reopen workflow).
  2. **Department Officer Hub** (Field work orders, dispatch staging, after-repair photo upload, resolution verification).
  3. **Super Administrator Cockpit** (Central command, citywide KPI dashboard, work order assignment, priority overrides with mandatory audit reasoning).
- **Geospatial Hotspot Analytics**: High-frequency cluster detection, department workload benchmarks, and comparative monthly velocity metrics.

---

## 2. Architecture & Tech Stack

### Frontend
- **React 19 & TypeScript**: Component-based modular architecture.
- **Tailwind CSS v4**: Dual light/dark mode support with `@custom-variant dark`.
- **OpenStreetMap & Leaflet.js**: Interactive mapping and custom SVG category markers.
- **Recharts**: Data visualization for category distribution, monthly velocity, and department performance.
- **Lucide Icons**: Semantic iconography.

### Backend Dual Architecture
1. **Full-Stack Node.js + Express (`server.ts`)**:
   - Runs directly on port 3000 with Vite dev server middleware mounted.
   - Provides all live REST endpoints (`/api/auth/*`, `/api/complaints/*`, `/api/ai/*`, `/api/locations/*`, `/api/admin/*`, `/api/departments/*`, `/api/notifications/*`).
   - Integrated with `@google/genai` (model: `gemini-3.8-flash`) for server-side AI image analysis, voice structuring, and resolution verification.
2. **Enterprise Python FastAPI + PostgreSQL + PostGIS (`/backend`)**:
   - Complete production source code provided in `/backend` with SQLAlchemy models, Pydantic v2 schemas, Alembic DDL migrations, and Pytest suite.

---

## 3. Database Schema (PostgreSQL & PostGIS)

All 13 normalized entities are defined in `/backend/models.py` and `/backend/init_db.sql`:
1. `users` (RBAC: `citizen`, `officer`, `superadmin`, password hashing, contact details)
2. `complaints` (Complaint number `CP-2026-XXXX`, category, priority, status lifecycle)
3. `complaint_images` (Before and after photographs, mime types, file sizes)
4. `locations` (Latitude, longitude, PostGIS `GEOMETRY(Point, 4326)` spatial indexes)
5. `ai_analysis` (YOLO / Gemini detection tags, confidence score, bounding boxes JSON)
6. `departments` (Road, Sanitation, Water, Drainage, Electrical, Public Infrastructure)
7. `department_officers` (Zonal designations, active work orders)
8. `assignments` (Official administrative dispatch logs)
9. `complaint_history` (Audit trail storing previous status, new status, timestamps, changer name, comments)
10. `duplicate_reports` (Similarity scores, spatial distances, merged actions)
11. `notifications` (In-app and email alert triggers)
12. `complaint_support` (Citizen upvotes and community endorsements)
13. `resolution_verification` (Before/after photograph comparison, visual difference scores)

---

## 4. Running the Application

### A. Live Web Applet (Current Environment)
The development server runs `server.ts` directly on port 3000:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### B. Running the Python FastAPI Backend via Docker
```bash
cd backend
docker-compose up --build
```
FastAPI Swagger documentation will be available at:
`http://localhost:8000/docs`

### C. Running Backend Tests
```bash
cd backend
pytest tests/test_api.py -v
```

---

## 5. Security & Privacy Highlights
- **Role-Based Access Control**: Public registration strictly generates citizen accounts. Officers and Admins are credentialed by municipal authorities.
- **No Hardcoded Secrets**: Uses `process.env.GEMINI_API_KEY` injected via AI Studio secrets.
- **Privacy Shield**: Citizen contact telephone numbers are masked from public viewing.
- **Audit Trails**: Every status transition and priority override enforces an author ID, timestamp, and human justification reason.
