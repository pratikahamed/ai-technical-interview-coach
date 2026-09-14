---
name: Engineered Precision
colors:
  surface: '#121318'
  surface-dim: '#121318'
  surface-bright: '#38393f'
  surface-container-lowest: '#0d0e13'
  surface-container-low: '#1a1b21'
  surface-container: '#1e1f25'
  surface-container-high: '#292a2f'
  surface-container-highest: '#34343a'
  on-surface: '#e3e1e9'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#e3e1e9'
  inverse-on-surface: '#2f3036'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#56e5a9'
  on-tertiary: '#003824'
  tertiary-container: '#30c88f'
  on-tertiary-container: '#004e34'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#121318'
  on-background: '#e3e1e9'
  surface-variant: '#34343a'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers a focused, high-performance workspace tailored for technical interview preparation, system design simulations, and deep code analysis. Inspired by developer-first tools like Linear, Vercel, and Raycast, the aesthetic balances high-density utility with modern architectural refinement.

The visual style is characterized by:
- **Technical Minimalism & Low-Illumination Surfaces:** Near-black obsidian canvases anchored with faint technical grid overlays and soft cyan ambient radial backlights.
- **Engineered Edge Craft:** Subtle 1px structural borders paired with delicate top-edge inset highlights (simulating directional specular lighting from above).
- **Tactile Feedback:** Crisp micro-interactions, responsive states, monospaced data instrumentation, and low-latency state feedback that project calm, engineered confidence.

## Colors

The palette relies on deep oceanic dark tones that prevent eye fatigue during prolonged coding sessions, punctuated by vibrant functional accents.

- **Canvas & Backgrounds:**
  - Base Canvas: `#090A0F` (near-black deep navy)
  - Surface Tier 1 (Elevated Cards, Sidebars): `#11131F`
  - Surface Tier 2 (Interactive Elements, Menus, Hover Layers): `#181B2C`
  - Surface Tier 3 (Pills, Input Fields, Active Toggles): `#22263D`

- **Accents & States:**
  - **Primary (Focus & Electric Accents):** `#38BDF8` with dynamic gradients leading into `#06B6D4`.
  - **Success (Passed Tests, Solved State):** `#10B981` (Emerald).
  - **Warning (Optimization Alerts, Runtime Warnings):** `#F59E0B` (Amber).
  - **Error (Failed Asserts, Syntax Breaks):** `#F43F5E` (Crimson Rose).

- **Borders & Insets:**
  - Default Structural Border: `rgba(255, 255, 255, 0.08)`
  - Top-Edge Inset Highlight: `inset 0 1px 0 0 rgba(255, 255, 255, 0.12)`
  - Interactive Hover Border: `rgba(56, 189, 248, 0.35)`

## Typography

Typography establishes an immediate hierarchy between natural language instructions and structured machine metadata.

- **Primary UI & Headings (Geist):** Clean, geometric neo-grotesque optimized for screen legibility. Tighter letter spacing on display styles creates a unified, tool-grade feel.
- **Data & Rubric Metadata (JetBrains Mono):** Reserved for test case parameters, complexity metrics ($O(n \log n)$), terminal outputs, timestamps, token counters, and status badges.
- **Hierarchy Rules:** System metrics, status states, and rubric tags must always be rendered in monospaced uppercase or semi-bold variants with subtle tracking.

## Layout & Spacing

The design system implements a modular, high-density 12-column layout designed for multi-pane split workflows (code editor, AI coach dialog, whiteboard canvas, rubric assessment).

- **Breakpoint Architecture:**
  - Mobile (`< 768px`): Single vertical stack; collapsible floating bottom sheets for AI feedback.
  - Tablet (`768px – 1024px`): Dual-column split (Problem statement and interactive editor/evaluator).
  - Desktop (`> 1024px`): Tri-pane orchestration (Collapsible context rail, primary terminal/IDE, real-time AI critique stream).
- **Rhythm & Alignments:** Built on a disciplined 4px/8px micro-grid. Inset container paddings align strictly with outer gutters to preserve geometric lines across adjacent panes.

## Elevation & Depth

Visual hierarchy does not rely on heavy, muddy drop shadows. Instead, it employs optical lighting physics suited for dark interfaces:

- **Level 0 (Canvas):** `#090A0F` base canvas with a faint, repeating 24px SVG dot or line grid (`rgba(255, 255, 255, 0.025)`) and centered cyan radial ambient glows (`rgba(6, 182, 212, 0.04)` blurred at 120px).
- **Level 1 (Card & Module Surfaces):** `#11131F` background with an exterior 1px border (`rgba(255, 255, 255, 0.07)`) and a top-edge highlight (`box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`).
- **Level 2 (Popovers, Command Palettes, Modals):** `#181B2C` background, crisp 1px border (`rgba(56, 189, 248, 0.2)`), backed by a localized ambient cyan glow (`0 20px 40px -15px rgba(6, 182, 212, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.08)`).
- **Level 3 (Focused State / Active Glow):** Targeted items gain an inner cyan rim highlight and a soft outer neon fringe (`0 0 16px rgba(56, 189, 248, 0.25)`).

## Shapes

The design system maintains a structured, calibrated soft aesthetic (`roundedness: 1`):

- **Inputs, Badges, & Buttons:** `0.25rem` (4px) to `0.375rem` (6px) corner radius.
- **Panels, Splitters, & Cards:** `0.5rem` (8px) corner radius for sharp structural delineation.
- **Modals & Elevated Dialogs:** `0.75rem` (12px) maximum corner radius to retain sleek precision without feeling bulbous or toy-like.

## Components

### Buttons
- **Primary:** Gradient fill from `#38BDF8` to `#06B6D4`, dark text `#090A0F`, semi-bold weight. Border: `1px solid rgba(255, 255, 255, 0.2)`. Top inset light: `inset 0 1px 0 rgba(255, 255, 255, 0.35)`. Hover: elevated glow (`0 0 16px rgba(56, 189, 248, 0.4)`).
- **Secondary / Ghost:** Surface `#181B2C`, text `#E2E8F0`, border `1px solid rgba(255, 255, 255, 0.08)`. Top-edge highlight: `inset 0 1px 0 rgba(255, 255, 255, 0.08)`. Hover: background `#22263D`, border `rgba(56, 189, 248, 0.3)`.
- **Destructive:** Crimson background tint `rgba(244, 63, 94, 0.12)`, text `#F43F5E`, border `1px solid rgba(244, 63, 94, 0.3)`.

### Chips & Status Badges
- Displayed exclusively using `JetBrains Mono` at `label-sm`.
- **Pass / Optimal:** `bg: rgba(16, 185, 129, 0.1)`, `border: rgba(16, 185, 129, 0.25)`, text `#10B981`. Includes a leading 6px pulsing dot.
- **Fail / Warning:** `bg: rgba(244, 63, 94, 0.1)`, `border: rgba(244, 63, 94, 0.25)`, text `#F43F5E`.
- **Informational / Rubric Metric:** Surface `#181B2C`, text `#94A3B8`, border `rgba(255, 255, 255, 0.06)`.

### Cards & Code Panels
- Container: Surface `#11131F`, border `1px solid rgba(255, 255, 255, 0.07)`, inset top-edge highlight `inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`.
- Panel Header: Distinct separator bar with height `36px`, bottom border `1px solid rgba(255, 255, 255, 0.06)`, hosting monospaced filename tabs and runtime status indicators.

### Inputs & Terminal Command Fields
- Background: `#0D0F17` (sunken tier below surface).
- Inset shadow `inset 0 2px 4px rgba(0, 0, 0, 0.5)`.
- Border: `1px solid rgba(255, 255, 255, 0.08)`.
- Focus state: Border transitions to `#38BDF8` with a tight electric glow (`box-shadow: 0 0 0 1px #38BDF8, 0 0 12px rgba(56, 189, 248, 0.2)`).

### Selection Controls (Checkboxes & Radios)
- Sharp, compact (16px $\times$ 16px).
- Inactive: `#181B2C` fill, border `rgba(255, 255, 255, 0.2)`.
- Active: `#38BDF8` solid fill with dark `#090A0F` checkmark or radio pip.

### Domain-Specific Components
- **System Architecture Visualizer Node:** Mini-cards with dashed peripheral borders (`rgba(56, 189, 248, 0.4)`), status icons, and real-time latency badges.
- **AI Speech & Thought Telemetry Stream:** Inline transcript box with a cyan left border line (`2px solid #38BDF8`) and faint monospace timestamps (`#64748B`).
- **Rubric Performance Matrix:** Compact multi-axis scorecards tracking Time Complexity, Space Complexity, and Communication clarity with stepped bar graphs.