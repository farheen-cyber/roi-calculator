import { CUR, RATES, RATES_META, COMPLIANCE, EXT, FX } from './data.js';
import { computeROI } from './roi-calculator.js';
import { SelectField } from './SelectField.js';

// Global state
var flow = 'overview';
var calcDone = false;
var updateTimer = null;
var overrides = { rate: null, grHr: null, compHr: null };
var initialMethod = null;
var userInputStarted = false;

// Stepper state
var currentStep = 1;
var formStateData = {};

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
  const sh = parseInt(document.getElementById('i-sh').value) || 0;
  const oh = parseInt(document.getElementById('i-oh').value) || 0;
  const gr = parseInt(document.getElementById('i-gr').value) || 0;

  const errors = {};

  // Validate ranges per PRD
  if (sh < 1 || sh > 1000) errors.sh = 'Shareholders: 1–1,000';
  if (oh < 1 || oh > 2000) errors.oh = 'Option Holders: 1–2,000';
  if (gr < 1 || gr > 500) errors.gr = 'Equity Grants: 1–500';

  return { valid: Object.keys(errors).length === 0, errors };
}

function displayFieldErrors(validationResult) {
  const fieldMap = { sh: 'i-sh', oh: 'i-oh', gr: 'i-gr' };

  Object.entries(fieldMap).forEach(([key, fieldId]) => {
    const el = document.getElementById(fieldId);
    const fi = el.parentElement;
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
  doCalc();
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
    return geoInc && geoOp; // Both countries required
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
  document.getElementById('btn-back').disabled = currentStep === 1;
  document.getElementById('btn-next').disabled = !validateStep(currentStep);
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

function lc() {
  if (updateTimer) clearTimeout(updateTimer);
  updateTimer = setTimeout(doCalc, 100);
}

function toggleE(id, start) {
  var el = document.getElementById(id);
  el.classList.add('editing');
  el.innerHTML = `<input type="number" class="edit-in" id="in-${id}" value="${start}" onblur="saveE('${id}')" onkeydown="if(event.key==='Enter')this.blur()">`;
  document.getElementById(`in-${id}`).focus();
}

function saveE(id) {
  var v = parseFloat(document.getElementById(`in-${id}`).value);
  if (id === 'e-rate') overrides.rate = v;
  if (id === 'e-grhr') overrides.grHr = v;
  if (id === 'e-comphr') overrides.compHr = v;
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
  var shEl = document.getElementById('i-sh');
  var ohEl = document.getElementById('i-oh');
  var grEl = document.getElementById('i-gr');
  var sh = parseInt(shEl.value) || 0;
  var oh = parseInt(ohEl.value) || 0;
  var gr = parseInt(grEl.value) || 0;
  var per = document.getElementById('i-per').value;
  var meth = document.getElementById('i-meth').value;

  var valid = shEl.value && ohEl.value && grEl.value;
  var indicator = document.getElementById('live-indicator');

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

  if (flow === 'input' && userInputStarted) {
    indicator.style.display = 'inline-block';
    indicator.style.background = valid ? '#22c55e' : '#ef4444';
  } else {
    indicator.style.display = 'none';
  }

  const validationResult = validateInputs();
  displayFieldErrors(validationResult);

  if (flow === 'input' && (!valid || !validationResult.valid)) {
    const errorMsg = !validationResult.valid ? 'Invalid input - check field errors above' : 'Complete all fields to calculate';
    document.getElementById('res-status').innerText = errorMsg;
    document.getElementById('res-status').style.display = 'block';
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
    { sh, oh, gr, geo_inc, geo_op, per, meth, toolCost },
    RATES,
    COMPLIANCE,
    EXT,
    FX,
    overrides
  );

  const sym = CUR[geo_op];

  // Update status
  document.getElementById('res-status').innerText = 'Based on your inputs';
  document.getElementById('res-status').style.display = flow === 'input' ? 'block' : 'none';

  // Render cost comparison table
  const savings = roiData.annCost - roiData.elAnn;
  const savingsColor = savings > 0 ? 'var(--ok)' : 'var(--red)';
  document.getElementById('cost-you').textContent = sym + fN(roiData.annCost);
  document.getElementById('cost-el').textContent = sym + fN(roiData.elAnn);
  document.getElementById('cost-savings').textContent = sym + fN(Math.abs(savings));
  document.getElementById('cost-savings').style.color = savingsColor;

  var ctaHtml = '';
  if (roiData.isSpend) {
    // EL is cheaper
    ctaHtml = `<button onclick="window.open('https://www.equitylist.co/contact', '_blank')" class="btn btn-p" style="width:100%;text-align:center;cursor:pointer;border:none">📅 Book a demo →</button>`;
  } else {
    // EL is more expensive or break-even
    ctaHtml = `
      <div style="background:rgba(95,23,234,0.08);border:1px solid rgba(95,23,234,0.2);padding:16px;border-radius:6px;margin-top:24px">
        <div style="font-size:12px;color:var(--t2);line-height:1.5;margin-bottom:12px">
          <strong>At your stage, manual processes are manageable.</strong> But as you scale, spreadsheets become error-prone and time-consuming:
          <ul style="margin:8px 0 0 16px;color:var(--t3);font-size:11px">
            <li>Missed vesting calculations & compliance deadlines</li>
            <li>Hours wasted on grant drafting and reconciliation</li>
            <li>Cap table inconsistencies across stakeholders</li>
          </ul>
        </div>
        <div style="font-size:11px;color:var(--t3)">We'll reach out around 25 stakeholders when automation becomes critical.</div>
      </div>
      <button onclick="window.open('https://www.equitylist.co/newsletter', '_blank')" class="btn btn-p" style="width:100%;text-align:center;cursor:pointer;border:none;margin-top:16px">📧 Notify me when to switch →</button>
    `;
  }

  document.getElementById('r-body').innerHTML = `
    <div class="hero-metric"><div class="hm-label">Your Current Annual Spend</div><div class="hm-val">${sym}${fN(roiData.annCost)}</div></div>
    <div class="r-group"><div class="r-group-h">Efficiency</div><div class="r-row"><span>Internal Effort</span><span class="r-val">${Math.round(roiData.internalHTotal)} hrs/yr</span></div><div class="r-row"><span>Time Saved</span><span class="r-val green">~${roiData.timeSavedPct}%</span></div></div>
    <div style="font-size:11px;color:var(--t3);margin:24px 0;padding:16px;background:rgba(95,23,234,0.05);border-left:2px solid var(--accent);line-height:1.6">
      <strong>EquityList pricing is directional</strong> based on ${roiData.tierLabel} hourly rates. Actual pricing tailored to your company size and use case.
    </div>
    ${ctaHtml}
  `;

  // Show/hide audit log link
  document.getElementById('audit-log-link').style.display = flow === 'input' ? 'inline' : 'none';

  // Render audit log / assumptions
  document.getElementById('assumptions-view').innerHTML = `
    <div class="ap-pane">
      <div class="ap-hdr"><span class="ap-title">ROI Audit Log</span><span class="ap-close" onclick="closeAssumptions()">DONE [X]</span></div>
      <div class="ap-grid-3">
        <div class="ap-col"><div class="ap-sec-h">Your Profile</div><div class="ap-text"><b>Inc:</b> ${geo_inc.toUpperCase()}<br><b>Op:</b> ${geo_op.toUpperCase()}<br><b>Method:</b> ${meth}</div></div>
        <div class="ap-col"><div class="ap-sec-h">Compliance</div><div class="ap-text">Manual baseline: <span class="editable" id="e-comphr" onclick="toggleE('e-comphr', ${roiData.compHr})">${roiData.compHr}h/yr</span></div></div>
        <div class="ap-col"><div class="ap-sec-h">Scope</div><div class="ap-text">Statutory registers, tax reporting, and grant drafting.</div></div>
      </div>
      <div><div class="ap-sec-h">Calculations</div><div class="ap-formula">
Manual baseline = ${(roiData.manualHTotal / 12).toFixed(1)} hrs/mo
Hourly Rate = ${sym}<span class="editable" id="e-rate" onclick="toggleE('e-rate', ${roiData.rate})">${roiData.rate}</span>/hr [PayScale ${roiData.tierLabel}]
EquityList = ${sym}${fN(roiData.stakeholders * 1200 * FX[geo_op])} platform + ${sym}${fN(roiData.elOverhead)} oversight
      </div></div>
      <table class="ap-tbl"><thead><tr><th>Persona</th><th>10th %</th><th>Median</th><th>90th %</th><th>Source</th></tr></thead><tbody>
        ${['founder', 'finance', 'hr', 'cs']
          .map((p) => {
            var r = RATES[geo_op][p];
            return `<tr class="${p === per ? 'active' : ''}"><td>${p.toUpperCase()}</td><td>${sym}${r.p10}</td><td>${sym}${r.p50}</td><td>${sym}${r.p90}</td><td style="font-size:9px">${RATES_META[geo_op][p].src}</td></tr>`;
          })
          .join('')}
      </tbody></table>
    </div>
  `;

  // Update mobile summary
  document.getElementById('mob-spend').innerText = sym + fN(roiData.annCost);
  document.getElementById('mob-roi').innerText = roiData.roi + 'x';
  const shouldShowMobileSummary = flow === 'input' && window.innerWidth <= 1024;
  document.getElementById('mobile-summary').style.display = shouldShowMobileSummary ? 'block' : 'none';
}

// ==================== MODAL FUNCTIONS ====================

function openAssumptions() {
  document.getElementById('results-view').classList.add('hidden');
  document.getElementById('assumptions-view').classList.remove('hidden');
  document.getElementById('audit-log-link').style.display = 'none';
  document.getElementById('mobile-summary').style.display = 'none';
}

function closeAssumptions() {
  document.getElementById('assumptions-view').classList.add('hidden');
  document.getElementById('results-view').classList.remove('hidden');
  document.getElementById('audit-log-link').style.display = 'inline';
  const shouldShowMobileSummary = flow === 'input' && window.innerWidth <= 1024;
  document.getElementById('mobile-summary').style.display = shouldShowMobileSummary ? 'block' : 'none';
}

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

  document.body.classList.add('state-overview');

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

  // Keyboard support: Escape to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const assumptionsView = document.getElementById('assumptions-view');
      if (assumptionsView && !assumptionsView.classList.contains('hidden')) {
        closeAssumptions();
      }
    }
  });

  doCalc();

  // Fetch live FX rates
  fetch('https://open.er-api.com/v6/latest/INR')
    .then((r) => r.json())
    .then((d) => {
      if (d.rates) {
        FX.us = d.rates.USD;
        FX.singapore = d.rates.SGD;
        FX.uk = d.rates.GBP;
        doCalc();
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
window.toggleE = toggleE;
window.saveE = saveE;
window.resetO = resetO;
window.validateAndDisplayErrors = validateAndDisplayErrors;
window.onMethChange = onMethChange;
window.openAssumptions = openAssumptions;
window.closeAssumptions = closeAssumptions;
window.doCalc = doCalc;
window.stepNext = stepNext;
window.stepBack = stepBack;
window.toggleTheme = toggleTheme;
