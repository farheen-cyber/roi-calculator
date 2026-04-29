#!/usr/bin/env node

/**
 * EquityList ROI Calculator — Comprehensive Test Suite
 * Tests all input combinations and documents outcomes
 * Version 1.0
 */

import { computeROI } from './roi-calculator.js';
import { VALUATION_TYPES_BY_GEO, CUR, RATES, RATES_META, COMPLIANCE, EXT, FX, PRICING, STAGE_HOURLY_RATES, STAGE_RETAINER, STAFFING_MATRIX, SECRETARIAL_WORKFLOWS_BY_GEO, FUNDRAISING_WORKFLOWS } from './data.js';
import fs from 'fs';

// Test configuration
const COUNTRIES = ['india', 'us', 'singapore', 'uk'];
const STAGES = ['preseed', 'seed', 'seriesab', 'seriesbc', 'seriesc'];
const METHODS = ['in-house', 'outsourced'];
const SHAREHOLDER_COUNTS = [1, 20, 50, 100, 200, 500, 1000];
const OPTION_HOLDER_COUNTS = [0, 10, 50, 100];
const GRANT_COUNTS = [1, 5, 10, 20];

const FUNDRAISE_ROUNDS = ['safe', 'seed', 'seriesab', 'seriesbc', 'bridge'];
const FUNDRAISE_TIMINGS = [3, 6, 9, 12];
const VALUATION_FREQUENCIES = ['annually', 'quarterly'];

// Results tracking
let testResults = [];
let passCount = 0;
let failCount = 0;
let errorCount = 0;

// Helper functions
function getValuationTypesForCountry(geoInc) {
  const types = VALUATION_TYPES_BY_GEO[geoInc];
  return types ? Object.keys(types) : [];
}

function runTest(testCase) {
  const {
    geoInc,
    geoOp,
    stage,
    sh,
    oh,
    gr,
    meth,
    planningToFundraise,
    fundraiseRound,
    fundraiseTiming,
    newShareholdersFromFundraise,
    needsValuation,
    valuationFrequency,
    valuationType,
  } = testCase;

  try {
    // Get valuation costs if needed
    let valuationCostMarket = 0;
    let valuationCostEl = 0;

    if (needsValuation && valuationType) {
      const types = VALUATION_TYPES_BY_GEO[geoInc];
      if (types && types[valuationType]) {
        valuationCostMarket = types[valuationType].market;
        valuationCostEl = types[valuationType].el;
      }
    }

    // Call the calculator with all required parameters
    const result = computeROI(
      {
        sh,
        oh,
        gr,
        stage,
        geo_inc: geoInc,
        geo_op: geoOp,
        meth,
        toolCost: 0,
        planningToFundraise,
        fundraiseRound,
        fundraiseTiming,
        newShareholdersFromFundraise: newShareholdersFromFundraise || 0,
        valuationFrequency,
        valuationType,
        valuationCostMarket,
        valuationCostEl,
      },
      RATES,
      COMPLIANCE,
      EXT,
      FX,
      PRICING,
      STAGE_HOURLY_RATES,
      STAGE_RETAINER,
      STAFFING_MATRIX,
      SECRETARIAL_WORKFLOWS_BY_GEO,
      FUNDRAISING_WORKFLOWS,
      { rate: null, grHr: null, compHr: null }
    );

    // Validate result
    const isValid =
      result &&
      typeof result.annCost === 'number' &&
      typeof result.elAnn === 'number' &&
      typeof result.diff === 'number' &&
      typeof result.roi === 'number' &&
      !isNaN(result.annCost) &&
      !isNaN(result.elAnn) &&
      !isNaN(result.roi);

    const status = isValid ? 'PASS' : 'FAIL';
    if (isValid) passCount++;
    else failCount++;

    return {
      status,
      result: isValid
        ? {
            annualSpend: result.annCost,
            equityListCost: result.elAnn,
            savings: result.diff,
            roiMultiple: result.roi,
          }
        : null,
      error: isValid ? null : 'Invalid result structure',
    };
  } catch (err) {
    errorCount++;
    return {
      status: 'ERROR',
      result: null,
      error: err.message,
    };
  }
}

function generateTestName(testCase, index) {
  const {
    geoInc,
    geoOp,
    stage,
    sh,
    oh,
    gr,
    meth,
    planningToFundraise,
    fundraiseRound,
    needsValuation,
  } = testCase;

  let name = `[${index}] ${geoInc.toUpperCase()}/${geoOp.toUpperCase()} • ${stage} • ${meth} • SH:${sh} OH:${oh} GR:${gr}`;

  if (planningToFundraise) {
    name += ` • Fundraise:${fundraiseRound}`;
  }
  if (needsValuation) {
    name += ` • Valuations`;
  }

  return name;
}

function* generateAllTestCases() {
  let index = 1;

  // Base combinations: country × stage × method
  for (const geoInc of COUNTRIES) {
    for (const geoOp of COUNTRIES) {
      for (const stage of STAGES) {
        for (const meth of METHODS) {
          // Vary shareholders and option holders
          for (const sh of SHAREHOLDER_COUNTS) {
            for (const oh of OPTION_HOLDER_COUNTS) {
              for (const gr of GRANT_COUNTS) {
                // Without fundraising, without valuation
                yield {
                  index: index++,
                  geoInc,
                  geoOp,
                  stage,
                  sh,
                  oh,
                  gr,
                  meth,
                  planningToFundraise: false,
                  fundraiseRound: null,
                  fundraiseTiming: null,
                  newShareholdersFromFundraise: 0,
                  needsValuation: false,
                  valuationFrequency: null,
                  valuationType: null,
                };

                // With fundraising
                for (const fundraiseRound of FUNDRAISE_ROUNDS) {
                  for (const fundraiseTiming of FUNDRAISE_TIMINGS) {
                    yield {
                      index: index++,
                      geoInc,
                      geoOp,
                      stage,
                      sh,
                      oh,
                      gr,
                      meth,
                      planningToFundraise: true,
                      fundraiseRound,
                      fundraiseTiming,
                      newShareholdersFromFundraise: 5,
                      needsValuation: false,
                      valuationFrequency: null,
                      valuationType: null,
                    };
                  }
                }

                // With valuations
                const valuationTypes = getValuationTypesForCountry(geoInc);
                for (const valuationType of valuationTypes) {
                  for (const valuationFrequency of VALUATION_FREQUENCIES) {
                    yield {
                      index: index++,
                      geoInc,
                      geoOp,
                      stage,
                      sh,
                      oh,
                      gr,
                      meth,
                      planningToFundraise: false,
                      fundraiseRound: null,
                      fundraiseTiming: null,
                      newShareholdersFromFundraise: 0,
                      needsValuation: true,
                      valuationFrequency,
                      valuationType,
                    };
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// Main execution
console.log('EquityList ROI Calculator - Test Suite');
console.log('======================================');
console.log('Generating and running all test cases...\n');

const outputFile = 'test-results.log';
const outputStream = fs.createWriteStream(outputFile);

// Write header
outputStream.write('EquityList ROI Calculator - Test Results\n');
outputStream.write(`Generated: ${new Date().toISOString()}\n`);
outputStream.write('='.repeat(80) + '\n\n');

let totalTests = 0;
const testGen = generateAllTestCases();

console.log('Running tests (this may take a moment)...');
let processedCount = 0;

for (const testCase of testGen) {
  totalTests++;
  if (totalTests % 100 === 0) {
    process.stdout.write(`\rProcessed: ${totalTests} tests...`);
  }

  const testName = generateTestName(testCase, testCase.index);
  const { status, result, error } = runTest(testCase);

  const logEntry = {
    testName,
    status,
    inputs: {
      geoInc: testCase.geoInc,
      geoOp: testCase.geoOp,
      stage: testCase.stage,
      shareholders: testCase.sh,
      optionHolders: testCase.oh,
      grantsPerYear: testCase.gr,
      method: testCase.meth,
      fundraising: testCase.planningToFundraise
        ? `${testCase.fundraiseRound} (${testCase.fundraiseTiming}mo, +${testCase.newShareholdersFromFundraise} SH)`
        : 'No',
      valuations: testCase.needsValuation
        ? `${testCase.valuationType} (${testCase.valuationFrequency})`
        : 'No',
    },
    outputs: result,
    error: error || null,
  };

  testResults.push(logEntry);

  // Write to log file
  outputStream.write(`\n${testName}\n`);
  outputStream.write('-'.repeat(80) + '\n');
  outputStream.write('Status: ' + status + '\n');
  outputStream.write('Inputs: ' + JSON.stringify(logEntry.inputs, null, 2) + '\n');
  if (result) {
    outputStream.write('Outputs: ' + JSON.stringify(result, null, 2) + '\n');
  }
  if (error) {
    outputStream.write('Error: ' + error + '\n');
  }
}

process.stdout.write(`\rProcessed: ${totalTests} tests...\n`);

// Write summary
outputStream.write('\n' + '='.repeat(80) + '\n');
outputStream.write('TEST SUMMARY\n');
outputStream.write('='.repeat(80) + '\n');
outputStream.write(`Total Tests: ${totalTests}\n`);
outputStream.write(`Passed: ${passCount} (${((passCount / totalTests) * 100).toFixed(1)}%)\n`);
outputStream.write(`Failed: ${failCount} (${((failCount / totalTests) * 100).toFixed(1)}%)\n`);
outputStream.write(`Errors: ${errorCount} (${((errorCount / totalTests) * 100).toFixed(1)}%)\n`);

// List failed/error tests
if (failCount > 0 || errorCount > 0) {
  outputStream.write('\n' + '-'.repeat(80) + '\n');
  outputStream.write('FAILED/ERROR TESTS\n');
  outputStream.write('-'.repeat(80) + '\n');

  testResults
    .filter((r) => r.status !== 'PASS')
    .forEach((result) => {
      outputStream.write(`\n${result.testName}\n`);
      outputStream.write(`Status: ${result.status}\n`);
      if (result.error) {
        outputStream.write(`Error: ${result.error}\n`);
      }
    });
}

outputStream.end(() => {
  // Summary to console
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✓ Passed: ${passCount} (${((passCount / totalTests) * 100).toFixed(1)}%)`);
  console.log(`✗ Failed: ${failCount} (${((failCount / totalTests) * 100).toFixed(1)}%)`);
  console.log(`⚠ Errors: ${errorCount} (${((errorCount / totalTests) * 100).toFixed(1)}%)`);
  console.log(`\nResults logged to: ${outputFile}`);
  console.log('='.repeat(80));

  // Exit with appropriate code
  process.exit(failCount > 0 || errorCount > 0 ? 1 : 0);
});
