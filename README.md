# LIFELINE — Your Life, In Receipts

**LIFELINE** is an interactive, privacy-first personal data observatory and evidence-backed narrative engine. It transforms raw, fragmented digital transaction logs into verified behavioral patterns, interconnected knowledge constellations, and an interactive editorial story.

---

## Problem

Modern digital life is scattered across isolated silos: songs listened to in nocturnal hours, daily grocery receipts, rent payments, and card swipes. Traditional personal data tools display these records as flat chronological spreadsheets or generic financial dashboards devoid of behavioral context. The challenge is discovering the underlying structure of a digital life without fabricating ungrounded causal relationships.

$$\text{Raw Data} \longrightarrow \text{Insights} \longrightarrow \text{Connections} \longrightarrow \text{Chapters} \longrightarrow \text{Story}$$

---

## Solution

LIFELINE operates on the core principle of **Evidence-Backed Interactive Storytelling**:

1. **Empirical Pattern Extraction**: Algorithmic analysis uncovers structural shifts (e.g., skip-rate collapse, nocturnal cadence, and ticket-size divergence) directly from timestamps and categories.
2. **Temporal Synthesis**: Parallel life streams are mapped onto an interconnected knowledge constellation without inventing false causal links.
3. **Receipt-Level Drill-Down**: Every narrative statement and insight is backed by sample sizes ($n$), timestamps, and deep links into individual supporting receipts.

```
RAW RECEIPTS (161,046 records)
    │
    ▼
PATTERNS ──► CONNECTIONS ──► EVIDENCE ──► STORY
    │              │             │          │
    ▼              ▼             ▼          ▼
Discoveries  Constellation   Explorer   Chapters
```

---

## Data Sources

LIFELINE ingests and normalizes three real-world datasets:

| Dataset | Stream ID | Temporal Span | Total Records | Focus Area |
|---|---|---|---|---|
| **Spotify Streaming History** | `spotify` | 2013 – 2024 (11 years) | 149,860 streams | Playback timestamps, artist loyalty, nocturnal listening, skip rate transitions |
| **Daily Household Transactions** | `household` | 2015 – 2018 (4 years) | 2,461 entries | Cash and domestic bank ledger, category frequencies (Food, Transport, Apparel) |
| **India Multi-Facet Card Commerce** | `transactions` | 2022 – 2024 (2 years) | 8,725 records | Point-of-sale card commerce, retail, travel, entertainment, healthcare spending |

> **Important Note on Data Modalities**: The three datasets represent distinct, un-linked real-world telemetry sources. LIFELINE does not invent fake causal links or claim that listening to a song caused an expenditure. All cross-dataset syntheses are strictly **temporal comparisons** mapping concurrent life epochs without speculative causality.

---

## Core Features

- **Observatory**: Panoramic macro telemetry providing high-level coverage of longitudinal years, temporal coverage cards, distribution charts, and the Discovery Engine Pipeline.
- **Receipt Explorer**: Multi-stream search and filtering engine supporting date ranges, category facets, time-of-day filters, skip-state filters, and deep-link query parameters.
- **Evidence-Backed Discoveries**: Algorithmic pattern detection surfacing 11 verified behavioral insights (temporal rhythms, skip rate shifts, domestic expense distributions, and ticket size variations).
- **Life Constellation**: Interactive 14-node knowledge network graph mapping parallel streams, temporal overlaps, and entity relationships across data modalities.
- **Interactive Story Mode**: An editorial 5-chapter data story with step-by-step narrative progression, tailored inline visualizations, evidence modals, and seamless drill-downs to the Explorer.
- **Evidence Engine**: Empirical verification framework backing every discovery with sample sizes ($n$), timestamps, and baseline delta metrics.

---

## Architecture

LIFELINE follows a strict unidirectional dependency hierarchy:

```
Data (Local CSV Sources)
   ↓
Normalization & Ingestion (PII Sanitization Boundary)
   ↓
Analytics Engine (Aggregations, Rhythms, Statistics)
   ↓
Patterns / Connections / Evidence Engine
   ↓
Feature View Models (UI-ready data contracts)
   ↓
React UI (Route-Level Lazy Loading & Interactive Views)
```

### Clean Architecture Boundaries

- `src/data/`: Responsible for loading, parsing, schema normalization, and PII sanitization.
- `src/analytics/`: Pure, framework-independent domain analytics (patterns, discoveries, connections, evidence). Zero React dependencies.
- `src/features/`: Feature-specific UI components and isolated view models (`storyModel`, `discoveryModel`, `constellationModel`, `viewModel`, `explorerModel`).
- `src/components/`: Reusable, accessible presentation primitives (Badge, Button, Card, LoadingState, ErrorState, SectionHeader).
- `src/hooks/`: React state management and telemetry data consumption hooks (`useLifeAnalytics`).
- `src/lib/`: Constants, formatters, and design tokens.
- `src/types/`: Shared TypeScript data contracts and interfaces.

---

## Performance & Optimization

- **Precomputed Compact Telemetry**: Full analytics are pre-aggregated into a compact 125 KB payload (`life_analytics.json`). On application startup, the browser fast-loads this compact payload with zero network overhead.
- **Route-Level Code Splitting**: Using `React.lazy` and `Suspense`, non-initial feature views (`ExplorerView`, `DiscoveriesView`, `StoryView`) are split into isolated chunks, ensuring initial Observatory page loads are immediate.
- **On-Demand Raw Receipt Loading**: Raw stream receipts are parsed only when the user navigates into the Explorer.
- **Zero Raw Record DOM Bloat**: The application never renders 150K raw DOM elements. Receipts in the Explorer are filtered in memory and paginated (10/25/50 items per page).
- **Memoized Selectors**: View models and filtered collections are cached using `useMemo` and stable module-level caches to eliminate redundant computations during render cycles.

---

## Privacy & Data Safety

LIFELINE enforces strict, client-side data sanitization:

- **100% Client-Side Processing**: Zero data leaves the browser. No external AI APIs or cloud telemetry services are invoked.
- **Ingestion-Level PII Scrubber**: Sensitive identity and financial fields (`cc_num`, `customer_id`, `first`, `last`, `street`, `dob`) are permanently stripped at the CSV ingestion boundary.
- **Safe View**: Only aggregated totals, categories, cities, states, and scrubbed receipt timestamps are stored or displayed.
- **No PII in Telemetry**: Evaluator-visible badge `PII SANITIZED · SAFE VIEW` indicates safe, scrubbed view models.

---

## Accessibility

- **Semantic HTML**: Proper `<article>`, `<nav>`, `<header>`, `<main>`, `<dialog>`, and `<button>` landmarks.
- **Keyboard Navigation**: Full keyboard reachability across all interactive views; `Escape` closes modals and drawers; Arrow keys advance/rewind Story chapters.
- **ARIA Attributes**: `role="dialog"`, `aria-modal="true"`, `aria-label`, and `aria-expanded` attributes implemented on interactive controls and icon-only buttons.
- **Reduced Motion**: Full compliance with `prefers-reduced-motion`; animated transitions degrade gracefully to instant state changes.
- **Visible Focus States**: Custom focus rings for keyboard navigation.

---

## Running Locally

### Prerequisites

- Node.js $\ge 18.0.0$
- npm $\ge 9.0.0$

### Installation & Commands

Only commands that exist in `package.json` are used:

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build for production (TypeScript compile & Vite bundle)
npm run build

# 4. Preview production build locally
npm run preview
```

### Running Validation Suites

```bash
# Full end-to-end QA verification suite (53 checks)
npx tsx scripts/validate_end_to_end.ts

# Story Mode validation suite
npx tsx scripts/validate_story.ts

# Discoveries & Constellation validation suite
npx tsx scripts/validate_discoveries.ts

# Receipt Explorer validation suite
npx tsx scripts/validate_explorer.ts

# Core analytics & PII sanitization validation suite
npx tsx scripts/validate_analytics.js
```

---

## Hackathon Requirements Mapping

| Problem Statement Requirement | LIFELINE Implementation | Evaluator-Visible Signal |
|---|---|---|
| **1. Explore life receipts** | Multi-Stream Receipt Explorer | Searchable, paginated receipt cards across Music, Domestic, and Commerce modalities |
| **2. Search & filtering** | Adaptive Filter System | Faceted filter chips by year, category, time of day, skip status, and sort orders |
| **3. Discover patterns** | Discoveries Engine | 11 evidence-grounded discovery cards with confidence metrics and sample sizes |
| **4. Reveal relationships** | Life Constellation | Interactive 14-node network graph linking streams, artists, categories, and periods |
| **5. Interactive storytelling** | Story Mode | 5 editorial chapters with step progression, inline charts, and drill-down links |
| **6. Visual digital journey** | Observatory & Pipeline | Longitudinal coverage cards, Discovery Engine Pipeline, and temporal journey progression |
| **7. Responsive design** | Responsive Layout | Fluid layouts verified at 375px, 768px, 1024px, and 1440px with touch support |
| **8. Privacy & data safety** | Ingestion-level PII scrubber | Safe view badges; all sensitive financial and identity fields excluded |

---

## Team & Credits

Developed for the **“Your Life, In Receipts”** Frontend Hackathon.
Built with focus on data honesty, editorial design, and evidence-grounded personal telemetry.
