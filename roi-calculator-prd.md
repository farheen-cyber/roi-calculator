# EquityList ROI Calculator — Complete Specification

**Version**: 3.3  
**Last Updated**: April 29, 2026  
**Purpose**: Complete technical and functional documentation of the EquityList ROI Calculator, including all features, formulas, assumptions, data sources, and test scenarios.

## What This Calculator Does

The EquityList ROI Calculator is a financial estimation and analysis tool that models the total annual cost of equity administration for companies at different funding stages and geographies. It compares:

- **Current Method Cost**: What companies spend annually on equity management (in-house or outsourced)
- **EquityList Cost**: What they would spend using EquityList's platform for administration
- **Savings & ROI**: Annual savings, time saved, and ROI multiple for adopting EquityList

The calculator accounts for:
- Geographic complexity (4 countries, country-specific regulations and rates)
- Company stage (5 funding stages with stage-specific staffing models)
- Equity administration tasks (grants, compliance, cap table, board operations)
- Optional features (fundraising planning, valuation reports)
- All cost components including platform fees, internal overhead, and external services

---

## OVERVIEW: Calculator Architecture & User Flow

### What is the Calculator?
The EquityList ROI Calculator is a financial estimation tool that compares the total annual cost of in-house or outsourced equity administration against EquityList's platform cost, showing companies their potential savings and operational efficiency gains.

### Primary Goal
Display a clear ROI case: how much a company spends annually managing equity, cap tables, and compliance, versus how much they'd spend on EquityList + minimal internal oversight.

### User Journey
1. **Input Phase** (Step 1 & 2): User enters company fundamentals (shareholders, grants, geography, stage, method) via manual entry form
2. **Optional Enhancements**: 
   - Fundraising planning: If planning to raise capital, enter round type, timing, and expected new shareholders
   - Valuation Assessment: If company needs third-party valuations, define frequency and type
3. **Results Phase**: Calculator displays:
   - Annual cost of current method (in-house or outsourced)
   - Annual EquityList cost
   - Savings or overspend
   - ROI multiple
   - Detailed cost breakdown
   - Hours saved annually

### Key Concepts
- **Blended Hourly Rate**: For in-house method, the cost of equity operations is based on the sum of (FTE × role hourly rate) for the company stage. This accounts for multi-person effort (founder, HR, Finance, Legal).
- **Method Multiplier**: The fraction of work retained internally (1.0 for in-house, 0.4 for outsourced with CA/Legal help).
- **Geographic Duality**: Two geography inputs serve different purposes:
  - `geo_inc` (incorporation): Determines compliance requirements, valuation types available, and currency display for all costs (ensures users see what they'd actually pay)
  - `geo_op` (operations): Determines hourly rates, retainer costs, and per-stakeholder EquityList pricing
- **Stage-Based Staffing**: Equity admin workload scales predictably with funding stage. A preseed founder does everything; a Series C company has dedicated teams.

---

## 1. Input Mapping & Normalization

### Required Inputs (Step 1 & 2)

| UI Input | Variable | Range / Type | Default | Notes |
|:---|:---|:---|:---|:---|
| Legal Entity Name | `co` | String | — | Optional, for reference only |
| Country of Incorporation | `geo_inc` | India, US, Singapore, UK | India | Determines compliance requirements, valuation types, and currency display |
| Country of Operation | `geo_op` | India, US, Singapore, UK | India | Determines hourly rates, retainer costs, and per-stakeholder EL pricing |
| Current Funding Stage | `stage` | Preseed, Seed, Series A/B, Series B/C, Series C+ | Series A/B | Determines staffing matrix and hourly rates |
| Shareholders Count | `sh` | Positive integer: 1–10,000 | 30 | Affects cap table and secretarial scaling |
| Option Holders Count | `oh` | Positive integer: 0–10,000 | 15 | Counted toward total stakeholders for pricing |
| Annual Equity Grants | `gr` | Positive integer: 1–365+ | 10 | Number of grant issuance events per year |
| Administration Method | `meth` | In-house \| Outsourced | In-house | Determines cost model (blended rate vs. retainer) |

### Optional Inputs (Step 2)

| UI Input | Variable | Range / Type | Default | Notes |
|:---|:---|:---|:---|:---|
| Planning to Fundraise | `planningToFundraise` | Boolean | No (OFF) | If YES, unlocks fundraising subsection |
| Fundraising Round | `fundraiseRound` | Seed, Series A, Series B, Series C, SAFE/Bridge | — | Only if planning to fundraise; overrides stage if specific round |
| Fundraising Timing | `fundraiseTiming` | 3, 6, 9, or 12 months | — | Only if planning to fundraise; for impact messaging |
| Expected New Shareholders | `newShareholdersFromFundraise` | Positive integer ≥ 0 | 0 | Only if planning to fundraise; adds to shareholder scaling |
| Need Valuation Reports | `needsValuation` | Boolean | No (OFF) | If YES, unlocks valuation subsection |
| Valuation Frequency | `valuationFrequency` | Annually \| Quarterly | — | Only if valuations needed; affects cost multiplier |
| Valuation Report Type | `valuationType` | 409A, Black Scholes, Registered Valuer, Merchant Banker, HMRC | — | Only if valuations needed; all types visible globally with prices converted to incorporation country currency (see §4.6) |

**Notes:** 
- The "Managed By" field has been removed. Staffing and roles are now determined by company stage via the staffing matrix (see §2.3).
- Optional inputs don't require user interaction unless explicitly enabled via toggle.
- When optional inputs are disabled, their parameters pass as empty/zero to `computeROI()` and are excluded from calculations.

---

## 2. Derived Base Metrics

### 2.1 Total Stakeholders
Used for EquityList platform pricing. Capped at 10,000 maximum.
```javascript
stakeholders = min(sh + oh, 10000)
```

### 2.2 Method Multipliers (`mult`)
Represents the fraction of execution effort retained by the internal team.
- **In-house**: 1.0 (100%)
- **Outsourced (CA/Legal)**: 0.4 (40%) — *Reflects time spent on review, approval, and coordination.*

### 2.3 Stage-Based Staffing Matrix
Determines FTE (Full-Time Equivalent) allocation by role for each company stage. This replaces the old persona-based approach.

```javascript
const STAFFING_MATRIX = {
  preseed: { founder: 1.0, hr: 0, finance: 0, cs: 0 },
  seed: { founder: 1.0, hr: 0.5, finance: 0.5, cs: 0 },
  seriesab: { founder: 0.8, hr: 1.0, finance: 1.0, cs: 0.5 },
  seriesbc: { founder: 0.5, hr: 2.0, finance: 2.0, cs: 1.0 },
  seriesc: { founder: 0.25, hr: 2.5, finance: 2.5, cs: 1.5 }
};
```

**Role Definitions:**
- `founder`: CEO/Founder equity oversight
- `hr`: HR/People Operations managing cap table and option grants
- `finance`: Finance/CFO managing equity accounting and reporting
- `cs`: Company Secretary/Legal handling governance and regulatory compliance
```

**Staffing Allocation Rationale:**
- **Pre-seed**: Solo founder handles all equity admin
- **Seed**: Founder still leads; beginning to split finance/HR (0.5 FTE each)
- **Series A/B**: Dedicated HR and Finance roles join; founder reduces to 0.8 FTE oversight
- **Series B/C**: Scaled team with more HR and Finance; founder mostly strategy (0.5 FTE)
- **Series C+**: Mature team structure; founder strategic involvement (0.25 FTE), seasoned HR/Finance/Legal leads

### 2.4 Geographic Model
The calculator accepts two geography inputs:
- **`geo_inc`** (Country of Incorporation): Used for compliance requirements
  - Determines statutory register requirements (India SH-6, US Rule 701, etc.)
  - Determines baseline compliance hours (COMPLIANCE[geo_inc])
  
- **`geo_op`** (Country of Operation): Used for hourly rates, external retainer costs, and EL pricing
  - Selects industry-standard hourly rates per role and stage (STAGE_HOURLY_RATES[geo_op])
  - Determines stage-based external retainer cost (if method = Outsourced): STAGE_RETAINER[geo_op][stage]
  - Determines per-stakeholder EquityList pricing (PRICING[geo_op]) — already in local currency
  - All cost outputs are denominated in `geo_op`'s local currency; no FX conversion is performed

---

## 3. Hourly Rate Assumptions (Industry Benchmarks)

Stage-based hourly rates by role and geography. Rates reflect market-standard compensation for equity administration professionals at each funding stage. Annual salary ÷ 2,080 working hours (52 weeks × 40 hrs).

**United States ($/hr)**
| Role | Preseed | Seed | Series A/B | Series B/C | Series C+ |
|:---|---:|---:|---:|---:|---:|
| Founder/CEO | $113 | $181 | $288 | $356 | $431 |
| Finance/CFO | $69 | $110 | $156 | $200 | $250 |
| HR Lead | $63 | $94 | $131 | $169 | $219 |
| Legal/Secretarial | $56 | $88 | $119 | $150 | $200 |

**India (₹/hr)**
| Role | Preseed | Seed | Series A/B | Series B/C | Series C+ |
|:---|---:|---:|---:|---:|---:|
| Founder/CEO | ₹500 | ₹1,000 | ₹1,875 | ₹2,750 | ₹4,000 |
| Finance/CFO | ₹325 | ₹650 | ₹1,188 | ₹1,688 | ₹2,313 |
| HR Lead | ₹288 | ₹563 | ₹1,025 | ₹1,438 | ₹2,000 |
| Legal/Secretarial | ₹250 | ₹475 | ₹875 | ₹1,225 | ₹1,688 |

**Singapore (S$/hr)**
| Role | Preseed | Seed | Series A/B | Series B/C | Series C+ |
|:---|---:|---:|---:|---:|---:|
| Founder/CEO | $100 | $188 | $331 | $431 | $563 |
| Finance/CFO | $69 | $119 | $200 | $275 | $375 |
| HR Lead | $63 | $103 | $181 | $250 | $325 |
| Legal/Secretarial | $54 | $85 | $150 | $213 | $288 |

**United Kingdom (£/hr)**
| Role | Preseed | Seed | Series A/B | Series B/C | Series C+ |
|:---|---:|---:|---:|---:|---:|
| Founder/CEO | £63 | £110 | £181 | £225 | £281 |
| Finance/CFO | £44 | £70 | £110 | £138 | £188 |
| HR Lead | £40 | £63 | £98 | £125 | £169 |
| Legal/Secretarial | £31 | £55 | £85 | £113 | £150 |

> ⚠ **Note on Staffing Premium**: Rates are stage-aware, not persona-selected. The blended hourly rate is calculated as the sum of (FTE × role_rate) for all roles in the staffing matrix for the selected stage. This eliminates the need for a CEO premium multiplier.

---

## 4. Cost Components (PRD Match Logic)

### 4.1 Grant Administration Cost
**Formula**: `gr × grHr hrs × mult × blended_rate`
- **Baseline**: 1.5 hours per grant (90 mins).
- **Execution Breakdown**:
    - Drafting letter: 20m
    - Vesting setup: 15m
    - Approval routing: 20m
    - Employee comms: 15m
    - Record-keeping: 10m
    - Error checking: 10m

### 4.2 Compliance & Reporting Cost
**Formula**: `base_comp_hours[geo_inc] × mult × blended_rate`
- **Baseline Hours (Manual)** — varies by country of incorporation:
    - **India**: 72 hrs/yr
    - **US**: 68 hrs/yr
    - **Singapore / UK**: 54 hrs/yr
- **Regulatory Scope** (by country of incorporation):
    - **India**: SH-6 Statutory Register, IND AS 102/15 Equity Expense.
    - **US**: ASC 718/820 Equity Expense, Rule 701 Compliance.
    - **Europe/Asia**: IFRS 2 Share-based Payment.

### 4.3 Cap Table Maintenance Cost
**Formula**: `monthly_hours × 12 months × mult × blended_rate`

Where `monthly_hours = 3 + max(0, (sh - 20) / 50) × 2`

**Breakdown:**
- **Base**: 3 hours/month (standard monthly reconciliation, board updates, record-keeping)
- **Scaling**: +2 hours/month for every 50 shareholders above 20
  - 20 shareholders: 3 hrs/month = 36 hrs/yr
  - 70 shareholders: 3 + (50/50) × 2 = 5 hrs/month = 60 hrs/yr
  - 120 shareholders: 3 + (100/50) × 2 = 7 hrs/month = 84 hrs/yr
  - 220 shareholders: 3 + (200/50) × 2 = 11 hrs/month = 132 hrs/yr

**Rationale**: Cap table complexity grows with stakeholder count. Beyond 20 shareholders, coordination overhead increases non-linearly due to shareholder notifications, approval tracking, and amendment management.

### 4.4 Secretarial & Board Operations Cost
**Formula**: `(base_workflows + fundraising_workflows) × 2.5 × (1 + max(0, (sh - 20) / 100) × 0.5) × mult × cs_rate[geo_op][stage]`

Where:
- `base_workflows` = governance workflows required by law in that country
- `fundraising_workflows` = 3 additional workflows if planning to fundraise (cap table + secretarial prep); 0 otherwise
- `cs_rate` = Company Secretary/Legal role hourly rate for geo_op and stage

**Base Governance Workflows by Geography and Stage** (required by law):
- **India** (Companies Act 2013): 1, 8, 12, 20, 30 workflows/yr for preseed, seed, series a/b, series b/c, series c+
- **US** (No legal minimum, investor-driven): 0, 4, 8, 12, 16 workflows/yr
- **UK** (Companies Act 2006 AGM requirement): 1, 4, 6, 10, 14 workflows/yr
- **Singapore** (Companies Act AGM requirement): 1, 4, 6, 10, 14 workflows/yr

**What Counts as One "Workflow"** (each represents ~2.5 hours of Company Secretary effort):
- **Board Meeting**: Agenda prep, notice, circulation, minutes, approval tracking, filing
- **Shareholder Approval**: Notice of proposed action, voting materials, collection, documentation
- **Statutory Filing**: SH-6 register update, Form 351, ROC filings, etc.
- **Equity Amendment**: Documentation for grants, conversions, surrenders, or retirements
- **Compliance Report**: Annual compliance summary, register reconciliation, statutory certifications

**Why Counts Vary by Country**:
- **India**: Mandatory minimum 4 board meetings/year + material changes trigger shareholder approvals; frequent SH-6 updates
- **US**: No legal minimum for private companies; quarterly boards typical but driven by investors
- **UK/Singapore**: Annual AGM required (1 workflow min) + quarterly boards typical for VC-backed companies

**Calculation Breakdown**:
1. **Base hours**: workflows × 2.5 hours per workflow (average for documentation, approvals, meetings)
2. **Shareholder complexity multiplier**: 1 + max(0, (sh - 20) / 100) × 0.5
   - 20 shareholders: 1.0x (standard)
   - 100 shareholders: 1.4x (more documents, more signatures)
   - 200 shareholders: 1.9x (significantly more coordination)
3. **Method multiplier**: 1.0 (in-house) or 0.4 (outsourced)
4. **Hourly rate**: Legal/Secretarial role rate from STAGE_HOURLY_RATES

**Why It Varies by Geography**:
- **India**: Legally requires minimum 4 board meetings/year + material change shareholder approvals
- **USA**: No legal minimum for private companies; investor-driven (typically quarterly boards)
- **UK & Singapore**: Annual AGM required; quarterly boards expected for investor companies

**Example Calculation** (Series A/B, India, 100 shareholders, in-house):
- Base workflows: 12/year
- Shareholder scaling: 1 + (100 - 20) / 100 × 0.5 = 1.4x
- Hours: 12 × 2.5 × 1.4 = 42 hours/year
- Legal/Secretarial rate (India, Series A/B): ₹875/hr
- Cost: 42 × 1.0 × ₹875 = ₹36,750/year

### 4.5 External Service Cost (Outsourced Only)
**Formula**: `STAGE_RETAINER[geo_op][stage]` (Only if Method = Outsourced)

**Stage-Based Retainer by Geography**:
- **India**: 
  - Preseed: ₹50,000/yr
  - Seed: ₹80,000/yr
  - Series A/B: ₹130,000/yr
  - Series B/C: ₹220,000/yr
  - Series C+: ₹350,000/yr
- **US**: 
  - Preseed: $6,000/yr
  - Seed: $11,000/yr
  - Series A/B: $18,000/yr
  - Series B/C: $35,000/yr
  - Series C+: $60,000/yr
- **Singapore**: 
  - Preseed: S$7,000/yr
  - Seed: S$11,000/yr
  - Series A/B: S$15,000/yr
  - Series B/C: S$28,000/yr
  - Series C+: S$50,000/yr
- **UK**: 
  - Preseed: £4,500/yr
  - Seed: £8,000/yr
  - Series A/B: £12,000/yr
  - Series B/C: £22,000/yr
  - Series C+: £40,000/yr

> For outsourced method, the total cost combines:
> 1. **External Service Retainer**: Fixed annual fee to CA/Law firm (STAGE_RETAINER[geo_op][stage])
> 2. **Internal Effort Cost**: 40% of blended hourly rate × hours (for review, approvals, coordination)
>
> Example: If blended rate = $500/hr and cap table hours = 100 hrs
> - External retainer: $18,000/year
> - Internal effort cost: 100 hrs × 0.4 × $500 = $20,000/year
> - Total: $38,000/year (vs. pure in-house: 100 hrs × 1.0 × $500 = $50,000/year)

### 4.6 Valuation Services Cost (Optional)
**Formula**: `valuation_cost = (cost_per_event × forex_rate) × frequency_multiplier` (Only if user enables valuation reports)

**How It's Triggered:**
1. User toggles "Do you need valuation reports?" checkbox (default: OFF)
2. If enabled, user selects:
   - **Frequency**: Annually (1×/yr) or Quarterly (4×/yr)
   - **Report Type**: All 5 valuation types visible regardless of `geo_inc` (country of incorporation)
3. System calculates valuation cost in company's incorporation country currency using live forex rates
4. All costs are converted and displayed in country-of-incorporation currency

**Valuation Types** (available globally, with market pricing in native currency):

| Report Type | Native Currency | Market Cost | EquityList Cost |
|:---|:---|---:|---:|
| **409A Valuation** | USD | $1,500 | $1,200 |
| **Black Scholes Valuation** | INR | ₹100,000 | ₹75,000 |
| **Registered Valuer Assessment** (IBBI-registered) | INR | ₹50,000 | ₹42,000 |
| **Merchant Banker Assessment** (SEBI-registered) | INR | ₹90,000 | ₹70,000 |
| **HMRC Valuation** (HM Revenue & Customs) | GBP | £1,500 | £1,200 |

**Currency Display & Conversion:**
- All valuation types are visible to all companies in the dropdown
- Prices are displayed in the company's country-of-incorporation currency (`geo_inc`) using live forex rates
- Display format shows both converted and original amounts: e.g., "$650 (₹50k converted)"
- Example: US company sees Registered Valuer as "$525 (₹50k converted)"
- Example: India company sees HMRC as "₹115,500 (£1,500 converted)"

**Live Forex Rates Used:**
- Current rates: 1 USD = ~95 INR, 1 GBP = ~130 INR, 1 SGD = ~75 INR
- Rates are refreshed on each page load via API

EquityList Cost represents the discounted rate available through EquityList's platform (already integrated into ROI calculation).

**Cost Calculation:**

*Current Method Annual Cost (annCost):*
- `valuation_cost = market_cost × frequency_multiplier`
- For **Annually**: `cost = market_cost × 1`
- For **Quarterly**: `cost = market_cost × 4`
- Reflects what company pays without EquityList

*EquityList Annual Cost (elAnn):*
- `elValuationCost = el_cost × frequency_multiplier`
- For **Annually**: `cost = el_cost × 1`
- For **Quarterly**: `cost = el_cost × 4`
- Added to EquityList's total cost: `elAnn = platform_fee + overhead + elValuationCost`

**Example: Singapore Quarterly Valuations**
```
Market Cost:
  S$5,000 × 4 = S$20,000/year (included in annCost)

EquityList Cost:
  S$450 × 4 = S$1,800/year (added to elAnn)
  
Valuation Savings:
  S$20,000 - S$1,800 = S$18,200/year
```

This integration gives EquityList credit for offering discounted valuation services, significantly improving ROI for companies with regular valuation needs.

**Example Calculations:**

*US Company, Quarterly 409A Valuations:*
```
Market cost per event: $6,000
Frequency multiplier: 4 (quarterly)
Annual cost: $6,000 × 4 = $24,000/year
```

*India Company, Annual Registered Valuer Assessment:*
```
Market cost per event: ₹200,000
Frequency multiplier: 1 (annually)
Annual cost: ₹200,000 × 1 = ₹200,000/year
```

**Why Valuations Matter:**
- **ESOP Grant Pricing**: Indian companies must document fair market value when granting ESOPs
- **Fundraising**: Investors require independent third-party valuations
- **Exit Events**: Acquirers need audited, validated valuations
- **Tax Compliance**: Regulatory bodies in some jurisdictions require periodic valuations
- **Risk Mitigation**: Third-party valuations reduce legal exposure from shareholder disputes

**Integration into ROI:**
Valuation cost is added to the total annual operational cost (`annCost`), directly impacting:
- Annual spend comparison
- ROI calculation
- Savings estimation
- Cost breakdown visibility

---

## 6. Blended Hourly Rate Calculation

### 6.1 In-House Method
The blended hourly rate is calculated as the sum of FTE-weighted hourly rates for the stage:

```javascript
blended_rate = 0
for each role in ['founder', 'hr', 'finance', 'cs']:
  fte = STAFFING_MATRIX[stage][role]
  rate = STAGE_HOURLY_RATES[geo_op][stage][role]
  blended_rate += (fte × rate)
```

**Example - Series A/B in US:**
```
blended_rate = (0.8 × $288) + (1.0 × $156) + (1.0 × $131) + (0.5 × $119)
             = $230.40 + $156 + $131 + $59.50
             = $576.90/hr
```

This represents the effective hourly cost for equity administration across the full team.

### 6.2 Outsourced Method
No blended rate calculation. Use stage-based retainer directly (see §4.5).

---

## 7. Summary Formulas

### 7.1 Total Annual Ops Cost (Manual)
```javascript
ops_total = grant_admin_cost + compliance_cost + cap_table_cost + secretarial_cost + external_cost + valuation_cost
```

**Component Breakdown:**
- `grant_admin_cost`: Hours to issue annual equity grants
- `compliance_cost`: Statutory/regulatory reporting hours by country of incorporation
- `cap_table_cost`: Cap table maintenance and updates
- `secretarial_cost`: Board meetings, shareholder approvals, governance workflows
- `external_cost`: CA/Legal retainer (if outsourced) or tool cost
- `valuation_cost`: Third-party valuation reports (if enabled, 0 otherwise)

### 7.2 EquityList Annual Cost
```javascript
el_platform = stakeholders × PRICING[geo_op]
// PRICING is per-stakeholder per year, already in local currency:
//   india: ₹1,200  |  us: $40  |  uk: £30  |  singapore: S$25
// No FX conversion — every table is denominated in its geography's local currency.

el_overhead = manual_hours × 0.1 × blended_rate[geo_op][stage]
// Internal oversight still required even with EquityList (10% of full manual baseline)
// Blended rate determined by stage and country of operation

el_valuation_cost = el_cost_per_event × frequency_multiplier (if valuations enabled, else 0)
// Discounted valuation cost through EquityList platform
// frequency_multiplier = 4 (quarterly) or 1 (annually)

el_annual = el_platform + el_overhead + el_valuation_cost
```

> *Pricing calculated using country of operation. Applies blended hourly rates from geo_op for internal oversight cost.*
> *Valuation costs reflect EquityList's discounted rates for bundled services.*
> *\* Pricing may vary based on reporting complexity and requirements.*

---

## 8. Derived Output Metrics

### 8.1 Annual Savings
```javascript
savings = ops_total - el_cost
// Positive = EquityList is cheaper; negative = ops already cheaper than EL
```

### 8.2 Internal Effort (Manual Baseline)
```javascript
manual_hours = (gr × grHr) 
  + compliance_hours[geo_inc] 
  + ((3 + max(0,(sh-20)/50)×2) × 12)                              // cap table base
  + (workflows[geo_inc][stage] × 2.5 × shareholder_scaling)       // secretarial base
  + (fundraising_capTable_hours × roundMultiplier)                // if planning to fundraise
  + (fundraising_secretarial_hours × roundMultiplier)             // if planning to fundraise

// Full unaffected-by-method hours — what 100% manual execution would cost in time
// Includes both recurring operations and one-time fundraising effort
// shareholder_scaling = 1 + max(0, (sh - 20) / 100) × 0.5
// roundMultiplier = {safe: 0.5, bridge: 0.75, seed: 1.0, seriesab: 1.5, seriesbc: 2.0, seriesc: 2.5}
```

### 8.3 Internal Effort (Method-Adjusted)
```javascript
adjusted_hours = (gr × grHr × mult) 
  + (compliance_hours[geo_inc] × mult) 
  + (cap_table_hours × mult) 
  + (secretarial_hours × mult)
  + (fundraising_capTable_hours × roundMultiplier × mult)    // if planning to fundraise
  + (fundraising_secretarial_hours × roundMultiplier × mult)  // if planning to fundraise

// Actual internal hours after applying method multiplier (1.0 for in-house, 0.4 for outsourced)
// Reflects the effort retained internally after outsourcing
```

### 8.4 Time Saved %
```javascript
time_saved_pct = round((manual_hours - adjusted_hours) / manual_hours × 100)
// Represents the % of total equity ops effort that the current method eliminates vs. pure in-house
```

### 7.5 Direct ROI Multiple
```javascript
roi = round(abs(savings) / el_cost, 1)
// How many times the savings exceeds EquityList's cost; shown as "Xx"
```

### 7.6 Your Annual Spend
```javascript
annual_spend = grant_admin_cost + compliance_cost + cap_table_cost + external_cost
// Total annual operational cost for current method (in-house or outsourced)
// Also called ops_total; primary comparison point against EquityList
```

### 7.7 Hours Saved Annually (with EquityList)
```javascript
hours_saved = adjusted_hours - (manual_hours × 0.1)
// Actual hours eliminated by switching to EquityList from current method
// Accounts for the 10% minimum oversight required even with EquityList
// Example: With outsourced (mult=0.4), switching to EL saves (manualHTotal×0.4) - (manualHTotal×0.1) = manualHTotal×0.3 hours
```

---

## 8. Data Sources & References

**Hourly Rate Tables**: See §3 (Hourly Rate Assumptions) for complete industry-standard rates by stage, geography, and role. Rates reflect market compensation for equity administration professionals at each funding stage, calculated as: Annual Salary ÷ 2,080 working hours.

**Valuation Type Costs**: See §4.6 for current valuation market and EquityList rates.

**Compliance Hours**: See §4.2 for baseline compliance hours by country of incorporation.

**Retainer Costs**: See §4.5 for stage-based outsourced retainer costs by geography.

---

## 9. Key Changes from Previous Versions

### Version 3.3 (Current)
- **Removed**: CSV upload feature and "Enter Manually vs Upload Cap Table" method selection — calculator now starts directly with manual entry form
- **Removed**: Unused FX conversion table (PRICING and rates are already in each geography's local currency)
- **Removed**: Singapore and UK valuation types (market rates not yet verified)
- **Removed**: "Hybrid" method option from PRD (not implemented)
- **Changed**: Valuation types now always visible (not country-gated) — dropdown shows 409A, Registered Valuer, and Merchant Banker options at all times
- **Updated**: Valuation market costs: 409A ($1,500 vs. $6,000), Registered Valuer (₹50,000 vs. ₹200,000), Merchant Banker (₹90,000 vs. ₹300,000)
- **Fixed**: Outsourced method now correctly includes 40% internal effort cost (review, approvals, coordination) + external retainer (was only charging retainer)
- **Fixed**: `computeROI()` now calculates blended rate for BOTH in-house and outsourced methods (previously set rate=0 for outsourced, making 0.4 multiplier meaningless)
- **Added**: Comprehensive automated test suite (`test-calculator.js`) covering 483,840 input combinations (increase from 421,120 due to all valuation types now available)
- **Added**: Failure-path test suite (`test-failures.js`) — 36 negative-path assertions
- **Added**: Input validation in `computeROI()` — throws explicit errors on missing geography/stage tables
- **Added**: Round-complexity multiplier for fundraising costs (SAFE 0.5×, Bridge 0.75×, Seed 1.0×, Series A/B 1.5×, Series B/C 2.0×, Series C+ 2.5×)
- **Added**: Workflow definitions explaining what counts as one "governance workflow" (board meetings, shareholder approvals, statutory filings, equity amendments, compliance reports)
- **Fixed**: §8.2 and §8.3 (Internal Effort formulas) now include fundraising hours
- **Consolidated**: §8 (Data Sources) now references §3 instead of duplicating hourly rate tables

### Version 3.2
- **Implemented**: EquityList valuation cost integration into ROI calculation
- **Changed**: `elAnn` (EquityList cost) now includes discounted valuation pricing
- **Added**: Extract and pass both `valuationCostMarket` and `valuationCostEl` to ROI function
- **Added**: Calculate `elValuationCost = valuationCostEl × frequency_multiplier`
- **Improved**: ROI now reflects EquityList's advantage in bundled valuation services
- **Example**: Singapore quarterly valuations save S$18,200/year (S$5K market vs S$450 EL cost × 4)

### Version 3.1
- **Added**: Valuation Reports subsection in Step 2 (Equity Structure)
- **Added**: Toggle to enable/disable third-party valuation services
- **Added**: Frequency selector (Annually vs. Quarterly)
- **Added**: Country-gated valuation type dropdown (US, India, UK, Singapore)
- **Added**: Impact preview showing number of annual valuation events
- **Added**: Valuation cost calculation with frequency multiplier (1× or 4×)
- **Added**: Validation requiring both frequency and type if valuation is enabled
- **Improved**: Cost breakdown now includes valuation services line item
- **Fixed**: Dropdown properly rebuilds and syncs SelectField instances when geography changes

### Version 3.0
- **Removed**: Persona-based approach ("Managed By" field)
- **Added**: Stage-based staffing matrix with FTE allocations
- **Changed**: Hourly rate calculation from persona selection to blended rate (sum of FTE × role_rate)
- **Removed**: CEO premium multiplier (now implicit in stage-aware rates)
- **Improved**: More realistic staffing allocation matching company growth patterns
- **Simplified**: User flow — stage selection determines staffing, no ambiguous role selection needed

### Version 2.7
- Added stage-based retainer costs and hourly rates
- Removed PayScale references
- Removed "Existing Tool" administrative method
- Implemented CEO premium for founder/CEO selection

---

## 10. User Interface Features & Components

The calculator uses a single entry method: manual data entry via an interactive form with real-time validation and live calculations.

### Step 1: Founders & Company Basics
**Inputs:**
- Legal Entity Name (optional, display only)
- Country of Incorporation (geo_inc)
- Country of Operation (geo_op)
- Current Funding Stage

**Purpose:** Define the regulatory and operational context for equity management.

### Step 2: Equity Structure
**Subsection A: Cap Table Composition**
- Shareholders count
- Option holders count
- Equity grants issued per year

**Subsection B: Administration Method**
- In-House (full internal staffing)
- Outsourced (CA/Legal firm retainer)

**Subsection C: Planning to Fundraise** (Optional)
- Toggle: "Are you planning to fundraise in the next 12 months?"
- If YES:
  - Select funding round (Seed, Series A, Series B, Series C, or SAFE/Bridge)
  - Select timing (3, 6, 9, or 12 months)
  - Enter expected new shareholders
  - **Effect**: If fundraising with a specific round, that stage's staffing is used for calculation. Increases secretarial workflows. Updates cap table and shareholder scaling assumptions.

**Subsection D: Valuation Reports** (Optional)
- Toggle: "Do you need valuation reports?"
- If YES:
  - **Needs Assessment**: Select frequency (Annually or Quarterly)
  - **Report Type**: Dropdown with country-specific valuation options (gated by geo_inc)
  - **Impact Preview**: "Estimate will include N valuation event(s)/yr (Type Name)."
  - **Helper Text** (for single-option countries): "Standard report type for [COUNTRY] — pre-selected."

**Validation:**
- If valuation toggle is ON, both frequency and report type must be selected before calculating

### Results Display
**Key Metrics Section:**
1. Your Annual Spend (annCost) — formatted in local currency
2. EquityList Annual Cost (elAnn) — formatted in local currency
3. Annual Savings/Overspend (diff) — green for savings, red for overspend
4. ROI Multiple — "Xx savings" (e.g., "2.5x savings")

**Messaging Zones:**
- **Positive Savings**: "You're currently overspending... You could save [amount]/year"
- **Negative Savings**: "Your current setup is cost-efficient — for now. As you scale, risks increase."
- **Breakeven**: "Cost isn't the deciding factor. The real difference is reliability as complexity increases."

**Cost Breakdown Panel** (Collapsible):
- Lists all cost components with amounts and percentages:
  - Grant administration
  - Compliance & reporting
  - Cap table maintenance
  - Secretarial & board operations
  - External services (CA/Law firm or tools)
  - Valuation services (if enabled)
  - EquityList overhead (10% of manual baseline)
  
- **Editable Assumptions**:
  - Blended hourly rate (auto-calculated or manual override)
  - Grant hours per equity action
  - Compliance hours per year
  - Additional cost multipliers

- **Efficiency Metrics**:
  - Manual baseline hours (if 100% internal)
  - Adjusted hours (after method multiplier)
  - Time saved percentage
  - Hours saved annually with EquityList

**Sample Data Banner:**
- Shows when calculator is using default sample values
- Toggles between "SAMPLE DATA" (blue) and "LIVE · YOUR INPUTS" (gray) states
- User can click to edit inputs

---

## 11. Implementation Notes

### Calculation Flow
1. User selects: stage, geo_inc, geo_op, shareholders, option holders, grants, method
2. System looks up STAFFING_MATRIX[stage] for FTE allocations
3. For **in-house** method:
   - Calculate blended_rate = sum(FTE × STAGE_HOURLY_RATES[geo_op][stage][role])
   - Calculate costs = hours × blended_rate × 1.0
4. For **outsourced** method:
   - Use STAGE_RETAINER[geo_op][stage] directly
   - Skip hourly calculation
5. If fundraising enabled:
   - Override stage with fundraise round (if not SAFE/Bridge)
   - Add fundraising workflows to cap table and secretarial workloads
   - Scale shareholder count by new shareholders from fundraise
6. If valuation enabled:
   - Look up VALUATION_TYPES_BY_GEO[geo_inc]
   - Find selected valuation type and get market cost
   - Multiply by frequency (1 for annual, 4 for quarterly)
   - Add to total annual cost
7. Compare to EquityList cost and show ROI

### Valuation Feature Implementation Details

**SelectField Component Synchronization:**
The calculator uses a custom SelectField component for accessible dropdown UI. When user changes geography (geo_inc), the valuation report type options must rebuild:

1. **Trigger**: `handleGeoIncChange()` calls `rebuildValuationTypeOptions()`
2. **Process**:
   - Clear native `<select>` HTML and custom dropdown list
   - Rebuild both from VALUATION_TYPES_BY_GEO[geo_inc]
   - Store SelectField instance reference: `selectElement._selectField = instance`
   - Update SelectField's cached options: `selectElement._selectField.options = wrapper.querySelectorAll('[role="option"]')`
   - Re-attach event listeners to new option elements
   - Call `updateDisplay()` to refresh UI
3. **Result**: Dropdown correctly shows country-specific valuation types

**Validation Flow:**
- `validateInputs()` checks if valuation checkbox is enabled
- If enabled, requires both frequency and type selections
- Displays error messages on fields if validation fails
- Calculate button is disabled until validation passes

**Data Synchronization:**
- When frequency or type changes: `updateValuationNote()` updates impact preview
- When valuation is toggled off: All fields reset to empty, impact preview hides
- When geography changes: Type dropdown rebuilds with new options

### Edge Cases
- If stage is missing, default to "seriesab" (Series A/B)
- If role missing from STAGE_HOURLY_RATES, use 0
- Blended rate is always >= 0 (sum of positive terms)
- Outsourced method ignores staffing matrix entirely
- If valuation is disabled, cost is 0 (validation not required)
- If country has only 1 valuation type, it's pre-selected with helper text
- If country has multiple types, user must select manually

### Future Considerations
- Could add custom staffing matrix per company type (SaaS vs. Hardware, etc.)
- Could weight blended rate by industry standards
- Could add role-specific cost adjustments (senior vs. junior)
- Could add secondary valuation types for companies doing multiple methodologies
- Could surface a "Not recommended at your scale" message when EquityList annual cost exceeds current spend (today the UI shows ROI as a multiple but doesn't flag the loss case explicitly)
- Could track valuation frequency trends over time for portfolio analysis
