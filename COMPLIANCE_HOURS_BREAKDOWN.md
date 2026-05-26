# Dynamic Compliance Hours Calculation

## Formula

```javascript
hours = shareholders × factor[stage]

if optionHolders > 0 OR grants > 0:
  hours += optionHolders × factor[stage]
  hours += accounting[geoInc] × accountingScale[stage] × (1 + optionHolders × 0.01)
```

**Note:** Accounting overhead is triggered if you have **either** option holders **OR** you're issuing grants (which means you plan to have option holders).

## Parameters

**Complexity Factor (per shareholder/option holder):**
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
- Pre-seed: 25% of baseline
- Seed: 40% of baseline
- Series A/B: 60% of baseline
- Series B/C: 80% of baseline
- Series C+: 100% of baseline

**Accounting Multiplier (scales with option holders):**
- `1 + (optionHolders × 0.01)`
- 5 option holders = 1.05× (5% increase)
- 50 option holders = 1.5× (50% increase)
- 100 option holders = 2× (100% increase)

---

## Scenario Breakdown by Stage

### Pre-seed (Typical: 2-3 shareholders, 0-5 option holders)

| Scenario | Shareholders | Option Holders | India | US | Singapore | UK |
|----------|--------------|----------------|-------|-----|-----------|-----|
| No equity, no investors | 2 | 0 | **0** | **0** | **0** | **0** |
| With small option pool | 2 | 5 | **12** | **11** | **8** | **8** |
| Founder + angel investor | 3 | 0 | **0** | **0** | **0** | **0** |
| Founder + angel + options | 3 | 8 | **15** | **14** | **10** | **10** |

---

### Seed (Typical: 5-10 shareholders, 5-15 option holders)

| Scenario | Shareholders | Option Holders | India | US | Singapore | UK |
|----------|--------------|----------------|-------|-----|-----------|-----|
| Multiple angels, no options | 6 | 0 | **0** | **0** | **0** | **0** |
| Multiple angels + small pool | 6 | 10 | **18** | **17** | **12** | **12** |
| Multiple rounds, growing pool | 8 | 20 | **25** | **24** | **17** | **17** |
| High shareholder count | 12 | 10 | **24** | **22** | **16** | **16** |

---

### Series A/B (Typical: 15-30 shareholders, 15-40 option holders)

| Scenario | Shareholders | Option Holders | India | US | Singapore | UK |
|----------|--------------|----------------|-------|-----|-----------|-----|
| Standard Series A | 20 | 15 | **30** | **29** | **21** | **21** |
| Series A + growing pool | 20 | 30 | **37** | **35** | **25** | **25** |
| Series B preparing | 25 | 25 | **41** | **39** | **28** | **28** |
| Series B complex cap table | 30 | 40 | **57** | **54** | **38** | **38** |

---

### Series B/C (Typical: 30-50 shareholders, 40-80 option holders)

| Scenario | Shareholders | Option Holders | India | US | Singapore | UK |
|----------|--------------|----------------|-------|-----|-----------|-----|
| Early Series B | 30 | 40 | **57** | **54** | **38** | **38** |
| Series B standard | 40 | 50 | **73** | **69** | **49** | **49** |
| Late Series B | 50 | 60 | **89** | **84** | **60** | **60** |
| Series C entry | 60 | 80 | **111** | **105** | **75** | **75** |

---

### Series C+ (Typical: 50+ shareholders, 80+ option holders)

| Scenario | Shareholders | Option Holders | India | US | Singapore | UK |
|----------|--------------|----------------|-------|-----|-----------|-----|
| Series C standard | 60 | 80 | **111** | **105** | **75** | **75** |
| Series C mature | 80 | 100 | **149** | **141** | **101** | **101** |
| Late-stage | 100 | 120 | **187** | **177** | **127** | **127** |

---

## Key Observations

### What this reveals:

1. **Companies without equity pay nothing**
   - Preseed with 2 founders, 0 options = 0 hours
   - Only shareholders count when no equity plan

2. **Equity plan triggers accounting overhead**
   - First option holder: adds accounting baseline scaled by stage
   - Accounting scales with both stage maturity AND pool size
   - More option holders = proportionally more accounting work

3. **Accounting overhead is now proportional**
   - Pre-seed with 5 options, India: 40 × 0.25 × 1.05 = 10.5 hours
   - Series C with 80 options, India: 40 × 1.0 × 1.8 = 72 hours
   - Reflects actual complexity (more holders = more tracking)

4. **Country variance is real but driven by complexity**
   - India (40 hrs) vs Singapore (24 hrs) = 67% difference
   - But now it scales with how complex your equity is
   - A tiny preseed with 5 options still only needs 12 hours in India vs 8 in Singapore

5. **Early stage companies benefit most**
   - Pre-seed without equity: 0 hours (was 72 before)
   - Seed with 5 options: 18 hours (was 68 before)
   - Only mature companies approach original numbers

---

## Calculation Examples

### Example 1: Pre-seed, India, 2 founders, 0 options, 0 grants
```
shareholders: 2 × 0.03 = 0.06
optionHolders: 0, grants: 0 → no accounting
Total: 0 hours
```

### Example 1b: Pre-seed, India, 2 founders, 0 options, 10 grants/year
```
shareholders: 2 × 0.03 = 0.06
optionHolders: 0, grants: 10 > 0 → accounting applies!
accounting: 40 × 0.25 × (1 + 0 × 0.01) = 10
Total: 10 hours
```
(Even though no option holders exist yet, issuing grants triggers accounting overhead)

### Example 2: Pre-seed, India, 2 founders, 5 options
```
shareholders: 2 × 0.03 = 0.06
optionHolders: 5 × 0.03 = 0.15
accounting: 40 × 0.25 × (1 + 5 × 0.01) = 10 × 1.05 = 10.5
Total: 10.71 → 11 hours
```

### Example 3: Series A, India, 20 shareholders, 15 option holders
```
shareholders: 20 × 0.08 = 1.6
optionHolders: 15 × 0.08 = 1.2
accounting: 40 × 0.60 × (1 + 15 × 0.01) = 24 × 1.15 = 27.6
Total: 30.4 → 30 hours
```

### Example 4: Series C, India, 60 shareholders, 80 option holders
```
shareholders: 60 × 0.15 = 9
optionHolders: 80 × 0.15 = 12
accounting: 40 × 1.0 × (1 + 80 × 0.01) = 40 × 1.8 = 72
Total: 93 hours
```

---

## Comparison: Current vs. New Model

| Jurisdiction | Current (Static) | Pre-seed (no options) | Seed (with options) | Series A/B | Series C+ |
|--------------|------------------|----------------------|---------------------|------------|-----------|
| India | 72 | 0 | 18-24 | 30-40 | 93-150+ |
| US | 68 | 0 | 17-22 | 29-38 | 88-140+ |
| Singapore | 54 | 0 | 12-17 | 21-27 | 63-100+ |
| UK | 54 | 0 | 12-17 | 21-27 | 63-100+ |

**Result:** Companies only pay for the compliance they actually need, scaled by genuine complexity.
