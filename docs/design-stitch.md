# Product Requirements Document (PRD) & Product Brief
## AI Technical Interview Coach (v2.4)

---

### Executive Summary & Vision
**Product Name:** AI Technical Interview Coach  
**Target Platform:** Responsive Web Application (Desktop-primary, Tablet, Mobile)  
**Target Audience:** Senior / Staff / Principal Software Engineers (L5–L7+), System Architects, and Technical Interview Candidates targeting Tier-1 tech firms and high-scale engineering organizations.

**The Problem:**  
Traditional mock interview tools rely either on human interviewers (expensive, asynchronous, subjective variance) or simplistic LeetCode-style autograders (syntax/test-case pass rates only). They fail to assess high-leverage architectural invariants, concurrency pitfalls, distributed systems trade-offs, and technical rationale under realistic interview conditions.

**The Solution:**  
A deterministic, low-latency, AI-native technical assessment platform designed with an "Engineered Precision" aesthetic. It provides rigorous calibration across System Design, Algorithms, Low-Level Design (LLD), Core Java, and Spring Framework, pairing real-time interactive assessment with immediate zero-drift rubric scoring, deep telemetry, and invariant proofs.

---

### Brand & Design System Foundations
- **Design Philosophy:** "Engineered Precision" — inspired by Linear, Raycast, and Vercel. Calm confidence, high density, deliberate visual hierarchy.
- **Theme & Surfaces:**
  - Background: Deep Near-Black Navy (`#090A0F`) with faint cyan radial accents and subtle engineering grid lines.
  - Cards & Elevated Panels: `#11131F`, 1px hairline borders (`rgba(255,255,255,0.08)`), top edge highlights.
  - Interactive Hover: `#181B2C`.
  - Primary Accent: Electric Cyan (`#38BDF8` / `#06B6D4`) with soft glow filters.
  - Status Vectors: Emerald Green (`#10B981`) for passing/online, Amber/Rose (`#F43F5E`) for deviations/errors.
- **Typography:**
  - UI & Headings: Geist Sans / Inter with tight tracking (`-0.02em`).
  - Metadata, Counters, Code & Rubric Rubrics: JetBrains Mono (`text-xs` / `text-sm`).

---

### Core User Flows & Information Architecture

```
[Landing Page (/)] 
       │
       ▼
[Track Selection (/interview)] ── (Select Track & Preset Mode)
       │
       ▼
[Active Assessment Quiz (/interview/active)] ── (Timed or Untimed Question Loop)
       │
       ▼
[Scorecard & Results (/results)] ── (Composite Score, Invariant Telemetry, PDF Export)
```

---

### Feature Specifications by Page

#### 1. Landing Page (`/`)
* **Purpose:** High-conversion developer landing page establishing the platform's rigor and deterministic evaluation engine.
* **Key Components:**
  - **Glass Navigation:** Logo with terminal caret + network node symbol, live status pill (`Phase 1 Live • Untimed Assessment Mode`), docs/curriculum quicklinks, launch CTA.
  - **Hero Module:** Monospace badge (`⚡ Deterministic Assessment Engine • Zero Latency`), gradient headline, dual CTAs (`Start Mock Interview`, `Explore Question Rubric`).
  - **Live Telemetry & Rubric Terminal:** Code snippet preview running background evaluation daemon with live sub-50ms latency counter and pass calibration badges.
  - **5-Track Matrix:** Responsive card grid covering Data Structures & Algorithms, System Design, Low Level Design, Core Java, and Spring Framework.
  - **Value Pillars:** Deterministic Rubrics (0.00% drift), Sub-50ms response orchestrator, and FAANG L6+ Seniority Calibration Bar.

#### 2. Assessment Track Selection (`/interview`)
* **Purpose:** Multi-track selector allowing engineers to configure their simulation parameters before initialization.
* **Key Components:**
  - **Track Grid with States:**
    - *Selected State:* Electric cyan glow border, active checkmark, track ID pill (`Track 01 - System Design`).
    - *Default State:* Sleek slate border, scope chips (`Scalability`, `Caching Layers`, `CAP Theorem`).
    - *Loading / Skeleton State:* Animated shimmer pulse blocks ensuring zero layout shift.
  - **Backend Health Monitor:** Warning banner handling cold-start or gateway cache resume (`Engine Instance Resuming • HTTP 503 • Retry countdown`).
  - **Session Calibration Presets:** Time mode toggle (Untimed / Timed), Interviewer Persona selector (`Principal Architect AI`), and Post-Mortem Tri-Axis Matrix.
  - **Sticky Bottom Action Bar:** Persistent confirmation drawer reflecting active selection with dual states (`Begin Interview →` active vs disabled placeholder).

#### 3. Active Assessment Quiz (`/interview/active`)
* **Purpose:** Focused, distraction-free environment for executing scenario-based architectural and algorithmic evaluations.
* **Key Components:**
  - **Status & Navigation Chrome:** Active domain tag, current question counter (`02 / 03`), elapsed timer, and segmented glowing progress rail.
  - **Problem Spec Header:** Scenario UID (`SCENARIO_SPEC // BST_094`), category taxonomy, and weighted scoring points (e.g. `Weight: 35.0 pts`).
  - **Scenario Prompt & Invariant Telemetry:** High-contrast technical problem statement paired with mathematical bounds check box (e.g., AVL tree depth guarantees).
  - **Deterministic Option Matrix:** Stacked option buttons [A]-[D] with clear hover, keyboard accessibility, and active selection state.
  - **Resilience & Offline Handling:** Inline notification banner (`Submission Sync Interrupted • ERR_HTTP_503`) ensuring answers are preserved in local cache with immediate retry trigger.
  - **Execution Controls:** `Previous Question`, `Save Draft & Exit`, and dynamic `Next Question` / `Submit Interview` locked-status logic.

#### 4. Results & Scorecard Report (`/results`)
* **Purpose:** Exhaustive post-assessment diagnostic benchmarking candidate performance against staff-level rubrics.
* **Key Components:**
  - **Performance Gauge:** Circular SVG radial dial displaying Composite Score (`66.7%`), target threshold diff, and verification chip (`#EV-8902`).
  - **Status Outcomes:** Dual outcome visual pills: Passing (`Candidate Passed • Ready for Screening`) vs Re-evaluation guidance.
  - **Metric Breakdown Strip:** Scope Matrix, Accuracy Counter, Evaluation Domain, and Assessment Latency (`06m 42s`).
  - **Granular Question Diagnostics:**
    - Per-question score delta tags (`+33.3%` / `0.0%`).
    - Side-by-side comparison: Candidate Submission vs Deterministic Key (with strikethrough error marking).
    - Monospace architectural callouts: `💡 Rationale & Invariant Proof` and `💡 Architectural Telemetry & Pitfall Rationale`.
  - **Export & Navigation Controls:** Primary `Retake Interview`, `Back to Home`, and `Export Rubric PDF`.
  - **Fallback State:** Embedded empty/expired session handler (`HTTP 404 • NULL_TELEMETRY`) with return navigation.

---

### Non-Functional Requirements & Engineering Standards
1. **Performance & Latency:**
   - Client initial paint target: < 1.2s on standard broadband.
   - Zero Layout Shift (CLS < 0.05): Skeleton blocks match exact dimensional bounds of loaded components.
2. **Deterministic Grading:**
   - Rule-based invariant checking combined with bounded LLM evaluators to guarantee 0.00% grading drift across identical submissions.
3. **Fault Tolerance & Offline Resilience:**
   - Automatic local storage cache sync for active quiz drafts.
   - Idempotent API endpoints for submission retries on transient network disconnects.
4. **Responsiveness:**
   - Fluid transitions across Desktop (`1440px`), Tablet (`768px`), and Mobile (`390px`).
   - Sticky bottom utility drawers on mobile screens for primary CTAs.

---

### Future Roadmap & Horizon Features
- **v2.5:** Live Simulation IDE — dual-pane interactive architecture whiteboard and code execution terminal.
- **v2.6:** Voice & Conversational Simulation — streaming low-latency voice interviews with Principal Architect AI personas.
- **v2.7:** Team & Enterprise Dashboard — cohort performance analytics and candidate screening pipelines for engineering hiring managers.
