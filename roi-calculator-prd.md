# EquityList ROI Calculator — Logic & Calculation Specification

**Version**: 2.6
**Last Updated**: April 22, 2026
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
| Persona | `per` | Founder, Finance, HR, CS | Finance | Yes |
| Current Method | `meth` | In-house, Outsourced, Existing Tool | In-house | Yes |
| Annual Tool Cost | `tool_cost` | Number | 0 | Only if meth = Existing Tool |
| Current Stage | `stage` | Seed, Series A/B, Series C+, Public/Pre-IPO | Series A/B | No (display only) |
| Legal Entity Name | `co` | String | — | No (display only) |

---

## 2. Derived Base Metrics

### 2.1 Total Stakeholders
Used for EquityList platform pricing.
```javascript
stakeholders = sh + oh
```

### 2.2 Method Multipliers (`mult`)
Represents the fraction of execution effort retained by the internal team.
- **In-house**: 1.0 (100%)
- **Outsourced (CA/Legal)**: 0.4 (40%) — *Reflects time spent on review, approval, and coordination.*
- **Existing Tool**: 0.1 (10%) — *Reflects minimal oversight time; the tool handles most execution.*

> When `meth = Existing Tool`, total ops cost = `(grant_admin + compliance + cap_table costs at mult=0.1) + tool_cost`. The `tool_cost` is user-supplied and added as a direct line item.

### 2.3 Scale Tier
Determines which PayScale salary percentile to apply based on total stakeholder count.

```javascript
stakeholders = sh + oh
tier = stakeholders ≤ 30  → p10 (10th percentile)
tier = 30 < stakeholders ≤ 70 → p50 (median)
tier = stakeholders > 70  → p90 (90th percentile)
```

### 2.4 Geographic Model
The calculator accepts two geography inputs:
- **`geo_inc`** (Country of Incorporation): Used for compliance requirements
  - Determines statutory register requirements (India SH-6, US Rule 701, etc.)
  - Determines baseline compliance hours (COMPLIANCE[geo_inc])
  
- **`geo_op`** (Country of Operation): Used for hourly rates, external retainer costs, currency conversion, and EL pricing
  - Selects PayScale hourly rates per persona and tier (RATES[geo_op])
  - Determines external retainer cost (if method = Outsourced): EXT[geo_op]
  - Determines FX conversion rates (INR → local currency)
  - Used for EquityList platform fee and internal overhead calculations

---

## 3. Hourly Rate Assumptions (PayScale 2026)

All rates sourced from PayScale. Annual salary ÷ 2,080 working hours (52 weeks × 40 hrs). Three tiers reflect scale of operations — see §2.3 for threshold logic.

**India (₹/hr)**
| Persona | 10th %ile | Median | 90th %ile | PayScale Role |
|:---|---:|---:|---:|:---|
| Founder/CEO | ₹131 | ₹1,442 | ₹4,808 | Chief Executive Officer |
| Finance/CFO | ₹401 | ₹1,923 | ₹3,846 | Chief Financial Officer |
| HR Lead | ₹322 | ₹1,442 | ₹2,404 | HR Director |
| CS/Legal | ₹147 | ₹297 | ₹962 | Corporate Secretary |

**United States ($/hr)**
| Persona | 10th %ile | Median | 90th %ile | PayScale Role |
|:---|---:|---:|---:|:---|
| Founder/CEO | $40 | $85 | $166 | Chief Executive Officer |
| Finance/CFO | $43 | $74 | $118 | Chief Financial Officer |
| HR Lead | $32 | $49 | $74 | HR Director |
| CS/Legal | $46 | $67 | $97 | Corporate Counsel |

**Singapore (S$/hr)**
| Persona | 10th %ile | Median | 90th %ile | PayScale Role |
|:---|---:|---:|---:|:---|
| Founder/CEO | S$13 | S$114 | S$280 | Chief Executive Officer |
| Finance/CFO | S$46 | S$117 | S$187 | Chief Financial Officer |
| HR Lead | S$21 | S$75 | S$138 | HR Director |
| CS/Legal | S$29 | S$59 | S$105 | Legal Counsel |

**United Kingdom (£/hr)**
| Persona | 10th %ile | Median | 90th %ile | PayScale Role |
|:---|---:|---:|---:|:---|
| Founder/CEO | £18 | £35 | £80 | Chief Executive Officer |
| Finance/CFO | £27 | £49 | £83 | Chief Financial Officer |
| HR Lead | £26 | £38 | £55 | HR Director |
| CS/Legal | £12 | £22 | £41 | Corporate Secretary |

> ⚠ **Note on CEO/Founder rates**: PayScale CEO data spans all company sizes and industries. At the 10th percentile particularly, rates reflect very small or traditional-sector companies and may understate compensation for venture-backed startup founders.

---

## 4. Cost Components (PRD Match Logic)

### 4.1 Grant Administration Cost
**Formula**: `gr × 1.5 hrs × mult × rate`
- **Baseline**: 1.5 hours per grant (90 mins).
- **Execution Breakdown**:
    - Drafting letter: 20m
    - Vesting setup: 15m
    - Approval routing: 20m
    - Employee comms: 15m
    - Record-keeping: 10m
    - Error checking: 10m

### 4.2 Compliance & Reporting Cost
**Formula**: `base_comp_hours[geo_inc] × mult × rate[geo_op]`
- **Baseline Hours (Manual)** — varies by country of incorporation:
    - **India**: 72 hrs/yr
    - **US**: 68 hrs/yr
    - **Singapore / UK**: 54 hrs/yr
- **Regulatory scope** (by country of incorporation):
    - **India**: SH-6 Statutory Register, IND AS 102/15 Equity Expense.
    - **US**: ASC 718/820 Equity Expense, Rule 701 Compliance.
    - **Europe/Asia**: IFRS 2 Share-based Payment.

### 4.3 Cap Table Maintenance Cost
**Formula**: `((3 + max(0, (sh - 20) / 50) × 2) × 12) × mult × rate`
- **Baseline**: 3 hrs/month minimum.
- **Scaling**: Additional 2 hrs/month per 50 shareholders above a base of 20.

### 4.4 External Retainer Cost
**Formula**: `RETAINER[geo_op] × tier_multiplier` (Only if Method = Outsourced)

**Base Retainer by Geography**:
- **India**: ₹1,80,000/yr
- **US**: $18,000/yr
- **Singapore**: S$15,000/yr
- **UK**: £12,000/yr

**Tier Multiplier** (applied only to outsourced retainer, not to user-provided tool costs):
- **p10 (≤30 stakeholders)**: 0.8x
- **p50 (31–70 stakeholders)**: 1.0x
- **p90 (>70 stakeholders)**: 1.2x

> *Applied based on country of operation, where the work is performed. Tier scaling reflects varying vendor availability and negotiation leverage at different company sizes.*

---

## 5. Summary Formulas

### 5.1 Total Annual Ops Cost (Manual)
```javascript
ops_total = grant_admin_cost + compliance_cost + cap_table_cost + retainer_cost
```

### 5.2 EquityList Annual Cost
```javascript
el_platform = stakeholders × 1200 × FX[geo_op]
// 1200 = ₹1,200 per stakeholder per year (India base price, converted at live rates)
// FX[geo_op] = INR→local rate fetched live; fallbacks: US 0.01205, SG 0.01613, UK 0.00943

el_overhead = manual_hours × 0.1 × rate[geo_op]
// Internal oversight still required even with EquityList (10% of full manual baseline)
// Rate determined by country of operation and stakeholder tier

el_cost = el_platform + el_overhead
```

> *Pricing calculated using country of operation. Applies hourly rates from geo_op for internal oversight cost.*
> *\* Pricing may vary based on reporting complexity and requirements.*

---

## 6. Derived Output Metrics

### 6.1 Annual Savings
```javascript
savings = ops_total - el_cost
// Positive = EquityList is cheaper; negative = ops already cheaper than EL
```

### 6.2 Internal Effort (Manual Baseline)
```javascript
manual_hours = (gr × grHr) + compliance_hours[geo] + ((3 + max(0,(sh-20)/50)×2) × 12)
// Full unaffected-by-method hours — what 100% manual execution would cost in time
```

### 6.3 Internal Effort (Method-Adjusted)
```javascript
adjusted_hours = (gr × grHr × mult) + (compliance_hours[geo] × mult) + (cap_table_hours × mult)
// Actual internal hours after applying method multiplier
```

### 6.4 Time Saved %
```javascript
time_saved_pct = round((manual_hours - adjusted_hours) / manual_hours × 100)
// Represents the % of total equity ops effort that the current method eliminates vs. pure in-house
```

### 6.5 Direct ROI Multiple
```javascript
roi = round(abs(savings) / el_cost, 1)
// How many times the savings exceeds EquityList's cost; shown as "Xx"
```

---

## 7. Data Sources

All 16 persona × geography hourly rates sourced from PayScale. Annual salary ÷ 2,080. Three tiers per combination — see §3 for full values.

| Geo | Persona | PayScale Role | Annual (p10 / median / p90) | Link |
|:---|:---|:---|:---|:---|
| **India** | Founder/CEO | Chief Executive Officer | ₹2,73,000 / ₹30,00,000 / ₹1,00,00,000 | [payscale.com](https://www.payscale.com/research/IN/Job=Chief_Executive_Officer_(CEO)/Salary) |
| **India** | Finance/CFO | Chief Financial Officer | ₹8,35,000 / ₹40,00,000 / ₹80,00,000 | [payscale.com](https://www.payscale.com/research/IN/Job=Chief_Financial_Officer_(CFO)/Salary) |
| **India** | HR Lead | HR Director | ₹6,70,000 / ₹30,00,000 / ₹50,00,000 | [payscale.com](https://www.payscale.com/research/IN/Job=Human_Resources_(HR)_Director/Salary) |
| **India** | CS/Legal | Corporate Secretary | ₹3,05,000 / ₹6,18,000 / ₹20,00,000 | [payscale.com](https://www.payscale.com/research/IN/Job=Corporate_Secretary/Salary) |
| **US** | Founder/CEO | Chief Executive Officer | $84,000 / $177,000 / $345,000 | [payscale.com](https://www.payscale.com/research/US/Job=Chief_Executive_Officer_(CEO)/Salary) |
| **US** | Finance/CFO | Chief Financial Officer | $90,000 / $154,000 / $246,000 | [payscale.com](https://www.payscale.com/research/US/Job=Chief_Financial_Officer_(CFO)/Salary) |
| **US** | HR Lead | HR Director | $66,000 / $102,000 / $153,000 | [payscale.com](https://www.payscale.com/research/US/Job=Human_Resources_(HR)_Director/Salary) |
| **US** | CS/Legal | Corporate Counsel | $95,000 / $140,000 / $201,000 | [payscale.com](https://www.payscale.com/research/US/Job=Corporate_Counsel/Salary) |
| **Singapore** | Founder/CEO | Chief Executive Officer | S$26,000 / S$238,000 / S$582,000 | [payscale.com](https://www.payscale.com/research/SG/Job=Chief_Executive_Officer_(CEO)/Salary) |
| **Singapore** | Finance/CFO | Chief Financial Officer | S$96,000 / S$243,000 / S$388,000 | [payscale.com](https://www.payscale.com/research/SG/Job=Chief_Financial_Officer_(CFO)/Salary) |
| **Singapore** | HR Lead | HR Director | S$44,000 / S$157,000 / S$286,000 | [payscale.com](https://www.payscale.com/research/SG/Job=Human_Resources_(HR)_Director/Salary) |
| **Singapore** | CS/Legal | Legal Counsel | S$60,000 / S$123,000 / S$218,000 | [payscale.com](https://www.payscale.com/research/SG/Job=Legal_Counsel/Salary) |
| **UK** | Founder/CEO | Chief Executive Officer | £37,000 / £73,000 / £166,000 | [payscale.com](https://www.payscale.com/research/UK/Job=Chief_Executive_Officer_(CEO)/Salary) |
| **UK** | Finance/CFO | Chief Financial Officer | £56,000 / £102,000 / £172,000 | [payscale.com](https://www.payscale.com/research/UK/Job=Chief_Financial_Officer_(CFO)/Salary) |
| **UK** | HR Lead | HR Director | £54,000 / £79,000 / £114,000 | [payscale.com](https://www.payscale.com/research/UK/Job=Human_Resources_(HR)_Director/Salary) |
| **UK** | CS/Legal | Corporate Secretary | £24,000 / £46,000 / £86,000 | [payscale.com](https://www.payscale.com/research/UK/Job=Corporate_Secretary/Salary) |
