# Approach 2: Scaled Retainer - Detailed Walkthrough

## Current System (Before Change)

**Fixed Retainers (what you have now):**
```
US Pre-seed: $6,000 (always)
US Seed: $11,000 (always)
US Series A/B: $18,000 (always)
US Series B/C: $35,000 (always)
US Series C+: $60,000 (always)
```

No matter what your company looks like (10 shareholders or 200, 0 option holders or 50), the retainer is the same.

---

## New System (With Approach 2)

Instead of a fixed number, the retainer becomes a **base amount × complexity multiplier**.

### The Three Scaling Factors

**1. Shareholder Scale** (0.2 per shareholder above 20)
```javascript
shareholderScale = 1 + max(0, shareholders - 20) / 200
```

**What it means:** For every 200 shareholders above 20, retainer increases by 100%.

| Shareholders | Calculation | Scale Factor |
|--------------|------------|--------------|
| 10 | 1 + max(0, 10-20)/200 = 1 + 0 | **1.0x** |
| 20 | 1 + max(0, 20-20)/200 = 1 + 0 | **1.0x** |
| 50 | 1 + max(0, 50-20)/200 = 1 + 0.15 | **1.15x** |
| 100 | 1 + max(0, 100-20)/200 = 1 + 0.4 | **1.4x** |
| 200 | 1 + max(0, 200-20)/200 = 1 + 0.9 | **1.9x** |

---

**2. Option Holder Scale** (0.5 per option holder above 5)
```javascript
optionHolderScale = 1 + max(0, optionHolders - 5) / 100
```

**What it means:** For every 100 option holders above 5, retainer increases by 100%.

| Option Holders | Calculation | Scale Factor |
|----------------|------------|--------------|
| 0 | 1 + max(0, 0-5)/100 = 1 + 0 | **1.0x** |
| 5 | 1 + max(0, 5-5)/100 = 1 + 0 | **1.0x** |
| 15 | 1 + max(0, 15-5)/100 = 1 + 0.1 | **1.1x** |
| 30 | 1 + max(0, 30-5)/100 = 1 + 0.25 | **1.25x** |
| 50 | 1 + max(0, 50-5)/100 = 1 + 0.45 | **1.45x** |

---

**3. Grant Scale** (0.5 per combined grant above 3)
```javascript
grantScale = 1 + max(0, totalGrants - 3) / 50
```

**What it means:** For every 50 grants per year above 3, retainer increases by 100%.

| New Hire + Refresh Grants | Calculation | Scale Factor |
|--------------------------|------------|--------------|
| 0 | 1 + max(0, 0-3)/50 = 1 + 0 | **1.0x** |
| 3 | 1 + max(0, 3-3)/50 = 1 + 0 | **1.0x** |
| 5 | 1 + max(0, 5-3)/50 = 1 + 0.04 | **1.04x** |
| 10 | 1 + max(0, 10-3)/50 = 1 + 0.14 | **1.14x** |
| 20 | 1 + max(0, 20-3)/50 = 1 + 0.34 | **1.34x** |
| 40 | 1 + max(0, 40-3)/50 = 1 + 0.74 | **1.74x** |

---

### The Final Formula

```
Scaled Retainer = Base Retainer × shareholderScale × optionHolderScale × grantScale
```

All three factors **multiply together**, so complexity compounds.

---

## Real Examples: Before vs After

### Example 1: Simple Company
**Scenario:** US Pre-seed, 10 shareholders, 0 option holders, 0 grants/year

**Current (Fixed):**
```
Retainer = $6,000 (always)
```

**New (Scaled):**
```
Base retainer = $6,000
shareholderScale = 1 + (10-20)/200 = 1.0
optionHolderScale = 1 + (0-5)/100 = 1.0
grantScale = 1 + (0-3)/50 = 1.0
Scaled retainer = $6,000 × 1.0 × 1.0 × 1.0 = $6,000
```

**Result:** No change. Simple companies stay the same.

---

### Example 2: Your Scenario (Your Pre-seed Company)
**Scenario:** US Pre-seed, 100 shareholders, 30 option holders, 0 grants/year

**Current (Fixed):**
```
Retainer = $6,000
Total CA cost = (hourly at 0.2×) + $6,000 = $2,969 + $6,000 = $8,969
In-house cost = $14,848
CA is cheaper by $5,879
```

**New (Scaled):**
```
Base retainer = $6,000
shareholderScale = 1 + (100-20)/200 = 1 + 0.4 = 1.4
optionHolderScale = 1 + (30-5)/100 = 1 + 0.25 = 1.25
grantScale = 1 + (0-3)/50 = 1.0
Scaled retainer = $6,000 × 1.4 × 1.25 × 1.0 = $10,500

Total CA cost = (hourly at 0.2×) + $10,500 = $2,969 + $10,500 = $13,469
In-house cost = $14,848
CA is cheaper by $1,379
```

**Result:** CA retainer increases from $6,000 → $10,500, but CA is STILL cheaper (by a smaller margin).

---

### Example 3: Pre-seed Company with Grants
**Scenario:** US Pre-seed, 100 shareholders, 30 option holders, 20 total grants/year

**Current (Fixed):**
```
Retainer = $6,000
Total CA cost = $8,969 (same as before, grants don't affect retainer)
In-house cost = ~$50,000 (grants add complexity)
CA is cheaper by ~$41,000
```

**New (Scaled):**
```
Base retainer = $6,000
shareholderScale = 1.4 (100 shareholders)
optionHolderScale = 1.25 (30 option holders)
grantScale = 1 + (20-3)/50 = 1 + 0.34 = 1.34
Scaled retainer = $6,000 × 1.4 × 1.25 × 1.34 = $14,070

Total CA cost = (hourly at 0.2×) + $14,070 = ~$7,000 + $14,070 = $21,070
In-house cost = ~$50,000
CA is cheaper by ~$29,000 (but by less than before)
```

**Result:** Retainer grows with grants, scaling from $6K → $14K.

---

### Example 4: Series C+ Company (Simple)
**Scenario:** US Series C+, 10 shareholders, 0 option holders, 0 grants/year

**Current (Fixed):**
```
Retainer = $60,000
Total CA cost = (hourly at 0.2×, very high) + $60,000 = ~$400,000
In-house cost = ~$47,000 (no grants, no option holders)
In-house is cheaper by ~$353,000
```

**New (Scaled):**
```
Base retainer = $60,000
shareholderScale = 1.0 (10 shareholders)
optionHolderScale = 1.0 (0 option holders)
grantScale = 1.0 (0 grants)
Scaled retainer = $60,000 × 1.0 × 1.0 × 1.0 = $60,000

Total CA cost = (hourly at 0.2×, very high) + $60,000 = ~$400,000
In-house cost = ~$47,000
In-house is cheaper by ~$353,000
```

**Result:** No change (already simple company).

---

### Example 5: Series A/B Company (Complex)
**Scenario:** US Series A/B, 150 shareholders, 40 option holders, 30 grants/year

**Current (Fixed):**
```
Retainer = $18,000
Total CA cost = (hourly at 0.2×) + $18,000 = ~$80,000
In-house cost = ~$200,000
CA is cheaper by ~$120,000
```

**New (Scaled):**
```
Base retainer = $18,000
shareholderScale = 1 + (150-20)/200 = 1 + 0.65 = 1.65
optionHolderScale = 1 + (40-5)/100 = 1 + 0.35 = 1.35
grantScale = 1 + (30-3)/50 = 1 + 0.54 = 1.54
Scaled retainer = $18,000 × 1.65 × 1.35 × 1.54 = $70,713

Total CA cost = (hourly at 0.2×) + $70,713 = ~$80,000 + $70,713 = $150,713
In-house cost = ~$200,000
CA is cheaper by ~$49,287 (but less than before)
```

**Result:** Retainer grows dramatically from $18K → $70K due to complexity.

---

## Summary Table: Current vs. New Retainers

| Scenario | Shareholders | Option Holders | Grants | Current Retainer | Scaled Retainer | Change |
|----------|--------------|----------------|--------|------------------|-----------------|--------|
| Pre-seed, simple | 10 | 0 | 0 | $6,000 | $6,000 | +0% |
| Pre-seed, yours | 100 | 30 | 0 | $6,000 | $10,500 | +75% |
| Pre-seed, complex | 100 | 30 | 20 | $6,000 | $14,070 | +135% |
| Series A/B, complex | 150 | 40 | 30 | $18,000 | $70,713 | +293% |
| Series C, simple | 10 | 0 | 0 | $60,000 | $60,000 | +0% |

---

## Key Outcomes

### What Changes?
✅ CA retainer is **higher for complex companies**
✅ CA retainer is **lower for simple companies** (unchanged)
✅ More CA costs scale with actual complexity
✅ In-house remains unchanged (no retainer)

### What Stays the Same?
✅ Simple companies still may choose CA (retainer doesn't change)
✅ The 0.2 multiplier on hourly costs stays the same
✅ In-house costs unchanged
✅ All geography retainers scale the same way

### Will CA Ever Be Cheaper?
**With Approach 2 alone:** CA could STILL be cheaper in some pre-seed scenarios.

**Example:** Pre-seed, 30 shareholders, 10 option holders, 5 grants
- Current CA: ~$7,000
- New CA: ~$8,000 (scaled retainer ~$7,000 instead of $6,000)
- In-house: ~$15,000
- CA still wins

**Solution:** If you want CA to NEVER be cheaper, you'd need to increase the scaling factors or add the hybrid approach (Approach 1 + Approach 2).

---

## Next Steps

This approach makes the retainer **fair and complexity-based**, so:
- Pre-seed startups with 10 shareholders still get the base rate
- Growing companies with 100+ shareholders pay more (because their CA firm does more work)
- Series C companies with simple equity structures don't overpay
- High-complexity scenarios are properly priced

**Should we proceed with this?** Any adjustments to the scaling factors you'd like before implementing?

