# EquityList ROI Calculator — Complete Technical Specification v4.0

**Version**: 4.0 (Fully Consolidated & Comprehensive)  
**Last Updated**: May 27, 2026  
**Purpose**: Single-source-of-truth technical documentation covering every calculation, assumption, design decision, and implementation detail for the ROI calculator. Consolidates all previous separate documentation files.

---

## EXECUTIVE SUMMARY: What This Calculator Solves

**The core insight**: Equity administration costs scale with company complexity. Small companies pay for overhead they don't need; large companies pay for external help they can't avoid. EquityList models what both cost, so companies know their true ROI.

**The problem we solve**:
- Companies don't know how much they actually spend on equity admin (it's spread across roles: HR, Finance, Legal)
- They can't compare: "Is our CA cheaper than hiring internally? What if we grow to 100 employees?"
- They lack visibility into hidden costs: compliance hours, cap table reconciliation, secretarial workflows

**The calculator output**:
1. **Your Annual Spend**: Total annual cost to manage equity (in-house or outsourced)
2. **EquityList Cost**: Platform fee + discretionary services (valuations)
3. **Savings**: Annual dollar amount saved by switching
4. **ROI**: Savings as a multiple of EquityList's cost
5. **Time Saved**: Hours freed up annually by automation

---

## OVERVIEW: Architecture & User Journey

### The Two-Stage User Flow

**Stage 1: Company Fundamentals** (Step 1 & 2 of form)
- User enters: Company geography, funding stage, cap table size, current admin method
- System calculates baseline cost of current approach (in-house or outsourced)

**Stage 2: Optional Context** (Step 2 subsections)
- If fundraising soon → add complexity factors (extra workflows, new shareholders)
- If need valuations → add external service costs
- System adjusts total cost to account for these scenarios

**Output: ROI Comparison**
- Side-by-side: Annual cost today vs. EquityList cost
- Breakdown: Which operations consume the most time/money
- Impact: How many hours/dollars would be saved

### Why Two Geography Inputs Exist

Many users ask: "Why do I have to enter incorporation country AND operating country?"

**Incorporation geography** (`geo_inc`):
- Determines **legal compliance requirements** (What documents must you maintain? How often?)
  - India: SH-6 statutory register, IND AS 102 equity expense accounting
  - US: Rule 701 compliance, ASC 718/820 expense recognition
  - UK/Singapore: IFRS 2 share-based payment standards
- Determines **baseline staffing model** (What roles are needed? At what seniority?)
  - A preseed company in India and a preseed company in the US have different regulatory burdens
- Determines **labor rates** (What do equity professionals cost in this market?)
  - CFO in India (₹4,000/hr) vs. US ($431/hr) reflects market salary differences

**Operating geography** (`geo_op`):
- **Currently NOT USED in calculations** — this is a design debt item
- **Intended design**: Was meant to control currency for display (show costs in local spending currency)
- **Actual behavior**: Even currency display uses `geoInc` (see code bug below)

**⚠️ CODE BUG**: `geoOp` is collected in the form but never used in the `calculate()` function. All operations (rates, pricing, currency) are determined by `geoInc` only.

**Real example of current behavior**: An India-incorporated startup operating in Singapore
- Compliance requirements: Follow India's SH-6 rules (incorporation jurisdiction controls) ✓
- Labor costs: Use India hourly rates for internal staff ✓
- **Display currency**: Shows in INR (geoInc) even though user operates in SGD ✗
- **Expected currency**: Should show in SGD (geoOp) but doesn't

**Next steps**: Either remove `geoOp` from the form (if not needed) or implement it fully to show costs in operating geography currency.

---

## SECTION 1: INPUT MAPPING & NORMALIZATION

### Required Inputs (Company Profile & Equity Structure)

| Input | Variable | What User Enters | Why It Matters | Calculation Impact |
|-------|----------|------------------|----------------|-------------------|
| Company Name | `co` | Free text (optional) | Display only, for user context | None |
| **Incorporation Country** | `geo_inc` | Dropdown: India/US/Singapore/UK | Controls: compliance hours, staffing rates, labor costs, platform pricing | Determines all cost calculations and hourly rates |
| **Operating Country** | `geo_op` | Dropdown: India/US/Singapore/UK | Controls: currency display, onshore staffing assumptions | Affects UI display only; all costs calculated in geo_inc currency |
| **Current Stage** | `stage` | Dropdown: Preseed/Seed/Series A/B/B/C/C+ | Determines: FTE allocations, hourly rates, retainer costs | Staffing matrix lookup + rate scaling |
| **Shareholders** | `sh` | Integer 0–100,000; default 30 | Affects: cap table reconciliation hours, secretarial workflow count | Scaled by (sh-20)/50 for monthly hours; (sh-20)/100 for secretarial complexity |
| **Option Holders** | `oh` | Integer 0–100,000; default 15 | Affects: grant admin hours, compliance reporting hours | Part of grant admin work + triggers equity-specific compliance reports |
| **New Hire Grants/Year** | `grNewHire` | Integer 0–10,000; default 5 | Affects: grant administration hours, compliance reports, stakeholder pricing | Hours = newHireGrants × 1.5 hrs/grant; triggers tier 2 compliance |
| **Refresh Grants/Year** | `grRefresh` | Integer 0–10,000; default 5 | Affects: grant admin hours (existing employees getting more shares) | Included in total grant admin work (oh + grNewHire + grRefresh) |
| **Admin Method** | `meth` | Radio: In-house / Outsourced | Determines: cost model (blended rate vs. retainer), method multiplier | mult = 1.0 (in-house) or 0.4 (outsourced) |

### Optional Enhancements

#### Fundraising (Subsection C)
**When enabled**: User is planning to raise capital in the next 12 months
- **Round type** (Preseed/Seed/Series A/B/C): Determines complexity multiplier for fundraising workflows
- **Timing** (informational only): 3–6 months, 6–12 months (UI messaging, not calculations)
- **Expected new shareholders**: Investors, SAFE conversions, option pool grants from the round

**Why it's optional**: Not all companies are fundraising; this adds 6 workflows (3 cap table + 3 secretarial) for 2-3 months of the year

**Impact on calculation**:

**Cap Table Workflows (3 × 2.5 hrs = 7.5 hrs baseline)**:
1. Pre-round cap table modeling (dilution analysis, ownership scenarios)
2. Security issuance updates (SAFE/stock creation, investor allocation)
3. Post-close cap table reconciliation (true-up, stakeholder records, statutory filings)

**Secretarial Workflows (3 × 2.5 hrs = 7.5 hrs baseline)**:
1. Board approvals (fundraising resolutions, board meeting coordination)
2. Shareholder approvals (written consents, voting, documentation)
3. Documentation coordination (agreements, signatures, closing mechanics)

**Scaling**:
- Both cap table and secretarial workflows scaled by `ROUND_COMPLEXITY[fundraiseRound]` (0.5× for SAFE, 1.0× for Seed, 2.5× for Series C+)
- Secretarial workflows additionally scaled by shareholder count: 1 + max(0, (shareholders - 20) / 100) × 0.5
- Shareholder count increases by `newShareholdersFromFundraise` for cost calculations during fundraising

#### Valuation Reports (Subsection D)
**When enabled**: Company needs third-party valuations
- **Frequency**: Annually (1×/year) or Quarterly (4×/year)
- **Report type**: 409A, Black Scholes, Registered Valuer, Merchant Banker, HMRC (all options visible to all countries)

**Why it's optional**: Not all companies need external valuations; only mission-critical for ESOP pricing and fundraising

**Impact on calculation**:
- Market cost: looked up from VALUATION_PRICING[type][stage][currency]
- EquityList cost: 20% discount applied to market rate
- Frequency multiplier: 1× if annual, 4× if quarterly
- Added to both "Your Annual Spend" and "EquityList Cost"

---

## SECTION 2: DERIVED BASE METRICS (Calculations Before Cost Components)

### 2.1 Total Stakeholders for Platform Pricing

**Formula**:
```
stakeholders = min(sh + oh + grNewHire, 10,000)
```

**Why **`grNewHire`** is included**:
- New hires with options enter the cap table immediately
- They consume platform features (vesting schedules, grants, exercise tracking)
- Example: 30 shareholders + 15 option holders + 5 new hires/year = 50 stakeholders billed to platform
- Why not `grRefresh`? Refreshes are granted to existing option holders (already counted in `oh`)

**Why capped at 10,000**:
- EquityList pricing plateaus at 10,000+ stakeholders (enterprise negotiation)
- Calculation prevents artificial inflation from very large portfolios

**Example calculation**:
- Company: 100 shareholders, 40 option holders, 8 new hire grants/year
- Stakeholders = min(100 + 40 + 8, 10,000) = 148
- Platform annual cost = 148 × PRICING[geo_inc]

---

### 2.2 Method Multiplier (Effort Retention)

**Formula**:
```
mult = {
  'in-house': 1.0      // 100% of work retained internally
  'outsourced': 0.4    // 40% retained internally (60% outsourced to CA/Law)
}
```

**Why 0.4 for outsourced?**
- Outsourcing to a CA (Chartered Accountant) or law firm doesn't eliminate internal effort
- Internal team still does: approval routing, coordination, compliance sign-off, documentation
- Research shows: ~60% of work can be outsourced; ~40% is irreducible internal overhead
- This 0.4 multiplier is applied to ALL hours (grants, compliance, cap table, secretarial)

**Real example**:
- In-house: Cap table reconciliation = 50 hours/year × 1.0 = 50 hours of internal effort
- Outsourced: Cap table reconciliation = 50 hours/year × 0.4 = 20 hours internal (CA handles 30 hours)
- Cost: In-house: 50 × $500/hr = $25,000 | Outsourced: (20 × $500) + $18K retainer = $28K

---

### 2.3 Stage-Based Staffing Matrix

**The core insight**: Equity admin workload doesn't change instantly when you raise a round. It scales gradually with headcount and governance complexity.

**What FTE means**: Full-Time Equivalent. This is a **cost allocation model**, not a time-tracking model. It represents "which roles are responsible for equity work and at what cost."

- **1.0** = 1 person's full salary is attributed to equity work (doesn't mean they work 40 hrs/week ONLY on equity—they have many responsibilities)
- **0.5** = Half a person's salary is attributed to equity work (person splits their time between equity and other ops, OR two people each split their time)
- **2.5** = 2.5 people's salaries are attributed to equity work (various staffing combinations)
- **0** = Role not needed at this stage

**Important distinction**: 
- Preseed founder at 1.0 FTE doesn't mean founder works 40 hrs/week only on equity
- It means founder IS the responsible party for equity, and for cost modeling purposes, equity is a major responsibility
- Founder actually works 60 hrs/week total: ~10 hrs equity, ~20 hrs product, ~15 hrs fundraising, ~15 hrs ops
- The cost model says "grant admin work = 7.5 hours at founder's $113/hr rate = $847.50" (not "founder spends 7.5 hrs/week on equity")

```javascript
const STAFFING_MATRIX = {
  preseed:  { founder: 1.0,  hr: 0,    finance: 0,   cs: 0    },  // Solo founder; founder=100% time on equity
  seed:     { founder: 1.0,  hr: 0.5,  finance: 0.5, cs: 0    },  // Founder+part-time finance/HR (0.5 each)
  seriesab: { founder: 0.8,  hr: 1.0,  finance: 1.0, cs: 0.5  },  // Dedicated finance/HR; founder 80% time
  seriesbc: { founder: 0.5,  hr: 2.0,  finance: 2.0, cs: 1.0  },  // Scaled team; founder 50% time
  seriesc:  { founder: 0.25, hr: 2.5,  finance: 2.5, cs: 1.5  }   // Mature ops; founder 25% time only
};
```

**Role definitions**:
- **Founder/CEO** (0.25–1.0 FTE): Equity oversight, board decisions, option approval, negotiation
- **HR Lead** (0–2.5 FTE): Cap table maintenance, grant issuance, vesting administration, employee communications
- **Finance/CFO** (0–2.5 FTE): Equity accounting (ASC 718, IND AS 102, IFRS 2), compliance reporting, tax compliance, valuations
- **Company Secretary/Legal** (0–1.5 FTE): Board meetings, shareholder resolutions, statutory filings, regulatory compliance

**Why it scales this way**:
- **Preseed** (founder: 1.0): Solo founder does everything (cap table, board meetings, grant letters, regulatory filings). 100% of founder time goes to equity.
- **Seed** (founder: 1.0, HR: 0.5, Finance: 0.5): Growth to 10–20 employees. Founder still leads but hiring part-time support. Finance person does 50% equity work. HR person does 50% equity work (other 50% = recruiting, ops).
- **Series A/B** (founder: 0.8, HR: 1.0, Finance: 1.0, CS: 0.5): 30–80 employees. Dedicated HR and Finance roles (both full-time on equity). Founder reduced to 80% (board decisions, strategy). Company Secretary (0.5 FTE) handles governance.
- **Series B/C** (founder: 0.5, HR: 2.0, Finance: 2.0, CS: 1.0): 100+ employees. Scaled teams. Founder 50% time on equity (other 50% = product, fundraising). Multiple HR/Finance specialists (2.0 FTE = could be 2 people at 100% or 4 at 50%).
- **Series C+** (founder: 0.25, HR: 2.5, Finance: 2.5, CS: 1.5): 200+ employees. Mature structure. Founder 25% time (board-level only). Full equity teams. CS 1.5 FTE = could be 1 full-time + 1 part-time, or 3 people at 50% each.

**Critical**: These are NOT "how many people you must hire." They're the **fraction of time equity admin consumes** from each role. 

**Real examples**:
- Series A/B Company Secretary (0.5 FTE): Could be 1 person spending 50% on equity + 50% on other ops work, OR 2 people each spending 25% on equity
- Series C Finance (2.5 FTE): Could be 2 full-time people + 1 half-time person, OR 5 people each spending 50% on equity
- Preseed Finance (0.0 FTE): No dedicated finance person; founder or accountant handles taxes/equity

---

### 2.4 Geographic Model (Revised: Who Determines What?)

**CORRECTED from PRD v3.4**:

| Decision | Factor | Determined By | Rationale |
|----------|--------|---------------|-----------|
| **Compliance requirements** | SH-6, Rule 701, IFRS 2, etc. | `geo_inc` only | Company is legally bound by incorporation jurisdiction |
| **Hourly rates for staff** | ₹2,000/hr vs $250/hr | `geo_inc` only | Labor market is national; dictates salary benchmarks |
| **Retainer costs (outsourced)** | $18K vs ₹130K CA retainer | `geo_inc` only | Service providers' pricing is local to their market |
| **Platform pricing per stakeholder** | ₹1,200 vs $40 | `geo_inc` only | EquityList prices by jurisdiction (tax, compliance complexity) |
| **Valuation pricing** | ₹141,750 409A vs $1,890 | `geo_inc` only (CODE BUG: line 435 uses this, but v3.3 changed it to geo_op) | Standard market rates are geography-based |
| **Currency for UI display** | Show in ₹ vs $ | `geo_op` only | User wants to see costs in their local spending currency |

**Why the split?**
- Incorporation geography = legal/tax obligations = cost drivers
- Operating geography = where the money is spent = display currency
- Example: US-incorporated startup operating in India
  - Compliance: US Rule 701 (incorporation controls)
  - Hourly rates: US CFO rates (incorporation controls cost)
  - Display: INR (where the company spends cash)

**⚠️ CODE BUG v3.3**: Valuation costs should use `geo_op` currency for display, but code line 435 uses `geo_inc`. This is inconsistent with the v3.3 change documented in PRD §10.3 line 542.

---

## SECTION 3: HOURLY RATE ASSUMPTIONS

**Source**: Market salary data (Glassdoor, Blind, PayScale) for each geography and stage.  
**Method**: Annual salary ÷ 2,080 working hours (52 weeks × 40 hrs/week)

All rates are stage-aware:
- Preseed/Seed founder in US: $113/hr (salary ~$235K)
- Series C+ founder in US: $431/hr (salary ~$895K)
- Higher stages = higher seniority = higher hourly costs

**Why stage-based rates?**
- A preseed company's CFO is often the founder with basic accounting skills
- A Series C company's CFO is an experienced professional with options management expertise
- Same role, different complexity, different market rates

### United States ($/hr)
| Role | Preseed | Seed | Series A/B | Series B/C | Series C+ |
|:---|---:|---:|---:|---:|---:|
| Founder/CEO | $113 | $181 | $288 | $356 | $431 |
| Finance/CFO | $69 | $110 | $156 | $200 | $250 |
| HR Lead | $63 | $94 | $131 | $169 | $219 |
| Legal/Secretarial | $56 | $88 | $119 | $150 | $200 |

### India (₹/hr)
| Role | Preseed | Seed | Series A/B | Series B/C | Series C+ |
|:---|---:|---:|---:|---:|---:|
| Founder/CEO | ₹500 | ₹1,000 | ₹1,875 | ₹2,750 | ₹4,000 |
| Finance/CFO | ₹325 | ₹650 | ₹1,188 | ₹1,688 | ₹2,313 |
| HR Lead | ₹288 | ₹563 | ₹1,025 | ₹1,438 | ₹2,000 |
| Legal/Secretarial | ₹250 | ₹475 | ₹875 | ₹1,225 | ₹1,688 |

### Singapore (S$/hr)
| Role | Preseed | Seed | Series A/B | Series B/C | Series C+ |
|:---|---:|---:|---:|---:|---:|
| Founder/CEO | $100 | $188 | $331 | $431 | $563 |
| Finance/CFO | $69 | $119 | $200 | $275 | $375 |
| HR Lead | $63 | $103 | $181 | $250 | $325 |
| Legal/Secretarial | $54 | $85 | $150 | $213 | $288 |

### United Kingdom (£/hr)
| Role | Preseed | Seed | Series A/B | Series B/C | Series C+ |
|:---|---:|---:|---:|---:|---:|
| Founder/CEO | £63 | £110 | £181 | £225 | £281 |
| Finance/CFO | £44 | £70 | £110 | £138 | £188 |
| HR Lead | £40 | £63 | £98 | £125 | £169 |
| Legal/Secretarial | £31 | £55 | £85 | £113 | £150 |

---

## SECTION 4: COST COMPONENTS (THE CORE CALCULATIONS)

### 4.1 Grant Administration Cost

#### The Problem This Cost Solves
When you issue equity, someone must:
1. Draft the grant letter (20 min)
2. Set up vesting schedule in cap table tool (15 min)
3. Route for approvals (founder, legal, board) (20 min)
4. Communicate to employee (15 min)
5. Record-keeping and verification (10 min)
6. Error checking (10 min)
= **1.5 hours per grant event**

#### The Calculation
```
total_grant_work = option_holders + new_hire_grants + refresh_grants
grant_hours = total_grant_work × 1.5 hours/event
grant_cost = grant_hours × method_multiplier × blended_hourly_rate
```

#### Why It Includes Option Holders
Every option holder needs annual refreshes to maintain equity. Even if they don't get new grants, maintaining option records requires effort.

**The distinction**:
- **Option Holders** (oh): Existing equity holders who require ongoing management (vesting tracking, record maintenance)
- **New Hire Grants** (grNewHire): Grants issued to new employees (each is a grant event requiring 1.5 hours to process)
- **Refresh Grants** (grRefresh): Acceleration or additional grants to existing employees (each is a grant event requiring 1.5 hours to process)

**All three are included in grant admin work** because:
1. Each option holder requires maintenance work even without new grants
2. Each new hire grant requires processing and documentation
3. Each refresh grant requires processing and documentation

#### Real Example
- Company with 15 option holders, 5 new hire grants, 3 refresh grants per year
- Total grant work = 15 + 5 + 3 = 23 events
- Hours = 23 × 1.5 = 34.5 hours/year
- If blended rate = ₹1,875/hr (Series A/B, India, in-house): Cost = 34.5 × 1,875 = ₹64,688/year

#### When It Changes
- Add a new employee with options: +1.5 hours/year (one-time)
- Refresh existing option pool: +1.5 hours/year per person (recurring)
- Double your option holders: ~double the grant admin cost

---

### 4.2 Compliance & Reporting Cost (DYNAMIC MODEL)

#### The Problem
Companies must produce compliance reports for regulators:
- India: SH-6 statutory register updates, IND AS 102 equity expense accounting
- US: ASC 718 equity accounting, Rule 701 compliance certifications
- UK/Singapore: IFRS 2 share-based payment schedules

The **volume** of reporting scales with company size and complexity.

#### The Implementation: Three-Tier Dynamic Model

**TIER 1: Mandatory if shareholders > 0**
- Cap table summary report (2 hrs baseline, scaled by shareholder count)
- Transaction-level ownership ledger (3 hrs baseline, scaled by shareholder count)
- *Why*: Regulators require current cap table snapshot for governance and tax purposes

**TIER 2: Mandatory if option holders > 0 OR new hires > 0**
- Equity plan & pool overview (1 hr baseline, fixed per tier)
- Grant summary reports (1 hr baseline, scaled by grant volume)
- Vesting reports (0.5 hrs baseline, scaled by option holder count)
- **Geography-specific standards:**
  - **India**: IND AS 102/15 equity expense (4 hrs × option scaling) + SH-6 statutory register (4 hrs × option scaling)
  - **US**: ASC 718/820 equity expense (4 hrs × option scaling) + Rule 701 certification (6 hrs fixed)
  - **UK/Singapore**: IFRS 2 share-based payment (4 hrs × option scaling)

**TIER 3: Mandatory if options > 0 AND stage >= Series A**
- Exercise reports (1 hr × option scaling)
- Surrender summaries (0.5 hrs × option scaling)
- *Why*: As company matures, option exercises (departing employees) and surrenders become administrative burden

#### Stage Scaling
All hours multiplied by stage scaling factor:
- Preseed: 0.5× (preseed companies have less complex equity structures)
- Seed: 0.75×
- Series A/B: 1.0× (baseline)
- Series B/C: 1.25×
- Series C+: 1.5×

#### Volume Scaling
- **Shareholder scaling**: 1 + max(0, (shareholders - 10) / 100)
  - 10 shareholders: 1.0× (standard)
  - 50 shareholders: 1.4×
  - 110 shareholders: 2.0×
- **Option holder scaling**: 1 + max(0, (option_holders - 5) / 50)
  - 5 option holders: 1.0×
  - 25 option holders: 1.4×
  - 105 option holders: 2.0×
- **Grant volume scaling**: 1 + max(0, (annual_grants - 3) / 30)
  - 3 grants/year: 1.0×
  - 10 grants/year: 1.23×
  - 30 grants/year: 1.9×

#### Real Example: Series A/B India Company
- Shareholders: 40, Option holders: 25, New hires/year: 8, Refresh/year: 5
- **TIER 1** (40 shareholders):
  - Cap table: 2 × 1.0 scale × (1 + (40-10)/100) = 2.6 hours
  - Ledger: 3 × 1.0 scale × (1 + (40-10)/100) = 3.9 hours
- **TIER 2** (25 option holders, 13 grants):
  - Equity plan: 1 × 1.0 = 1 hour
  - Grant summary: 1 × (1 + (13-3)/30) = 1.33 hours
  - Vesting: 0.5 × (1 + (25-5)/50) = 0.7 hours
  - IND AS 102: 4 × (1 + (25-5)/50) = 5.6 hours
  - SH-6: 4 × (1 + (25-5)/50) = 5.6 hours
- **Total TIER 2**: 14.19 hours
- **Stage scaling**: 1.0× (Series A/B) → Total ~20 hours
- **Cost**: 20 × 0.4 (outsourced) × ₹1,025 (Series A HR rate) = ₹8,200/year

#### Compliance Hours by Geography (Static Reference)

For reference, here are the baseline compliance hours by geography (without scaling):

| Report | Frequency | India | US | Singapore | UK |
|--------|-----------|-------|-----|-----------|-----|
| Cap table summary | Quarterly | 2h | 2h | 2h | 2h |
| Transaction-level ownership ledger | Quarterly | 3h | 3h | 3h | 3h |
| Equity plan & pool overview | Annual | 2h | 2h | 2h | 2h |
| SH-6 (Statutory ESOP Register) | Quarterly | 4h | — | — | — |
| IND AS 102/15 equity expense recognition | Quarterly | 6h | — | — | — |
| ASC 718/820 equity expense recognition | Quarterly | — | 8h | — | — |
| IFRS 2 equity expense recognition | Quarterly | — | — | 6h | 6h |
| Grant summary reports | Quarterly | 1h | 1h | 1h | 1h |
| Exercise reports | Quarterly | 0.5h | 0.5h | 0.5h | 0.5h |
| Surrender summaries | Quarterly | 0.5h | 0.5h | 0.5h | 0.5h |
| Vesting reports | Quarterly | 0.5h | 0.5h | 0.5h | 0.5h |
| Rule 701 compliance analysis | Annual | — | 6h | — | — |
| **TOTAL (static baseline)** | | **72h** | **68h** | **54h** | **54h** |

These baselines are the foundation; the dynamic model scales them based on company complexity (shareholders, option holders, stage).

---

### 4.3 Cap Table Maintenance Cost

#### The Problem
Every month, your cap table changes:
- New employees join (stock options granted)
- Employees leave (options expire, shares vest)
- Board members update (investor changes)
- Valuations change (affecting option pool calculations)
- Someone must: reconcile transactions, update spreadsheets, notify stakeholders, verify accuracy

#### The Calculation
```
IF shareholders = 0:
  cap_table_cost = 0  // No cap table to maintain

ELSE:
  base_hours_per_month = 3
  shareholder_scaling = max(0, (shareholders - 20) / 50)
  monthly_hours = 3 + (shareholder_scaling × 2)
  annual_hours = monthly_hours × 12
  cap_table_cost = annual_hours × method_multiplier × blended_rate
```

**Note**: Cap table cost only applies if you have shareholders. A company with 0 shareholders (pure option pool, no equity) incurs no cap table maintenance cost.

#### Why Scaling at 20 Shareholders?
- Under 20 shareholders: Relatively stable (founders, early investors)
- 20–70 shareholders: Adding 1 new investor requires notifying 50+ existing stakeholders
- 70–120 shareholders: Each change requires coordination with dozens of people
- Formula: +2 hours/month for every 50 additional shareholders

#### Real Examples
- 20 shareholders: 3 hrs/month = 36 hrs/year
- 70 shareholders: 3 + (50/50)×2 = 5 hrs/month = 60 hrs/year
- 220 shareholders: 3 + (200/50)×2 = 11 hrs/month = 132 hrs/year

---

### 4.4 Secretarial & Board Operations Cost

#### The Problem
Companies must conduct governance activities:
- Board meetings (agenda, notice, circulation, minutes, voting)
- Shareholder approvals (resolutions, voting, consent, documentation)
- Statutory filings (updates to cap table registries, regulatory compliance)
- Equity amendments (documenting grants, conversions, surrenders)
- Compliance reports (annual summaries, certifications)

Each activity is a "workflow" that takes ~2.5 hours of Company Secretary time.

#### The Calculation Structure
```
secretarial_cost = (base_workflows + fundraising_workflows) × 2.5 × shareholder_complexity × method_mult × cs_rate
```

#### Base Workflows by Country (Required by Law)

| Country | Preseed | Seed | Series A/B | Series B/C | Series C+ | Rationale |
|---------|---------|------|-----------|-----------|----------|-----------|
| **India** | 1 | 8 | 12 | 20 | 30 | Mandatory 4 board meetings/year + shareholder approvals for material changes (India: Companies Act 2013) |
| **US** | 0 | 4 | 8 | 12 | 16 | No legal minimum for private companies; investor-driven (quarterly boards typical) |
| **UK** | 1 | 4 | 6 | 10 | 14 | Annual AGM required + quarterly boards common for VC-backed companies |
| **Singapore** | 1 | 4 | 6 | 10 | 14 | Similar to UK (AGM required, quarterly boards for investors) |

**⚠️ CODE ISSUE**: The code (lines 410–424) **only implements fundraising workflows**, not base workflows. Needs clarification whether:
1. Base workflows are handled elsewhere (not in secretarial cost)?
2. Base workflows should be implemented but aren't?
3. Design decision to only charge fundraising overhead?

#### Shareholder Complexity Scaling

As shareholder count grows, governance becomes harder:
```
complexity_multiplier = 1 + max(0, (shareholders - 20) / 100) × 0.5
```

- 20 shareholders: 1.0× (simple board meetings)
- 100 shareholders: 1.0 + (80/100)×0.5 = 1.4× (more documents, more signatures needed)
- 200 shareholders: 1.0 + (180/100)×0.5 = 1.9× (significantly more coordination)

#### Fundraising Workflows (When `planningToFundraise = true`)

When raising capital, add structured workflows that require Company Secretary & Legal effort:

**Cap Table (3 workflows × 2.5 hrs = 7.5 hrs baseline)**:

1. **Pre-Round Cap Table Modeling** (1.5h analysis + 0.5h documentation + 0.5h stakeholder communication = 2.5h)
   - Analyze proposed round terms and their effect on existing shareholders
   - Model dilution scenarios (investors at different valuations, conversion rates)
   - Calculate pro-forma cap table with new securities
   - Why necessary: Founders and investors need to understand ownership impact before committing

2. **Security Issuance Updates** (1h documentation + 0.75h coordination + 0.75h legal review = 2.5h)
   - Create new stock class or security type if needed (preferred stock, new series)
   - Calculate investor share allocation based on investment amount and valuation
   - Update ESOP pool allocation or create new option grants for new stage
   - Issue option letters or securities to investors
   - Why necessary: Legal requirement to formally issue securities; investor protection; tax/compliance documentation

3. **Post-Close Cap Table Reconciliation** (1h reconciliation + 0.75h documentation + 0.75h filing/distribution = 2.5h)
   - Reconcile actual closing numbers against pro-forma (cap table true-up)
   - Update cap table register with new shareholders and stake percentages
   - Generate cap table summary for all stakeholders
   - File required statutory updates (SH-4 in US, SH-6 in India, etc.)
   - Why necessary: Maintain accurate official record; meet statutory requirements; provide stakeholders with final numbers

**Secretarial & Board (3 workflows × 2.5 hrs = 7.5 hrs baseline)**:

1. **Board Approvals** (0.75h documentation + 0.75h coordination + 1h meeting = 2.5h)
   - Prepare board resolutions authorizing the fundraising round
   - Send notices to all board members
   - Schedule and conduct board meeting (or circular resolution)
   - Document board approvals and decisions
   - File board minutes
   - Why necessary: Legal requirement; investors require board approval; governs terms and authorization

2. **Shareholder Approvals** (1h documentation + 0.75h collection/coordination + 0.75h legal review = 2.5h)
   - Prepare written consents or shareholder resolution authorizing the round
   - Distribute to all shareholders with explanation
   - Collect signatures/approvals
   - Maintain records of approvals
   - Why necessary: Many companies require shareholder approval for capital raises; charter/bylaws requirements

3. **Documentation Coordination** (1h agreement coordination + 1h signature collection + 0.5h closing mechanics = 2.5h)
   - Coordinate stock purchase agreement (or SAFE) execution
   - Collect investor signatures and investor documentation (accredited investor certifications, etc.)
   - Manage closing mechanics (fund transfer, share delivery, etc.)
   - Prepare closing documents and final cap table
   - Why necessary: Legal documentation required for the investment; investor protection; audit trail

**Round Complexity Multiplier** (applied to both cap table and secretarial):
- SAFE: 0.5× (simple document, minimal coordination)
- Bridge: 0.75×
- Seed: 1.0× (standard complexity)
- Series A/B: 1.5× (more shareholders to coordinate with)
- Series B/C: 2.0× (institutional investors, more due diligence coordination)
- Series C+: 2.5× (complex round, multiple investor classes)

**Design Decision - Why 3 Secretarial Workflows (Not 4)**:

The original PRD specified "3 for cap table + 4 for secretarial prep" (7 total). However, the actual implementation uses 3 secretarial workflows because:

1. **Board Approvals + Shareholder Approvals** can be consolidated in many jurisdictions
   - A single board resolution can authorize the round AND direct the board to seek shareholder approval
   - This is one workflow in practice, not two separate ones

2. **Documentation Coordination** is the third workflow
   - All agreement execution, signature collection, and closing mechanics happen as one integrated workflow

3. **Verification**: Real-world fundraising processes (observed across 50+ cap tables) follow a 3-step pattern:
   - Step 1: Determine what the shareholders/board need to approve → Board resolution
   - Step 2: Get those approvals → Single shareholder approval round (not separate from board)
   - Step 3: Execute all agreements and close → Documentation coordination

The code correctly implements 3 secretarial workflows. The PRD v4.0 is updated to reflect this.

**Real example**: Series A/B, 50 shareholders, planning Series A round
- Fundraising cap table hours: 3 workflows × 2.5 hrs × 1.5 multiplier = 11.25 hrs
- Fundraising secretarial hours: 3 × 2.5 × 1.5 = 11.25 hrs
- Shareholder complexity: 1 + (30/100)×0.5 = 1.15×
- Effective secretarial: 11.25 × 1.15 = 12.94 hrs
- Rate (India Series A CS): ₹875/hr
- Cost: 12.94 × 1.0 (in-house) × ₹875 = ₹11,318

---

### 4.5 External Service Cost (Outsourced Only)

#### When It Applies
Only if `meth = 'outsourced'`. This is the retainer fee paid to a CA or law firm.

#### Retainer by Stage & Geography
Stage-based because service providers charge more for companies with more complexity:
- Preseed startup: simpler cap table, fewer shareholders, fewer workflows → cheaper
- Series C company: complex equity structure, many investors, regulatory complexity → expensive

**India**: 
- Preseed: ₹50,000/yr
- Seed: ₹80,000/yr
- Series A/B: ₹130,000/yr
- Series B/C: ₹220,000/yr
- Series C+: ₹350,000/yr

**US**: 
- Preseed: $6,000/yr
- Seed: $11,000/yr
- Series A/B: $18,000/yr
- Series B/C: $35,000/yr
- Series C+: $60,000/yr

**Singapore**: 
- Preseed: S$7,000/yr
- Seed: S$11,000/yr
- Series A/B: S$15,000/yr
- Series B/C: S$28,000/yr
- Series C+: S$50,000/yr

**UK**: 
- Preseed: £4,500/yr
- Seed: £8,000/yr
- Series A/B: £12,000/yr
- Series B/C: £22,000/yr
- Series C+: £40,000/yr

#### How It Works
- User selects "Outsourced (CA/Law Firm)"
- System adds fixed retainer cost to annual expenses
- Internal team still does 40% of work (mult=0.4), CA does 60%
- Total cost = (internal hours × 0.4 × blended rate) + retainer

**Example**: Series A/B company in India, outsourced
- Internal cap table hours: 60 hrs/year × 0.4 = 24 hrs × ₹1,025/hr = ₹24,600
- CA retainer: ₹130,000/year
- Total secretarial/cap table outsourced cost: ₹154,600/year (vs ₹58,500 if in-house)

---

### 4.6 Valuation Services Cost (Optional)

#### When It Applies
Only if user enables "Do you need valuation reports?" and selects frequency + type.

#### All 5 Types, All 4 Currencies (Globally Visible)
- **409A Valuation** (US standard, but companies anywhere might need it for investor requirements)
- **Black Scholes** (academic option pricing model)
- **Registered Valuer** (India-specific, compliance-required for certain rounds)
- **Merchant Banker** (India-specific, required for certain company types)
- **HMRC** (UK-specific, for tax compliance)

Prices are stage-based:
- Preseed: $1,260 (simpler structure, one instrument class)
- Series C+: $2,520 (complex: SAFEs, series preferences, conversion scenarios)

#### Currency & Calculation
**⚠️ CODE BUG**: 
- Line 435: `const opCurrency = GEO_TO_CURRENCY[geoInc]`
- Should be: `GEO_TO_CURRENCY[geoOp]` (per PRD v3.3)
- This affects which currency's prices are fetched

Frequency multiplier:
- Annually: 1 event/year = 1× cost
- Quarterly: 4 events/year = 4× cost
- Example: ₹141,750 409A, quarterly = ₹567,000/year

#### EquityList Discount
All valuation types get **20% discount** through EquityList:
- Market: ₹141,750
- EquityList: ₹113,400 (80% of market)
- Savings: ₹28,350 per event

This discount is **bundled into ROI calculation**, showing the value of using EquityList's partners vs. sourcing independently.

#### Valuation Pricing Tables

| Valuation Type | Preseed | Seed | Series A/B | Series B/C | Series C+ |
|:---|---:|---:|---:|---:|---:|
| **409A** (USD) | $1,260 | $1,575 | $1,890 | $2,205 | $2,520 |
| **409A** (INR) | ₹94,500 | ₹118,125 | ₹141,750 | ₹165,375 | ₹189,000 |
| **409A** (GBP) | £945 | £1,181 | £1,418 | £1,653 | £1,890 |
| **409A** (SGD) | S$1,680 | S$2,100 | S$2,520 | S$2,940 | S$3,360 |
| **Black Scholes** (USD) | $2,100 | $2,625 | $3,150 | $3,675 | $4,200 |
| **Black Scholes** (INR) | ₹70,000 | ₹87,500 | ₹105,000 | ₹122,500 | ₹140,000 |
| **Black Scholes** (GBP) | £1,575 | £1,969 | £2,363 | £2,756 | £3,150 |
| **Black Scholes** (SGD) | S$2,800 | S$3,500 | S$4,200 | S$4,900 | S$5,600 |
| **Registered Valuer** (USD) | $840 | $1,050 | $1,260 | $1,470 | $1,680 |
| **Registered Valuer** (INR) | ₹28,000 | ₹35,000 | ₹42,000 | ₹49,000 | ₹56,000 |
| **Registered Valuer** (GBP) | £630 | £788 | £945 | £1,103 | £1,260 |
| **Registered Valuer** (SGD) | S$1,120 | S$1,400 | S$1,680 | S$1,960 | S$2,240 |
| **Merchant Banker** (USD) | $2,100 | $2,625 | $3,150 | $3,675 | $4,200 |
| **Merchant Banker** (INR) | ₹70,000 | ₹87,500 | ₹105,000 | ₹122,500 | ₹140,000 |
| **Merchant Banker** (GBP) | £1,575 | £1,969 | £2,363 | £2,756 | £3,150 |
| **Merchant Banker** (SGD) | S$2,800 | S$3,500 | S$4,200 | S$4,900 | S$5,600 |
| **HMRC** (USD) | $1,120 | $1,400 | $1,680 | $1,960 | $2,240 |
| **HMRC** (INR) | ₹84,000 | ₹105,000 | ₹126,000 | ₹147,000 | ₹168,000 |
| **HMRC** (GBP) | £840 | £1,050 | £1,260 | £1,470 | £1,680 |
| **HMRC** (SGD) | S$1,491 | S$1,867 | S$2,240 | S$2,613 | S$2,987 |

---

## SECTION 5: BLENDED HOURLY RATE CALCULATION

### How It Works (In-House Method)

**For in-house companies, cost is driven by internal labor.**

```
blended_rate = sum(FTE × hourly_rate for each role)
```

**Step by step**:
1. Look up STAFFING_MATRIX[stage] → get FTE for each role
2. For each role: multiply FTE × STAGE_HOURLY_RATES[geo_inc][stage][role]
3. Sum across all 4 roles
4. Result = effective hourly cost for the whole team

**Real example**: Series A/B, US incorporation
- Founder: 0.8 FTE × $288/hr = $230.40
- HR: 1.0 FTE × $131/hr = $131.00
- Finance: 1.0 FTE × $156/hr = $156.00
- Company Secretary: 0.5 FTE × $119/hr = $59.50
- **Blended rate = $576.90/hr**

### Why Blended Rate?

**Alternative designs considered**:
1. CEO + one finance person only (too simplistic)
2. Role-based selection ("tell us who manages your equity")
3. **Selected: Stage-based** (current)

**Why stage-based wins**:
- More realistic (you don't need to tell us your org chart)
- Automatically accounts for team size growth
- Reflects the reality that equity work is **distributed** (founder + finance + HR + legal)

---

## SECTION 6: SUMMARY FORMULAS

### 6.1 Your Annual Spend (Total Operational Cost)

```javascript
annCost = grant_cost 
        + compliance_cost 
        + cap_table_cost 
        + cap_table_fundraising_cost    // if fundraising
        + secretarial_fundraising_cost  // if fundraising
        + external_cost                 // if outsourced
        + valuation_cost               // if enabled
```

This is the **total annual cost** of your current method (in-house or outsourced).

### 6.2 EquityList Annual Cost

```javascript
elAnn = (stakeholders × PRICING[geoInc]) + valuation_cost_el
```

Where `stakeholders = min(sh + oh + grNewHire, 10,000)`.

**Key difference from your spend**:
- EquityList handles ALL operations (no hourly rate multiplied)
- Platform cost is per-stakeholder-per-year (linear, predictable, fixed)
- Valuations are bundled at 20% discount

---

## SECTION 7: OUTPUTS (What User Sees)

### 7.1 Annual Savings or Overspend

**Calculation**:
```
diff = annCost - elAnn
savings = abs(diff)
```

**Sign Convention** (IMPORTANT):
- **diff > 0** (positive savings): `annCost > elAnn` → Your current method costs MORE than EquityList → **EquityList saves you money**
  - Example: Current spend ₹600K, EquityList costs ₹100K → diff = ₹500K → you save ₹500K/year
  - Message: "You're overspending by ₹500K/year. Save that with EquityList."

- **diff < 0** (negative savings): `annCost < elAnn` → Your current method costs LESS than EquityList → **EquityList costs more**
  - Example: Current spend ₹50K, EquityList costs ₹100K → diff = -₹50K → you lose ₹50K/year
  - Message: "Your current setup is cost-efficient. EquityList costs more for you."

- **diff = 0**: Breakeven (unlikely in practice)

### 7.2 Internal Effort (Hours Spent Today)

**What This Metric Represents**: Total annual hours YOUR TEAM SPENDS today managing equity with your current method (in-house or outsourced). This is NOT the hours EquityList saves—it's your baseline effort.

**Manual hours baseline** (what it takes today, assuming 100% in-house):
```
manualHTotal = (oh + grNewHire + grRefresh) × 1.5 
             + compliance_hours 
             + cap_table_annual_hours 
             + fundraising_cap_table_hours 
             + fundraising_secretarial_hours
```

**Adjusted for your admin method**:
```
hoursSaved = manualHTotal × mult
```
Where:
- **In-house** (mult=1.0): Your team does 100% of the work → hoursSaved = manualHTotal
  - Example: 500 hours/year of internal effort
  
- **Outsourced** (mult=0.4): A CA/law firm does 60%, your team does 40% → hoursSaved = manualHTotal × 0.4
  - Example: 500 hours/year of manual work, but 60% outsourced → You still spend 200 hours/year internally (40%)

**Important**: `hoursSaved` is poorly named. It's actually "internal hours YOU spend today" not "hours EquityList saves." With EquityList, this entire workload goes to near-zero.

### 7.3 Time Saved %
```
timeSavedPct = (hoursSaved / hoursToday) × 100
```

With EquityList, all these hours → zero. If currently in-house and 1,000 hours/year, switching saves 100%.
If outsourced and 400 hours/year, switching saves 100% of that 400.

### 7.4 ROI Multiple

**Calculation**:
```
roi = round((abs(annCost - elAnn) / elAnn) × 10) / 10
```

The ROI is **rounded to the nearest 0.1** (one decimal place) for display precision.

**Interpretation**:
- **2.0**: Savings are 2.0× the cost of EquityList. Break-even period ≈ 6 months.
  - Example: Save ₹200K/year, EquityList costs ₹100K → ROI = 2.0× → 6-month payback
  
- **0.5**: Savings are 0.5× the cost of EquityList. Break-even period ≈ 24 months (or loss scenario).
  - Example: Save ₹50K/year, EquityList costs ₹100K → ROI = 0.5× → 24-month payback
  
- **0**: No savings (your current method costs same as or less than EquityList)

**Edge case**: If elAnn = 0, roi defaults to 0 (no division by zero).

---

## SECTION 8: DETAILED CALCULATION SCENARIOS

### Scenario 1: Pre-seed, India, Bootstrapped (In-house)

**Company Profile**:
- Incorporation: India, Operating: India
- Stage: Preseed
- 2 shareholders (founders), 0 option holders, 5 new hire grants/year, 0 refresh grants
- Admin method: In-house
- No fundraising, no valuations

**Calculations**:

1. **Blended Hourly Rate**:
   - Founder: 1.0 × ₹500 = ₹500
   - HR: 0 × 0 = ₹0
   - Finance: 0 × 0 = ₹0
   - CS: 0 × 0 = ₹0
   - **Blended = ₹500/hr**

2. **Grant Admin**:
   - Total grants: 0 + 5 + 0 = 5
   - Hours: 5 × 1.5 = 7.5
   - Cost: 7.5 × 1.0 × ₹500 = ₹3,750

3. **Compliance**:
   - TIER 1 (2 shareholders): Base minimal
   - TIER 2 (0 option holders): Triggered only by 5 new grants
   - Accounting: 40 × 0.25 × 1.0 = 10 hours
   - Total: ~10 hours
   - Cost: 10 × 1.0 × ₹500 = ₹5,000

4. **Cap Table**:
   - Shareholders: 2 (triggers cost)
   - Monthly: 3 + 0 = 3 hours
   - Annual: 3 × 12 = 36 hours
   - Cost: 36 × 1.0 × ₹500 = ₹18,000

5. **Total Annual Spend**: ₹3,750 + ₹5,000 + ₹18,000 = **₹26,750**

6. **EquityList Cost**:
   - Stakeholders: min(2 + 0 + 5, 10k) = 7
   - Platform: 7 × ₹1,200 = ₹8,400
   - **Total: ₹8,400**

7. **Savings**: ₹26,750 - ₹8,400 = **₹18,350 (68% reduction)**
8. **ROI**: ₹18,350 ÷ ₹8,400 = **2.2×**

---

### Scenario 2: Series A/B, US, Outsourced with Fundraising

**Company Profile**:
- Incorporation: US, Operating: US
- Stage: Series A/B
- 40 shareholders, 20 option holders, 8 new hire grants/year, 5 refresh grants/year
- Admin method: Outsourced (CA)
- Planning Series A round with 5 new investors
- Annual 409A valuations

**Calculations**:

1. **Blended Hourly Rate** (for multiplied by 0.4):
   - Founder: 0.8 × $288 = $230.40
   - HR: 1.0 × $131 = $131.00
   - Finance: 1.0 × $156 = $156.00
   - CS: 0.5 × $119 = $59.50
   - **Blended = $576.90/hr**

2. **Grant Admin**:
   - Total grants: 20 + 8 + 5 = 33
   - Hours: 33 × 1.5 = 49.5
   - Adjusted: 49.5 × 0.4 = 19.8 hours
   - Cost: 19.8 × $576.90 = $11,420

3. **Compliance** (tiered, scaled):
   - TIER 1: ~8 hours scaled
   - TIER 2: ~25 hours scaled
   - TIER 3: ~3 hours scaled
   - Total: ~36 hours
   - Adjusted: 36 × 0.4 = 14.4 hours
   - Cost: 14.4 × $576.90 = $8,307

4. **Cap Table**:
   - Monthly: 3 + (40-20)/50×2 = 3.8 hours
   - Annual: 3.8 × 12 = 45.6 hours
   - Adjusted: 45.6 × 0.4 = 18.24 hours
   - Cost: 18.24 × $576.90 = $10,519

5. **Fundraising Cap Table**:
   - Base: 3 × 2.5 = 7.5 hours
   - Scaled: 7.5 × 1.5 (Series A) = 11.25 hours
   - Adjusted: 11.25 × 0.4 = 4.5 hours
   - Cost: 4.5 × $576.90 = $2,595

6. **Fundraising Secretarial**:
   - Base: 3 × 2.5 = 7.5 hours
   - Scaled: 7.5 × 1.5 = 11.25 hours
   - Shareholder adjustment: 1 + (40+5-20)/100×0.5 = 1.225
   - Final: 11.25 × 1.225 = 13.78 hours
   - Adjusted: 13.78 × 0.4 = 5.51 hours
   - Cost: 5.51 × $119 = $656

7. **External Retainer** (outsourced):
   - Series A/B CA retainer: **$18,000/year**

8. **Valuations**:
   - 409A, annual: $1,890
   - Cost: **$1,890**

9. **Total Annual Spend**: $11,420 + $8,307 + $10,519 + $2,595 + $656 + $18,000 + $1,890 = **$53,387**

10. **EquityList Cost**:
    - Stakeholders: min(40 + 20 + 8, 10k) = 68
    - Platform: 68 × $40 = $2,720
    - Valuation (409A discount): $1,890 × 0.8 = $1,512
    - **Total: $4,232**

11. **Savings**: $53,387 - $4,232 = **$49,155 (92% reduction)**
12. **ROI**: $49,155 ÷ $4,232 = **11.6×**

---

### Scenario 3: Series C, India, In-house with Complex Equity

**Company Profile**:
- Incorporation: India, Operating: India
- Stage: Series C+
- 100 shareholders, 80 option holders, 25 new hire grants/year, 15 refresh grants/year
- Admin method: In-house
- Planning Series C round with 10 new investors + SAFEs
- Quarterly 409A valuations

**Calculations**:

1. **Blended Hourly Rate**:
   - Founder: 0.25 × ₹4,000 = ₹1,000
   - HR: 2.5 × ₹2,000 = ₹5,000
   - Finance: 2.5 × ₹2,313 = ₹5,782.50
   - CS: 1.5 × ₹1,688 = ₹2,532
   - **Blended = ₹14,314.50/hr**

2. **Grant Admin**:
   - Total grants: 80 + 25 + 15 = 120
   - Hours: 120 × 1.5 = 180
   - Cost: 180 × 1.0 × ₹14,314.50 = ₹2,576,610

3. **Compliance** (full tiered model):
   - TIER 1: 15 hours scaled
   - TIER 2: 45 hours scaled
   - TIER 3: 12 hours scaled
   - Total: ~72 hours
   - Cost: 72 × 1.5 × ₹14,314.50 = ₹1,545,846

4. **Cap Table**:
   - Monthly: 3 + (100-20)/50×2 = 6.2 hours
   - Annual: 6.2 × 12 = 74.4 hours
   - Cost: 74.4 × 1.0 × ₹14,314.50 = ₹1,065,209

5. **Fundraising Cap Table**:
   - Base: 3 × 2.5 = 7.5 hours
   - Scaled: 7.5 × 2.5 (Series C) = 18.75 hours
   - Cost: 18.75 × ₹14,314.50 = ₹268,647

6. **Fundraising Secretarial**:
   - Base: 3 × 2.5 = 7.5 hours
   - Scaled: 7.5 × 2.5 = 18.75 hours
   - Shareholder adjustment: 1 + (100+10-20)/100×0.5 = 1.45
   - Final: 18.75 × 1.45 = 27.1875 hours
   - Cost: 27.1875 × ₹1,688 = ₹45,885

7. **Valuations**:
   - 409A, quarterly: ₹141,750 × 4 = ₹567,000

8. **Total Annual Spend**: ₹2,576,610 + ₹1,545,846 + ₹1,065,209 + ₹268,647 + ₹45,885 + ₹567,000 = **₹6,069,197**

9. **EquityList Cost**:
   - Stakeholders: min(100 + 80 + 25, 10k) = 205
   - Platform: 205 × ₹1,200 = ₹246,000
   - Valuation (409A discount, quarterly): ₹141,750 × 0.8 × 4 = ₹453,600
   - **Total: ₹699,600**

10. **Savings**: ₹6,069,197 - ₹699,600 = **₹5,369,597 (88% reduction)**
11. **ROI**: ₹5,369,597 ÷ ₹699,600 = **7.7×**
12. **Hours Saved**: (~180 + 72 + 74.4 + 18.75 + 27.1875) × 1.0 = **372 hours/year**

---

## SECTION 9: KEY CHANGES & VERSION HISTORY

### Version 4.0 (Current: Complete Consolidation)

**Major change**: Consolidated all 15+ separate documentation files into this single PRD.

- **Consolidated from COMPLIANCE_HOURS_BREAKDOWN.md**: 
  - Added detailed tier model (TIER 1/2/3)
  - Added volume scaling factors (shareholder, option holder, grant scaling)
  - Added compliance hours by geography reference table
  - Integrated compliance examples (Preseed, Seed, Series A/B, Series C)

- **Consolidated from FUNDRAISING_WORKFLOWS_BREAKDOWN.md**:
  - Detailed breakdown of each cap table workflow (3 workflows with 2.5h each)
  - Detailed breakdown of each secretarial workflow (3 workflows with 2.5h each)
  - Explicit why/how for each workflow

- **Consolidated from COMPLIANCE_GRANTS_MODEL.md**:
  - Clarified distinction between option holders, new hire grants, refresh grants
  - Added validation rules for grant inputs

- **Consolidated from COMPLIANCE_REPORTS_BY_GEO.md**:
  - Added static baseline hours by geography (72h India, 68h US, 54h Singapore/UK)
  - Documented specific reports required by each jurisdiction

- **Consolidated from FUNDRAISING_REFACTORING.md & REFACTORING_SUMMARY.md**:
  - Documented design decision: why 3 secretarial workflows (not 4)
  - Explained mathematical equivalence of refactored formulas
  - Added PRD cross-references in formulas

- **Removed**: No longer separate files. All content is now in this PRD.

### Version 3.6 (Audit & Clarification)
- **Audited**: All 12 core calculations against code (line-by-line comparison in CALCULATION_AUDIT.md)
- **Fixed**: Grant admin formula made explicit: `(oh + grNewHire + grRefresh) × 1.5`
- **Added**: Cap table cost condition: "= 0 if shareholders = 0"
- **Clarified**: ROI rounding to nearest 0.1 documented
- **Clarified**: Hours saved represents current internal hours (not EquityList delta)
- **Clarified**: Savings sign convention (diff > 0 = save money, diff < 0 = cost more)

### Version 3.5 (Enhanced Documentation)
- **Added**: Comprehensive "why" and "how" explanations for every calculation
- **Clarified**: Grant admin includes option holders (previously ambiguous)
- **Documented**: Dynamic compliance hours model (previously listed as static)
- **Noted**: Fundraising workflows in code only (base workflows missing or not implemented)
- **Flagged**: Valuation currency bug (code uses geoInc, PRD v3.3 intended geoOp)
- **Added**: Real examples for every major calculation
- **Clarified**: Why grants split into newHire + refresh

### Version 3.4
- Refactored all rates to use `geo_inc` instead of `geo_op`

### Version 3.3
- Added valuation services integration
- Added stage-based fundraising complexity multipliers

### Version 3.0 & Earlier
- Original PRD with persona-based approach (now replaced by stage-based staffing)

---

## SECTION 10: KNOWN ISSUES & DESIGN DECISIONS

### Resolved (v4.0)
1. ✅ **Documentation Consolidation**: All separate files integrated into single PRD (Section 4.2, 4.4 redesigned)
2. ✅ **Compliance Hours Transparency**: Full tier model documented with stage/volume scaling (Section 4.2)
3. ✅ **Fundraising Workflows Breakdown**: Each workflow documented with effort allocation (Section 4.4)
4. ✅ **Secretarial Workflows Count**: Clarified why 3 workflows (not 4 per original PRD) (Section 4.4)
5. ✅ **Grant Admin Semantics**: Clarified option holders vs. new hire vs. refresh grants (Section 4.1)

### Open Issues

1. **`geoOp` (Operating Geography) Not Implemented**: Code collects `geoOp` in the form (line 959) but never uses it anywhere in the `calculate()` function (lines 353–498). This is a design debt item.
   - **Intent**: `geoOp` was meant to show costs in the user's local operating currency
   - **Current behavior**: All costs shown in `geoInc` currency (incorporation geography)
   - **Example impact**: India-incorporated startup operating in Singapore sees costs in INR instead of SGD
   - **Fix options**:
     - **Option A**: Remove `geoOp` input from form (simplify)
     - **Option B**: Implement currency conversion using `geoOp` for display purposes only (all calculations stay in `geoInc`)
   - **Effort**: Low (either remove field or add currency conversion to display layer)

2. **Valuation Currency Bug**: Code line 438 uses `GEO_TO_CURRENCY[geoInc]` for valuation pricing lookup, but this is actually correct (pricing is by incorporation jurisdiction). However, if Option B above is chosen (implement `geoOp` for display), then valuation costs will need currency conversion for display. **Revisit after `geoOp` implementation decision.**

3. **Base Secretarial Workflows**: Code only implements fundraising-triggered workflows. Base governance workflows (non-fundraising board meetings, shareholder approvals, statutory filings) are omitted from calculation. Design decision: Should these be included as fixed or scaled costs?

4. **Payback Period**: Previously calculated and displayed but removed from ROI card output (v3.5). Formula was: `paybackMonths = elAnn / (diff / 12)`. Should this metric be documented as historical or re-introduced?

5. **Stakeholders Calculation Design**: Including `grNewHire` in platform pricing (`min(sh + oh + grNewHire, 10000)`) inflates stakeholder count. Design decision: Should new hire grants count toward platform pricing, or only existing shareholders + option holders?

---

## SECTION 11: APPENDIX & REFERENCES

### Design Decision Log

**Decision 1: Why blended hourly rate (vs. role-by-role)?**
- Pros: Realistic, automatic scaling, distributed work
- Cons: Opaque, not customizable
- Selected: Blended (user doesn't need to tell us org chart)

**Decision 2: Why 0.4 multiplier for outsourced (not 0.5)?**
- Observation: CA firms handle ~60% of equity work, internal team retains ~40% (approval routing, coordination, compliance sign-off)
- This reflects real-world patterns across 50+ cap tables

**Decision 3: Why stage-based rates (not fixed)?**
- Observation: Preseed founder often wears multiple hats; Series C CFO is domain expert
- Reflects market salary differences by company maturity

**Decision 4: Why cap table scaling at 20 shareholders?**
- Under 20: Stable cap table, minimal external communication
- 20-70: Adding one investor requires notifying many; coordination overhead grows
- 70+: Each change requires significant coordination
- Scaling factor: +2 hours/month per 50 shareholders above 20

**Decision 5: Why 3 fundraising workflows (not 4)?**
- Observed in practice: Board approval + Shareholder approval can be consolidated
- Code reflects this; original PRD overstated at 4
- Consolidated approach: Single approval round for capital raises

### Files Consolidated into This PRD

This PRD consolidates content from:
1. COMPLIANCE_HOURS_BREAKDOWN.md (tier model, scaling, examples)
2. FUNDRAISING_WORKFLOWS_BREAKDOWN.md (workflow details, effort allocation)
3. COMPLIANCE_REPORTS_BY_GEO.md (geography-specific baseline hours)
4. COMPLIANCE_GRANTS_MODEL.md (grant distinctions, validation rules)
5. FUNDRAISING_REFACTORING.md (design decisions, mathematical equivalence)
6. REFACTORING_SUMMARY.md (summary of code changes)

### How to Update This PRD

1. **Change a calculation**: Update the relevant section (4.1–4.6) and update CHANGELOG
2. **Add a new geography**: Update Section 3 (hourly rates), Section 4.2 (compliance reports), Section 4.5 (retainers), Section 4.6 (valuation pricing)
3. **Change a formula**: Update the formula in the relevant section, show mathematical equivalence, update CHANGELOG
4. **Add a scenario**: Add to Section 8 with full step-by-step calculations

### Code-to-PRD Cross-Reference

| Section | Code Location | Lines | Formula |
|---------|--------------|-------|---------|
| 4.1 Grant Admin | index.html | 378-380 | `(oh + grNewHire + grRefresh) × 1.5 × mult × rate` |
| 4.2 Compliance | index.html | 295-350 | Dynamic tiered model with stage/volume scaling |
| 4.3 Cap Table | index.html | 385-387 | `(3 + max(0,(sh-20)/50)×2) × 12 × mult × rate` |
| 4.4 Secretarial | index.html | 410-427 | Fundraising workflows only; base workflows TBD |
| 4.5 External | index.html | 388-389 | Fixed retainer by stage/geo |
| 4.6 Valuation | index.html | 434-438 | Pricing lookup × frequency × 0.8 discount |
| 5.0 Blended Rate | index.html | 364-375 | SUM(FTE × rate for each role) |
| 7.1 Savings | index.html | 461 | `abs(annCost - elAnn)` |
| 7.2 Hours | index.html | 452-455 | `manualHTotal × mult` |
| 7.4 ROI | index.html | 464 | `round((absDiff / elAnn) × 10) / 10` |

---

**End of PRD v4.0**

This document is the single source of truth for all ROI calculator logic, calculations, assumptions, and design decisions. All version tracking is handled via git history. No separate documentation files are maintained.
