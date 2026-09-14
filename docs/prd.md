# Product Requirement Document (PRD)

**Product Name:** AI Technical Interview Coach  
**Document Version:** 1.1.0  
**Status:** Ready for Implementation (Phase 1 Baseline with Phase 2 Architecture Alignment)  
**Target Delivery Window:** 60-Minute Scoped MVP  
**Target Audience:** Software Engineering Students & Aspiring Developers (DSA, System Design, LLD/HLD, Java, Spring)  
**Primary Tech Stack:** Next.js (App Router, Tailwind CSS, TypeScript) on Vercel | FastAPI (Python 3.11+, Pydantic v2) on Render  

---

## 1. Executive Summary & Problem Statement

Technical interview preparation for software engineering candidates is often fragmented, passive, and stressful. Learners jump between reading static documentation, solving isolated algorithmic challenges, and watching video tutorials without structured, real-time feedback on their architectural and conceptual comprehension.

**AI Technical Interview Coach** provides a focused, low-friction technical mock interview simulator.
- **Phase 1 (Immediate 60-Minute Build Scope):** A deterministic, fast, zero-LLM baseline that eliminates external API latency and cost, built to validate the complete user loop: Landing Page → Topic Selection → Quiz Interface → Instant Evaluation & Rubric Breakdown.
- **Phase 2 (Drop-In LLM Enhancement):** Seamlessly replaces the static question/evaluation service layer with dynamic LLM generation and adaptive open-ended feedback without altering frontend contracts or REST API schemas.

> **Scope Note on Timing:** Phase 1 is untimed. To eliminate scope creep during the 60-minute build window, no timer UI, countdown state, or auto-submit logic is included in Phase 1. Visible countdown clocks and auto-submit triggers are deferred to Phase 2 (see §3).

---

## 2. Target Persona & User Journey

### 2.1. Primary Persona
* **Role:** Software engineering student or early-career developer preparing for technical screenings and core engineering interviews.
* **Core Need:** Rapid, repeatable assessments across targeted core domains (Data Structures & Algorithms, System Design, Low Level Design / OOP, Core Java, Spring Framework) with unambiguous explanations detailing why answers are correct or flawed.

### 2.2. End-to-End User Journey Map
1. **Discover & Land (`/`):** Candidate lands on the application, reviews the supported tracks, and clicks **Start Mock Interview**.
2. **Track Selection (`/interview` — View A):** Candidate selects a domain track (e.g., "System Design", "Core Java") and initiates the session.
3. **Active Assessment (`/interview` — View B):** Frontend fetches questions via `POST /api/v1/quiz/generate?topic_id={id}`. The candidate steps through questions sequentially, marks options, tracks progress via a step counter/progress bar, and completes the assessment.
4. **Grading & Feedback (`/results`):** Backend grades the submission server-side via `POST /api/v1/quiz/evaluate`. The client displays the overall score, pass/fail badge, and an itemized breakdown with full technical explanations for every question.

---

## 3. Scope & Feature Matrix

| Capability / Feature | Phase | Priority | Scope Rationale & Technical Decision |
| :--- | :--- | :--- | :--- |
| **Topic Selection (DSA, System Design, LLD, Java, Spring)** | Phase 1 | P0 | Core entry criteria for interview configuration. |
| **Deterministic Question Bank (Static JSON, 3 Qs/topic)** | Phase 1 | P0 | Eliminates external API dependencies, token consumption, and rate limits for the 60-minute build. |
| **Server-Side Answer Masking & Evaluation** | Phase 1 | P0 | Prevents answers from leaking in client DevTools; establishes the exact contract needed for LLM grading. |
| **Answer & Topic Validation on Submit** | Phase 1 | P0 | Rejects mismatched `question_id`s, out-of-bounds options, or malformed payloads with explicit 4xx responses (§5.3). |
| **Scorecard & Detailed Question Review** | Phase 1 | P0 | Delivers immediate candidate value with explicit rationales for each option. |
| **Health Probe & Cold-Start Ping (`GET /health`)** | Phase 1 | P0 | Pre-warms sleeping Render free-tier instances upon landing. |
| **Structured Backend Stdout Logging** | Phase 1 | P0 | Minimal observability needed to debug a live deployment without external logging infrastructure. |
| **Countdown Timer + Auto-Submit** | Phase 2 | P1 | Requires client-side timer synchronization, expiry handling, and partial-submission semantics; deferred to Phase 2. |
| **Dynamic LLM Question Generation** | Phase 2 | P1 | Requires prompt engineering, schema validation, and retry logic; deferred to Phase 2. |
| **Open-Ended Text / Audio Voice Responses** | Phase 2 | P1 | Requires STT (Whisper), latency streaming, and prompt scoring rubrics; deferred to Phase 2. |
| **User Authentication & Session Management (OAuth)** | Phase 2 | P2 | Adds session and database migration overhead unnecessary for MVP validation. |
| **Historical Analytics & Dashboards** | Phase 2 | P2 | Requires persistent database storage; `sessionStorage` suffices for Phase 1. |
| **Rate Limiting & Abuse Protection** | Phase 2 | P2 | No cost-bearing LLM endpoints exist in Phase 1; revisit prior to Phase 2 live rollout. |

### 3.1. Explicit Non-Goals (Phase 1)
* No persistent database (no PostgreSQL/MySQL/MongoDB); state is client-managed via `sessionStorage`.
* No user accounts or authentication flows.
* No question shuffling/randomization across attempts (deterministic set of 3 questions per topic).
* Responsive web application only; no native mobile wrapper.
* No partial save or resume-later mechanism across devices.

---

## 4. System Architecture & Technical Specifications

```
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

### 4.1. Architectural Rules
* **Zero Secret Leaks:** The `QuestionPublic` schema served to the frontend **never** contains `correct_option_index` or `explanation`. Evaluation happens strictly server-side.
* **Interface Abstraction:** Controllers depend exclusively on the abstract `QuizService`. Phase 2 swaps `MockQuizService` for `LLMQuizService` via dependency injection without changing route definitions.
* **Environment Isolation:** Base URLs and allowed origins are injected via environment variables (`NEXT_PUBLIC_API_BASE_URL` and `ALLOWED_ORIGINS`).
* **Fail Loud, Fail Typed:** Every endpoint adheres to a defined error-response schema (`ErrorDetail`); clients never receive untyped raw string errors.
* **API Versioning:** All functional routes are anchored under `/api/v1/...` to protect against path-level breaking changes in subsequent phases.

---

## 5. API Contracts & Data Schemas (Pydantic v2)

### 5.1. Pydantic Models (`backend/app/models/schemas.py`)
```python
from pydantic import BaseModel, Field
from typing import Dict, List


class Topic(BaseModel):
    id: str
    name: str
    icon: str
    description: str


class QuestionPublic(BaseModel):
    id: str
    topic_id: str
    text: str
    options: List[str]


class QuestionInternal(QuestionPublic):
    correct_option_index: int
    explanation: str


class QuizSubmission(BaseModel):
    topic_id: str
    answers: Dict[str, int] = Field(
        ..., description="Mapping of question_id -> selected_option_index"
    )


class QuestionReview(BaseModel):
    question_id: str
    text: str
    selected_option: int
    correct_option: int
    is_correct: bool
    explanation: str


class QuizResult(BaseModel):
    topic_id: str
    score: int
    total: int
    percentage: float
    reviews: List[QuestionReview]


class ErrorDetail(BaseModel):
    code: str
    message: str
```

### 5.2. Question Bank Data Format (`backend/app/data/questions.json`)
The file is keyed by `topic_id` so lookups are bounded $O(1)$ operations rather than linear table scans:
```json
{
  "dsa": [
    {
      "id": "dsa-01",
      "topic_id": "dsa",
      "text": "What is the average time complexity of searching in a balanced Binary Search Tree?",
      "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      "correct_option_index": 1,
      "explanation": "A balanced BST halves the search space at each level, leading to an O(log n) lookup."
    }
  ]
}
```

### 5.3. REST Endpoints & Status Codes
All operational endpoints are prefixed with `/api/v1` (except the root-level health probe). Standard error responses return `ErrorDetail`:
```json
{
  "code": "TOPIC_NOT_FOUND",
  "message": "No topic exists with id 'unknown'."
}
```

#### 1. Uptime Check
* **Endpoint:** `GET /health`
* **Response:** `200 OK` → `{"status": "healthy"}`

#### 2. Get Available Topics
* **Endpoint:** `GET /api/v1/topics`
* **Response:** `200 OK` → `List[Topic]`

#### 3. Generate / Fetch Questions
* **Endpoint:** `POST /api/v1/quiz/generate?topic_id={topic_id}`
* **Success:** `200 OK` → `List[QuestionPublic]`
* **Errors:**
  * `404 Not Found` → `code: "TOPIC_NOT_FOUND"` (invalid `topic_id`)
  * `422 Unprocessable Entity` → FastAPI schema validation failure

#### 4. Evaluate Submission
* **Endpoint:** `POST /api/v1/quiz/evaluate`
* **Request Payload:** `QuizSubmission`
* **Success:** `200 OK` → `QuizResult`
* **Errors:**
  * `404 Not Found` → `code: "TOPIC_NOT_FOUND"`
  * `400 Bad Request` → `code: "QUESTION_TOPIC_MISMATCH"` (a question does not belong to the topic)
  * `400 Bad Request` → `code: "INVALID_OPTION_INDEX"` (selected index out of bounds)
  * `422 Unprocessable Entity` → Missing required body fields

---

## 6. Frontend Screen Specifications & State Management

### 6.1. Screen 1: Landing Page (`/`)
* **Layout:** Centered hero section, value proposition headline, primary CTA ("Start Mock Interview"), and 5 category feature preview cards.
* **Cold-Start Trigger:** Fires a non-blocking `GET /health` in a background `useEffect` to pre-warm Render before user navigation.
* **State Behavior:** Static render; navigation is not blocked by pending health responses.

### 6.2. Screen 2: Topic Selection & Quiz Engine (`/interview`)
Unified view managing two internal client states:
1. **Topic Selection (`view === 'SELECT_TOPIC'`):**
   * Responsive grid of selectable track cards.
   * `Loading`: Skeleton card placeholders during `GET /api/v1/topics`.
   * `Error`: Retry button with an informational alert: *"Backend is waking up; please retry in ~30 seconds."*
   * `Selected`: Card highlighting and enabling the "Begin Interview" CTA.
2. **Active Quiz (`view === 'ACTIVE_QUIZ'`):**
   * Top bar displaying current topic badge and progress indicator (`Question X of Y`).
   * Question prompt container with 4 single-select choice buttons.
   * Navigation footer: "Previous", "Next", and "Submit Interview" (on final question).
   * **Guard Rail:** "Submit Interview" button is disabled until an option is selected for all questions.
   * **Client Persistence:** Current answers persist in React state and synchronize to `sessionStorage` (`interview_answers`) to prevent data loss on browser refresh.
   * **Submission Failure Handling:** If `POST /api/v1/quiz/evaluate` fails, an inline alert displays with a "Retry Submission" action while retaining answers.

### 6.3. Screen 3: Scorecard & Detailed Review (`/results`)
* **Components:**
  * Overall score percentage badge with color-coded status ($\ge 70\%$ = Pass, $< 70\%$ = Needs Improvement).
  * Detailed Question Breakdown: Displays candidate choice, pass/fail tag, correct option indicator (if incorrect), and full explanation.
  * Action controls: "Retake Interview" (wipes `sessionStorage` and navigates to `/interview`) and "Return Home".
* **State Behavior:**
  * `Loading`: Evaluation spinner during submission calculation.
  * `Empty Guard`: If accessed directly without an active submission payload, cleanly redirects to `/interview`.

---

## 7. Deployment, Networking & Environment Configuration

### 7.1. Backend Configuration (Render)
* **Service Type:** Web Service (Python 3)
* **Build Command:** `pip install -r requirements.txt`
* **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
* **Environment Variables:**
  * `ALLOWED_ORIGINS`: `http://localhost:3000,https://<your-project>.vercel.app`
  * `ENVIRONMENT`: `production`
  * `LOG_LEVEL`: `INFO`

### 7.2. Frontend Configuration (Vercel)
* **Framework Preset:** Next.js
* **Root Directory:** `frontend` (or `./` in standard repository setup)
* **Environment Variables:**
  * `NEXT_PUBLIC_API_BASE_URL`: `https://<your-render-service>.onrender.com`

### 7.3. Cross-Origin Resource Sharing (CORS) Setup
```python
import os
from fastapi.middleware.cors import CORSMiddleware

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 7.4. Observability & Logging (Phase 1 Standard)
Standard library logging directed to stdout without external agents:
```python
import logging
import os

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("interview_coach")
```
* Minimum logged events: Inbound request path + `topic_id`, validation rejections with payload IDs, and unhandled exceptions with full tracebacks.

---

## 8. Success Metrics (Phase 1 Exit Criteria)
Phase 1 verification requires that on production deployed URLs (not localhost):
1. A cold Render instance successfully responds to `GET /health` within 60 seconds.
2. An end-to-end pass (Landing → Topic Selection → Quiz → Results) executes across all 5 topics without uncaught exceptions or browser console errors.
3. Purposely incorrect answers trigger appropriate `is_correct: false` flags and reveal the exact reference explanations.
4. Refreshing the browser mid-quiz preserves selected state via `sessionStorage`.
5. Non-existent topics or mismatched question IDs yield the documented `ErrorDetail` 4xx JSON schemas rather than HTTP 500 crashes.

---

## 9. 60-Minute Execution Runbook

| Timebox | Workstream | Tasks & Checkpoints |
| :--- | :--- | :--- |
| **00–10 min** | **Scaffolding** | Create monorepo folders (`backend/`, `frontend/`). Initialize git repository. Setup Python venv with dependencies (`fastapi`, `uvicorn[standard]`, `pydantic`). Scaffold Next.js project with Tailwind CSS and Lucide icons. |
| **10–25 min** | **Backend Core** | Implement Pydantic models and `ErrorDetail` in `schemas.py`. Create `data/questions.json` (15 total questions across the 5 domains). Implement `MockQuizService` with strict validation rules. Mount `/api/v1` routes and configure stdout logging. Verify error handling via Swagger UI (`/docs`). |
| **25–45 min** | **Frontend Core** | Implement API client wrapper in `src/lib/api.ts` with error handling. Build Hero Landing (`/`), Topic Picker & Quiz Engine (`/interview`) with submit guards and reload safety, and Scorecard View (`/results`). Test complete flow locally. |
| **45–55 min** | **Cloud Deployment** | Push codebase to GitHub. Link repository to Render (FastAPI Web Service) and Vercel (Next.js). Configure environment variables (`ALLOWED_ORIGINS`, `LOG_LEVEL`, `NEXT_PUBLIC_API_BASE_URL`). Trigger simultaneous deployments. |
| **55–60 min** | **End-to-End Audit** | Ping live `/health` to verify service wake-up. Execute the Section 8 acceptance checklist against live production endpoints. |

---

## 10. Changelog Summary (v1.0.0 → v1.1.0)
* **Scope Boundary Clarification:** Resolved the "Timed Quiz" inconsistency; timers are explicitly excluded from Phase 1 and slated for Phase 2.
* **Payload Validation Rules:** Added explicit `400 QUESTION_TOPIC_MISMATCH` and `400 INVALID_OPTION_INDEX` checks to eliminate incorrect evaluations.
* **Standardized Error Contracts:** Formalized `ErrorDetail` Pydantic model across all non-2xx API responses.
* **API Versioning:** Prefixed all operational routes with `/api/v1/` to ensure forward compatibility with Phase 2 LLM pipelines.
* **Concrete Data Structure:** Defined the dictionary-backed format for `data/questions.json` for $O(1)$ topic lookups.
* **Logging Standard:** Specified stdout logging format and `LOG_LEVEL` environment variable.
* **Frontend UI Guard Rails:** Added disabled submit states, empty-state protections, and retry handling for Render cold starts.