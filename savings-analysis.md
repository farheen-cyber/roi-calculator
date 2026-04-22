# EquityList ROI Calculator — Savings Analysis & Decision Matrix

**Purpose**: Comprehensive analysis of when EquityList delivers positive vs. negative savings across all company sizes, methods, and geographies.

**Key Metric**: Your Potential Savings with EquityList
```javascript
savings = annCost - elAnn
```

---

## Factor Analysis: What Drives Positive vs. Negative Savings

**Primary Factors (ranked by impact):**

| Factor | Impact | Details |
|:---|:---|:---|
| **Method** | Dominant | In-house: always positive (high labor costs). Outsourced: always positive (high retainer). Existing-tool: negative in low-cost markets (India), positive in high-cost markets (US/EU). |
| **Geography** | Dominant | Low-cost markets (India) → higher likelihood of negative. High-cost markets (US, UK, SG) → almost always positive. EquityList's ₹1,200/stakeholder base pricing is extremely cheap when converted to USD/GBP/SGD. |
| **Hourly Rate** | Moderate | Higher rate → higher ops_cost → better EquityList value. Rate determined by geo + persona tier. |
| **Company Size** | Moderate | Larger companies have more work (more hours), raising ops_cost. But also pay higher rates (p90 tier). Effect is net-neutral on savings sign, but affects magnitude. |
| **Number of Grants** | Weak | More grants → higher ops_cost → slightly better case for EquityList. Small relative impact. |

### Critical Interaction: Method × Geography

The strongest predictor is the combination of **method** and **geography**:

- **In-house + Any Geography**: ✓ **ALWAYS POSITIVE** (manual labor is expensive everywhere)
- **Outsourced + Any Geography**: ✓ **ALWAYS POSITIVE** (retainer costs are high everywhere)
- **Existing-tool + India/Low-cost**: ✗ **OFTEN NEGATIVE** (already cheap to operate)
- **Existing-tool + US/UK/SG**: ✓ **POSITIVE** (labor is expensive, tool cost amortized across high baseline)

---

## Complete Decision Matrix: All 36 Permutations

### INDIA (₹1,200 platform fee = ₹1,200/stakeholder/year)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✓ +₹17,684 (0.6x ROI) | ✓ +₹79,895 (2.8x ROI) | ✗ -₹23,000 (0.8x ROI) |
| **Medium (50 sh, p50)** | ✓ +₹177,798 (2.1x ROI) | ✓ +₹199,266 (2.3x ROI) | ✗ -₹55,000 (0.6x ROI) |
| **Large (100 sh, p90)** | ✓ +₹464,630 (2.5x ROI) | ✓ +₹290,877 (1.6x ROI) | ✗ -₹110,000 (0.6x ROI) |

**Key Insight**: Existing-tool always negative in India because low labor rates make the tool cheaper than EquityList's fixed overhead.

### USA ($14.46 platform fee = ₹1,200/stakeholder converted at 0.01205 FX)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✓ +$4,026 (5.2x ROI) | ✓ +$10,149 (13.2x ROI) | ✓ +$711 (0.9x ROI) |
| **Medium (50 sh, p50)** | ✓ +$8,161 (4.8x ROI) | ✓ +$20,238 (11.8x ROI) | ✓ +$4,277 (2.5x ROI) |
| **Large (100 sh, p90)** | ✓ +$16,066 (4.7x ROI) | ✓ +$25,991 (7.7x ROI) | ✓ +$8,554 (2.5x ROI) |

**Key Insight**: All positive. High labor rates ($40–$166/hr) make any method more expensive than EquityList's base pricing ($14.46/stakeholder).

### SINGAPORE (S$19.36 platform fee = ₹1,200/stakeholder converted at 0.01613 FX)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✓ +S$3,649 (4.4x ROI) | ✓ +S$8,458 (10.1x ROI) | ✓ +S$613 (0.7x ROI) |
| **Medium (50 sh, p50)** | ✓ +S$11,605 (4.9x ROI) | ✓ +S$18,223 (7.7x ROI) | ✓ +S$4,032 (1.7x ROI) |
| **Large (100 sh, p90)** | ✓ +S$23,461 (4.9x ROI) | ✓ +S$24,530 (5.2x ROI) | ✓ +S$8,064 (1.7x ROI) |

**Key Insight**: All positive. Even existing-tool is beaten by EquityList because labor rates (S$13–S$280/hr) are still higher than equivalent platform cost.

### UK (£11.32 platform fee = ₹1,200/stakeholder converted at 0.00943 FX)

| Company Size | In-House | Outsourced | Existing-Tool |
|:---|:---|:---|:---|
| **Small (20 sh, p10)** | ✓ +£2,143 (4.4x ROI) | ✓ +£6,563 (13.4x ROI) | ✓ +£774 (1.6x ROI) |
| **Medium (50 sh, p50)** | ✓ +£4,700 (4.1x ROI) | ✓ +£13,189 (11.5x ROI) | ✓ +£4,434 (3.9x ROI) |
| **Large (100 sh, p90)** | ✓ +£10,141 (4.3x ROI) | ✓ +£17,026 (7.1x ROI) | ✓ +£8,868 (3.7x ROI) |

**Key Insight**: All positive. High UK labor rates (£12–£83/hr) ensure EquityList pricing advantage across all scenarios.

---

## Detailed Scenario Examples

### Scenario A: Small Indian Startup, In-House (POSITIVE)

```
Inputs:        20 stakeholders, 5 grants/year, in-house, India, Finance
Tier:          p10 (≤30 threshold)
Hourly Rate:   ₹401/hr (India Finance 10th percentile)

YOUR COSTS:
  Grant admin:    5 grants × 1.5 hrs × 1.0 mult × ₹401 = ₹3,008
  Compliance:     72 hrs × 1.0 mult × ₹401 = ₹28,872
  Cap table:      36 hrs × 1.0 mult × ₹401 = ₹14,436
  External:       ₹0 (in-house, no retainer)
  ──────────────────────────────────────────────────
  TOTAL:          ₹46,316/year

EQUITYLIST COST:
  Platform:       20 × ₹1,200 × 1 = ₹24,000
  Overhead:       (7.5+72+36) hrs × 0.1 × ₹401 = ₹4,632
  ──────────────────────────────────────────────────
  TOTAL:          ₹28,632/year

RESULT:
  Savings:        ₹46,316 - ₹28,632 = +₹17,684 ✓ POSITIVE
  ROI Multiple:   ₹17,684 / ₹28,632 = 0.6x
  % Reduction:    38%
  
BUSINESS CASE:
  Switch to EquityList and save ₹17,684/year. Eliminate 90% of manual work.
  Decision: MIGRATE NOW
```

### Scenario B: Small Indian Startup, Existing Tool (NEGATIVE)

```
Inputs:        20 stakeholders, 5 grants/year, existing-tool (₹1,000/yr), India, Finance
Tier:          p10
Hourly Rate:   ₹401/hr

YOUR COSTS:
  Grant admin:    5 × 1.5 × 0.1 × ₹401 = ₹301
  Compliance:     72 × 0.1 × ₹401 = ₹2,887
  Cap table:      36 × 0.1 × ₹401 = ₹1,444
  External:       ₹1,000 (tool cost, amortized)
  ──────────────────────────────────────────────────
  TOTAL:          ₹5,632/year

EQUITYLIST COST:
  ₹28,632/year (same as Scenario A)

RESULT:
  Savings:        ₹5,632 - ₹28,632 = -₹23,000 ✗ NEGATIVE
  Cost Ratio:     Your cost is 19.7% of EquityList's cost
  ROI:            0.8x (inverted perspective)
  
BUSINESS CASE:
  Your existing tool is 5.1x cheaper than EquityList. At your scale (20 stakeholders
  with 5 grants/year), manual processes + cheap tool are manageable.
  
  REVISIT WHEN:
  - Stakeholders exceed 25–30 (tier threshold)
  - Tool becomes unreliable/unmaintainable
  - Compliance complexity increases
  - Manual errors increase
  
  Decision: STAY PUT, revisit in 12 months
```

### Scenario C: Large US Company, Outsourced (POSITIVE, HIGH ROI)

```
Inputs:        100 stakeholders, 15 grants/year, outsourced, US, Finance
Tier:          p90 (>70)
Hourly Rate:   $118/hr (US Finance 90th percentile)

YOUR COSTS:
  Grant admin:    15 × 1.5 × 0.4 × $118 = $1,062
  Compliance:     68 × 0.4 × $118 = $3,212
  Cap table:      71 hrs/yr × 0.4 × $118 = $3,352
                  (cap table baseline: 3 + (100−20)/50 × 2 = 6.2 hrs/month)
  External:       $18,000 × 1.2 (p90 tier mult) = $21,600
  ──────────────────────────────────────────────────
  TOTAL:          $29,226/year

EQUITYLIST COST:
  Platform:       100 × ₹1,200 × 0.01205 = $1,443
  Overhead:       (22.5+68+71) hrs × 0.1 × $118 = $1,749
  ──────────────────────────────────────────────────
  TOTAL:          $3,192/year

RESULT:
  Savings:        $29,226 - $3,192 = +$26,034 ✓ POSITIVE
  ROI Multiple:   $26,034 / $3,192 = 8.2x
  % Reduction:    89%
  Hours Saved:    161 hrs/year (71 + 68 + 22.5) × 0.9
  
BUSINESS CASE:
  Switch to EquityList and save $26,034/year (89% cost reduction).
  At this scale, outsourced retainer ($21,600) becomes your dominant cost.
  EquityList eliminates need for external vendor while reducing compliance risk.
  Decision: MIGRATE IMMEDIATELY
```

### Scenario D: Medium US Company, Existing Tool (POSITIVE, BREAKEVEN TERRITORY)

```
Inputs:        50 stakeholders, 10 grants/year, existing-tool ($5,000/yr), US, Finance
Tier:          p50 (31–70)
Hourly Rate:   $74/hr

YOUR COSTS:
  Grant admin:    10 × 1.5 × 0.1 × $74 = $111
  Compliance:     68 × 0.1 × $74 = $503
  Cap table:      54 hrs/yr × 0.1 × $74 = $400
                  (cap table baseline: 3 + (50−20)/50 × 2 = 4.2 hrs/month)
  External:       $5,000 (tool cost)
  ──────────────────────────────────────────────────
  TOTAL:          $6,014/year

EQUITYLIST COST:
  Platform:       50 × ₹1,200 × 0.01205 = $722
  Overhead:       (15+68+54) hrs × 0.1 × $74 = $988
  ──────────────────────────────────────────────────
  TOTAL:          $1,710/year

RESULT:
  Savings:        $6,014 - $1,710 = +$4,304 ✓ POSITIVE
  ROI Multiple:   $4,304 / $1,710 = 2.5x
  % Reduction:    72%
  
BUSINESS CASE:
  Switch to EquityList and save $4,304/year. Financial case is positive,
  but the real gains are non-financial:
  - Automatic vesting calculations (current tool likely requires manual review)
  - Compliance confidence (cap table audit-ready)
  - Risk reduction (eliminate manual errors at 50 stakeholder scale)
  
  Decision: MIGRATE NOW (financial + strategic case)
```

---

## Breakeven Analysis & Thresholds

### When does savings = 0?

**In India with Existing-Tool:**
- Savings = -₹23,000 at 20 stakeholders (tool is 5.1x cheaper)
- Savings = -₹55,000 at 50 stakeholders (tool is 17x cheaper)
- **No realistic breakeven**: Tool cost would need to be ₹28,632/year to break even, but typical existing-tool cost is ₹1,000–₹10,000
- **Implication**: Existing-tool will NEVER break even in India unless company reaches very high stakeholder count (>200+) or tool cost becomes ₹20,000+/year

**In US with Existing-Tool:**
- Savings = +$711 at 20 stakeholders (barely positive)
- Savings = +$4,277 at 50 stakeholders (clearly positive)
- **Breakeven zone**: ~$1,000–$1,500 tool cost at small scale
- **Implication**: If tool cost ≤$700/year, savings becomes negative at small scale; becomes positive as company scales

**General Breakeven Formula:**
```
For breakeven (savings = 0):
tool_cost + other_ops_cost = el_platform + el_overhead

Where:
el_cost = stakeholders × 1,200 × FX[geo] + manual_hours × 0.1 × rate

For in-house/outsourced: NEVER breakeven (method structural costs ensure positive savings)
For existing-tool: Breakeven depends heavily on FX[geo] and tool_cost
```

**Practical Breakeven Thresholds (existing-tool only):**
- **India**: No breakeven (tool always cheaper) until ≥150 stakeholders
- **US**: Breakeven at ~25–30 stakeholders with $2,000/yr tool
- **UK/SG**: Similar to US; breakeven moves faster with larger tool cost

---

## UI/Messaging by Savings Scenario

### POSITIVE SAVINGS (savings ≥ ₹0)

```
Visual: Green accent color
Button: "Book a demo →"
Primary Message: "You'll save [amount] per year with EquityList"
Secondary: "Plus [X] hours of manual work eliminated annually"
Tertiary: "[X]x ROI in year 1"

Context for messaging:
- If savings > 5x el_cost: Emphasize ROI multiple (e.g., "8x ROI")
- If savings < 1x el_cost: Emphasize non-financial benefits (compliance, accuracy, time)
- If outsourced: Emphasize retainer savings + compliance risk elimination

Example (Large US Company, Outsourced):
  "Save $26,034/year and eliminate vendor management. EquityList handles vesting,
   compliance, and cap table automatically. Book a demo to explore a 8x cheaper,
   lower-risk alternative to outsourced management."
```

### NEGATIVE SAVINGS (savings < ₹0)

```
Visual: Neutral/gray (no urgency)
Button: "Notify me when to switch →"
Primary Message: "At your stage, your current approach is manageable."
Secondary: "As you scale, automation becomes critical. We'll reach out around 
           25 stakeholders when equity complexity increases."

Context for messaging:
- Emphasize that negative savings is NOT a failure; it reflects efficiency
- Educate on scaling pain points without pressure
- Build relationship for future adoption

Example (Small Indian Company, Existing-Tool):
  "Your tool is handling equity administration cost-effectively today. As you grow
   beyond 25 stakeholders, you'll face new challenges:
   - Manual vesting calculations become error-prone
   - Cap table reconciliation across 50+ people takes days
   - Compliance reporting becomes complex
   
   We're here to help when automation becomes critical. We'll follow up in 12 months."
```

### ZERO SAVINGS (savings ≈ ₹0, ±₹500–₹1,000)

```
Visual: Neutral (indifference point)
Button: "Learn more →" (softer CTA)
Primary Message: "You're at a decision threshold. Consider the full picture."
Secondary: "Financial case is neutral. Non-financial factors may drive your choice."

Decision factors to present:
- Compliance confidence level
- Time value (hours saved, even if cost is neutral)
- Growth trajectory (will savings improve or worsen?)
- Vendor risk (reliance on partner for outsourced)

Context:
- This is rare but important; avoid pressure either direction
- Recommend decision matrix: financial cost vs. non-financial benefit
```

---

## Business Decision Rules by Scenario

| Scenario | Savings | ROI | Decision | Timing | Rationale |
|:---|:---|:---|:---|:---|:---|
| **In-house, any geo** | +₹17k–₹464k | 0.6–2.5x | Migrate now | Immediate | Manual labor expensive everywhere; EquityList always superior financially |
| **Outsourced, any geo** | +₹79k–₹290k | 1.6–13.4x | Migrate now | Immediate | Retainer costs are massive; EquityList platform fee is fraction of retainer |
| **Existing-tool, India** | -₹23k–₹110k | 0.6–0.8x | Stay put | 12–18 months | Low labor costs make tool cheaper; revisit when scaling or tool breaks |
| **Existing-tool, US/EU** | +₹711–₹8,554 | 0.9–3.9x | Migrate now | 3–6 months | High labor costs; tool savings don't offset compliance risk & scaling pain |
| **Breakeven (≈₹0)** | ~0 | ~1x | Evaluate intangibles | As needed | Financial case neutral; risk, time value, and audit readiness become deciding factors |

---

## Summary: When Savings is Positive vs. Negative

### ✓ POSITIVE (Switch to EquityList)
- **Always**: In-house any geography, Outsourced any geography
- **Usually**: Existing-tool in US, UK, Singapore
- **ROI Range**: 0.6x to 13.4x
- **Implication**: Financial case is clear; switch immediately or within 6 months

### ✗ NEGATIVE (Stay with Current Method)
- **Always**: Existing-tool in India (labor costs too low)
- **ROI Range**: 0.6x to 0.8x (inverted—your cost is cheaper)
- **Implication**: Current method is efficient; revisit decision in 12 months as company scales

### ~ NEUTRAL (Decide on Non-Financial Factors)
- **Rarely**: Breakeven scenarios when tool_cost ≈ el_cost
- **ROI Range**: 0.9x to 1.1x
- **Implication**: Emphasize compliance confidence, time value, audit readiness, not cost
