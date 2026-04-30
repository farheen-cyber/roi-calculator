#!/usr/bin/env node

/**
 * EquityList ROI Calculator — Failure-Path Test Suite
 *
 * Complement to test-calculator.js (which covers all happy-path combinations).
 * This file deliberately feeds bad inputs into computeROI() and asserts that
 * the function throws with a descriptive error instead of silently returning
 * zeros or NaN.
 */

import { computeROI } from './roi-calculator.js';
import {
  RATES,
  COMPLIANCE,
  EXT,
  PRICING,
  STAGE_HOURLY_RATES,
  STAGE_RETAINER,
  STAFFING_MATRIX,
  SECRETARIAL_WORKFLOWS_BY_GEO,
  FUNDRAISING_WORKFLOWS,
} from './data.js';

const VALID = {
  sh: 30,
  oh: 15,
  gr: 10,
  stage: 'seriesab',
  geo_inc: 'india',
  geo_op: 'india',
  meth: 'in-house',
  toolCost: 0,
  planningToFundraise: false,
  newShareholdersFromFundraise: 0,
  valuationFrequency: '',
  valuationType: '',
  valuationCostMarket: 0,
  valuationCostEl: 0,
};

const TABLES = [
  RATES,
  COMPLIANCE,
  EXT,
  PRICING,
  STAGE_HOURLY_RATES,
  STAGE_RETAINER,
  STAFFING_MATRIX,
  SECRETARIAL_WORKFLOWS_BY_GEO,
  FUNDRAISING_WORKFLOWS,
];

const OVERRIDES = { rate: null, grHr: null, compHr: null };

let pass = 0;
let fail = 0;
const failures = [];

function expectThrow(name, inputs, tablesOverride, expectedSubstring) {
  const tables = tablesOverride || TABLES;
  try {
    computeROI(inputs, ...tables, OVERRIDES);
    fail++;
    failures.push(`${name}: expected throw, got success`);
    console.log(`  ✗ ${name} — expected throw, got success`);
  } catch (err) {
    if (expectedSubstring && !err.message.includes(expectedSubstring)) {
      fail++;
      failures.push(`${name}: error "${err.message}" missing "${expectedSubstring}"`);
      console.log(`  ✗ ${name} — error did not include "${expectedSubstring}" (got "${err.message}")`);
    } else {
      pass++;
      console.log(`  ✓ ${name}`);
    }
  }
}

function expectSuccess(name, inputs) {
  try {
    const result = computeROI(inputs, ...TABLES, OVERRIDES);
    if (typeof result.annCost !== 'number' || isNaN(result.annCost)) {
      fail++;
      failures.push(`${name}: result.annCost is not a valid number`);
      console.log(`  ✗ ${name} — invalid annCost`);
      return;
    }
    pass++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    fail++;
    failures.push(`${name}: unexpected throw — ${err.message}`);
    console.log(`  ✗ ${name} — unexpected throw: ${err.message}`);
  }
}

console.log('EquityList ROI Calculator — Failure-Path Tests');
console.log('='.repeat(60));

// ─────────────────────────────────────────────────────────────────────
console.log('\n[1] Invalid geography values');
expectThrow('Invalid geo_inc', { ...VALID, geo_inc: 'mars' }, null, 'Invalid geo_inc');
expectThrow('Invalid geo_op', { ...VALID, geo_op: 'atlantis' }, null, 'Invalid geo_op');
expectThrow('Empty geo_inc', { ...VALID, geo_inc: '' }, null, 'Invalid geo_inc');
expectThrow('Null geo_op', { ...VALID, geo_op: null }, null, 'Invalid geo_op');

// ─────────────────────────────────────────────────────────────────────
console.log('\n[2] Invalid stage values');
expectThrow('Invalid stage string', { ...VALID, stage: 'unicorn' }, null, 'Invalid stage');
expectThrow('Misspelled stage', { ...VALID, stage: 'seriesD' }, null, 'Invalid stage');

// ─────────────────────────────────────────────────────────────────────
console.log('\n[3] Invalid method values');
expectThrow('Invalid meth', { ...VALID, meth: 'crypto' }, null, 'Invalid meth');
expectThrow('Empty meth', { ...VALID, meth: '' }, null, 'Invalid meth');
expectThrow('Null meth', { ...VALID, meth: null }, null, 'Invalid meth');

// ─────────────────────────────────────────────────────────────────────
console.log('\n[4] Invalid numeric inputs');
expectThrow('Negative shareholders', { ...VALID, sh: -5 }, null, 'Invalid sh');
expectThrow('Negative option holders', { ...VALID, oh: -1 }, null, 'Invalid oh');
expectThrow('Negative grants', { ...VALID, gr: -10 }, null, 'Invalid gr');
expectThrow('String shareholders', { ...VALID, sh: '30' }, null, 'Invalid sh');
expectThrow('Null shareholders', { ...VALID, sh: null }, null, 'Invalid sh');
expectThrow('Undefined grants', { ...VALID, gr: undefined }, null, 'Invalid gr');

// ─────────────────────────────────────────────────────────────────────
console.log('\n[5] Missing data tables');
{
  const empty = {};
  expectThrow(
    'Missing COMPLIANCE entry',
    VALID,
    [RATES, empty, EXT, PRICING, STAGE_HOURLY_RATES, STAGE_RETAINER, STAFFING_MATRIX, SECRETARIAL_WORKFLOWS_BY_GEO, FUNDRAISING_WORKFLOWS],
    'COMPLIANCE'
  );
  expectThrow(
    'Missing PRICING entry',
    VALID,
    [RATES, COMPLIANCE, EXT, empty, STAGE_HOURLY_RATES, STAGE_RETAINER, STAFFING_MATRIX, SECRETARIAL_WORKFLOWS_BY_GEO, FUNDRAISING_WORKFLOWS],
    'PRICING'
  );
  expectThrow(
    'Missing STAGE_HOURLY_RATES geography',
    VALID,
    [RATES, COMPLIANCE, EXT, PRICING, empty, STAGE_RETAINER, STAFFING_MATRIX, SECRETARIAL_WORKFLOWS_BY_GEO, FUNDRAISING_WORKFLOWS],
    'STAGE_HOURLY_RATES'
  );
  expectThrow(
    'Missing STAGE_RETAINER geography',
    VALID,
    [RATES, COMPLIANCE, EXT, PRICING, STAGE_HOURLY_RATES, empty, STAFFING_MATRIX, SECRETARIAL_WORKFLOWS_BY_GEO, FUNDRAISING_WORKFLOWS],
    'STAGE_RETAINER'
  );
  expectThrow(
    'Missing SECRETARIAL_WORKFLOWS_BY_GEO',
    VALID,
    [RATES, COMPLIANCE, EXT, PRICING, STAGE_HOURLY_RATES, STAGE_RETAINER, STAFFING_MATRIX, empty, FUNDRAISING_WORKFLOWS],
    'SECRETARIAL_WORKFLOWS_BY_GEO'
  );
  expectThrow(
    'Null STAFFING_MATRIX',
    VALID,
    [RATES, COMPLIANCE, EXT, PRICING, STAGE_HOURLY_RATES, STAGE_RETAINER, null, SECRETARIAL_WORKFLOWS_BY_GEO, FUNDRAISING_WORKFLOWS],
    'STAFFING_MATRIX'
  );
  expectThrow(
    'Null FUNDRAISING_WORKFLOWS',
    VALID,
    [RATES, COMPLIANCE, EXT, PRICING, STAGE_HOURLY_RATES, STAGE_RETAINER, STAFFING_MATRIX, SECRETARIAL_WORKFLOWS_BY_GEO, null],
    'FUNDRAISING_WORKFLOWS'
  );
}

// ─────────────────────────────────────────────────────────────────────
console.log('\n[6] Edge-case successes (should NOT throw)');
expectSuccess('Zero shareholders + zero options', { ...VALID, sh: 0, oh: 0, gr: 0 });
expectSuccess('Single shareholder', { ...VALID, sh: 1, oh: 0, gr: 1 });
expectSuccess('Maximum stakeholders (10000)', { ...VALID, sh: 9000, oh: 1000, gr: 100 });
expectSuccess('Stakeholders over cap (clamped)', { ...VALID, sh: 50000, oh: 50000, gr: 365 });
expectSuccess('Outsourced method', { ...VALID, meth: 'outsourced' });
expectSuccess('Preseed stage', { ...VALID, stage: 'preseed' });
expectSuccess('Series C stage', { ...VALID, stage: 'seriesc' });
expectSuccess('Cross-geo (US incorporated, India operated)', { ...VALID, geo_inc: 'us', geo_op: 'india' });
expectSuccess('Empty stage defaults to seriesab', { ...VALID, stage: '' });

// ─────────────────────────────────────────────────────────────────────
console.log('\n[7] Edge cases for fundraising and valuation');
expectSuccess('Fundraise: SAFE round', {
  ...VALID,
  planningToFundraise: true,
  fundraiseRound: 'safe',
  newShareholdersFromFundraise: 5,
});
expectSuccess('Fundraise: Series C round', {
  ...VALID,
  planningToFundraise: true,
  fundraiseRound: 'seriesc',
  newShareholdersFromFundraise: 20,
});
expectSuccess('Valuation: quarterly 409A', {
  ...VALID,
  geo_inc: 'us',
  geo_op: 'us',
  valuationFrequency: 'quarterly',
  valuationType: '409A Valuation',
  valuationCostMarket: 6000,
  valuationCostEl: 400,
});
expectSuccess('Unknown fundraiseRound (defaults to 1.0x complexity)', {
  ...VALID,
  planningToFundraise: true,
  fundraiseRound: 'unknown_round_type',
});

// ─────────────────────────────────────────────────────────────────────
console.log('\n[8] Verify SAFE vs Series C round complexity differs');
{
  const safeResult = computeROI(
    { ...VALID, planningToFundraise: true, fundraiseRound: 'safe' },
    ...TABLES,
    OVERRIDES
  );
  const seriescResult = computeROI(
    { ...VALID, planningToFundraise: true, fundraiseRound: 'seriesc' },
    ...TABLES,
    OVERRIDES
  );
  if (seriescResult.ctFundraisingCost > safeResult.ctFundraisingCost) {
    pass++;
    console.log(
      `  ✓ Series C+ fundraise costs more than SAFE (${seriescResult.ctFundraisingCost} > ${safeResult.ctFundraisingCost})`
    );
  } else {
    fail++;
    failures.push('Round complexity multiplier not applied: SAFE and Series C+ produced same cost');
    console.log('  ✗ Round complexity multiplier not differentiating SAFE vs Series C+');
  }
}

// ─────────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(60));
console.log('FAILURE-PATH TEST SUMMARY');
console.log('='.repeat(60));
console.log(`Passed: ${pass}`);
console.log(`Failed: ${fail}`);

if (fail > 0) {
  console.log('\nFailures:');
  failures.forEach((f) => console.log('  - ' + f));
  process.exit(1);
}
console.log('\nAll failure-path tests passed.');
process.exit(0);
