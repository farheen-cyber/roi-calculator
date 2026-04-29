import { computeROI } from './roi-calculator.js';
import { VALUATION_TYPES_BY_GEO, CUR, RATES, RATES_META, COMPLIANCE, EXT, FX, PRICING, STAGE_HOURLY_RATES, STAGE_RETAINER, STAFFING_MATRIX, SECRETARIAL_WORKFLOWS_BY_GEO, FUNDRAISING_WORKFLOWS } from './data.js';

console.log('Testing computeROI function...');

try {
  const result = computeROI(
    {
      sh: 30,
      oh: 15,
      gr: 10,
      stage: 'seriesab',
      geo_inc: 'india',
      geo_op: 'india',
      meth: 'in-house',
      toolCost: 0,
      planningToFundraise: false,
      fundraiseRound: null,
      fundraiseTiming: null,
      newShareholdersFromFundraise: 0,
      valuationFrequency: null,
      valuationType: null,
      valuationCostMarket: 0,
      valuationCostEl: 0,
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

  console.log('Result:', result);
  console.log('\nSuccess! computeROI returned:', {
    annCost: result.annCost,
    elAnn: result.elAnn,
    savings: result.savings,
    roi: result.roi,
  });
} catch (err) {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
}
