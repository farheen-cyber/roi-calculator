// Extract just the calculation function and test a specific scenario
const STAGE_HOURLY_RATES = {
  us: {
    preseed: { founder: 113, hr: 63, finance: 69, cs: 56 },
  }
};

const STAGE_RETAINER = {
  us: { preseed: 6000 }
};

const STAFFING_MATRIX = {
  preseed: { founder: 1.0, hr: 0.0, finance: 0.0, cs: 0.0 }
};

const COMPLIANCE = { us: 68 };

function getDynamicComplianceHours(stage, shareholders, oh, geoInc, grNewHire, grRefresh) {
  const baseHrs = COMPLIANCE[geoInc];
  const stageScale = { preseed: 0.5, seed: 0.75, seriesab: 1.0, seriesbc: 1.25, seriesc: 1.5 };
  const scale = stageScale[stage] || 1.0;
  
  const shareholderScale = shareholders > 0 ? (1 + Math.max(0, shareholders - 10) / 100) : 1;
  const optionScale = oh > 0 ? (1 + Math.max(0, oh - 5) / 50) : 1;
  const grantScale = (grNewHire + grRefresh) > 0 ? (1 + Math.max(0, (grNewHire + grRefresh) - 3) / 30) : 1;
  
  return baseHrs * scale * shareholderScale * optionScale * grantScale;
}

function calculateCost(inputs) {
  const { sh = 30, oh = 15, grNewHire = 5, grRefresh = 5, geoInc = 'us', stage = 'preseed', meth = 'in-house' } = inputs;
  
  const stageKey = stage;
  
  // Calculate rate
  const matrix = STAFFING_MATRIX[stageKey];
  let rate = 0;
  for (const role of ['founder', 'hr', 'finance', 'cs']) {
    if (role === 'hr' && oh === 0 && grNewHire === 0) continue;
    const fte = matrix[role] || 0;
    if (fte > 0) {
      rate += fte * STAGE_HOURLY_RATES[geoInc][stageKey][role];
    }
  }
  
  const mult = meth === 'in-house' ? 1 : 0.2;
  
  const grHr = 1.5;
  const compHr = getDynamicComplianceHours(stageKey, sh, oh, geoInc, grNewHire, grRefresh);
  
  const totalGrantAdminWork = oh + grNewHire + grRefresh;
  const grHrs = totalGrantAdminWork * grHr;
  const grCost = grHrs * mult * rate;
  const cpCost = compHr * mult * rate;
  
  // Cap table
  const ctShareholderScale = sh > 0 ? Math.max(0, (sh - 20) / 50) : 0;
  const ctMonthlyHours = sh > 0 ? 3 + (ctShareholderScale * 2) : 0;
  const ctRaw = ctMonthlyHours * 12;
  const ctHrs = ctRaw * mult;
  const ctCost = ctHrs * rate;
  
  // No fundraising for this test
  const ctFundraisingCost = 0;
  const secFundraisingCost = 0;
  
  // Method cost
  const methodExtCost = meth === 'outsourced' ? STAGE_RETAINER[geoInc][stageKey] : 0;
  
  const annCost = grCost + cpCost + ctCost + ctFundraisingCost + secFundraisingCost + methodExtCost;
  
  return { annCost: Math.round(annCost), details: { grCost, cpCost, ctCost, methodExtCost, rate, mult } };
}

// Test the scenario: US, Preseed, 100 shareholders, 30 option holders
const inputs = {
  sh: 100,
  oh: 30,
  grNewHire: 5,
  grRefresh: 5,
  geoInc: 'us',
  stage: 'preseed',
};

console.log('Testing: US, Preseed, 100 shareholders, 30 option holders, 5/5 grants');
console.log('---');

const inhouse = calculateCost({ ...inputs, meth: 'in-house' });
const outsourced = calculateCost({ ...inputs, meth: 'outsourced' });

console.log('In-house Cost: $' + inhouse.annCost.toLocaleString());
console.log('  Details:', inhouse.details);
console.log('');
console.log('CA Retainer Cost: $' + outsourced.annCost.toLocaleString());
console.log('  Details:', outsourced.details);
console.log('');
console.log('Difference:', inhouse.annCost - outsourced.annCost >= 0 ? 'In-house is cheaper by $' + (inhouse.annCost - outsourced.annCost).toLocaleString() : 'CA is cheaper by $' + (outsourced.annCost - inhouse.annCost).toLocaleString());
