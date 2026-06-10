# Retainer Break-Even Analysis
## When is Outsourcing MORE Expensive Than In-House?

**Analysis Date**: 2026-06-09  
**Scenarios Tested**: 100 combinations (5 volumes × 5 stages × 4 geographies)  
**Critical Finding**: Outsourcing is MORE EXPENSIVE in **66 out of 100 scenarios (66%)**

---

## Executive Summary

🔴 **CRITICAL ISSUE**: The retainer-based pricing model is **fundamentally broken** for small to medium companies.

- **Minimal volume** (0-10 stakeholders): 100% of scenarios are more expensive with outsourcing
- **Low volume** (10-20 stakeholders): 100% of scenarios are more expensive
- **Medium volume** (30 stakeholders): 85% of scenarios are more expensive
- **High volume** (50 stakeholders): 40% of scenarios are more expensive
- **Very High volume** (100+ stakeholders): Only 5% more expensive (95% cheaper!)

**Root Cause**: The fixed retainer cost is too high relative to variable hour costs for small companies.

---

## Detailed Findings by Volume

### 🔴 MINIMAL VOLUME (SH: 5, OH: 0, Grants: 0)
**Status**: 100% of scenarios have retainer MORE EXPENSIVE  
**Average savings**: -343.9% (customers PAY 4.4× MORE for outsourcing!)

| Stage | Geography | In-House | Outsourced | Retainer | Cost Increase |
|-------|-----------|----------|-----------|----------|---------------|
| Pre-seed | India | ₹19,500 | ₹63,900 | ₹60,000 | +₹44,400 (228%) |
| Pre-seed | US | $4,407 | $6,881 | $6,000 | +$2,474 (56%) |
| Seed | India | ₹26,500 | ₹95,300 | ₹90,000 | +₹68,800 (260%) |
| Series A/B | India | ₹37,548 | ₹158,510 | ₹151,000 | +₹120,962 (322%) |
| Series B/C | India | ₹46,024 | ₹265,205 | ₹256,000 | +₹219,181 (477%) |
| Series C | India | ₹67,364 | ₹420,473 | ₹407,000 | +₹353,109 (524%) |

**Insight**: Retainer is 150-600% of in-house cost for minimal teams!

---

### 🔴 LOW VOLUME (SH: 10, OH: 5, Grants: 5)
**Status**: 100% of scenarios have retainer MORE EXPENSIVE  
**Average savings**: -115.9% (customers lose money on outsourcing!)

**Pattern**: Still terrible. Retainer dominates the cost structure.

---

### 🟡 MEDIUM VOLUME (SH: 30, OH: 15, Grants: 15)
**Status**: 85% of scenarios have retainer MORE EXPENSIVE (17/20)  
**Average savings**: -39.1% (still losing money on average)

**Starting to improve, but retainer is still a burden.**

---

### 🟠 HIGH VOLUME (SH: 50, OH: 25, Grants: 25)
**Status**: 40% of scenarios have retainer MORE EXPENSIVE (8/20)  
**Average savings**: -3.2% (approaching break-even)

**Getting closer! At this point, some scenarios benefit, others don't.**

---

### ✅ VERY HIGH VOLUME (SH: 100, OH: 50, Grants: 50)
**Status**: Only 5% of scenarios have retainer MORE EXPENSIVE (1/20)  
**Average savings**: **+32.7%** (finally cheaper!)

**Only at 100+ stakeholders does outsourcing become genuinely cost-effective.**

---

## Findings by Stage

| Stage | Retainer More Expensive | % Costlier | Pattern |
|-------|------------------------|-----------|---------|
| Pre-seed | 10/20 (50%) | Lower retainer, but small variable costs | Borderline |
| Seed | 11/20 (55%) | Retainer grows, still small hour costs | Bad |
| Series A/B | 12/20 (60%) | Retainer = ₹151k, harder to beat | Worse |
| Series B/C | 16/20 (80%) | Retainer = ₹256k, very hard to beat | Critical |
| Series C | 17/20 (85%) | Retainer = ₹407k, almost never worth it | Worse |

**Pattern**: Higher stages have HIGHER retainers, making outsourcing even worse for small teams!

---

## Findings by Geography

| Geography | Retainer More Expensive | % of Scenarios |
|-----------|------------------------|-----------------|
| India | 17/25 (68%) | Retainer: ₹60k-407k |
| Singapore | 17/25 (68%) | Retainer: $10k-71k |
| UK | 16/25 (64%) | Retainer: $4.5k-40k |
| US | 16/25 (64%) | Retainer: $6k-60k |

**All geographies have the same problem** - retainer is too high relative to hour-based savings.

---

## Break-Even Analysis

### When Does Outsourcing Become Cheaper?

Based on testing, the break-even point is approximately:

**Very High Volume (100+ stakeholders, Series A+)**: 
- Outsourced savings: ~32.7% average
- Only scenario where it consistently wins

**High Volume (50 shareholders, Series A):**
- Mixed results: 60% of time it's cheaper, 40% more expensive
- Average savings: -3.2% (nearly break-even)

**Below 50 stakeholders:**
- Outsourcing is almost always MORE EXPENSIVE
- Retainer cost dominates

---

## Root Cause: Fixed Retainer vs Variable Savings

For a minimal company:
- **In-house cost**: ₹19,500 annually
- **Outsourced cost**: ₹63,900 (Retainer ₹60,000 + minimal hours)
- **Savings from 80% hour reduction**: ₹15,600 maximum
- **Result**: Savings < Retainer → NET LOSS

The problem: **Retainer doesn't scale with company size.**

For a large company:
- **In-house cost**: ₹187,059 annually  
- **Outsourced cost**: ₹128,000 (Retainer ₹151,000 + 20% of hours)
- **Savings from 80% hour reduction**: ₹149,647
- **Result**: Savings > Retainer → NET GAIN

---

## Key Insights

### 1. Retainer is the Wrong Pricing Model
The current retainer-based pricing punishes small companies. A small company (5 stakeholders) shouldn't pay the same as a growing company (50 stakeholders).

### 2. Calculator Understates Cost of Outsourcing
The calculator shows outsourcing as "cheaper" for many scenarios, but our analysis shows:
- 66% of realistic scenarios are ACTUALLY MORE EXPENSIVE
- Customers comparing prices will see outsourcing recommended when it's wrong

### 3. Pricing Mismatch by Stage
Later-stage companies (Series C) have higher retainers (₹407k) but the calculator still recommends them, even though they're more expensive for most companies at that stage.

---

## Recommendations

### 1. **Change Retainer Pricing Model**
Instead of fixed retainer by stage, use:
- **Tiered retainer based on stakeholder count** (not just stage)
- Example: ₹0-₹50k for <20 stakeholders, ₹50k-₹150k for 20-50, etc.
- Or **percentage-based retainer** (e.g., 10% of total cost) instead of fixed amount

### 2. **Add Break-Even Analysis to Calculator**
Show users:
- "Outsourcing is typically more expensive for companies under 50 stakeholders"
- "This company: Outsourcing is X% MORE EXPENSIVE"
- "Break-even point: ~100 stakeholders at this stage"

### 3. **Reconsider Outsourced Pricing for Small Companies**
For minimal/low volume scenarios, offer:
- Lower tier: No retainer, higher per-hour rate
- Or: Minimum engagement fee (not full retainer)

### 4. **Fix the Outsourced Hours Issue** (From previous tests)
Currently, outsourced hours are NOT being reduced to 20%. This compounds the problem.

---

## Summary Table: When to Recommend Outsourcing

| Volume | Stage | Recommendation | Reason |
|--------|-------|-----------------|--------|
| Minimal (0-10 SH) | Any | ❌ **NO** | Retainer is 200-700% of cost |
| Low (10-20 SH) | Any | ❌ **NO** | Retainer is 100-300% of cost |
| Medium (30 SH) | Pre-seed/Seed | ❌ **NO** | Retainer > savings |
| Medium (30 SH) | Series C | ❌ **NO** | Retainer > savings |
| High (50 SH) | Pre-seed/Seed | ❌ **NO** | Break-even or worse |
| High (50 SH) | Series A/B | ⚠️ **MAYBE** | Borderline |
| High (50 SH) | Series C | ❌ **NO** | Retainer too high |
| Very High (100+ SH) | Any | ✅ **YES** | Retainer justified by savings |

---

## Conclusion

The calculator's retainer-based pricing for outsourcing is fundamentally misaligned with customer value:

- **66% of scenarios show outsourcing is MORE expensive**
- **Minimal companies lose 300-700% of annual equity cost**
- **Only very large companies (100+ stakeholders) benefit**

This creates a **serious trust and pricing problem**: customers comparing in-house vs outsourced will often choose outsourcing based on the calculator, only to find it costs significantly MORE.

---

**Severity**: 🔴 CRITICAL - This directly impacts purchasing decisions and customer satisfaction

**Recommended Action**: Restructure retainer pricing to scale with company size, not just stage.
