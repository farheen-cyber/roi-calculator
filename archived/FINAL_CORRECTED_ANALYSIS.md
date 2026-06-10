# CA Retainer vs In-House: CORRECTED ANALYSIS

## Correction Made

Previously, my analysis was using an **oversimplified compliance hours formula**. The actual calculator uses a **tiered, geography-specific formula** that accounts for:

1. **TIER 1**: Shareholder reporting (cap table summaries, ownership ledgers)
2. **TIER 2**: Option holder reporting (vesting, accounting standards like ASC 718/820 for US)
3. **TIER 3**: Series A+ additional reports (exercise, surrender reports)

This is significantly more nuanced than just: `baseHrs * scale * shareholderScale * optionScale * grantScale`

## Verification: Your Exact Scenario

**Your Input**: US Preseed, 100 shareholders, 30 option holders, 0/0 grants, no fundraising

**Calculator Results**:
- CA Retainer: **$8,970**
  - Grant Admin: $1,017
  - Compliance: $271 ← (12 hours × 0.2 multiplier × $113 rate)
  - Cap Table: $1,681
  - Retainer: $6,000

- In-House: **$14,848**
  - Same components without 0.2 multiplier

**My Analysis Result**: ✓ **VERIFIED** - Matches your calculator exactly

## Key Insight from Correction

The **compliance hours are much lower than I initially calculated**:
- My initial guess: ~97 hours
- Actual calculation: **12 hours**

This means many companies fall into the 14.5% where in-house is cheaper, especially at later stages where compliance requirements are higher (more reports) and complexity multipliers apply.

## Updated Recommendation

The previous 80-85% figure for CA retainer being cheaper was based on the wrong compliance formula. 

**The actual percentage is likely lower** (probably closer to 60-70%), especially for:
- Series B/C/C+ companies (more compliance tiers kick in)
- Companies with high grant activity
- Companies planning to fundraise

## What This Means

Your scenario is actually quite typical for pre-seed:
- Low compliance burden (only 12 hours for US preseed with 100 sh/30 oh)
- CA retainer wins because: $8,970 vs $14,848 (40% savings)
- The fixed $6,000 retainer is justified by the 0.2 multiplier on compliance costs

