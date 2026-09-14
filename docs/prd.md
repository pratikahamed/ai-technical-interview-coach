# Product Requirement Document (PRD)

**Product Name:** AI Technical Interview Coach  
**Document Version:** 1.2.0  
**Status:** Phase 2 Implemented (Groq LLM Integration, Dual-Level Calibration, Question Skipping & Print Summary)  
**Target Delivery Window:** Full-Stack Production Implementation  
**Target Audience:** Software Engineering Candidates across All Seniority Tiers (Junior, Mid, Senior)  
**Primary Tech Stack:** Next.js (App Router, Tailwind CSS, TypeScript) | FastAPI (Python 3.11+, Pydantic v2, Groq SDK)  

---

## 1. Executive Summary & Problem Statement

Technical interview preparation for software engineering candidates is often fragmented, passive, and stressful. Learners jump between reading static documentation, solving isolated algorithmic challenges, and watching video tutorials without structured, real-time feedback on their architectural and conceptual comprehension.

**AI Technical Interview Coach** provides a focused, low-friction technical mock interview simulator.
- **Phase 1 (Baseline Scoped MVP):** A deterministic, fast, zero-LLM baseline that eliminates external API latency and cost, built to validate the complete user loop: Landing Page → Topic Selection → Quiz Interface → Instant Evaluation & Rubric Breakdown.
- **Phase 2 (Groq LLM Integration & Dual-Level Calibration):** Features dynamic, difficulty-aware technical MCQ generation powered by Groq (`openai/gpt-oss-120b`). Candidates configure both their **Seniority Level** (Junior 0-2y, Mid-Level 3-5y, Senior 5+y) and **Topic Difficulty** (Easy, Medium, Hard). Includes **Question Skipping** (with complete scorecard generation even if all questions are skipped), a stylish **Print Summary** action with dedicated print stylesheets, and zero client-side secret leakage.

> **Scope Note on Timing:** Phase 1 and Phase 2 are focused on deliberate conceptual accuracy and diagnostics. Visible countdown clocks and auto-submit triggers remain optional future roadmap items.

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

| Capability / Feature | Phase | Status | Scope Rationale & Technical Decision |
| :--- | :--- | :--- | :--- |
| **Topic Selection (DSA, System Design, LLD, Java, Spring)** | Phase 1 | Implemented | Core entry criteria for interview configuration across 5 technical domains. |
| **Deterministic Question Bank (Static JSON, 3 Qs/topic)** | Phase 1 | Implemented | Deterministic offline fallback when `QUIZ_PROVIDER=mock` or LLM credentials unavailable. |
| **Server-Side Answer Masking & Evaluation** | Phase 1 | Implemented | Prevents answers from leaking in client DevTools; zero-leakage security invariant. |
| **Answer & Topic Validation on Submit** | Phase 1 | Implemented | Rejects mismatched `question_id`s, out-of-bounds options, or malformed payloads with explicit 4xx responses. |
| **Scorecard & Detailed Question Review** | Phase 1 | Implemented | Delivers immediate candidate value with explicit rationales for each option. |
| **Health Probe & Cold-Start Ping (`GET /health`)** | Phase 1 | Implemented | Pre-warms sleeping backend instances upon landing. |
| **Structured Backend Stdout Logging** | Phase 1 | Implemented | Minimal observability to debug deployments and Groq generation cycles without external overhead. |
| **Dynamic LLM Question Generation (Groq)** | Phase 2 | Implemented | Powered by Groq `openai/gpt-oss-120b` with JSON schema enforcement, dual-attempt retry, and 30m session cache. |
| **Dual-Level Difficulty Calibration** | Phase 2 | Implemented | Calibrated across Seniority (`junior`, `mid`, `senior`) and Topic Complexity (`easy`, `medium`, `hard`). |
| **Question Skipping & Skip-All Summary** | Phase 2 | Implemented | Candidates can skip any or all questions; server generates complete diagnostic review (`selected_option: -1`). |
| **Executive Print Summary Action** | Phase 2 | Implemented | Stylish "Print Summary" button on `/results` with `@media print` clean report layout. |
| **Countdown Timer + Auto-Submit** | Roadmap | Deferred | Optional future enhancement; current design prioritizes conceptual focus. |
| **Open-Ended Text / Audio Voice Responses** | Roadmap | Deferred | Requires STT (Whisper), latency streaming, and prompt scoring rubrics. |
| **User Authentication & Persistent Profiles** | Roadmap | Deferred | In-memory session cache and `sessionStorage` suffice for candidate privacy and instant evaluation. |

### 3.1. Architectural Rules & Invariants
* **Zero Secret Leaks:** The `QuestionPublic` schema served to the frontend **never** contains `correct_option_index` or `explanation`. Evaluation happens strictly server-side.
* **Interface Abstraction:** Controllers depend exclusively on the abstract `QuizService`. `LLMQuizService` (Groq) and `MockQuizService` adhere to the exact same contract.
* **Dual Calibration:** All questions generated dynamically correlate with both the user's targeted Seniority and Topic Difficulty.
* **Graceful Degradation:** If `GROQ_API_KEY` is absent or `QUIZ_PROVIDER=mock`, the application automatically falls back to `MockQuizService` with zero downtime or crash.
* **State & Caching Invariant:** Dynamic questions are cached server-side with a 30-minute TTL per session. Submissions referencing expired sessions receive HTTP 410 `SESSION_EXPIRED`. Note: In-memory cache is per-process; multi-worker production deployments should back this with Redis or PostgreSQL.

---

## 5. API Contracts & Data Schemas (Pydantic v2)

### 5.1. Pydantic Models (`backend/app/models/schemas.py`)
```python
from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field

Seniority = Literal["junior", "mid", "senior"]
Difficulty = Literal["easy", "medium", "hard"]


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
    seniority: Optional[str] = "mid"
    difficulty: Optional[str] = "medium"


class QuestionInternal(QuestionPublic):
    correct_option_index: int
    explanation: str


class QuizGenerateResponse(BaseModel):
    session_id: Optional[str] = Field(
        None, description="UUID correlating generation with server-side evaluation"
    )
    questions: List[QuestionPublic] = Field(
        ..., description="List of generated questions with secrets masked"
    )
    seniority: str = Field("mid", description="Seniority tier used for generation")
    difficulty: str = Field("medium", description="Topic difficulty used for generation")
    model_config = ConfigDict(frozen=True)


class QuizSubmission(BaseModel):
    topic_id: str
    session_id: Optional[str] = Field(
        None, description="Session ID returned during quiz generation"
    )
    answers: Dict[str, int] = Field(
        ...,
        description="Mapping of question_id -> selected_option_index (or -1 if skipped)",
    )


class QuestionReview(BaseModel):
    question_id: str
    text: str
    selected_option: int  # -1 represents a skipped question
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

### 5.2. Question Bank & LLM Dual Calibration
- **Mock Fallback:** When `QUIZ_PROVIDER=mock`, questions are sourced deterministically from `backend/app/data/questions.json` (keyed by `topic_id`).
- **Dynamic Groq Generation:** When `QUIZ_PROVIDER=groq`, `LLMQuizService` invokes model `openai/gpt-oss-120b` with temperature `0.3` and JSON schema enforcement, incorporating both Seniority and Difficulty calibration rules into system prompts.
- **Session Cache:** Generated `QuestionInternal` instances are stored in a server-side session cache keyed by `session_id` with a 30-minute TTL.

### 5.3. REST Endpoints & Status Codes
All operational endpoints are prefixed with `/api/v1` (except root-level health probe). Standard error responses return `ErrorDetail`:
```json
{
  "code": "INVALID_SENIORITY",
  "message": "Invalid seniority 'lead'. Must be one of: junior, mid, senior"
}
```

#### 1. Uptime Check
* **Endpoint:** `GET /health`
* **Response:** `200 OK` → `{"status": "healthy"}`

#### 2. Get Available Topics
* **Endpoint:** `GET /api/v1/topics`
* **Response:** `200 OK` → `List[Topic]`

#### 3. Generate / Fetch Questions (Dual Calibrated)
* **Endpoint:** `POST /api/v1/quiz/generate?topic_id={id}&seniority={seniority}&difficulty={difficulty}`
* **Query Parameters:**
  * `topic_id`: string (`dsa`, `system_design`, `lld`, `java`, `spring`)
  * `seniority`: string (`junior`, `mid`, `senior`; default: `mid`)
  * `difficulty`: string (`easy`, `medium`, `hard`; default: `medium`)
* **Success:** `200 OK` → `QuizGenerateResponse` (includes `session_id` and masked `questions`)
* **Errors:**
  * `404 Not Found` → `code: "TOPIC_NOT_FOUND"`
  * `422 Unprocessable Entity` → `code: "INVALID_SENIORITY"` or `"INVALID_DIFFICULTY"`
  * `502 Bad Gateway` → `code: "LLM_GENERATION_FAILED"` (Groq timeout or unparseable JSON after retries)

#### 4. Evaluate Submission (with Skipping Support)
* **Endpoint:** `POST /api/v1/quiz/evaluate`
* **Request Payload:** `QuizSubmission` (`session_id` + `answers`)
* **Success:** `200 OK` → `QuizResult`
* **Skipping Behavior:**
  * Skipped questions (represented as `-1` in `answers` or omitted from dict) are evaluated as `is_correct = False`, `selected_option = -1`, while returning the full correct option and explanation.
  * If a candidate skips **all** questions, the backend successfully generates the full diagnostic scorecard with `score: 0`, `percentage: 0.0`, and full reviews for all questions.
* **Errors:**
  * `404 Not Found` → `code: "TOPIC_NOT_FOUND"`
  * `410 Gone` → `code: "SESSION_EXPIRED"` (submission sent after 30-minute session TTL or invalid session ID)
  * `400 Bad Request` → `code: "QUESTION_TOPIC_MISMATCH"`
  * `400 Bad Request` → `code: "INVALID_OPTION_INDEX"` (non-skipped index out of bounds)
  * `422 Unprocessable Entity` → Missing required body fields

---

## 6. Frontend Screen Specifications & State Management

### 6.1. Screen 1: Landing Page (`/`)
* **Layout:** Centered hero section, value proposition headline, primary CTA ("Start Mock Interview"), and 5 category feature preview cards.
* **Track Matrix Preview:** Updated headline to `"Targeted Technical Engineering Tracks"` and subline: `"Calibrated across 3 Seniority Tiers and 3 Difficulty Levels for precision evaluation."`
* **Cold-Start Trigger:** Fires a non-blocking `GET /health` in a background `useEffect`.

### 6.2. Screen 2: Topic Selection & Quiz Engine (`/interview`)
Unified view managing two internal client states:
1. **Topic Selection (`view === 'SELECT_TOPIC'`):**
   * Step 1: Responsive grid of 5 selectable track cards.
   * Step 2: Seniority Tier pill selector (`Junior 0-2y`, `Mid-Level 3-5y`, `Senior / Staff 5+y`).
   * Step 3: Topic Complexity pill selector (`Easy`, `Medium`, `Hard`).
   * "Begin Interview" CTA is enabled only when Track, Seniority, and Difficulty are selected. Shows loading spinner during dynamic generation.
2. **Active Quiz (`view === 'ACTIVE_QUIZ'`):**
   * Top bar displaying current Track badge, Seniority badge, Difficulty badge, and progress indicator (`Question X of Y`).
   * Question prompt container with 4 single-select choice buttons.
   * **Question Skipping:** Dedicated **"Skip Question"** button on the bottom left, positioned opposite to "Next" / "Submit".
   * **Submit Guard:** Unlocked on the final question even if questions were skipped.
   * **Session Persistence:** `session_id`, `selectedSeniority`, `selectedDifficulty`, and `answers` synchronize to `sessionStorage` for seamless browser refresh recovery.
   * **Session Expiry (410) Handling:** Displays an inline alert with a CTA to return to track selection when an expired session is detected.

### 6.3. Screen 3: Scorecard & Detailed Review (`/results`)
* **Components:**
  * Overall score percentage badge with color-coded status ($\ge 70\%$ = Pass, $< 70\%$ = Needs Improvement).
  * Skipped Question Indicators: Displays *"Candidate Skipped This Question"* tag alongside the correct answer rationale.
  * **Executive Print Summary Action:** Stylish, concise **"Print Summary"** button with printer icon (`lucide-react`) in the action bar.
  * Print Stylesheet (`@media print`): Hides header, footer, action buttons, and backdrops, rendering a clean, high-contrast, multi-page printable scorecard.
  * Action controls: "Retake Interview" and "Return Home".

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

## 10. Changelog Summary

### v1.2.0 (Phase 2 LLM Integration & Dual-Level Calibration)
* **Groq LLM Service (`openai/gpt-oss-120b`):** Implemented dynamic MCQ generation with strict JSON schema adherence, timeout handling, dual-attempt retry, and zero client-side secret exposure.
* **Dual-Level Calibration:** Added calibration across Seniority tiers (`junior`, `mid`, `senior`) and Topic Complexity levels (`easy`, `medium`, `hard`) throughout backend validation, LLM prompt engineering, and frontend UI selectors.
* **Session Management & Expiry (410):** Introduced `QuizGenerateResponse` with `session_id` correlating dynamic questions to server evaluations with 30-minute in-memory caching and `410 SESSION_EXPIRED` handling.
* **Question Skipping & Complete Scorecards:** Introduced a dedicated "Skip Question" button on the question interface (left side opposite Next/Submit) and server-side support for `-1` / omitted answers, enabling candidates to skip any or all questions while still receiving an itemized diagnostic scorecard with correct answers and explanations.
* **Executive Print Summary:** Added a stylish "Print Summary" button to `/results` with `@media print` CSS optimization for report generation.
* **Landing Page Copy Alignment:** Refactored track matrix headline to "Targeted Technical Engineering Tracks" calibrated across all seniority levels.
* **Comprehensive Test Suite:** Added 24 backend unit/integration tests (`test_quiz.py`, `test_llm_quiz.py`) and a 5-phase end-to-end integration runner validating zero secret leaks, dual calibration, skip-all summary generation, and session expiration.

### v1.1.0 (Phase 1 Baseline Polish)
* **Scope Boundary Clarification:** Resolved the "Timed Quiz" inconsistency; timers are explicitly excluded from Phase 1 and slated for Phase 2.
* **Payload Validation Rules:** Added explicit `400 QUESTION_TOPIC_MISMATCH` and `400 INVALID_OPTION_INDEX` checks to eliminate incorrect evaluations.
* **Standardized Error Contracts:** Formalized `ErrorDetail` Pydantic model across all non-2xx API responses.
* **API Versioning:** Prefixed all operational routes with `/api/v1/` to ensure forward compatibility with Phase 2 LLM pipelines.
* **Concrete Data Structure:** Defined the dictionary-backed format for `data/questions.json` for $O(1)$ topic lookups.
* **Logging Standard:** Specified stdout logging format and `LOG_LEVEL` environment variable.
* **Frontend UI Guard Rails:** Added disabled submit states, empty-state protections, and retry handling for Render cold starts.