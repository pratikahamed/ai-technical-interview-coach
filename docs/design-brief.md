# Product & Design Brief: AI Technical Interview Coach

## 1. Design Vision: "Engineered Precision"
The **AI Technical Interview Coach** is styled after high-leverage developer tooling (Raycast, Linear, Vercel). The aesthetic communicates rigorous technical calibration, high density, and deliberate visual hierarchy without unnecessary decoration.

---

## 2. Color Palette & Design Tokens

### Background & Neutral Surfaces
| Token | Value | Description |
| :--- | :--- | :--- |
| `surface-dim` | `#090A0F` | Root application background (Deep space navy) |
| `surface-container-low` | `#11131F` | Elevated cards, question panels, and nav bars |
| `surface-container` | `#161928` | Interactive cards, badges, and secondary elements |
| `surface-container-high` | `#1C2136` | Active states and focused controls |
| `surface-container-highest`| `#252C48` | High-contrast boundaries |
| `outline` | `rgba(255,255,255,0.08)` | Hairline border definition |
| `outline-variant` | `rgba(255,255,255,0.04)` | Subtle dividers and grid lines |

### Accent & Semantic Tokens
| Token | Value | Role |
| :--- | :--- | :--- |
| `primary` | `#38BDF8` | Electric Cyan — Brand accent, primary CTAs, active selections |
| `secondary` | `#06B6D4` | Teal Cyan — Secondary accents and telemetry markers |
| `tertiary` | `#10B981` | Emerald Green — Passing scores, online status, correct reviews |
| `error` | `#F43F5E` | Rose Coral — Validation rejections, missed questions, fatal errors |

---

## 3. Typography Hierarchy
- **Sans Serif**: `Geist Sans` / `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`.
  - Headings: Tight tracking (`-0.025em`), bold or medium weight.
  - Body: High legibility, relaxed line-height (`1.6`).
- **Monospace**: `JetBrains Mono`, `ui-monospace`, `Menlo`, `Monaco`, `Consolas`.
  - Used for scenario IDs, track tags, scores, timers, percentages, and invariant proofs.

---

## 4. Visual Signatures & Micro-Interactions
1. **Specular Rim Lighting (`.specular-rim`)**:
   - `box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.1);`
   - Creates a physical, chamfered top-edge highlight on dark cards.
2. **Radial Atmospheric Glow**:
   - Soft, low-opacity blur circles (`blur-[140px] opacity-15`) positioned behind hero elements and gauges.
3. **Technical Dot Matrix Background (`.bg-grid-tech`)**:
   - Radial gradients spaced at 28px intervals (`rgba(255, 255, 255, 0.045)`).
4. **Accessible Focus Rings (`.focus-ring`)**:
   - `focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none`.

---

## 5. Accessibility (a11y) Standards
- **WCAG 2.1 AA Compliance**: Contrast ratio $\ge 4.5:1$ across text and interactive surfaces.
- **ARIA Semantics**:
  - Seniority, Topic, and Difficulty selectors use `role="radiogroup"` with child `role="radio"` and dynamic `aria-checked`.
  - Quiz options use accessible radio semantics with full keyboard traversal (`Tab`, `Space`, `Enter`).
- **Reduced Motion**:
  - Global CSS rule enforces `animation-duration: 0.01ms` and `transition-duration: 0.01ms` when `@media (prefers-reduced-motion: reduce)` is active.
- **Zero CLS**:
  - Skeleton loaders maintain identical bounding box heights (`min-h-[200px]`) during asynchronous data fetches.
