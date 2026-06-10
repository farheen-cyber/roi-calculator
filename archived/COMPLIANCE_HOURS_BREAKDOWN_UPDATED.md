# Dynamic Compliance Hours Calculation (Updated)

## Key Change: Split Grants Into Two Types

The form now distinguishes between:

1. **New hire grants per year** — Employees newly hired with options
   - Triggers accounting overhead even if current option holders = 0
   - Increases stakeholder count for EquityList pricing
   - Contributes to grant overhead

2. **Refresh grants per year** — Equity refreshes/acceleration to existing holders
   - Only relevant if option holders > 0
   - Contributes to grant overhead
   - Does NOT increase stakeholder count

---

## Updated Formula

```javascript
// Compliance hours triggered by either:
if (optionHolders > 0 || newHireGrants > 0)

// Grant overhead uses both types:
totalGrants = newHireGrants + refreshGrants
grCost = totalGrants * hourlyRate

// Stakeholder count includes new hires:
stakeholders = shareholders + optionHolders + newHireGrants
elAnn = stakeholders * PRICING[country]
```

---

## Complexity Factor (per shareholder/option holder)

- Pre-seed: 0.03
- Seed: 0.05
- Series A/B: 0.08
- Series B/C: 0.10
- Series C+: 0.15

**Accounting Baseline (country-specific):**
- India: 40 hours
- US: 38 hours
- Singapore: 24 hours
- UK: 24 hours

**Accounting Scale (by stage):**
- Pre-seed: 25%
- Seed: 40%
- Series A/B: 60%
- Series B/C: 80%
- Series C+: 100%

---

## Scenarios: New Hire vs Refresh Grants

### Scenario 1: Pre-seed, Starting Equity Plan
- **Current:** 2 shareholders, 0 option holders
- **New hire grants:** 5/year
- **Refresh grants:** 0/year

**Compliance:**
```
shareholders: 2 × 0.03 = 0.06
optionHolders: 0, but newHireGrants: 5 > 0 → accounting applies!
accounting: 40 × 0.25 × (1 + 0 × 0.01) = 10
Total: 10 hours
```

**Stakeholders for pricing:**
```
2 (shareholders) + 0 (current option holders) + 5 (new hires) = 7
EquityList pricing = 7 × ₹1200 = ₹8,400/year
```

**Grant overhead:**
```
5 (new hire) + 0 (refresh) = 5 grants
Grant cost = 5 × 1.5 hrs × rate
```

---

### Scenario 2: Series A, Mature Equity Plan
- **Current:** 20 shareholders, 15 option holders
- **New hire grants:** 8/year
- **Refresh grants:** 12/year

**Compliance:**
```
shareholders: 20 × 0.08 = 1.6
optionHolders: 15, and newHireGrants: 8 > 0 → accounting applies!
accounting: 40 × 0.60 × (1 + 15 × 0.01) = 24 × 1.15 = 27.6
Total: 30.4 → 30 hours
```

**Stakeholders for pricing:**
```
20 (shareholders) + 15 (current option holders) + 8 (new hires) = 43
EquityList pricing = 43 × $40 = $1,720/year
```

**Grant overhead:**
```
8 (new hire) + 12 (refresh) = 20 grants
Grant cost = 20 × 1.5 hrs × rate
```

---

### Scenario 3: Series C, High-Growth Equity
- **Current:** 60 shareholders, 80 option holders
- **New hire grants:** 30/year
- **Refresh grants:** 20/year

**Compliance:**
```
shareholders: 60 × 0.15 = 9
optionHolders: 80, and newHireGrants: 30 > 0 → accounting applies!
accounting: 40 × 1.0 × (1 + 80 × 0.01) = 40 × 1.8 = 72
Total: 93 hours
```

**Stakeholders for pricing:**
```
60 (shareholders) + 80 (current option holders) + 30 (new hires) = 170
EquityList pricing = 170 × $40 = $6,800/year
```

**Grant overhead:**
```
30 (new hire) + 20 (refresh) = 50 grants
Grant cost = 50 × 1.5 hrs × rate
```

---

## Validation Rules

1. **Refresh grants only valid if option holders > 0**
   - Can't give refresh grants to non-existent option holders
   - If oh = 0, refresh grants must = 0

2. **New hire grants can be > 0 even if option holders = 0**
   - Indicates you're planning to start/expand an option pool
   - Triggers accounting overhead immediately

3. **Both contribute to grant overhead**
   - Grant admin cost = (newHireGrants + refreshGrants) × hourlyRate

---

## Impact Summary

### What Changed:

| Field | Old | New |
|-------|-----|-----|
| Grants per year | Single field | Split into 2 |
| Compliance trigger | oh > 0 | oh > 0 OR newHireGrants > 0 |
| Stakeholders | sh + oh | sh + oh + newHireGrants |
| Grant overhead | Single calculation | Both types summed |

### Why It Matters:

- **Pre-seed starting options:** Now shows real compliance costs even with 0 current holders
- **Mature companies:** Refresh grants are properly accounted separately from new hires
- **Pricing accuracy:** EquityList pricing reflects actual future headcount on platform
- **Transparency:** Users see distinction between maintaining vs. growing option pool

---

## Example: Year-over-Year Growth

**Year 1 (Series A):**
- Option holders: 15
- New hire grants: 8/year
- Refresh grants: 5/year
- Compliance: 28 hours
- EquityList stakeholders: 20 + 15 + 8 = 43

**Year 2 (Series A-2):**
- Option holders: 15 + 8 = 23 (carries forward from new hires)
- New hire grants: 10/year
- Refresh grants: 8/year
- Compliance: 35 hours (slightly higher due to more option holders)
- EquityList stakeholders: 20 + 23 + 10 = 53

Notice:
- Compliance hours increase as you add more option holders
- Stakeholder count grows with new hires
- Refresh grants scale independently
