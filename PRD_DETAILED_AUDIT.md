# PRD Detailed Audit vs Code Implementation
**Date**: 2026-05-26  
**Purpose**: Line-by-line verification that PRD matches code + identify missing "why/how" explanations

---

## 1. INPUT MAPPING & NORMALIZATION (§1)

### Status: ✅ IMPLEMENTED & CONSISTENT
All inputs from PRD §1 are implemented in `AForm` component (index.html:900+):
- `co` (Legal Entity Name) - optional field (line 908, 955)
- `geo_inc` (Country of Incorporation) - required dropdown (line 906, 952)
- `geo_op` (Country of Operation) - required dropdown (line 907, 953)
- `stage` (Current Funding Stage) - required dropdown (line 901, 954)
- `sh` (Shareholders Count) - number input (line 902, 961)
- `oh` (Option Holders Count) - number input (line 903, 962)
- `gr` (Annual Equity Grants) - split into `grNewHire` (line 904, 963) and `grRefresh` (line 905, 964)
- `meth` (Administration Method) - dropdown (line 915, 978)

### Optional Inputs:
- `planningToFundraise` - toggle (line 909)
- `fundraiseRound` - chip select (line 910, 1057-1063)
- `newShareholdersFromFundraise` - number input (line 911, 1074)
- `needsValuation` / `valuationFrequency` / `valuationType` - toggle + dropdowns (line 912-914, 972)

### ⚠️ DISCREPANCY: Grant Input Split
**PRD says** (§1): `gr` = "Annual Equity Grants" (0–10,000)  
**Code does** (line 378-380): Splits into `grNewHire` and `grRefresh` with separate fields  
**Why it matters**: User must enter TWO numbers, not one. PRD needs to explain this split.

---

## 2. DERIVED BASE METRICS (§2)

### 2.1 Total Stakeholders (§2.1)
```
PRD formula: stakeholders = min(sh + oh, 10000)
Code line 455: const stakeholders = Math.min(sh + oh + parseInt(grNewHire, 10), 10000);
```
**⚠️ DISCREPANCY**: Code adds `grNewHire` to stakeholders calculation, PRD doesn't mention this.  
**Why**: This inflates stakeholders count for pricing. Needs explanation: "New hire grants are counted as partial stakeholder load for platform pricing purposes."

### 2.2 Method Multipliers (§2.2)
```
PRD: mult = 1.0 (in-house) OR 0.4 (outsourced)
Code line 374: const mult = meth === 'in-house' ? 1 : 0.4;
```
✅ CONSISTENT

### 2.3 Staffing Matrix (§2.3)
```
PRD: STAFFING_MATRIX (lines 106-112)
Code: Lines 183-189
```
✅ CONSISTENT

### 2.4 Geographic Model (§2.4)
```
PRD: geo_inc used for rate lookups, geo_op for currency display
Code: Line 368 uses geo_inc for rate lookup ✅
Code: Line 435 converts currency using geo_inc ✅
```
✅ CONSISTENT

---

## 3. HOURLY RATE ASSUMPTIONS (§3)

### Status: ✅ ALL RATES MATCH
STAGE_HOURLY_RATES (code lines 145-173) perfectly matches PRD tables §3.
- India rates (lines 146-151) ✅
- US rates (lines 153-158) ✅
- Singapore rates (lines 160-165) ✅
- UK rates (lines 167-172) ✅

---

## 4. COST COMPONENTS (§4)

### 4.1 Grant Administration (§4.1)
```
PRD formula: gr × grHr hrs × mult × blended_rate
Code lines 378-382:
  const grNewHireNum = parseInt(grNewHire, 10);
  const grRefreshNum = parseInt(grRefresh, 10);
  const totalGrantAdminWork = oh + grNewHireNum + grRefreshNum;
  const grHrs = totalGrantAdminWork * grHr;
  const grCost = grHrs * mult * rate;
```
**⚠️ MAJOR DISCREPANCY**:
- PRD says: `gr × grHr` (just grants per year)
- Code does: `oh + grNewHire + grRefresh` (option holders + both grant types)
- **Why this matters**: This changes the entire grant calculation! The PRD is incomplete.
- **Missing explanation**: Why are option holders counted toward grant admin work? (Answer: each option holder needs annual refreshes)

### 4.2 Compliance & Reporting (§4.2)
```
PRD baseline: 72 hrs (India), 68 hrs (US), 54 hrs (Singapore/UK)
Code: getDynamicComplianceHours() function (lines 295-350)
```
**⚠️ MAJOR DISCREPANCY**:
- PRD gives fixed baseline hours
- Code calculates DYNAMIC hours based on shareholders, option holders, and grants
- **Code actually implements tiered reporting** (lines 318-348):
  - TIER 1: Cap table reports (if shareholders > 0)
  - TIER 2: Equity plan & grant reports (if option holders or new hires > 0)
  - TIER 3: Exercise reports (if Series A+)
  - All scaled by shareholder/grant volume
- **PRD needs complete rewrite** of §4.2 to match actual implementation

### 4.3 Cap Table Maintenance (§4.3)
```
PRD formula: (3 + max(0, (sh - 20) / 50) × 2) × 12 × mult × rate
Code lines 389-395:
  const CAP_TABLE_BASE_HOURS_PER_MONTH = 3;
  const ctShareholderScale = Math.max(0, (sh - 20) / 50);
  const ctMonthlyHours = CAP_TABLE_BASE_HOURS_PER_MONTH + (ctShareholderScale * 2);
  const ctRaw = ctMonthlyHours * 12;
  const ctHrs = ctRaw * mult;
  const ctCost = ctHrs * rate;
```
✅ CONSISTENT

### 4.4 Secretarial & Board Operations (§4.4)
```
PRD formula: (base_workflows + fundraising_workflows) × 2.5 × shareholder_scaling × mult × cs_rate
Code lines 410-424:
  const secRate = STAGE_HOURLY_RATES[geoInc][stageKey].cs;
  const secFundraisingBaseWorkflows = planningToFundraise ? FUNDRAISING_WORKFLOWS.secretarial : 0;
  const secFundraisingBaseHours = secFundraisingBaseWorkflows * HOURS_PER_WORKFLOW;
  const secFundraisingHours = secFundraisingBaseHours * roundMultiplier;
  const effectiveShareholders = planningToFundraise ? (sh + newShareholdersFromFundraise) : sh;
  const secFundraisingScaling = 1 + Math.max(0, (effectiveShareholders - 20) / 100) * 0.5;
```
⚠️ **INCOMPLETE**: Code only implements FUNDRAISING secretarial hours, not BASE workflows!
- PRD says secretarial cost = (base_workflows + fundraising_workflows) × 2.5...
- Code only adds fundraising workflows, ignores base workflows entirely
- **Missing from PRD**: What ARE base secretarial workflows? How many for each country/stage?
- **Code bug or design change?**: Needs clarification

### 4.5 External Service Cost (§4.5)
```
PRD: STAGE_RETAINER[geo_inc][stage] (only if outsourced)
Code lines 427-429:
  let methodExtCost = 0;
  if (meth === 'outsourced') {
    methodExtCost = STAGE_RETAINER[geoInc][stageKey];
  }
```
✅ CONSISTENT

### 4.6 Valuation Services (§4.6)
```
PRD: Uses geo_op for currency display, geo_inc for rates
Code lines 433-445:
  if (valuationFrequency && valuationType) {
    const events = valuationFrequency === 'annually' ? 1 : 4 : 0;
    const opCurrency = GEO_TO_CURRENCY[geoInc] || 'INR';  // ← Uses geoInc, not geoOp!
    const marketPricing = VALUATION_PRICING[valuationType]?.[stageKey];
    const elPricing = EL_VALUATION_PRICING[valuationType]?.[stageKey];
```
⚠️ **DISCREPANCY**: Code uses `geoInc` for currency, PRD says `geoOp` (§4.6, line 349).
- **Version history (PRD §10.3, line 542)**: PRD v3.3 changed from geoInc→geoOp
- **Code not updated**: Still uses geoInc
- **Fix needed**: Either update code or update PRD to match v3.3 intent

---

## 5. BLENDED HOURLY RATE (§5)

### 5.1 In-House Calculation
```
PRD formula (lines 377-381):
  blended_rate = sum(fte × rate for each role)
Code lines 362-371:
  for (const role of roles) {
    const fte = matrix[role] || 0;
    if (fte > 0) {
      const roleRate = STAGE_HOURLY_RATES[geoInc][stageKey][role];
      rate += fte * roleRate;
    }
  }
```
✅ CONSISTENT

---

## 6. SUMMARY FORMULAS (§6)

### 6.1 Total Annual Ops Cost
```
PRD formula (line 402):
  ops_total = grant_admin + compliance + cap_table + secretarial + external + valuation
Code line 448:
  const annCost = grCost + cpCost + ctCost + ctFundraisingCost + secFundraisingCost + methodExtCost + valuationCost;
```
⚠️ **DISCREPANCY**: Code adds `ctFundraisingCost` and `secFundraisingCost` separately, but PRD treats them as included in base secretarial.
- **PRD needs clarification**: Are base workflows calculated, or only fundraising workflows?

### 6.2 EquityList Annual Cost
```
PRD formula (lines 415-425):
  el_platform = stakeholders × PRICING[geo_inc]
  el_valuation_cost = el_cost_per_event × frequency_multiplier
  el_annual = el_platform + el_valuation_cost
Code lines 455-456:
  const stakeholders = Math.min(sh + oh + parseInt(grNewHire, 10), 10000);
  const elAnn = stakeholders * PRICING[geoInc] + elValuationCost;
```
✅ CONSISTENT (but stakeholders calculation differs as noted in §2.1)

---

## 7. DERIVED OUTPUT METRICS (§8)

### 8.1 Annual Savings ✅
```
PRD: savings = ops_total - el_cost
Code line 458: const diff = annCost - elAnn;
```
✅ CONSISTENT

### 8.2 Internal Effort (Manual Baseline) ✅
```
PRD formula (lines 444-457): Includes all hours unaffected by method multiplier
Code line 449:
  const manualHTotal = overrides.manualHTotal || 
    (totalGrantAdminWork * grHr + compHr + ctRaw + ctFundraisingHours + secFundraisingRaw);
```
✅ CONSISTENT

### 8.3 Internal Effort (Method-Adjusted) ✅
```
Code line 450: const adjustedHTotal = manualHTotal * mult;
```
✅ CONSISTENT

### 8.4 Time Saved % ✅
```
Code lines 451-453:
  const hoursToday = adjustedHTotal;
  const hoursSaved = hoursToday;
  const timeSavedPct = hoursToday > 0 ? Math.round((hoursSaved / hoursToday) * 100) : 0;
```
✅ CONSISTENT

### 8.5 ROI Multiple ✅
```
Code line 461: const roi = elAnn > 0 ? Math.round((absDiff / elAnn) * 10) / 10 : 0;
```
✅ CONSISTENT

---

## KEY FINDINGS SUMMARY

| Area | Status | Issue | Severity |
|------|--------|-------|----------|
| Inputs | ✅ | Grant split into newHire + refresh not explained | Low |
| Stakeholders | ⚠️ | Code includes grNewHire in count, PRD doesn't mention | Medium |
| Grant Admin | ⚠️ | PRD formula incomplete (ignores option holders) | **HIGH** |
| Compliance Hours | ⚠️ | PRD shows fixed hours, code has dynamic tiered calculation | **HIGH** |
| Secretarial | ⚠️ | Base workflows missing from code/PRD? Only fundraising implemented | **HIGH** |
| Valuation Currency | ⚠️ | Code uses geoInc, PRD says geoOp (version mismatch) | Medium |

---

## RECOMMENDATIONS

1. **Rewrite §4.2 (Compliance)**: Document the actual 3-tier dynamic model with volume scaling
2. **Clarify §4.1 (Grants)**: Explain why option holders are included in grant admin work
3. **Clarify §4.4 (Secretarial)**: 
   - Define "base workflows" (are they implemented at all?)
   - Clarify if base workflows still apply or only fundraising workflows
4. **Fix Valuation §4.6**: Resolve geoInc vs geoOp discrepancy (check v3.3 intent)
5. **Update §2.1**: Explain why grNewHire is added to stakeholders calculation
6. **Add Implementation Notes**: Explain the cost component interaction (especially fundraising multipliers)

---

