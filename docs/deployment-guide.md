# Production Deployment Guide: AI Technical Interview Coach

This guide details deployment procedures for the polyglot monorepo: FastAPI backend on **Render** and Next.js frontend on **Vercel**.

---

## 1. Architecture & Deployment Matrix

```text
               ┌───────────────────────┐
               │    Client Browser     │
               └───────────┬───────────┘
                           │ HTTPS
            ┌──────────────┴──────────────┐
            ▼                             ▼
   ┌─────────────────┐           ┌─────────────────┐
   │  Vercel Edge    │           │  Render Web     │
   │  (Next.js App)  │           │  (FastAPI)      │
   │  Port: 443      │           │  Port: 8000/Env │
   └─────────────────┘           └────────┬────────┘
                                          │ Outbound HTTPS
                                          ▼
                                 ┌─────────────────┐
                                 │    Groq Cloud   │
                                 │ (gpt-oss-120b)  │
                                 └─────────────────┘
```

---

## 2. Backend Deployment (Render)

### Option A: Render Blueprint (`render.yaml`)
1. In the Render Dashboard, select **New** $\to$ **Blueprint**.
2. Connect your Git repository.
3. Render will auto-detect `backend/render.yaml`:
   ```yaml
   services:
     - type: web
       name: ai-interview-coach-backend
       env: python
       rootDir: backend
       buildCommand: pip install -r requirements.txt
       startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
       healthCheckPath: /health
       envVars:
         - key: ENVIRONMENT
           value: production
         - key: ALLOWED_ORIGINS
           sync: false
         - key: QUIZ_PROVIDER
           value: groq
         - key: GROQ_API_KEY
           sync: false
         - key: GROQ_MODEL
           value: openai/gpt-oss-120b
         - key: GROQ_REQUEST_TIMEOUT_SECONDS
           value: 30
   ```

### Option B: Docker Container Deployment
- Root context: `backend/`
- Dockerfile: `backend/Dockerfile`
- Build command: `docker build -t ai-interview-coach-backend backend/`
- Run command: `docker run -p 8000:8000 -e GROQ_API_KEY="gsk_..." ai-interview-coach-backend`

### Backend Environment Variables
| Variable | Production Value | Description |
| :--- | :--- | :--- |
| `PORT` | `8000` (or injected by host) | Port binding |
| `ENVIRONMENT` | `production` | Production environment flag |
| `LOG_LEVEL` | `INFO` | Standard logging verbosity |
| `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | Comma-separated CORS origins |
| `QUIZ_PROVIDER` | `groq` | Dynamic generation engine (`groq` or `mock`) |
| `GROQ_API_KEY` | `gsk_...` | Server-only Groq API key |
| `GROQ_MODEL` | `openai/gpt-oss-120b` | Model identifier |
| `GROQ_REQUEST_TIMEOUT_SECONDS` | `30` | Request timeout ceiling |

---

## 3. Frontend Deployment (Vercel)

1. In the Vercel Dashboard, import the Git repository.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Next.js**.
4. Configure Environment Variables:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://ai-interview-coach-backend.onrender.com`
5. Click **Deploy**.

---

## 4. Verification & Post-Deployment Smoke Checks

### 1. Backend Health Probe
```bash
curl -i https://ai-interview-coach-backend.onrender.com/health
```
Expected response:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{"status":"healthy"}
```

### 2. CORS Preflight Check
```bash
curl -i -X OPTIONS https://ai-interview-coach-backend.onrender.com/api/v1/topics \
  -H "Origin: https://your-frontend.vercel.app" \
  -H "Access-Control-Request-Method: GET"
```
Expected response:
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://your-frontend.vercel.app
Access-Control-Allow-Credentials: true
```

### 3. Topic Inventory Check
```bash
curl https://ai-interview-coach-backend.onrender.com/api/v1/topics
```
Expected response: Returns array of 5 tracks (`dsa`, `system-design`, `lld`, `java`, `spring`).
