/**
 * Direction A - Main App Logic
 * Handles form state, validation, calculation, and live estimate updates
 */

import { CUR, PRICING, STAGE_HOURLY_RATES, STAGE_RETAINER, STAFFING_MATRIX, SECRETARIAL_WORKFLOWS_BY_GEO, FUNDRAISING_WORKFLOWS, VALUATION_TYPES, COMPLIANCE } from './data.js';
import { computeROI } from './roi-calculator.js';
import {
  FormField, Dropdown, Switch, PrimaryBtn, GhostBtn, SectionHeader,
  Caption, StatCell, StatusChip, clearError, showError, formatCurrency
} from './components.js';
import { TOKENS } from './tokens.js';

const T = TOKENS;

// ========== STATE MANAGEMENT ==========

const state = {
  // Form inputs
  form: {
    geoInc: 'india',
    geoOp: 'india',
    stage: 'seriesab',
    method: 'in-house',
    shareholders: 30,
    optionHolders: 15,
    grants: 10,
    fundraising: false,
    fundraisingType: 'seed',
    fundraisingTiming: 'within-12-months',
    valuation: false,
    valuationType: '409A Valuation',
    valuationFrequency: 'annual',
  },

  // Calculation results
  results: null,
  isStale: false,
  usingDefaultValues: true,

  // UI state
  expandedSwitches: {
    fundraising: false,
    valuation: false,
  },
  formElements: {},
};

// ========== INITIALIZATION ==========

export function init() {
  loadFormState();
  renderForm();
  updateLiveEstimate();
  attachEventListeners();
}

// ========== FORM RENDERING ==========

function renderForm() {
  const formArea = document.getElementById('roi-form-area');
  if (!formArea) return;

  formArea.innerHTML = '';

  // Step 1: Company Basics
  const step1 = document.createElement('div');
  step1.className = 'form-section';
  step1.innerHTML = '<h2 class="form-section-title">Company Basics</h2>';

  const geoIncField = Dropdown('Country of Incorporation', 'field-geo-inc', [
    ['india', 'India'],
    ['us', 'United States'],
    ['singapore', 'Singapore'],
    ['uk', 'United Kingdom'],
  ]);
  step1.appendChild(geoIncField);
  state.formElements.geoInc = geoIncField;

  const geoOpField = Dropdown('Country of Operation', 'field-geo-op', [
    ['india', 'India'],
    ['us', 'United States'],
    ['singapore', 'Singapore'],
    ['uk', 'United Kingdom'],
  ]);
  step1.appendChild(geoOpField);
  state.formElements.geoOp = geoOpField;

  const stageField = Dropdown('Funding Stage', 'field-stage', [
    ['preseed', 'Pre-seed'],
    ['seed', 'Seed'],
    ['seriesab', 'Series A/B'],
    ['seriesbc', 'Series B/C'],
    ['seriesc', 'Series C+'],
  ]);
  step1.appendChild(stageField);
  state.formElements.stage = stageField;

  const methodField = Dropdown('How do you administer equity?', 'field-method', [
    ['in-house', 'In-house (Spreadsheets)'],
    ['outsourced', 'Outsourced (CA/Law Firm)'],
  ]);
  step1.appendChild(methodField);
  state.formElements.method = methodField;

  formArea.appendChild(step1);

  // Step 2: Equity Structure
  const step2 = document.createElement('div');
  step2.className = 'form-section';
  step2.innerHTML = '<h2 class="form-section-title">Equity Structure</h2>';

  const shField = FormField('Number of Shareholders', 'field-shareholders', 'number');
  step2.appendChild(shField);
  state.formElements.shareholders = shField;

  const ohField = FormField('Number of Option Holders', 'field-option-holders', 'number');
  step2.appendChild(ohField);
  state.formElements.optionHolders = ohField;

  const grField = FormField('Grants Per Year', 'field-grants', 'number');
  step2.appendChild(grField);
  state.formElements.grants = grField;

  formArea.appendChild(step2);

  // Step 3: Optional - Fundraising
  const step3 = document.createElement('div');
  step3.className = 'form-section';

  const fundraisingSwitchContainer = document.createElement('div');
  fundraisingSwitchContainer.style.cssText = `
    padding: 16px;
    border: 1px solid ${T.colors.gray200};
    border-radius: 8px;
    margin-bottom: 16px;
  `;

  const fundraisingSwitchHeader = document.createElement('div');
  fundraisingSwitchHeader.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid ${T.colors.gray200};
  `;

  const fundraisingSwitchLabel = document.createElement('div');
  fundraisingSwitchLabel.style.cssText = `
    font-size: 15px;
    font-weight: 600;
    color: ${T.colors.ink};
  `;
  fundraisingSwitchLabel.textContent = 'Planning a fundraising round?';

  const fundraisingToggle = document.createElement('input');
  fundraisingToggle.type = 'checkbox';
  fundraisingToggle.id = 'field-fundraising';
  fundraisingToggle.style.cssText = `
    width: 44px;
    height: 24px;
    cursor: pointer;
  `;

  fundraisingSwitchHeader.appendChild(fundraisingSwitchLabel);
  fundraisingSwitchHeader.appendChild(fundraisingToggle);
  fundraisingSwitchContainer.appendChild(fundraisingSwitchHeader);

  const fundraisingContent = document.createElement('div');
  fundraisingContent.id = 'fundraising-expanded';
  fundraisingContent.style.cssText = `
    max-height: 0;
    overflow: hidden;
    transition: max-height 250ms cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    gap: 16px;
  `;

  const fundraisingTypeField = Dropdown('Round Type', 'field-fundraising-type', [
    ['safe', 'SAFE'],
    ['bridge', 'Bridge'],
    ['seed', 'Seed'],
    ['seriesab', 'Series A/B'],
    ['seriesbc', 'Series B/C'],
  ]);
  fundraisingContent.appendChild(fundraisingTypeField);
  state.formElements.fundraisingType = fundraisingTypeField;

  const fundraisingTimingField = Dropdown('When?', 'field-fundraising-timing', [
    ['within-12-months', 'Within 12 months'],
    ['6-12-months', '6-12 months'],
    ['3-6-months', '3-6 months'],
    ['next-month', 'Next month'],
  ]);
  fundraisingContent.appendChild(fundraisingTimingField);
  state.formElements.fundraisingTiming = fundraisingTimingField;

  fundraisingSwitchContainer.appendChild(fundraisingContent);
  step3.appendChild(fundraisingSwitchContainer);

  // Step 4: Optional - Valuation
  const valuationSwitchContainer = document.createElement('div');
  valuationSwitchContainer.style.cssText = `
    padding: 16px;
    border: 1px solid ${T.colors.gray200};
    border-radius: 8px;
    margin-bottom: 16px;
  `;

  const valuationSwitchHeader = document.createElement('div');
  valuationSwitchHeader.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid ${T.colors.gray200};
  `;

  const valuationSwitchLabel = document.createElement('div');
  valuationSwitchLabel.style.cssText = `
    font-size: 15px;
    font-weight: 600;
    color: ${T.colors.ink};
  `;
  valuationSwitchLabel.textContent = 'Need valuation services?';

  const valuationToggle = document.createElement('input');
  valuationToggle.type = 'checkbox';
  valuationToggle.id = 'field-valuation';
  valuationToggle.style.cssText = `
    width: 44px;
    height: 24px;
    cursor: pointer;
  `;

  valuationSwitchHeader.appendChild(valuationSwitchLabel);
  valuationSwitchHeader.appendChild(valuationToggle);
  valuationSwitchContainer.appendChild(valuationSwitchHeader);

  const valuationContent = document.createElement('div');
  valuationContent.id = 'valuation-expanded';
  valuationContent.style.cssText = `
    max-height: 0;
    overflow: hidden;
    transition: max-height 250ms cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    gap: 16px;
  `;

  const valuationTypeField = Dropdown('Valuation Type', 'field-valuation-type',
    VALUATION_TYPES.map(v => [v.name, v.name])
  );
  valuationContent.appendChild(valuationTypeField);
  state.formElements.valuationType = valuationTypeField;

  const valuationFrequencyField = Dropdown('Frequency', 'field-valuation-frequency', [
    ['annual', 'Annual'],
    ['quarterly', 'Quarterly'],
  ]);
  valuationContent.appendChild(valuationFrequencyField);
  state.formElements.valuationFrequency = valuationFrequencyField;

  valuationSwitchContainer.appendChild(valuationContent);
  step3.appendChild(valuationSwitchContainer);

  formArea.appendChild(step3);

  // Action buttons
  const actions = document.createElement('div');
  actions.style.cssText = `
    display: flex;
    gap: 12px;
    margin-top: 32px;
  `;

  const calcBtn = PrimaryBtn('Calculate ROI');
  calcBtn.id = 'btn-calculate';
  actions.appendChild(calcBtn);

  const resetBtn = GhostBtn('Reset');
  resetBtn.id = 'btn-reset';
  actions.appendChild(resetBtn);

  formArea.appendChild(actions);

  // Set initial values
  setFormValues();

  // Setup toggle listeners
  fundraisingToggle.addEventListener('change', (e) => {
    state.form.fundraising = e.target.checked;
    const content = document.getElementById('fundraising-expanded');
    if (content) {
      content.style.maxHeight = e.target.checked ? '300px' : '0';
    }
  });

  valuationToggle.addEventListener('change', (e) => {
    state.form.valuation = e.target.checked;
    const content = document.getElementById('valuation-expanded');
    if (content) {
      content.style.maxHeight = e.target.checked ? '300px' : '0';
    }
  });

  // Setup button listeners
  document.getElementById('btn-calculate')?.addEventListener('click', () => {
    validateAndCalculate();
  });

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    resetForm();
  });
}

// ========== FORM VALUE MANAGEMENT ==========

function setFormValues() {
  if (state.formElements.geoInc?.selectEl) {
    state.formElements.geoInc.selectEl.value = state.form.geoInc;
  }
  if (state.formElements.geoOp?.selectEl) {
    state.formElements.geoOp.selectEl.value = state.form.geoOp;
  }
  if (state.formElements.stage?.selectEl) {
    state.formElements.stage.selectEl.value = state.form.stage;
  }
  if (state.formElements.method?.selectEl) {
    state.formElements.method.selectEl.value = state.form.method;
  }
  if (state.formElements.shareholders?.inputEl) {
    state.formElements.shareholders.inputEl.value = state.form.shareholders;
  }
  if (state.formElements.optionHolders?.inputEl) {
    state.formElements.optionHolders.inputEl.value = state.form.optionHolders;
  }
  if (state.formElements.grants?.inputEl) {
    state.formElements.grants.inputEl.value = state.form.grants;
  }

  const fundraisingToggle = document.getElementById('field-fundraising');
  if (fundraisingToggle) {
    fundraisingToggle.checked = state.form.fundraising;
  }

  const valuationToggle = document.getElementById('field-valuation');
  if (valuationToggle) {
    valuationToggle.checked = state.form.valuation;
  }
}

function readFormValues() {
  state.form.geoInc = state.formElements.geoInc?.selectEl?.value || 'india';
  state.form.geoOp = state.formElements.geoOp?.selectEl?.value || 'india';
  state.form.stage = state.formElements.stage?.selectEl?.value || 'seriesab';
  state.form.method = state.formElements.method?.selectEl?.value || 'in-house';
  state.form.shareholders = parseInt(state.formElements.shareholders?.inputEl?.value || 30);
  state.form.optionHolders = parseInt(state.formElements.optionHolders?.inputEl?.value || 15);
  state.form.grants = parseInt(state.formElements.grants?.inputEl?.value || 10);
  state.form.fundraising = document.getElementById('field-fundraising')?.checked || false;
  state.form.fundraisingType = state.formElements.fundraisingType?.selectEl?.value || 'seed';
  state.form.fundraisingTiming = state.formElements.fundraisingTiming?.selectEl?.value || 'within-12-months';
  state.form.valuation = document.getElementById('field-valuation')?.checked || false;
  state.form.valuationType = state.formElements.valuationType?.selectEl?.value || '409A Valuation';
  state.form.valuationFrequency = state.formElements.valuationFrequency?.selectEl?.value || 'annual';
}

function saveFormState() {
  const scope = 'roi-calc:v3:form';
  localStorage.setItem(scope, JSON.stringify(state.form));
  // Also save timestamp for future versioning
  localStorage.setItem('roi-calc:v3:timestamp', new Date().toISOString());
}

function loadFormState() {
  const scope = 'roi-calc:v3:form';
  const saved = localStorage.getItem(scope);
  if (saved) {
    try {
      state.form = { ...state.form, ...JSON.parse(saved) };
      state.usingDefaultValues = false;
    } catch (e) {
      console.warn('Failed to load form state:', e);
    }
  }
}

function clearFormState() {
  localStorage.removeItem('roi-calc:v3:form');
  localStorage.removeItem('roi-calc:v3:timestamp');
}

// ========== VALIDATION & CALCULATION ==========

function validateForm() {
  const errors = {};

  if (!state.form.geoInc) {
    errors.geoInc = 'Please select a country';
  }
  if (!state.form.geoOp) {
    errors.geoOp = 'Please select a country';
  }
  if (!state.form.stage) {
    errors.stage = 'Please select a stage';
  }
  if (!state.form.method) {
    errors.method = 'Please select a method';
  }
  if (state.form.shareholders === '' || state.form.shareholders === null) {
    errors.shareholders = 'Number of shareholders required';
  } else if (state.form.shareholders < 0 || isNaN(state.form.shareholders)) {
    errors.shareholders = 'Must be a positive number';
  }
  if (state.form.optionHolders === '' || state.form.optionHolders === null) {
    errors.optionHolders = 'Number of option holders required';
  } else if (state.form.optionHolders < 0 || isNaN(state.form.optionHolders)) {
    errors.optionHolders = 'Must be a positive number';
  }
  if (state.form.grants === '' || state.form.grants === null) {
    errors.grants = 'Grants per year required';
  } else if (state.form.grants < 0 || isNaN(state.form.grants)) {
    errors.grants = 'Must be a positive number';
  }

  return errors;
}

function validateAndCalculate() {
  readFormValues();
  const errors = validateForm();

  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(([field, message]) => {
      const fieldEl = state.formElements[field];
      if (fieldEl) showError(fieldEl, message);
    });
    return;
  }

  // Clear all errors
  Object.values(state.formElements).forEach(el => {
    if (el) clearError(el);
  });

  // Run calculation
  try {
    const input = {
      geo_inc: state.form.geoInc,
      geo_op: state.form.geoOp,
      stage: state.form.stage,
      meth: state.form.method,
      sh: state.form.shareholders,
      oh: state.form.optionHolders,
      gr: state.form.grants,
      fundraising: state.form.fundraising ? {
        type: state.form.fundraisingType,
        timing: state.form.fundraisingTiming,
      } : null,
      valuation: state.form.valuation ? {
        type: state.form.valuationType,
        frequency: state.form.valuationFrequency,
      } : null,
    };

    state.results = computeROI(input, STAGE_HOURLY_RATES, COMPLIANCE, {}, PRICING, STAGE_HOURLY_RATES, STAGE_RETAINER, STAFFING_MATRIX, SECRETARIAL_WORKFLOWS_BY_GEO, FUNDRAISING_WORKFLOWS, {});
    state.isStale = false;
    saveFormState();
    updateLiveEstimate();
  } catch (error) {
    console.error('Calculation error:', error);
    alert('Calculation error: ' + error.message);
  }
}

function resetForm() {
  state.form = {
    geoInc: 'india',
    geoOp: 'india',
    stage: 'seriesab',
    method: 'in-house',
    shareholders: 30,
    optionHolders: 15,
    grants: 10,
    fundraising: false,
    fundraisingType: 'seed',
    fundraisingTiming: 'within-12-months',
    valuation: false,
    valuationType: '409A Valuation',
    valuationFrequency: 'annual',
  };
  state.results = null;
  state.isStale = false;
  state.usingDefaultValues = true;
  clearFormState();
  renderForm();
  updateLiveEstimate();
}

// ========== LIVE ESTIMATE UPDATE ==========

function updateLiveEstimate() {
  const panel = document.getElementById('roi-live-panel');
  if (!panel) return;

  panel.innerHTML = '';

  // Stale banner (prominent strip)
  if (state.isStale) {
    const banner = document.createElement('div');
    banner.style.cssText = `
      padding: 14px;
      background: linear-gradient(135deg, ${T.colors.amber}25 0%, ${T.colors.amber}10 100%);
      border-radius: 8px;
      border: 1px solid ${T.colors.amber}40;
      border-left: 4px solid ${T.colors.amber};
      color: ${T.colors.amber};
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 20px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    `;

    const icon = document.createElement('span');
    icon.textContent = '⚠';
    icon.style.cssText = 'font-size: 16px;';
    banner.appendChild(icon);

    const text = document.createElement('span');
    text.textContent = 'Results outdated — click Calculate to update';
    banner.appendChild(text);

    panel.appendChild(banner);
  }

  if (!state.results) {
    const placeholder = document.createElement('div');
    placeholder.style.cssText = `
      padding: 24px;
      text-align: center;
      color: ${T.colors.mute};
    `;
    placeholder.textContent = 'Calculate to see ROI estimate';
    panel.appendChild(placeholder);
    return;
  }

  // Status chip
  const isUsingSampleData = !!(
    state.form.geoInc === 'india' &&
    state.form.geoOp === 'india' &&
    state.form.stage === 'seriesab' &&
    state.form.shareholders === 30 &&
    state.form.optionHolders === 15 &&
    state.form.grants === 10 &&
    state.form.method === 'in-house'
  );

  const chipType = isUsingSampleData ? 'sample' : 'live';
  const chip = StatusChip(chipType);
  chip.style.marginBottom = T.spacing.lg;
  panel.appendChild(chip);

  // Main metrics
  const currency = CUR[state.form.geoOp] || '₹';
  const diff = state.results.diff || 0;
  const roi = state.results.roi || 0;
  const annCost = state.results.annCost || 0;
  const elAnn = state.results.elAnn || 0;

  // Hero: Annual Savings
  const savings = document.createElement('div');
  savings.style.cssText = `
    text-align: center;
    padding: 24px;
    background: linear-gradient(135deg, ${T.colors.green}15 0%, ${T.colors.green}05 100%);
    border: 1px solid ${T.colors.green}30;
    border-radius: 12px;
    margin-bottom: 24px;
  `;

  const savingsLabel = document.createElement('div');
  savingsLabel.style.cssText = `
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: ${T.colors.mute};
    margin-bottom: 8px;
  `;
  savingsLabel.textContent = 'Annual Savings';
  savings.appendChild(savingsLabel);

  const savingsValue = document.createElement('div');
  savingsValue.style.cssText = `
    font-size: 32px;
    font-weight: 600;
    color: ${T.colors.green};
    margin-bottom: 4px;
    font-variant-numeric: tabular-nums;
  `;
  savingsValue.textContent = formatCurrency(Math.abs(diff), currency);
  savings.appendChild(savingsValue);

  const savingsPercent = document.createElement('div');
  savingsPercent.style.cssText = `
    font-size: 13px;
    color: ${T.colors.mute};
  `;
  const percentReduction = annCost ? Math.round((Math.abs(diff) / annCost) * 100) : 0;
  savingsPercent.textContent = `${percentReduction}% reduction vs in-house`;
  savings.appendChild(savingsPercent);

  panel.appendChild(savings);

  // Key Metrics (3-up grid)
  const metricsGrid = document.createElement('div');
  metricsGrid.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
  `;

  const metricItems = [
    {
      label: 'YOUR SPEND',
      value: formatCurrency(annCost, currency),
      color: T.colors.ink,
    },
    {
      label: 'ROI MULTIPLE',
      value: `${roi.toFixed(1)}x`,
      color: T.colors.purple,
    },
    {
      label: 'EQUITYLIST COST',
      value: formatCurrency(elAnn, currency),
      color: T.colors.ink,
    },
    {
      label: 'HOURS SAVED',
      value: (state.results.hoursSaved || 0).toLocaleString(),
      color: T.colors.ink,
    },
  ];

  metricItems.forEach(item => {
    const card = document.createElement('div');
    card.style.cssText = `
      padding: 16px;
      background-color: ${T.colors.gray50};
      border-radius: 8px;
      border: 1px solid ${T.colors.gray200};
    `;

    const label = document.createElement('div');
    label.style.cssText = `
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: ${T.colors.mute};
      margin-bottom: 6px;
    `;
    label.textContent = item.label;
    card.appendChild(label);

    const value = document.createElement('div');
    value.style.cssText = `
      font-size: 18px;
      font-weight: 600;
      color: ${item.color};
      font-variant-numeric: tabular-nums;
    `;
    value.textContent = item.value;
    card.appendChild(value);

    metricsGrid.appendChild(card);
  });

  panel.appendChild(metricsGrid);

  // Cost Breakdown Section (Expandable)
  const breakdownItems = [
    { label: 'Grant Administration', value: state.results.grantCost || 0 },
    { label: 'Compliance', value: state.results.complianceCost || 0 },
    { label: 'Cap Table', value: state.results.capTableCost || 0 },
    { label: 'Secretarial', value: state.results.secretarialCost || 0 },
    { label: 'External Services', value: state.results.externalCost || 0 },
    { label: 'Valuation', value: state.results.valuationCost || 0 },
  ].filter(item => item.value > 0);

  if (breakdownItems.length > 0) {
    const breakdownSection = document.createElement('div');
    breakdownSection.style.cssText = `
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid ${T.colors.gray200};
    `;

    // Toggle header
    const toggleHeader = document.createElement('button');
    toggleHeader.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      background: none;
      border: none;
      padding: 0 0 12px 0;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1.4px;
      text-transform: uppercase;
      color: ${T.colors.mute};
      transition: color ${T.transitions.fast};
    `;
    toggleHeader.innerHTML = `
      <span>Cost Breakdown</span>
      <span style="font-size: 16px;">▼</span>
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      max-height: 500px;
      overflow: visible;
      transition: max-height ${T.transitions.base};
    `;

    breakdownItems.forEach(item => {
      const row = document.createElement('div');
      row.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid ${T.colors.gray100};
      `;

      const label = document.createElement('span');
      label.style.cssText = `
        font-size: 12px;
        color: ${T.colors.inkSoft};
      `;
      label.textContent = item.label;

      const value = document.createElement('span');
      value.style.cssText = `
        font-size: 12px;
        font-weight: 600;
        color: ${T.colors.ink};
        font-variant-numeric: tabular-nums;
      `;
      value.textContent = formatCurrency(item.value, currency);

      row.appendChild(label);
      row.appendChild(value);
      content.appendChild(row);
    });

    // Toggle functionality
    let isExpanded = true;
    toggleHeader.addEventListener('click', () => {
      isExpanded = !isExpanded;
      content.style.maxHeight = isExpanded ? '500px' : '0';
      content.style.overflow = isExpanded ? 'visible' : 'hidden';
      toggleHeader.style.opacity = isExpanded ? '1' : '0.7';
    });

    breakdownSection.appendChild(toggleHeader);
    breakdownSection.appendChild(content);
    panel.appendChild(breakdownSection);
  }

  // Note about sample data
  if (isUsingSampleData) {
    const note = document.createElement('div');
    note.style.cssText = `
      margin-top: 20px;
      padding: 12px;
      background-color: ${T.colors.gray50};
      border-radius: 6px;
      border-left: 3px solid ${T.colors.purple};
      font-size: 11px;
      color: ${T.colors.inkSoft};
      line-height: 1.5;
    `;
    note.textContent = 'Using sample data. Update inputs above to see personalized estimates.';
    panel.appendChild(note);
  }
}

// ========== EVENT LISTENERS ==========

function attachEventListeners() {
  // Update live estimate on form change
  Object.values(state.formElements).forEach(field => {
    if (field?.inputEl) {
      field.inputEl.addEventListener('input', () => {
        readFormValues();
        state.isStale = true;
        updateLiveEstimate();
      });
    }
    if (field?.selectEl) {
      field.selectEl.addEventListener('change', () => {
        readFormValues();
        state.isStale = true;
        updateLiveEstimate();
      });
    }
  });

  // Watch checkboxes
  document.addEventListener('change', (e) => {
    if (e.target.id === 'field-fundraising' || e.target.id === 'field-valuation') {
      readFormValues();
      state.isStale = true;
      updateLiveEstimate();
    }
  });
}

export { state };
