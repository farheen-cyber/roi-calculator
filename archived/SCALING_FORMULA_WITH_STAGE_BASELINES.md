# Complete Scaling Formula with Stage-Adjusted Baselines

## The Formula

```
Scaled Retainer = Base Retainer 
                × (1 + max(0, totalStakeholders - STAKEHOLDER_BASELINE) / 200)
                × (1 + max(0, refreshGrants - GRANT_BASELINE) / 50)
                × (planningToFundraise ? 1.3 : 1.0)
```

**Where:**
- `totalStakeholders = shareholders + optionHolders + newHireGrants`
- `STAKEHOLDER_BASELINE` and `GRANT_BASELINE` depend on stage (see table below)
- `Base Retainer` comes from STAGE_RETAINER table

---

## Stage Baselines

| Stage | Stakeholder Baseline | Grant Baseline |
|-------|----------------------|-----------------|
| Pre-seed | 10 | 0 |
| Seed | 25 | 2 |
| Series A/B | 50 | 5 |
| Series B/C | 100 | 10 |
| Series C+ | 150 | 15 |

---

## Example 1: Simple Pre-seed Company

**Inputs:**
- Stage: Pre-seed
- Shareholders: 8
- Option Holders: 2
- New Hire Grants: 0
- Refresh Grants: 0
- Fundraising: No

**Calculation:**

```
totalStakeholders = 8 + 2 + 0 = 10

Stakeholder Factor:
  1 + max(0, 10 - 10) / 200
  = 1 + 0 / 200
  = 1.0

Refresh Grant Factor:
  1 + max(0, 0 - 0) / 50
  = 1 + 0 / 50
  = 1.0

Fundraising Factor:
  planningToFundraise = false → 1.0

Scaled Retainer = $60,000 × 1.0 × 1.0 × 1.0 = $60,000
```

**Result:** No scaling. Retainer stays at base ($60K for India pre-seed).

---

## Example 2: Your Pre-seed Scenario

**Inputs:**
- Stage: Pre-seed
- Shareholders: 100
- Option Holders: 30
- New Hire Grants: 0
- Refresh Grants: 0
- Fundraising: No
- Geography: US

**Calculation:**

```
totalStakeholders = 100 + 30 + 0 = 130

Stakeholder Factor:
  1 + max(0, 130 - 10) / 200
  = 1 + 120 / 200
  = 1 + 0.6
  = 1.6

Refresh Grant Factor:
  1 + max(0, 0 - 0) / 50
  = 1 + 0 / 50
  = 1.0

Fundraising Factor:
  planningToFundraise = false → 1.0

Scaled Retainer = $6,000 × 1.6 × 1.0 × 1.0 = $9,600
```

**Result:** 
- Current: $6,000
- With scaling: $9,600
- Increase: +60% (still much cheaper than in-house $14,848)

---

## Example 3: Series A/B, Complex, Fundraising

**Inputs:**
- Stage: Series A/B
- Shareholders: 150
- Option Holders: 40
- New Hire Grants: 0
- Refresh Grants: 30
- Fundraising: Yes
- Geography: US

**Calculation:**

```
totalStakeholders = 150 + 40 + 0 = 190

Stakeholder Factor:
  1 + max(0, 190 - 50) / 200
  = 1 + 140 / 200
  = 1 + 0.7
  = 1.7

Refresh Grant Factor:
  1 + max(0, 30 - 5) / 50
  = 1 + 25 / 50
  = 1 + 0.5
  = 1.5

Fundraising Factor:
  planningToFundraise = true → 1.3

Scaled Retainer = $18,000 × 1.7 × 1.5 × 1.3 = $56,070
```

**Result:** 
- Current: $18,000
- With scaling: $56,070
- Increase: +211%
- vs In-house: $37,574 → Now IN-HOUSE is cheaper by $19,504

---

## Example 4: Series C+, Simple

**Inputs:**
- Stage: Series C+
- Shareholders: 50
- Option Holders: 20
- New Hire Grants: 0
- Refresh Grants: 5
- Fundraising: No
- Geography: US

**Calculation:**

```
totalStakeholders = 50 + 20 + 0 = 70

Stakeholder Factor:
  1 + max(0, 70 - 150) / 200
  = 1 + max(0, -80) / 200
  = 1 + 0
  = 1.0

Refresh Grant Factor:
  1 + max(0, 5 - 15) / 50
  = 1 + max(0, -10) / 50
  = 1 + 0
  = 1.0

Fundraising Factor:
  planningToFundraise = false → 1.0

Scaled Retainer = $60,000 × 1.0 × 1.0 × 1.0 = $60,000
```

**Result:** No scaling. This Series C company is "simple" for its stage, so no penalty.

---

## Example 5: Series B/C, Very Complex, Fundraising

**Inputs:**
- Stage: Series B/C
- Shareholders: 200
- Option Holders: 80
- New Hire Grants: 30
- Refresh Grants: 50
- Fundraising: Yes
- Geography: India

**Calculation:**

```
totalStakeholders = 200 + 80 + 30 = 310

Stakeholder Factor:
  1 + max(0, 310 - 100) / 200
  = 1 + 210 / 200
  = 1 + 1.05
  = 2.05

Refresh Grant Factor:
  1 + max(0, 50 - 10) / 50
  = 1 + 40 / 50
  = 1 + 0.8
  = 1.8

Fundraising Factor:
  planningToFundraise = true → 1.3

Scaled Retainer = ₹256,000 × 2.05 × 1.8 × 1.3 = ₹1,216,032
```

**Result:** 
- Current: ₹256,000
- With scaling: ₹1,216,032
- Increase: +375%
- This is now VERY expensive (relative to in-house)

---

## Summary Table: Before vs After

| Scenario | Stage | Stakeholders | Grants | Fundraise | Current | Scaled | Change |
|----------|-------|--------------|--------|-----------|---------|--------|--------|
| Simple pre-seed | Pre-seed | 10 | 0 | No | $6,000 | $6,000 | +0% |
| Your pre-seed | Pre-seed | 130 | 0 | No | $6,000 | $9,600 | +60% |
| Series A/B complex | Series A/B | 190 | 30 | Yes | $18,000 | $56,070 | +211% |
| Series C simple | Series C+ | 70 | 5 | No | $60,000 | $60,000 | +0% |
| Series B/C extreme | Series B/C | 310 | 50 | Yes | ₹256,000 | ₹1.2M | +375% |

---

## Key Insights

✅ **Simple companies at their stage:** No penalty (stays at base retainer)
✅ **Complex companies at their stage:** Retainer scales up significantly
✅ **Fundraising:** 30% premium on top of complexity scaling
✅ **Fair pricing:** Complexity-based, not arbitrary

---

## Code Implementation (JavaScript)

When implemented in your calculator, it will look like:

```javascript
const STAKEHOLDER_BASELINES = {
  preseed: 10,
  seed: 25,
  seriesab: 50,
  seriesbc: 100,
  seriesc: 150
};

const GRANT_BASELINES = {
  preseed: 0,
  seed: 2,
  seriesab: 5,
  seriesbc: 10,
  seriesc: 15
};

if (meth === 'outsourced' && !overrides.methodExtCost) {
  const baseRetainer = STAGE_RETAINER[geoInc][stageKey];
  const totalStakeholders = sh + oh + parseInt(grNewHire, 10);
  
  const stakeholderBaseline = STAKEHOLDER_BASELINES[stageKey];
  const grantBaseline = GRANT_BASELINES[stageKey];
  
  const stakeholderFactor = 1 + Math.max(0, totalStakeholders - stakeholderBaseline) / 200;
  const grantFactor = 1 + Math.max(0, grRefresh - grantBaseline) / 50;
  const fundraisingFactor = planningToFundraise ? 1.3 : 1.0;
  
  methodExtCost = Math.round(baseRetainer * stakeholderFactor * grantFactor * fundraisingFactor);
}
```

---

Ready to implement?
