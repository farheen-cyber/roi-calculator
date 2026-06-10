// Extract the exact calculation for: US Preseed, 100 sh, 30 oh, 0/0 grants, no fundraise

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
  const stageScale = { preseed: 0.5 };
  const scale = stageScale[stage] || 1.0;
  
  const shareholderScale = shareholders > 0 ? (1 + Math.max(0, shareholders - 10) / 100) : 1;
  const optionScale = oh > 0 ? (1 + Math.max(0, oh - 5) / 50) : 1;
  const grantScale = (grNewHire + grRefresh) > 0 ? (1 + Math.max(0, (grNewHire + grRefresh) - 3) / 30) : 1;
  
  const result = baseHrs * scale * shareholderScale * optionScale * grantScale;
  
  console.log('Compliance Hours Calculation:');
  console.log(`  baseHrs: ${baseHrs}`);
  console.log(`  stageScale: ${scale}`);
  console.log(`  shareholderScale (${shareholders}): ${shareholderScale}`);
  console.log(`  optionScale (${oh}): ${optionScale}`);
  console.log(`  grantScale (0): ${grantScale}`);
  console.log(`  Result: ${result}`);
  
  return result;
}

// Exact inputs
const sh = 100;
const oh = 30;
const grNewHire = 0;
const grRefresh = 0;
const geoInc = 'us';
const stage = 'preseed';

console.log('='.repeat(80));
console.log('DEBUGGING: US Preseed, 100 sh, 30 oh, 0/0 grants, no fundraise');
console.log('='.repeat(80));
console.log();

// Calculate rate
const matrix = STAFFING_MATRIX[stage];
let rate = 0;
console.log('Rate Calculation:');
console.log(`  STAFFING_MATRIX[${stage}]:`, matrix);

for (const role of ['founder', 'hr', 'finance', 'cs']) {
  if (role === 'hr' && oh === 0 && parseInt(grNewHire, 10) === 0) {
    console.log(`  Skipping ${role} (oh=0 and grNewHire=0)`);
    continue;
  }
  const fte = matrix[role] || 0;
  if (fte > 0) {
    const roleRate = STAGE_HOURLY_RATES[geoInc][stage][role];
    rate += fte * roleRate;
    console.log(`  ${role}: fte=${fte}, roleRate=${roleRate}, adds ${fte * roleRate}`);
  } else {
    console.log(`  ${role}: fte=${fte} (skipped, not > 0)`);
  }
}
console.log(`  Total rate: ${rate}`);
console.log();

// IN-HOUSE calculation
console.log('-'.repeat(80));
console.log('IN-HOUSE CALCULATION (mult = 1)');
console.log('-'.repeat(80));
console.log();

const mult_inhouse = 1;
const grHr = 1.5;
const totalGrantAdminWork = oh + grNewHire + grRefresh;
console.log(`Grant Admin Work:`);
console.log(`  oh: ${oh}, grNewHire: ${grNewHire}, grRefresh: ${grRefresh}`);
console.log(`  totalGrantAdminWork: ${totalGrantAdminWork}`);

const grHrs = totalGrantAdminWork * grHr;
const grCost = grHrs * mult_inhouse * rate;
console.log(`  grHrs: ${grHrs}, grCost: ${grCost}`);
console.log();

const compHr = getDynamicComplianceHours(stage, sh, oh, geoInc, grNewHire, grRefresh);
const cpCost = compHr * mult_inhouse * rate;
console.log(`Compliance Cost: ${cpCost}`);
console.log();

const ctShareholderScale = Math.max(0, (sh - 20) / 50);
const ctMonthlyHours = sh > 0 ? 3 + (ctShareholderScale * 2) : 0;
const ctRaw = ctMonthlyHours * 12;
const ctHrs = ctRaw * mult_inhouse;
const ctCost = ctHrs * rate;
console.log(`Cap Table:`);
console.log(`  ctShareholderScale (sh=100): ${ctShareholderScale}`);
console.log(`  ctMonthlyHours: ${ctMonthlyHours}`);
console.log(`  ctRaw (annualized): ${ctRaw}`);
console.log(`  ctCost: ${ctCost}`);
console.log();

const totalInHouse = grCost + cpCost + ctCost;
console.log(`TOTAL IN-HOUSE: ${totalInHouse}`);
console.log();

// CA RETAINER calculation
console.log('-'.repeat(80));
console.log('CA RETAINER CALCULATION (mult = 0.2)');
console.log('-'.repeat(80));
console.log();

const mult_ca = 0.2;
const grCost_ca = grHrs * mult_ca * rate;
console.log(`Grant Admin Cost: ${grCost_ca}`);

const cpCost_ca = compHr * mult_ca * rate;
console.log(`Compliance Cost: ${cpCost_ca}`);

const ctCost_ca = ctHrs * mult_ca * rate;
console.log(`Cap Table Cost: ${ctCost_ca}`);

const methodExtCost = STAGE_RETAINER[geoInc][stage];
console.log(`Retainer: ${methodExtCost}`);
console.log();

const totalCA = grCost_ca + cpCost_ca + ctCost_ca + methodExtCost;
console.log(`TOTAL CA RETAINER: ${totalCA}`);
console.log();

console.log('='.repeat(80));
console.log(`COMPARISON:`);
console.log(`  In-house: $${Math.round(totalInHouse)}`);
console.log(`  CA Retainer: $${Math.round(totalCA)}`);
console.log(`  Difference: CA is cheaper by $${Math.round(totalInHouse - totalCA)}`);
console.log('='.repeat(80));
