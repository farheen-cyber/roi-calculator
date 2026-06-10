# Fundraising & Cap Table Refactoring

## Summary
Refactored Cap Table maintenance, Fundraising — Cap Table, and Fundraising — Secretarial & Board calculations to be transparent about their basis, with documented references to the PRD.

## Scope
This refactoring covers three cost components:
1. **Cap Table Maintenance** (lines 384-393): Recurring monthly work
2. **Fundraising — Cap Table** (lines 391-399): One-time event during fundraising
3. **Fundraising — Secretarial & Board** (lines 403-415): One-time event during fundraising

## Changes Made

### 0. Refactored Cap Table Maintenance (lines 384-393)
**Before:**
```javascript
const ctRaw = (3 + Math.max(0, (sh - 20) / 50) * 2) * 12;
const ctHrs = ctRaw * mult;
const ctCost = ctHrs * rate;
```

**After:**
```javascript
// === CAP TABLE MAINTENANCE ===
// Base: 3 hours/month (reconciliation, board updates, record-keeping)
// Scaling: +2 hours/month for every 50 shareholders above 20
// Per PRD lines 210-220: Cap table complexity grows non-linearly with shareholder count
const CAP_TABLE_BASE_HOURS_PER_MONTH = 3;
const CAP_TABLE_SCALING_INCREMENT = 2; // hours/month per each 50 shareholders above 20
const ctShareholderScale = Math.max(0, (sh - 20) / 50);
const ctMonthlyHours = CAP_TABLE_BASE_HOURS_PER_MONTH + (ctShareholderScale * CAP_TABLE_SCALING_INCREMENT);
const ctRaw = ctMonthlyHours * 12; // annualize
const ctHrs = ctRaw * mult;
const ctCost = ctHrs * rate;
```

**Rationale:**
- Makes the 3 hours/month base explicit with a named constant
- Documents that scaling adds 2 hours/month per each 50 shareholders above 20
- Shows the annualization step (`* 12`) explicitly
- Adds comment explaining PRD rationale: non-linear complexity growth
- Uses intermediate `ctMonthlyHours` to make the monthly calculation transparent

### 1. Added Documented Constants (lines 198-205 in index.html)
**Before:**
```javascript
const FUNDRAISING_WORKFLOWS = {
  capTable: 3,
  secretarial: 4
};
```

**After:**
```javascript
// Workflow counts for fundraising (per PRD fundraising_workflows definition)
// Each workflow ≈ 2.5 hours (documentation, approvals, communications, meetings)
// Source: roi-calculator-prd.md lines 226-227
const FUNDRAISING_WORKFLOWS = {
  capTable: 3,    // Cap table updates, new shareholder onboarding, transfers
  secretarial: 4  // Board meetings, shareholder approvals, governance coordination
};
```

**Rationale:** Makes clear that these are *workflow counts*, not hours, and that the rationale is documented in the PRD.

### 2. Refactored Fundraising Cap Table (lines 391-399)
**Before:**
```javascript
const roundMultiplier = planningToFundraise ? (ROUND_COMPLEXITY[fundraiseRound] || 1.0) : 0;
const ctFundraisingHours = planningToFundraise ? (FUNDRAISING_WORKFLOWS.capTable * 2.5 * roundMultiplier) : 0;
const ctFundraisingHrs = ctFundraisingHours * mult;
const ctFundraisingCost = ctFundraisingHrs * rate;
```

**After:**
```javascript
const roundMultiplier = planningToFundraise ? (ROUND_COMPLEXITY[fundraiseRound] || 1.0) : 0;

// === FUNDRAISING: CAP TABLE ===
// 3 workflows × 2.5 hours/workflow = 7.5 hours baseline
// Per PRD: "3 for cap table" workflows during fundraising
// "One workflow" = ~2.5 hours (documentation, approvals, shareholder communication)
const HOURS_PER_WORKFLOW = 2.5;
const ctFundraisingBaseHours = FUNDRAISING_WORKFLOWS.capTable * HOURS_PER_WORKFLOW; // 3 × 2.5 = 7.5
const ctFundraisingHours = planningToFundraise ? (ctFundraisingBaseHours * roundMultiplier) : 0;
const ctFundraisingHrs = ctFundraisingHours * mult;
const ctFundraisingCost = ctFundraisingHrs * rate;
```

**Rationale:** 
- Names the intermediate constant `ctFundraisingBaseHours` to make the 7.5 hour baseline transparent
- Extracts `HOURS_PER_WORKFLOW` as a named constant (used for both cap table and secretarial)
- Adds inline calculation showing `3 × 2.5 = 7.5`
- Documents what each "workflow" comprises

### 3. Refactored Fundraising Secretarial (lines 403-415)
**Before:**
```javascript
const secFundraisingWorkflows = planningToFundraise ? FUNDRAISING_WORKFLOWS.secretarial : 0;
const secFundraisingHours = secFundraisingWorkflows * 2.5 * roundMultiplier;
const effectiveShareholders = planningToFundraise ? (sh + newShareholdersFromFundraise) : sh;
const secFundraisingScaling = 1 + Math.max(0, (effectiveShareholders - 20) / 100) * 0.5;
const secFundraisingRaw = secFundraisingHours * secFundraisingScaling;
const secFundraisingHrs = secFundraisingRaw * mult;
const secFundraisingCost = secFundraisingHrs * secRate;
```

**After:**
```javascript
// === FUNDRAISING: SECRETARIAL & BOARD ===
// 4 workflows × 2.5 hours/workflow = 10 hours baseline
// Per PRD: "4 for secretarial prep" workflows during fundraising
// Scaled by shareholder count (more shareholders = more communication/coordination)
const secFundraisingBaseWorkflows = planningToFundraise ? FUNDRAISING_WORKFLOWS.secretarial : 0;
const secFundraisingBaseHours = secFundraisingBaseWorkflows * HOURS_PER_WORKFLOW; // 4 × 2.5 = 10
const secFundraisingHours = secFundraisingBaseHours * roundMultiplier;
const effectiveShareholders = planningToFundraise ? (sh + newShareholdersFromFundraise) : sh;
// Shareholder scaling: starts at 1.0 for ≤20 shareholders, increases 0.5% for every 100 shareholders above 20
const secFundraisingScaling = 1 + Math.max(0, (effectiveShareholders - 20) / 100) * 0.5;
const secFundraisingRaw = secFundraisingHours * secFundraisingScaling;
const secFundraisingHrs = secFundraisingRaw * mult;
const secFundraisingCost = secFundraisingHrs * secRate;
```

**Rationale:**
- Shows that base is 10 hours (4 workflows × 2.5 hours each)
- Explicitly names `secFundraisingBaseWorkflows` and `secFundraisingBaseHours` for clarity
- Documents what the shareholder scaling formula does in plain English
- Uses the shared `HOURS_PER_WORKFLOW` constant for consistency

## Formula Pattern
Both fundraising formulas now follow this transparent pattern:
```
baseHours = workflows × HOURS_PER_WORKFLOW
scaledHours = baseHours × roundComplexity × [shareholderScale]
finalHours = scaledHours × operationalMultiplier
finalCost = finalHours × hourlyRate
```

## Mathematical Equivalence
**Cap Table Maintenance:** `(3 + max(0, (sh - 20) / 50) × 2) × 12 = ctMonthlyHours × 12` ✓ (unchanged)
**Fundraising Cap Table:** `3 × 2.5 × roundMultiplier = 7.5 × roundMultiplier` ✓ (unchanged)
**Fundraising Secretarial:** `4 × 2.5 × roundMultiplier × shareholderScale = 10 × roundMultiplier × shareholderScale` ✓ (unchanged)

## Reference
- PRD source: roi-calculator-prd.md lines 226-227, 236-249
- Workflow definition: "One workflow ≈ 2.5 hours" (documentation, approvals, meetings, communications)
- Cap table workflows: 3 (cap table updates, shareholder onboarding, transfers)
- Secretarial workflows: 4 (board meetings, shareholder approvals, governance coordination)

## Why Not Further Refactored?
The previous conversation suggested refactoring to match the Compliance Hours pattern: `baseHours × stageScale × roundComplexity × volumeScale`

However, this approach is **not appropriate for fundraising workflows** because:
1. **Conceptual difference:** Fundraising is a *one-time event* scaled by round complexity, not a *recurring burden* with stage-based scaling
2. **Sound basis:** The current model (workflow counts × fixed hours/workflow) is well-grounded in the PRD and doesn't need force-fitting
3. **Different drivers:** Compliance is primarily volume-driven (shareholder/option count), while fundraising is event-complexity-driven (SAFE vs Series C)

The refactoring achieves the goal of **transparency and defensibility** through clear naming and documentation, without changing the fundamentally sound model.
