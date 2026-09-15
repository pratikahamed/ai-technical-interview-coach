# Manual Testing & Verification Playbook

This playbook provides a comprehensive, step-by-step testing protocol for the **AI Technical Interview Coach** platform. Follow these verification scenarios to validate end-to-end user workflows, dual-provider execution (`mock` vs. `groq`), client-side secret masking, error handling, and recovery mechanisms.

---

## 1. Pre-Flight Checklist

Before launching servers, confirm your local environment configuration:

- [ ] **Backend Environment**: Ensure `backend/.env` exists (copied from `backend/.env.example`):
  ```env
  PORT=8000
  ENVIRONMENT=development
  LOG_LEVEL=INFO
  ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
  QUIZ_PROVIDER=groq
  GROQ_API_KEY=gsk_...
  GROQ_MODEL=openai/gpt-oss-120b
  GROQ_REQUEST_TIMEOUT_SECONDS=15
  ```
- [ ] **Frontend Environment**: Ensure `frontend/.env.local` exists (copied from `frontend/.env.example`):
  ```env
  NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
  ```
- [ ] **Port Availability**: Confirm ports `8000` (FastAPI) and `3000` (Next.js) are free.

---

## 2. Server Startup & Verification

Open two independent terminal windows.

### Terminal 1: Backend Server (FastAPI)

#### Option A: Running with Live Groq LLM Generation
```bash
# Windows (PowerShell)
cd backend
.\venv\Scripts\activate
$env:QUIZ_PROVIDER="groq"
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Linux / macOS (Bash)
cd backend
source venv/bin/activate
export QUIZ_PROVIDER="groq"
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
**Expected Backend Stdout (Groq Mode):**
```text
INFO:     Started server process [PID]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
... [INFO] interview_coach: Initializing LLMQuizService with Groq model 'openai/gpt-oss-120b'.
```

#### Option B: Running with Deterministic Mock Bank
```bash
# Windows (PowerShell)
cd backend
.\venv\Scripts\activate
$env:QUIZ_PROVIDER="mock"
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Linux / macOS (Bash)
cd backend
source venv/bin/activate
export QUIZ_PROVIDER="mock"
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
**Expected Backend Stdout (Mock Mode):**
```text
... [INFO] interview_coach: Initializing MockQuizService with local JSON question bank.
... [INFO] interview_coach: Successfully loaded 15 questions across 5 topics.
```

---

### Terminal 2: Frontend Server (Next.js 16)

```bash
# Windows & Linux/macOS
cd frontend
npm run dev
```
**Expected Frontend Stdout:**
```text
▲ Next.js 16.3.5 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://[IP]:3000

✓ Ready in ~1.2s
```

---

## 3. Browser Verification Scenarios

Open your browser and navigate to `http://localhost:3000`.

### Scenario 1: Landing Page & Connectivity Health Probe
1. Open `http://localhost:3000/`.
2. **Visual Inspection**:
   - Verify the dark technical theme (`#060709` surface, cyan accents, specular rims).
   - Verify the hero headline: *"Master Technical Interviews with Senior Engineering Rigor"*.
   - Check the top right of the navigation header: The engine indicator pill should show a pulsating green dot and display:
     `Engine Active (XXms)`.
3. **Manual Health Check Action**:
   - Click the reload icon next to the latency widget.
   - Confirm the icon spins briefly and updates the latency in milliseconds.
4. **Tracks Matrix Preview**:
   - Scroll down or click **Explore 5 Engineering Tracks**.
   - Verify all 5 tracks are displayed: *Data Structures & Algorithms*, *System Design*, *Low Level Design*, *Core Java*, and *Spring Framework*.

---

### Scenario 2: Form Validation Guardrails & Calibration Setup
1. From the navigation header or hero CTA, click **Start Practice** or **Start Mock Interview** to go to `/interview`.
2. Verify the sequential 3-step layout order:
   - **Step 1:** Seniority Experience Tier (`Junior`, `Mid-Level`, `Senior / Staff`)
   - **Step 2:** 5 Technical Domain Tracks (`DSA`, `System Design`, `LLD`, `Core Java`, `Spring Framework`)
   - **Step 3:** Question Difficulty Level (`Easy`, `Medium`, `Hard`)
3. **Guardrail Check (Premature Click)**:
   - Without selecting options, inspect the sticky bottom action drawer.
   - Confirm the **Begin Interview** button is disabled (`cursor-not-allowed`).
   - If forced or unconfigured, an inline alert appears:
     > *"Please select a Seniority Tier, Domain Track, and Difficulty Level to begin."*
   - Verify that **no native browser `alert()` popups** are triggered.

---

### Scenario 3: Interactive Track Selection & Configuration
1. Select **Step 1: Senior / Staff** (5+ Yrs).
   - Confirm card highlights with a cyan border, subtle glow, and the header reflects `Selected: senior`.
2. Select **Step 2: System Design**.
   - Confirm card highlights, shows `Selected` check badge, and telemetry drawer updates to `2. System Design`.
3. Select **Step 3: Hard**.
   - Confirm card highlights with an emerald border and the telemetry drawer displays:
     `Configuration: 1. SENIOR • 2. System Design • 3. HARD`.
4. Confirm the **Begin Interview** button transforms to active white with a subtle hover zoom.

---

### Scenario 4: Active MCQ Quiz Engine & Reload Persistence
1. Click **Begin Interview**.
   - A loader displays: *"Calibrating 3 architectural scenarios for SYSTEM-DESIGN..."*
   - Once generated, the first scenario question renders cleanly inside the `QuestionCard`.
2. **Sequential Progression**:
   - Verify scenario header: `SCENARIO 01 // [ID] • Track: SYSTEM-DESIGN`.
   - Select option **B**. Confirm option B highlights with an active cyan ring and letter badge.
   - Progress bar indicates `33% Complete`.
   - Click **Next Scenario**. Scenario 2 loads.
   - Click **Previous**. Verify option B on Scenario 1 remains selected.
   - Return to Scenario 2 and select an option.
   - Navigate to Scenario 3. Click **Skip Scenario**.
3. **SessionStorage Reload Persistence**:
   - While on Question 3, refresh the browser page (`F5` or `Ctrl+R`).
   - Verify the application **does not lose progress**: it automatically restores the active session, restoring selected answers for Questions 1 & 2.

---

### Scenario 5: Answer Security Verification (Client Secret Masking)
1. Open browser Developer Tools (`F12` or `Ctrl+Shift+I`) and switch to the **Network** tab.
2. Filter network calls by `Fetch/XHR`.
3. Locate the `POST /api/v1/quiz/generate` request.
4. Inspect the **Response** JSON body:
   ```json
   {
     "session_id": "...",
     "questions": [
       {
         "id": "...",
         "topic_id": "system-design",
         "text": "...",
         "options": ["A", "B", "C", "D"]
       }
     ]
   }
   ```
5. **Security Assertion**:
   - Ensure `correct_option_index` is **NOT** present in the payload.
   - Ensure `explanation` is **NOT** present in the payload.
   - Confirm answer secrets exist exclusively in server-side session memory.

---

### Scenario 6: Results Scorecard & Proof Diagnostics
1. On Question 3, click **Submit Assessment**.
2. The UI displays an evaluation spinner, posts answers to `/api/v1/quiz/evaluate`, and redirects to `/results`.
3. **Scorecard Verification**:
   - **Composite Gauge**: An SVG radial arc displays the percentage (e.g., `66.7%` or `100.0%`).
   - **Pass/Fail Badge**: Scores $\ge 70.0\%$ show a green `PASS // STAFF CALIBRATED` badge; scores $< 70.0\%$ show a red `NEEDS IMPROVEMENT` badge.
   - **Telemetry Grid**: Displays Track, Accuracy, Verified 0.00% Grading Drift, and Evaluation Engine mode.
   - **Scenario Diagnostics**: Each of the 3 questions is detailed:
     - Candidate submission vs. Ground Truth correct answer.
     - Green `SOLVED`, yellow `SKIPPED`, or red `MISSED` badge.
     - Detailed **Architectural Proof & Rationale** explaining the trade-offs.
4. **Action Controls**:
   - Click **Print Scorecard** $\to$ triggers browser print preview with dark mode formatting.
   - Click **Retake Assessment** $\to$ clears `sessionStorage` and returns to `/interview`.

---

### Scenario 7: Resilience & Error Handling

#### A. Expired Session Simulation (HTTP 410)
1. In the browser console on `/interview`, simulate an expired or altered session:
   ```javascript
   sessionStorage.setItem("ai_technical_interview_active_session_id", "00000000-0000-0000-0000-000000000000");
   ```
2. Submit the quiz.
3. Verify the frontend catches the `SESSION_EXPIRED` error and displays:
   > *"This quiz session has expired — please start a new interview."*
4. Click **Dismiss** or reset the session cleanly.

#### B. Direct Access Route Guard
1. Clear browser storage (`Application` $\to$ `Session storage` $\to$ `Clear`).
2. Directly type `http://localhost:3000/results` into the browser URL bar and press Enter.
3. Verify the application automatically redirects you back to `/interview` rather than showing empty/broken state.

---

## 4. Port Cleanup Utilities

If a local server crashes or remains bound to port `8000` or `3000`, terminate the process:

### Windows (PowerShell)
```powershell
# Terminate process on Port 8000 (Backend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force

# Terminate process on Port 3000 (Frontend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Linux / macOS (Bash)
```bash
# Terminate process on Port 8000 (Backend)
fuser -k 8000/tcp || lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Terminate process on Port 3000 (Frontend)
fuser -k 3000/tcp || lsof -ti:3000 | xargs kill -9 2>/dev/null || true
```

---

## 5. Automated Test Reference

### Backend Pytest Suite
Run the 33 automated backend unit and integration tests:
```bash
cd backend
.\venv\Scripts\pytest -v tests/     # Windows
source venv/bin/activate && pytest -v tests/  # Linux/macOS
```
*Current Ground Truth:* **33 passed, 0 failures, 0 errors** across `test_endpoints.py`, `test_llm_service.py`, `test_schemas_and_models.py`, and `test_session_cache.py`.

### Frontend Quality & Type Checks
```bash
cd frontend
npm run lint          # 0 warnings, 0 errors
npx tsc --noEmit      # 0 TypeScript type errors
npm run build         # Production Turbopack compilation check
```
*(Note: Frontend unit tests via Vitest/Jest are pending setup; automated linting, TypeScript compilation, and build verification are active.)*
