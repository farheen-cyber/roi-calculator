# Approach 2: Custom Scaling Design

## Overview

Instead of separate shareholder/option holder/grant factors, we'll use:
1. **Total Stakeholder Count** (sh + oh + new hire grants)
2. **Refresh Grants/year**
3. **Fundraising flag** (Yes/No)
4. **Valuation Reports flag** (Yes/No)

---

## Factor A: Stakeholder Count Scaling

**Formula:**
```
stakeholderScale = 1 + max(0, totalStakeholders - 20) / DIVISOR
```

**Where:**
- `totalStakeholders = shareholders + optionHolders + newHireGrants`
- `DIVISOR = ?` (we need to define this)

**Question 1:** What divisor feels right?
- Divisor = 200: Every 200 additional stakeholders = 100% retainer increase
- Divisor = 150: Every 150 additional stakeholders = 100% increase (more aggressive)
- Divisor = 100: Every 100 additional stakeholders = 100% increase (very aggressive)

**Examples with divisor = 200:**

| Total Stakeholders | Calculation | Scale |
|-------------------|------------|-------|
| 10 | 1 + (10-20)/200 = 1 + 0 | **1.0x** |
| 20 | 1 + (20-20)/200 = 1 + 0 | **1.0x** |
| 50 | 1 + (50-20)/200 = 1 + 0.15 | **1.15x** |
| 100 | 1 + (100-20)/200 = 1 + 0.4 | **1.4x** |
| 200 | 1 + (200-20)/200 = 1 + 0.9 | **1.9x** |

---

## Factor B: Refresh Grants Scaling

**Formula:**
```
refreshGrantScale = 1 + max(0, refreshGrants - 3) / DIVISOR
```

**Question 2:** What divisor?
- Divisor = 50: Every 50 refresh grants/year = 100% increase
- Divisor = 30: Every 30 refresh grants/year = 100% increase (more aggressive)
- Divisor = 20: Very aggressive

**Examples with divisor = 50:**

| Refresh Grants/yr | Calculation | Scale |
|------------------|------------|-------|
| 0 | 1 + (0-3)/50 = 1 + 0 | **1.0x** |
| 3 | 1 + (3-3)/50 = 1 + 0 | **1.0x** |
| 5 | 1 + (5-3)/50 = 1 + 0.04 | **1.04x** |
| 10 | 1 + (10-3)/50 = 1 + 0.14 | **1.14x** |
| 20 | 1 + (20-3)/50 = 1 + 0.34 | **1.34x** |
| 30 | 1 + (30-3)/50 = 1 + 0.54 | **1.54x** |

---

## Factor C: Fundraising Scaling

**Formula:**
```
fundraisingScale = planningToFundraise ? FUNDRAISING_MULTIPLIER : 1.0
```

**Question 3:** What multiplier for fundraising?
- 1.2x: 20% increase if fundraising
- 1.5x: 50% increase if fundraising
- 1.3x: 30% increase if fundraising

**Rationale:** Fundraising adds complexity (cap table updates, shareholder communications, etc.)

---

## Factor D: Valuation Reports Scaling

**Two options:**

### Option 1: Cost Adder (Add fixed amount to retainer)
```
if (valuationFrequency && valuationType) {
  valuationCost = VALUATION_MARKUP_AMOUNT
} else {
  valuationCost = 0
}
```

**Question 4a:** How much to add?
- $2,000/year (covers minimal CA involvement)
- $5,000/year (moderate involvement)
- $10,000/year (significant involvement)

### Option 2: Multiplier (Scale the retainer)
```
valuationScale = (valuationFrequency && valuationType) ? 1.15 : 1.0
```

**Question 4b:** Which approach and what amount/multiplier?

---

## Final Formula (Option A: All multipliers)

```
Scaled Retainer = Base Retainer 
                × stakeholderScale 
                × refreshGrantScale 
                × fundraisingScale 
                × valuationScale
```

**Example:** US Series A/B company
- Base: $18,000
- Stakeholders: 150 sh + 40 oh + 0 gr = 190 total
  - stakeholderScale = 1 + (190-20)/200 = 1.85x
- Refresh grants: 30/yr
  - refreshGrantScale = 1 + (30-3)/50 = 1.54x
- Fundraising: Yes
  - fundraisingScale = 1.5x
- Valuation: No
  - valuationScale = 1.0x

**Calculation:**
```
$18,000 × 1.85 × 1.54 × 1.5 × 1.0 = $76,833
```

---

## Final Formula (Option B: Multipliers + Adder)

```
Scaled Retainer = (Base Retainer × stakeholderScale × refreshGrantScale × fundraisingScale)
                + valuationMarkupAmount
```

**Same example:**
```
($18,000 × 1.85 × 1.54 × 1.5) + $5,000 = $76,833
```

---

## Summary of Questions

Before we implement, please define:

**A. Stakeholder Scale Divisor:**
- [ ] 200 (conservative)
- [ ] 150 (moderate)
- [ ] 100 (aggressive)
- [ ] Other: ___

**B. Refresh Grant Scale Divisor:**
- [ ] 50 (conservative)
- [ ] 30 (moderate)
- [ ] 20 (aggressive)
- [ ] Other: ___

**C. Fundraising Multiplier:**
- [ ] 1.2x (20% increase)
- [ ] 1.3x (30% increase)
- [ ] 1.5x (50% increase)
- [ ] No scaling (keep at 1.0x)
- [ ] Other: ___

**D. Valuation Reports:**
- [ ] Option 1: Cost Adder at $2,000/yr
- [ ] Option 1: Cost Adder at $5,000/yr
- [ ] Option 1: Cost Adder at $10,000/yr
- [ ] Option 2: Multiplier at 1.15x
- [ ] No scaling (keep at 1.0x)
- [ ] Other: ___

---

## Real-World Impact Examples

Once you define the parameters, I'll show you how different company scenarios scale:
- Simple pre-seed (10 sh, 5 oh, 0 gr, no fundraise, no valuation)
- Growing seed (30 sh, 20 oh, 5 gr, no fundraise, no valuation)
- Complex Series A/B (150 sh, 40 oh, 30 gr, yes fundraise, yes valuation)

Then we implement!
