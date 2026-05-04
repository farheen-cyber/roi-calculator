# PRD Audit Fixes — Summary

**Branch**: `test/p0-audit`  
**Commit**: 5786211  
**Date**: May 4, 2026  

---

## Critical Issue: Outsourced Method Cost Bug (FIXED)

### The Problem
When method = "outsourced", the calculator was:
1. Setting `rate = 0` (blended hourly rate)
2. Assigning `mult = 0.4` (40% internal effort)
3. **Result**: `hours × 0.4 × 0 = $0` — all hourly costs became zero
4. **Only retainer cost was added**, ignoring internal team's 40% effort (review, approvals, coordination)

### The Fix
- Removed the `else if (meth === 'outsourced') { rate = 0 }` branch
- Now `rate` (blended hourly rate) is calculated for **both in-house and outsourced**
- `mult = 0.4` now correctly applies: `hours × 0.4 × rate` captures internal effort cost
- Final cost = `hours × 0.4 × rate + retainer`

### Impact
- Outsourced method now accurately reflects that internal team still does ~40% of the work
- Cost comparison between in-house and outsourced is now realistic
- All 483,840 tests pass with corrected calculation

### Code Changes
- **roi-calculator.js lines 61-81**: Calculate blended rate for both methods; removed `rate = 0` for outsourced

---

## Valuation Cost Updates (FIXED)

### The Problem
Market rates were 3-4× higher than actual verified costs:

| Type | Code Was | Should Be | User Verified |
|---|---|---|---|
| 409A | $6,000 | $1,500 | ✅ |
| Registered Valuer | ₹200,000 | ₹50,000 | ✅ |
| Merchant Banker | ₹300,000 | ₹90,000 | ✅ |

### The Fix
- Updated **data.js** VALUATION_TYPES with correct costs
- EquityList costs also updated accordingly
- Tests now run with accurate valuation pricing

### Impact
- ROI calculations now reflect true valuation cost differential
- Companies with regular valuation needs see more accurate savings estimates

### Code Changes
- **data.js**: Updated VALUATION_TYPES with verified costs

---

## Valuation Types: Always Visible (FIXED)

### The Problem
- Valuation types were hidden/shown based on country selection (country-gated)
- Singapore & UK options weren't verified, so kept them

### The Fix
- Created flat `VALUATION_TYPES` array (not keyed by geography)
- All 3 types (409A, Registered Valuer, Merchant Banker) always visible in dropdown
- Removed Singapore and UK options (rates not provided)

### Impact
- Cleaner UI: no conditional showing/hiding of fields
- User can select any valuation type regardless of incorporation country
- Simpler data structure to maintain

### Code Changes
- **data.js**: Changed from `VALUATION_TYPES_BY_GEO` to flat `VALUATION_TYPES`
- **app.js**: Updated 2 usages (lines 605, 754) to use flat list
- **test-calculator.js**: Updated valuation lookup logic
- **simple-test.js**: Updated import

---

## PRD Improvements

### a. Removed "Hybrid" Method (FIXED)
- PRD mentioned hybrid but wasn't implemented
- Removed from PRD line 11
- Now accurately states: "in-house or outsourced"

### c. Valuation Geography Clarity (FIXED)
- Clarified that valuation types use `geo_inc` (country of incorporation), not `geo_op`
- Updated table to show all available types: 409A, Registered Valuer, Merchant Banker

### d. Stakeholder Cap at 10,000 (FIXED)
- Kept the 10k cap (per business requirement for EquityList's current offering)
- No changes needed; already correctly documented

### f. Workflow Definitions (FIXED)
- Added explanation of what counts as one "workflow" (~2.5 hours each)
- Explained types: board meetings, shareholder approvals, statutory filings, equity amendments, compliance reports
- Explained why counts differ by country (India mandatory minimums, US investor-driven, etc.)

### g. Outsourced Method Clarity (FIXED)
- Added detailed explanation of outsourced cost model
- Shows: External Retainer + Internal Effort Cost (40% × blended_rate)
- Includes example calculation

### h. Valuation Costs (FIXED)
- Updated with verified market costs
- Noted that Singapore/UK types removed pending rate verification

### i. Fundraising in §8.2/§8.3 (FIXED)
- Added fundraising hours to manual baseline formula (§8.2)
- Added fundraising hours to method-adjusted formula (§8.3)
- Formulas now match actual code implementation

### j. Consolidate Data Sources (FIXED)
- Removed duplicate hourly rate tables from §8
- §8 now references §3 for rates (single source of truth)

---

## Test Suite Status

| Test Type | Count | Status |
|---|---|---|
| Happy Path | 483,840 | ✅ PASS (100%) |
| Failure Path | 36 | ✅ PASS (100%) |
| Smoke Test | 1 | ✅ PASS |

**Note**: Happy path tests increased from 421,120 to 483,840 because all valuation types are now tested for all countries (instead of being country-specific).

---

## Files Changed

1. **roi-calculator.js** — Fix outsourced method rate calculation
2. **data.js** — Update valuation costs, flatten VALUATION_TYPES
3. **app.js** — Use flat VALUATION_TYPES list
4. **test-calculator.js** — Use flat VALUATION_TYPES, update lookup logic
5. **simple-test.js** — Update import
6. **roi-calculator-prd.md** — Document all fixes and clarifications
7. **PRD_REVIEW_AUDIT.md** — Detailed audit findings (reference document)

---

## What's NOT Fixed (Per User Request)

### e. Role-Specific Cost Components
- Deferred to V4 (would require STAFFING_MATRIX redesign)
- Current blended rate approach is reasonable for MVP
- Would need to map activities to responsible roles (HR→grants, Finance→cap table, etc.)

---

## Verification Checklist

- ✅ Outsourced method now includes 40% internal effort cost
- ✅ Valuation costs updated to verified rates (409A, Registered Valuer, Merchant Banker)
- ✅ All valuation types always visible (no country-gating)
- ✅ Singapore/UK valuations removed (rates not verified)
- ✅ "Hybrid" method removed from PRD
- ✅ Workflow definitions added to PRD
- ✅ Outsourced method explanation improved
- ✅ §8.2/§8.3 formulas include fundraising hours
- ✅ §3 and §8 data sources consolidated
- ✅ All 483,840 tests pass
- ✅ All 36 failure-path tests pass
- ✅ Smoke test passes
- ✅ Changes committed and pushed to test/p0-audit

---

## Ready for Deployment

All fixes are complete and tested. When ready to go live:
```bash
git checkout main
git merge test/p0-audit
git push origin main
# GitHub Pages auto-deploys
```
