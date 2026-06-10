# ROI Calculator Testing Guide
**Testing Framework Based on Rishabh's Principles**

---

## EXECUTIVE SUMMARY

This guide teaches you how to systematically test the ROI calculator using **scenario-based testing with progressive complexity**. Rather than following exact test cases, you'll learn the **underlying principles** and apply them to create your own test scenarios that validate the calculator's core logic.

**Core Testing Principle**: Change ONE variable at a time, measure the impact, verify it matches the expected formula, then build complexity progressively.

---

## PART 1: CORE TESTING PRINCIPLES

### Principle 1: Understand the Calculator Architecture

The ROI calculator has **5 interconnected components**:

1. **Input Processing** — How the form handles company profiles
2. **Calculation Logic** — Mathematical formulas that produce outputs
3. **Feature Interactions** — How toggling features affects other fields
4. **Geographic Variations** — How jurisdiction changes compliance & rates
5. **Scale Behavior** — How costs change as company grows

Every test should validate at least one of these components.

---

### Principle 2: Use Progressive Complexity

Test in this order:
1. **Minimal inputs** (baseline) — Understand what costs ALWAYS exist
2. **Single variable change** — Isolate the impact of one input
3. **Geographic variants** — Test same scenario across 2-3 jurisdictions
4. **Scale variants** — Test same scenario at small/medium/large company sizes
5. **Feature combinations** — Test multiple features enabled together

**Why this order?** You can't understand feature interactions if you don't know what the baseline looks like.

---

### Principle 3: Validation Through Calculation

For every scenario you test:
1. **Predict the output** using the calculator's logic
2. **Run the scenario** in the calculator
3. **Compare actual vs predicted**
4. **If they don't match**, identify which formula might be wrong

Example: If outsourced cost should be `(total_hours × 0.2 × rate) + retainer`, manually calculate what that should be, then check if the calculator matches.

---

## PART 2: CREATING YOUR OWN TEST SCENARIOS

### Template: Single Variable Test

Use this format when testing how ONE input affects the output:

```
Test Name: [Clear name describing what you're testing]

Hypothesis: When I change [input X], the [output Y] should [change in this specific way]

Setup (Baseline):
- Geography: [country]
- Stage: [pre-seed/seed/series-a/etc]
- Shareholders: [number]
- Option holders: [number]
- New hire grants: [number]
- Refresh grants: [number]
- Admin method: [in-house/outsourced]
- Fundraising: [enabled/disabled]
- Valuations: [enabled/disabled]

Variation:
- Change [ONE INPUT] from [value A] to [value B]
- Keep everything else identical

Expected Impact:
- [Output Y] should change from [expected value 1] to [expected value 2]
- Reason: [explain which formula/logic explains this change]

Actual Result:
- Calculator shows: [what you observed]
- Matches expectation? [YES/NO]

If NO - Debugging:
- What was the difference?
- Which formula might be wrong?
- What variable assumption might be incorrect?
```

---

### Template: Scenario Comparison Test

Use this format when comparing two scenarios:

```
Test Name: [Comparison between scenario A and B]

Scenario A (Baseline):
[Fill in all inputs]

Scenario B (Variation):
[Fill in all inputs - change only the variables you care about]

Expected Ratio/Difference:
- Scenario A cost: $X
- Scenario B cost: $Y
- Expected relationship: [describe what SHOULD happen]
- Why: [explain the business logic]

Actual Result:
- Scenario A calculator shows: $X_actual
- Scenario B calculator shows: $Y_actual
- Actual relationship: [what you observed]

Analysis:
- Does the relationship match expectations? [YES/NO]
- If the magnitude changed, was it proportional? [percentage change should match formula]
```

---

## PART 3: TESTING PATTERNS YOU SHOULD FOLLOW

### Pattern A: Boundary Testing (Test Extreme Values & Field Dependencies)

**Goal**: Verify that edge cases are handled correctly and field dependencies work as designed

**Key Formulas to Test**:
- Option holders = 0 should trigger: refresh grants field = LOCKED/DISABLED
- Grant admin hours = grant_count × 1.5 hours
- Stakeholder pricing = (shareholders + option holders + new_hires) × base_price_per_stakeholder

**How to apply**:

**Test A1: Zero Option Holders Disables Refresh Grants**
```
Setup:
- Country: India
- Stage: Seed
- Shareholders: 10
- Option holders: 0 ← KEY TEST
- New hire grants: 0
- Refresh grants: [should be locked/disabled]
- Admin method: In-house

Expected: Refresh grants field should be disabled/readonly/auto-zeroed
Verify: Try to enter a refresh grant value when OH = 0. Can you? Should you be able to?
```

**Test A2: Adding 1 Option Holder Enables Refresh Grants**
```
Same setup, but change Option holders: 0 → 1

Expected: Refresh grants field should now be enabled and editable
Verify: Can you now edit the refresh grants field?
```

**Test A3: Grant Hours Scale Linearly with Count**
```
Scenario 1:
- New hire grants: 10
- Refresh grants: 0
- Expected grant hours: (10 + 0) × 1.5 = 15 hours

Scenario 2 (same setup, increase new hires):
- New hire grants: 20
- Refresh grants: 0
- Expected grant hours: (20 + 0) × 1.5 = 30 hours

Verify: Does doubling the grants double the hours?
Check the cost line item for "Grant Admin" - it should match hours × blended_rate
```

**Test A4: Stakeholder Pricing Calculation**
```
Setup: US, Series A
- Shareholders: 15
- Option holders: 10
- New hire grants: 5
- Total stakeholders: 15 + 10 + 5 = 30

Expected "Platform/Stakeholder Pricing" cost: 
- If base price = $1,200/year per stakeholder
- Cost = 30 × $1,200 = $36,000/year

Verify: 
- Look for a line item for "Stakeholder pricing" or "Platform pricing"
- Does it match 30 × [base price]?
- If you change one input (e.g., OH from 10 → 15), does the total increase by 5 × $1,200?
```

**Test A5: Minimum Cost Scenario (All Zeros)**
```
Setup:
- Country: India
- Stage: Pre-seed
- Shareholders: 0
- Option holders: 0
- New hire grants: 0
- Refresh grants: 0
- Admin method: In-house
- Fundraising: Disabled
- Valuations: Disabled

Expected: Cost should show only minimum compliance/admin overhead (no equity activity)
Verify: What's the minimum cost shown? Is it non-zero? (It should be—there's always baseline admin)
```

**Test A6: Adding 1 Shareholder**
```
Change only: Shareholders: 0 → 1 (everything else minimal)

Expected impact: 
- Cap table cost should increase (baseline = 3 hrs/month × 12 = 36 hours)
- Shareholder scaling should activate if we reach certain thresholds
- Cost should increase noticeably

Verify: Does cost increase? By roughly how much?
```

**What you're looking for**:
- Does the calculator allow 0 values where they make sense?
- Do costs scale linearly when they should (like grant hours)?
- Does option holders = 0 actually lock the refresh grants field?
- Is stakeholder pricing calculated correctly as (SH + OH + new_hires) × price?
- Do individual components (grant admin, platform pricing, cap table) appear as separate line items?

---

### Pattern B: Geographic Testing (Test Jurisdiction Variations & Rate Multipliers)

**Goal**: Verify that incorporation country properly controls blended rates, compliance rules, and retainer costs

**Key Formulas to Test**:
- Blended hourly rate varies by geography (geo_inc controls this)
- Retainer cost = STAGE_RETAINER[geography][stage] (for outsourced only)
- All hours-based costs = hours × blended_rate

**How to apply**:

**Test B1: Blended Rate Comparison Across Geographies**
```
Baseline Scenario (same for all):
- Stage: Series A
- Shareholders: 30
- Option holders: 15
- New hire grants: 15
- Refresh grants: 10
- Admin method: In-house
- Fundraising: Disabled
- Valuations: Disabled

Run 3 times, changing ONLY country:

Version 1 - India:
- Expected: Lower blended rate (e.g., ₹1,200-1,500/hr)
- Record total cost

Version 2 - US:
- Expected: Higher blended rate (e.g., $80-120/hr)
- Record total cost

Version 3 - Singapore (or UK):
- Expected: Medium-to-high blended rate
- Record total cost

Verification:
- Calculate the total grant hours: (15 + 10 + 15) × 1.5 = 60 hours
- Calculate the total cost from those hours alone: 60 × [blended_rate]
- Find that line item in the cost breakdown
- Does it match your calculation?
- Is US cost meaningfully higher than India? (Should be 3-5× higher)
```

**Test B2: Retainer Cost Changes by Geography (Outsourced Method Only)**
```
Baseline Scenario (same as B1):
- Admin method: OUTSOURCED (not in-house)
- Everything else same

Version 1 - India:
- Expected retainer: STAGE_RETAINER[india][series-a] (e.g., ₹256,000/year)
- Record: Look for "CA Retainer" or "Outsourced Retainer" line item
- Record cost

Version 2 - US:
- Expected retainer: STAGE_RETAINER[us][series-a] (e.g., $3,000-5,000/year)
- Record cost

Verification:
- Is there a visible "Retainer" or "Fixed outsourcing cost" line item?
- Does the retainer change when you change geography?
- Is the retainer missing when you use "In-house"?
- Is the retainer present and non-zero when you use "Outsourced"?
```

**Test B3: Total Cost Should Scale Proportionally**
```
Same setup as B1, three geographies

After recording all three:
- Calculate ratio: US_cost / India_cost
- Expected: Should be roughly 3-5× (not 10× or 1.5×)
- Reason: If every hour cost 5× more, and hours stay same, cost should be 5× more

Verification:
- Is the ratio reasonable?
- If the ratio is unexpected, which component varies? (Rate? Hours? Fixed costs?)
```

**Test B4: Compliance Rules by Geography** (Optional - if documentation available)
```
Setup:
- Stage: Series A
- Option holders: 10 (triggers Tier 2 compliance)
- Other fields minimal

Version 1 - India:
- Expected compliance: India-specific rules (e.g., registered valuer, equity compliance)
- Look for compliance cost/hours

Version 2 - US:
- Expected compliance: US-specific rules (e.g., Rule 701, ASC 718)
- Look for compliance cost/hours

Verification:
- Are different compliance rules applied for each country?
- Or is the cost difference just due to labor rate?
- (This is harder to verify without the code, but the hours might be different)
```

**What you're looking for**:
- Does blended rate increase from India → US → developed markets?
- Do retainer costs exist only when outsourced AND scale with geography?
- Is the total cost difference primarily driven by hourly rate or also by compliance differences?
- Does changing geography NOT change shareholder count, hours, or other logic—only the rate?

**Note**: Don't test with mixed geography (incorporation in one country, operations in another) until you understand single-geography behavior first.

---

### Pattern C: Stage Progression Testing

**Goal**: Verify that funding stage correctly affects blended rates, compliance scaling, and retainer costs

**Key Formulas to Test**:
- Blended rate increases with stage (preseed < seed < series-a < series-b < series-c)
- Retainer cost scales by stage (outsourced only): STAGE_RETAINER[geo][stage]
- Compliance scaling factor: 1 + max(0, (option_holders - 5) / 50)
- Shareholder scaling factor: 1 + max(0, (shareholders - 20) / 100) × 0.5

**How to apply**:

**Test C1: Blended Rate Increases with Stage**
```
Standard Company Profile:
- Country: India (consistent)
- Shareholders: 20
- Option holders: 10
- New hire grants: 10
- Refresh grants: 5
- Admin method: In-house
- Fundraising: Disabled

Run 4 times, changing ONLY stage:

Version 1 - Pre-seed:
- Record total cost: $X1
- Record blended rate if visible: $Y1/hr

Version 2 - Seed:
- Record total cost: $X2
- Record blended rate if visible: $Y2/hr
- Expected: $X2 > $X1 (cost increases)
- Expected: $Y2 > $Y1 (rate increases)

Version 3 - Series A:
- Record total cost: $X3
- Expected: $X3 > $X2

Version 4 - Series B:
- Record total cost: $X4
- Expected: $X4 > $X3

Verification:
- Is cost strictly increasing from pre-seed to series-b?
- Calculate the ratio: Series_A_rate / Pre_seed_rate
  - Expected: Roughly 1.5x - 2.5x (not 10x, not 1.1x)
- Is the increase proportional across stages?
```

**Test C2: Retainer Cost Scales with Stage (Outsourced)**
```
Standard Company Profile (same as C1):
- Admin method: OUTSOURCED (not in-house)

Run 4 times, changing ONLY stage:

Version 1 - Pre-seed:
- Look for "Retainer" or "Fixed Cost" line item
- Record amount: $R1

Version 2 - Seed:
- Record retainer: $R2
- Expected: $R2 > $R1

Version 3 - Series A:
- Record retainer: $R3
- Expected: $R3 > $R2

Version 4 - Series B:
- Record retainer: $R4
- Expected: $R4 > $R3

Verification:
- Is the retainer strictly increasing by stage?
- Calculate ratios: R2/R1, R3/R2, R4/R3
  - Expected: Each step is roughly 1.2x - 1.5x higher
- When you switch to "In-house", does the retainer disappear?
```

**Test C3: Compliance Scaling Factor Applies Correctly**
```
Setup for option holders = 10:
- Compliance scaling factor = 1 + max(0, (10 - 5) / 50)
                              = 1 + (5 / 50)
                              = 1 + 0.1 = 1.1×

Test across stages:
- Pre-seed: Base compliance hours × 1.1 multiplier
- Series A: Base compliance hours × 1.1 multiplier

Expected: The multiplier should be the same (1.1×) for all stages—only the base hours change by stage

Verification:
- If you see a compliance line item, does it have the same scaling across stages?
- To verify: 
  - Assume base compliance = X hours
  - Actual shown = X × 1.1
  - When you change stage, the multiplier should stay 1.1× (only X changes)
```

**Test C4: Shareholder Scaling with Stage**
```
Setup: Keep same shareholder count (20) across stages

Shareholder scaling factor = 1 + max(0, (shareholders - 20) / 100) × 0.5

With SH = 20: scaling = 1 + max(0, (20 - 20) / 100) × 0.5 = 1 + 0 = 1.0× (NO scaling)

Expected behavior:
- Pre-seed with 20 SH: No shareholder scaling factor
- Series A with 20 SH: No shareholder scaling factor (stage doesn't affect this formula)

Now test with SH = 50:
- Scaling = 1 + max(0, (50 - 20) / 100) × 0.5
           = 1 + (30 / 100) × 0.5
           = 1 + 0.15 = 1.15×

Change setup to: Shareholders: 50, Stages: Pre-seed, Seed, Series A

Expected: Each stage should apply 1.15× multiplier (multiplier doesn't change by stage)

Verification:
- Is there a "Shareholder Scaling" factor visible?
- If you increase shareholders from 20 → 50, does a multiplier kick in?
- Does the multiplier stay the same across stages?
```

**What you're looking for**:
- Does blended rate increase monotonically from pre-seed to series-b?
- Is the increase proportional (not 10x jump, not 1% jump)?
- Does retainer cost exist only for outsourced, and scale by stage?
- Do compliance and shareholder scaling multipliers apply consistently across stages?
- Does changing stage NOT affect shareholder/option holder counts or grant volumes?

---

### Pattern D: Volume Scaling Testing

**Goal**: Verify that costs scale correctly as stakeholder and grant volumes increase

**Key Formulas to Test**:
- Grant hours = (new_hires + refresh_grants) × 1.5 hours (LINEAR)
- Stakeholder pricing = (shareholders + option_holders + new_hires) × base_price (LINEAR)
- Shareholder scaling = 1 + max(0, (shareholders - 20) / 100) × 0.5 (NON-LINEAR)
- Option holder scaling = 1 + max(0, (option_holders - 5) / 50) (NON-LINEAR)

**How to apply**:

**Test D1: Grant Hours Scale Linearly**
```
Scenario 1:
- New hire grants: 10
- Refresh grants: 5
- Expected grant hours: (10 + 5) × 1.5 = 22.5 hours
- At ₹1,500/hr: 22.5 × 1,500 = ₹33,750 grant admin cost

Scenario 2 (double the grants):
- New hire grants: 20
- Refresh grants: 10
- Expected grant hours: (20 + 10) × 1.5 = 45 hours
- At ₹1,500/hr: 45 × 1,500 = ₹67,500 grant admin cost

Verification:
- Is the cost exactly doubled when grants double? (Should be linear)
- Look for "Grant Admin" line item
- Does it match your calculation?
```

**Test D2: Stakeholder Pricing Scales Linearly**
```
Scenario 1:
- Shareholders: 10
- Option holders: 10
- New hire grants: 10
- Total: 30 stakeholders
- Expected pricing: 30 × $1,200 = $36,000

Scenario 2 (double stakeholders):
- Shareholders: 20
- Option holders: 20
- New hire grants: 20
- Total: 60 stakeholders
- Expected pricing: 60 × $1,200 = $72,000

Verification:
- Does "Stakeholder Pricing" or "Platform Pricing" line item double when stakeholders double?
- Is the relationship linear?
```

**Test D3: Shareholder Scaling Factor (NON-LINEAR)**
```
Formula: scaling_factor = 1 + max(0, (shareholders - 20) / 100) × 0.5

Test Points:
Scenario A - 20 shareholders:
  - Scaling = 1 + max(0, (20 - 20) / 100) × 0.5 = 1.0×
  
Scenario B - 50 shareholders:
  - Scaling = 1 + max(0, (50 - 20) / 100) × 0.5 = 1.15×
  
Scenario C - 100 shareholders:
  - Scaling = 1 + max(0, (100 - 20) / 100) × 0.5 = 1.40×
  
Scenario D - 200 shareholders:
  - Scaling = 1 + max(0, (200 - 20) / 100) × 0.5 = 1.90×

Calculation method:
- Cap table base hours = 3 hours/month × 12 = 36 hours
- Cap table cost (Scenario B) = 36 × 1.15 × blended_rate
- Cap table cost (Scenario C) = 36 × 1.40 × blended_rate
- Ratio C/B = 1.40 / 1.15 = 1.22× (not exactly double, even though shareholders doubled)

Verification:
- Look for "Cap Table" cost line item
- When you increase shareholders from 20 → 50, the cost should increase by ~15% (the 1.15× multiplier)
- When you increase from 50 → 100, the cost should increase by ~22% more
- Is the increase non-linear? (Doubling shareholders doesn't double the cost)
```

**Test D4: Option Holder Scaling Factor (NON-LINEAR)**
```
Formula: scaling_factor = 1 + max(0, (option_holders - 5) / 50)

Test Points:
Scenario A - 5 option holders:
  - Scaling = 1 + max(0, (5 - 5) / 50) = 1.0×
  
Scenario B - 25 option holders:
  - Scaling = 1 + max(0, (25 - 5) / 50) = 1 + 0.4 = 1.4×
  
Scenario C - 55 option holders:
  - Scaling = 1 + max(0, (55 - 5) / 50) = 1 + 1.0 = 2.0×
  
Scenario D - 105 option holders:
  - Scaling = 1 + max(0, (105 - 5) / 50) = 1 + 2.0 = 3.0×

Calculation method:
- Assume compliance base = 50 hours (Tier 2 for equity)
- Compliance cost (Scenario B) = 50 × 1.4 × blended_rate = 70 hours equivalent
- Compliance cost (Scenario C) = 50 × 2.0 × blended_rate = 100 hours equivalent
- Ratio C/B = 2.0 / 1.4 = 1.43× (not exactly double, even though OH doubled)

Verification:
- Look for "Compliance" cost line item when option holders > 0
- When you increase OH from 5 → 25, cost should increase by ~40% (1.4× multiplier)
- When you increase from 55 → 105 (double), cost should increase by 50% (from 2.0× to 3.0×)
- Is the increase non-linear?
```

**Test D5: Volume Comparison (All Together)**
```
Low Volume:
- Shareholders: 10
- Option holders: 5
- New hire grants: 5
- Refresh grants: 5
- Total cost: $X_low

Medium Volume:
- Shareholders: 50
- Option holders: 25
- New hire grants: 25
- Refresh grants: 25
- Total cost: $X_medium

High Volume:
- Shareholders: 100
- Option holders: 50
- New hire grants: 50
- Refresh grants: 50
- Total cost: $X_high

Verification:
- Is X_medium roughly 2.5-3× X_low? (Not 5×, not 1.5×)
- Is X_high roughly 3-4× X_low? (Not 10×, not 2×)
- The increase should be dampened by the non-linear scaling factors
```

**What you're looking for**:
- Grant hours should scale exactly linear (2× grants = 2× hours)
- Stakeholder pricing should scale exactly linear (2× stakeholders = 2× cost for that component)
- Shareholder and option holder scaling factors should NOT be linear—the scaling multiplier increases, but the total cost doesn't increase proportionally
- Total cost should increase less than the volume increase (economies of scale)

---

### Pattern E: Feature Toggle Testing (Fundraising & Valuations)

**Goal**: Verify that optional features cleanly add/remove costs and apply the correct multipliers

**Key Formulas to Test**:
- Fundraising cap table workflows = 3 workflows × 2.5 hours × round_complexity_multiplier
- Fundraising secretarial workflows = 3 workflows × 2.5 hours × round_complexity_multiplier
- Round complexity multipliers: Seed = 1.0×, Series A = 1.5×, Series C = 2.5×
- Valuation cost = market_price × frequency_multiplier × [EquityList_discount if applicable]
- Frequency multipliers: Annually = 1×, Quarterly = 4×

**How to apply**:

**Test E1: Fundraising Cost Appears Only When Enabled**
```
Base Scenario:
- Country: India
- Stage: Series A
- Shareholders: 30
- Option holders: 15
- New hire grants: 15
- Fundraising: DISABLED
- Valuations: DISABLED

Variation 1 - With Fundraising Enabled:
- Change to: Fundraising: ENABLED
- Round type: Seed (1.0× complexity)
- Months until round: 6

Expected cost change:
- Cap table workflows: 3 × 2.5 × 1.0 = 7.5 hours
- Secretarial workflows: 3 × 2.5 × 1.0 = 7.5 hours
- Total fundraising hours: 15 hours (for ~6 months of activity)
- Cost: 15 × blended_rate

Verification:
- Record cost WITHOUT fundraising: $X_base
- Record cost WITH fundraising: $X_with_fr
- Difference: $X_with_fr - $X_base
- Should be roughly 15 × blended_rate
- Does it match?
```

**Test E2: Fundraising Complexity Multiplier**
```
Use same scenario as E1, but test THREE round types:

Scenario A - Seed Round:
- Round type: Seed
- Complexity multiplier: 1.0×
- Expected fundraising cost: 15 × 1.0 = 15 hours equivalent
- Record total cost: $X_seed

Scenario B - Series A Round:
- Round type: Series A
- Complexity multiplier: 1.5×
- Expected fundraising cost: 15 × 1.5 = 22.5 hours equivalent
- Record total cost: $X_seriesA

Scenario C - Series C Round:
- Round type: Series C
- Complexity multiplier: 2.5×
- Expected fundraising cost: 15 × 2.5 = 37.5 hours equivalent
- Record total cost: $X_seriesC

Verification:
- Ratio B/A should be 1.5× (not exactly, because of rounding, but close)
- Ratio C/A should be 2.5×
- Are the differences proportional to the complexity multipliers?
```

**Test E3: Valuation Cost with Frequency Multiplier**
```
Base Scenario (same as E1):
- Valuations: DISABLED

Variation 1 - Annual Valuation:
- Valuations: ENABLED
- Valuation type: 409A (or similar, stage appropriate)
- Frequency: ANNUALLY

Expected:
- Market price: Look up from VALUATION_PRICING[type][stage] (e.g., $1,890 for 409A)
- EquityList discount: 20% off
- EquityList cost: $1,890 × 0.8 = $1,512
- Frequency multiplier: 1× (annually)
- Annual impact: $1,512 × 1 = $1,512

Record cost: $X_annual

Variation 2 - Quarterly Valuation (same type, frequency changed):
- Frequency: QUARTERLY

Expected:
- EquityList cost: $1,512 (same as annual)
- Frequency multiplier: 4× (quarterly)
- Annual impact: $1,512 × 4 = $6,048

Record cost: $X_quarterly

Verification:
- Difference: $X_quarterly - $X_annual should be roughly ($1,512 × 3)
- Is it approximately $4,536 more per year?
- Does changing frequency to quarterly multiply the cost by ~4×?
```

**Test E4: Valuation Cost Appears as Separate Line Item**
```
Setup:
- Valuations: ENABLED
- Valuation type: 409A Valuation
- Frequency: Annually

Verification:
- Look for a "Valuation" or "409A Valuation" line item
- Cost shown: Should be EquityList cost (market price × 0.8) × frequency
- Is the 20% discount applied? (Cost should be 80% of market rate, not 100%)
- When you disable valuations, does this line item disappear?
```

**Test E5: Fundraising + Valuations Interaction (Feature Stacking)**
```
Scenario A - Base (no features):
- Fundraising: DISABLED
- Valuations: DISABLED
- Cost: $X_base

Scenario B - +Fundraising:
- Fundraising: ENABLED (Seed round)
- Valuations: DISABLED
- Cost: $X_base + ~15hr × rate = $X_fr

Scenario C - +Valuations:
- Fundraising: DISABLED
- Valuations: ENABLED (Annual 409A)
- Cost: $X_base + $1,512 = $X_val

Scenario D - +Both:
- Fundraising: ENABLED (Seed round)
- Valuations: ENABLED (Annual 409A)
- Cost: Should be approximately $X_base + 15hr × rate + $1,512

Verification:
- Does $X_fr ≈ $X_base + fundraising_cost?
- Does $X_val ≈ $X_base + valuation_cost?
- Does $X_both ≈ $X_fr + valuation_cost (or equivalently, $X_val + fundraising_cost)?
- Features should be additive, not multiplicative
- If $X_both is much larger than expected, something might be interacting unexpectedly
```

**Test E6: New Shareholders from Fundraising (Interaction Check)**
```
Scenario A - Without Fundraising:
- Shareholders: 30
- Expected shareholder scaling: 1 + max(0, (30 - 20) / 100) × 0.5 = 1.05×

Scenario B - With Fundraising (Series A round):
- Shareholders: 30 (original)
- New shareholders from round: 8 (configured)
- Expected shareholder scaling: 1 + max(0, ((30 + 8) - 20) / 100) × 0.5 = 1.09×

Verification:
- Does enabling fundraising increase the effective shareholder count for compliance scaling?
- If you set "Expected new shareholders from round" = 0, does scaling go back to 1.05×?
- Is compliance cost affected by the new shareholders?

Note: This IS a feature interaction, not a bug. Fundraising should increase complexity if new shareholders are expected.
```

**What you're looking for**:
- Does fundraising add cost only when enabled?
- Do different round types show different costs (Seed < Series A < Series C)?
- Do valuation costs scale by frequency (Quarterly = 4× Annual)?
- Is the 20% EquityList discount applied to valuations?
- Do fundraising and valuation costs stack additively?
- Does enabling fundraising with new shareholders increase compliance scaling?

---

### Pattern F: Method Comparison Testing (In-house vs Outsourced)

**Goal**: Verify that the outsourced method correctly applies the 0.2 multiplier and adds retainer costs

**Key Formulas to Test**:
- In-house cost = total_hours × blended_rate × 1.0 (no multiplier)
- Outsourced cost = (total_hours × blended_rate × 0.2) + STAGE_RETAINER[geo][stage]
- The 0.2 multiplier means: 20% internal effort, 80% outsourced to CA/firm
- Retainer is FIXED per stage/geography (doesn't scale with hours)

**How to apply**:

**Test F1: Basic In-house vs Outsourced Comparison**
```
Scenario Setup (same for both):
- Country: India
- Stage: Series A
- Shareholders: 30
- Option holders: 15
- New hire grants: 15
- Refresh grants: 10
- Fundraising: DISABLED
- Valuations: DISABLED

Run TWICE, changing ONLY admin method:

Version 1 - IN-HOUSE:
- Record total cost: $X_inhouse
- Verify: No retainer cost shown
- Verify: All hours are charged at full blended_rate

Version 2 - OUTSOURCED:
- Record total cost: $X_outsourced
- Record retainer cost if visible: $R
- Expected: $X_outsourced < $X_inhouse (outsourced should be cheaper)

Manual verification of formula:
Step 1: Calculate total hours
- Grant hours: (15 + 10 + 15) × 1.5 = 52.5 hours
- Cap table hours: 36 hours (base, no complexity adjustment for now)
- Compliance hours: ~50 hours (Tier 2 baseline)
- Total: ~138.5 hours (approximate)

Step 2: Calculate in-house cost
- Assume blended rate = ₹1,500/hour
- In-house = 138.5 × 1,500 = ₹207,750

Step 3: Calculate outsourced cost
- Internal hours (20%): 138.5 × 0.2 = 27.7 hours
- Internal cost: 27.7 × 1,500 = ₹41,550
- Retainer: Assume ₹150,000 for Series A India
- Outsourced total: ₹41,550 + ₹150,000 = ₹191,550

Expected difference: ₹207,750 - ₹191,550 = ₹16,200 savings

Verification:
- Does $X_outsourced ≈ ₹191,550?
- Is there a visible retainer cost around ₹150,000?
- Is the difference between in-house and outsourced reasonable?
```

**Test F2: Retainer Cost Exists Only for Outsourced**
```
Setup (same as F1):

Version 1 - IN-HOUSE:
- Look for "Retainer", "CA Retainer", "Fixed Outsourcing Cost", or similar line item
- Expected: NONE (should not be visible)

Version 2 - OUTSOURCED:
- Look for "Retainer", "CA Retainer", "Fixed Outsourcing Cost"
- Expected: VISIBLE with non-zero amount (e.g., ₹150,000)

Verification:
- Does in-house show NO retainer?
- Does outsourced show a retainer?
- When you toggle between methods, does the retainer appear/disappear?
```

**Test F3: Internal Hours Are 20% of Total**
```
Setup (same as F1):

Total hours = 138.5 (from calculation above)
Expected internal hours (20%): 138.5 × 0.2 = 27.7 hours

If you can see a breakdown:
- Look for "Internal Team Hours" or similar line item
- Expected: ~27.7 hours (for outsourced method)
- Expected: 138.5 hours (for in-house method)

Verification:
- Is internal cost = internal_hours × blended_rate?
- Is internal_hours = 20% of total?
```

**Test F4: Retainer Varies by Stage (Outsourced Only)**
```
Use base scenario (India, Stage = Series A) with OUTSOURCED method:

Version 1 - Pre-seed:
- Record retainer: $R_preseed

Version 2 - Series A:
- Record retainer: $R_seriesA
- Expected: $R_seriesA > $R_preseed

Version 3 - Series C:
- Record retainer: $R_seriesC
- Expected: $R_seriesC > $R_seriesA

Verification:
- Is retainer strictly increasing by stage?
- Ratios should be roughly 1.2x-1.5x per stage jump
- When you switch to in-house, do retainers disappear?
```

**Test F5: Outsourced Becomes More Cost-Effective at Higher Volumes**
```
Setup (India, Series B, OUTSOURCED):

Scenario A - Low Volume:
- Shareholders: 10
- Option holders: 5
- New hire grants: 5
- Refresh grants: 2
- Record in-house cost: $X_in_low
- Record outsourced cost: $X_out_low
- Calculate savings: $X_in_low - $X_out_low = $Savings_low

Scenario B - High Volume (same fields, but larger):
- Shareholders: 50
- Option holders: 25
- New hire grants: 25
- Refresh grants: 20
- Record in-house cost: $X_in_high
- Record outsourced cost: $X_out_high
- Calculate savings: $X_in_high - $X_out_high = $Savings_high

Verification:
- At low volume: Outsourced might be only 5-10% cheaper (retainer is significant)
- At high volume: Outsourced might be 30-40% cheaper (internal hours cost becomes significant)
- Is $Savings_high > $Savings_low? (Outsourcing becomes more attractive at scale)
- Why? Because retainer is fixed, but internal hours grow with volume
```

**Test F6: Outsourced Still Includes 20% Internal Work**
```
Setup: Series A India, OUTSOURCED

Increase complexity: Shareholders 30 → 50 (while keeping outsourced)

Expected behavior:
- Retainer should stay FIXED (₹150,000)
- Internal hours should increase by 20% of new work
- Total cost should increase, but less than in-house would increase

Calculation:
- In-house would increase by: (new_hours - old_hours) × blended_rate × 1.0
- Outsourced increases by: (new_hours - old_hours) × blended_rate × 0.2
- Ratio: Outsourced increase / In-house increase = 0.2 / 1.0 = 20% (outsourced cost grows at 20% the rate)

Verification:
- When you increase complexity, does outsourced cost increase less than in-house?
- Is the increase ratio roughly 20% for the variable hours component?
```

**What you're looking for**:
- Is outsourced cost = (internal_hours × rate) + retainer?
- Are internal hours exactly 20% of total hours?
- Does retainer exist only for outsourced method?
- Does retainer increase with stage?
- Does outsourced cost increase more slowly than in-house when complexity increases?
- Is outsourced actually cheaper? (It should be for most scenarios)

---

## PART 4: DEBUGGING WHEN NUMBERS DON'T MATCH

### If Your Predicted Cost Doesn't Match the Calculator

**Step 1: Identify What's Different**
- Difference amount: $X (show the calculation)
- Percentage difference: (actual - predicted) / predicted × 100%

**Step 2: Check Your Assumption**
- Re-read the formula in the code or PRD
- Did you miss a multiplier? (e.g., 0.2 for outsourced)
- Did you miss a scaling factor? (e.g., compliance has a scaling formula based on shareholder count)
- Did you miss a fixed cost? (e.g., retainer for outsourced)

**Step 3: Narrow Down the Component**
- Is the difference in grant admin? → Check hours × rate calculation
- Is the difference in compliance? → Check if there's a scaling factor on hours
- Is the difference in cap table? → Check if there's a fixed base + scaling
- Is the difference in valuation? → Check if frequency multiplier was applied

**Step 4: Test Isolation**
- Create a VERY simple scenario (e.g., just 0 of everything, then add ONE component)
- Test that component in isolation to verify its formula
- Example: Set everything to 0, then add 1 shareholder → should show ONLY the compliance cost for 1 shareholder, nothing else

**Step 5: Document the Bug**
- What inputs did you use?
- What did the calculator show?
- What should it have shown (with manual calculation)?
- What formula or code is likely wrong?

---

## PART 4B: FORMULA REFERENCE CHECKLIST

**Quick Reference: Every Formula That Must Be Tested**

Use this section alongside the patterns above. When you find a discrepancy, check which formula might be wrong.

### Grant & Equity Administration
- [ ] **Grant Admin Hours** = (new_hire_grants + refresh_grants) × 1.5 hours
  - Test: D1 (Pattern D)
  - Verify linear scaling: 2× grants = 2× hours

- [ ] **Option Holders Field Lock** = When option_holders = 0, refresh_grants field disabled
  - Test: A2 (Pattern A)
  - Verify: Can't edit refresh grants when OH = 0

- [ ] **Stakeholder Pricing** = (shareholders + option_holders + new_hire_grants) × price_per_stakeholder
  - Test: A4, D2 (Pattern A, D)
  - Verify linear scaling: 2× stakeholders = 2× pricing cost

### Scaling Factors (Non-Linear)
- [ ] **Shareholder Scaling Factor** = 1 + max(0, (shareholders - 20) / 100) × 0.5
  - Test: C4, D3 (Pattern C, D)
  - Triggers at: shareholders > 20
  - Verify: Non-linear (doubling SH doesn't double the multiplier)

- [ ] **Option Holder Scaling Factor** = 1 + max(0, (option_holders - 5) / 50)
  - Test: C3, D4 (Pattern C, D)
  - Triggers at: option_holders > 5
  - Verify: Non-linear scaling

### Hours-Based Costs
- [ ] **Cap Table Hours** = 3 hours/month × 12 months = 36 hours baseline
  - Then multiply by shareholder_scaling_factor
  - Test: C4 (Pattern C)

- [ ] **Compliance Hours (Tier 2)** = Baseline hours × option_holder_scaling_factor
  - Tier 2 triggered when: option_holders > 0
  - Test: C3 (Pattern C)

- [ ] **Fundraising Cap Table Workflows** = 3 workflows × 2.5 hours × round_complexity_multiplier
  - Test: E1, E2 (Pattern E)

- [ ] **Fundraising Secretarial Workflows** = 3 workflows × 2.5 hours × round_complexity_multiplier
  - Test: E1, E2 (Pattern E)

### Round Complexity Multipliers (For Fundraising)
- [ ] **Seed Round** = 1.0× multiplier
  - Test: E2 (Pattern E)

- [ ] **Series A Round** = 1.5× multiplier
  - Test: E2 (Pattern E)

- [ ] **Series C Round** = 2.5× multiplier
  - Test: E2 (Pattern E)

### Method-Based Multipliers
- [ ] **In-House Multiplier** = 1.0 (full effort)
  - Cost = total_hours × blended_rate × 1.0
  - Test: F1, F3 (Pattern F)

- [ ] **Outsourced Multiplier** = 0.2 (20% internal, 80% outsourced)
  - Cost = total_hours × blended_rate × 0.2 + retainer
  - Test: F1, F3 (Pattern F)

- [ ] **Retainer Cost** = STAGE_RETAINER[geography][stage]
  - Only applies to outsourced method
  - Varies by geography (India < US < developed markets)
  - Varies by stage (pre-seed < seed < series-a < series-b < series-c)
  - Test: F2, F4 (Pattern F)

### Geographic Factors
- [ ] **Blended Hourly Rate** = Varies by geography × stage
  - India: Lowest (~₹1,200-2,000/hr)
  - US: Higher (~$80-150/hr)
  - Test: B1, B3 (Pattern B)
  - Verify: US rate is 3-5× India rate

- [ ] **Retainer by Geography** = STAGE_RETAINER[geo][stage]
  - India retainer < US retainer
  - Test: B2 (Pattern B)

### Stage Factors
- [ ] **Blended Rate by Stage** = Increases from pre-seed → series-c
  - Pre-seed < Seed < Series A < Series B < Series C
  - Test: C1 (Pattern C)
  - Verify: Not exponential jump, roughly 1.2-1.5× per stage

### Valuation Pricing
- [ ] **Valuation Market Price** = VALUATION_PRICING[valuation_type][stage]
  - Different prices for 409A vs Registered Valuer, etc.
  - Varies by stage
  - Test: E3 (Pattern E)

- [ ] **EquityList Discount** = 20% off market rate
  - EquityList cost = market_price × 0.8
  - Test: E3 (Pattern E)
  - Verify: Cost is 80% of market rate, not 100%

- [ ] **Valuation Frequency Multiplier** = 1× (Annually) or 4× (Quarterly)
  - Test: E3 (Pattern E)
  - Verify: Quarterly cost ≈ 4× annual cost

### Feature Dependencies
- [ ] **Compliance Tier 2** = Activated when option_holders > 0
  - Test: A1, A2 (Pattern A)

- [ ] **Fundraising Fields** = Appear/enable when fundraising = ENABLED
  - Test: E1-E6 (Pattern E)

- [ ] **Valuation Fields** = Appear/enable when valuations = ENABLED
  - Test: E3-E4 (Pattern E)

### Cost Component Breakdown
- [ ] **Cost is itemized** into separate line items:
  - [ ] Grant Admin Hours
  - [ ] Stakeholder/Platform Pricing
  - [ ] Cap Table
  - [ ] Compliance
  - [ ] Fundraising (if enabled)
  - [ ] Secretarial (if applicable)
  - [ ] Valuation (if enabled)
  - [ ] Retainer (if outsourced)
  - Test: A1, E4, F2 (Patterns A, E, F)

---

## PART 5: TEST EXECUTION CHECKLIST

Use this checklist to ensure you've covered the major areas:

### Basic Functionality
- [ ] Can I input 0 for all fields?
- [ ] Can I input realistic numbers (20 SH, 100 OH, etc)?
- [ ] Does the calculator produce a final cost number?
- [ ] Can I toggle features on/off without breaking the form?

### Calculation Logic (Use Pattern A: Boundary Testing)
- [ ] Option holders = 0 disables/zeros out refresh grants field
- [ ] New hire grants = 0 removes grant admin cost
- [ ] Shareholders = 0 removes cap table cost (or shows baseline only)
- [ ] All inputs = 0 shows only minimum compliance cost

### Geographic Logic (Use Pattern B: Geographic Testing)
- [ ] Same company in India vs US shows different costs
- [ ] Blended rates differ by country
- [ ] Retainer costs (if outsourced) differ by country

### Stage Logic (Use Pattern C: Stage Progression)
- [ ] Pre-seed is cheapest stage
- [ ] Series C is most expensive stage
- [ ] Blended rate increases with stage
- [ ] Retainer costs increase with stage (if outsourced)

### Feature Logic (Use Pattern E: Feature Toggle)
- [ ] Fundraising cost is 0 when disabled, positive when enabled
- [ ] Valuation cost scales with frequency (quarterly > annually)
- [ ] Enabling both features doesn't remove either cost

### Scaling Logic (Use Pattern D: Volume Scaling)
- [ ] Doubling stakeholders roughly doubles grant admin hours
- [ ] Compliance hours have non-linear scaling (not linear)
- [ ] Very high shareholder counts don't break the calculator

### Method Comparison (Use Pattern F: Method Comparison)
- [ ] Outsourced is cheaper than in-house for same scenario
- [ ] Retainer cost is visible in outsourced scenario
- [ ] Internal hours reduced to ~20% for outsourced method

---

## PART 6: CREATING YOUR TEST REPORT

After running tests, document your findings:

```
## Test Summary
Date: [date]
Tester: [your name]
Total scenarios tested: [number]
Bugs found: [number]

## Scenarios Tested
[For each test, include]:
1. Test name & pattern used (A-F from Part 3)
2. Inputs used
3. Expected vs actual result
4. PASS/FAIL
5. If FAIL, the specific discrepancy

## Bug List
[For each bug]:
1. Title
2. Reproduction steps
3. Expected behavior
4. Actual behavior
5. Likely cause (which formula/component)
6. Priority (blocker/high/medium/low)

## Insights Gained
[What did you learn about how the calculator works?]
[Are there any edge cases you found?]
[Any recommendations for the calculator?]
```

---

## PART 7: ADVANCED PATTERNS (Optional)

If you finish the basic patterns and want to go deeper:

### Pattern G: Interaction Testing
Test scenarios where multiple features interact in unexpected ways.
- Example: Fundraising + valuations + outsourcing
- What costs get multiplied together? What stays independent?

### Pattern H: Decimal/Rounding Testing
Test with unusual inputs (e.g., 13.5 shareholders, 0.5 grants).
- Does the calculator handle decimals correctly?
- Are hours rounded consistently?
- Does rounding cause discrepancies in the final cost?

### Pattern I: Year-to-Date Calculations
If the calculator shows both monthly and annual costs:
- Does monthly × 12 = annual?
- Are there any month-to-month discrepancies?

### Pattern J: Sensitivity Analysis
For each input field, test how sensitive the final cost is to that input.
- Which inputs have the biggest impact on cost?
- Which inputs barely matter?
- Use this to prioritize where accuracy matters most.

---

## PART 8: MASTER TEST COVERAGE MAP

This map shows which tests validate which formulas. Use it to ensure you've tested everything:

| Formula | Pattern A | Pattern B | Pattern C | Pattern D | Pattern E | Pattern F | Status |
|---------|-----------|-----------|-----------|-----------|-----------|-----------|--------|
| Grant admin hours = count × 1.5 | A3 | — | — | D1 | — | — | ☐ |
| Stakeholder pricing = (SH+OH+NH) × price | A4 | — | — | D2 | — | — | ☐ |
| Shareholder scaling = 1 + (SH-20)/100×0.5 | — | — | C4 | D3 | — | — | ☐ |
| Option holder scaling = 1 + (OH-5)/50 | — | — | C3 | D4 | — | — | ☐ |
| Cap table base = 36 hours/year | — | — | C4 | D3 | E6 | — | ☐ |
| Compliance Tier 2 hours | A1, A2 | — | C3 | D4 | — | — | ☐ |
| Fundraising workflows = 3 × 2.5 × complexity | — | — | — | — | E1, E2 | — | ☐ |
| Seed round = 1.0× multiplier | — | — | — | — | E2 | — | ☐ |
| Series A round = 1.5× multiplier | — | — | — | — | E2 | — | ☐ |
| Series C round = 2.5× multiplier | — | — | — | — | E2 | — | ☐ |
| In-house mult = 1.0 | — | — | — | — | — | F1, F3 | ☐ |
| Outsourced mult = 0.2 | — | — | — | — | — | F1, F3 | ☐ |
| Retainer = STAGE_RETAINER[geo][stage] | — | B2 | — | — | — | F2, F4 | ☐ |
| Blended rate by geo | — | B1, B3 | — | — | — | — | ☐ |
| Blended rate by stage | — | — | C1 | — | — | — | ☐ |
| Valuation frequency = 1×/4× | — | — | — | — | E3 | — | ☐ |
| EquityList discount = 20% | — | — | — | — | E3, E4 | — | ☐ |
| OH=0 disables refresh grants | A1, A2 | — | — | — | — | — | ☐ |
| Feature interaction (FR + Val) | — | — | — | — | E5, E6 | — | ☐ |

**How to use this map:**
1. As you test each scenario, check it off
2. Ensure every formula has at least one ☑ mark
3. If a formula isn't checked off by the end, run additional tests for it
4. If a formula fails its test, return to that pattern for deeper investigation

---

## PART 9: COMPREHENSIVE TESTING WORKFLOW

### Phase 1: Basic Functionality (1-2 hours)
1. Run **Pattern A** (Boundary Testing) - Tests A1-A6
2. Verify: Field dependencies, zero inputs, stakeholder pricing formula
3. Checkoff: ☑ OH=0 disables refresh grants, ☑ Grant hours linear, ☑ Stakeholder pricing formula

### Phase 2: Geographic & Rate Logic (1-2 hours)
4. Run **Pattern B** (Geographic Testing) - Tests B1-B4
5. Verify: Blended rates vary by country, retainers vary by country, costs scale proportionally
6. Checkoff: ☑ Blended rate by geo, ☑ Retainer by geo

### Phase 3: Stage & Scaling Logic (2-3 hours)
7. Run **Pattern C** (Stage Progression) - Tests C1-C4
8. Run **Pattern D** (Volume Scaling) - Tests D1-D5
9. Verify: Rates increase by stage, scaling factors apply non-linearly
10. Checkoff: ☑ Blended rate by stage, ☑ Shareholder scaling, ☑ Option holder scaling

### Phase 4: Feature Logic (2-3 hours)
11. Run **Pattern E** (Feature Toggle) - Tests E1-E6
12. Verify: Fundraising adds cost, valuations scale by frequency, features stack correctly
13. Checkoff: ☑ Fundraising workflows, ☑ Round complexity multipliers, ☑ Valuation frequency, ☑ Feature interaction

### Phase 5: Method Comparison (1-2 hours)
14. Run **Pattern F** (Method Comparison) - Tests F1-F6
15. Verify: Outsourced multiplier applied correctly, retainer present, outsourced is cheaper
16. Checkoff: ☑ In-house mult, ☑ Outsourced mult, ☑ Retainer per stage

### Phase 6: Deep Validation (1-2 hours)
17. Pick ONE complex scenario (e.g., Series B, India, outsourced, fundraising, valuation)
18. Calculate expected cost manually (all components)
19. Run scenario in calculator
20. Compare. Detailed discrepancy analysis if needed.

**Total estimated time**: 8-15 hours of testing

---

## PART 10: SUMMARY: YOUR TESTING WORKFLOW

1. **Pick a pattern** from Part 3 (A-F) or Part 9 phases
2. **Run the specific tests** listed for that pattern (A1, A2, A3, etc.)
3. **Predict the output** using formulas from Part 4B
4. **Run the scenario** in the calculator
5. **Compare** actual vs predicted (use manual calculation)
6. **If match**: ☑ Check off the formula in Part 8, move to next test
7. **If mismatch**: Use Part 4 debugging guide to identify which formula is wrong
8. **Document** findings (include inputs, expected, actual, difference)
9. **Move to next test**

**Key principle**: You're not just running scenarios—you're verifying that each formula produces the correct output. Every number in the calculator should be explainable by a formula.

---

## APPENDIX: When Numbers Don't Match—Deep Debugging

### Scenario: Your calculation says $1,500 but calculator shows $2,000

**Step 1: Identify the gap**
- Difference: $2,000 - $1,500 = $500
- Percentage: 33% higher than expected

**Step 2: List all possible causes**
- Missing multiplier (e.g., forgot × 1.15 scaling factor)
- Wrong rate (e.g., used ₹1,200 but it's actually ₹1,500)
- Wrong hours (e.g., forgot to include compliance hours)
- Missing component (e.g., forgot retainer cost)
- Wrong threshold (e.g., scaling activated when it shouldn't)

**Step 3: Test in isolation**
- Create a MINIMAL scenario with only the component that's wrong
- Example: If you think "retainer is wrong", test ONLY with outsourced method, everything else minimal
- Example: If you think "grant hours wrong", test ONLY with grants, everything else zero

**Step 4: Calculate expected vs actual for the isolated component**
- Component alone should be ~$500 based on your analysis
- Does calculator show $500 for just that component?

**Step 5: Identify the exact formula error**
- Was the multiplier applied? (If 0.2 wasn't applied, cost would be 5× higher)
- Was the rate correct? (If rate was 2× higher, cost would be 2× higher)
- Was the threshold correct? (If scaling kicked in early, cost would be higher)

**Step 6: Document the bug**
```
Bug: [Title of what's wrong]
Inputs: [exact inputs that trigger the bug]
Expected: [formula calculation]
Actual: [what calculator shows]
Likely cause: [which line in code might be wrong]
```

---

Good luck! You now have a comprehensive framework to test every single formula and feature in the ROI calculator. 🧪
