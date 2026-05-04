/**
 * Direction A - React Primitive Components
 * Matches roi-shared.jsx structure
 */

import React from 'react';
import { TOKENS } from './tokens.js';

const T = TOKENS;

// ========== LABELS & TEXT ==========

export function MonoLabel({ children }) {
  return (
    <div
      style={{
        ...T.type.monoXs,
        color: T.colors.mute,
      }}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ children }) {
  return (
    <div
      style={{
        ...T.type.sansLg,
        color: T.colors.ink,
        marginBottom: T.spacing.lg,
      }}
    >
      {children}
    </div>
  );
}

export function Caption({ children, color = T.colors.mute }) {
  return (
    <span
      style={{
        ...T.type.sansSm,
        color,
      }}
    >
      {children}
    </span>
  );
}

// ========== FORM FIELDS ==========

export function FormField({ label, id, type = 'text', value, onChange, error }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: T.spacing.sm,
        marginBottom: T.spacing.lg,
      }}
    >
      <label htmlFor={id}>
        <MonoLabel>{label}</MonoLabel>
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        style={{
          padding: `${T.spacing.md} ${T.spacing.lg}`,
          border: `${T.borders.xs} ${error ? T.colors.red : T.colors.gray300}`,
          borderRadius: '8px',
          fontFamily: T.fonts.sans,
          fontSize: T.type.sansBase.fontSize,
          lineHeight: T.type.sansBase.lineHeight,
          color: T.colors.ink,
          backgroundColor: error ? `${T.colors.red}08` : T.colors.white,
          transition: `all ${T.transitions.fast}`,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = T.colors.purple;
          e.target.style.boxShadow = `0 0 0 3px ${T.colors.purple}20`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? T.colors.red : T.colors.gray300;
          e.target.style.boxShadow = 'none';
        }}
      />
      {error && (
        <div
          style={{
            display: 'block',
            ...T.type.sansSm,
            color: T.colors.red,
            marginTop: `-${T.spacing.sm}`,
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

export function Dropdown({ label, id, options = [], value, onChange, error }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: T.spacing.sm,
        marginBottom: T.spacing.lg,
      }}
    >
      <label htmlFor={id}>
        <MonoLabel>{label}</MonoLabel>
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        style={{
          padding: `${T.spacing.md} ${T.spacing.lg}`,
          border: `${T.borders.xs} ${error ? T.colors.red : T.colors.gray300}`,
          borderRadius: '8px',
          fontFamily: T.fonts.sans,
          fontSize: T.type.sansBase.fontSize,
          color: T.colors.ink,
          backgroundColor: error ? `${T.colors.red}08` : T.colors.white,
          cursor: 'pointer',
          transition: `all ${T.transitions.fast}`,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = T.colors.purple;
          e.target.style.boxShadow = `0 0 0 3px ${T.colors.purple}20`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? T.colors.red : T.colors.gray300;
          e.target.style.boxShadow = 'none';
        }}
      >
        <option value="">Select...</option>
        {options.map(([val, label]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
      {error && (
        <div
          style={{
            display: 'block',
            ...T.type.sansSm,
            color: T.colors.red,
            marginTop: `-${T.spacing.sm}`,
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

// ========== SWITCHES ==========

export function Switch({ label, id, checked, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: T.spacing.lg,
        marginBottom: T.spacing.lg,
        paddingBottom: T.spacing.lg,
        borderBottom: `${T.borders.xs} ${T.colors.gray200}`,
      }}
    >
      <label
        htmlFor={id}
        style={{
          ...T.type.sansMdSemi,
          color: T.colors.ink,
          cursor: 'pointer',
        }}
      >
        {label}
      </label>
      <div style={{ marginLeft: 'auto', position: 'relative', width: '44px', height: '24px' }}>
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          style={{ display: 'none' }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: checked ? T.colors.green : T.colors.gray300,
            borderRadius: '12px',
            transition: `background-color ${T.transitions.fast}`,
            cursor: 'pointer',
          }}
          onClick={() => onChange({ target: { checked: !checked } })}
        />
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '22px' : '2px',
            width: '20px',
            height: '20px',
            backgroundColor: T.colors.white,
            borderRadius: '50%',
            transition: `left ${T.transitions.fast}`,
            boxShadow: T.shadows.sm,
          }}
        />
      </div>
    </div>
  );
}

// ========== BUTTONS ==========

export function PrimaryBtn({ children, onClick }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      onClick={onClick}
      style={{
        padding: `${T.spacing.md} ${T.spacing.xl}`,
        backgroundColor: isHovered ? T.colors.purple2 : T.colors.purple,
        color: T.colors.white,
        border: 'none',
        borderRadius: '8px',
        ...T.type.sansMdSemi,
        cursor: 'pointer',
        transition: `all ${T.transitions.fast}`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      onClick={onClick}
      style={{
        padding: `${T.spacing.md} ${T.spacing.lg}`,
        backgroundColor: isHovered ? `${T.colors.purple}10` : 'transparent',
        color: T.colors.purple,
        border: `${T.borders.xs} ${T.colors.purple}`,
        borderRadius: '8px',
        ...T.type.sansMdSemi,
        cursor: 'pointer',
        transition: `all ${T.transitions.fast}`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
}

// ========== STATUS CHIPS ==========

export function StatusChip({ type = 'sample' }) {
  if (type === 'sample') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: T.spacing.sm,
          padding: `${T.spacing.sm} ${T.spacing.md}`,
          backgroundColor: T.colors.gray100,
          borderRadius: '12px',
          border: `${T.borders.xs} ${T.colors.purple}`,
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: T.colors.purple,
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
        <span
          style={{
            ...T.type.sansMdSemi,
            color: T.colors.purple,
          }}
        >
          Sample
        </span>
      </div>
    );
  } else if (type === 'live') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: T.spacing.sm,
          padding: `${T.spacing.sm} ${T.spacing.md}`,
          backgroundColor: `${T.colors.green}20`,
          borderRadius: '12px',
          border: `${T.borders.xs} ${T.colors.green}`,
        }}
      >
        <span
          style={{
            ...T.type.sansMdSemi,
            color: T.colors.green,
          }}
        >
          Your inputs
        </span>
      </div>
    );
  } else if (type === 'stale') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: T.spacing.sm,
          padding: `${T.spacing.sm} ${T.spacing.md}`,
          backgroundColor: `${T.colors.amber}20`,
          borderRadius: '12px',
          border: `${T.borders.xs} ${T.colors.amber}`,
        }}
      >
        <span
          style={{
            ...T.type.sansMdSemi,
            color: T.colors.amber,
          }}
        >
          Results outdated
        </span>
      </div>
    );
  }
}

// ========== STAT CELL ==========

export function StatCell({ label, value, unit = '' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: T.spacing.xs,
      }}
    >
      <MonoLabel>{label}</MonoLabel>
      <div
        style={{
          ...T.type.sansXl,
          color: T.colors.ink,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      {unit && (
        <div
          style={{
            ...T.type.sansSm,
            color: T.colors.mute,
          }}
        >
          {unit}
        </div>
      )}
    </div>
  );
}

// ========== UTILITIES ==========

export function formatCurrency(amount, currency = '₹') {
  return `${currency}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}
