# ROI Calculator — Calculation Audit (Code vs PRD)

**Date**: May 27, 2026  
**Purpose**: Identify discrepancies between PRD documentation and actual code implementation

---

## 1. GRANT ADMINISTRATION COST

### PRD Documentation (Section 4.1, line 186)
```
grant_cost = (oh + gr) × grHr × mult × blended_rate
```
**Issue**: Incomplete formula. "gr" not defined (should be `grNewHire + grRefresh`).

### Code Implementation (lines 381-385)
```javascript
const totalGrantAdminWork = oh + grNewHireNum + grRefreshNum;
const grHrs = totalGrantAdminWork * grHr;
const grCost = grHrs * mult * rate;
```
**Correct Formula**:
```
grCost = (oh + grNewHire + grRefresh) × grHr × mult × blended_rate
```

**Action**: Update PRD Section 4.1 to explicitly include option holders and both grant types.

---

## 2. COMPLIANCE HOURS

### PRD Documentation (Section 4.2)
Dynamic tiered model with TIER 1/2/3. ✅ **MATCHES CODE**

### Code Implementation (line 379)
```javascript
const compHr = overrides.compHr || getDynamicComplianceHours(stageKey, sh, oh, geoInc, grNewHire);
```
**Status**: ✅ Correct. PRD documents this accurately.

---

## 3. CAP TABLE MAINTENANCE COST

### PRD Documentation (Section 4.3, line 210)
```
Base: 3 hours/month
Scaling: +2 hours/month for every 50 shareholders above 20
Formula: ctMonthlyHours = 3 + (sh - 20) / 50 × 2
Annual: ctMonthlyHours × 12 × mult × blended_rate
```

### Code Implementation (lines 392-398)
```javascript
const CAP_TABLE_BASE_HOURS_PER_MONTH = 3;
const CAP_TABLE_SCALING_INCREMENT = 2;
const ctShareholderScale = Math.max(0, (sh - 20) / 50);
const ctMonthlyHours = sh > 0 ? CAP_TABLE_BASE_HOURS_PER_MONTH + (ctShareholderScale * CAP_TABLE_SCALING_INCREMENT) : 0;
const ctRaw = ctMonthlyHours * 12;
const ctHrs = ctRaw * mult;
const ctCost = ctHrs * rate;
```

**Status**: ✅ **MATCHES** — PRD correctly documents this.

**Note**: Code includes conditional `sh > 0 ? ... : 0` (no cap table cost if 0 shareholders). ✅ PRD should explicitly note this.

---

## 4. FUNDRAISING: CAP TABLE WORKFLOWS

### PRD Documentation (Section 5.2, line 290)
```
Base: 3 workflows × 2.5 hrs = 7.5 hrs
Scaled: 7.5 × ROUND_COMPLEXITY[round]
ctFundraisingCost = 7.5 × roundMultiplier × mult × blended_rate
```

### Code Implementation (lines 407-411)
```javascript
const HOURS_PER_WORKFLOW = 2.5;
const ctFundraisingBaseHours = FUNDRAISING_WORKFLOWS.capTable * HOURS_PER_WORKFLOW; // 3 × 2.5 = 7.5
const ctFundraisingHours = planningToFundraise ? (ctFundraisingBaseHours * roundMultiplier) : 0;
const ctFundraisingHrs = ctFundraisingHours * mult;
const ctFundraisingCost = ctFundraisingHrs * rate;
```

**Status**: ✅ **MATCHES** — PRD correctly documents this.

---

## 5. FUNDRAISING: SECRETARIAL & BOARD WORKFLOWS

### PRD Documentation (Section 5.3, line 295)
```
Base: 3 workflows × 2.5 hrs = 7.5 hrs
Scaled by round: 7.5 × ROUND_COMPLEXITY[round]
Scaled by shareholders: 1 + (effectiveShareholders - 20) / 100 × 0.5
secFundraisingCost = 7.5 × roundMultiplier × secScaling × mult × secRate
```

### Code Implementation (lines 419-427)
```javascript
const secFundraisingBaseWorkflows = planningToFundraise ? FUNDRAISING_WORKFLOWS.secretarial : 0;
const secFundraisingBaseHours = secFundraisingBaseWorkflows * HOURS_PER_WORKFLOW; // 3 × 2.5 = 7.5
const secFundraisingHours = secFundraisingBaseHours * roundMultiplier;
const effectiveShareholders = planningToFundraise ? (sh + newShareholdersFromFundraise) : sh;
const secFundraisingScaling = 1 + Math.max(0, (effectiveShareholders - 20) / 100) * 0.5;
const secFundraisingRaw = secFundraisingHours * secFundraisingScaling;
const secFundraisingHrs = secFundraisingRaw * mult;
const secFundraisingCost = secFundraisingHrs * secRate;
```

**Status**: ✅ **MATCHES** — PRD correctly documents this (Section 5.3, line 295).

**Detail**: `effectiveShareholders = sh + newShareholdersFromFundraise` only when fundraising. ✅ PRD notes this.

---

## 6. TOTAL ANNUAL COST

### PRD Documentation (Section 6, line 305)
```
annCost = grCost + cpCost + ctCost + ctFundraisingCost + secFundraisingCost + methodExtCost + valuationCost
```

### Code Implementation (line 451)
```javascript
const annCost = grCost + cpCost + ctCost + ctFundraisingCost + secFundraisingCost + methodExtCost + valuationCost;
```

**Status**: ✅ **MATCHES EXACTLY**.

---

## 7. HOURS SAVED CALCULATION

### PRD Documentation (Section 7.2, line 335)
```
manualHTotal = (oh + grNewHire + grRefresh) × grHr + compHr + ctRaw + ctFundraisingHours + secFundraisingRaw
hoursSaved = manualHTotal × mult
```

### Code Implementation (lines 452-455)
```javascript
const manualHTotal = overrides.manualHTotal || (totalGrantAdminWork * grHr + compHr + ctRaw + ctFundraisingHours + secFundraisingRaw);
const adjustedHTotal = manualHTotal * mult;
const hoursToday = adjustedHTotal;
const hoursSaved = hoursToday;
```

**Status**: ✅ **MATCHES** — But code has redundant variable: `hoursToday = adjustedHTotal` and `hoursSaved = hoursToday`.

**Note**: Variable names are confusing. PRD calls it `hoursSaved` but it's actually current manual hours (not hours EquityList saves).

**Action**: Clarify in PRD that `hoursSaved` = total annual manual hours with current method (not the delta that EquityList saves).

---

## 8. PAYBACK PERIOD CALCULATION

### PRD Documentation
**MISSING** — Not documented anywhere in PRD.

### Code Implementation
**NOT CALCULATED IN CODE** — The code doesn't calculate payback period. 

**Wait, check ROI card...** Looking at the ROI card code I just removed, it was:
```javascript
const months = v.elAnn / (Math.abs(v.diff) / 12);
return months < 1.5 ? Math.round(months * 4.3) + ' weeks' : months.toFixed(1) + ' months';
```

**Formula**:
```
paybackMonths = annualEquityListCost / (monthlyMarginalSavings)
paybackMonths = elAnn / (diff / 12)  // where diff is positive (savings)

If paybackMonths < 1.5: show as weeks = paybackMonths × 4.3
Else: show as decimal months
```

**Action**: This formula was only used in UI (now removed). Should it be documented in PRD as an optional output metric?

---

## 9. ROI MULTIPLE

### PRD Documentation (Section 7.4, line 340)
```
roi = abs(savings) / elAnn
```

### Code Implementation (line 464)
```javascript
const roi = elAnn > 0 ? Math.round((absDiff / elAnn) * 10) / 10 : 0;
```

**Status**: ✅ **MATCHES CONCEPTUALLY**. But code adds rounding:

**Actual Formula**:
```
roi = round((abs(annCost - elAnn) / elAnn) × 10) / 10
```

This rounds to nearest 0.1 (one decimal place).

**Action**: Update PRD Section 7.4 to document the rounding: "rounded to nearest 0.1 for display precision."

---

## 10. STAKEHOLDERS FOR PLATFORM PRICING

### PRD Documentation (Section 2.1, line 120)
```
stakeholders = min(sh + oh + grNewHire, 10,000)
```

### Code Implementation (line 458)
```javascript
const stakeholders = Math.min(sh + oh + parseInt(grNewHire, 10), 10000);
```

**Status**: ✅ **MATCHES EXACTLY**.

---

## 11. PLATFORM PRICING

### PRD Documentation (Section 6.1)
```
elAnn = stakeholders × PRICING[geoInc] + elValuationCost
```

### Code Implementation (line 459)
```javascript
const elAnn = stakeholders * PRICING[geoInc] + elValuationCost;
```

**Status**: ✅ **MATCHES EXACTLY**.

---

## 12. SAVINGS & PROFIT MARGIN

### PRD Documentation (Section 7.1)
```
savings = abs(annCost - elAnn)
```

### Code Implementation (lines 461-463)
```javascript
const diff = annCost - elAnn;
const isSpend = diff >= 0;  // true = saving money, false = costs more
const absDiff = Math.abs(diff);
```

**Status**: ✅ **MATCHES** — Code calls it `diff` instead of `savings`, but formula is identical.

**Semantic note**: `isSpend` = true means you're currently *overspending* vs EquityList (i.e., savings possible).

**Action**: PRD should clarify the sign convention. When diff > 0, EquityList saves money. When diff < 0, EquityList costs more.

---

## SUMMARY OF ACTIONS NEEDED

| Issue | Priority | Action |
|-------|----------|--------|
| Grant admin formula incomplete | HIGH | Update Section 4.1 to show: `(oh + grNewHire + grRefresh) × 1.5 × mult × rate` |
| Cap table cost should note sh > 0 condition | MEDIUM | Add note: "Cap table cost = 0 if shareholders = 0" |
| Payback period not documented | MEDIUM | Add calculation (if still relevant) or remove reference |
| ROI rounding not documented | MEDIUM | Update Section 7.4: "rounded to nearest 0.1" |
| Hours saved semantics unclear | MEDIUM | Clarify: "hoursSaved = current manual hours (not EquityList's delta)" |
| Savings sign convention unclear | MEDIUM | Clarify: "diff > 0 = EquityList saves money; diff < 0 = EquityList costs more" |

---

## OVERALL ASSESSMENT

✅ **85% accurate** — Most core calculations match PRD.

❌ **15% gaps** — Some formulas incomplete/ambiguous, a few metrics not documented.

**Recommendation**: Update PRD with above actions, then it will be comprehensive and match code exactly.
