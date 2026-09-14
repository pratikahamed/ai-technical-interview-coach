# AI Technical Interview Coach

A production-grade, deterministic mock technical interview simulator designed with an "Engineered Precision" aesthetic. Built for software engineering candidates calibrating across Data Structures & Algorithms, System Design, Low-Level Design (LLD), Core Java, and Spring Framework.

## Architecture

This repository is structured as a monorepo with strict separation:

- **`frontend/`**: Next.js (App Router, TypeScript, Tailwind CSS) — deployed independently to **Vercel**.
- **`backend/`**: FastAPI (Python 3.11+, Pydantic v2, Uvicorn) — deployed independently to **Render**.
- **`docs/`**: Product Requirements Document (PRD) and design specifications.
- **`design/`**: UI briefs and Stitch design system reference assets.

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ (tested on v20+)
- Python 3.11+
- Git

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```
Swagger UI documentation available at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```
Application accessible at `http://localhost:3000`.

### 3. Docker Compose (Alternative)
```bash
docker compose up --build
```

## Production Deployment Targets
- **Frontend**: Vercel (Root Directory: `frontend`)
- **Backend**: Render Web Service (Root Directory: `backend`)
