# LIFELINE — Your Life, In Receipts

**LIFELINE** is an interactive, privacy-first personal data observatory and evidence-backed narrative engine. It ingests fragmented digital receipts—spanning 11 years of music streaming history, four years of domestic cash ledgers, and multi-facet card commerce—and transforms raw transaction logs into verified behavioral patterns, interconnected life constellations, and an interactive editorial story.

---

## The Problem

Modern digital life is scattered across isolated silos: songs listened to in late-night hours, daily grocery bills, train tickets, rent payments, and card swipes. Traditional tools display these records as flat chronological spreadsheets, raw transaction tables, or generic financial dashboards with no narrative context.

The challenge is not simply listing receipts; it is discovering the underlying structure of a digital life:

$$\text{Raw Data} \longrightarrow \text{Insights} \longrightarrow \text{Connections} \longrightarrow \text{Chapters} \longrightarrow \text{Story}$$

---

## The Solution

LIFELINE operates on a fundamental product principle: **Evidence-Backed Interactive Storytelling**.

Rather than inventing emotional narratives or making ungrounded causal claims, LIFELINE computes empirical patterns across multiple temporal epochs. Every pattern is backed by verifiable statistical evidence, sample sizes ($n$), and source datasets, allowing users to drill down from high-level narrative chapters directly into the individual supporting receipts.

```
RAW RECEIPTS (161,046 logs)
    │
    ▼
MOMENTS ──► PATTERNS ──► CONNECTIONS ──► CHAPTERS ──► STORY
    │            │             │            │           │
    ▼            ▼             ▼            ▼           ▼
 Explorer    Discoveries  Constellation   Chapters  Completion
```

---

## Key Features

- **Macro Observatory**: High-level telemetry dashboard providing panoramic coverage of 12 observational years, temporal coverage cards, distribution charts, and discovery highlights.
- **Receipt Explorer**: Multi-stream search and filter engine supporting date ranges, category facets, time-of-day filters, skip-state filters, and deep-link query params.
- **Evidence-Backed Discoveries**: Algorithmic pattern detection surfacing 11 verified behavioral insights (temporal rhythms, skip rate shifts, domestic expense distributions, and ticket size variations).
- **Life Constellation**: Interactive knowledge network graph mapping parallel streams, temporal overlaps, and entity relationships across data modalities.
- **Interactive Story Mode**: An editorial 5-chapter data story with step-by-step narrative progression, tailored inline visualizations, evidence modals, and seamless drill-downs to the Explorer.
- **Strict Client-Side Privacy**: Zero data leaves the browser. Sensitive identity fields (`cc_num`, `customer_id`, names, street addresses, and dates of birth) are permanently sanitized at the ingestion boundary.
- **High-Performance Architecture**: 161K raw CSV rows are ingested, normalized, and pre-aggregated into a compact 125 KB analytics payload, ensuring instant transitions and zero DOM bloat.

---

## Data Sources

LIFELINE ingests and harmonizes three real-world datasets:

| Dataset | Stream ID | Temporal Span | Total Records | Focus Area |
|---|---|---|---|---|
| **Spotify Streaming History** | `spotify` | 2013 – 2024 (11 years) | 149,860 streams | Playback timestamps, track/artist catalogues, nocturnal hours, skip behavior |
| **Daily Household Transactions** | `household` | 2015 – 2018 (4 years) | 2,461 entries | Cash and domestic bank ledger, category frequencies (Food, Transport, Apparel) |
| **India Multi-Facet Card Commerce** | `transactions` | 2022 – 2024 (2 years) | 8,725 records | Point-of-sale commerce, retail, travel, entertainment, healthcare spending |

*Note: No artificial records, fake receipt cards, or synthetic emotional metrics are generated.*

---

## Architecture

LIFELINE is built as a pure frontend, zero-backend single page application:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Presentation Layer (React 18)                │
│   ObservatoryView  │  ExplorerView  │  DiscoveriesView  │ Story │
├─────────────────────────────────────────────────────────────────┤
│                   Feature Models & View Adapters                │
│    storyModel      │  discoveryModel  │   constellationModel    │
├─────────────────────────────────────────────────────────────────┤
│               Analytics & Pattern Intelligence Layer            │
│  Spotify Engine   │ Household Engine │ Transaction Engine       │
│  Pattern Engine   │ Evidence Engine  │ Connection Engine        │
├─────────────────────────────────────────────────────────────────┤
│                Data Ingestion & Sanitization Layer              │
│   CSV Parser      │ Normalizers      │ PII Sanitizer            │
├─────────────────────────────────────────────────────────────────┤
│                     Local File Telemetry                        │
│   spotify_history.csv  │ household.csv │ india_transactions.csv │
└─────────────────────────────────────────────────────────────────┘
```

### Core Technologies

- **React 18**: Component architecture, custom hooks, and state management.
- **TypeScript 5.7**: Strict type safety across all data ingestion and analytical contracts.
- **Vite 6**: High-performance local development and optimized production asset bundling.
- **Tailwind CSS 3.4**: Editorial typography, dark observatory palette, and responsive utilities.
- **Lucide React**: Clean, semantic iconography.

---

## Analytics Architecture

The analytical pipeline processes raw records entirely in the client:

1. **Normalizers** (`src/data/*/normalizer.ts`): Parse timestamps, validate numeric bounds, categorize streams, and scrub all PII.
2. **Stream Analytics** (`src/analytics/spotify.ts`, `household.ts`, `transactions.ts`): Compute aggregations, distributions, hour concentrations, yearly skip rates, and merchant ticket sizes.
3. **Pattern Engine** (`src/analytics/patterns.ts`): Evaluates mathematical thresholds to identify shifts (e.g. 2015 $\rightarrow$ 2016 skip collapse), concentration leaders, and trends.
4. **Evidence Engine** (`src/analytics/evidence.ts`): Formulates empirical measurement objects with sample sizes ($n$), timestamps, units, and non-causal descriptions.
5. **Connection Engine** (`src/analytics/connections.ts`): Discovers intra-stream relationships and cross-stream temporal comparisons.
6. **Discovery Engine** (`src/analytics/discoveries.ts`): Synthesizes patterns and evidence into verified discovery cards.
7. **Story Engine & Model** (`src/features/story/storyModel.ts`): Prepares narrative chapters and visualization view models for Story Mode.

---

## Product Flow

Users can navigate seamlessly across any layer of the application:

$$\text{OBSERVATORY} \longleftrightarrow \text{EXPLORE} \longleftrightarrow \text{DISCOVER} \longleftrightarrow \text{STORY}$$

### Evaluator Demo Flow

```
1. OBSERVATORY
   ├── View 161K receipts analyzed across 12 years
   └── Click "Explore Discoveries"

2. DISCOVERIES
   ├── Inspect "Fundamental Behavioral Shift in Track Skip Rate"
   ├── Click "Show Evidence" (verify 78.8% in 2015 vs. 3.6% in 2016)
   └── Click "Explore Supporting Receipts"

3. RECEIPT EXPLORER
   ├── Context banner indicates "EVIDENCE MODE"
   ├── Pre-filtered to 2015 skipped Spotify tracks
   ├── Filter by hour or search specific tracks
   └── Inspect individual receipt details

4. LIFE CONSTELLATION
   ├── Open Constellation tab in Discoveries
   ├── Click "The Beatles" or "Food" node
   └── Inspect cross-stream relationships and temporal links

5. STORY MODE
   ├── Click "STORY" in top navigation
   ├── Review Story Hero metrics and click "BEGIN STORY"
   ├── Step through 5 narrative chapters:
   │   ├── Ch 01: The Listening Years (Area trend chart)
   │   ├── Ch 02: The Great Shift (Before/after skip rate visualization)
   │   ├── Ch 03: The Everyday Receipts (Domestic ledger category distribution)
   │   ├── Ch 04: The Modern Commerce Era (Card commerce ticket sizes)
   │   └── Ch 05: The Connected Constellation (Embedded interactive graph)
   ├── Test "Show Evidence" drawer modal
   ├── Test "Explore Supporting Receipts" (shows "STORY CONTEXT" banner)
   ├── Click "Back to Story" to resume narrative progression
   └── Reach "STORY COMPLETE" synthesis screen
```

---

## Privacy & Data Safety

LIFELINE enforces strict, client-side data sanitization:

- **No Remote Transmission**: All processing occurs locally in browser memory.
- **Ingestion Filtering**: Sensitive transaction fields (`cc_num`, `customer_id`, `first`, `last`, `street`, `dob`) are discarded immediately upon reading raw files.
- **Safe View**: Only aggregated totals, categories, cities, states, and scrubbed receipt timestamps are stored or displayed.
- **Automated PII Scanning**: Regression test suites scan all UI view models and data structures with regex patterns to guarantee zero sensitive data exposure.

---

## Performance & Optimization

- **Zero Raw DOM Bloat**: The application never renders 150K raw DOM elements. Receipts in the Explorer are filtered in memory and paginated (25/50/100 items per page).
- **Precomputed Compact Telemetry**: Full analytics are pre-aggregated into a compact 125 KB payload (`life_analytics.json`) for instant landing loads.
- **Memoized Selectors**: View models and filtered collections are cached using `useMemo` and stable module-level caches.
- **Sub-16ms Transitions**: Chapter switching, tab navigation, and filter updates execute smoothly at 60 frames per second.

---

## Responsive Design

Tested and verified across key viewport breakpoints:

- **375px (Mobile)**: Compact step indicator (`CH 02 / 05`), progress bar, touch-friendly tap targets ($\ge 44\text{px}$), adaptive filters drawer, and responsive charts.
- **768px (Tablet)**: Multi-column stat grids, streamlined navigation bar, and inline evidence tables.
- **1024px (Laptop)**: Expanded chapter step indicators, embedded constellation canvas, and split filter layouts.
- **1440px (Desktop)**: Editorial whitespace, high-resolution SVG visualizations, and detail panels.

---

## Accessibility

- **Semantic HTML**: Proper `<article>`, `<nav>`, `<header>`, `<main>`, `<dialog>`, and `<button>` landmarks.
- **Keyboard Navigation**: Arrow keys (`ArrowRight`/`PageDown` and `ArrowLeft`/`PageUp`) advance and rewind Story chapters; `Escape` closes modals and drawers.
- **ARIA Attributes**: `role="dialog"`, `aria-modal="true"`, `aria-label`, and `aria-expanded` attributes implemented on interactive controls.
- **Reduced Motion**: Full compliance with `prefers-reduced-motion`; animated transitions degrade gracefully to instant state changes.

---

## Running Locally

### Prerequisites

- Node.js $\ge 18.0.0$
- npm $\ge 9.0.0$

### Installation & Execution

```bash
# 1. Clone repository
git clone https://github.com/Durvankur-Joshi/WebRush.git
cd WebRush

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
# Server will start on http://localhost:5173/

# 4. Run TypeScript check & production build
npm run build
```

### Running Test & Validation Suites

```bash
# End-to-end full product QA validation suite (53 tests)
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

## Project Structure

```
e:\WebRush\
├── public\
│   └── data\                       # Pre-aggregated telemetry & CSV data files
│       ├── spotify_history.csv
│       ├── household_transactions.csv
│       ├── india_transactions.csv
│       └── life_analytics.json
├── scripts\                        # Node/tsx test & validation suites
│   ├── validate_end_to_end.ts      # Comprehensive 53-step product verification
│   ├── validate_story.ts           # Phase 6 Story Mode test
│   ├── validate_discoveries.ts     # Phase 5 Discoveries & Constellation test
│   ├── validate_explorer.ts        # Phase 4 Explorer test
│   └── validate_analytics.js       # Phase 2 Analytics & PII test
├── src\
│   ├── analytics\                  # Core analytics, pattern, evidence engines
│   │   ├── connections.ts
│   │   ├── discoveries.ts
│   │   ├── evidence.ts
│   │   ├── household.ts
│   │   ├── patterns.ts
│   │   ├── spotify.ts
│   │   ├── stories.ts
│   │   └── transactions.ts
│   ├── app\                        # Top-level shell and router
│   │   ├── App.tsx
│   │   └── routes\Router.tsx
│   ├── components\                 # Shared UI primitives and layout
│   │   ├── layout\ (Header, Navigation, Shell)
│   │   └── ui\ (Badge, Button, Card, EmptyState, ErrorBoundary, LoadingState)
│   ├── data\                       # Ingestion, CSV parser, and PII normalizers
│   │   ├── household\
│   │   ├── spotify\
│   │   ├── transactions\
│   │   └── parser.ts
│   ├── features\                   # Core product feature modules
│   │   ├── observatory\            # Phase 3: Landing Observatory
│   │   ├── explorer\               # Phase 4: Receipt Explorer & Drill-Down
│   │   ├── discoveries\            # Phase 5: Pattern Recognition
│   │   ├── constellation\          # Phase 5: Interactive Knowledge Network
│   │   └── story\                  # Phase 6: Editorial Story Mode
│   ├── hooks\                      # Custom hooks (useLifeAnalytics, useNavigation)
│   ├── lib\                        # Design tokens, formatters, constants
│   └── types\                      # Domain and application type contracts
├── index.html
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## Hackathon Requirements Mapping

| Problem Statement Requirement | LIFELINE Implementation | User-Visible Signal |
|---|---|---|
| **1. Explore life receipts** | Multi-Stream Receipt Explorer | Searchable, paginated receipt cards across Music, Domestic, and Commerce modalities |
| **2. Search & filtering** | Adaptive Filter System | Filter chips by year, category, time of day, skip status, and sort orders |
| **3. Discover patterns** | Discoveries Engine | 11 evidence-grounded discovery cards with confidence metrics and sample sizes |
| **4. Reveal relationships** | Life Constellation | Interactive 14-node network graph linking streams, artists, categories, and periods |
| **5. Interactive storytelling** | Story Mode | 5 editorial chapters with step progression, inline charts, and drill-down links |
| **6. Visual digital journey** | Observatory & Timeline | Longitudinal coverage cards, temporal journey progression, and macro counters |
| **7. Responsive design** | Responsive Layout | Fluid layouts verified at 375px, 768px, 1024px, and 1440px with touch support |
| **8. Privacy & data safety** | Ingestion-level PII scrubber | Safe view badges; all sensitive financial and identity fields excluded |

---

## Team & Credits

Developed for the **“Your Life, In Receipts”** Frontend Hackathon.
Built with focus on data honesty, editorial design, and evidence-grounded personal telemetry.
