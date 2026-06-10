# Rishabh's ROI Calculator Testing Methodology
**Extracted from June 4 Call Transcript**

---

## OVERVIEW

Rishabh tests the ROI calculator using **scenario-based testing with progressive complexity**. He validates:
1. **Input handling** — How the form processes different company profiles
2. **Calculation logic** — Whether formulas produce correct outputs
3. **Feature interactions** — How toggling one feature affects costs
4. **Geographic variations** — Same scenario across different jurisdictions
5. **Scale testing** — How costs behave as company grows (shareholders, employees, grants)

---

## TESTING METHODOLOGY

### **Phase 1: Minimal Input Validation**
**Goal**: Test the simplest possible company profile to establish baseline behavior

**Logic**: Start with company that has minimal equity complexity
- Incorporation country: India (baseline)
- Stage: Pre-seed (simplest stage)
- Shareholders: 0 (no cap table maintenance cost)
- Option holders: **0** ← Critical test point
- New hire grants: 0
- Refresh grants: **Should be auto-zeroed when option holders = 0**
- Admin method: In-house (baseline)
- Fundraising: Disabled
- Valuations: Disabled

**What he's checking**:
- Does the form allow option holders = 0?
- When option holders = 0, does refresh grants automatically reset to 0? (Line 31-35: "New hires, you have zeroed, right? Yes, it will be zeroed.")
- What costs appear when there's basically nothing? (Only compliance/admin overhead)
- **Expected outcome**: Minimal cost because there's no equity activity to manage

---

### **Phase 2: Geography Impact Testing**
**Goal**: Verify that geography affects compliance requirements and labor costs

**Scenario A: US-incorporated Pre-seed Company**
- Country of incorporation: US
- Country of operation: India (deliberately different)
- Stage: Pre-seed
- Shareholders: 3-5 (small, testable number)
- Option holders: 0
- New hires: 0

**What he's checking** (Lines 49-67):
- "There is a company in U.S., where the area of incorporation is in India"
- Does US incorporation determine the compliance rules? (Should be: Rule 701, ASC 718)
- Are labor rates pulling from US geography or India? (Should be from incorporation country)
- What's the blended cost when hiring from India but incorporated in US?
- **Expected impact**: Should use US compliance rules (more expensive) but could show in INR for display

**Why this matters**: Tests whether geo_inc (incorporation) properly controls compliance while geo_op (operation) is ignored or used differently

---

### **Phase 3: Scale Testing via Grant Volume**
**Goal**: Understand how grant volume and employee count scale the cost model

**Scenario B: Series A Company, India**
- Country of incorporation: India
- Stage: Series A/B
- Shareholders: 20-100 (tests cap table scaling)
- Option holders: 25-50 (tests grant admin scaling)
- New hire grants: 25 per year (tests new grant volume)
- Refresh grants: 25 per year (tests existing employee grant refreshes)

**What he's checking** (Lines 119-155):
- "Around 100 shareholders. 100 employees. If you employees, if you 100 employees, at least 50% of employees would be having grants."
- Grant calculation logic: 25 new hires × 1.5 hours/grant = expected hours
- Refresh scaling: 25 refreshes × 1.5 hours = expected hours
- "If I write 25, then I'm doing 2 hire every month" — validates the helper text math (52 weeks ÷ 25 grants = ~2 per month)
- Stakeholder pricing: (shareholders + option holders + new hires) × ₹1,200/year
- **Expected impact**: As each category increases, costs scale non-linearly

---

### **Phase 4: Outsourcing vs In-house Cost Comparison**
**Goal**: Verify that outsourcing reduces internal effort cost by 80% (keeping 20% internal)

**The Testing Approach** (Lines 269-297):
Rishabh tests the SAME scenario twice, toggling only the admin method:

**Scenario A: In-house**
- Same company profile (Series A/B, India, 100 shareholders, 50 option holders, 50 new hires/refresh)
- Method: In-house
- Expected cost: grant_hours × blended_rate × 1.0 (multiplier)

**Scenario B: Outsourced**
- Identical inputs to Scenario A
- Method: Outsourced
- Expected cost: grant_hours × blended_rate × 0.2 (multiplier) + retainer cost
- The 0.2 multiplier means: "Keep 20% internal effort (coordination, approvals), outsource 80% to CA/law firm"

**What he's checking**:
- "If I keep outsource, then my cost is [X]. But if I took internal team, then my cost is [Y]" (Line 269)
- Is the retainer cost being added for outsourced method? ✓
- Are internal hours reduced by 20% (mult = 0.2)? ✓
- Does outsourced cost include: (20% internal hours × rate) + retainer?
- **Expected outcome**: Outsourced should be cheaper when retainer < (80% of hours × blended rate)

---

### **Phase 5: Feature Interaction Testing (Fundraising)**
**Goal**: Verify that enabling fundraising adds complexity correctly

**Without Fundraising**:
- Cap table cost: 3 hrs/month × 12 = 36 hours/year
- Secretarial cost: 0 hours (no special board resolutions needed)

**With Fundraising** (Lines 88-107):
- Round type: Seed (10-12 months away)
- Expected new shareholders from round: 8 (investors + SAFE conversions)
- Cap table workflows added: 3 workflows × 2.5 hrs = 7.5 hrs baseline
- Secretarial workflows added: 3 workflows × 2.5 hrs = 7.5 hrs baseline
- Round complexity multiplier: Seed = 1.0×
- Shareholder scaling: 1 + max(0, ((100 + 8) - 20) / 100) × 0.5 = 1 + 0.44 = 1.44×

**What he's checking**:
- "If I want a new seed round, I want to new round. I want to new seed round 6 months" (Lines 88-89)
- Does enabling fundraising add cap table workflows? (pre-round modeling, security issuance, post-close reconciliation)
- Does enabling fundraising add secretarial workflows? (board approvals, shareholder approvals, documentation)
- Are these costs multiplied by round complexity? (Seed = 1.0×, Series A = 1.5×, Series C = 2.5×)
- New shareholders increase the shareholder scaling factor?
- **Expected outcome**: Cost should increase by roughly 15 hours + whatever the round complexity multiplier adds

---

### **Phase 6: Valuation Service Testing**
**Goal**: Verify valuation report selection and pricing

**Base Scenario**: Series A/B company, US-incorporated

**Test Case 1: 409A Valuation**
- Frequency: Annually (1× per year)
- Report type: 409A valuation
- Market cost: $1,890 (looked up from VALUATION_PRICING)
- EquityList cost: $1,890 × 0.8 = $1,512 (20% discount)
- Added to "Your Annual Spend"
- Added to "EquityList Cost"

**Test Case 2: With Registered Valuation**
- Same scenario but: Registered Valuer Assessment instead of 409A
- Different pricing: might be ₹141,750 (India) or $1,008 (US)
- Expected impact: Changes both annual spend and EquityList cost

**What he's checking** (Lines 101-177):
- "Because I am a U.S. company, and I am going raise the office, so I a valuation report. So yes, if I want an annual valuation, I will a 409 valuation"
- Does valuation pricing change based on stage? (Pre-seed < Seed < Series A < Series B < Series C)
- Does frequency multiplier work? (Annually = 1×, Quarterly = 4×)
- Is EquityList discount (20%) applied correctly?
- How much does adding valuation increase total cost?
- "We have increased 35,000 dollars. There will be 1,34,000 dollars" — comparing cost with vs without valuation

---

### **Phase 7: Cumulative Scenario Testing**
**Goal**: Test realistic multi-feature scenarios with multiple inputs enabled

**Scenario: Series B India Company Planning Fundraise + Valuations**
- Stage: Series B
- Shareholders: 100
- Option holders: 100
- New hire grants/year: 50
- Refresh grants/year: 50
- Admin method: Outsourced (CA retainer)
- Fundraising: Enabled (Series C round in 6 months, expecting 20 new shareholders)
- Valuation: Enabled (Registered Valuer, Quarterly)

**What he's checking**:
- Grant admin: 100 + 50 + 50 = 200 events × 1.5 hrs = 300 hours
  - With outsourcing: 300 × 0.2 × blended_rate
  - Plus retainer: STAGE_RETAINER[india][seriesb] = ₹256,000
- Compliance reports scale with: stage (1.25×) + shareholder count + option holder count + grant volume
- Cap table: 3 hrs/month base × 12 = 36 hrs, plus fundraising workflows
- Secretarial: Only if fundraising enabled, scaled by shareholders
- Valuation: Quarterly = 4 events per year

**Expected outcome**: High complexity scenario where multiple features interact
- Each feature contributes its own cost
- Some features share blended rate multiplier (grants, compliance, cap table all use × 0.2)
- Retainer cost is a fixed line item added to total

---

## DEBUGGING LOGIC

### **How Rishabh Identifies Calculation Bugs**

#### **Approach 1: Isolation Testing**
**Method**: Change ONE variable, measure impact, verify it matches expected formula

Example from transcript (Lines 369-395):
- Farheen calculates: 785 hours × ₹1,527/hr = ₹1,199,295
- "393 into 1527 which is 6 lakh rupees. You 2 lakh rupees, 8 lakh rupees."
- Tests internal hour allocation: if total hours = 785, and internal (20%) = 393.5, then cost should be 393.5 × rate
- When the numbers don't align, he backtracks to find what assumption is wrong

#### **Approach 2: Formula Verification**
**Method**: Manually calculate what the output should be, compare with calculator output

From Lines 371-395:
- "Your internal team cost is from assumptions. 785 hours into 1527. This your internal team cost. I have half 785 because you are saying that will 20% work."
- Identifies that internal hours should be: total_hours × 0.2 (outsourced method)
- If total = 785, internal should = 157 hours
- Cost = 157 × rate
- But checks: "So, 785 divided by 2 is? 393. 393 into 1527."
- Realizes discrepancy: calculator may be applying 0.2 multiplier differently than expected

#### **Approach 3: Scale Testing**
**Method**: Test with 3 different volume points and verify linear/non-linear scaling

From Lines 165-149:
- "We can give that for 50, 70, 95 users on the platform"
- Tests stakeholder pricing at different thresholds (50, 70, 95 users)
- Checks if per-user cost decreases as volume increases (expected: platform pricing should scale)
- Expected: 50 users × ₹1,200 = ₹60,000 vs 95 users × ₹1,200 = ₹114,000
- Verifies linear scaling is working

#### **Approach 4: Boundary Testing**
**Method**: Test edge cases where inputs are 0 or at minimums

From Lines 31-35, 81-85:
- Option holders = 0: Should zero out refresh grants, disable compliance for grants
- New hire grants = 0: Should remove grant admin cost
- Shareholders = 0: Should remove cap table cost
- **Purpose**: Ensure each component activates/deactivates correctly based on input

---

## SCENARIO TESTING PATTERNS

### **Pattern 1: Geographic Progression**
Tests same company structure across geographies to validate geographic cost differences:
- **Baseline**: India-incorporated
- **Comparison 1**: US-incorporated (shows cost increase due to higher labor rates)
- **Comparison 2**: Singapore-incorporated (different compliance, different rates)
- **What validates**: Does geo_inc properly control rates, compliance, retainer costs?

### **Pattern 2: Stage Progression**
Tests same company growing through funding stages:
- **Start**: Pre-seed (0 staffing, founder-only)
- **Growth 1**: Seed (founder + HR/Finance coming in)
- **Growth 2**: Series A/B (distributed team: founder, HR, Finance, Legal)
- **Growth 3**: Series C+ (mature: finance/legal-heavy)
- **What validates**: Does blended rate increase appropriately? Do compliance hours scale?

### **Pattern 3: Complexity Progression**
Tests company with minimal → maximum complexity:
- **Minimal**: 0 shareholders, 0 option holders, 0 grants
- **Low**: 20 shareholders, 5 option holders, 5 new hires/refresh
- **Medium**: 50 shareholders, 25 option holders, 25 new hires + 25 refresh
- **High**: 100 shareholders, 100 option holders, 50 new hires + 50 refresh
- **What validates**: Do costs scale non-linearly as complexity increases?

### **Pattern 4: Method Comparison**
Tests same scenario with different admin methods:
- **Setup**: Define a Series A company with specific SH/OH/grants
- **Variation A**: In-house method
- **Variation B**: Outsourced method
- **What validates**: Is outsourced genuinely cheaper? Does retainer cost make sense?

### **Pattern 5: Feature Enablement**
Tests scenarios with optional features toggled:
- **Base**: Core scenario (no fundraising, no valuations)
- **+Fundraising**: Add fundraising feature
- **+Valuations**: Add valuation feature
- **+Both**: Enable both to see cumulative impact
- **What validates**: Does each feature independently add expected cost? Do they interact correctly?

---

## IMPACT ANALYSIS: How Features Affect Calculations

### **Option Holders Impact**
- **When OH > 0**: 
  - Triggers compliance Tier 2 (equity-specific reports)
  - Adds grant admin: OH × 1.5 hours
  - Enables refresh grants field (should allow user input)
  - Scales compliance: option_holder_scale = 1 + max(0, (OH - 5) / 50)

- **When OH = 0**:
  - No compliance Tier 2 (saves 8-15 hours)
  - No grant admin for existing holders
  - Refresh grants should be **locked at 0** (Rishabh's fix)
  - Stakeholder pricing: no contribution from option holders

### **New Hire Grants Impact**
- **Hours added**: grNewHire × 1.5
- **Compliance trigger**: Tier 2 (equity reports) — required if > 0
- **Stakeholder pricing**: Each new hire counts toward platform cost
- **Scaling factor**: Affects grant volume scaling in compliance

### **Refresh Grants Impact**
- **Hours added**: grRefresh × 1.5
- **Only if**: OH > 0 (field disabled otherwise)
- **Compliance trigger**: Contributes to tier 2
- **Total grant work**: OH + grNewHire + grRefresh (all combined)

### **Fundraising Impact**
- **Cap table workflows**: +3 workflows × 2.5 hrs = 7.5 hrs baseline
- **Multiplier**: Round complexity (Seed = 1.0×, Series A = 1.5×, Series C = 2.5×)
- **Secretarial workflows**: +3 workflows × 2.5 hrs = 7.5 hrs baseline
- **Shareholder scaling**: Secretarial scales by (current + new shareholders)
- **Duration**: These hours added for ~2-3 months of fundraising activity

### **Valuation Impact**
- **Cost added**: VALUATION_PRICING[type][stage][currency] × frequency multiplier
- **Frequency multiplier**: Annually = 1×, Quarterly = 4×
- **EquityList discount**: 20% applied to market rate
- **Added to both**: "Your Annual Spend" AND "EquityList Cost"

### **Admin Method Impact (In-house vs Outsourced)**
- **In-house (mult = 1.0)**:
  - Cost = all_hours × blended_rate × 1.0
  - No retainer cost
  - Full internal effort required

- **Outsourced (mult = 0.2)**:
  - Cost = all_hours × blended_rate × 0.2 + STAGE_RETAINER[geo][stage]
  - Retainer is fixed cost (doesn't scale with complexity)
  - 80% of work handled by CA/law firm
  - 20% internal coordination/approval effort remains

---

## KEY TESTING INSIGHTS

### **Why He Tests in This Order**

1. **Minimal → Complex**: Understand baseline before adding features
2. **Single variable change**: Isolate which input causes cost changes
3. **Geographic variation**: Ensure jurisdiction logic is correct
4. **Scale testing**: Validate formulas work across order-of-magnitude differences
5. **Feature interaction**: Catch bugs where multiple features conflict

### **Critical Bug Indicators He Looks For**

- **Option holders = 0 doesn't disable refresh grants** (Found and fixed)
- **Hours calculation doesn't match formula** (Troubleshot in Lines 369-395)
- **Retainer cost missing for outsourced method** (Verifies it's present)
- **Valuation cost doesn't scale with frequency** (Tests annually vs quarterly)
- **Shareholder scaling doesn't activate** (Tests with >20 shareholders)
- **Geographic costs don't change** (Tests same scenario across geo_inc values)

### **How He Validates Correctness**

1. **Formula verification**: Manually calculates expected output
2. **Comparison testing**: Same scenario with one variable different
3. **Ratio validation**: Checks if outsourced is meaningfully cheaper than in-house
4. **Scaling validation**: Verifies non-linear costs (2× shareholders ≠ 2× cost)
5. **Feature independence**: Ensures toggling one feature doesn't break others

---

## Testing Checklist (Inferred from Transcript)

- [ ] Option holders = 0 → refresh grants auto-zeros
- [ ] Option holders > 0 → refresh grants enabled
- [ ] Shareholders = 0 → cap table cost = 0
- [ ] Shareholders > 20 → cap table hours increase
- [ ] New hire grants > 0 → grant admin cost appears
- [ ] Fundraising enabled → cap table workflows added
- [ ] Fundraising enabled → secretarial workflows added
- [ ] Valuation enabled → cost multiplies by frequency (1× or 4×)
- [ ] In-house method → no retainer cost
- [ ] Outsourced method → retainer cost added
- [ ] Outsourced method → internal hours = 20% of total
- [ ] Blended rate changes by stage (preseed < seed < series a < series b < series c)
- [ ] Compliance hours scale with shareholder count
- [ ] Compliance hours scale with option holder count
- [ ] Platform pricing = (SH + OH + newHire) × price_per_stakeholder
