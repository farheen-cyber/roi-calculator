# Repository Files Overview

## Core Application Files

### **index.html** (Entry Point)
- Single-page HTML document
- Contains form structure for 2-step calculator
- Step 1: Company Basics (geo_inc, geo_op, stage, method)
- Step 2: Equity Structure (shareholders, option holders, grants, optional fundraising/valuation)
- Results panel showing ROI, savings, cost breakdown
- No build step needed — opens directly in browser

### **app.js** (Frontend Logic)
- **Size**: ~1,200 lines
- **Purpose**: Handle all UI interactions and state management
- **Key Functions**:
  - `handleInputChange()` — React to form field changes
  - `validateInputs()` — Check all required fields before calculation
  - `calculateROI()` — Call computeROI() function and update UI
  - `updateDisplay()` — Render results (annCost, elAnn, diff, roi)
  - `toggleCostBreakdown()` — Show/hide detailed cost components
  - `rebuildValuationTypeOptions()` — Update valuation dropdown when geography changes
- **Dependencies**: data.js, roi-calculator.js, SelectField.js
- **No backend calls** — Pure client-side

### **roi-calculator.js** (Calculation Engine)
- **Size**: ~210 lines
- **Purpose**: Pure calculation function with no DOM dependencies
- **Key Function**: `computeROI(inputs, rates, compliance, ext, pricing, stageRates, stageRetainer, staffingMatrix, secretarialWorkflows, fundraisingWorkflows, overrides)`
- **What It Does**:
  1. Validates all inputs (geography, stage, method, numeric ranges)
  2. Validates all data tables (no missing entries)
  3. Calculates blended hourly rate based on stage and staffing matrix
  4. Computes individual costs:
     - Grant administration (gr × 1.5 hrs × mult × rate)
     - Compliance (geo-specific hours × mult × rate)
     - Cap table maintenance (scaling with shareholders)
     - Secretarial & board operations (workflows × 2.5 hrs)
     - Fundraising overhead (if applicable, scaled by round complexity)
     - External services (retainer or tool cost)
     - Valuation services (if enabled)
  5. Calculates EquityList cost (stakeholders × PRICING + 10% overhead + valuation)
  6. Returns: annCost, elAnn, diff, roi, plus 20+ detail metrics
- **No UI Dependencies** — Can be tested in Node.js

### **data.js** (Configuration & Lookup Tables)
- **Size**: ~200 lines
- **Purpose**: All constants and lookup tables used by calculator
- **Tables**:
  - `VALUATION_TYPES` — 4 valuation methods with costs (409A, Black Scholes, Registered Valuer, Merchant Banker)
  - `STAGE_HOURLY_RATES` — Hourly rates by geography, stage, and role (founder, hr, finance, cs)
  - `STAGE_RETAINER` — Outsourced CA/Law firm retainer costs by geography and stage
  - `STAFFING_MATRIX` — FTE allocations by stage (how many people, what roles)
  - `SECRETARIAL_WORKFLOWS_BY_GEO` — Governance workflows required by law (India: 1/8/12/20/30, US: 0/4/8/12/16, etc.)
  - `FUNDRAISING_WORKFLOWS` — Additional workflows when fundraising (cap table, secretarial)
  - `COMPLIANCE` — Annual compliance hours by incorporation country
  - `PRICING` — Per-stakeholder annual cost for EquityList by geography
  - `CUR` — Currency symbols for display
  - `RATES`, `RATES_META`, `EXT` — Legacy tables (kept for compatibility)
- **No Logic** — Pure data, no calculations

### **SelectField.js** (Custom Dropdown Component)
- **Size**: ~150 lines
- **Purpose**: Accessible dropdown component with arrow key navigation
- **Features**:
  - Opens/closes on click or keyboard
  - Arrow keys to navigate options
  - Enter to select
  - Screen reader support
  - Custom styling (replaces native HTML select)
- **Used For**: All dropdown fields (stage, method, valuation type, frequency)

### **styles.css** (All Styling)
- **Size**: ~800 lines
- **Purpose**: Single stylesheet for entire app
- **Sections**:
  - Design tokens (colors, spacing, typography)
  - Layout (2-column input + results)
  - Form components (inputs, selects, toggles)
  - Results panel (metrics display, cost breakdown)
  - Responsive design (mobile: single column)
  - Dark mode support (via prefers-color-scheme)
  - Print styles

---

## Documentation Files

### **roi-calculator-prd.md** (Product Requirements)
- **Size**: ~800 lines
- **Purpose**: Complete specification of calculator behavior
- **Contents**:
  - §1-2: Input mapping and normalization
  - §3: Hourly rate assumptions (industry benchmarks by role/stage/geography)
  - §4: Cost component formulas (grants, compliance, cap table, secretarial, external, valuation)
  - §5-7: Calculation model (blended rate, summary formulas, output metrics)
  - §8: Data sources and references
  - §9: Version changelog (currently v3.3)
  - §10-11: UI features and implementation notes
- **Audience**: Developers, product managers, auditors
- **Accuracy**: Matches current implementation (as of v3.3)

### **README.md** (Quick Start Guide)
- **Size**: ~100 lines
- **Purpose**: Getting started for new developers
- **Contents**:
  - What the calculator does
  - File layout
  - How to run locally (no build step)
  - How to run tests (npm test, npm run test:failures, npm run test:full, npm run test:smoke)
  - How to deploy (push to main)
  - High-level calculation model explanation
  - Current version (3.3)

### **FIXES_SUMMARY.md** (Audit Fixes Record)
- **Size**: ~200 lines
- **Purpose**: Document what was fixed in most recent audit
- **Contents**:
  - Outsourced method cost bug (critical fix)
  - Valuation cost updates (with before/after)
  - Valuation type changes (country-gating removed)
  - PRD improvements (a, c, d, f, g, h, i, j)
  - Test status (519,840 tests pass)
  - Verification checklist

### **PRD_REVIEW_AUDIT.md** (Detailed Audit Findings)
- **Size**: ~400 lines
- **Purpose**: Reference document for audit issues discovered
- **Contents**:
  - 10 detailed audit findings (a-j)
  - Current status of each finding
  - Recommended fixes (with code examples)
  - Impact analysis
  - Priority levels
- **Audience**: Product team, developers reviewing changes

### **IMPLEMENTATION_SUMMARY.md** (Feature Overview)
- **Purpose**: High-level summary of what's implemented
- **Contents**: Features, test coverage, data structures

---

## Test Files

### **test-calculator.js** (Comprehensive Happy-Path Tests)
- **Size**: ~360 lines
- **Purpose**: Exercise every input combination and document outcomes
- **Test Coverage**: 519,680 test cases
- **What It Tests**:
  - All 4 countries × 5 stages × 2 methods = base combinations
  - 7 shareholder counts × 4 option holder counts × 4 grant frequencies = stakeholder variations
  - With/without fundraising (5 round types × 4 timings each) = 20 scenarios
  - With/without valuations (4 types × 2 frequencies) = 8 scenarios
- **Output**: test-results.log (500MB+ uncompressed, ~5MB compressed as test-results.log.gz)
- **Run**: `npm run test:full`
- **Status**: 100% pass

### **test-failures.js** (Failure-Path Tests)
- **Size**: ~280 lines
- **Purpose**: Verify calculator throws explicit errors on invalid inputs
- **Test Cases** (36 total):
  1. Invalid geographies (mars, atlantis, empty, null)
  2. Invalid stages (unicorn, seriesD)
  3. Invalid methods (crypto, empty, null)
  4. Invalid numeric inputs (negative, string, null, undefined)
  5. Missing data tables (COMPLIANCE, PRICING, STAGE_HOURLY_RATES, etc.)
  6. Edge-case successes (zero stakeholders, max cap, cross-geo)
  7. Fundraising & valuation edge cases (SAFE, Series C, quarterly 409A)
  8. Round complexity verification (SAFE costs less than Series C+)
- **Run**: `npm run test:failures`
- **Status**: 100% pass

### **simple-test.js** (Smoke Test)
- **Size**: ~50 lines
- **Purpose**: Quick sanity check with one scenario
- **Test Case**: Series A/B company in India, 30 shareholders, 15 option holders, 10 grants/year, in-house
- **Output**: Full ROI result object
- **Run**: `npm run test:smoke`
- **Status**: Pass (returns 3.6x ROI)

---

## Configuration Files

### **package.json**
- **Purpose**: Node.js project metadata
- **Key Fields**:
  - `"type": "module"` — Use ES6 import/export syntax
  - `"scripts"`: npm commands (test, test:failures, test:full, test:smoke)
  - `"engines": "node >= 18.0.0"` — Minimum Node version
- **Dependencies**: None (intentional — pure JS, no dependencies)

### **.gitignore**
- **Purpose**: Tell Git which files to ignore
- **Ignores**:
  - test-results.log (500MB+ result file)
  - .env files
  - Temporary test output files
  - Backup files (.bak)
  - node_modules (if added)

### **.claude/launch.json**
- **Purpose**: Claude Code dev server configuration (for local testing)
- **Defines**: Port and command to start static file server

### **.claude/settings.local.json**
- **Purpose**: Claude Code session settings

### **.DS_Store**
- **Purpose**: macOS system file (should be ignored)

---

## Legacy/Archived Files

### **test-runner-output.txt**
- Old test output file (archived)

---

## Summary by Purpose

### **To Understand How It Works**
1. Start with **README.md** (overview)
2. Read **roi-calculator-prd.md** §1-4 (input and costs)
3. Read **roi-calculator.js** (actual calculation)
4. Read **data.js** (lookup tables)

### **To Modify the UI**
- Edit **index.html** (structure) + **styles.css** (appearance) + **app.js** (behavior)
- SelectField.js handles dropdown behavior

### **To Change Calculations**
- Modify **roi-calculator.js** (calculation logic)
- Update **data.js** (rates, workflows, etc.)
- Update **roi-calculator-prd.md** (document changes)
- Run tests to verify: `npm run test:full`

### **To Understand What Changed**
- Read **FIXES_SUMMARY.md** (recent fixes)
- Read **PRD_REVIEW_AUDIT.md** (detailed findings)
- Check **roi-calculator-prd.md** §9 (version changelog)

### **To Deploy**
- Push to main branch (GitHub Pages auto-deploys from main)
- All files are static (no build step, no backend)

---

## File Statistics

| Category | Count | Lines |
|---|---|---|
| **Application** | 6 | ~3,700 |
| **Data** | 1 | ~200 |
| **Tests** | 3 | ~700 |
| **Docs** | 4 | ~1,400 |
| **Config** | 4 | ~50 |
| **Total** | 18 | ~6,050 |

## Deployment Size

- **Minified JS**: ~50 KB (if minified)
- **CSS**: ~30 KB
- **HTML**: ~15 KB
- **Total**: ~95 KB (uncompressed)
- **Load Time**: Instant (static files, no backend)
