# EquityList ROI Calculator

Interactive web tool that estimates the cost of administering equity in-house (or via outsourced CA/law firm) and compares it to running on EquityList.

**Live preview:** open `index.html` directly in a browser, or run a static file server.

---

## What it does

Given a few inputs about a company — country of incorporation/operation, funding stage, stakeholder counts, administration method, and optional fundraising/valuation plans — the calculator returns:

- **Your annual spend** (grant admin + compliance + cap table + secretarial + retainer + valuations)
- **EquityList annual cost** (per-stakeholder pricing + 10% internal overhead + bundled valuations)
- **Annual savings**, **ROI multiple**, and **hours saved**
- A detailed cost breakdown with editable assumptions

Supported geographies: India, US, Singapore, UK. Stages: Preseed → Series C+.

---

## Repository layout

```
index.html                 # Single-page UI
app.js                     # UI behavior, state, rendering
roi-calculator.js          # Pure calculation engine (no DOM deps)
data.js                    # Rates, compliance hours, retainers, pricing tables
SelectField.js             # Custom dropdown component
styles.css                 # Design tokens + components
test-calculator.js         # Automated test suite (421,120 cases)
simple-test.js             # Single-case smoke test
roi-calculator-prd.md      # Product Requirements Document (v3.3)
IMPLEMENTATION_SUMMARY.md  # High-level summary of features and tests
```

---

## Run locally

No build step. The app is plain ES modules served as static files.

```bash
# Option 1: open directly
open index.html

# Option 2: any static server
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## Run the tests

```bash
npm test                # runs failure-path tests then full happy-path sweep
npm run test:failures   # 36 negative-path assertions (invalid inputs, missing tables)
npm run test:full       # 421,120-case happy-path sweep
npm run test:smoke      # single-case smoke test
```

- **`test-failures.js`** — feeds bad inputs into `computeROI()` and asserts it throws with descriptive errors (invalid geo/stage/method, negative numbers, missing data tables) and that valid edge cases still succeed.
- **`test-calculator.js`** — exercises every combination of country pair × stage × method × stakeholder count × option holder count × grant frequency × fundraising scenario × valuation scenario. Writes results to `test-results.log` (gitignored; ~200 MB uncompressed). The compressed snapshot of the last full run is checked in as `test-results.log.gz`.

---

## Deploy

The site is hosted on GitHub Pages. Push to the branch GitHub Pages is configured to serve (`main`).

```bash
git checkout main
git merge test/p0-audit  # or whichever branch
git push origin main
```

GitHub Pages serves `index.html` automatically.

---

## Calculation model (high-level)

For each company profile, `computeROI()` in [`roi-calculator.js`](roi-calculator.js):

1. Looks up a **blended hourly rate** from `STAGE_HOURLY_RATES` weighted by the FTE allocations in `STAFFING_MATRIX` for the selected stage.
2. Adds **grant administration** hours (`gr × 1.5h`), **compliance** hours (geo-specific), **cap table maintenance** (`(3 + scaling) × 12 months`), and **secretarial** workflows (geo + stage specific, scaled by shareholders).
3. If outsourced, replaces internal labor with a **stage-tiered retainer** (`STAGE_RETAINER`).
4. Optionally adds **fundraising overhead** scaled by round complexity (SAFE 0.5× → Series C+ 2.5×) and **valuation costs** at annual or quarterly frequency.
5. Computes the **EquityList cost** as `stakeholders × PRICING[geo_op] + 10% manual overhead + bundled valuation`.
6. Returns spend, savings, and ROI multiple.

All amounts stay in `geo_op` local currency throughout — no FX conversion needed because every rate table is denominated in the local currency of the geography it describes.

---

## Versioning

Current PRD version: **3.3** (April 2026). See [`roi-calculator-prd.md`](roi-calculator-prd.md) §9 for the full changelog.
