# EquityList ROI Calculator — Logic & Calculation Specification

**Version**: 3.0  
**Last Updated**: April 28, 2026  
**Purpose**: Technical reference for all formulas, assumptions, and research sources used in the ROI calculation engine.

---

## 1. Input Mapping & Normalization

| UI Input | Variable | Range / Type | Default | Required |
|:---|:---|:---|:---|:---|
| Shareholders | `sh` | Positive number | 30 | Yes |
| Option Holders | `oh` | Positive number | 15 | Yes |
| Equity grants issued / year | `gr` | Positive number | 10 | Yes |
| Country of Incorporation | `geo_inc` | India, US, Singapore, UK | India | Yes |
| Country of Operation | `geo_op` | India, US, Singapore, UK | India | Yes |
| Current Stage | `stage` | Preseed, Seed, Series A/B, Series B/C, Series C+ | Series A/B | Yes |
| Administrative Method | `meth` | In-house, Outsourced | In-house | Yes |
| Legal Entity Name | `co` | String | — | No (display only) |

**Note**: The "Managed By" field has been removed. Staffing and roles are now determined by company stage via the staffing matrix (see §2.4).

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
  preseed: { founder: 1.0, hr: 0, finance: 0, secretarial: 0 },
  seed: { founder: 1.0, hr: 0.5, finance: 0.5, secretarial: 0 },
  seriesab: { founder: 0.8, hr: 1.0, finance: 1.0, secretarial: 0.5 },
  seriesbc: { founder: 0.5, hr: 2.0, finance: 2.0, secretarial: 1.0 },
  seriesc: { founder: 0.25, hr: 2.5, finance: 2.5, secretarial: 1.5 }
};
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
  
- **`geo_op`** (Country of Operation): Used for hourly rates, external retainer costs, currency conversion, and EL pricing
  - Selects industry-standard hourly rates per role and stage (STAGE_HOURLY_RATES[geo_op])
  - Determines stage-based external retainer cost (if method = Outsourced): STAGE_RETAINER[geo_op][stage]
  - Determines FX conversion rates (INR → local currency)
  - Used for EquityList platform fee and internal overhead calculations

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
**Formula**: `((3 + max(0, (sh - 20) / 50) × 2) × 12) × mult × blended_rate`
- **Baseline**: 3 hrs/month minimum.
- **Scaling**: Additional 2 hrs/month per 50 shareholders above a base of 20.

### 4.4 External Service Cost (Outsourced Only)
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

> For outsourced method, this retainer cost replaces hourly-based calculation. No staffing matrix or blended rate is applied.

---

## 5. Blended Hourly Rate Calculation

### 5.1 In-House Method
The blended hourly rate is calculated as the sum of FTE-weighted hourly rates for the stage:

```javascript
blended_rate = 0
for each role in ['founder', 'hr', 'finance', 'secretarial']:
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

### 5.2 Outsourced Method
No blended rate calculation. Use stage-based retainer directly (see §4.4).

---

## 6. Summary Formulas

### 6.1 Total Annual Ops Cost (Manual)
```javascript
ops_total = grant_admin_cost + compliance_cost + cap_table_cost + external_cost
```

### 6.2 EquityList Annual Cost
```javascript
el_platform = stakeholders × 1200 × FX[geo_op]
// 1200 = ₹1,200 per stakeholder per year (India base price, converted at live rates)
// FX[geo_op] = INR→local rate fetched live; fallbacks: US 0.01205, SG 0.01613, UK 0.00943

el_overhead = manual_hours × 0.1 × blended_rate[geo_op][stage]
// Internal oversight still required even with EquityList (10% of full manual baseline)
// Blended rate determined by stage and country of operation

el_cost = el_platform + el_overhead
```

> *Pricing calculated using country of operation. Applies blended hourly rates from geo_op for internal oversight cost.*
> *\* Pricing may vary based on reporting complexity and requirements.*

---

## 7. Derived Output Metrics

### 7.1 Annual Savings
```javascript
savings = ops_total - el_cost
// Positive = EquityList is cheaper; negative = ops already cheaper than EL
```

### 7.2 Internal Effort (Manual Baseline)
```javascript
manual_hours = (gr × grHr) + compliance_hours[geo_inc] + ((3 + max(0,(sh-20)/50)×2) × 12)
// Full unaffected-by-method hours — what 100% manual execution would cost in time
```

### 7.3 Internal Effort (Method-Adjusted)
```javascript
adjusted_hours = (gr × grHr × mult) + (compliance_hours[geo_inc] × mult) + (cap_table_hours × mult)
// Actual internal hours after applying method multiplier
```

### 7.4 Time Saved %
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

## 8. Data Sources

Industry-standard hourly rates by stage, geography, and role. Rates reflect market compensation for equity administration professionals at each funding stage. Annual salary ÷ 2,080 working hours.

| Geography | Role | Preseed | Seed | Series A/B | Series B/C | Series C+ |
|:---|:---|---:|---:|---:|---:|---:|
| **US** | Founder/CEO | $113 | $181 | $288 | $356 | $431 |
| **US** | Finance/CFO | $69 | $110 | $156 | $200 | $250 |
| **US** | HR Lead | $63 | $94 | $131 | $169 | $219 |
| **US** | Legal/Secretarial | $56 | $88 | $119 | $150 | $200 |
| **India** | Founder/CEO | ₹500 | ₹1,000 | ₹1,875 | ₹2,750 | ₹4,000 |
| **India** | Finance/CFO | ₹325 | ₹650 | ₹1,188 | ₹1,688 | ₹2,313 |
| **India** | HR Lead | ₹288 | ₹563 | ₹1,025 | ₹1,438 | ₹2,000 |
| **India** | Legal/Secretarial | ₹250 | ₹475 | ₹875 | ₹1,225 | ₹1,688 |
| **Singapore** | Founder/CEO | $100 | $188 | $331 | $431 | $563 |
| **Singapore** | Finance/CFO | $69 | $119 | $200 | $275 | $375 |
| **Singapore** | HR Lead | $63 | $103 | $181 | $250 | $325 |
| **Singapore** | Legal/Secretarial | $54 | $85 | $150 | $213 | $288 |
| **UK** | Founder/CEO | £63 | £110 | £181 | £225 | £281 |
| **UK** | Finance/CFO | £44 | £70 | £110 | £138 | £188 |
| **UK** | HR Lead | £40 | £63 | £98 | £125 | £169 |
| **UK** | Legal/Secretarial | £31 | £55 | £85 | £113 | £150 |

---

## 9. Key Changes from Previous Versions

### Version 3.0 (Current)
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

## 10. Implementation Notes

### Calculation Flow
1. User selects: stage, geo_inc, geo_op, shareholders, option holders, grants, method
2. System looks up STAFFING_MATRIX[stage] for FTE allocations
3. For **in-house** method:
   - Calculate blended_rate = sum(FTE × STAGE_HOURLY_RATES[geo_op][stage][role])
   - Calculate costs = hours × blended_rate × 1.0
4. For **outsourced** method:
   - Use STAGE_RETAINER[geo_op][stage] directly
   - Skip hourly calculation
5. Compare to EquityList cost and show ROI

### Edge Cases
- If stage is missing, default to "seriesab" (Series A/B)
- If role missing from STAGE_HOURLY_RATES, use 0
- Blended rate is always >= 0 (sum of positive terms)
- Outsourced method ignores staffing matrix entirely

### Future Considerations
- Could add custom staffing matrix per company type (SaaS vs. Hardware, etc.)
- Could weight blended rate by industry standards
- Could add role-specific cost adjustments (senior vs. junior)
