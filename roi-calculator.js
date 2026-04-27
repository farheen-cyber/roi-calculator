/**
 * Pure ROI calculation function - no DOM dependencies
 * @param {Object} inputs - User inputs
 * @param {number} inputs.sh - Shareholders count
 * @param {number} inputs.oh - Option holders count
 * @param {number} inputs.gr - Equity grants per year
 * @param {string} inputs.geo_inc - Country of incorporation
 * @param {string} inputs.geo_op - Country of operation
 * @param {string} inputs.per - Personnel role (founder, finance, hr, cs)
 * @param {string} inputs.meth - Administrative method (in-house, outsourced, existing-tool)
 * @param {number} inputs.toolCost - Annual tool cost (if existing-tool)
 * @param {Object} rates - RATES lookup table
 * @param {Object} compliance - COMPLIANCE lookup table
 * @param {Object} ext - EXT lookup table
 * @param {Object} fx - FX lookup table
 * @param {Object} pricing - PRICING lookup table (per-stakeholder cost by geography)
 * @param {Object} overrides - { rate, grHr, compHr } for editable assumptions
 * @returns {Object} ROI calculation results
 */
export function computeROI(inputs, rates, compliance, ext, fx, pricing, overrides) {
  const { sh, oh, gr, geo_inc, geo_op, per, meth, toolCost = 0 } = inputs;

  // Determine stakeholder tier for rate selection
  const stakeholders = Math.min(sh + oh, 10000);
  const tier = stakeholders <= 30 ? 'p10' : stakeholders <= 70 ? 'p50' : 'p90';
  const tierLabel = tier === 'p10' ? '10th percentile' : tier === 'p50' ? 'median' : '90th percentile';

  // Get hourly rate (with override if provided)
  const rate = overrides.rate || rates[geo_op][per][tier];

  // Cost multiplier based on method
  const mult = { 'in-house': 1, 'outsourced': 0.4, 'existing-tool': 0.1 }[meth];

  // Editable assumption overrides
  const grHr = overrides.grHr || 1.5;
  const compHr = overrides.compHr || compliance[geo_inc];

  // Calculate manual costs
  const grHrs = gr * grHr;
  const grCost = grHrs * mult * rate;

  const cpRaw = compHr;
  const cpCost = cpRaw * mult * rate;

  const ctRaw = (3 + Math.max(0, (sh - 20) / 50) * 2) * 12;
  const ctHrs = ctRaw * mult;
  const ctCost = ctHrs * rate;

  // External costs based on method
  let methodExtCost = toolCost;
  if (meth === 'outsourced') {
    // Apply tier-based scaling only to outsourced retainer costs
    const tierMultiplier = tier === 'p10' ? 0.5 : tier === 'p50' ? 1.0 : 1.2;
    methodExtCost = Math.round(ext[geo_op] * tierMultiplier);
  }

  // Total annual cost
  const annCost = grCost + cpCost + ctCost + methodExtCost;

  // Calculate efficiency metrics
  const manualHTotal = grHrs + cpRaw + ctRaw;
  const internalHTotal = grHrs * mult + cpRaw * mult + ctHrs;
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
    tier,
    tierLabel,
    rate,
    mult,
    manualHTotal: Math.round(manualHTotal * 10) / 10,
    internalHTotal: Math.round(internalHTotal * 10) / 10,
    timeSavedPct,
    grCost: Math.round(grCost),
    cpCost: Math.round(cpCost),
    ctCost: Math.round(ctCost),
    methodExtCost: Math.round(methodExtCost),
    elOverhead: Math.round(elOverhead),
    grHr,
    compHr,
    geo_inc,
    geo_op,
    meth
  };
}
