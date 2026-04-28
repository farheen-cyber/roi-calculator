/**
 * Comprehensive ROI Calculator Test Suite
 * Tests all combinations of stages, geographies, and methods
 * Validates staffing matrix, blended rates, and cost calculations
 * Version: 1.0
 */

import { CUR, RATES, COMPLIANCE, EXT, FX, PRICING, STAGE_HOURLY_RATES, STAGE_RETAINER, STAFFING_MATRIX } from './data.js';
import { computeROI } from './roi-calculator.js';
import fs from 'fs';

// Test configuration
const STAGES = ['preseed', 'seed', 'seriesab', 'seriesbc', 'seriesc'];
const GEOGRAPHIES = ['india', 'usa', 'singapore', 'uk']; // Note: 'usa' not 'us' in data.js
const METHODS = ['in-house', 'outsourced'];
const ROLES = ['founder', 'hr', 'finance', 'cs']; // Note: 'cs' not 'secretarial' in data.js

const TEST_INPUTS = [
  { sh: 10, oh: 5, gr: 5, label: 'Small (10 SH, 5 OH, 5 grants)' },
  { sh: 30, oh: 15, gr: 10, label: 'Medium (30 SH, 15 OH, 10 grants)' },
  { sh: 100, oh: 50, gr: 20, label: 'Large (100 SH, 50 OH, 20 grants)' },
];

const overrides = { rate: null, grHr: null, compHr: null };

// Results storage
let results = [];
let errors = [];

/**
 * Calculate blended hourly rate for a stage/geography
 */
function calculateBlendedRate(stageKey, geoOp) {
  const matrix = STAFFING_MATRIX[stageKey] || STAFFING_MATRIX['seriesab'];
  const roles = ['founder', 'hr', 'finance', 'cs']; // 'cs' = Legal/Company Secretary
  let blendedRate = 0;

  for (const role of roles) {
    const fte = matrix[role] || 0;
    if (fte > 0) {
      const roleRate = STAGE_HOURLY_RATES[geoOp]?.[stageKey]?.[role] || 0;
      blendedRate += fte * roleRate;
    }
  }
  return blendedRate;
}

/**
 * Format currency based on geography
 */
function formatCurrency(amount, geo) {
  const sym = CUR[geo];
  return `${sym}${Math.round(amount).toLocaleString()}`;
}

/**
 * Run a single scenario test
 */
function runScenario(stageKey, geoInc, geoOp, method, testInput) {
  try {
    const inputs = {
      sh: testInput.sh,
      oh: testInput.oh,
      gr: testInput.gr,
      stage: stageKey,
      geo_inc: geoInc,
      geo_op: geoOp,
      meth: method,
      toolCost: 0,
    };

    const roiData = computeROI(
      inputs,
      RATES,
      COMPLIANCE,
      EXT,
      FX,
      PRICING,
      STAGE_HOURLY_RATES,
      STAGE_RETAINER,
      STAFFING_MATRIX,
      overrides
    );

    // Calculate blended rate for validation
    const expectedBlendedRate = method === 'in-house' ? calculateBlendedRate(stageKey, geoOp) : 0;

    const result = {
      stage: stageKey,
      geoInc,
      geoOp,
      method,
      input: testInput.label,
      shareholders: testInput.sh,
      optionHolders: testInput.oh,
      grants: testInput.gr,
      blendedRate: roiData.rate,
      expectedBlendedRate,
      blendedRateMatch: Math.abs(roiData.rate - expectedBlendedRate) < 0.01,
      annualCost: roiData.annCost,
      elCost: roiData.elAnn,
      savings: roiData.diff,
      roi: roiData.roi,
      timeSavedPct: roiData.timeSavedPct,
      method_multiplier: roiData.mult,
      status: 'PASS',
    };

    // Validation checks
    const checks = [];

    // Check 1: Blended rate calculation
    if (!result.blendedRateMatch) {
      checks.push(`Blended rate mismatch: got ${result.blendedRate}, expected ${result.expectedBlendedRate}`);
    }

    // Check 2: Method multiplier
    const expectedMult = method === 'in-house' ? 1 : 0.4;
    if (result.method_multiplier !== expectedMult) {
      checks.push(`Method multiplier wrong: got ${result.method_multiplier}, expected ${expectedMult}`);
    }

    // Check 3: Costs are positive
    if (result.annualCost < 0 || result.elCost < 0) {
      checks.push(`Negative costs detected: annualCost=${result.annualCost}, elCost=${result.elCost}`);
    }

    // Check 4: Time saved percentage in range
    if (result.timeSavedPct < 0 || result.timeSavedPct > 100) {
      checks.push(`Time saved percentage out of range: ${result.timeSavedPct}%`);
    }

    // Check 5: ROI is non-negative
    if (result.roi < 0) {
      checks.push(`Negative ROI: ${result.roi}`);
    }

    // Check 6: For outsourced, verify retainer is used
    if (method === 'outsourced') {
      const expectedRetainer = STAGE_RETAINER[geoOp]?.[stageKey] || EXT[geoOp];
      const expectedRetainerInFX = expectedRetainer * (FX[geoOp] || 1);
      // Retainer should be the primary cost component
      if (result.annualCost === 0) {
        checks.push(`Outsourced method with zero annual cost (expected retainer: ${expectedRetainer})`);
      }
    }

    if (checks.length > 0) {
      result.status = 'FAIL';
      result.errors = checks;
      errors.push(`${stageKey}/${geoOp}/${method}/${testInput.label}: ${checks.join('; ')}`);
    }

    results.push(result);
  } catch (error) {
    errors.push(`Exception in ${stageKey}/${geoOp}/${method}: ${error.message}`);
    results.push({
      stage: stageKey,
      geoInc,
      geoOp,
      method,
      input: testInput.label,
      status: 'ERROR',
      error: error.message,
    });
  }
}

/**
 * Generate summary statistics
 */
function generateSummary() {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === 'PASS').length;
  const failedTests = results.filter(r => r.status === 'FAIL').length;
  const errorTests = results.filter(r => r.status === 'ERROR').length;

  return {
    totalTests,
    passedTests,
    failedTests,
    errorTests,
    passRate: ((passedTests / totalTests) * 100).toFixed(2),
  };
}

/**
 * Generate detailed analysis by stage
 */
function analyzeByStage() {
  const analysis = {};
  for (const stage of STAGES) {
    const stageResults = results.filter(r => r.stage === stage);
    analysis[stage] = {
      total: stageResults.length,
      passed: stageResults.filter(r => r.status === 'PASS').length,
      failed: stageResults.filter(r => r.status === 'FAIL').length,
      errors: stageResults.filter(r => r.status === 'ERROR').length,
      avgAnnualCost: stageResults.filter(r => r.annualCost).reduce((sum, r) => sum + r.annualCost, 0) / stageResults.filter(r => r.annualCost).length || 0,
      avgROI: stageResults.filter(r => r.roi !== undefined).reduce((sum, r) => sum + r.roi, 0) / stageResults.filter(r => r.roi !== undefined).length || 0,
    };
  }
  return analysis;
}

/**
 * Generate detailed analysis by geography
 */
function analyzeByGeography() {
  const analysis = {};
  for (const geo of GEOGRAPHIES) {
    const geoResults = results.filter(r => r.geoOp === geo);
    analysis[geo] = {
      total: geoResults.length,
      passed: geoResults.filter(r => r.status === 'PASS').length,
      avgBlendedRate: geoResults.filter(r => r.blendedRate).reduce((sum, r) => sum + r.blendedRate, 0) / geoResults.filter(r => r.blendedRate).length || 0,
      avgAnnualCost: geoResults.filter(r => r.annualCost).reduce((sum, r) => sum + r.annualCost, 0) / geoResults.filter(r => r.annualCost).length || 0,
    };
  }
  return analysis;
}

/**
 * Validate staffing matrix consistency
 */
function validateStaffingMatrix() {
  const validation = [];

  for (const stage of STAGES) {
    const matrix = STAFFING_MATRIX[stage];
    let totalFTE = 0;

    for (const role in matrix) {
      const fte = matrix[role];
      if (fte < 0) {
        validation.push(`${stage}: Negative FTE for ${role} (${fte})`);
      }
      totalFTE += fte;
    }

    // Check that total FTE is reasonable (between 1 and 10)
    if (totalFTE < 0.5 || totalFTE > 10) {
      validation.push(`${stage}: Total FTE out of reasonable range (${totalFTE.toFixed(2)})`);
    }
  }

  return {
    passed: validation.length === 0,
    issues: validation,
  };
}

/**
 * Validate hourly rates consistency
 */
function validateHourlyRates() {
  const validation = [];

  for (const geo of GEOGRAPHIES) {
    const geoRates = STAGE_HOURLY_RATES[geo];
    if (!geoRates) {
      validation.push(`Missing rates for geography: ${geo}`);
      continue;
    }

    for (const stage of STAGES) {
      const stageRates = geoRates[stage];
      if (!stageRates) {
        validation.push(`${geo}: Missing rates for stage ${stage}`);
        continue;
      }

      const rolesInStage = ['founder', 'hr', 'finance', 'cs']; // 'cs' = Legal/Company Secretary
      for (const role of rolesInStage) {
        const rate = stageRates[role];
        if (typeof rate !== 'number' || rate < 0) {
          validation.push(`${geo}/${stage}: Invalid rate for ${role} (${rate})`);
        }
      }

      // Check progression: rates should generally increase with stage
      const currentTotal = rolesInStage.reduce((sum, role) => sum + (stageRates[role] || 0), 0);
      const prevStageIdx = STAGES.indexOf(stage) - 1;
      if (prevStageIdx >= 0) {
        const prevStageRates = geoRates[STAGES[prevStageIdx]];
        const prevTotal = rolesInStage.reduce((sum, role) => sum + (prevStageRates[role] || 0), 0);
        if (currentTotal < prevTotal) {
          validation.push(`${geo}: Rates decreased from ${STAGES[prevStageIdx]} to ${stage}`);
        }
      }
    }
  }

  return {
    passed: validation.length === 0,
    issues: validation,
  };
}

/**
 * Main test execution
 */
function runAllTests() {
  console.log('🧪 Starting ROI Calculator Test Suite\n');
  console.log(`Testing: ${STAGES.length} stages × ${GEOGRAPHIES.length} geographies × ${METHODS.length} methods × ${TEST_INPUTS.length} input variations`);
  console.log(`Total test scenarios: ${STAGES.length * GEOGRAPHIES.length * METHODS.length * TEST_INPUTS.length}\n`);

  // Pre-test validations
  console.log('📋 Pre-Test Validations:');
  const staffingValidation = validateStaffingMatrix();
  console.log(`  ✓ Staffing Matrix: ${staffingValidation.passed ? 'PASS' : 'FAIL'}`);
  if (!staffingValidation.passed) {
    staffingValidation.issues.forEach(issue => console.log(`    ⚠️  ${issue}`));
  }

  const ratesValidation = validateHourlyRates();
  console.log(`  ✓ Hourly Rates: ${ratesValidation.passed ? 'PASS' : 'FAIL'}`);
  if (!ratesValidation.passed) {
    ratesValidation.issues.forEach(issue => console.log(`    ⚠️  ${issue}`));
  }

  console.log('\n🚀 Running Scenario Tests...\n');

  // Run all scenarios
  let count = 0;
  for (const stage of STAGES) {
    for (const geoInc of GEOGRAPHIES) {
      for (const geoOp of GEOGRAPHIES) {
        for (const method of METHODS) {
          for (const testInput of TEST_INPUTS) {
            runScenario(stage, geoInc, geoOp, method, testInput);
            count++;
            if (count % 50 === 0) {
              process.stdout.write(`  Completed ${count} tests...\n`);
            }
          }
        }
      }
    }
  }

  console.log(`\n✅ Test execution complete. Total scenarios: ${count}\n`);

  // Generate summary
  const summary = generateSummary();
  console.log('📊 SUMMARY STATISTICS:');
  console.log(`  Total Tests: ${summary.totalTests}`);
  console.log(`  ✓ Passed: ${summary.passedTests}`);
  console.log(`  ✗ Failed: ${summary.failedTests}`);
  console.log(`  ⚠️  Errors: ${summary.errorTests}`);
  console.log(`  Pass Rate: ${summary.passRate}%\n`);

  if (summary.failedTests > 0 || summary.errorTests > 0) {
    console.log('❌ Issues Found:\n');
    errors.forEach((error, idx) => console.log(`  ${idx + 1}. ${error}`));
    console.log();
  }

  // Detailed analysis
  console.log('📈 Analysis by Stage:');
  const stageAnalysis = analyzeByStage();
  for (const stage of STAGES) {
    const analysis = stageAnalysis[stage];
    console.log(`\n  ${stage.toUpperCase()}:`);
    console.log(`    Tests: ${analysis.total} | Passed: ${analysis.passed} | Failed: ${analysis.failed} | Errors: ${analysis.errors}`);
    console.log(`    Avg Annual Cost: ${formatCurrency(analysis.avgAnnualCost, 'us')}`);
    console.log(`    Avg ROI: ${analysis.avgROI.toFixed(2)}x`);
  }

  console.log('\n📍 Analysis by Geography:');
  const geoAnalysis = analyzeByGeography();
  for (const geo of GEOGRAPHIES) {
    const analysis = geoAnalysis[geo];
    console.log(`\n  ${geo.toUpperCase()}:`);
    console.log(`    Tests: ${analysis.total} | Passed: ${analysis.passed}`);
    console.log(`    Avg Blended Rate: ${CUR[geo]}${Math.round(analysis.avgBlendedRate)}`);
    console.log(`    Avg Annual Cost: ${formatCurrency(analysis.avgAnnualCost, geo)}`);
  }

  // Save detailed results to file
  const reportPath = './test-results.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary,
    staffingValidation,
    ratesValidation,
    stageAnalysis,
    geoAnalysis,
    errors,
    results,
  }, null, 2));

  console.log(`\n📄 Detailed results saved to: ${reportPath}`);

  // Export CSV for spreadsheet analysis
  const csvPath = './test-results.csv';
  const csvHeader = 'Stage,Geography,Method,Input,Shareholders,OptionHolders,Grants,BlendedRate,ExpectedRate,AnnualCost,ELCost,Savings,ROI,TimeSaved%,Status\n';
  const csvRows = results.map(r => {
    return `${r.stage},${r.geoOp},${r.method},${r.input},${r.shareholders},${r.optionHolders},${r.grants},${r.blendedRate?.toFixed(2) || 'N/A'},${r.expectedBlendedRate?.toFixed(2) || 'N/A'},${r.annualCost || 'N/A'},${r.elCost || 'N/A'},${r.savings || 'N/A'},${r.roi || 'N/A'},${r.timeSavedPct || 'N/A'},${r.status}`;
  }).join('\n');
  fs.writeFileSync(csvPath, csvHeader + csvRows);
  console.log(`📊 CSV export saved to: ${csvPath}\n`);

  // Exit with appropriate code
  process.exit(summary.failedTests > 0 || summary.errorTests > 0 ? 1 : 0);
}

// Run tests
runAllTests();
