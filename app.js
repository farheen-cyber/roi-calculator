import { CUR, RATES, RATES_META, COMPLIANCE, EXT, PRICING, STAGE_HOURLY_RATES, STAGE_RETAINER, STAFFING_MATRIX, SECRETARIAL_WORKFLOWS_BY_GEO, FUNDRAISING_WORKFLOWS, VALUATION_TYPES, VALUATION_INTERNAL_HOURS } from './data.js';
import { computeROI } from './roi-calculator.js';
import { SelectField } from './SelectField.js';

// Global state
var flow = 'input';
var calcDone = false;
var overrides = { rate: null, grHr: null, compHr: null };
var initialMethod = null;
var userInputStarted = false;
var cbOpen = false; // tracks whether Cost Breakdown panel is open across re-renders
var resultsStale = false; // tracks if inputs changed since last calculation

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
  const meth = document.getElementById('i-meth')?.value || '';

  return (
    geoInc === DEFAULTS.geoInc &&
    geoOp === DEFAULTS.geoOp &&
    stage === DEFAULTS.stage &&
    sh === DEFAULTS.sh &&
    oh === DEFAULTS.oh &&
    gr === DEFAULTS.gr &&
    meth === DEFAULTS.meth
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

  // Validate valuation fields if toggle is checked
  const valuationCheckbox = document.getElementById('i-valuation');
  if (valuationCheckbox?.checked) {
    const valFrequency = getValuationFrequency();
    const valType = getValuationType();
    if (!valFrequency) errors.val_frequency = 'Select frequency';
    if (!valType) errors.val_type = 'Select report type';
  }

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

// ==================== RESULTS STATE MANAGEMENT ====================

function setResultsStale(isStale) {
  resultsStale = isStale;
  const banner = document.getElementById('results-outdated-banner');
  const rBody = document.getElementById('r-body');
  if (isStale) {
    if (banner) banner.style.display = 'block';
    if (rBody) {
      rBody.style.filter = 'blur(2px)';
      rBody.style.opacity = '0.55';
      rBody.style.pointerEvents = 'none';
    }
  } else {
    if (banner) banner.style.display = 'none';
    if (rBody) {
      rBody.style.filter = 'none';
      rBody.style.opacity = '1';
      rBody.style.pointerEvents = 'auto';
    }
  }
}

// ==================== NAVIGATION FUNCTIONS ====================

function goInput() {
  flow = 'input';
  userInputStarted = false;
  initialMethod = document.getElementById('i-meth').value;
  document.getElementById('res-status').style.display = 'block';
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
  document.getElementById('res-status').style.display = 'none';
  document.getElementById('input-state').classList.add('hidden');
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
    const meth = document.getElementById('i-meth').value;
    return meth; // Administrative method required
  }
  return true;
}

function updateStepVisibility() {
  // Single-page form: show all sections, never dim any
  document.querySelectorAll('#input-state .sec').forEach((sec) => {
    sec.classList.add('active');
    sec.classList.remove('hidden');
    sec.classList.remove('dim');
  });

  // Always show the Calculate button
  const calculateBtnWrap = document.getElementById('calculate-btn-wrap');
  if (calculateBtnWrap) calculateBtnWrap.style.display = 'block';
  validateAndUpdateButtonState();
}

function stepNext() {
  if (!validateStep(currentStep)) return;
  saveStepState();
  if (currentStep < 3) {
    currentStep++;
    updateStepVisibility();
    loadStepState();
    // Don't auto-calculate - user must click Calculate button
  }
}

function stepBack() {
  if (currentStep > 1) {
    saveStepState();
    currentStep--;
    updateStepVisibility();
    loadStepState();
    // Clear results when going back to edit inputs
    document.getElementById('r-body').innerHTML = `
      <div style="padding: 40px 20px; text-align: center; color: var(--t3);">
        <div style="font-size: var(--fs-label); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--t2);">Ready to calculate?</div>
        <div style="font-size: var(--fs-sm); line-height: 1.6;">Fill in all required fields and click the <strong>Calculate ROI</strong> button at the bottom to see your custom estimate.</div>
      </div>
    `;
    document.getElementById('mobile-summary').style.display = 'none';
  }
}

// ==================== FILE UPLOAD ====================

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
  validateAndUpdateButtonState();

  // Check fundraising validation
  const fundraiseCheckbox = document.getElementById('i-fundraise');
  const newShInput = document.getElementById('i-new-sh');
  const warning = document.getElementById('new-sh-warning');

  if (fundraiseCheckbox && fundraiseCheckbox.checked) {
    if (newShInput && warning) {
      const value = parseInt(newShInput.value || 0);
      if (value === 0) {
        warning.style.display = 'block';
      } else {
        warning.style.display = 'none';
      }
    }
    // Update the calculation note when inputs change
    updateFundraiseNote();
  }
}

function validateAndUpdateButtonState() {
  const calculateBtn = document.getElementById('calculate-btn');
  if (!calculateBtn) return;

  const validation = validateInputs();
  calculateBtn.disabled = !validation.valid;
}

function onCalculateClick() {
  const validation = validateInputs();
  if (!validation.valid) {
    validateAndDisplayErrors();
    return;
  }

  // Calculate and display results
  doCalc();
  setResultsStale(false); // Clear the stale state
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
  setResultsStale(true);
  lc();
}

function onFundraisingChange() {
  const checkbox = document.getElementById('i-fundraise');
  const details = document.getElementById('fundraise-details');
  const status = document.getElementById('fundraise-status');
  const note = document.getElementById('fundraise-calc-note');
  const newShInput = document.getElementById('i-new-sh');

  if (checkbox.checked) {
    if (details) details.style.display = 'block';
    if (status) status.textContent = 'YES';
    if (note) note.style.display = 'block';
    updateFundraiseNote();
  } else {
    if (details) details.style.display = 'none';
    if (status) status.textContent = 'NO';
    if (note) note.style.display = 'none';
    // Reset fields
    document.querySelectorAll('input[name="fundraise-round"]').forEach(r => r.checked = false);
    document.querySelectorAll('input[name="fundraise-timing"]').forEach(t => t.checked = false);
    if (newShInput) newShInput.value = '0';
  }

  setResultsStale(true);
  lc();
}

function getFundraiseRound() {
  return document.querySelector('input[name="fundraise-round"]:checked')?.value || null;
}

function getFundraiseTiming() {
  return document.querySelector('input[name="fundraise-timing"]:checked')?.value || null;
}

function getFundraiseNewShareholders() {
  return parseInt(document.getElementById('i-new-sh')?.value || 0) || 0;
}

function updateFundraiseNote() {
  const note = document.getElementById('fundraise-calc-note');
  const content = document.getElementById('fundraise-note-content');
  if (!note || !content) return;

  const newSh = getFundraiseNewShareholders();
  const timing = getFundraiseTiming();

  if (newSh > 0 && timing) {
    content.textContent = `+${newSh} stakeholders onboarded over ~${timing} months.`;
  } else if (newSh > 0) {
    content.textContent = `+${newSh} stakeholders.`;
  } else {
    content.textContent = `+0 stakeholders.`;
  }
}

function onValuationChange() {
  const checkbox = document.getElementById('i-valuation');
  const details = document.getElementById('valuation-details');
  const status = document.getElementById('valuation-status');
  const card = document.getElementById('valuation-card');

  if (checkbox.checked) {
    if (details) details.style.display = 'block';
    if (status) status.textContent = 'YES';
    if (card) card.classList.add('expanded');
  } else {
    if (details) details.style.display = 'none';
    if (status) status.textContent = 'NO';
    if (card) card.classList.remove('expanded');
    // Reset fields
    const freqSelect = document.getElementById('i-val-frequency');
    const typeSelect = document.getElementById('i-val-type');
    if (freqSelect) freqSelect.value = '';
    if (typeSelect) typeSelect.value = '';
    const impact = document.getElementById('valuation-impact');
    if (impact) impact.style.display = 'none';
  }

  setResultsStale(true);
  lc();
}

function getValuationFrequency() {
  return document.getElementById('i-val-frequency')?.value || '';
}

function getValuationType() {
  return document.getElementById('i-val-type')?.value || '';
}

function updateValuationNote() {
  const frequency = getValuationFrequency();
  const typeSelect = document.getElementById('i-val-type');
  const typeLabel = typeSelect ? typeSelect.options[typeSelect.selectedIndex]?.text || '' : '';
  const impact = document.getElementById('valuation-impact');
  const impactText = document.getElementById('valuation-impact-text');

  if (!frequency || !typeLabel) {
    if (impact) impact.style.display = 'none';
    return;
  }

  const n = frequency === 'quarterly' ? 4 : 1;
  if (impactText) {
    impactText.textContent = `Estimate will include ${n} valuation event(s)/yr (${typeLabel}).`;
  }
  if (impact) impact.style.display = 'block';
}

function rebuildValuationTypeOptions() {
  const geoIncSelect = document.getElementById('i-geo-inc');
  const typeSelect = document.getElementById('i-val-type');
  const geoTag = document.getElementById('valuation-geo-tag');
  const helperText = document.getElementById('val-helper-text');
  const wrapper = typeSelect?.parentElement;

  if (!typeSelect || !wrapper) return;

  // All valuation types are always visible (not country-gated)
  const options = VALUATION_TYPES;

  // Clear existing options from native select
  typeSelect.innerHTML = '<option value="">Select report type...</option>';

  // Clear existing options from custom dropdown list
  const dropdown = wrapper.querySelector('.select-dropdown');
  if (dropdown) {
    dropdown.innerHTML = '';
  }

  // Add new options to both native select and custom dropdown
  options.forEach(opt => {
    const optionEl = document.createElement('option');
    optionEl.value = opt.name;
    optionEl.textContent = opt.name;
    typeSelect.appendChild(optionEl);

    if (dropdown) {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('data-value', opt.name);
      li.innerHTML = `${opt.name}<span class="option-sub">${opt.sub}</span>`;
      dropdown.appendChild(li);
    }
  });

  // If only one option, pre-select it
  if (options.length === 1) {
    typeSelect.value = options[0].name;
    if (helperText) {
      helperText.textContent = `Standard report type for ${geoInc.toUpperCase()} — pre-selected. Tap to confirm.`;
      helperText.style.display = 'block';
    }
  } else {
    typeSelect.value = '';
    if (helperText) helperText.style.display = 'none';
  }

  // Update geo tag
  if (geoTag) {
    geoTag.textContent = geoInc.toUpperCase();
  }

  // Reinitialize SelectField to pick up new options
  const display = wrapper.querySelector('.select-display');
  if (display && dropdown && typeSelect._selectField) {
    // Update the SelectField instance's cached references
    typeSelect._selectField.options = wrapper.querySelectorAll('[role="option"]');

    // Re-attach event listeners to new options
    typeSelect._selectField.options.forEach((option) => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        typeSelect.value = option.dataset.value;
        typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      });

      option.addEventListener('mouseenter', () => {
        typeSelect._selectField.options.forEach((o) => o.setAttribute('aria-selected', 'false'));
        option.setAttribute('aria-selected', 'true');
      });
    });

    // Update display
    typeSelect._selectField.updateDisplay();
  }

  updateValuationNote();
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
  var meth = document.getElementById('i-meth').value;

  var valid = shEl.value && ohEl.value && grEl.value && stage;

  if (flow === 'input') {
    var hasUserInput =
      sh !== 30 ||
      oh !== 15 ||
      gr !== 10 ||
      geo_inc !== 'india' ||
      geo_op !== 'india' ||
      meth !== initialMethod;
    userInputStarted = userInputStarted || hasUserInput;
  }

  const validationResult = validateInputs();
  displayFieldErrors(validationResult);

  if (flow === 'input' && (!valid || !validationResult.valid)) {
    document.getElementById('res-status').style.display = 'none';
    document.getElementById('r-body').innerHTML =
      '<div style="padding:40px 0;text-align:center;color:var(--t2)">Fill in all required fields (*) to see estimate.</div>';
    document.getElementById('mobile-summary').style.display = 'none';
    return;
  }

  // Tool cost no longer used (existing-tool method removed)
  const toolCost = 0;

  // Get fundraising parameters
  const planningToFundraise = document.getElementById('i-fundraise')?.checked || false;
  const fundraiseRound = getFundraiseRound();
  const newShareholdersFromFundraise = getFundraiseNewShareholders();

  // Determine stage: use fundraise round as stage unless SAFE/Bridge (then use current stage)
  let calculationStage = stage;
  if (planningToFundraise && fundraiseRound && fundraiseRound !== 'safe' && fundraiseRound !== 'bridge') {
    calculationStage = fundraiseRound;
  }

  // Get valuation parameters
  const valuationFrequency = getValuationFrequency();
  const valuationType = getValuationType();
  let valuationCostMarket = 0;
  let valuationCostEl = 0;
  if (valuationType) {
    // All valuation types always available (no country gating)
    const selected = VALUATION_TYPES.find(t => t.name === valuationType);
    if (selected) {
      valuationCostMarket = selected.cost;
      valuationCostEl = selected.elCost;
    }
  }

  // Call pure ROI calculation function
  const roiData = computeROI(
    { sh, oh, gr, stage: calculationStage, geo_inc, geo_op, meth, toolCost, planningToFundraise, fundraiseRound, newShareholdersFromFundraise, valuationFrequency, valuationType, valuationCostMarket, valuationCostEl },
    RATES,
    COMPLIANCE,
    EXT,
    PRICING,
    STAGE_HOURLY_RATES,
    STAGE_RETAINER,
    STAFFING_MATRIX,
    SECRETARIAL_WORKFLOWS_BY_GEO,
    FUNDRAISING_WORKFLOWS,
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
  } else {
    state = 'BREAKEVEN';
  }

  // Build message parts separately (no nested templates)
  let msgPart1 = '';
  let ctaText = '';
  let ctaUrl = '';

  if (state === 'POSITIVE_SAVINGS') {
    msgPart1 = 'You\'re currently overspending on equity operations. You could save ' + savingsFormatted + '/year while eliminating most manual work. EquityList ensures your cap table stays accurate, audit-ready, and compliant as you scale.';
    ctaText = 'Book a demo →';
    ctaUrl = 'https://www.equitylist.co/contact';
  } else if (state === 'NEGATIVE_SAVINGS_INHOUSE_OUTSOURCED') {
    msgPart1 = 'Your current setup is cost-efficient — for now. At your scale, manual or outsourced workflows are still manageable. However, these processes rely heavily on manual effort — increasing the risk of errors, delays, and compliance gaps as your company grows.';
    ctaText = 'Notify me when it\'s time to switch →';
    ctaUrl = 'https://www.equitylist.co/newsletter';
  } else {
    msgPart1 = 'Cost isn\'t the deciding factor here. Your current setup and EquityList are comparable in cost at your scale. The real difference is how reliably your equity operations are managed as complexity increases.';
    ctaText = 'Explore how it works →';
    ctaUrl = 'https://www.equitylist.co/contact';
  }

  // Assemble final message
  const fullMessage = msgPart1;

  // Calculate cap table hours manually (same formula as roi-calculator.js)
  const ctRaw = (3 + Math.max(0, (sh - 20) / 50) * 2) * 12;
  const ctHrs = ctRaw * roiData.mult;

  // Calculate breakdown for explanations
  const ctMonthlyBase = 3;
  const ctMonthlyScaling = Math.max(0, (sh - 20) / 50) * 2;
  const ctMonthlyTotal = ctMonthlyBase + ctMonthlyScaling;

  // Calculate secretarial hours (based on workflows and shareholder scaling)
  const secHrs = roiData.secRaw * roiData.mult;

  // Calculate hours for each component
  const grHrs = roiData.grHr * gr;
  const compHrs = roiData.compHr;
  const capTableHrs = ctRaw;
  const secretarialHrs = roiData.secRaw;
  const totalEquityMgmtHrs = grHrs + compHrs + capTableHrs + secretarialHrs;

  // Calculate cost breakdown percentages
  const grantAdminPct = roiData.annCost > 0 ? Math.round((roiData.grCost / roiData.annCost) * 100) : 0;
  const compliancePct = roiData.annCost > 0 ? Math.round((roiData.cpCost / roiData.annCost) * 100) : 0;
  const capTablePct = roiData.annCost > 0 ? Math.round((roiData.ctCost / roiData.annCost) * 100) : 0;
  const capTableFundraisingPct = roiData.annCost > 0 ? Math.round((roiData.ctFundraisingCost / roiData.annCost) * 100) : 0;
  const secretarialPct = roiData.annCost > 0 ? Math.round((roiData.secCost / roiData.annCost) * 100) : 0;
  const secretarialFundraisingPct = roiData.annCost > 0 ? Math.round((roiData.secFundraisingCost / roiData.annCost) * 100) : 0;
  const externalPct = roiData.annCost > 0 ? Math.round((roiData.methodExtCost / roiData.annCost) * 100) : 0;
  const valuationPct = roiData.annCost > 0 ? Math.round((roiData.valuationCost / roiData.annCost) * 100) : 0;

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
          <div class="cb-info-tooltip-wrapper">
            <span class="cb-info-btn">ℹ</span>
            <div class="cb-tooltip">Baseline hours for your country of incorporation. Covers statutory registers, tax reporting, and grant compliance tracking.</div>
          </div>
        </div>
        <div class="cb-detail-formula">${roiData.compHr} hrs/yr (${(roiData.compHr / 12).toFixed(0)}h/mo, ${geo_inc.toUpperCase()} statutory baseline) × ${roiData.mult} × ${sym}${roiData.rate}/hr</div>
        <div class="cb-detail-value">${sym}${fN(roiData.cpCost)} <span class="cb-detail-pct">${compliancePct}%</span></div>
      </div>
      <div class="cb-detail-item">
        <div class="cb-detail-label">
          Cap Table (Base)
          <div class="cb-info-tooltip-wrapper">
            <span class="cb-info-btn">ℹ</span>
            <div class="cb-tooltip">
              <div style="font-size:11px;line-height:1.5">
                <strong>This cost includes:</strong> Monthly reconciliation, updates, and stakeholder communications.<br><br>
                <strong>Calculation:</strong><br>
                Base: 3h/mo + scaling<br>
                Scaling: (${sh} shareholders − 20) ÷ 50 × 2h/mo = ${Math.max(0, (sh - 20) / 50).toFixed(2)}h/mo<br>
                Monthly total: ${ctMonthlyTotal.toFixed(1)}h/mo<br>
                Annual: ${ctMonthlyTotal.toFixed(1)} × 12 = ${Math.round(ctRaw)} hrs
              </div>
            </div>
          </div>
        </div>
        <div class="cb-detail-formula">${Math.round(ctMonthlyBase)}h/mo base + ${Math.max(0, (sh - 20) / 50).toFixed(2)}h/mo scaling = ${ctMonthlyTotal.toFixed(1)}h/mo × 12 = ${Math.round(ctRaw)} hrs/yr × ${roiData.mult} × ${sym}${roiData.rate}/hr</div>
        <div class="cb-detail-value">${sym}${fN(roiData.ctCost)} <span class="cb-detail-pct">${capTablePct}%</span></div>
      </div>
      ${roiData.ctFundraisingCost > 0 ? `
      <div class="cb-detail-item">
        <div class="cb-detail-label">Cap Table (Fundraising)</div>
        <div class="cb-detail-formula">${roiData.ctFundraisingWorkflows} workflow(s) × 2.5h × 12 months = ${Math.round(roiData.ctFundraisingWorkflows * 2.5 * 12)} hrs/yr × ${roiData.mult} × ${sym}${roiData.rate}/hr</div>
        <div class="cb-detail-value">${sym}${fN(roiData.ctFundraisingCost)} <span class="cb-detail-pct">${capTableFundraisingPct}%</span></div>
      </div>
      ` : ''}
      <div class="cb-detail-item">
        <div class="cb-detail-label">
          Secretarial & Board Operations (Base)
          <div class="cb-info-tooltip-wrapper">
            <span class="cb-info-btn">ℹ</span>
            <div class="cb-tooltip">
              <div style="font-size:11px;line-height:1.5">
                <strong>This cost includes:</strong> Board meetings, shareholder approvals, and governance workflows.<br><br>
                <strong>Calculation:</strong><br>
                Base workflows: ${roiData.baseWorkflows}/yr<br>
                × 2.5 hrs/workflow = ${(roiData.baseWorkflows * 2.5).toFixed(0)} hrs<br>
                × ${roiData.shareholderScaling.toFixed(2)} (shareholder scaling)<br>
                = ${Math.round(roiData.secRaw)} hrs/yr
              </div>
            </div>
          </div>
        </div>
        <div class="cb-detail-formula">${roiData.baseWorkflows} workflows/yr × 2.5 hrs/workflow × ${roiData.shareholderScaling.toFixed(2)} (shareholder scaling) = ${Math.round(roiData.secRaw)} hrs/yr × ${roiData.mult} × ${sym}${roiData.secRate}/hr</div>
        <div class="cb-detail-value">${sym}${fN(roiData.secCost)} <span class="cb-detail-pct">${secretarialPct}%</span></div>
      </div>
      ${roiData.secFundraisingCost > 0 ? `
      <div class="cb-detail-item">
        <div class="cb-detail-label">Secretarial & Board Operations (Fundraising)</div>
        <div class="cb-detail-formula">${roiData.secFundraisingWorkflows} workflow(s) × 2.5 hrs/workflow = ${Math.round(roiData.secFundraisingWorkflows * 2.5)} hrs × (shareholder scaling + new shareholders) = fundraising overhead × ${roiData.mult} × ${sym}${roiData.secRate}/hr</div>
        <div class="cb-detail-value">${sym}${fN(roiData.secFundraisingCost)} <span class="cb-detail-pct">${secretarialFundraisingPct}%</span></div>
      </div>
      ` : ''}
      ${roiData.methodExtCost > 0 ? `
      <div class="cb-detail-item">
        <div class="cb-detail-label">External Service</div>
        <div class="cb-detail-formula">Fixed annual cost</div>
        <div class="cb-detail-value">${sym}${fN(roiData.methodExtCost)} <span class="cb-detail-pct">${externalPct}%</span></div>
      </div>
      ` : ''}
      ${roiData.valuationCost > 0 ? `
      <div class="cb-detail-item">
        <div class="cb-detail-label">Valuation Reports</div>
        <div class="cb-detail-formula">${valuationFrequency === 'quarterly' ? '4 events/yr' : '1 event/yr'}</div>
        <div class="cb-detail-value">${sym}${fN(roiData.valuationCost)} <span class="cb-detail-pct">${valuationPct}%</span></div>
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
          <div class="cb-assumption-row">
            <span class="cb-assumption-label">Blended Hourly Rate</span>
            <div class="cb-assumption-input-wrap">
              <span style="font-size:var(--fs-table);font-variant-numeric:tabular-nums;font-family:var(--mono);font-weight:500">${sym}</span><input type="number" id="cb-rate-input" class="cb-input" value="${roiData.rate}">
              <span class="cb-source">${roiData.stage.charAt(0).toUpperCase() + roiData.stage.slice(1)} Staffing Mix</span>
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
    <div id="cta-container"></div>
  `;

  // Build CTA button safely using DOM methods (not innerHTML)
  const ctaContainer = document.getElementById('cta-container');
  const ctaWrapper = document.createElement('div');
  ctaWrapper.style.cssText = 'background:rgba(95,23,234,0.08);border:1px solid rgba(95,23,234,0.2);padding:16px;border-radius:6px;margin-bottom:16px';

  const ctaMessage = document.createElement('div');
  ctaMessage.style.cssText = 'font-size:12px;color:var(--t2);line-height:1.5';
  ctaMessage.textContent = fullMessage;
  ctaWrapper.appendChild(ctaMessage);

  const ctaButton = document.createElement('button');
  ctaButton.className = 'btn btn-p';
  ctaButton.style.cssText = 'width:100%;text-align:center;cursor:pointer;border:none;margin-top:12px';
  ctaButton.textContent = ctaText;
  ctaButton.addEventListener('click', () => {
    window.open(ctaUrl, '_blank');
  });
  ctaWrapper.appendChild(ctaButton);

  ctaContainer.appendChild(ctaWrapper);

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
// Section dimming removed — all sections are always fully visible.

// ==================== INITIALIZATION ====================

window.addEventListener('DOMContentLoaded', () => {
  // Initialize theme from localStorage
  initTheme();

  // Start with form visible
  document.getElementById('input-state').classList.remove('hidden');
  document.getElementById('res-status').style.display = 'block';
  const backHomeBtn = document.querySelector('.back-home-btn');
  if (backHomeBtn) backHomeBtn.style.display = 'none';

  // Initialize custom select components
  setTimeout(() => {
    document.querySelectorAll('.custom-select').forEach((selectElement) => {
      const instance = new SelectField(selectElement);
      // Store reference on select element for later access
      selectElement._selectField = instance;
    });

    // Initialize valuation report type options based on current geo_inc
    rebuildValuationTypeOptions();

    // Add listener for geo_inc changes to rebuild valuation options
    const geoIncSelect = document.getElementById('i-geo-inc');
    if (geoIncSelect) {
      geoIncSelect.addEventListener('change', rebuildValuationTypeOptions);
    }
  }, 0);

  // Initialize stepper
  currentStep = 1;
  formStateData = {};
  updateStepVisibility();
  loadStepState();

  // Calculate with default values on load
  initialMethod = document.getElementById('i-meth').value;
  doCalc();

  // Add field change detection: validate, clamp negatives, mark results stale
  document.querySelectorAll('#input-state input, #input-state select').forEach((field) => {
    const handleChange = () => {
      if (field.type === 'number' && field.value !== '' && parseFloat(field.value) < 0) {
        field.value = '0';
      }
      // Show/clear per-field errors immediately on change
      displayFieldErrors(validateInputs());
      setResultsStale(true);
    };
    field.addEventListener('change', handleChange);
    field.addEventListener('input', handleChange);
  });

});

// ==================== GLOBAL FUNCTION EXPORTS ====================
// These functions need to be globally accessible for inline event handlers

window.track = track;
window.goInput = goInput;
window.goOverview = goOverview;
window.val = val;
window.valAndEnableNext = valAndEnableNext;
window.lc = lc;
window.validateAndUpdateButtonState = validateAndUpdateButtonState;
window.onCalculateClick = onCalculateClick;
window.resetO = resetO;
window.validateAndDisplayErrors = validateAndDisplayErrors;
window.onMethChange = onMethChange;
window.onFundraisingChange = onFundraisingChange;
window.getFundraiseRound = getFundraiseRound;
window.getFundraiseTiming = getFundraiseTiming;
window.getFundraiseNewShareholders = getFundraiseNewShareholders;
window.updateFundraiseNote = updateFundraiseNote;
window.onValuationChange = onValuationChange;
window.getValuationFrequency = getValuationFrequency;
window.getValuationType = getValuationType;
window.updateValuationNote = updateValuationNote;
window.rebuildValuationTypeOptions = rebuildValuationTypeOptions;
window.VALUATION_TYPES = VALUATION_TYPES;
window.onRateChange = onRateChange;
window.onCompHrChange = onCompHrChange;
window.onTotalMgmtHoursChange = onTotalMgmtHoursChange;
window.toggleCostBreakdown = toggleCostBreakdown;
window.applyAssumptions = applyAssumptions;
window.doCalc = doCalc;
window.stepNext = stepNext;
window.stepBack = stepBack;
window.toggleTheme = toggleTheme;
window.setResultsStale = setResultsStale;
