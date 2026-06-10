// Using the ACTUAL getDynamicComplianceHours function

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

  // TIER 1: Always required if you have shareholders
  if (shareholders > 0) {
    hours += reportHours(2, shareholderScale);    // Cap table summary
    hours += reportHours(3, shareholderScale);    // Transaction-level ownership ledger
  }

  // TIER 2: Required if you have option holders or plan to issue grants
  if (optionHolders > 0 || newHireGrants > 0) {
    hours += reportHours(1, 1);                   // Equity plan & pool overview
    hours += reportHours(1, grantScale);          // Grant summary reports
    hours += reportHours(0.5, optionHolderScale); // Vesting reports

    // Geography-specific accounting standard
    if (geoInc === 'india') {
      hours += reportHours(4, optionHolderScale); // Ind AS 102/15
      hours += reportHours(4, optionHolderScale); // SH-6
    } else if (geoInc === 'us') {
      hours += reportHours(4, optionHolderScale); // ASC 718/820
      hours += reportHours(6, 1);                 // Rule 701 (annual, fixed)
    } else if (geoInc === 'singapore' || geoInc === 'uk') {
      hours += reportHours(4, optionHolderScale); // IFRS 2
    }
  }

  // TIER 3: Series A or later with equity
  const stageOrder = { preseed: 0, seed: 1, seriesab: 2, seriesbc: 3, seriesc: 4 };
  if ((optionHolders > 0 || newHireGrants > 0) && (stageOrder[stage] || 0) >= 2) {
    hours += reportHours(1, optionHolderScale);   // Exercise reports
    hours += reportHours(0.5, optionHolderScale); // Surrender summaries
  }

  return Math.round(hours);
}

// Test with your exact scenario
const compHrs = getDynamicComplianceHours('preseed', 100, 30, 'us', 0, 0);
console.log('Compliance Hours (Preseed, 100 sh, 30 oh, US): ' + compHrs);

// Verify against your result
const rate = 113; // founder only
const mult = 0.2;
const expectedCost = 271;
const calculatedCost = compHrs * mult * rate;
console.log('Calculated Compliance Cost: $' + Math.round(calculatedCost));
console.log('Your Reported Cost: $' + expectedCost);
console.log('Match: ' + (Math.abs(calculatedCost - expectedCost) < 1 ? 'YES ✓' : 'NO ✗'));
