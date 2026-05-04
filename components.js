/**
 * Primitive Components for Direction A
 * All components use inline styles based on design tokens
 */

import { TOKENS } from './tokens.js';

const T = TOKENS;

// ========== UTILITY HELPERS ==========

function css(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};`)
    .join(' ');
}

function formatCurrency(amount, currency = '₹') {
  return `${currency}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

// ========== LABELS & TEXT ==========

export function MonoLabel(text) {
  const el = document.createElement('div');
  el.style.cssText = css({
    ...T.type.monoXs,
    color: T.colors.mute,
  });
  el.textContent = text;
  return el;
}

export function SectionHeader(text) {
  const el = document.createElement('div');
  el.style.cssText = css({
    ...T.type.sansLg,
    color: T.colors.ink,
    marginBottom: T.spacing.lg,
  });
  el.textContent = text;
  return el;
}

export function Caption(text, color = T.colors.mute) {
  const el = document.createElement('span');
  el.style.cssText = css({
    ...T.type.sansSm,
    color,
  });
  el.textContent = text;
  return el;
}

// ========== FORM FIELDS ==========

export function FormField(label, inputId, inputType = 'text') {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-field';
  wrapper.style.cssText = css({
    display: 'flex',
    flexDirection: 'column',
    gap: T.spacing.sm,
    marginBottom: T.spacing.lg,
  });

  const labelEl = document.createElement('label');
  labelEl.htmlFor = inputId;
  labelEl.appendChild(MonoLabel(label));

  const input = document.createElement('input');
  input.id = inputId;
  input.type = inputType;
  input.style.cssText = css({
    padding: `${T.spacing.md} ${T.spacing.lg}`,
    border: `${T.borders.xs} ${T.colors.gray300}`,
    borderRadius: '8px',
    fontFamily: T.fonts.sans,
    fontSize: T.type.sansBase.fontSize,
    lineHeight: T.type.sansBase.lineHeight,
    color: T.colors.ink,
    backgroundColor: T.colors.white,
    transition: `all ${T.transitions.fast}`,
  });

  input.addEventListener('focus', () => {
    input.style.borderColor = T.colors.purple;
    input.style.boxShadow = `0 0 0 3px ${T.colors.purple}20`;
  });

  input.addEventListener('blur', () => {
    input.style.borderColor = T.colors.gray300;
    input.style.boxShadow = 'none';
  });

  wrapper.appendChild(labelEl);
  wrapper.appendChild(input);

  const errorMsg = document.createElement('div');
  errorMsg.className = 'error-msg';
  errorMsg.style.cssText = css({
    display: 'none',
    ...T.type.sansSm,
    color: T.colors.red,
    marginTop: `-${T.spacing.sm}`,
  });
  wrapper.appendChild(errorMsg);

  wrapper.inputEl = input;
  wrapper.errorMsg = errorMsg;

  return wrapper;
}

export function Dropdown(label, selectId, options = []) {
  const wrapper = document.createElement('div');
  wrapper.className = 'dropdown-field';
  wrapper.style.cssText = css({
    display: 'flex',
    flexDirection: 'column',
    gap: T.spacing.sm,
    marginBottom: T.spacing.lg,
  });

  const labelEl = document.createElement('label');
  labelEl.htmlFor = selectId;
  labelEl.appendChild(MonoLabel(label));

  const select = document.createElement('select');
  select.id = selectId;
  select.style.cssText = css({
    padding: `${T.spacing.md} ${T.spacing.lg}`,
    border: `${T.borders.xs} ${T.colors.gray300}`,
    borderRadius: '8px',
    fontFamily: T.fonts.sans,
    fontSize: T.type.sansBase.fontSize,
    color: T.colors.ink,
    backgroundColor: T.colors.white,
    cursor: 'pointer',
    transition: `all ${T.transitions.fast}`,
  });

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select...';
  select.appendChild(defaultOption);

  options.forEach(([value, text]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    select.appendChild(option);
  });

  select.addEventListener('focus', () => {
    select.style.borderColor = T.colors.purple;
    select.style.boxShadow = `0 0 0 3px ${T.colors.purple}20`;
  });

  select.addEventListener('blur', () => {
    select.style.borderColor = T.colors.gray300;
    select.style.boxShadow = 'none';
  });

  wrapper.appendChild(labelEl);
  wrapper.appendChild(select);

  const errorMsg = document.createElement('div');
  errorMsg.className = 'error-msg';
  errorMsg.style.cssText = css({
    display: 'none',
    ...T.type.sansSm,
    color: T.colors.red,
    marginTop: `-${T.spacing.sm}`,
  });
  wrapper.appendChild(errorMsg);

  wrapper.selectEl = select;
  wrapper.errorMsg = errorMsg;

  return wrapper;
}

// ========== TOGGLES & SWITCHES ==========

export function Switch(label, inputId) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = css({
    display: 'flex',
    alignItems: 'center',
    gap: T.spacing.lg,
    marginBottom: T.spacing.lg,
    paddingBottom: T.spacing.lg,
    borderBottom: `${T.borders.xs} ${T.colors.gray200}`,
  });

  const labelEl = document.createElement('label');
  labelEl.style.cssText = css({
    ...T.type.sansMdSemi,
    color: T.colors.ink,
    cursor: 'pointer',
  });
  labelEl.textContent = label;

  const switchContainer = document.createElement('div');
  switchContainer.style.cssText = css({
    position: 'relative',
    width: '44px',
    height: '24px',
    marginLeft: 'auto',
  });

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = inputId;
  input.style.cssText = css({
    display: 'none',
  });

  const track = document.createElement('div');
  track.style.cssText = css({
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: T.colors.gray300,
    borderRadius: '12px',
    transition: `background-color ${T.transitions.fast}`,
    cursor: 'pointer',
  });

  const thumb = document.createElement('div');
  thumb.style.cssText = css({
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    backgroundColor: T.colors.white,
    borderRadius: '50%',
    transition: `left ${T.transitions.fast}`,
    boxShadow: T.shadows.sm,
  });

  function updateState() {
    if (input.checked) {
      track.style.backgroundColor = T.colors.green;
      thumb.style.left = '22px';
    } else {
      track.style.backgroundColor = T.colors.gray300;
      thumb.style.left = '2px';
    }
  }

  input.addEventListener('change', updateState);
  track.addEventListener('click', () => {
    input.checked = !input.checked;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  switchContainer.appendChild(input);
  switchContainer.appendChild(track);
  switchContainer.appendChild(thumb);

  wrapper.appendChild(labelEl);
  wrapper.appendChild(switchContainer);

  wrapper.inputEl = input;

  return wrapper;
}

// ========== BUTTONS ==========

export function PrimaryBtn(text) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.style.cssText = css({
    padding: `${T.spacing.md} ${T.spacing.xl}`,
    backgroundColor: T.colors.purple,
    color: T.colors.white,
    border: 'none',
    borderRadius: '8px',
    ...T.type.sansMdSemi,
    cursor: 'pointer',
    transition: `all ${T.transitions.fast}`,
  });
  btn.textContent = text;

  btn.addEventListener('mouseenter', () => {
    btn.style.backgroundColor = T.colors.purple2;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.backgroundColor = T.colors.purple;
  });

  return btn;
}

export function GhostBtn(text) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.style.cssText = css({
    padding: `${T.spacing.md} ${T.spacing.lg}`,
    backgroundColor: 'transparent',
    color: T.colors.purple,
    border: `${T.borders.xs} ${T.colors.purple}`,
    borderRadius: '8px',
    ...T.type.sansMdSemi,
    cursor: 'pointer',
    transition: `all ${T.transitions.fast}`,
  });
  btn.textContent = text;

  btn.addEventListener('mouseenter', () => {
    btn.style.backgroundColor = T.colors.purple + '10';
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.backgroundColor = 'transparent';
  });

  return btn;
}

// ========== STATUS & FEEDBACK ==========

export function StatusChip(type = 'sample') {
  const chip = document.createElement('div');

  if (type === 'sample') {
    chip.style.cssText = css({
      display: 'inline-flex',
      alignItems: 'center',
      gap: T.spacing.sm,
      padding: `${T.spacing.sm} ${T.spacing.md}`,
      backgroundColor: T.colors.gray100,
      borderRadius: '12px',
      border: `${T.borders.xs} ${T.colors.purple}`,
    });

    const dot = document.createElement('div');
    dot.style.cssText = css({
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: T.colors.purple,
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    });

    const label = document.createElement('span');
    label.style.cssText = css({
      ...T.type.sansMdSemi,
      color: T.colors.purple,
    });
    label.textContent = 'Sample';

    chip.appendChild(dot);
    chip.appendChild(label);
  } else if (type === 'live') {
    chip.style.cssText = css({
      display: 'inline-flex',
      alignItems: 'center',
      gap: T.spacing.sm,
      padding: `${T.spacing.sm} ${T.spacing.md}`,
      backgroundColor: T.colors.green + '20',
      borderRadius: '12px',
      border: `${T.borders.xs} ${T.colors.green}`,
    });

    const label = document.createElement('span');
    label.style.cssText = css({
      ...T.type.sansMdSemi,
      color: T.colors.green,
    });
    label.textContent = 'Your inputs';

    chip.appendChild(label);
  } else if (type === 'stale') {
    chip.style.cssText = css({
      display: 'inline-flex',
      alignItems: 'center',
      gap: T.spacing.sm,
      padding: `${T.spacing.sm} ${T.spacing.md}`,
      backgroundColor: T.colors.amber + '20',
      borderRadius: '12px',
      border: `${T.borders.xs} ${T.colors.amber}`,
    });

    const label = document.createElement('span');
    label.style.cssText = css({
      ...T.type.sansMdSemi,
      color: T.colors.amber,
    });
    label.textContent = 'Results outdated';

    chip.appendChild(label);
  }

  return chip;
}

// ========== STAT DISPLAY ==========

export function StatCell(label, value, unit = '') {
  const cell = document.createElement('div');
  cell.style.cssText = css({
    display: 'flex',
    flexDirection: 'column',
    gap: T.spacing.xs,
  });

  const labelEl = document.createElement('div');
  labelEl.appendChild(MonoLabel(label));

  const valueEl = document.createElement('div');
  valueEl.style.cssText = css({
    ...T.type.sansXl,
    color: T.colors.ink,
    fontVariantNumeric: 'tabular-nums',
  });
  valueEl.textContent = value;

  const unitEl = document.createElement('div');
  unitEl.style.cssText = css({
    ...T.type.sansSm,
    color: T.colors.mute,
  });
  unitEl.textContent = unit;

  cell.appendChild(labelEl);
  cell.appendChild(valueEl);
  if (unit) cell.appendChild(unitEl);

  return cell;
}

// ========== UTILITY EXPORTS ==========

export function showError(fieldWrapper, message) {
  if (fieldWrapper.errorMsg) {
    fieldWrapper.errorMsg.textContent = message;
    fieldWrapper.errorMsg.style.display = 'block';
    if (fieldWrapper.inputEl) {
      fieldWrapper.inputEl.style.borderColor = T.colors.red;
    }
    if (fieldWrapper.selectEl) {
      fieldWrapper.selectEl.style.borderColor = T.colors.red;
    }
  }
}

export function clearError(fieldWrapper) {
  if (fieldWrapper.errorMsg) {
    fieldWrapper.errorMsg.style.display = 'none';
    if (fieldWrapper.inputEl) {
      fieldWrapper.inputEl.style.borderColor = T.colors.gray300;
    }
    if (fieldWrapper.selectEl) {
      fieldWrapper.selectEl.style.borderColor = T.colors.gray300;
    }
  }
}

export { formatCurrency };
