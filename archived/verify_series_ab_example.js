// Use the ACTUAL getDynamicComplianceHours function

function getDynamicComplianceHours(stage, shareholders, optionHolders, geoInc, newHireGrants = 0, refreshGrants = 0) {
  const stageScale = {
    preseed: 0.5,
    seed: 0.75,
    seriesab: 1.0,
    seriesbc: 1.25,
    seriesc: 1.5
  };

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

    if (geoInc === 'us') {
      hours += reportHours(4, optionHolderScale);
      hours += reportHours(6, 1);
    }
  }

  const stageOrder = { preseed: 0, seed: 1, seriesab: 2, seriesbc: 3, seriesc: 4 };
  if ((optionHolders > 0 || newHireGrants > 0) && (stageOrder[stage] || 0) >= 2) {
    hours += reportHours(1, optionHolderScale);
    hours += reportHours(0.5, optionHolderScale);
  }

  return Math.round(hours);
}

const STAGE_HOURLY_RATES = {
  us: {
    seriesab: {'founder': 288, 'hr': 131, 'finance': 156, 'cs': 119},
  }
};

const STAFFING_MATRIX = {
  seriesab: {'founder': 0.15, 'hr': 0.25, 'finance': 0.35, 'cs': 0.25},
};

// Test: US Series A/B, 150 shareholders, 40 option holders, 30 grants/year
console.log('US Series A/B, 150 sh, 40 oh, 30 grants');
console.log('='.repeat(60));

const sh = 150;
const oh = 40;
const gr_new = 15;
const gr_refresh = 15;
const stage = 'seriesab';
const geo = 'us';

// Calculate rate
const matrix = STAFFING_MATRIX[stage];
let rate = 0;
for (const role of ['founder', 'hr', 'finance', 'cs']) {
  const fte = matrix[role];
  if (fte > 0) {
    rate += fte * STAGE_HOURLY_RATES[geo][stage][role];
  }
}
console.log(`Rate: $${rate}/hr`);
console.log();

// Grant admin
const gr_hr = 1.5;
const total_grant_work = oh + gr_new + gr_refresh;
const gr_hrs = total_grant_work * gr_hr;
console.log(`Grant Admin: ${gr_hrs} hrs @ 0.2x & 1.0x = $${(gr_hrs * 0.2 * rate).toFixed(0)} CA / $${(gr_hrs * 1.0 * rate).toFixed(0)} IN-HOUSE`);

// Compliance
const comp_hr = getDynamicComplianceHours(stage, sh, oh, geo, gr_new, gr_refresh);
console.log(`Compliance: ${comp_hr} hrs @ 0.2x & 1.0x = $${(comp_hr * 0.2 * rate).toFixed(0)} CA / $${(comp_hr * 1.0 * rate).toFixed(0)} IN-HOUSE`);

// Cap table
const ct_scale = Math.max(0, (sh - 20) / 50);
const ct_monthly = 3 + (ct_scale * 2);
const ct_raw = ct_monthly * 12;
console.log(`Cap Table: ${ct_raw.toFixed(1)} hrs @ 0.2x & 1.0x = $${(ct_raw * 0.2 * rate).toFixed(0)} CA / $${(ct_raw * 1.0 * rate).toFixed(0)} IN-HOUSE`);
console.log();

// Retainer
const retainer = 18000;
console.log(`Retainer: $${retainer}`);
console.log();

const ca_total = (gr_hrs * 0.2 * rate) + (comp_hr * 0.2 * rate) + (ct_raw * 0.2 * rate) + retainer;
const ih_total = (gr_hrs * 1.0 * rate) + (comp_hr * 1.0 * rate) + (ct_raw * 1.0 * rate);

console.log(`CA Total: $${ca_total.toFixed(0)}`);
console.log(`IN-HOUSE Total: $${ih_total.toFixed(0)}`);
console.log();
console.log(`CA is ${ca_total < ih_total ? 'CHEAPER' : 'MORE EXPENSIVE'} by $${Math.abs(ca_total - ih_total).toFixed(0)}`);
