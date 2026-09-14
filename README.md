# AI Technical Interview Coach

[![Backend CI](https://github.com/example/ai-interview-coach/actions/workflows/ci-backend.yml/badge.svg)](https://github.com/example/ai-interview-coach/actions/workflows/ci-backend.yml)
[![Frontend CI](https://github.com/example/ai-interview-coach/actions/workflows/ci-frontend.yml/badge.svg)](https://github.com/example/ai-interview-coach/actions/workflows/ci-frontend.yml)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.110+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016.3.5%20(App%20Router)-black.svg?logo=next.js)](https://nextjs.org)
[![Groq LLM](https://img.shields.io/badge/LLM-Groq%20%7C%20gpt--oss--120b-f55036.svg)](https://groq.com)
[![Design System](https://img.shields.io/badge/Design-Raycast%20%2F%20Linear%20Dark-38bdf8.svg)](#design-system--theme)

> **Last Updated**: September 2026 • **System Status**: Production-Ready

A production-grade, deterministic mock technical interview web platform for software engineering candidates calibrating across **Data Structures & Algorithms (DSA)**, **System Design**, **Low-Level Design (LLD / OOP)**, **Core Java**, and **Spring Framework**.

Built with an **"Engineered Precision"** dark technical aesthetic inspired by Linear and Raycast, pairing dynamic AI scenario synthesis with zero-drift rubric scoring, server-side evaluation, and detailed architectural invariant proofs.

---

## Canonical Guides & Documentation

- 🚀 **[DEPLOYMENT.md](DEPLOYMENT.md)**: Comprehensive cloud deployment runbook for **Render** (FastAPI) and **Vercel** (Next.js), including CORS handshakes, health probes, and cold-start mitigations.
- 🧪 **[MANUAL_TESTING_GUIDE.md](MANUAL_TESTING_GUIDE.md)**: Step-by-step verification playbook covering 7 manual browser scenarios, dual-provider execution, client secret masking audits, and port cleanup scripts.
- 📋 **[docs/prd.md](docs/prd.md)**: Complete Product Requirements Document.
- 🎨 **[docs/design-brief.md](docs/design-brief.md)**: Design tokens, specular rims, typography, and WCAG 2.1 AA accessibility specifications.

---

## Tech Stack & Runtime Manifest

| Layer | Technology | Confirmed Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend Framework** | FastAPI | `0.110.0+` | Asynchronous REST API service |
| **ASGI Web Server** | Uvicorn (standard) | `0.28.0+` | High-performance asynchronous HTTP server |
| **Python Runtime** | Python | `>=3.10` (Target: `3.12`) | Core server runtime environment |
| **Validation & Schemas** | Pydantic v2 | `2.6.0+` | Strict request/response data contracts |
| **AI Inference** | Groq Python SDK | `0.9.0+` | Sub-second dynamic question synthesis (`openai/gpt-oss-120b`) |
| **Backend Testing** | Pytest + AnyIO | `8.0.0+` | Automated endpoint contracts & concurrency suites (33 tests) |
| **Frontend Framework** | Next.js (App Router) | `16.3.5` | React 19 server/client components with Turbopack |
| **UI Library** | React & React DOM | `19.2.8` | Component rendering engine |
| **Styling** | Tailwind CSS | `v4.0.0+` | CSS-first design tokens & dark technical theme |
| **Icons** | Lucide React | `1.45.0+` | Engineering track and status telemetry icons |
| **Code Quality** | ESLint | `9.0.0+` (Flat config) | Zero-warning static analysis and hook safety |

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
│  [Router: /api/v1] ──> [QuizService Abstract Class]    │
│                                 │                      │
│           ┌─────────────────────┴──────────────────┐   │
│           ▼                                        ▼   │
│   MockQuizService                          LLMQuizService      │
│ (Deterministic Bank)                 (Groq: gpt-oss-120b)      │
└────────────────────────────────────────────────────────┘
```

### Core Architectural Invariants
* **Decoupled Polyglot Monorepo:** Root directory contains strictly isolated `backend/`, `frontend/`, `docs/`, and `.github/` directories. Zero relative cross-imports between frontend and backend.
* **Zero Secret Leaks:** Public question models delivered to the client (`QuestionPublic`) never contain `correct_option_index` or `explanation`. Evaluation occurs strictly server-side.
* **Dual-Provider Abstraction:** Route controllers depend on the abstract `QuizService` interface, seamlessly toggling between `MockQuizService` and `LLMQuizService` (Groq `openai/gpt-oss-120b`) via the `QUIZ_PROVIDER` environment variable.
* **Fail Loud, Fail Typed:** Every endpoint adheres to a standardized `ErrorDetail` schema (`code` and `message`) with RFC 7807 problem details semantics.
* **3-Step Setup Order:**
  - **Step 1:** Seniority Experience Tier (`junior` [0-2 Yrs], `mid` [3-5 Yrs], `senior` [5+ Yrs])
  - **Step 2:** 5 Technical Domain Tracks (`dsa`, `system-design`, `lld`, `java`, `spring`)
  - **Step 3:** Question Difficulty Level (`easy`, `medium`, `hard`)

---

## Repository Structure

```text
ai-interview-coach/
├── .github/
│   └── workflows/
│       ├── ci-backend.yml                  # Isolated Python 3.12 pytest CI workflow
│       └── ci-frontend.yml                 # Isolated Node 20 lint, typecheck & build CI workflow
├── backend/                                # Standalone FastAPI application
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── __init__.py
│   │   │       │   ├── health.py           # Root & versioned health probes
│   │   │       │   ├── quiz.py             # POST /api/v1/quiz/generate & evaluate
│   │   │       │   └── topics.py           # GET /api/v1/topics
│   │   │       ├── __init__.py
│   │   │       └── router.py               # Aggregated v1 API router
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py                   # Pydantic Settings & environment variables
│   │   │   ├── exceptions.py               # Custom domain exceptions
│   │   │   └── logging.py                  # Structured request logging
│   │   ├── data/
│   │   │   └── questions.json              # 15 deterministic questions (3 per track)
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── domain.py                   # Domain exception re-exports
│   │   │   └── schemas.py                  # Pydantic schemas (QuestionPublic, QuizResult, etc.)
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── quiz.py                     # Canonical schemas package
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── llm_service.py              # Dynamic Groq AI integration with retry resilience
│   │   │   ├── mock_service.py             # Deterministic fallback question service
│   │   │   ├── quiz_service.py             # Abstract QuizService ABC interface
│   │   │   └── session_cache.py            # Thread-safe asyncio cache with 30m TTL
│   │   ├── __init__.py
│   │   └── main.py                         # FastAPI factory, CORS, exception handlers & logging
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py                     # TestClient fixture
│   │   ├── test_endpoints.py               # All REST endpoint contract tests (16 tests)
│   │   ├── test_llm_service.py             # LLM calibration, prompt tuning & live Groq tests (8 tests)
│   │   ├── test_schemas_and_models.py      # Schema validation & secret masking invariant tests (6 tests)
│   │   └── test_session_cache.py           # TTL eviction & concurrency lock stress tests (3 tests)
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   ├── Procfile
│   ├── pyproject.toml
│   └── requirements.txt
├── docs/
│   ├── deployment-guide.md                 # Production deployment runbook (Render + Vercel)
│   ├── design-brief.md                     # Raycast/Linear design tokens & WCAG 2.1 specs
│   └── prd.md                              # Product Requirements Document
├── frontend/                               # Standalone Next.js application
│   ├── public/
│   │   ├── favicon.ico
│   │   └── og-image.png                    # Social preview OpenGraph card
│   ├── src/
│   │   ├── app/
│   │   │   ├── interview/
│   │   │   │   ├── loading.tsx             # Interview route loading skeleton
│   │   │   │   └── page.tsx                # Calibration & 3-question MCQ interface
│   │   │   ├── results/
│   │   │   │   ├── loading.tsx             # Results route loading skeleton
│   │   │   │   └── page.tsx                # Scorecard & granular scenario proofs
│   │   │   ├── favicon.ico
│   │   │   ├── globals.css                 # Dark technical CSS tokens & specular rims
│   │   │   ├── layout.tsx                  # Root layout with Geist & JetBrains Mono fonts
│   │   │   ├── loading.tsx                 # Root loading state
│   │   │   ├── not-found.tsx               # 404 error boundary
│   │   │   └── page.tsx                    # Landing page with hero banner & track matrix
│   │   ├── components/
│   │   │   ├── modules/
│   │   │   │   ├── hero-banner.tsx         # Hero banner with feature pills & CTAs
│   │   │   │   ├── navbar.tsx              # Brand header with live health probe widget
│   │   │   │   ├── question-card.tsx       # Accessible 4-option MCQ radio card
│   │   │   │   ├── score-gauge.tsx         # Radial score gauge & scenario review cards
│   │   │   │   └── topic-selector.tsx      # Sequential 3-step calibration selector
│   │   │   └── ui/
│   │   │       ├── badge.tsx               # Status badges
│   │   │       ├── button.tsx              # Accessible buttons with visible focus rings
│   │   │       ├── card.tsx                # Technical container card
│   │   │       └── progress-bar.tsx        # Step & quiz progress indicator
│   │   ├── hooks/
│   │   │   ├── use-quiz-engine.ts          # State machine for active quiz progression
│   │   │   └── use-session-storage.ts      # Resilient storage hook with memory fallback
│   │   ├── lib/
│   │   │   └── api-client.ts               # Typed client with timeout & error mapping
│   │   ├── types/
│   │   │   └── index.ts                    # Consolidated TypeScript definitions
│   │   └── utils/
│   │       └── format-score.ts             # Clean percentage & pass/fail formatters
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── .gitignore
│   ├── next.config.mjs
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── .gitignore
├── DEPLOYMENT.md                           # Canonical cloud deployment guide
├── MANUAL_TESTING_GUIDE.md                 # Canonical manual verification playbook
└── README.md
```

---

## API Specification

| Method | Path | Description | Request Payload | Response Model | Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Root health probe | None | `{"status": "healthy"}` | — |
| `GET` | `/api/v1/health` | Versioned health probe | None | `{"status": "healthy"}` | — |
| `GET` | `/api/v1/topics` | Available tracks catalog | None | `List[Topic]` | — |
| `POST` | `/api/v1/quiz/generate` | Generate 3 scenario MCQs | Query: `topic_id`, `seniority`, `difficulty` | `QuizGenerateResponse` | `TOPIC_NOT_FOUND`, `INVALID_SENIORITY`, `INVALID_DIFFICULTY`, `LLM_GENERATION_FAILED` |
| `POST` | `/api/v1/quiz/evaluate` | Server-side rubric scoring | Body: `QuizSubmission` | `QuizResult` | `QUESTION_TOPIC_MISMATCH`, `INVALID_OPTION_INDEX`, `TOPIC_NOT_FOUND`, `SESSION_EXPIRED`, `VALIDATION_ERROR` |

### Question Security Invariant
When calling `POST /api/v1/quiz/generate`, the server creates a temporary evaluation session in cache and strips all answers and explanations:
```json
{
  "session_id": "d7079291-b1cd-4577-a812-66e6178c3246",
  "seniority": "senior",
  "difficulty": "hard",
  "questions": [
    {
      "id": "dsa-01",
      "topic_id": "dsa",
      "text": "Given a directed graph with non-negative edge weights...",
      "options": [
        "Dijkstra's Algorithm with a min-priority queue",
        "Bellman-Ford Algorithm with relaxation checks",
        "Floyd-Warshall all-pairs dynamic programming",
        "Breadth-First Search with unit edge queue"
      ]
    }
  ]
}
```
`correct_option_index` and `explanation` are **never** delivered to the client. Scoring is performed exclusively by `POST /api/v1/quiz/evaluate`.

---

## Environment Variables Dictionary

### Backend (`backend/.env`)

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Integer | `8000` | Port for Uvicorn server binding. |
| `ENVIRONMENT` | String | `development` | Runtime environment (`development`, `staging`, `production`). |
| `LOG_LEVEL` | String | `INFO` | Logger verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`). |
| `ALLOWED_ORIGINS` | String | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated whitelist of allowed CORS origins. |
| `QUIZ_PROVIDER` | String | `groq` | Engine toggle: `groq` for live AI generation, `mock` for static question bank. |
| `GROQ_API_KEY` | String (Secret) | *(Empty)* | Secret key for Groq Cloud API. **Server-side only.** |
| `GROQ_MODEL` | String | `openai/gpt-oss-120b` | Target Groq model identifier for scenario generation. |
| `GROQ_REQUEST_TIMEOUT_SECONDS`| Integer | `15` | Timeout before retry or fallback on slow LLM calls. |

### Frontend (`frontend/.env.local`)

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | String | `http://localhost:8000` | Base URL of the FastAPI backend. **Must not contain a trailing slash.** |
| `NEXT_PUBLIC_SITE_URL` | String | `https://ai-interview-coach.vercel.app` | Canonical site URL for OpenGraph metadata. |

---

## Local Setup & Quickstart

### Prerequisites
* Python 3.10+ (Python 3.12 recommended)
* Node.js 20+
* Groq API Key (Optional: set `QUIZ_PROVIDER=mock` to run offline without an API key)

### 1. Backend Setup

#### Windows (PowerShell)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
Copy-Item .env.example .env

# Run FastAPI backend with live reload
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### Linux / macOS (Bash)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Run FastAPI backend with live reload
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend will be live at `http://127.0.0.1:8000` (OpenAPI Swagger docs at `http://127.0.0.1:8000/docs`).

---

### 2. Frontend Setup

#### Windows (PowerShell) & Linux / macOS (Bash)
```bash
cd frontend
npm install
cp .env.example .env.local

# Run Next.js Turbopack development server
npm run dev
```
Frontend will be live at `http://localhost:3000`.

---

## Automated Testing & Quality Checks

### Backend Test Suite (Pytest)
The backend features an automated test suite with **33 tests** verifying endpoint contracts, schema invariants, secret masking, LLM prompt calibration, and session cache concurrency:
```bash
cd backend
pytest -v tests/
```
*Current Ground Truth:* **33 passed in ~9.8s**.

### Frontend Quality & Build Verification
```bash
cd frontend
npm run lint          # 0 warnings, 0 errors (ESLint 9)
npx tsc --noEmit      # 0 TypeScript type errors
npm run build         # Production Turbopack compilation check
```
*(Note: Automated unit tests via Vitest/Jest for frontend components are pending setup; automated linting, TypeScript type-checking, and static page builds are fully configured and passing.)*

---

## Production Deployment

Detailed cloud deployment instructions for Render and Vercel are documented in **[DEPLOYMENT.md](DEPLOYMENT.md)**.

---

## License
MIT License. Open source and calibrated for senior software engineering talent.
