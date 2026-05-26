# EquityList ROI Calculator — Complete Technical Specification (Enhanced)

**Version**: 3.5 (Enhanced with detailed implementation notes)  
**Last Updated**: May 26, 2026  
**Purpose**: Complete technical and functional documentation with "why" and "how" clarifications for every calculation, assumption, and design decision.

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
- Determines **which roles are needed onshore** (Can you outsource some work?)
- Determines **currency for display** (Show costs in the user's local currency)
- Does NOT affect calculation (all calculations use incorporation country rates)

**Real example**: An India-incorporated startup operating in Singapore
- Compliance requirements: Follow India's SH-6 rules (incorporation jurisdiction controls)
- Labor costs: Use India hourly rates for internal staff (cheaper, can work remotely)
- Display currency: Show in SGD (where they're spending money)

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

**Why it's optional**: Not all companies are fundraising; this adds 7+ workflows for 2-3 months of the year

**Impact on calculation**:
- Adds `FUNDRAISING_WORKFLOWS.capTable` (3 workflows × 2.5 hrs = 7.5 hrs baseline)
- Adds `FUNDRAISING_WORKFLOWS.secretarial` (3 workflows × 2.5 hrs = 7.5 hrs baseline)
- Both scaled by `ROUND_COMPLEXITY[fundraiseRound]` (0.5× for SAFE, 1.0× for Seed, 2.5× for Series C+)
- Shareholder count increases by `newShareholdersFromFundraise` for cost calculations

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

```javascript
const STAFFING_MATRIX = {
  preseed:  { founder: 1.0,  hr: 0,    finance: 0,   cs: 0    },  // Solo founder
  seed:     { founder: 1.0,  hr: 0.5,  finance: 0.5, cs: 0    },  // Founder + part-time finance/HR
  seriesab: { founder: 0.8,  hr: 1.0,  finance: 1.0, cs: 0.5  },  // Dedicated finance/HR + founder oversight
  seriesbc: { founder: 0.5,  hr: 2.0,  finance: 2.0, cs: 1.0  },  // Scaled team, founder strategic only
  seriesc:  { founder: 0.25, hr: 2.5,  finance: 2.5, cs: 1.5  }   // Mature operations
};
```

**Role definitions**:
- **Founder/CEO** (0.25–1.0 FTE): Equity oversight, board decisions, option approval, negotiation
- **HR Lead** (0–2.5 FTE): Cap table maintenance, grant issuance, vesting administration, employee communications
- **Finance/CFO** (0–2.5 FTE): Equity accounting (ASC 718, IND AS 102, IFRS 2), compliance reporting, tax compliance, valuations
- **Company Secretary/Legal** (0–1.5 FTE): Board meetings, shareholder resolutions, statutory filings, regulatory compliance

**Why it scales this way**:
- **Preseed**: Founder does everything (cap table, board meetings, grant letters, regulatory filings)
- **Seed**: Growth to 10–20 employees. Founder can't handle it alone. Part-time finance/HR split equity admin.
- **Series A/B**: 30–80 employees. Dedicated HR and Finance roles. Founder reduced to strategic decisions. Company Secretary (0.5 FTE) handles governance.
- **Series B/C**: 100+ employees. Full finance/HR teams. Founder 0.5 FTE on equity strategy. CS 1.0 FTE on governance and board operations.
- **Series C+**: 200+ employees. Mature structure. Multiple specialists. Founder 0.25 FTE (board-level only). CS 1.5 FTE (ongoing governance, regulatory).

**Important**: These are NOT "how many people you must hire." They're the **fraction of time equity admin consumes** from each role. Example:
- Series A/B Company Secretary: 0.5 FTE = 1 person spending 50% of their time on equity, OR 2 people spending 25% each on equity

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
**CODE vs PRD DISCREPANCY**: 
- PRD v3.4 formula (§4.1, line 186): `gr × grHr`
- **Code actually does** (line 380): `oh + grNewHireNum + grRefreshNum`
- **Why?** Every option holder needs annual refreshes to maintain equity. Even if they don't get new grants, maintaining option records requires effort.
- **CORRECTION NEEDED IN PRD**: Line 186 should read: `(oh + gr) × grHr`

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

The **volume** of reporting scales with company size.

#### The Actual Implementation (Code vs PRD Mismatch)

**⚠️ MAJOR DISCREPANCY**: 
- **PRD §4.2** (lines 198–205): Claims fixed baseline hours (72 for India, 68 for US, 54 for UK/SG)
- **Code actually implements** (lines 295–350): Dynamic, tiered, volume-scaled calculation
- **This is a complete rewrite needed**

#### The Three-Tier Model (What Code Actually Does)

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
  - Cap table: 2 × 1.0 scale × 1 + (40-10)/100 = 2.6 hours
  - Ledger: 3 × 1.0 scale × 1.3 = 3.9 hours
- **TIER 2** (25 option holders, 13 grants):
  - Equity plan: 1 × 1.0 = 1 hour
  - Grant summary: 1 × (1 + (13-3)/30) = 1.33 hours
  - Vesting: 0.5 × (1 + (25-5)/50) = 0.7 hours
  - IND AS 102: 4 × (1 + (25-5)/50) = 5.6 hours
  - SH-6: 4 × 1.4 = 5.6 hours
- **Total TIER 2**: 14.19 hours
- **Stage scaling**: 1.0× (Series A/B) → Total ~20 hours
- **Cost**: 20 × 0.4 (outsourced) × ₹1,025 (Series A HR rate) = ₹8,200/year

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
base_hours_per_month = 3
shareholder_scaling = max(0, (shareholders - 20) / 50)
monthly_hours = 3 + (shareholder_scaling × 2)
annual_hours = monthly_hours × 12
cap_table_cost = annual_hours × method_multiplier × blended_rate
```

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

When raising capital, add 7 extra workflows:

**Cap Table (3 workflows × 2.5 hrs = 7.5 hrs baseline)**:
1. Pre-round cap table modeling (what's the current ownership post-round?)
2. Security issuance documentation (SAFEs, stock purchase agreements)
3. Post-close reconciliation (updated cap table, shareholder records)

**Secretarial (3 workflows × 2.5 hrs = 7.5 hrs baseline)**:
1. Board approval for fundraising (existing board meeting + fundraising resolution)
2. Shareholder approval (existing shareholders approve new investors)
3. Documentation coordination (share certificates, cap table updates, investor onboarding)

**Round Complexity Multiplier** (applied to both cap table and secretarial):
- SAFE: 0.5× (simple document, minimal coordination)
- Bridge: 0.75×
- Seed: 1.0× (standard complexity)
- Series A/B: 1.5× (more shareholders to coordinate with)
- Series B/C: 2.0× (institutional investors, more due diligence coordination)
- Series C+: 2.5× (complex round, multiple investor classes)

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
```
diff = annCost - elAnn
```
- **Positive**: "You're overspending by $X/year. Save $X with EquityList."
- **Negative**: "Your current setup is cost-efficient. EquityList isn't a cost-saver for you; it's a risk-mitigation play."
- **Zero**: Breakeven

### 7.2 Internal Effort (Hours)

**Manual baseline** (if 100% internal):
```
manualHTotal = (oh + grNewHire + grRefresh) × 1.5 
             + compliance_hours 
             + cap_table_annual_hours 
             + fundraising_cap_table_hours 
             + fundraising_secretarial_hours
```

**Adjusted for method**:
```
adjustedHTotal = manualHTotal × mult
```
- In-house: mult=1.0 (all hours count)
- Outsourced: mult=0.4 (only 40% internal overhead)

### 7.3 Time Saved %
```
timeSavedPct = (hoursSaved / hoursToday) × 100
```

With EquityList, all these hours → zero. If currently in-house and 1,000 hours/year, switching saves 100%.
If outsourced and 400 hours/year, switching saves 100% of that 400.

### 7.4 ROI Multiple
```
roi = abs(savings) / elAnn
```
- **2.0**: Savings are 2× the cost of EquityList (break-even in 6 months)
- **0.5**: Savings are half the cost (take 24 months to break even)

---

## SECTION 8: KEY CHANGES FROM PREVIOUS VERSIONS

### Version 3.5 (Current: Enhanced Documentation)
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

## KNOWN ISSUES & CLARIFICATIONS NEEDED

1. **Base Secretarial Workflows**: Code only implements fundraising workflows. Are base governance workflows (board meetings, shareholder approvals, statutory filings) calculated separately or omitted?

2. **Valuation Currency**: Code line 435 uses `geoInc`, but PRD v3.3 intended `geoOp`. Needs fix in code or clarification in intent.

3. **Stakeholders Calculation**: Including `grNewHire` in platform pricing calculation inflates count. Needs design decision: should new hire grants count toward platform pricing, or only existing option holders?

4. **Grant Admin Formula**: PRD line 186 is incomplete. Should explicitly include `oh` (option holders) in the formula.

---

## APPENDIX: CALCULATION WALKTHROUGH (Complete Example)

**Company Profile**:
- Series A/B, India incorporation & operation
- 40 shareholders, 20 option holders, 8 new hire grants/year, 5 refresh grants/year
- In-house equity admin
- Planning to raise Series A round with 5 new investors
- Needs annual 409A valuations

**Step 1: Blended Hourly Rate**
- Staffing: founder 0.8, HR 1.0, finance 1.0, CS 0.5
- Rates (India, Series A/B): founder ₹1,875, HR ₹1,025, finance ₹1,188, CS ₹875
- Blended = (0.8×1,875) + (1.0×1,025) + (1.0×1,188) + (0.5×875)
- Blended = ₹4,348.50/hr

**Step 2: Grant Administration**
- Total grants: 20 + 8 + 5 = 33 events
- Hours: 33 × 1.5 = 49.5 hrs
- Cost: 49.5 × 1.0 × ₹4,348.50 = ₹215,291

**Step 3: Compliance Reporting** (dynamic, tiered)
- Tier 1 (shareholders): 2 hrs scaled by 1+(40-10)/100 = 3.6 hrs; plus 3 hrs scaled = 3.9 hrs → 7.5 hrs
- Tier 2 (options): 1 + 1.33 + 0.7 + 4×1.4 + 4×1.4 = 15.23 hrs
- Total: ~23 hrs
- Cost: 23 × 1.0 × ₹4,348.50 = ₹100,036

**Step 4: Cap Table Maintenance**
- Monthly: 3 + (40-20)/50 × 2 = 4 hrs/month
- Annual: 4 × 12 = 48 hrs
- Cost: 48 × 1.0 × ₹4,348.50 = ₹208,728

**Step 5: Fundraising (Cap Table)**
- Workflows: 3 × 2.5 × 1.5 (Series A multiplier) = 11.25 hrs
- Cost: 11.25 × 1.0 × ₹4,348.50 = ₹48,921

**Step 6: Fundraising (Secretarial)**
- Workflows: 3 × 2.5 × 1.5 = 11.25 hrs
- Shareholder scaling: 1 + (40+5-20)/100×0.5 = 1.225
- Effective: 11.25 × 1.225 = 13.78 hrs
- Cost: 13.78 × 1.0 × ₹875 = ₹12,057

**Step 7: Valuation**
- 409A, annual: ₹141,750/event
- Cost: ₹141,750

**Total Annual Spend**: 215,291 + 100,036 + 208,728 + 48,921 + 12,057 + 141,750 = **₹726,783/year**

**EquityList Cost**:
- Stakeholders: min(40+20+8, 10k) = 68
- Platform: 68 × ₹1,200 = ₹81,600
- Valuation (EquityList 409A): ₹113,400 (20% discount)
- Total: **₹194,000/year**

**Savings**: ₹726,783 - ₹194,000 = **₹532,783/year**  
**ROI**: ₹532,783 ÷ ₹194,000 = **2.7× savings**  
**Time Saved**: ~268 hours/year

---
