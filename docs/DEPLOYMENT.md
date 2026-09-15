# Production Cloud Deployment Guide

This canonical deployment guide details the end-to-end production rollout for the **AI Technical Interview Coach** platform. The system is designed as a decoupled polyglot monorepo featuring a native FastAPI Python backend hosted on **Render** and a Next.js App Router frontend hosted on **Vercel**, with dynamic AI question synthesis powered by **Groq Cloud**.

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
│   • Global Edge CDN                                                    │
│   • Server Components & Optimized Client Bundles                       │
│   • Root: frontend/                                                    │
│   • Config: frontend/vercel.json                                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ 2. CORS-Secured REST API Handshake
                                    │    (JSON Payload / 15s Abort Timeout)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          Render Cloud Service                          │
│                         FastAPI / Uvicorn Server                       │
│   • Native Python 3.11 Runtime                                         │
│   • Root: backend/                                                     │
│   • Health Probes: GET / and GET /health                               │
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

1. **GitHub Repository**: A pushed copy of this repository (`ai-interview-coach`) on GitHub.
2. **Groq Cloud API Key**: An active API key from the [Groq Console](https://console.groq.com/keys) (`gsk_...`).
3. **Render Account**: An account on [Render.com](https://render.com) for deploying the FastAPI backend.
4. **Vercel Account**: An account on [Vercel.com](https://vercel.com) for deploying the Next.js frontend.

---

## 3. Backend Deployment (FastAPI on Render)

The backend runs as a native Python web service on Render. You can deploy it using either the **Render Blueprint (Recommended)** for instant 1-click configuration, or via the **Manual Web Service Setup**.

### Option A: Render Blueprint Deployment (Recommended)

The repository includes a canonical [`render.yaml`](file:///c:/Users/Pratik%20Ahamed/Desktop/Antigravity_Projects/ai-interview-coach/render.yaml) at the repository root that automatically configures the service, root directory, build command, start command, and environment variables.

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** $\to$ **Blueprint**.
3. Select your connected GitHub repository: `ai-interview-coach`.
4. Render will read `render.yaml` and display the `ai-interview-coach-api` service configuration.
5. In the environment variables prompt, enter your `GROQ_API_KEY` (format: `gsk_...`).
6. Click **Apply**. Render will automatically build and launch the Python backend service.

---

### Option B: Manual Web Service Setup

If you prefer to configure the Web Service manually through the Render Dashboard:

1. In the [Render Dashboard](https://dashboard.render.com/), click **New +** $\to$ **Web Service**.
2. Select your connected GitHub repository: `ai-interview-coach`.
3. Configure the service settings:
   - **Name**: `ai-interview-coach-api` (or your preferred name)
   - **Region**: Select your preferred region (e.g., `Oregon (US West)` or `Frankfurt (EU Central)`)
   - **Branch**: `main`
   - **Root Directory**: `backend` *(CRITICAL: This isolates the backend build context)*
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
   - **Instance Type**: `Free` (or `Starter` for dedicated zero-cold-start performance)

4. Add the Environment Variables listed in the table below.
5. Click **Create Web Service**.

---

### Backend Environment Variables Table

Configure these variables in Render under **Environment**:

| Variable | Required | Default | Production Example | Description |
| :--- | :--- | :--- | :--- | :--- |
| `PYTHON_VERSION` | Yes | `3.11.9` | `3.11.9` | Pins Python 3.11 runtime on Render. |
| `PORT` | Auto | `8000` | *Auto-assigned by Render (`$PORT`)* | Port on which Uvicorn binds. |
| `ENVIRONMENT` | Optional | `development` | `production` | Active runtime stage. |
| `LOG_LEVEL` | Optional | `INFO` | `INFO` | Logging threshold (`DEBUG`, `INFO`, `WARNING`, `ERROR`). |
| `ALLOWED_ORIGINS` | Yes | `http://localhost:3000` | `https://<your-app>.vercel.app,http://localhost:3000` | Whitelisted origins for CORS. Supports comma-separated list or `*`. |
| `QUIZ_PROVIDER` | Yes | `groq` | `groq` | Evaluation engine toggle (`groq` for live LLM, `mock` for deterministic fallback). |
| `GROQ_API_KEY` | Yes (if groq) | *(Empty)* | `gsk_...` | Groq Cloud secret key. |
| `GROQ_MODEL` | Optional | `openai/gpt-oss-120b` | `openai/gpt-oss-120b` | Target Groq model. |
| `GROQ_REQUEST_TIMEOUT_SECONDS` | Optional | `30` | `15` | Timeout before retry or fallback on slow LLM calls. |

---

## 4. Frontend Deployment (Next.js on Vercel)

The frontend is a Next.js 16 App Router application configured for native deployment on Vercel.

### Step-by-Step Deployment

1. Log in to the [Vercel Dashboard](https://vercel.com/) and click **Add New...** $\to$ **Project**.
2. Import the `ai-interview-coach` GitHub repository.
3. In the project configuration screen:
   - **Project Name**: `ai-interview-coach` (or your preferred name)
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and select **`frontend`** *(CRITICAL: The Next.js app is located in the `frontend` folder. Leaving this as `./` will fail the build).*
4. Expand the **Environment Variables** section and configure:

| Variable | Environment | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | Production, Preview, Dev | `https://ai-interview-coach-api.onrender.com` | Base URL of your deployed Render FastAPI backend. |
| `NEXT_PUBLIC_SITE_URL` | Production, Preview | `https://ai-interview-coach.vercel.app` | Canonical site URL for metadata and OpenGraph SEO. |

5. Click **Deploy**. Vercel will run `npm run build` using Turbopack and generate the static routes (`/`, `/interview`, `/results`).

> [!WARNING]
> **Secrets Hygiene**: The `GROQ_API_KEY` must **NEVER** be entered into Vercel or prefixed with `NEXT_PUBLIC_`. The client browser only receives public masked models (`QuestionPublic`), and all grading occurs on the FastAPI backend.

---

## 5. CORS Hardening & Cross-Service Handshake

To allow your Vercel frontend to communicate with your Render backend:

1. Copy your production Vercel URL (e.g., `https://ai-interview-coach.vercel.app`).
2. In the Render Dashboard for `ai-interview-coach-api`:
   - Navigate to **Environment**.
   - Edit `ALLOWED_ORIGINS` to include your Vercel URL:
     ```env
     ALLOWED_ORIGINS=https://ai-interview-coach.vercel.app,http://localhost:3000
     ```
   - Click **Save Changes**. Render will automatically redeploy the backend service.
3. **Automated Preview Branch Support**:
   - The backend natively enables regex matching for preview deployments:
     ```python
     allow_origin_regex=r"^https://.*\.vercel\.app$"
     ```
   - Any pull request or preview branch deployed by Vercel can automatically communicate with the backend without manual origin updates.

---

## 6. Post-Deployment Verification Checklist

Once both services report green/live status, verify the end-to-end integration:

- [ ] **1. Root Endpoint Probe**:
  ```bash
  curl -i https://<your-render-api>.onrender.com/
  ```
  *Expected Output:* HTTP 200 OK, `{"status": "healthy", "service": "AI Technical Interview Coach API", ...}`.

- [ ] **2. Health Probe**:
  ```bash
  curl -i https://<your-render-api>.onrender.com/health
  ```
  *Expected Output:* HTTP 200 OK, `{"status": "healthy"}`.

- [ ] **3. OpenAPI Documentation**:
  Open `https://<your-render-api>.onrender.com/docs` in your browser. Verify interactive endpoints: `/api/v1/topics`, `/api/v1/quiz/generate`, `/api/v1/quiz/evaluate`.

- [ ] **4. Landing Page Engine Indicator**:
  Open `https://<your-vercel-app>.vercel.app/`. The top navigation bar should display:
  - Green pulse indicator
  - Text: `Engine Active (XXms)`

- [ ] **5. Full Interview Workflow**:
  - Click **Start Assessment** or navigate to `/interview`.
  - Configure: **Seniority Tier** $\to$ **Track** $\to$ **Difficulty**.
  - Click **Begin Interview**.
  - Answer 3 scenario MCQs.
  - Click **Submit Assessment** and verify that `/results` renders your composite score gauge and performance breakdown.

- [ ] **6. Security Masking Audit**:
  - Open browser DevTools $\to$ **Network** tab.
  - Inspect the `POST /api/v1/quiz/generate` response payload.
  - Verify that `correct_option_index` and `explanation` are completely omitted from the client payload.

---

## 7. Troubleshooting Common Deployment Issues

### 1. Render: "ModuleNotFoundError: No module named 'dotenv'"
* **Root Cause**: Earlier versions of `requirements.txt` omitted `python-dotenv`.
* **Fix**: Ensure `backend/requirements.txt` includes `python-dotenv>=1.0.0`, `anyio>=4.3.0`, and `pydantic-settings>=2.2.0` (already updated in the repository).

### 2. Render: Build or Start Command Not Found
* **Root Cause**: The **Root Directory** was not set to `backend` in Render, causing Render to run in the repo root where no `requirements.txt` exists.
* **Fix**: In Render Settings $\to$ **Root Directory**, set the value to `backend`. Alternatively, use the `render.yaml` Blueprint which sets this automatically.

### 3. Vercel: "No Next.js version could be detected in your project"
* **Root Cause**: Vercel default imported from `./` (repository root) instead of `frontend`.
* **Fix**: In Vercel Project Settings $\to$ **General** $\to$ **Root Directory**, click **Edit**, type `frontend`, and click **Save**. Trigger a redeploy.

### 4. Vercel: "TypeError: Invalid URL" during build
* **Root Cause**: `NEXT_PUBLIC_SITE_URL` was configured without the `https://` protocol (e.g. `my-app.vercel.app`).
* **Fix**: The client now defensively sanitizes site URLs and prepends `https://` automatically. Always use the full URL: `https://my-app.vercel.app`.

### 5. Render: Free-Tier Cold Starts (30–50s delay)
* **Symptom**: On the free tier, Render spins down web services after 15 minutes of inactivity. First requests can take 30–50 seconds to respond.
* **Mitigation**:
  1. The landing page (`frontend/src/app/page.tsx`) automatically triggers a non-blocking `pingHealth()` call upon mounting to start warming the backend container before the user finishes selecting interview parameters.
  2. The Navbar health indicator and interview page include retry buttons and warm-up diagnostic messages.

### 6. CORS Policy Errors
* **Symptom**: Browser console logs `CORS policy: No 'Access-Control-Allow-Origin' header is present`.
* **Fix**:
  1. Ensure `ALLOWED_ORIGINS` in Render includes your exact Vercel URL (e.g. `https://<your-app>.vercel.app`).
  2. Ensure `NEXT_PUBLIC_API_BASE_URL` in Vercel has no trailing slash.
  3. If troubleshooting, you can temporarily set `ALLOWED_ORIGINS=*` in Render—the backend CORS middleware now safely handles wildcards without crashing.
