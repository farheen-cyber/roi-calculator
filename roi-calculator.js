/**
 * Pure ROI calculation function - no DOM dependencies
 * @param {Object} inputs - User inputs
 * @param {number} inputs.sh - Shareholders count
 * @param {number} inputs.oh - Option holders count
 * @param {number} inputs.gr - Equity grants per year
 * @param {string} inputs.geo_inc - Country of incorporation
 * @param {string} inputs.geo_op - Country of operation
 * @param {string} inputs.stage - Company stage (preseed, seed, seriesab, seriesbc, seriesc)
 * @param {string} inputs.meth - Administrative method (in-house, outsourced)
 * @param {number} inputs.toolCost - Annual tool cost (unused, kept for compatibility)
 * @param {boolean} inputs.planningToFundraise - Planning to fundraise in next 12 months
 * @param {string} inputs.fundraiseRound - Round type (safe, seed, seriesab, seriesbc, bridge)
 * @param {number} inputs.newShareholdersFromFundraise - Expected new shareholders from fundraise
 * @param {string} inputs.valuationFrequency - Valuation frequency (annually, quarterly, or empty)
 * @param {string} inputs.valuationType - Selected valuation type name
 * @param {number} inputs.valuationCostMarket - Market cost per valuation event
 * @param {number} inputs.valuationCostEl - EquityList cost per valuation event
 * @param {Object} rates - RATES lookup table (legacy, used as fallback)
 * @param {Object} compliance - COMPLIANCE lookup table
 * @param {Object} ext - EXT lookup table
 * @param {Object} pricing - PRICING lookup table (per-stakeholder cost by geography)
 * @param {Object} stageRates - STAGE_HOURLY_RATES lookup table (stage-based rates by geography and role)
 * @param {Object} stageRetainer - STAGE_RETAINER lookup table (stage-based retainer costs by geography and stage)
 * @param {Object} staffingMatrix - STAFFING_MATRIX lookup table (FTE allocations by stage and role)
 * @param {Object} secretarialWorkflows - SECRETARIAL_WORKFLOWS_BY_GEO lookup table (workflows by geography and stage)
 * @param {Object} fundraisingWorkflows - FUNDRAISING_WORKFLOWS lookup table (workflows for fundraising)
 * @param {Object} overrides - { rate, grHr, compHr } for editable assumptions
 * @returns {Object} ROI calculation results
 */
export function computeROI(inputs, rates, compliance, ext, pricing, stageRates, stageRetainer, staffingMatrix, secretarialWorkflows, fundraisingWorkflows, overrides) {
  const { sh, oh, gr, stage, geo_inc, geo_op, meth, toolCost = 0, planningToFundraise = false, fundraiseRound = '', newShareholdersFromFundraise = 0, valuationFrequency = '', valuationType = '', valuationCostMarket = 0, valuationCostEl = 0 } = inputs;

  const VALID_GEOS = ['india', 'us', 'singapore', 'uk'];
  const VALID_STAGES = ['preseed', 'seed', 'seriesab', 'seriesbc', 'seriesc'];
  const VALID_METHODS = ['in-house', 'outsourced'];

  if (!VALID_GEOS.includes(geo_inc)) throw new Error(`Invalid geo_inc: "${geo_inc}". Must be one of ${VALID_GEOS.join(', ')}`);
  if (!VALID_GEOS.includes(geo_op)) throw new Error(`Invalid geo_op: "${geo_op}". Must be one of ${VALID_GEOS.join(', ')}`);
  if (!VALID_METHODS.includes(meth)) throw new Error(`Invalid meth: "${meth}". Must be one of ${VALID_METHODS.join(', ')}`);
  if (stage && !VALID_STAGES.includes(stage)) throw new Error(`Invalid stage: "${stage}". Must be one of ${VALID_STAGES.join(', ')}`);
  if (typeof sh !== 'number' || sh < 0) throw new Error(`Invalid sh: must be non-negative number, got ${sh}`);
  if (typeof oh !== 'number' || oh < 0) throw new Error(`Invalid oh: must be non-negative number, got ${oh}`);
  if (typeof gr !== 'number' || gr < 0) throw new Error(`Invalid gr: must be non-negative number, got ${gr}`);

  if (!compliance?.[geo_inc]) throw new Error(`COMPLIANCE missing entry for geo_inc="${geo_inc}"`);
  if (!pricing?.[geo_op]) throw new Error(`PRICING missing entry for geo_op="${geo_op}"`);
  if (!stageRates?.[geo_op]) throw new Error(`STAGE_HOURLY_RATES missing entry for geo_op="${geo_op}"`);
  if (!stageRetainer?.[geo_op]) throw new Error(`STAGE_RETAINER missing entry for geo_op="${geo_op}"`);
  if (!secretarialWorkflows?.[geo_inc]) throw new Error(`SECRETARIAL_WORKFLOWS_BY_GEO missing entry for geo_inc="${geo_inc}"`);
  if (!staffingMatrix) throw new Error('STAFFING_MATRIX is required');
  if (!fundraisingWorkflows) throw new Error('FUNDRAISING_WORKFLOWS is required');

  const stakeholders = Math.min(sh + oh, 10000);
  const stageKey = stage || 'seriesab';

  if (!staffingMatrix[stageKey]) throw new Error(`STAFFING_MATRIX missing entry for stage="${stageKey}"`);
  if (!stageRates[geo_op][stageKey]) throw new Error(`STAGE_HOURLY_RATES missing entry for geo_op="${geo_op}", stage="${stageKey}"`);
  if (!stageRetainer[geo_op][stageKey]) throw new Error(`STAGE_RETAINER missing entry for geo_op="${geo_op}", stage="${stageKey}"`);

  let rate = overrides.rate;
  if (!rate) {
    if (meth === 'in-house') {
      const matrix = staffingMatrix[stageKey];
      const roles = ['founder', 'hr', 'finance', 'cs'];
      rate = 0;

      for (const role of roles) {
        const fte = matrix[role] || 0;
        if (fte > 0) {
          const roleRate = stageRates[geo_op][stageKey][role];
          if (typeof roleRate !== 'number') {
            throw new Error(`STAGE_HOURLY_RATES missing rate for geo_op="${geo_op}", stage="${stageKey}", role="${role}"`);
          }
          rate += fte * roleRate;
        }
      }
    } else if (meth === 'outsourced') {
      rate = 0;
    }
  }

  // Cost multiplier based on method
  const mult = { 'in-house': 1, 'outsourced': 0.4 }[meth];

  // Editable assumption overrides
  const grHr = overrides.grHr || 1.5;
  const compHr = overrides.compHr || compliance[geo_inc];

  // Calculate manual costs
  const grHrs = gr * grHr;
  const grCost = grHrs * mult * rate;

  const cpRaw = compHr;
  const cpCost = cpRaw * mult * rate;

  // Cap table maintenance cost (base)
  const ctRaw = (3 + Math.max(0, (sh - 20) / 50) * 2) * 12;
  const ctHrs = ctRaw * mult;
  const ctCost = ctHrs * rate;

  // Cap table fundraising cost (one-time per fundraise event, scaled by round complexity)
  const ROUND_COMPLEXITY = { safe: 0.5, bridge: 0.75, seed: 1.0, seriesab: 1.5, seriesbc: 2.0, seriesc: 2.5 };
  const roundMultiplier = planningToFundraise ? (ROUND_COMPLEXITY[fundraiseRound] || 1.0) : 0;
  const ctFundraisingWorkflows = planningToFundraise ? (fundraisingWorkflows?.capTable || 0) : 0;
  const ctFundraisingHours = ctFundraisingWorkflows * 2.5 * roundMultiplier;
  const ctFundraisingHrs = ctFundraisingHours * mult;
  const ctFundraisingCost = ctFundraisingHrs * rate;

  // Calculate secretarial & board operations cost (base - without fundraising)
  const baseWorkflows = secretarialWorkflows?.[geo_inc]?.[stageKey] || 0;
  const secBaseHours = baseWorkflows * 2.5;

  // Use base shareholder count for base secretarial scaling
  const shareholderScaling = 1 + Math.max(0, (sh - 20) / 100) * 0.5;
  const secRaw = secBaseHours * shareholderScaling;
  const secHrs = secRaw * mult;
  const secRate = stageRates[geo_op][stageKey].cs;
  if (typeof secRate !== 'number') throw new Error(`STAGE_HOURLY_RATES missing 'cs' rate for geo_op="${geo_op}", stage="${stageKey}"`);
  const secCost = secHrs * secRate;

  // Secretarial fundraising cost (one-time per fundraise event, scaled by round complexity)
  const secFundraisingWorkflows = planningToFundraise ? (fundraisingWorkflows?.secretarial || 0) : 0;
  const secFundraisingHours = secFundraisingWorkflows * 2.5 * roundMultiplier;
  const effectiveShareholders = planningToFundraise ? (sh + newShareholdersFromFundraise) : sh;
  const secFundraisingScaling = 1 + Math.max(0, (effectiveShareholders - 20) / 100) * 0.5;
  const secFundraisingRaw = secFundraisingHours * secFundraisingScaling;
  const secFundraisingHrs = secFundraisingRaw * mult;
  const secFundraisingCost = secFundraisingHrs * secRate;

  // External costs based on method
  let methodExtCost = toolCost;
  if (meth === 'outsourced') {
    methodExtCost = stageRetainer[geo_op][stageKey];
  }

  // Valuation services cost
  let valuationCost = 0;
  let elValuationCost = 0;
  if (valuationFrequency && valuationType) {
    const frequencyMultiplier = valuationFrequency === 'quarterly' ? 4 : 1;
    valuationCost = valuationCostMarket * frequencyMultiplier;
    elValuationCost = valuationCostEl * frequencyMultiplier;
  }

  // Total annual cost (includes all fundraising costs)
  const annCost = grCost + cpCost + ctCost + secCost + ctFundraisingCost + secFundraisingCost + methodExtCost + valuationCost;

  // Calculate efficiency metrics
  const manualHTotal = grHrs + cpRaw + ctRaw + secRaw + ctFundraisingHours + secFundraisingHours;
  const internalHTotal = grHrs * mult + cpRaw * mult + ctHrs + secHrs + ctFundraisingHrs + secFundraisingHrs;
  const timeSavedPct = manualHTotal > 0 ? Math.round(((manualHTotal - internalHTotal) / manualHTotal) * 100) : 0;

  // EquityList overhead (10% of manual baseline)
  const elOverhead = manualHTotal * 0.1 * rate;

  // EquityList annual cost (pricing is per-stakeholder in local currency, includes discounted valuation cost)
  const elAnn = stakeholders * pricing[geo_op] + elOverhead + elValuationCost;

  // ROI calculation
  const diff = annCost - elAnn;
  const isSpend = diff >= 0;
  const absDiff = Math.abs(diff);
  const roi = elAnn > 0 ? Math.round((absDiff / elAnn) * 10) / 10 : 0;

  return {
    // Costs
    annCost: Math.round(annCost),
    elAnn: Math.round(elAnn),
    diff: Math.round(diff),
    isSpend,
    roi,

    // Details for audit log
    stakeholders,
    stage: stageKey,
    rate,
    mult,
    manualHTotal: Math.round(manualHTotal * 10) / 10,
    internalHTotal: Math.round(internalHTotal * 10) / 10,
    timeSavedPct,
    grCost: Math.round(grCost),
    cpCost: Math.round(cpCost),
    ctCost: Math.round(ctCost),
    ctFundraisingCost: Math.round(ctFundraisingCost),
    ctFundraisingWorkflows,
    secCost: Math.round(secCost),
    secFundraisingCost: Math.round(secFundraisingCost),
    secFundraisingWorkflows,
    secRate,
    baseWorkflows,
    shareholderScaling,
    planningToFundraise,
    newShareholdersFromFundraise,
    methodExtCost: Math.round(methodExtCost),
    valuationCost: Math.round(valuationCost),
    elValuationCost: Math.round(elValuationCost),
    elOverhead: Math.round(elOverhead),
    grHr,
    compHr,
    geo_inc,
    geo_op,
    meth
  };
}
