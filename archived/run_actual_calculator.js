// Extract all data tables and functions from the actual calculator
const STAGE_HOURLY_RATES = {
  'india': {
    'preseed': {'founder': 500, 'hr': 288, 'finance': 325, 'cs': 250},
    'seed': {'founder': 1000, 'hr': 563, 'finance': 650, 'cs': 475},
    'seriesab': {'founder': 1875, 'hr': 1025, 'finance': 1188, 'cs': 875},
    'seriesbc': {'founder': 2750, 'hr': 1438, 'finance': 1688, 'cs': 1225},
    'seriesc': {'founder': 4000, 'hr': 2000, 'finance': 2313, 'cs': 1688}
  },
  'us': {
    'preseed': {'founder': 113, 'hr': 63, 'finance': 69, 'cs': 56},
    'seed': {'founder': 181, 'hr': 94, 'finance': 110, 'cs': 88},
    'seriesab': {'founder': 288, 'hr': 131, 'finance': 156, 'cs': 119},
    'seriesbc': {'founder': 356, 'hr': 169, 'finance': 200, 'cs': 150},
    'seriesc': {'founder': 431, 'hr': 219, 'finance': 250, 'cs': 200}
  },
  'singapore': {
    'preseed': {'founder': 100, 'hr': 63, 'finance': 69, 'cs': 54},
    'seed': {'founder': 188, 'hr': 103, 'finance': 119, 'cs': 85},
    'seriesab': {'founder': 331, 'hr': 181, 'finance': 200, 'cs': 150},
    'seriesbc': {'founder': 431, 'hr': 250, 'finance': 275, 'cs': 213},
    'seriesc': {'founder': 563, 'hr': 325, 'finance': 375, 'cs': 288}
  },
  'uk': {
    'preseed': {'founder': 63, 'hr': 40, 'finance': 44, 'cs': 31},
    'seed': {'founder': 110, 'hr': 63, 'finance': 70, 'cs': 55},
    'seriesab': {'founder': 181, 'hr': 98, 'finance': 110, 'cs': 85},
    'seriesbc': {'founder': 225, 'hr': 125, 'finance': 138, 'cs': 113},
    'seriesc': {'founder': 281, 'hr': 169, 'finance': 188, 'cs': 150}
  }
};

const STAGE_RETAINER = {
  'india': {'preseed': 60000, 'seed': 90000, 'seriesab': 151000, 'seriesbc': 256000, 'seriesc': 407000},
  'us': {'preseed': 6000, 'seed': 11000, 'seriesab': 18000, 'seriesbc': 35000, 'seriesc': 60000},
  'singapore': {'preseed': 10000, 'seed': 16000, 'seriesab': 21000, 'seriesbc': 40000, 'seriesc': 71000},
  'uk': {'preseed': 4500, 'seed': 8000, 'seriesab': 12000, 'seriesbc': 22000, 'seriesc': 40000}
};

const STAFFING_MATRIX = {
  'preseed': {'founder': 1.0, 'hr': 0.0, 'finance': 0.0, 'cs': 0.0},
  'seed': {'founder': 0.5, 'hr': 0.25, 'finance': 0.25, 'cs': 0.0},
  'seriesab': {'founder': 0.15, 'hr': 0.25, 'finance': 0.35, 'cs': 0.25},
  'seriesbc': {'founder': 0.05, 'hr': 0.3, 'finance': 0.35, 'cs': 0.3},
  'seriesc': {'founder': 0.02, 'hr': 0.25, 'finance': 0.35, 'cs': 0.38}
};

const COMPLIANCE = {'india': 72, 'us': 68, 'singapore': 54, 'uk': 54};
const FUNDRAISING_WORKFLOWS = {'capTable': 3, 'secretarial': 3};
const PRICING = {'india': 5000, 'us': 10000, 'singapore': 7500, 'uk': 6000};

function getDynamicComplianceHours(stage, shareholders, optionHolders, geoInc, newHireGrants = 0, refreshGrants = 0) {
  const stageScale = {'preseed': 0.5, 'seed': 0.75, 'seriesab': 1.0, 'seriesbc': 1.25, 'seriesc': 1.5};
  const scale = stageScale[stage] || 1.0;
  const totalGrants = parseInt(newHireGrants, 10) + parseInt(refreshGrants, 10);
  const reportHours = (baseHrs, scalingFactor = 1) => baseHrs * scale * scalingFactor;
  const shareholderScale = shareholders > 0 ? (1 + Math.max(0, shareholders - 10) / 100) : 1;
  const optionHolderScale = optionHolders > 0 ? (1 + Math.max(0, optionHolders - 5) / 50) : 1;
  const grantScale = totalGrants > 0 ? (1 + Math.max(0, totalGrants - 3) / 30) : 1;
  let hours = 0;
  if (shareholders > 0) {
    hours += reportHours(2, shareholderScale);
    hours += reportHours(3, shareholderScale);
  }
  if (optionHolders > 0 || newHireGrants > 0) {
    hours += reportHours(1, 1);
    hours += reportHours(1, grantScale);
    hours += reportHours(0.5, optionHolderScale);
    if (geoInc === 'india') {
      hours += reportHours(4, optionHolderScale);
      hours += reportHours(4, optionHolderScale);
    } else if (geoInc === 'us') {
      hours += reportHours(4, optionHolderScale);
      hours += reportHours(6, 1);
    } else if (geoInc === 'singapore' || geoInc === 'uk') {
      hours += reportHours(4, optionHolderScale);
    }
  }
  const stageOrder = {'preseed': 0, 'seed': 1, 'seriesab': 2, 'seriesbc': 3, 'seriesc': 4};
  if ((optionHolders > 0 || newHireGrants > 0) && (stageOrder[stage] || 0) >= 2) {
    hours += reportHours(1, optionHolderScale);
    hours += reportHours(0.5, optionHolderScale);
  }
  return Math.round(hours);
}

function computeROI(inputs, overrides = {}) {
  const {sh = 30, oh = 15, grNewHire = 5, grRefresh = 5, geoInc = 'india', stage = 'seriesab', meth = 'in-house'} = inputs;
  let stageKey = stage;
  const matrix = STAFFING_MATRIX[stageKey];
  let rate = 0;
  for (const role of ['founder', 'hr', 'finance', 'cs']) {
    if (role === 'hr' && oh === 0 && parseInt(grNewHire, 10) === 0) continue;
    const fte = matrix[role] || 0;
    if (fte > 0) {
      const roleRate = STAGE_HOURLY_RATES[geoInc][stageKey][role];
      rate += fte * roleRate;
    }
  }
  const mult = meth === 'in-house' ? 1 : 0.2;
  const grHr = overrides.grHr || 1.5;
  const compHr = overrides.compHr || getDynamicComplianceHours(stageKey, sh, oh, geoInc, grNewHire, grRefresh);
  const grNewHireNum = parseInt(grNewHire, 10);
  const grRefreshNum = parseInt(grRefresh, 10);
  const totalGrantAdminWork = oh + grNewHireNum + grRefreshNum;
  const grHrs = totalGrantAdminWork * grHr;
  const grCost = grHrs * mult * rate;
  const cpCost = compHr * mult * rate;
  const CAP_TABLE_BASE_HOURS_PER_MONTH = 3;
  const CAP_TABLE_SCALING_INCREMENT = 2;
  const ctShareholderScale = Math.max(0, (sh - 20) / 50);
  const ctMonthlyHours = sh > 0 ? CAP_TABLE_BASE_HOURS_PER_MONTH + (ctShareholderScale * CAP_TABLE_SCALING_INCREMENT) : 0;
  const ctRaw = ctMonthlyHours * 12;
  const ctHrs = ctRaw * mult;
  const ctCost = ctHrs * rate;
  const ctFundraisingCost = 0;
  const secFundraisingCost = 0;
  let methodExtCost = 0;
  if (meth === 'outsourced' && !overrides.methodExtCost) {
    methodExtCost = STAGE_RETAINER[geoInc][stageKey];
  }
  const annCost = grCost + cpCost + ctCost + ctFundraisingCost + secFundraisingCost + methodExtCost;
  return {
    annCost: Math.round(annCost),
    grCost: Math.round(grCost),
    cpCost: Math.round(cpCost),
    ctCost: Math.round(ctCost),
    methodExtCost: Math.round(methodExtCost),
    rate,
    compHr: Math.round(compHr),
    mult
  };
}

// Test scenarios
console.log('USING ACTUAL CALCULATOR FROM YOUR CODE\n');

const scenarios = [
  {name: 'Your Scenario', inputs: {sh: 100, oh: 30, grNewHire: 0, grRefresh: 0, geoInc: 'us', stage: 'preseed'}},
  {name: 'Series A/B Complex', inputs: {sh: 150, oh: 40, grNewHire: 15, grRefresh: 15, geoInc: 'us', stage: 'seriesab'}},
];

for (const scenario of scenarios) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(scenario.name);
  console.log(`${'='.repeat(70)}`);
  console.log(`Inputs: ${JSON.stringify(scenario.inputs)}`);
  console.log();

  const caResult = computeROI({...scenario.inputs, meth: 'outsourced'});
  const ihResult = computeROI({...scenario.inputs, meth: 'in-house'});

  console.log('CA RETAINER:');
  console.log(`  Grant Admin: $${caResult.grCost}`);
  console.log(`  Compliance (${caResult.compHr} hrs): $${caResult.cpCost}`);
  console.log(`  Cap Table: $${caResult.ctCost}`);
  console.log(`  Retainer: $${caResult.methodExtCost}`);
  console.log(`  TOTAL: $${caResult.annCost}`);
  console.log();

  console.log('IN-HOUSE:');
  console.log(`  Grant Admin: $${ihResult.grCost}`);
  console.log(`  Compliance (${ihResult.compHr} hrs): $${ihResult.cpCost}`);
  console.log(`  Cap Table: $${ihResult.ctCost}`);
  console.log(`  Retainer: $${ihResult.methodExtCost}`);
  console.log(`  TOTAL: $${ihResult.annCost}`);
  console.log();

  console.log(`RESULT: ${caResult.annCost < ihResult.annCost ? 'CA CHEAPER' : 'IN-HOUSE CHEAPER'} by $${Math.abs(caResult.annCost - ihResult.annCost)}`);
}
