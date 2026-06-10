# Approach 2: Scaled Retainer - REAL CALCULATOR DATA

## How It Works: The Scaling Calculation

Instead of a fixed retainer, we calculate:
```
Scaled Retainer = Base Retainer × shareholderScale × optionHolderScale × grantScale
```

---

## Real Example: Your Series A/B Scenario

**Inputs:** US Series A/B, 150 shareholders, 40 option holders, 30 refresh grants/yr, 0 new hire grants/yr

### CURRENT (Fixed Retainer)

**In-house:**
```
Grant Admin: $16,832
Compliance: $4,969
Cap Table: $15,774
Retainer: $0
─────────────
TOTAL: $37,574
```

**CA Retainer:**
```
Grant Admin: $3,366
Compliance: $994
Cap Table: $3,155
Retainer: $18,000 (fixed, regardless of complexity)
─────────────
TOTAL: $25,515
```

**Result:** CA is cheaper by $12,059

---

### WITH APPROACH 2 (Scaled Retainer)

The three scaling factors multiply together:

**1. Shareholder Scale:**
```
shareholderScale = 1 + (150 - 20) / 200
                 = 1 + 130 / 200
                 = 1 + 0.65
                 = 1.65
```

**2. Option Holder Scale:**
```
optionHolderScale = 1 + (40 - 5) / 100
                  = 1 + 35 / 100
                  = 1 + 0.35
                  = 1.35
```

**3. Grant Scale:**
```
grantScale = 1 + (30 - 3) / 50
           = 1 + 27 / 50
           = 1 + 0.54
           = 1.54
```

**Final Scaled Retainer:**
```
$18,000 × 1.65 × 1.35 × 1.54 = $70,713
```

---

### RESULT WITH APPROACH 2

**In-house (unchanged):**
```
TOTAL: $37,574
```

**CA Retainer (with scaled retainer):**
```
Grant Admin: $3,366
Compliance: $994
Cap Table: $3,155
Retainer: $70,713 (scaled from $18,000)
─────────────
TOTAL: $78,228
```

**Result:** IN-HOUSE is now cheaper by $40,654 (vs CA being cheaper by $12,059)

---

## The Shift: Before vs After

| Metric | Current | With Approach 2 |
|--------|---------|-----------------|
| CA Retainer | $18,000 | $70,713 |
| CA Total Cost | $25,515 | $78,228 |
| IN-HOUSE Total | $37,574 | $37,574 |
| Winner | **CA (−$12,059)** | **IN-HOUSE (−$40,654)** |

---

## Why This Matters

In this Series A/B scenario with complex equity structure (150 shareholders, 40 option holders, 30 grants/year):
- The CA firm's actual compliance burden is high (31 hours at full rate)
- But they benefit massively from the 0.2 multiplier advantage
- By scaling the retainer, we're saying: **"More complexity = higher retainer"**
- The $70K retainer reflects the reality that managing 150 shareholders + 40 option holders + 30 annual grants is expensive

---

## Your Scenario (Pre-seed)

For comparison, with Approach 2 applied to your pre-seed scenario:

**Current:**
```
CA Retainer: $6,000
CA Total: $8,970
IN-HOUSE Total: $14,848
CA is cheaper by $5,878
```

**With Approach 2:**
```
shareholderScale = 1 + (100-20)/200 = 1.4
optionHolderScale = 1 + (30-5)/100 = 1.25
grantScale = 1 + (0-3)/50 = 1.0
Scaled Retainer = $6,000 × 1.4 × 1.25 × 1.0 = $10,500

CA Total: $8,970 + ($10,500 - $6,000) = $13,470
IN-HOUSE Total: $14,848
CA is cheaper by $1,378 (much narrower margin)
```

---

## Key Insight

**With Approach 2:**
- Simple pre-seed (10 sh, 5 oh, 0 gr): Retainer stays $6,000 → CA likely still wins
- Complex pre-seed (100 sh, 30 oh): Retainer becomes $10,500 → CA margin shrinks
- Complex Series A/B (150 sh, 40 oh, 30 gr): Retainer becomes $70,713 → IN-HOUSE wins decisively

The retainer **scales with actual complexity**, making pricing more fair and preventing CA from being "too cheap" for high-complexity scenarios.

---

## Should You Implement This?

**Pros:**
- ✅ Fair pricing based on actual work
- ✅ Makes CA never massively cheaper (no more $12K savings for complex scenarios)
- ✅ Still allows CA to be competitive for simple cases
- ✅ Customers understand why: "more shareholders = higher retainer"

**Cons:**
- ❌ CA retainers get very high for complex companies ($70K in this example)
- ❌ High-growth startups might get sticker shock
- ❌ CA remains cheaper for many pre-seed scenarios (if that's a goal)

**If you want CA to NEVER be cheaper**, you'd need to:
1. Increase scaling factors (smaller denominators = more aggressive scaling)
2. Add Approach 1 on top (20% markup on CA costs)
3. Or both (most aggressive)

---

## Next Steps

Do you want to:
1. **Implement Approach 2 as-is?** (Fair, complexity-based scaling)
2. **Implement Approach 2 + Approach 1?** (Scaled retainer + 20% markup = CA never cheaper)
3. **Adjust the scaling factors?** (More/less aggressive scaling)
4. **Something else?**

