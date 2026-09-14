# AI Technical Interview Coach

[![CI Pipeline](https://github.com/example/ai-interview-coach/actions/workflows/ci.yml/badge.svg)](https://github.com/example/ai-interview-coach/actions/workflows/ci.yml)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014+%20(App%20Router)-black.svg?logo=next.js)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8.svg?logo=tailwind-css)](https://tailwindcss.com)
[![Design System](https://img.shields.io/badge/Design-Engineered%20Precision-06b6d4.svg)](#design-system--theme)

A production-grade, deterministic mock technical interview web application for senior engineering candidates calibrating across **Data Structures & Algorithms (DSA)**, **System Design**, **Low-Level Design (LLD / OOP)**, **Core Java**, and **Spring Framework**.

Built with an **"Engineered Precision"** aesthetic inspired by Linear and Raycast, pairing real-time interactive assessment with zero-drift rubric scoring, server-side evaluation, and detailed architectural invariant proofs.

---

## System Architecture

```text
  ┌────────────────────────────────────────────────────────┐
  │                   Next.js Frontend                     │
  │               (Vercel: App Router)                     │
  │                                                        │
  │   / (Landing) ──> /interview (Config/Quiz) ──> /results│
  └──────────────────────────┬─────────────────────────────┘
                             │ HTTPS / JSON
                             │ (CORS Enabled)
  ┌──────────────────────────▼─────────────────────────────┐
  │                   FastAPI Backend                      │
  │                (Render: Web Service)                   │
  │                                                        │
  │  [Routers: /api/v1] ──> [QuizService Abstract Class]   │
  │                                   │                    │
  │             ┌─────────────────────┴──────────────────┐ │
  │             ▼                                        ▼ │
  │     MockQuizService                          LLMQuizService    │
  │   (Phase 1: JSON Bank)                     (Phase 2: LLM API)  │
  └────────────────────────────────────────────────────────┘
```

### Core Architecture Rules
* **Monorepo Separation:** `frontend/` and `backend/` are strictly isolated. No cross-imports; communication occurs solely via the versioned REST API.
* **Zero Secret Leaks:** Public question models delivered to the browser never contain `correct_option_index` or `explanation`. Evaluation happens strictly server-side.
* **Interface Abstraction:** Controllers depend on the abstract `QuizService` interface, allowing drop-in replacement by `LLMQuizService` without route modifications.
* **Fail Loud, Fail Typed:** Every endpoint adheres to a standardized `ErrorDetail` schema (`code` and `message`).
* **Phase 1 Untimed & Deterministic:** 15 staff-calibrated questions across 5 tracks, with 0.00% grading drift and untimed assessments.

---

## Repository Structure

```text
ai-interview-coach/
├── .github/
│   └── workflows/
│       └── ci.yml                          # GitHub Actions CI matrix
├── .gitignore                              # Comprehensive secret & cache exclusion
├── docker-compose.yml                      # Local development multi-container orchestration
├── render.yaml                             # Render Infrastructure-as-Code Blueprint
├── README.md                               # Project documentation
├── docs/                                   # PRD and design reference specifications
├── design/                                 # Stitch design assets and tokens
│
├── backend/                                # Standalone FastAPI application (Render deployment root)
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py                     # Dependency injection provider for QuizService
│   │   │   └── v1/
│   │   │       ├── health.py               # Health & uptime probe
│   │   │       ├── topics.py               # GET /api/v1/topics
│   │   │       └── quiz.py                 # POST /api/v1/quiz/generate & evaluate
│   │   ├── core/
│   │   │   ├── config.py                   # Environment variable loader
│   │   │   ├── exceptions.py               # Domain exceptions (TopicNotFound, etc.)
│   │   │   └── logging.py                  # Standard library structured stdout logging
│   │   ├── data/
│   │   │   └── questions.json              # 15 deterministic questions (3 per track)
│   │   ├── models/
│   │   │   └── schemas.py                  # Pydantic v2 schemas & ErrorDetail
│   │   ├── services/
│   │   │   ├── base.py                     # Abstract QuizService interface
│   │   │   └── mock_quiz_service.py        # Concrete Phase 1 service implementation
│   │   └── main.py                         # FastAPI factory, CORS, exception handlers
│   ├── tests/
│   │   ├── conftest.py                     # TestClient fixture
│   │   ├── test_health.py                  # Root & versioned health tests
│   │   ├── test_topics.py                  # Topics endpoint tests
│   │   └── test_quiz.py                    # Generation, secrets masking & evaluation tests
│   ├── .env.example
│   ├── Dockerfile
│   ├── render.yaml
│   └── requirements.txt
│
└── frontend/                               # Standalone Next.js application (Vercel deployment root)
    ├── public/
    │   ├── favicon.ico
    │   └── logo.svg                        # Self-contained SVG logo
    ├── src/
    │   ├── app/
    │   │   ├── globals.css                 # Engineered Precision CSS tokens
    │   │   ├── layout.tsx                  # Root layout with Geist & JetBrains Mono fonts
    │   │   ├── page.tsx                    # Screen 1: Landing Page
    │   │   ├── interview/
    │   │   │   └── page.tsx                # Screens 2 & 3: Topic Selection & Quiz Engine
    │   │   └── results/
    │   │       └── page.tsx                # Screen 4: Scorecard & Detailed Review
    │   ├── components/
    │   │   ├── common/                     # Header, Footer, Badge, Skeleton
    │   │   ├── landing/                    # HeroSection, CodeInspectorPreview, TrackMatrixPreview
    │   │   ├── interview/                  # TopicSelector, QuizEngine, QuestionCard, ProgressBar
    │   │   └── results/                    # ScoreGauge, PerformanceSummary, QuestionReviewCard
    │   ├── lib/
    │   │   ├── api.ts                      # Typed REST client with ErrorDetail handling
    │   │   └── constants.ts                # Storage keys & thresholds
    │   └── types/
    │       └── quiz.ts                     # TypeScript data interfaces
    ├── .env.example
    ├── Dockerfile
    ├── package.json
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── vercel.json
```

---

## Quick Start (Local Development)

### Prerequisites
* **Python 3.11+**
* **Node.js 18+** (tested on v20+)
* **npm 9+**
* **Git**
* *(Optional)* **Docker & Docker Compose**

---

### Option A: Local Native Setup (Recommended for Dev)

#### 1. Backend Setup (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment:
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment configuration
cp .env.example .env

# Run unit and integration tests
pytest -v

# Start development server
uvicorn app.main:app --reload --port 8000
```
The backend API is now running at `http://localhost:8000`.  
Interactive Swagger documentation is available at `http://localhost:8000/docs`.

#### 2. Frontend Setup (Next.js)
Open a new terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create local environment configuration
cp .env.example .env.local

# Start Next.js development server
npm run dev
```
The web application is now running at `http://localhost:3000`.

---

### Option B: Docker Compose (Single-Command Parity)

To run both services inside containers matching production environments:
```bash
# From the repository root
docker compose up --build
```
* **Frontend:** `http://localhost:3000`
* **Backend:** `http://localhost:8000`
* **API Docs:** `http://localhost:8000/docs`

---

## REST API Reference

All functional routes are versioned under `/api/v1` (with the exception of the root health probe).

### 1. Health Probe
* **Endpoint:** `GET /health` (also mounted at `GET /api/v1/health`)
* **Response:** `200 OK`
```json
{
  "status": "healthy"
}
```

### 2. List Assessment Topics
* **Endpoint:** `GET /api/v1/topics`
* **Response:** `200 OK`
```json
[
  {
    "id": "dsa",
    "name": "Data Structures & Algorithms",
    "icon": "Code2",
    "description": "Asymptotic complexity, balanced trees, graph traversal, and dynamic programming invariants."
  }
]
```

### 3. Generate Question Bank (Public)
* **Endpoint:** `POST /api/v1/quiz/generate?topic_id={topic_id}`
* **Response:** `200 OK` (Ground truth answers & explanations are strictly stripped)
```json
[
  {
    "id": "dsa-01",
    "topic_id": "dsa",
    "text": "What is the tightest asymptotic upper bound for searching an element in a balanced Binary Search Tree containing N nodes?",
    "options": ["O(1)", "O(log N)", "O(N)", "O(N log N)"]
  }
]
```
* **Error:** `404 Not Found`
```json
{
  "code": "TOPIC_NOT_FOUND",
  "message": "No topic exists with id 'unknown-track'."
}
```

### 4. Evaluate Submission
* **Endpoint:** `POST /api/v1/quiz/evaluate`
* **Request Body:**
```json
{
  "topic_id": "dsa",
  "answers": {
    "dsa-01": 1,
    "dsa-02": 2,
    "dsa-03": 1
  }
}
```
* **Response:** `200 OK`
```json
{
  "topic_id": "dsa",
  "score": 3,
  "total": 3,
  "percentage": 100.0,
  "reviews": [
    {
      "question_id": "dsa-01",
      "text": "What is the tightest asymptotic upper bound...",
      "selected_option": 1,
      "correct_option": 1,
      "is_correct": true,
      "explanation": "In an AVL or Red-Black Tree, self-balancing rotations guarantee that the maximum tree height is strictly bounded by O(log N)..."
    }
  ]
}
```
* **Errors:**
  * `400 Bad Request` (`QUESTION_TOPIC_MISMATCH`): Submitted question ID does not belong to the topic.
  * `400 Bad Request` (`INVALID_OPTION_INDEX`): Selected option index is out of bounds (e.g. `99`).
  * `404 Not Found` (`TOPIC_NOT_FOUND`): Topic does not exist.
  * `422 Unprocessable Entity` (`VALIDATION_ERROR`): Malformed JSON payload.

---

## Production Deployment Guide

Each subfolder is an independently deployable root directory.

### 1. Backend Deployment on Render (Web Service)
1. In the **Render Dashboard**, click **New +** → **Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   * **Name:** `ai-interview-coach-backend`
   * **Root Directory:** `backend`
   * **Runtime:** `Python 3`
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   * **Health Check Path:** `/health`
4. Add the following **Environment Variables**:
   * `ALLOWED_ORIGINS`: `https://<your-vercel-domain>.vercel.app,http://localhost:3000`
   * `ENVIRONMENT`: `production`
   * `LOG_LEVEL`: `INFO`
5. Click **Create Web Service**.  
*(Alternatively, link the repository directly using the committed `render.yaml` Blueprint).*

### 2. Frontend Deployment on Vercel
1. In the **Vercel Dashboard**, click **Add New...** → **Project**.
2. Select your Git repository.
3. In project configuration:
   * **Framework Preset:** `Next.js`
   * **Root Directory:** Click Edit and select `frontend`
4. Add the following **Environment Variable**:
   * `NEXT_PUBLIC_API_BASE_URL`: `https://<your-render-service>.onrender.com`
5. Click **Deploy**.

---

## Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Listening HTTP port | `8000` |
| `ENVIRONMENT` | Environment name (`development` / `production`) | `development` |
| `LOG_LEVEL` | Python logging level (`DEBUG`, `INFO`, `WARNING`, `ERROR`) | `INFO` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | `http://localhost:3000,http://127.0.0.1:3000` |

### Frontend (`frontend/.env.local`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the backend FastAPI service | `http://localhost:8000` |

---

## Testing & Quality Assurance

Run backend automated test suite:
```bash
cd backend
pytest -v
```

Run frontend typecheck and production build:
```bash
cd frontend
npm run build
```

---

## License
MIT License. Crafted for software engineering interview excellence.
