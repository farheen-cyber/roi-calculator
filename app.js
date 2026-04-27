import { CUR, RATES, RATES_META, COMPLIANCE, EXT, FX, PRICING, STAGE_HOURLY_RATES, STAGE_RETAINER } from './data.js';
import { computeROI } from './roi-calculator.js';
import { SelectField } from './SelectField.js';

// Global state
var flow = 'input';
var calcDone = false;
var updateTimer = null;
var overrides = { rate: null, grHr: null, compHr: null };
var initialMethod = null;
var userInputStarted = false;
var cbOpen = false; // tracks whether Cost Breakdown panel is open across re-renders

// Stepper state
var currentStep = 1;
var formStateData = {};

// Default values for sample data detection
const DEFAULTS = {
  geoInc: 'india',
  geoOp: 'india',
  stage: 'seriesab',
  sh: 30,
  oh: 15,
  gr: 10,
  per: 'finance',
  meth: 'in-house',
  tc: 0
};

function isUsingSampleData() {
  const geoInc = document.getElementById('i-geo-inc')?.value || '';
  const geoOp = document.getElementById('i-geo-op')?.value || '';
  const stage = document.getElementById('i-st')?.value || '';
  const sh = parseInt(document.getElementById('i-sh')?.value || 0);
  const oh = parseInt(document.getElementById('i-oh')?.value || 0);
  const gr = parseInt(document.getElementById('i-gr')?.value || 0);
  const per = document.getElementById('i-per')?.value || '';
  const meth = document.getElementById('i-meth')?.value || '';
  const tc = parseInt(document.getElementById('i-tc')?.value || 0);

  return (
    geoInc === DEFAULTS.geoInc &&
    geoOp === DEFAULTS.geoOp &&
    stage === DEFAULTS.stage &&
    sh === DEFAULTS.sh &&
    oh === DEFAULTS.oh &&
    gr === DEFAULTS.gr &&
    per === DEFAULTS.per &&
    meth === DEFAULTS.meth &&
    tc === DEFAULTS.tc
  );
}

function updateSampleDataBanner() {
  const sampleBanner = document.getElementById('sample-banner');
  const usingSample = isUsingSampleData();
  if (sampleBanner) {
    if (flow === 'input') {
      sampleBanner.style.display = 'flex';
      if (usingSample) {
        sampleBanner.innerHTML = `<span class="sample-dot"></span><span class="sample-text">SAMPLE DATA</span><span class="sample-link">EDIT INPUTS →</span>`;
        sampleBanner.className = 'sample-banner sample-state';
      } else {
        sampleBanner.innerHTML = `<span class="sample-dot"></span><span class="sample-text">LIVE · YOUR INPUTS</span>`;
        sampleBanner.className = 'sample-banner live-state';
      }
    } else {
      sampleBanner.style.display = 'none';
    }
  }
}

// ==================== THEME MANAGEMENT ====================

function toggleTheme() {
  const html = document.documentElement;
  const isDarkMode = html.classList.contains('dark-theme');
  const btn = document.getElementById('theme-toggle');

  if (isDarkMode) {
    html.classList.remove('dark-theme');
    btn.innerText = 'Dark';
    localStorage.setItem('theme', 'light');
  } else {
    html.classList.add('dark-theme');
    btn.innerText = 'Light';
    localStorage.setItem('theme', 'dark');
  }
}

function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  const html = document.documentElement;
  const btn = document.getElementById('theme-toggle');

  if (saved === 'dark') {
    html.classList.add('dark-theme');
    btn.innerText = 'Light';
  } else {
    html.classList.remove('dark-theme');
    btn.innerText = 'Dark';
  }
}

// ==================== VALIDATION FUNCTIONS ====================

function validateInputs() {
  const geoInc = document.getElementById('i-geo-inc').value;
  const geoOp = document.getElementById('i-geo-op').value;
  const sh = document.getElementById('i-sh').value;
  const oh = document.getElementById('i-oh').value;
  const gr = document.getElementById('i-gr').value;
  const stage = document.getElementById('i-st').value;

  const errors = {};

  // Only check if fields are filled (no range validation)
  if (!geoInc) errors.geo_inc = 'Field required';
  if (!geoOp) errors.geo_op = 'Field required';
  if (!sh) errors.sh = 'Field required';
  if (!oh) errors.oh = 'Field required';
  if (!gr) errors.gr = 'Field required';
  if (!stage) errors.st = 'Field required';

  return { valid: Object.keys(errors).length === 0, errors };
}

function displayFieldErrors(validationResult) {
  const fieldMap = {
    geo_inc: 'i-geo-inc',
    geo_op: 'i-geo-op',
    sh: 'i-sh',
    oh: 'i-oh',
    gr: 'i-gr',
    st: 'i-st'
  };

  Object.entries(fieldMap).forEach(([key, fieldId]) => {
    const el = document.getElementById(fieldId);
    if (!el) return;

    const fi = el.closest('.fi');
    if (!fi) return;

    const errMsg = fi.querySelector('.err-msg');

    if (validationResult.errors[key]) {
      // Show error
      fi.classList.add('err-bg');
      if (errMsg) {
        errMsg.innerText = validationResult.errors[key];
        errMsg.style.display = 'block';
      }
    } else {
      // Clear error
      fi.classList.remove('err-bg');
      if (errMsg) errMsg.style.display = 'none';
    }
  });
}

function validateAndDisplayErrors() {
  const result = validateInputs();
  displayFieldErrors(result);
}

// ==================== NAVIGATION FUNCTIONS ====================

function goInput() {
  flow = 'input';
  userInputStarted = false;
  initialMethod = document.getElementById('i-meth').value;
  document.body.classList.remove('state-overview');
  document.getElementById('res-status').style.display = 'block';
  document.getElementById('overview-state').classList.add('hidden');
  document.getElementById('input-state').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Initialize stepper
  currentStep = 1;
  formStateData = {};
  updateStepVisibility();
  loadStepState();

  document.getElementById('i-geo-inc').focus();
}

function goOverview() {
  flow = 'overview';
  document.body.classList.add('state-overview');
  document.getElementById('res-status').style.display = 'none';
  document.getElementById('input-state').classList.add('hidden');
  document.getElementById('overview-state').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== STEPPER NAVIGATION ====================

function saveStepState() {
  // Save all form values to formStateData
  const inputs = document.querySelectorAll('#input-state input, #input-state select');
  inputs.forEach(input => {
    formStateData[input.id] = input.value;
  });
}

function loadStepState() {
  // Restore all form values from formStateData
  Object.entries(formStateData).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (input) input.value = value;
  });
  // Reinitialize SelectField components to match restored values
  document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => {
    const select = wrapper.querySelector('.custom-select');
    const display = wrapper.querySelector('.select-display .select-label');
    if (select && display) {
      const selectedOption = select.options[select.selectedIndex];
      display.textContent = selectedOption ? selectedOption.text : '';
    }
  });
}

function validateStep(step) {
  if (step === 1) {
    const geoInc = document.getElementById('i-geo-inc').value;
    const geoOp = document.getElementById('i-geo-op').value;
    const stage = document.getElementById('i-st').value;
    return geoInc && geoOp && stage; // Countries and stage required
  }
  if (step === 2) {
    const sh = document.getElementById('i-sh').value;
    const oh = document.getElementById('i-oh').value;
    const gr = document.getElementById('i-gr').value;
    return sh && oh && gr; // All three required
  }
  if (step === 3) {
    const per = document.getElementById('i-per').value;
    return per; // Managed by required
  }
  return true;
}

function updateStepVisibility() {
  document.querySelectorAll('#input-state .sec').forEach((sec, idx) => {
    if (idx + 1 === currentStep) {
      sec.classList.add('active');
      sec.classList.remove('hidden');
      sec.classList.remove('dim');
    } else {
      sec.classList.remove('active');
      sec.classList.add('hidden');
    }
  });

  // Update step indicator
  document.getElementById('current-step').textContent = currentStep;

  // Update button states
  const backBtn = document.getElementById('btn-back');
  backBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';
  backBtn.disabled = false;
  const nextBtn = document.getElementById('btn-next');
  nextBtn.style.display = currentStep === 3 ? 'none' : 'inline-flex';
  nextBtn.disabled = !validateStep(currentStep);
}

function stepNext() {
  if (!validateStep(currentStep)) return;
  saveStepState();
  if (currentStep < 3) {
    currentStep++;
    updateStepVisibility();
    loadStepState();
    doCalc();
  }
}

function stepBack() {
  if (currentStep > 1) {
    saveStepState();
    currentStep--;
    updateStepVisibility();
    loadStepState();
    doCalc();
  }
}

// ==================== FILE UPLOAD ====================

function onF(files) {
  if (files.length) {
    document.getElementById('up-info').classList.remove('hidden');
    setTimeout(goInput, 600);
  }
}

// ==================== FIELD VALIDATION ====================

function val(el) {
  var fi = el.parentElement;
  var errMsg = fi.querySelector('.err-msg');
  if (!el.value) {
    fi.classList.add('err-bg');
    if (errMsg) {
      errMsg.innerText = 'Field required';
      errMsg.style.display = 'block';
    }
  } else {
    fi.classList.remove('err-bg');
    if (errMsg) errMsg.style.display = 'none';
  }
}

function valAndEnableNext(el, n) {
  val(el);
  var next = document.getElementById(n);
  if (!next) return;
  var wrap = next.parentElement;
  if (!el.value) {
    wrap.style.opacity = '0.5';
    next.disabled = true;
  } else {
    wrap.style.opacity = '1';
    next.disabled = false;
  }
}

// ==================== FORM STATE ====================

function updateNextButtonState() {
  const nextBtn = document.getElementById('btn-next');
  if (nextBtn) {
    nextBtn.disabled = !validateStep(currentStep);
  }
}

function lc() {
  // Update button state immediately for instant visual feedback
  updateNextButtonState();

  // Debounce calculation
  if (updateTimer) clearTimeout(updateTimer);
  updateTimer = setTimeout(() => {
    doCalc();
  }, 100);
}

function onRateChange() {
  const input = document.getElementById('cb-rate-input');
  if (input) {
    const v = parseFloat(input.value);
    overrides.rate = isNaN(v) ? null : v;
    doCalc();
  }
}

function onCompHrChange() {
  const input = document.getElementById('cb-comph-input');
  if (input) {
    const v = parseFloat(input.value);
    overrides.compHr = isNaN(v) ? null : v;
    doCalc();
  }
}

function onTotalMgmtHoursChange() {
  const input = document.getElementById('cb-total-input');
  if (input) {
    const totalInput = parseFloat(input.value);
    if (!isNaN(totalInput)) {
      // Calculate grant admin hours
      const gr = parseInt(document.getElementById('i-gr')?.value || 0);
      const grHr = overrides.grHr || 1.5;
      const grHrs = grHr * gr;

      // Calculate cap table hours
      const sh = parseInt(document.getElementById('i-sh')?.value || 0);
      const ctHrs = (3 + Math.max(0, (sh - 20) / 50) * 2) * 12;

      // Calculate compliance hours from total
      const compHr = Math.max(0, totalInput - grHrs - ctHrs);
      overrides.compHr = compHr;
      doCalc();
    }
  }
}

function toggleCostBreakdown() {
  const content = document.getElementById('cb-content');
  const icon = document.getElementById('cb-toggle-icon');
  if (content.style.display === 'none') {
    content.style.display = 'block';
    if (icon) icon.style.transform = 'rotate(180deg)';
    cbOpen = true;
  } else {
    content.style.display = 'none';
    if (icon) icon.style.transform = 'rotate(0deg)';
    cbOpen = false;
  }
}

function applyAssumptions() {
  const rateInput = document.getElementById('cb-rate-input');
  const totalInput = document.getElementById('cb-total-input');

  if (rateInput) {
    const v = parseFloat(rateInput.value);
    overrides.rate = isNaN(v) ? null : v;
  }

  if (totalInput) {
    const totalVal = parseFloat(totalInput.value);
    if (!isNaN(totalVal)) {
      const gr = parseInt(document.getElementById('i-gr')?.value || 0);
      const grHr = overrides.grHr != null ? overrides.grHr : 1.5;
      const grHrs = grHr * gr;
      const sh = parseInt(document.getElementById('i-sh')?.value || 0);
      const ctRaw = (3 + Math.max(0, (sh - 20) / 50) * 2) * 12;
      overrides.compHr = Math.max(0, totalVal - grHrs - ctRaw);
    }
  }

  cbOpen = true; // keep panel open after apply
  doCalc();
}

function resetO(k) {
  overrides[k] = null;
  doCalc();
}

function onMethChange() {
  var m = document.getElementById('i-meth').value;
  document.getElementById('tool-cost-wrap').classList.toggle('hidden', m !== 'existing-tool');
  lc();
}

// ==================== HELPER FUNCTIONS ====================

function fN(n) {
  return n.toLocaleString();
}

function fK(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return Math.round(n / 1e3).toLocaleString() + 'k';
  return String(Math.round(n));
}

// ==================== SPOTLIGHT TRACKING ====================

function track(e) {
  var rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--x', e.clientX - rect.left + 'px');
  e.currentTarget.style.setProperty('--y', e.clientY - rect.top + 'px');
}

// ==================== MAIN CALCULATION & RENDERING ====================

function doCalc() {
  var geo_inc = document.getElementById('i-geo-inc').value;
  var geo_op = document.getElementById('i-geo-op').value;
  var stage = document.getElementById('i-st').value;
  var shEl = document.getElementById('i-sh');
  var ohEl = document.getElementById('i-oh');
  var grEl = document.getElementById('i-gr');
  var sh = parseInt(shEl.value) || 0;
  var oh = parseInt(ohEl.value) || 0;
  var gr = parseInt(grEl.value) || 0;
  var per = document.getElementById('i-per').value;
  var meth = document.getElementById('i-meth').value;

  var valid = shEl.value && ohEl.value && grEl.value && stage;

  if (flow === 'input') {
    var hasUserInput =
      sh !== 30 ||
      oh !== 15 ||
      gr !== 10 ||
      geo_inc !== 'india' ||
      geo_op !== 'india' ||
      per !== 'finance' ||
      meth !== initialMethod;
    userInputStarted = userInputStarted || hasUserInput;
  }

  const validationResult = validateInputs();
  displayFieldErrors(validationResult);

  if (flow === 'input' && (!valid || !validationResult.valid)) {
    document.getElementById('res-status').style.display = 'none';
    document.getElementById('r-body').innerHTML =
      '<div style="padding:40px 0;text-align:center;color:var(--t2)">Fill in all required fields (*) to see estimate.</div>';
    // Clear cost table when invalid
    document.getElementById('cost-you').textContent = '$0';
    document.getElementById('cost-el').textContent = '$0';
    document.getElementById('cost-savings').textContent = '$0';
    document.getElementById('mobile-summary').style.display = 'none';
    return;
  }

  // Get tool cost if using existing-tool method
  const toolCost = meth === 'existing-tool' ? parseFloat(document.getElementById('i-tc').value) || 0 : 0;

  // Call pure ROI calculation function
  const roiData = computeROI(
    { sh, oh, gr, stage, geo_inc, geo_op, per, meth, toolCost },
    RATES,
    COMPLIANCE,
    EXT,
    FX,
    PRICING,
    STAGE_HOURLY_RATES,
    STAGE_RETAINER,
    overrides
  );

  const sym = CUR[geo_op];

  // Update status (hidden)
  document.getElementById('res-status').style.display = 'none';

  // Update sample data banner
  updateSampleDataBanner();

  // Calculate savings for use in template
  const savings = roiData.annCost - roiData.elAnn;
  const savingsFormatted = sym + fN(Math.abs(savings));

  // Determine savings state
  let state;
  if (savings > 0) {
    state = 'POSITIVE_SAVINGS';
  } else if (savings < 0 && (meth === 'in-house' || meth === 'outsourced')) {
    state = 'NEGATIVE_SAVINGS_INHOUSE_OUTSOURCED';
  } else if (savings < 0 && meth === 'existing-tool') {
    state = 'NEGATIVE_SAVINGS_EXISTING_TOOL';
  } else {
    state = 'BREAKEVEN';
  }

  // Check if persona is Founder
  const isFounder = per === 'founder';

  // Build message parts separately (no nested templates)
  let msgPart1 = '';
  let msgPart2 = '';
  let ctaText = '';
  let ctaUrl = '';

  if (state === 'POSITIVE_SAVINGS') {
    msgPart1 = 'You\'re currently overspending on equity operations. You could save ' + savingsFormatted + '/year while eliminating most manual work. EquityList ensures your cap table stays accurate, audit-ready, and compliant as you scale.';
    msgPart2 = isFounder ? ' Your time is significantly more valuable than the cost assumed here — equity operations shouldn\'t sit with the CEO.' : '';
    ctaText = 'Book a demo →';
    ctaUrl = 'https://www.equitylist.co/contact';
  } else if (state === 'NEGATIVE_SAVINGS_INHOUSE_OUTSOURCED') {
    msgPart1 = 'Your current setup is cost-efficient — for now. At your scale, manual or outsourced workflows are still manageable. However, these processes rely heavily on manual effort — increasing the risk of errors, delays, and compliance gaps as your company grows.';
    msgPart2 = isFounder ? ' Even if costs look low, the CEO\'s time is undervalued here — this work pulls focus from higher-impact priorities.' : '';
    ctaText = 'Notify me when it\'s time to switch →';
    ctaUrl = 'https://www.equitylist.co/newsletter';
  } else if (state === 'NEGATIVE_SAVINGS_EXISTING_TOOL') {
    msgPart1 = 'Your current tool is cost-efficient — but may not reduce operational risk. At your scale, your existing setup handles equity operations at a lower cost. However, most tools don\'t eliminate manual work — leaving room for errors in vesting, reporting, and compliance.';
    msgPart2 = isFounder ? ' If the CEO is still involved, the true cost is higher than shown — leadership time is not being fully accounted for.' : '';
    ctaText = 'See how EquityList handles this →';
    ctaUrl = 'https://www.equitylist.co/contact';
  } else {
    msgPart1 = 'Cost isn\'t the deciding factor here. Your current setup and EquityList are comparable in cost at your scale. The real difference is how reliably your equity operations are managed as complexity increases.';
    msgPart2 = isFounder ? ' At this point, the CEO\'s time and oversight become the more important factor than direct cost.' : '';
    ctaText = 'Explore how it works →';
    ctaUrl = 'https://www.equitylist.co/contact';
  }

  // Assemble final message
  const fullMessage = msgPart1 + msgPart2;

  // Build CTA HTML with simple string concatenation
  const ctaHtml = '<div style="background:rgba(95,23,234,0.08);border:1px solid rgba(95,23,234,0.2);padding:16px;border-radius:6px;margin-bottom:16px"><div style="font-size:12px;color:var(--t2);line-height:1.5">' + fullMessage + '</div></div><button onclick="window.open(\'' + ctaUrl + '\', \'_blank\')" class="btn btn-p" style="width:100%;text-align:center;cursor:pointer;border:none">' + ctaText + '</button>';

  // Calculate cap table hours manually (same formula as roi-calculator.js)
  const ctRaw = (3 + Math.max(0, (sh - 20) / 50) * 2) * 12;
  const ctHrs = ctRaw * roiData.mult;

  // Calculate breakdown for explanations
  const ctMonthlyBase = 3;
  const ctMonthlyScaling = Math.max(0, (sh - 20) / 50) * 2;
  const ctMonthlyTotal = ctMonthlyBase + ctMonthlyScaling;

  // Calculate hours for each component
  const grHrs = roiData.grHr * gr;
  const compHrs = roiData.compHr;
  const capTableHrs = ctRaw;
  const totalEquityMgmtHrs = grHrs + compHrs + capTableHrs;

  // Calculate cost breakdown percentages
  const grantAdminPct = roiData.annCost > 0 ? Math.round((roiData.grCost / roiData.annCost) * 100) : 0;
  const compliancePct = roiData.annCost > 0 ? Math.round((roiData.cpCost / roiData.annCost) * 100) : 0;
  const capTablePct = roiData.annCost > 0 ? Math.round((roiData.ctCost / roiData.annCost) * 100) : 0;
  const externalPct = roiData.annCost > 0 ? Math.round((roiData.methodExtCost / roiData.annCost) * 100) : 0;

  const costBreakdownDetails = `
    <div class="cb-detail">
      <div class="cb-detail-item">
        <div class="cb-detail-label">Grant Admin</div>
        <div class="cb-detail-formula">${roiData.grHr} hrs/grant × ${gr} grants/yr × ${roiData.mult} × ${sym}${roiData.rate}/hr</div>
        <div class="cb-detail-value">${sym}${fN(roiData.grCost)} <span class="cb-detail-pct">${grantAdminPct}%</span></div>
      </div>
      <div class="cb-detail-item">
        <div class="cb-detail-label">
          Compliance
          <span class="cb-info-btn" title="Baseline hours for your country of incorporation. Covers statutory registers, tax reporting, and grant compliance tracking.">ℹ</span>
        </div>
        <div class="cb-detail-formula">${roiData.compHr} hrs/yr (${(roiData.compHr / 12).toFixed(0)}h/mo, ${geo_inc.toUpperCase()} statutory baseline) × ${roiData.mult} × ${sym}${roiData.rate}/hr</div>
        <div class="cb-detail-value">${sym}${fN(roiData.cpCost)} <span class="cb-detail-pct">${compliancePct}%</span></div>
      </div>
      <div class="cb-detail-item">
        <div class="cb-detail-label">
          Cap Table
          <span class="cb-info-btn" title="Base 3h/mo + scaling hours for ${sh} shareholders. Base increases by 2h/mo for every 50 shareholders above 20. Includes monthly reconciliation, updates, and stakeholder communications.">ℹ</span>
        </div>
        <div class="cb-detail-formula">${Math.round(ctMonthlyBase)}h/mo base + ${Math.max(0, (sh - 20) / 50).toFixed(2)}h/mo scaling = ${ctMonthlyTotal.toFixed(1)}h/mo × 12 = ${Math.round(ctRaw)} hrs/yr × ${roiData.mult} × ${sym}${roiData.rate}/hr</div>
        <div class="cb-detail-value">${sym}${fN(roiData.ctCost)} <span class="cb-detail-pct">${capTablePct}%</span></div>
      </div>
      ${roiData.methodExtCost > 0 ? `
      <div class="cb-detail-item">
        <div class="cb-detail-label">External Service</div>
        <div class="cb-detail-formula">Fixed annual cost</div>
        <div class="cb-detail-value">${sym}${fN(roiData.methodExtCost)} <span class="cb-detail-pct">${externalPct}%</span></div>
      </div>
      ` : ''}
    </div>
  `;

  document.getElementById('r-body').innerHTML = `
    <div class="cost-table-wrap">
      <div class="cost-table-h">COST COMPARISON</div>
      <table class="cost-table">
        <tr class="cost-row">
          <td class="cost-label">Your Annual Spend</td>
          <td class="cost-value" style="color: ${savings > 0 ? 'var(--red)' : 'var(--ok)'}">${sym}${fN(roiData.annCost)}</td>
        </tr>
        <tr class="cost-row">
          <td class="cost-label">EquityList*</td>
          <td class="cost-value">${sym}${fN(roiData.elAnn)}</td>
        </tr>
        <tr class="cost-row savings">
          <td class="cost-label">Your Potential Savings with EquityList*</td>
          <td class="cost-value savings-val" style="color: ${savings > 0 ? 'var(--ok)' : 'var(--red)'}">${savings > 0 ? sym : '-' + sym}${fN(Math.abs(savings))}</td>
        </tr>
      </table>
    </div>
    <div style="font-size:var(--fs-xs);color:var(--t3);margin:var(--sp-3) 0 var(--sp-5) 0;line-height:var(--lh-snug)">
      * <strong>Pricing shown is indicative</strong> and based on benchmarks. Final pricing is tailored to your company's size and requirements.
    </div>
    <div class="cb-group">
      <button class="cb-toggle" onclick="toggleCostBreakdown()" style="width:100%;text-align:left;border:none;background:transparent;padding:12px 0;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--bd)">
        <span style="font-size:var(--fs-label);color:var(--t2);text-transform:uppercase;letter-spacing:0.05em;font-weight:500">Cost Breakdown</span>
        <span id="cb-toggle-icon" style="font-size:12px;color:var(--t3);transition:transform 0.2s">▼</span>
      </button>
      <div id="cb-content" class="cb-content" style="display:none;margin-top:16px">
        ${costBreakdownDetails}
        <div class="cb-section-divider"></div>
        <div class="cb-assumption">
          ${roiData.ceoPremiumApplied ? `
            <div style="background:rgba(95,23,234,0.08);border:1px solid rgba(95,23,234,0.2);padding:12px;border-radius:6px;margin-bottom:16px">
              <div style="font-size:var(--fs-xs);color:var(--accent);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">CEO Premium Applied</div>
              <div style="font-size:var(--fs-sm);color:var(--t2);line-height:1.5">Founder/CEO time is valued at <strong>1.5x</strong> standard hourly rate to reflect true cost of leadership time.</div>
            </div>
          ` : ''}
          <div class="cb-assumption-row">
            <span class="cb-assumption-label">Hourly Rate${roiData.ceoPremiumApplied ? ' (with 1.5x CEO Premium)' : ''}</span>
            <div class="cb-assumption-input-wrap">
              <span style="font-size:var(--fs-table);font-variant-numeric:tabular-nums;font-family:var(--mono);font-weight:500">${sym}</span><input type="number" id="cb-rate-input" class="cb-input" value="${roiData.rate}">
              <span class="cb-source">${per.charAt(0).toUpperCase() + per.slice(1)} • PayScale${roiData.ceoPremiumApplied ? ' • 1.5x' : ''}</span>
            </div>
          </div>
          <div class="cb-assumption-row">
            <span class="cb-assumption-label">Total Equity Management Hours</span>
            <div class="cb-assumption-input-wrap">
              <input type="number" id="cb-total-input" class="cb-input" value="${Math.round(totalEquityMgmtHrs)}" style="max-width:60px">
              <span class="cb-source">hrs/yr</span>
            </div>
          </div>
          <div class="cb-assumption-apply-row">
            <button class="cb-apply-btn" onclick="applyAssumptions()">Apply</button>
          </div>
        </div>
      </div>
    </div>
    <div class="r-group"><div class="r-group-h">ROI</div><div class="r-row"><span class="r-lbl">Your ROI with EquityList</span><span class="r-val">${roiData.roi}x</span></div><div class="r-row"><span class="r-lbl">Hours Saved Annually</span><span class="r-val green">${Math.round(roiData.internalHTotal - roiData.manualHTotal * 0.1)} hrs/yr</span></div></div>
    ${ctaHtml}
  `;

  // Restore cost breakdown open state after re-render
  if (cbOpen) {
    const content = document.getElementById('cb-content');
    const icon = document.getElementById('cb-toggle-icon');
    if (content) content.style.display = 'block';
    if (icon) icon.style.transform = 'rotate(180deg)';
  }

  // Update mobile summary
  document.getElementById('mob-spend').innerText = sym + fN(roiData.annCost);
  document.getElementById('mob-roi').innerText = roiData.roi + 'x';
  const shouldShowMobileSummary = flow === 'input' && window.innerWidth <= 1024;
  document.getElementById('mobile-summary').style.display = shouldShowMobileSummary ? 'block' : 'none';
}

// ==================== MODAL FUNCTIONS ====================
// Modal functions removed - Cost Breakdown is now inline in main results panel

// ==================== SECTION OBSERVER ====================

const sectionObs = new IntersectionObserver(
  (entries) => {
    let closestSection = null;
    let maxRatio = -1;

    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
        maxRatio = entry.intersectionRatio;
        closestSection = entry.target;
      }
    });

    if (!closestSection) {
      entries.forEach((entry) => {
        const rect = entry.target.getBoundingClientRect();
        if (!closestSection || Math.abs(rect.top) < Math.abs(closestSection.getBoundingClientRect().top)) {
          closestSection = entry.target;
        }
      });
    }

    document.querySelectorAll('.sec').forEach((s) => {
      if (s === closestSection) {
        s.classList.remove('dim');
      } else {
        s.classList.add('dim');
      }
    });
  },
  { threshold: [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1], rootMargin: '-20% 0px -20% 0px' }
);

// ==================== INITIALIZATION ====================

window.addEventListener('DOMContentLoaded', () => {
  // Initialize theme from localStorage
  initTheme();

  // Start with form visible (not overview)
  document.body.classList.remove('state-overview');
  document.getElementById('overview-state').classList.add('hidden');
  document.getElementById('input-state').classList.remove('hidden');
  document.getElementById('res-status').style.display = 'block';
  document.querySelector('.back-home-btn').style.display = 'none';

  // Initialize custom select components
  document.querySelectorAll('.custom-select').forEach((selectElement) => {
    new SelectField(selectElement);
  });

  // Initialize section 01 as active
  const sec1 = document.getElementById('sec-1');
  if (sec1) sec1.classList.remove('dim');

  // Observe all sections
  document.querySelectorAll('.sec').forEach((s) => sectionObs.observe(s));

  // Click/focus handlers for field interaction
  document.querySelectorAll('.fi input, .fi select').forEach((f) => {
    const focus = () => {
      const targetSec = f.closest('.sec');
      document.querySelectorAll('.sec').forEach((s) => s.classList.toggle('dim', s !== targetSec));
    };
    f.addEventListener('focus', focus);
    f.addEventListener('click', focus);
  });

  // Initialize stepper
  currentStep = 1;
  formStateData = {};
  updateStepVisibility();
  loadStepState();

  // Do not call doCalc() on page load - wait for user to complete inputs
  // doCalc() will be called when user interacts with fields or clicks Calculate

  // Fetch live FX rates
  fetch('https://open.er-api.com/v6/latest/INR')
    .then((r) => r.json())
    .then((d) => {
      if (d.rates) {
        FX.us = d.rates.USD;
        FX.singapore = d.rates.SGD;
        FX.uk = d.rates.GBP;
        // Only recalculate if user has already started entering data
        if (userInputStarted) {
          doCalc();
        }
      }
    })
    .catch((e) => console.warn('FX update failed'));
});

// ==================== GLOBAL FUNCTION EXPORTS ====================
// These functions need to be globally accessible for inline event handlers

window.track = track;
window.goInput = goInput;
window.goOverview = goOverview;
window.onF = onF;
window.val = val;
window.valAndEnableNext = valAndEnableNext;
window.lc = lc;
window.resetO = resetO;
window.validateAndDisplayErrors = validateAndDisplayErrors;
window.onMethChange = onMethChange;
window.onRateChange = onRateChange;
window.onCompHrChange = onCompHrChange;
window.onTotalMgmtHoursChange = onTotalMgmtHoursChange;
window.toggleCostBreakdown = toggleCostBreakdown;
window.applyAssumptions = applyAssumptions;
window.doCalc = doCalc;
window.stepNext = stepNext;
window.stepBack = stepBack;
window.toggleTheme = toggleTheme;
