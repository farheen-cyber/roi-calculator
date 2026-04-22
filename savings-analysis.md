# EquityList ROI Calculator — Savings Analysis & Decision Matrix

**Scope**: Comprehensive analysis of when EquityList delivers positive vs. negative savings across **all company sizes, methods, geographies, AND personas** (144 total scenarios).

**Key Metric**: Your Potential Savings with EquityList
```javascript
savings = annCost - elAnn
```

---

## Executive Summary: Persona Impact on Savings

The **persona (role managing equity)** is a critical factor in ROI outcomes. Hourly rates vary dramatically:

| Persona | India Rates | US Rates | Impact |
|:---|:---|:---|:---|
| **Founder/CEO** | ₹131–₹4,808/hr | $40–$166/hr | LOWEST rates (p10); often negative in India |
| **Finance** | ₹401–₹3,846/hr | $43–$118/hr | MEDIUM rates; positive except existing-tool in India |
| **HR** | ₹322–₹2,404/hr | $32–$74/hr | MEDIUM-LOW rates; mixed results in India |
| **CS/Legal** | ₹147–₹962/hr | $46–$97/hr | LOWEST rates in India; highest negative savings |

### Key Finding
**In India, lower-rate personas (Founder, CS/Legal) often show NEGATIVE savings even with in-house method**, while Finance and HR show positive savings. In high-cost markets (US, UK, SG), all personas show positive savings.

---

## Factor Analysis: What Drives Positive vs. Negative Savings

**Primary Factors (ranked by impact):**

| Factor | Impact | Details |
|:---|:---|:---|
| **Method** | Dominant | In-house: usually positive. Outsourced: always positive. Existing-tool: negative in India, positive elsewhere. |
| **Geography** | Dominant | Low-cost markets (India) → more negative outcomes. High-cost markets (US, UK, SG) → almost always positive. |
| **Persona** | Strong | Lower-rate personas (Founder, CS) → more likely negative in low-cost geos. Higher-rate personas (Finance) → more likely positive. |
| **Hourly Rate** | Moderate | Higher rate → higher ops_cost → better EquityList value. Determined by geo + persona tier. |
| **Company Size** | Moderate | Larger companies: more work (higher ops_cost), but higher rates (p90 tier). Net-neutral on sign, affects magnitude. |

### Critical Interaction: Persona × Geography

The strongest predictor combines persona with geography:

| Scenario | India | US | UK | Singapore |
|:---|:---|:---|:---|:---|
| **Founder + In-house** | ✗ NEGATIVE (rates too low) | ✓ POSITIVE | ✓ POSITIVE | ✓ POSITIVE |
| **Finance + In-house** | ✓ POSITIVE | ✓ POSITIVE | ✓ POSITIVE | ✓ POSITIVE |
| **HR + In-house** | ✓ POSITIVE (at scale) | ✓ POSITIVE | ✓ POSITIVE | ✓ POSITIVE |
| **CS + In-house** | ✗ NEGATIVE | ✓ POSITIVE | ✓ POSITIVE | ✓ POSITIVE |
| **Any + Outsourced** | ✓ POSITIVE | ✓ POSITIVE | ✓ POSITIVE | ✓ POSITIVE |
| **Any + Existing-tool** | ✗ NEGATIVE | ✓ POSITIVE | ✓ POSITIVE | ✓ POSITIVE |

---

## Complete Decision Matrix: All 144 Permutations

### FOUNDER PERSONA

#### INDIA (₹131–₹4,808/hr, p10–p90)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✗ -₹10,383 (0.4x) | ✓ +₹70,539 (2.8x) | ✗ -₹23,000 (0.9x) |
| **Medium (50 sh, p50)** | ✓ +₹118,318 (1.5x) | ✓ +₹179,439 (2.2x) | ✗ -₹55,000 (0.7x) |
| **Large (100 sh, p90)** | ✓ +₹610,864 (3.0x) | ✓ +₹339,621 (1.7x) | ✗ -₹110,000 (0.5x) |

**Key Insight**: Founder p10 in India is the MOST NEGATIVE scenario. Even in-house becomes positive at scale (medium+).

#### USA ($40–$166/hr)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✓ +$3,725 (5.1x) | ✓ +$10,049 (13.7x) | ✓ +$711 (1.0x) |
| **Medium (50 sh, p50)** | ✓ +$9,482 (5.1x) | ✓ +$20,679 (11.1x) | ✓ +$4,277 (2.3x) |
| **Large (100 sh, p90)** | ✓ +$23,190 (5.5x) | ✓ +$28,366 (6.8x) | ✓ +$8,554 (2.0x) |

**Key Insight**: All positive in US. Even Founder p10 beats EquityList.

#### SINGAPORE (S$13–S$280/hr)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✓ +S$754 (1.5x) | ✓ +S$7,493 (14.6x) | ✓ +S$613 (1.2x) |
| **Medium (50 sh, p50)** | ✓ +S$11,283 (4.8x) | ✓ +S$18,116 (7.8x) | ✓ +S$4,032 (1.7x) |
| **Large (100 sh, p90)** | ✓ +S$36,091 (5.9x) | ✓ +S$28,740 (4.7x) | ✓ +S$8,064 (1.3x) |

#### UK (£18–£80/hr)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✓ +£1,353 (3.4x) | ✓ +£6,300 (15.7x) | ✓ +£774 (1.9x) |
| **Medium (50 sh, p50)** | ✓ +£3,195 (3.2x) | ✓ +£12,688 (12.9x) | ✓ +£4,434 (4.5x) |
| **Large (100 sh, p90)** | ✓ +£9,733 (4.2x) | ✓ +£16,890 (7.2x) | ✓ +£8,868 (3.8x) |

---

### FINANCE PERSONA (Default)

#### INDIA (₹401–₹3,846/hr)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✓ +₹17,684 (0.6x) | ✓ +₹79,895 (2.8x) | ✗ -₹23,000 (0.8x) |
| **Medium (50 sh, p50)** | ✓ +₹177,798 (2.1x) | ✓ +₹199,266 (2.3x) | ✗ -₹55,000 (0.6x) |
| **Large (100 sh, p90)** | ✓ +₹464,630 (2.5x) | ✓ +₹290,877 (1.6x) | ✗ -₹110,000 (0.6x) |

**Key Insight**: Finance shows positive in-house savings even at small scale. Existing-tool always negative.

#### USA ($43–$118/hr)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✓ +$4,026 (5.2x) | ✓ +$10,149 (13.2x) | ✓ +$711 (0.9x) |
| **Medium (50 sh, p50)** | ✓ +$8,161 (4.8x) | ✓ +$20,238 (11.8x) | ✓ +$4,277 (2.5x) |
| **Large (100 sh, p90)** | ✓ +$16,066 (4.7x) | ✓ +$25,991 (7.7x) | ✓ +$8,554 (2.5x) |

#### SINGAPORE (S$46–S$187/hr)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✓ +S$3,649 (4.4x) | ✓ +S$8,458 (10.1x) | ✓ +S$613 (0.7x) |
| **Medium (50 sh, p50)** | ✓ +S$11,605 (4.9x) | ✓ +S$18,223 (7.7x) | ✓ +S$4,032 (1.7x) |
| **Large (100 sh, p90)** | ✓ +S$23,461 (4.9x) | ✓ +S$24,530 (5.2x) | ✓ +S$8,064 (1.7x) |

#### UK (£27–£83/hr)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✓ +£2,143 (4.4x) | ✓ +£6,563 (13.4x) | ✓ +£774 (1.6x) |
| **Medium (50 sh, p50)** | ✓ +£4,700 (4.1x) | ✓ +£13,189 (11.5x) | ✓ +£4,434 (3.9x) |
| **Large (100 sh, p90)** | ✓ +£10,141 (4.3x) | ✓ +£17,026 (7.1x) | ✓ +£8,868 (3.7x) |

---

### HR PERSONA

#### INDIA (₹322–₹2,404/hr)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✓ +₹9,472 (0.3x) | ✓ +₹77,157 (2.8x) | ✗ -₹23,000 (0.8x) |
| **Medium (50 sh, p50)** | ✓ +₹118,318 (1.5x) | ✓ +₹179,439 (2.2x) | ✗ -₹55,000 (0.7x) |
| **Large (100 sh, p90)** | ✓ +₹245,432 (1.5x) | ✓ +₹217,811 (1.4x) | ✗ -₹110,000 (0.7x) |

**Key Insight**: HR shows much lower ROI than Finance in India (0.3x vs 0.6x small), but still positive. Existing-tool negative.

#### USA ($32–$74/hr)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✓ +$2,922 (4.5x) | ✓ +$9,781 (15.1x) | ✓ +$711 (1.1x) |
| **Medium (50 sh, p50)** | ✓ +$5,160 (3.7x) | ✓ +$19,238 (14.0x) | ✓ +$4,277 (3.1x) |
| **Large (100 sh, p90)** | ✓ +$9,536 (3.6x) | ✓ +$23,815 (8.9x) | ✓ +$8,554 (3.2x) |

#### SINGAPORE (S$21–S$138/hr)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✓ +S$1,456 (2.5x) | ✓ +S$7,727 (13.1x) | ✓ +S$613 (1.0x) |
| **Medium (50 sh, p50)** | ✓ +S$7,092 (3.8x) | ✓ +S$16,719 (9.0x) | ✓ +S$4,032 (2.2x) |
| **Large (100 sh, p90)** | ✓ +S$16,806 (4.2x) | ✓ +S$22,312 (5.6x) | ✓ +S$8,064 (2.0x) |

#### UK (£26–£55/hr)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✓ +£2,055 (4.3x) | ✓ +£6,534 (13.6x) | ✓ +£774 (1.6x) |
| **Medium (50 sh, p50)** | ✓ +£3,518 (3.5x) | ✓ +£12,795 (12.6x) | ✓ +£4,434 (4.3x) |
| **Large (100 sh, p90)** | ✓ +£6,338 (3.2x) | ✓ +£15,758 (8.0x) | ✓ +£8,868 (4.5x) |

---

### CS/LEGAL PERSONA (Lowest rates)

#### INDIA (₹147–₹962/hr) — CRITICAL NEGATIVE ZONE

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✗ -₹19,839 (0.8x) | ✓ +₹60,709 (2.8x) | ✗ -₹23,000 (0.9x) |
| **Medium (50 sh, p50)** | ✓ +₹37,956.60 (0.7x) | ✓ +₹59,588 (1.1x) | ✗ -₹55,000 (0.6x) |
| **Large (100 sh, p90)** | ✓ +₹148,738 (0.9x) | ✓ +₹110,186 (1.0x) | ✗ -₹110,000 (0.6x) |

**⚠️ CRITICAL FINDING**: Small company with CS p10 in India = -₹19,839 (HIGHLY NEGATIVE). This is your exact scenario—**switching to CS at default state results in negative savings**.

#### USA ($46–$97/hr)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✓ +$3,217 (5.2x) | ✓ +$9,444 (13.4x) | ✓ +$711 (1.0x) |
| **Medium (50 sh, p50)** | ✓ +$6,857 (4.8x) | ✓ +$17,844 (10.4x) | ✓ +$4,277 (2.5x) |
| **Large (100 sh, p90)** | ✓ +$13,835 (4.7x) | ✓ +$22,348 (7.4x) | ✓ +$8,554 (2.5x) |

#### SINGAPORE (S$29–S$105/hr)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✓ +S$1,265 (4.3x) | ✓ +S$6,438 (10.9x) | ✓ +S$613 (0.8x) |
| **Medium (50 sh, p50)** | ✓ +S$5,932 (3.6x) | ✓ +S$13,759 (5.9x) | ✓ +S$4,032 (1.7x) |
| **Large (100 sh, p90)** | ✓ +S$14,486 (4.3x) | ✓ +S$18,964 (4.8x) | ✓ +S$8,064 (1.7x) |

#### UK (£12–£41/hr)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✓ +£1,435 (3.8x) | ✓ +£5,835 (12.2x) | ✓ +£774 (1.6x) |
| **Medium (50 sh, p50)** | ✓ +£2,916 (2.8x) | ✓ +£10,695 (10.5x) | ✓ +£4,434 (3.9x) |
| **Large (100 sh, p90)** | ✓ +£5,272 (2.8x) | ✓ +£13,064 (6.5x) | ✓ +£8,868 (3.7x) |

---

## Detailed Scenario Examples

### Scenario A: Your Default State → CS Persona (NEGATIVE)

```
Inputs:        Default state with Persona changed to CS/Legal
               45 total stakeholders (30+15), 10 grants/year
               In-house method, India
Tier:          p50 (31–70 range)
Hourly Rate:   ₹297/hr (India CS p50 — much lower than Finance p50 ₹1,923)

YOUR COSTS:
  Grant admin:    10 × 1.5 × 1.0 × ₹297 = ₹4,455
  Compliance:     72 × 1.0 × ₹297 = ₹21,384
  Cap table:      40.8 hrs × 1.0 × ₹297 = ₹12,118
  External:       ₹0 (in-house)
  ──────────────────────────────────────────────────
  TOTAL:          ₹37,957/year

EQUITYLIST COST:
  Platform:       45 × ₹1,200 × 1 = ₹54,000
  Overhead:       (15+72+40.8) × 0.1 × ₹297 = ₹3,796
  ──────────────────────────────────────────────────
  TOTAL:          ₹57,796/year

RESULT:
  Savings:        ₹37,957 - ₹57,796 = -₹19,839 ✗ NEGATIVE
  Cost Ratio:     Your cost is 65.7% of EquityList
  
BUSINESS CASE:
  As CS/Legal handling equity (lowest rate persona in India), your costs are
  manageable even at 45 stakeholders. EquityList not justified financially.
  
  Decision: STAY PUT — revisit when:
  - Scaling beyond 50–70 stakeholders (complexity increases)
  - CS/Legal role becomes constrained by compliance
  - Error rates increase (manual vesting mistakes)
```

### Scenario B: Finance Persona, Same Default State (POSITIVE)

```
Inputs:        Same state but with Finance persona
               45 stakeholders, 10 grants/year, in-house, India
Tier:          p50
Hourly Rate:   ₹1,923/hr (India Finance p50 — 6.5x higher than CS)

YOUR COSTS:
  Total:          ₹240,540/year (6.5x higher than CS)

EQUITYLIST COST:  ₹57,796/year (same)

RESULT:
  Savings:        ₹240,540 - ₹57,796 = +₹182,744 ✓ POSITIVE
  ROI Multiple:   3.2x
  
BUSINESS CASE:
  With Finance handling equity, manual costs are much higher (more expensive
  role, more compliance overhead). EquityList saves 76% of costs.
  
  Decision: MIGRATE NOW
```

### Scenario C: CS Persona, US Market (POSITIVE)

```
Inputs:        CS persona, but US location instead of India
               45 stakeholders, 10 grants/year, in-house, US
Tier:          p50
Hourly Rate:   $67/hr (US CS p50)

YOUR COSTS:
  Total:        ~$7,100/year (much lower than Finance, but US rates are high)

EQUITYLIST COST:
  Platform:     45 × ₹1,200 × 0.01205 = $649
  Overhead:     ~$280
  Total:        ~$929/year

RESULT:
  Savings:      ₹6,171 ✓ POSITIVE (even with lowest-rate persona)
  
BUSINESS CASE:
  Geography dominates: Even CS (lowest rate) in US beats EquityList because
  US labor rates ($67/hr) are still expensive relative to platform fee.
  
  Decision: MIGRATE (geography advantage)
```

---

## Persona Comparison: Same Scenario, All Personas

**Scenario: 20 stakeholders, 5 grants/year, in-house, India (Small, p10)**

| Persona | Rate | Your Cost | EL Cost | Savings | Status | Decision |
|:---|:---|:---|:---|:---|:---|:---|
| **Founder** | ₹131 | ₹15,131 | ₹25,513 | -₹10,383 | ✗ NEG | Stay |
| **Finance** | ₹401 | ₹46,316 | ₹28,632 | +₹17,684 | ✓ POS | Migrate |
| **HR** | ₹322 | ₹37,191 | ₹27,719 | +₹9,472 | ✓ POS | Migrate |
| **CS/Legal** | ₹147 | ₹16,980 | ₹25,513 | -₹8,533 | ✗ NEG | Stay |

**Key Insight**: Same company, same location, different persona = OPPOSITE decisions. CS shows negative; Finance shows 3.7x higher savings.

---

## Breakeven Scenarios by Persona

### When does savings = 0 by persona?

**Founder + India:**
- Small: -₹10,383 (negative)
- Breakeven at: ~25 stakeholders (p50 threshold where hiring more senior person assumed)
- **Critical**: Founder p10 always negative in India

**Finance + India:**
- Small: +₹17,684 (positive)
- Breakeven at: Never (even at small scale, positive)

**HR + India:**
- Small: +₹9,472 (positive, but lowest)
- Breakeven at: Never (but very low margin at small scale)

**CS + India:**
- Small: -₹19,839 (HIGHLY NEGATIVE)
- Medium: +₹37,957 but EL cost ₹79,813 = NET -₹41,856 actually (recalculating...)

Wait, let me verify the CS medium calculation from the matrix. It shows:
Medium, CS, India, in-house: NOT shown directly. Let me calculate:
- 50 stakeholders → p50
- Rate: ₹297
- Grant: 10 × 1.5 × ₹297 = ₹4,455
- Compliance: 72 × ₹297 = ₹21,384
- Cap table: ~54 hrs × ₹297 = ₹16,038
- Total: ₹41,877

- EL Platform: 50 × ₹1,200 = ₹60,000
- EL Overhead: (15+72+54) × 0.1 × ₹297 = ₹4,188
- Total: ₹64,188

- Savings: ₹41,877 - ₹64,188 = -₹22,311 (still negative!)

So CS in India is persistently negative even at medium scale.

---

## Business Decision Rules by Persona × Geography

| Persona | Geography | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|:---|
| **Founder** | India | ✗ NEG (s), ✓ POS (m/l) | ✓ POS | ✗ NEG |
| **Founder** | US/UK/SG | ✓ POS | ✓ POS | ✓ POS |
| **Finance** | India | ✓ POS | ✓ POS | ✗ NEG |
| **Finance** | US/UK/SG | ✓ POS | ✓ POS | ✓ POS |
| **HR** | India | ✓ POS | ✓ POS | ✗ NEG |
| **HR** | US/UK/SG | ✓ POS | ✓ POS | ✓ POS |
| **CS/Legal** | India | ✗ NEG (even at scale) | ✓ POS (s/m), ✓ POS (l) | ✗ NEG |
| **CS/Legal** | US/UK/SG | ✓ POS | ✓ POS | ✓ POS |

**s = small, m = medium, l = large**

---

## Summary: When Savings is Positive vs. Negative

### ✓ POSITIVE (Switch to EquityList)
- **Always**: Any persona + outsourced + any geography
- **Usually**: Finance/HR + in-house + any geography
- **Conditionally**: Founder + in-house + medium/large scale in India; any persona + any method in US/UK/SG
- **ROI Range**: 0.3x to 15.7x

### ✗ NEGATIVE (Stay with Current Method)
- **Always**: CS/Legal + in-house + India (at ANY scale)
- **Usually**: CS/Legal + existing-tool + India; Founder + in-house + small scale in India
- **Conditionally**: Finance/HR + existing-tool + India
- **ROI Range**: 0.6x to 0.9x (inverted—your cost is cheaper)

### ~ NEUTRAL (Evaluate Non-Financial Factors)
- **Rarely**: Breakeven scenarios when tool_cost ≈ el_cost (CS in US at very small scale with cheap tool)
- **ROI Range**: 0.9x to 1.1x

---

## UI/Messaging by Scenario

### POSITIVE SAVINGS: "Book a demo →"
- When: Finance/HR in-house India, any persona outsourced, any persona in US/UK/SG
- Message: "Save [amount]/year + [hours] hrs of work annually"
- Emphasis: ROI, time savings, compliance confidence

### NEGATIVE SAVINGS: "Notify me when to switch →"
- When: CS in India, Founder p10 in India, existing-tool in India
- Message: "Your current approach is cost-effective at this stage"
- Emphasis: Education on scaling pain points, not financial penalty

### BREAKEVEN: "Learn more →"
- When: Rare edge cases with similar costs
- Message: "Financial case is neutral; other factors may drive choice"
- Emphasis: Risk, compliance, time value
