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
 * @param {Object} rates - RATES lookup table (legacy, used as fallback)
 * @param {Object} compliance - COMPLIANCE lookup table
 * @param {Object} ext - EXT lookup table
 * @param {Object} fx - FX lookup table
 * @param {Object} pricing - PRICING lookup table (per-stakeholder cost by geography)
 * @param {Object} stageRates - STAGE_HOURLY_RATES lookup table (stage-based rates by geography and role)
 * @param {Object} stageRetainer - STAGE_RETAINER lookup table (stage-based retainer costs by geography and stage)
 * @param {Object} staffingMatrix - STAFFING_MATRIX lookup table (FTE allocations by stage and role)
 * @param {Object} secretarialWorkflows - SECRETARIAL_WORKFLOWS_BY_GEO lookup table (workflows by geography and stage)
 * @param {Object} overrides - { rate, grHr, compHr } for editable assumptions
 * @returns {Object} ROI calculation results
 */
export function computeROI(inputs, rates, compliance, ext, fx, pricing, stageRates, stageRetainer, staffingMatrix, secretarialWorkflows, overrides) {
  const { sh, oh, gr, stage, geo_inc, geo_op, meth, toolCost = 0 } = inputs;

  // Get blended hourly rate from stage-based staffing matrix (with override if provided)
  const stakeholders = Math.min(sh + oh, 10000);
  const stageKey = stage || 'seriesab'; // default to Series A/B if not specified

  let rate = overrides.rate;
  if (!rate) {
    // Calculate blended rate based on staffing matrix for the stage
    if (meth === 'in-house') {
      const matrix = staffingMatrix[stageKey] || staffingMatrix['seriesab'];
      const roles = ['founder', 'hr', 'finance', 'cs']; // 'cs' = Legal/Company Secretary
      rate = 0;

      for (const role of roles) {
        const fte = matrix[role] || 0;
        if (fte > 0) {
          const roleRate = stageRates[geo_op]?.[stageKey]?.[role] || 0;
          rate += fte * roleRate;
        }
      }
    } else if (meth === 'outsourced') {
      // For outsourced, we don't use hourly rate; we use retainer instead
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

  // Cap table maintenance cost
  const ctRaw = (3 + Math.max(0, (sh - 20) / 50) * 2) * 12;
  const ctHrs = ctRaw * mult;
  const ctCost = ctHrs * rate;

  // Calculate secretarial & board operations cost based on geography-specific workflows
  const workflows = secretarialWorkflows?.[geo_inc]?.[stageKey] || 0;
  const secBaseHours = workflows * 2.5;
  const shareholderScaling = 1 + Math.max(0, (sh - 20) / 100) * 0.5;
  const secRaw = secBaseHours * shareholderScaling;
  const secHrs = secRaw * mult;
  const secRate = stageRates[geo_op]?.[stageKey]?.cs || 0;
  const secCost = secHrs * secRate;

  // External costs based on method
  let methodExtCost = toolCost;
  if (meth === 'outsourced') {
    // Stage-based external service cost (CA/Law Firm retainer)
    methodExtCost = stageRetainer[geo_op]?.[stageKey] || ext[geo_op];
  }

  // Total annual cost
  const annCost = grCost + cpCost + ctCost + secCost + methodExtCost;

  // Calculate efficiency metrics
  const manualHTotal = grHrs + cpRaw + ctRaw + secRaw;
  const internalHTotal = grHrs * mult + cpRaw * mult + ctHrs + secHrs;
  const timeSavedPct = manualHTotal > 0 ? Math.round(((manualHTotal - internalHTotal) / manualHTotal) * 100) : 0;

  // EquityList overhead (10% of manual baseline)
  const elOverhead = manualHTotal * 0.1 * rate;

  // EquityList annual cost (pricing is per-stakeholder in local currency)
  const elAnn = stakeholders * pricing[geo_op] + elOverhead;

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
    secCost: Math.round(secCost),
    secRaw,
    secRate,
    workflows,
    shareholderScaling,
    methodExtCost: Math.round(methodExtCost),
    elOverhead: Math.round(elOverhead),
    grHr,
    compHr,
    geo_inc,
    geo_op,
    meth
  };
}
