# Compliance and Grant Administration Model

## Updated Logic (Corrected)

### Compliance Hours
Scales with **current + future option holders**:
```javascript
if (optionHolders > 0 || newHireGrants > 0):
  complianceWork = (optionHolders + newHireGrants) * factor[stage]
  accountingOverhead = country_baseline * stage_scale * (1 + optionHolders * 0.01)
```

**Key:** Both current and new hire grants affect compliance complexity.

### Grant Administration Hours
Scales with **current option holders + all grants**:
```javascript
grantAdminWork = optionHolders + newHireGrants + refreshGrants
grHrs = grantAdminWork * 1.5 hrs per grant/holder
```

**Key:** You're administering:
- Current option holders (ongoing management)
- New hire grants (new grants to process)
- Refresh grants (acceleration/refresh grants to process)

---

## Examples

### Scenario 1: Pre-seed, Starting Equity Plan
```
Shareholders: 2
Option holders: 0
New hire grants: 5/year
Refresh grants: 0/year
```

**Compliance:**
- shareholders: 2 × 0.03 = 0.06
- optionHolders + newHireGrants: (0 + 5) × 0.03 = 0.15
- accounting: 40 × 0.25 × (1 + 0 × 0.01) = 10
- **Total: 10.2 → 10 hours**

**Grant Admin:**
- 0 (current) + 5 (new hires) + 0 (refresh) = 5
- **5 × 1.5 = 7.5 hours**

**Stakeholders (for pricing):**
- 2 + 0 + 5 = 7 people

---

### Scenario 2: Series A, Growing Pool
```
Shareholders: 20
Option holders: 15
New hire grants: 8/year
Refresh grants: 12/year
```

**Compliance:**
- shareholders: 20 × 0.08 = 1.6
- optionHolders + newHireGrants: (15 + 8) × 0.08 = 1.84
- accounting: 40 × 0.60 × (1 + 15 × 0.01) = 27.6
- **Total: 31.04 → 31 hours**

**Grant Admin:**
- 15 (current) + 8 (new hires) + 12 (refresh) = 35
- **35 × 1.5 = 52.5 hours**

**Stakeholders (for pricing):**
- 20 + 15 + 8 = 43 people

---

### Scenario 3: Series C, Mature with High Activity
```
Shareholders: 60
Option holders: 80
New hire grants: 30/year
Refresh grants: 20/year
```

**Compliance:**
- shareholders: 60 × 0.15 = 9
- optionHolders + newHireGrants: (80 + 30) × 0.15 = 16.5
- accounting: 40 × 1.0 × (1 + 80 × 0.01) = 72
- **Total: 97.5 → 98 hours**

**Grant Admin:**
- 80 (current) + 30 (new hires) + 20 (refresh) = 130
- **130 × 1.5 = 195 hours**

**Stakeholders (for pricing):**
- 60 + 80 + 30 = 170 people

---

## Key Insights

### Compliance grows with equity activity:
- **More new hires** = higher complexity (more people to track)
- **More current option holders** = higher accounting overhead (more vesting to report)
- Both matter equally for compliance hours per person

### Grant admin grows linearly:
- Each option holder = 1.5 hours/year of ongoing management
- Each new hire grant = 1.5 hours to process
- Each refresh grant = 1.5 hours to process
- **Total = sum of all three**

### Stakeholder count affects pricing only:
- Current shareholders + current option holders + new hire grants
- Refresh grants don't expand stakeholder count (already counted in oh)

---

## The Distinction

| Input | Compliance | Grant Admin | Stakeholders |
|-------|-----------|-------------|--------------|
| optionHolders | ✅ (current count) | ✅ (ongoing mgmt) | ✅ (current) |
| newHireGrants | ✅ (future complexity) | ✅ (grant processing) | ✅ (projected) |
| refreshGrants | ❌ (not new people) | ✅ (grant processing) | ❌ (already counted) |

---

## Validation Rules

1. **If optionHolders = 0:**
   - refreshGrants must = 0 (can't refresh non-existent holders)
   - newHireGrants can be > 0 (planning to create a pool)
   - Compliance triggers if newHireGrants > 0

2. **If optionHolders > 0:**
   - refreshGrants can be > 0 (refreshing existing holders)
   - newHireGrants can be > 0 (hiring more)
   - All grant admin work counts

3. **Accounting overhead:**
   - Based on CURRENT optionHolders only
   - Not affected by newHireGrants
   - Reflects actual reporting burden today
