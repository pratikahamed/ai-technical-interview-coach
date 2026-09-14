# Production Cloud Deployment Guide

This canonical deployment guide details the end-to-end production rollout for the **AI Technical Interview Coach** platform. The system is designed as a decoupled polyglot monorepo featuring a FastAPI backend hosted on **Render** and a Next.js App Router frontend hosted on **Vercel**, with dynamic AI question synthesis powered by **Groq Cloud**.

---

## 1. System Architecture Overview

```text
┌────────────────────────────────────────────────────────────────────────┐
│                             Client Browser                             │
│       Desktop / Mobile Responsive Web Interface (Dark Technical)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ 1. HTTPS Page Requests & Static Chunks
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         Vercel Edge Platform                           │
│                      Next.js 16 (App Router)                           │
│   • Global CDN Edge Caching                                            │
│   • Server Components & Optimized Client Bundles                       │
│   • Root: frontend/                                                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ 2. CORS-Secured REST API Handshake
                                    │    (JSON Payload / 15s Abort Timeout)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          Render Cloud Service                          │
│                         FastAPI / Uvicorn Server                       │
│   • Root: backend/                                                     │
│   • Health Probe: GET /health                                          │
│   • Router: /api/v1/{health, topics, quiz}                             │
│   • Concurrency: Thread-Safe SessionCache (asyncio.Lock + 30m TTL)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ 3. LLM Question Generation
                                    │    (JSON Object Mode + Retries)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            Groq Cloud API                              │
│                Model: openai/gpt-oss-120b (Sub-second LLM)             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Prerequisites

Before beginning deployment, ensure you have the following credentials and accounts:

1. **GitHub Repository**: Pushed copy of the `ai-interview-coach` repository containing the isolated `backend/` and `frontend/` directories.
2. **Groq Cloud API Key**: Active API key from the [Groq Console](https://console.groq.com/keys) (`gsk_...`).
3. **Render Account**: Account on [Render.com](https://render.com) for deploying the Python FastAPI web service.
4. **Vercel Account**: Account on [Vercel.com](https://vercel.com) for deploying the Next.js frontend.

---

## 3. Backend Deployment (FastAPI on Render)

The backend is packaged to run as a native Python web service on Render or inside a lightweight container using the included [`backend/Dockerfile`](file:///c:/Users/Pratik%20Ahamed/Desktop/Antigravity_Projects/ai-interview-coach/backend/Dockerfile).

### Manual Web Service Setup (Recommended)
1. Log in to the [Render Dashboard](https://dashboard.render.com/) and click **New +** $\to$ **Web Service**.
2. Select your connected GitHub repository: `ai-interview-coach`.
3. Configure the service settings:
   - **Name**: `ai-interview-coach-api` (or your preferred service name)
   - **Region**: Select the region closest to your target audience (e.g., `Oregon (US West)` or `Frankfurt (EU Central)`).
   - **Branch**: `main`
   - **Root Directory**: `backend` *(Crucial: isolates backend build context)*
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` *(or use the included `backend/Procfile`)*
   - **Instance Type**: `Free` (or `Starter` for dedicated zero-cold-start performance).

> [!NOTE]
> `render.yaml` Blueprint automation was removed from the repo to maintain strict polyglot monorepo directory isolation. The manual web service setup above provides identical, reliable deployment.

### Backend Environment Variables Table

Configure these environment variables in the Render Dashboard under **Environment**:

| Variable | Type | Default | Production Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | Integer | `8000` | *Auto-assigned by Render (`$PORT`)* | Port on which Uvicorn binds. |
| `ENVIRONMENT` | String | `development` | `production` | Active runtime stage. |
| `LOG_LEVEL` | String | `INFO` | `INFO` | Logging threshold (`DEBUG`, `INFO`, `WARNING`, `ERROR`). |
| `ALLOWED_ORIGINS` | Comma-delimited | `http://localhost:3000` | `https://<your-app>.vercel.app,http://localhost:3000` | Whitelisted origins permitted to perform cross-origin requests. |
| `QUIZ_PROVIDER` | String | `mock` | `groq` | Evaluation engine toggle (`mock` for static JSON, `groq` for live LLM). |
| `GROQ_API_KEY` | String (Secret) | *(Empty)* | `gsk_...` | Groq Cloud secret key for dynamic scenario generation. |
| `GROQ_MODEL` | String | `openai/gpt-oss-120b` | `openai/gpt-oss-120b` | Target Groq model for question generation. |
| `GROQ_REQUEST_TIMEOUT_SECONDS` | Integer | `30` | `15` | Timeout before retry or fallback on slow LLM calls. |

---

## 4. Frontend Deployment (Next.js on Vercel)

The frontend is a Next.js 16 App Router application that compiles directly using Vercel's native edge integration.

### Deployment Steps
1. Log in to the [Vercel Dashboard](https://vercel.com/) and click **Add New...** $\to$ **Project**.
2. Import the `ai-interview-coach` GitHub repository.
3. In the project configuration screen:
   - **Project Name**: `ai-interview-coach` (or your preferred name)
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and select `frontend`.
4. Expand the **Environment Variables** section and configure:

| Variable | Environment | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | Production, Preview, Dev | `https://ai-interview-coach-api.onrender.com` | Base URL of the deployed Render FastAPI backend. **Do not include a trailing slash.** |
| `NEXT_PUBLIC_SITE_URL` | Production, Preview | `https://<your-app>.vercel.app` | Canonical site URL used for OpenGraph metadata and SEO. |

5. Click **Deploy**. Vercel will run `npm run build` using Turbopack and generate the static routes (`/`, `/interview`, `/results`).

> [!WARNING]
> **Secrets Hygiene**: The `GROQ_API_KEY` and answer ground-truth data must **NEVER** be entered into Vercel or prefixed with `NEXT_PUBLIC_`. The client browser must only receive public masked models (`QuestionPublic`).

---

## 5. CORS Hardening & Cross-Service Handshake

To allow the Vercel frontend to communicate with the Render backend, perform the following two-way handshake:

1. Copy your production Vercel URL (e.g., `https://ai-interview-coach.vercel.app`).
2. In the Render Dashboard for `ai-interview-coach-api`:
   - Navigate to **Environment**.
   - Edit `ALLOWED_ORIGINS` to include your Vercel URL:
     ```env
     ALLOWED_ORIGINS=https://ai-interview-coach.vercel.app,http://localhost:3000
     ```
   - Click **Save Changes**. Render will automatically redeploy the backend service.
3. **Automated Preview Branch Support**:
   - The backend's CORS configuration in [`backend/app/main.py`](file:///c:/Users/Pratik%20Ahamed/Desktop/Antigravity_Projects/ai-interview-coach/backend/app/main.py) natively enables regex matching for preview deployments:
     ```python
     allow_origin_regex=r"^https://.*\.vercel\.app$"
     ```
   - Any temporary preview branch deployed by Vercel (e.g., `https://ai-interview-coach-git-feature.vercel.app`) can automatically connect to the backend without manual origin updates.

---

## 6. Post-Deployment Verification Checklist

Once both services report green/live status, perform this verification sequence:

- [ ] **1. Root Health Probe**:
  ```bash
  curl -i https://<your-render-api>.onrender.com/health
  ```
  *Expected Output:* HTTP 200 OK, `{"status": "healthy"}`.
- [ ] **2. Versioned Health Probe**:
  ```bash
  curl -i https://<your-render-api>.onrender.com/api/v1/health
  ```
  *Expected Output:* HTTP 200 OK, `{"status": "healthy"}`.
- [ ] **3. OpenAPI Specification**:
  Open `https://<your-render-api>.onrender.com/docs` in your browser. Verify that `/api/v1/topics`, `/api/v1/quiz/generate`, and `/api/v1/quiz/evaluate` are interactive.
- [ ] **4. Landing Page Health Widget**:
  Open `https://<your-vercel-app>.vercel.app/`. Check the top navigation bar. The health pill should display:
  - Green pulse indicator
  - Text: `Engine Active (XXms)`
- [ ] **5. Full Interview Workflow**:
  - Navigate to `/interview`.
  - Complete the 3-step configuration: **Step 1: Seniority Tier** $\to$ **Step 2: Track** $\to$ **Step 3: Difficulty**.
  - Click **Begin Interview**.
  - Answer 3 scenario MCQs.
  - Submit the assessment and verify the `/results` page renders a calibrated composite gauge and scenario proofs.
- [ ] **6. Client Secret Masking Audit**:
  - Open browser DevTools $\to$ **Network** tab.
  - Inspect the `POST /api/v1/quiz/generate` response payload.
  - Verify that neither `correct_option_index` nor `explanation` appears anywhere in the JSON payload.

---

## 7. Operational Troubleshooting

### 1. Render Free-Tier Cold Starts (15-Minute Inactivity Spin-Down)
* **Symptom**: On the free tier, Render spins down web services after 15 minutes of inactivity. First requests can take 30–50 seconds to respond.
* **Mitigation Built In**:
  1. The landing page (`frontend/src/app/page.tsx`) automatically fires a silent, non-blocking `pingHealth()` call upon mounting to initiate container warm-up before the user configures an interview.
  2. If a network timeout occurs, the frontend displays an explicit connection banner:
     > *"Backend on free-tier Render instances may take ~30 seconds to spin up on cold start."* with a one-click **Retry Connection** button.

### 2. CORS Mismatches (`Access-Control-Allow-Origin` Errors)
* **Symptom**: Browser console logs `CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource`.
* **Remedy**:
  1. Verify that `NEXT_PUBLIC_API_BASE_URL` in Vercel has no trailing slash (e.g., `https://api.example.com` not `https://api.example.com/`).
  2. Ensure the exact origin in the browser address bar is listed in Render's `ALLOWED_ORIGINS`.

### 3. Diagnosing Typed Errors

The backend formats all errors into the canonical `ErrorDetail` schema:
```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable diagnostic description."
}
```

* **`LLM_GENERATION_FAILED` (HTTP 502)**:
  - *Cause*: Invalid `GROQ_API_KEY`, Groq rate-limiting (TPM/RPM limits reached), or upstream API degradation.
  - *Fix*: Check backend logs in the Render dashboard. If Groq is unavailable, temporarily set `QUIZ_PROVIDER=mock` to restore instant deterministic question delivery.
* **`SESSION_EXPIRED` (HTTP 410)**:
  - *Cause*: The user submitted an assessment after the 30-minute in-memory cache TTL elapsed, or the backend service restarted between generation and submission.
  - *Fix*: The UI guides the candidate to restart the quiz session. For multi-instance high-availability production clusters, migrate the session cache to Redis.
* **`INVALID_SENIORITY` / `INVALID_DIFFICULTY` (HTTP 422)**:
  - *Cause*: Unsupported query parameter passed (valid seniorities: `junior`, `mid`, `senior`; valid difficulties: `easy`, `medium`, `hard`).
  - *Fix*: Frontend UI enforces strict radio selections preventing malformed parameters.
