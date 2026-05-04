# PRD Review & Audit — User Questions

**Date**: May 4, 2026  
**Purpose**: Address 10 specific PRD issues and implementation gaps discovered during review

---

## a. Hybrid Method Option in Dropdown

**Question**: PRD says "Current Method Cost" includes "in-house, outsourced, or hybrid" but is hybrid actually in the dropdown?

**Current Status**: 
- ✅ PRD mentions hybrid as a possibility (line 11)
- ❌ Implementation does NOT support hybrid
- In app.js, method options are hardcoded: `['in-house', 'outsourced']`
- roi-calculator.js validates against: `const VALID_METHODS = ['in-house', 'outsourced'];`

**Issue**: PRD overstates capability. Either:
1. Remove "hybrid" from PRD line 11 (simplify to just in-house/outsourced), OR
2. Implement hybrid as a third method (e.g., split work 60/40 between internal and external)

**Recommendation**: Remove hybrid from PRD since it adds complexity without user demand. If implemented later, it would be a 0.6 multiplier (60% internal effort retained).

---

## b. Input Phase User Research Gap

**Question**: PRD says "user enters company fundamentals via manual entry form" but mentions "user shares a lot more information." What additional data should be collected?

**Current State**:
- Step 1 collects: geo_inc, geo_op, stage, method
- Step 2 collects: sh, oh, gr
- Optional: planningToFundraise, fundraiseRound, valuations

**Possible Additional Inputs to Consider**:
1. **Company name / identifier** (for reporting, currently optional `co` field)
2. **Current spending baseline** (to compare against calculator's estimates)
3. **Staffing team composition** (if they want to override STAFFING_MATRIX)
4. **Blended rate override** (already supported in breakdown panel, hidden from main inputs)
5. **Tools currently in use** (for awareness of switching costs, not priced)
6. **Compliance preferences** (e.g., "we use outsourced CA for everything" vs partial)
7. **Historical valuation frequency** (help estimate if they need valuations)

**Recommendation**: Keep inputs minimal for primary flow (current 7 fields). Advanced users can edit breakdown assumptions. If user research shows demand for specific fields (e.g., "tool cost comparison"), add as optional toggle.

---

## c. Valuation Report Type — Which Country Does It Take?

**Question**: PRD line 80 says valuation type is "country-specific options" but doesn't clarify: does it use `geo_inc` or `geo_op`?

**Current Status**: 
- ✅ Correctly uses `geo_inc` (country of incorporation)
- ROI calculator line 60-65 looks up VALUATION_TYPES_BY_GEO[geoInc]
- data.js exports VALUATION_TYPES_BY_GEO keyed by country (us, india, uk, singapore)

**Why geo_inc**: Valuations are required by law/regulation in the incorporation country, not operation country. A US-incorporated company operating in India needs US-compliant valuations.

**PRD Update Needed**: Clarify line 80 to say:
> "Valuation Report Type | valuationType | **Country-specific options determined by country of incorporation** (geo_inc) | — | Only if valuations needed; determines cost per event"

---

## d. Stakeholder Cap at 10,000 — Why Not Accept Any Total?

**Question**: PRD line 94 caps stakeholders at `min(sh + oh, 10000)`. Can this be changed to accept higher numbers?

**Current Rationale**:
```
stakeholders = min(sh + oh, 10000)
// Per PRD §2.1: "Used for EquityList platform pricing. Capped at 10,000 maximum."
```

**Technical Reason**: Hard cap protects against:
1. **EquityList pricing matrix overflow** — current PRICING only defined for 4 geographies, not pricing tiers
2. **Hourly rate math breakdown** — blended rate calculated once and applied to all, doesn't scale with very large teams
3. **Database sizing** — 10,000 is likely EquityList's current max deployment size

**Options**:
1. **Keep 10,000 cap** — most accurate for EquityList's current offering (recommended)
2. **Remove cap** — add pricing tiers for 10k-50k+ shareholders (product enhancement, out of scope)
3. **Soft cap** — allow entry but warn user "EquityList pricing may differ for >10k shareholders"

**Recommendation**: Keep cap at 10,000 but add UI warning: "EquityList pricing is optimized for companies with up to 10,000 stakeholders. For larger cap tables, contact sales."

---

## e. Cost Component Multiplication by Responsible Persona Rate

**Question**: Should each cost component (grants, compliance, cap table, secretarial) be multiplied by the rate of the persona responsible, instead of using a single blended rate?

**Example Scenario**:
```
Current: All costs use blended_rate (sum of all FTE × rates)

Proposed: 
- Grant admin cost: use HR rate (not blended)
- Compliance cost: use Finance or Legal rate
- Cap table cost: use Finance rate
- Secretarial cost: use Legal/CS rate
```

**Current Architecture**:
```javascript
// Line 63-77 in roi-calculator.js
rate = 0;
for (const role of roles) {
  rate += fte * roleRate;  // Sum all FTE × rates
}
// Then applied uniformly to all components
```

**Pros of Role-Specific Approach**:
- ✅ More granular — reflects who actually does the work
- ✅ HR grant work ≠ Legal secretarial work in cost
- ✅ Aligns with real staffing patterns

**Cons**:
- ❌ Staffing Matrix must specify WHO does each activity (currently only specifies FTE by role/stage)
- ❌ Adds ~4 new fields to PRD (grant_admin_role, compliance_role, etc.)
- ❌ Role assignments may vary by company (some use Finance for grants, others HR)
- ❌ Increases calculation complexity significantly

**Current Staffing Matrix** (static):
```javascript
preseed: { founder: 1.0, hr: 0, finance: 0, cs: 0 }  // Founder does everything
seed: { founder: 1.0, hr: 0.5, finance: 0.5, cs: 0 }  // Split among roles
```

**What Would Need to Change**:
1. Redefine STAFFING_MATRIX to map activities → roles
2. Create ACTIVITY_ALLOCATION table (who does grants, cap table, etc.)
3. Recalculate all 421,120 tests with new logic
4. Update PRD sections 3, 4, 6 entirely

**Recommendation**: 
- **Current approach is reasonable** for MVP. Blended rate assumes realistic team structure for each stage.
- **Defer to V4** if product team wants finer cost attribution.
- **Flag for future**: If companies start requesting role-specific cost breakdowns, revisit this.

---

## f. Base Governance Workflows — Specify What Each Workflow Is

**Question**: PRD §4.4 lists workflow counts (India: 1, 8, 12, 20, 30) but doesn't say what each workflow entails.

**Current PRD** (lines 230-234):
```
**Base Governance Workflows by Geography and Stage** (required by law):
- **India** (Companies Act 2013): 1, 8, 12, 20, 30 workflows/yr for preseed, seed, series a/b, series b/c, series c+
- **US** (No legal minimum, investor-driven): 0, 4, 8, 12, 16 workflows/yr
- **UK** (Companies Act 2006 AGM requirement): 1, 4, 6, 10, 14 workflows/yr
- **Singapore** (Companies Act AGM requirement): 1, 4, 6, 10, 14 workflows/yr
```

**What is a "workflow"?** (implied, not documented):
- Board meeting prep/execution
- Shareholder approval/communication
- Statutory filing (e.g., SH-6 register, Form 351)
- Equity amendment documentation
- Cap table update & distribution

**Recommended Addition to PRD**:

```markdown
### What Counts as a "Workflow"?
Each workflow represents one governance activity (e.g., board meeting, shareholder approval, filing):
- **Board Meeting**: Agenda prep, minutes, approval tracking (~2.5 hours per workflow)
- **Shareholder Approval**: Notice, voting materials, distribution (~2.5 hours)
- **Statutory Filing**: SH-6 register update, Form 351, etc. (~2.5 hours)
- **Equity Amendment**: Documentation for new grants, conversions, or retirements (~2.5 hours)

**Why India has more workflows**: 
- Mandatory 4+ board meetings/year under Companies Act
- Material changes trigger mandatory shareholder approvals
- SH-6 register requires frequent updates

**Why US has fewer**:
- No legal requirement for private companies
- Board cadence driven by investors (typically quarterly)
- Shareholder approvals only for specific triggers (fundraising, cap structure changes)

**UK & Singapore similar to US**:
- Annual AGM required (1 workflow min)
- Investor-driven quarterly boards
- Fewer statutory triggers than India
```

---

## g. Outsourced Method: Does It Use the 0.4 Multiplier AND Blended Rate?

**Question**: PRD §4.5 says "For outsourced method, this retainer cost replaces hourly-based calculation. No staffing matrix or blended rate is applied." But earlier sections suggest mult=0.4. How do these reconcile?

**Current Implementation** (roi-calculator.js):
```javascript
// Line 63-79: Calculate blended rate
if (meth === 'in-house') {
  // Calculate blended rate from staffing matrix
  rate = sum(fte × roleRate)  // e.g., $576.90/hr
} else if (meth === 'outsourced') {
  rate = 0  // No blended rate for outsourced
}

// Line 84: Multiplier (used for in-house only)
const mult = { 'in-house': 1, 'outsourced': 0.4 }[meth];

// Line 92-100: Apply to hourly costs
grCost = grHrs * mult * rate;  // If outsourced: grHrs * 0.4 * 0 = 0
ctCost = ctHrs * rate;         // If outsourced: ctHrs * 0 = 0

// Line 134: External retainer (replaces all hourly costs)
if (meth === 'outsourced') {
  methodExtCost = stageRetainer[geo_op][stageKey];
}

// Total cost includes methodExtCost
const annCost = grCost + cpCost + ctCost + secCost + ctFundraisingCost + secFundraisingCost + methodExtCost + valuationCost;
```

**What Actually Happens**:
- ✅ For outsourced: `rate = 0` (blended rate is NOT calculated or used)
- ✅ For outsourced: `mult = 0.4` is assigned but irrelevant since `rate = 0`
- ✅ For outsourced: Only `methodExtCost` (retainer) is added to annCost
- ✅ Grants, compliance, cap table, secretarial hourly costs all become 0

**The 0.4 multiplier**:
- Used ONLY for in-house method to represent that outsourcing removes 60% of internal work
- Not applied to outsourced method's retainer (retainer is a fixed price, not hourly)

**PRD Confusion** (line 286):
> "For outsourced method, this retainer cost replaces hourly-based calculation. No staffing matrix or blended rate is applied."

This is **technically correct** but unclear. Should clarify:

```markdown
> For outsourced method, the stage-based retainer replaces all hourly-based calculations:
> - Blended hourly rate is NOT calculated
> - Staffing matrix is NOT used
> - Method multiplier (0.4) is NOT applied to hourly costs
> - Only the fixed annual retainer (STAGE_RETAINER[geo_op][stage]) is added to annCost
```

---

## h. Valuation Costs Are Incorrect

**Question**: User reports actual market costs differ from PRD values. 

**Claimed Correct Values**:
- Registered Valuer (India): ₹50k+ market, ₹42k EquityList
- 409A Valuation (US): $1,500 market, $1,200 EquityList
- Merchant Banker (India): ₹90k market, ₹70k EquityList
- Black Scholes (??): ₹1L (₹100k) market, ~₹75k EquityList

**Current Code Values** (data.js):
```javascript
us: [
  { name: '409A Valuation', sub: 'Black-Scholes', cost: 6000, elCost: 400 }
]
india: [
  { name: 'Registered Valuer Assessment', sub: 'IBBI-registered', cost: 200000, elCost: 25000 },
  { name: 'Merchant Banker Assessment', sub: 'SEBI-registered', cost: 300000, elCost: 50000 }
]
```

**Current PRD Values** (lines 300-306):
```
| Country | Report Type | Market Cost | EquityList Cost |
| **US** | 409A Valuation | $6,000 | $400 |
| **India** | Registered Valuer | ₹200,000 | ₹25,000 |
| **India** | Merchant Banker | ₹300,000 | ₹50,000 |
```

**Discrepancies**:

| Valuation Type | Current Code | User Says | Delta | Confidence |
|:---|---:|---:|---:|:---|
| 409A (US) | $6,000 | $1,500 | -$4,500 (-75%) | ❓ Needs verification |
| Registered Valuer (India) | ₹200,000 | ₹50,000 | -₹150,000 (-75%) | ❓ Needs verification |
| Merchant Banker (India) | ₹300,000 | ₹90,000 | -₹210,000 (-70%) | ❓ Needs verification |
| Black Scholes reference | — | ₹100,000 | — | ❓ Not in current list |

**Action Required**:
1. **Verify actual market rates** with:
   - Registered valuers in India (IBBI database)
   - 409A providers in US (e.g., Carta, Pulley, Merge)
   - Merchant bankers (SEBI registry)
2. **Check EquityList partnerships** — what discounts are actually available?
3. **Update both code and PRD** with verified rates
4. **Re-run 421,120 tests** (valuation costs affect ROI calculations)

**For now**: Flag these as NEEDS_VERIFICATION and document assumptions.

---

## i. Should §8.2 and §8.3 (Manual Hours) Include Fundraising and Valuation Costs?

**Question**: Do "manual baseline hours" (§8.2) and "adjusted hours" (§8.3) include fundraising and valuation work?

**Current PRD Definitions**:

§8.2 Manual Baseline:
```
manual_hours = (gr × grHr) + compliance_hours[geo_inc] + ((3 + max(0,(sh-20)/50)×2) × 12) + (workflows[geo_inc][stage] × 2.5 × shareholder_scaling)
```

§8.3 Method-Adjusted:
```
adjusted_hours = (gr × grHr × mult) + (compliance_hours[geo_inc] × mult) + (cap_table_hours × mult) + (secretarial_hours × mult)
```

**Do they include fundraising?** 
- ✅ In code (line 150): `ctFundraisingHours + secFundraisingHours` ARE added to `manualHTotal`
- ❌ In PRD (line 446): Formula does NOT mention fundraising workflows
- **This is a PRD accuracy bug.**

**Do they include valuation?**
- ❌ In code: Valuation cost is monetary, not hours (no VALUATION_HOURS)
- ❌ In PRD: §8.2/8.3 omit valuation entirely
- **This is correct** — valuation is outsourced service cost, not internal labor

**Fix Required**:

Update PRD §8.2 to include fundraising:
```markdown
### 8.2 Internal Effort (Manual Baseline)
manual_hours = (gr × grHr) + compliance_hours[geo_inc] + cap_table_hours_base + secretarial_hours_base + **cap_table_fundraising_hours + secretarial_fundraising_hours**

Where:
- cap_table_hours_base = (3 + max(0,(sh-20)/50)×2) × 12
- secretarial_hours_base = workflows[geo_inc][stage] × 2.5 × shareholder_scaling
- **cap_table_fundraising_hours = (3 × round_multiplier) × 2.5** if planningToFundraise, else 0
- **secretarial_fundraising_hours = (2 × round_multiplier) × 2.5** if planningToFundraise, else 0

// Full unaffected-by-method hours — includes both recurring operations and one-time fundraising
```

Update PRD §8.3 similarly to include fundraising multiplier.

---

## j. Section 3 vs. Section 8 Data Sources — Duplication

**Question**: Why are §3 and §8 both titled "Data Sources"? They appear to repeat the same hourly rate tables.

**Current Structure**:
- **§3 (line 143)**: "Hourly Rate Assumptions (Industry Benchmarks)" — includes all 4-country × 5-role tables
- **§8 (line 486)**: "Data Sources" — repeats same tables again

**The Duplication**:
```markdown
# § 3 (line 143)
## 3. Hourly Rate Assumptions (Industry Benchmarks)
[Full rate tables for US, India, Singapore, UK]

# § 8 (line 486)
## 8. Data Sources
[Same rate tables repeated]
```

**Recommendation**: Consolidate. Options:

**Option A**: Keep §3, delete §8 duplication
- §3 becomes "§3. Rate & Pricing Assumptions"
- Renumber everything after (current §4 → §4, §5 → §5, etc.)
- Move valuation types to separate §3.2 subsection

**Option B**: Keep §8, delete §3 duplication
- §3 becomes shorter narrative on how blended rate is calculated
- §8 remains comprehensive data reference
- Keeps current numbering

**Recommended**: **Option A** (keep §3, consolidate) because:
- §3 comes earlier, naturally fits with formulas
- §8 can become just "Output Metrics" (currently mislabeled)

---

## Summary of Required PRD Updates

| # | Issue | Action | Priority | Lines |
|---|:---|:---|:---|:---|
| a | Hybrid method | Remove from line 11 or implement | P2 | 11 |
| b | Input phase | Document optional fields to collect | P3 | 33 |
| c | Valuation geo | Clarify uses geo_inc not geo_op | P1 | 80 |
| d | Stakeholder cap | Add warning UI message, keep 10k cap | P2 | 94 |
| e | Role-specific rates | Document as V2 feature, defer | P3 | 183 |
| f | Workflow definitions | Add explanation of what = 1 workflow | P1 | 230 |
| g | Outsourced rate clarity | Clarify 0.4 mult not applied to retainer | P1 | 286 |
| h | Valuation costs | Verify and update market rates | P0 | 300 |
| i | §8.2/8.3 fundraising | Include fundraising hours in formulas | P1 | 446 |
| j | Data duplication | Consolidate §3 and §8 | P2 | 143, 486 |

---

## Next Steps

1. **Verify valuation costs** (h) — Get actual market rates from EquityList
2. **Fix fundraising in §8.2/8.3** (i) — Update formulas to match code
3. **Clarify role multipliers** (g) — Add explanation about 0.4 and outsourced
4. **Add workflow definitions** (f) — Explain what each workflow is
5. **Update valuation geography** (c) — Clarify geo_inc usage
6. **Consolidate data sources** (j) — Merge §3 and §8 sections

Once verified, update both PRD and code in parallel.
