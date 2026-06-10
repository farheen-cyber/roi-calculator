# Implementation Guide: Direct Calculation Approach for Hours Override

**Objective**: When user edits hours (via assumptions editor), recalculate all cost components directly using the edited hours value instead of applying a proportional ratio to the final cost.

**Key Benefit**: Retainer costs (fixed) won't be accidentally scaled when hours are overridden.

---

## IMPLEMENTATION PLAN

### **CHANGE 1: Add Adjusted Hours Calculation in `computeROI()`**

**Location**: After line 470 (replace lines 469-476)

**Current code:**
```javascript
const originalHTotal = totalGrantAdminWork * grHr + compHr + ctRaw + ctFundraisingHours + secFundraisingRaw;
const manualHTotal = overrides.manualHTotal || originalHTotal;

// If hours are overridden, adjust cost proportionally
if (overrides.manualHTotal && originalHTotal > 0) {
  const hoursRatio = overrides.manualHTotal / originalHTotal;
  annCost = Math.round(annCost * hoursRatio);
}
```

**New code:**
```javascript
const originalHTotal = totalGrantAdminWork * grHr + compHr + ctRaw + ctFundraisingHours + secFundraisingRaw;
const manualHTotal = overrides.manualHTotal || originalHTotal;

// If hours are overridden, scale component hours proportionally
let adjustedGrHr = grHr;
let adjustedCompHr = compHr;
let adjustedCtRaw = ctRaw;
let adjustedCtFundraisingHours = ctFundraisingHours;
let adjustedSecFundraisingRaw = secFundraisingRaw;

if (overrides.manualHTotal && originalHTotal > 0) {
  const hoursRatio = manualHTotal / originalHTotal;
  adjustedGrHr = grHr * hoursRatio;
  adjustedCompHr = compHr * hoursRatio;
  adjustedCtRaw = ctRaw * hoursRatio;
  adjustedCtFundraisingHours = ctFundraisingHours * hoursRatio;
  adjustedSecFundraisingRaw = secFundraisingRaw * hoursRatio;
}
```

---

### **CHANGE 2: Use Adjusted Hours in Grant Administration Cost**

**Location**: Line 401

**Current:**
```javascript
const grHrs = totalGrantAdminWork * grHr;
```

**New:**
```javascript
const grHrs = totalGrantAdminWork * adjustedGrHr;  // ← Use adjusted value
```

---

### **CHANGE 3: Use Adjusted Hours in Compliance Cost**

**Location**: Line 403

**Current:**
```javascript
const cpCost = compHr * mult * rate;
```

**New:**
```javascript
const cpCost = adjustedCompHr * mult * rate;  // ← Use adjusted value
```

---

### **CHANGE 4: Use Adjusted Hours in Cap Table Cost**

**Location**: Lines 414-415

**Current:**
```javascript
const ctHrs = ctRaw * mult;
const ctCost = ctHrs * rate;
```

**New:**
```javascript
const ctHrs = adjustedCtRaw * mult;  // ← Use adjusted value
const ctCost = ctHrs * rate;
```

---

### **CHANGE 5: Use Adjusted Hours in Cap Table Fundraising Cost**

**Location**: Line 427

**Current:**
```javascript
const ctFundraisingHrs = ctFundraisingHours * mult;
```

**New:**
```javascript
const ctFundraisingHrs = adjustedCtFundraisingHours * mult;  // ← Use adjusted value
```

---

### **CHANGE 6: Use Adjusted Hours in Secretarial Fundraising Cost**

**Location**: Line 443

**Current:**
```javascript
const secFundraisingHrs = secFundraisingRaw * mult;
```

**New:**
```javascript
const secFundraisingHrs = adjustedSecFundraisingRaw * mult;  // ← Use adjusted value
```

---

### **CHANGE 7: Display Method-Aware Hours in Assumptions Editor**

**Location**: Line 1455 (in the assumptions section, total equity management hours field)

**Current:**
```javascript
value={editedHours !== null && editedHours !== '' ? editedHours : Math.round(v.manualHTotal)}
```

**New:**
```javascript
value={editedHours !== null && editedHours !== '' ? editedHours : Math.round(
  recalcFormValues?.meth === 'outsourced' ? v.manualHTotal * v.mult : v.manualHTotal
)}
```

**Explanation**: 
- When in-house: show full hours (e.g., 785)
- When outsourced: show internal hours only (e.g., 157 = 785 × 0.2)

---

### **CHANGE 8: Preserve Hours Override When Switching Methods**

**Location**: Line 1843-1846 (in `handleInputChange` function)

**Current:**
```javascript
// Clear edited assumptions if method changed (prevent stale values showing when switching methods)
if (currentFormData.meth !== formData.meth) {
  setEditedRate(null);
  setEditedHours(null);
}
```

**New:**
```javascript
// Clear edited rate if method changed, but PRESERVE hours (it will be recalculated for display)
if (currentFormData.meth !== formData.meth) {
  setEditedRate(null);
  // Don't clear editedHours - let it recalculate and display with new method's context
}
```

**Explanation**: Hours override should persist across method changes. The display will automatically show adjusted value based on method (line 1455 change).

---

## TESTING PLAN

### **Test 1: In-house → Outsourced (no user edit)**

**Setup**:
- Create Series A/B company, India
- Shareholders: 30, Option holders: 15, New hires: 5, Refresh: 5
- Method: **In-house**

**Expected Display**:
- "Total equity management hours: 785"
- Cost: 785 × ₹1,172 = ₹920,020

**Action**: Switch to **Outsourced**

**Expected After Switch**:
- "Internal effort hours: 157" (automatically displays 785 × 0.2)
- Cost: (157 × ₹1,172) + ₹151,000 = ₹335,804 + ₹151,000 = **₹486,804**
- Verify: Retainer (₹151,000) is NOT scaled

---

### **Test 2: User Edits Hours in In-house, Then Switches to Outsourced**

**Setup**: Same as Test 1

**Action**: In in-house method, edit hours from 785 to **900**

**Expected**:
- Cost: 900 × ₹1,172 = **₹1,054,800**
- Cost breakdown increases proportionally

**Action**: Switch to **Outsourced**

**Expected After Switch**:
- "Internal effort hours: 180" (900 × 0.2)
- Cost: (180 × ₹1,172) + ₹151,000 = ₹210,960 + ₹151,000 = **₹361,960**
- Verify: Override of 900 is preserved, but displayed as 180 for outsourced context

**Action**: Switch back to **In-house**

**Expected**:
- "Total equity management hours: 900" (override preserved)
- Cost: 900 × ₹1,172 = **₹1,054,800**

---

### **Test 3: User Edits Hours While Outsourced**

**Setup**: Same as Test 1, already in Outsourced method showing 157 hours

**Action**: Edit "Internal effort hours" from 157 to **200**

**Expected**:
- Cost: (200 × ₹1,172) + ₹151,000 = ₹234,400 + ₹151,000 = **₹385,400**
- Verify: Retainer stays at ₹151,000 (NOT scaled)
- Verify: Only hourly components scale

**Calculation Check**:
- Original: (157 × ₹1,172) + ₹151,000 = ₹335,804
- Edited:   (200 × ₹1,172) + ₹151,000 = ₹385,400
- Difference: ₹49,596 = (200 - 157) × ₹1,172 ✓

---

### **Test 4: Edge Case - Hours Set to Zero**

**Setup**: Outsourced method

**Action**: Edit "Internal effort hours" to **0**

**Expected**:
- Cost: (0 × ₹1,172) + ₹151,000 = **₹151,000**
- Verify: Only retainer charged
- This should be allowed (no validation blocking it)

---

### **Test 5: Verify Retainer Doesn't Scale**

**Setup**: Series B company, outsourced, retainer = ₹256,000

**Initial**: 
- Total hours: 225
- Internal hours: 45 (225 × 0.2)
- Cost: (45 × rate) + ₹256,000

**Edit to 270 hours** (ratio 1.2×):

**Without fix (proportional)** ❌:
- Cost: (original × 1.2) = all components scaled including retainer
- Retainer scaled: ₹256,000 × 1.2 = ₹307,200 (WRONG!)

**With fix (direct)** ✓:
- Internal hours: 54 (270 × 0.2)
- Cost: (54 × rate) + ₹256,000 (retainer unchanged)

---

## VERIFICATION CHECKLIST

- [ ] In-house method shows full hours (e.g., 785)
- [ ] Outsourced method shows internal hours (e.g., 157)
- [ ] Display updates when switching methods (no manual refresh needed)
- [ ] Retainer cost shown in "Outsourced Administration Retainer" line
- [ ] When editing in-house hours, cost scales proportionally
- [ ] When editing outsourced hours, only hourly costs scale (retainer stays fixed)
- [ ] Switching methods preserves the hour override (displays with method's context)
- [ ] Editing to 0 hours is allowed
- [ ] Cost breakdown shows correct components for each method
- [ ] Apply button correctly saves edited hours and recalculates

---

## Rollback Plan

If anything breaks, revert by:
1. Restore lines 469-476 to original proportional logic
2. Remove `adjusted*` variables from lines 401, 403, 414, 427, 443
3. Restore original display logic at line 1455
4. Restore original handleInputChange logic at line 1843

All changes are isolated to these 7 locations, so rollback is straightforward.
