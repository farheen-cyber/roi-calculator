// Shared tokens + primitives for both redesign directions.

window.ROI_TOKENS = {
  // Brand
  purple: '#6D28D9',
  purple2: '#5B21B6',
  purpleDeep: '#4C1D95',
  purpleTint: 'rgba(109, 40, 217, 0.05)',
  purpleTint2: 'rgba(109, 40, 217, 0.10)',
  purpleBorder: 'rgba(109, 40, 217, 0.22)',

  // Ink
  ink: '#15121F',
  inkSoft: '#3A3650',
  mute: '#7B7792',
  muteSoft: '#9B97AE',

  // Lines / surfaces
  line: '#E8E6F0',
  lineSoft: '#F0EEF5',
  bg: '#FAFAFB',
  bgWarm: '#F7F5F0',

  // Semantic
  green: '#0A8C5C',
  greenTint: 'rgba(10, 140, 92, 0.08)',
  red: '#C03021',
  amber: '#A66A00',

  // Type
  mono: '"JetBrains Mono","IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace',
  sans: '"Inter","SF Pro Text",-apple-system,BlinkMacSystemFont,system-ui,sans-serif',
  serif: '"Fraunces","Tiempos Headline",Georgia,serif',
};

const T = window.ROI_TOKENS;

// ─── primitives ───────────────────────────────────────────

function MonoLabel({ children, size = 10.5, color, style }) {
  return (
    <div style={{
      fontFamily: T.mono, fontSize: size, fontWeight: 700, letterSpacing: 1.4,
      textTransform: 'uppercase', color: color || T.mute,
      ...style,
    }}>{children}</div>
  );
}

function SectionHeader({ number, title, subtitle, style }) {
  return (
    <div style={{ ...style }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
        <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, letterSpacing: 1.2, color: T.purple }}>
          {String(number).padStart(2, '0')}
        </span>
        <span style={{ width: 12, height: 1, background: T.line, transform: 'translateY(-3px)' }} />
        <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: T.ink }}>
          {title}
        </span>
      </div>
      {subtitle && <div style={{ fontSize: 13, color: T.mute, lineHeight: 1.5, marginLeft: 28 }}>{subtitle}</div>}
    </div>
  );
}

// Underline-style input (current calculator's vocabulary)
function FormField({ label, value, onChange, placeholder, type = 'text', required, suffix, error }) {
  const borderColor = error ? T.red : T.line;
  return (
    <div>
      <MonoLabel>
        {label}{required && <span style={{ color: T.purple, marginLeft: 3 }}>*</span>}
      </MonoLabel>
      <div style={{ position: 'relative', marginTop: 6 }}>
        <input
          type={type === 'number' ? 'text' : type}
          inputMode={type === 'number' ? 'numeric' : undefined}
          value={value || ''}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
          style={{
            width: '100%', boxSizing: 'border-box',
            border: 'none', borderBottom: `1px solid ${borderColor}`,
            padding: '8px 0', outline: 'none',
            background: 'transparent', fontFamily: T.sans, fontSize: 16,
            color: T.ink, fontVariantNumeric: 'tabular-nums',
          }}
          onFocus={(e) => e.currentTarget.style.borderBottomColor = error ? T.red : T.purple}
          onBlur={(e) => e.currentTarget.style.borderBottomColor = borderColor}
        />
        {suffix && (
          <span style={{ position: 'absolute', right: 0, top: 8, fontFamily: T.mono, fontSize: 11, color: T.muteSoft, fontWeight: 600 }}>{suffix}</span>
        )}
      </div>
      {error && (
        <div role="alert" style={{
          display: 'flex', alignItems: 'center', gap: 4, marginTop: 6,
          fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: 0.4,
          textTransform: 'uppercase', color: T.red,
        }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="5.5" cy="5.5" r="4.5"/><path d="M5.5 3v3M5.5 7.8v.2"/></svg>
          {error}
        </div>
      )}
    </div>
  );
}

// Pill-based custom dropdown
function Dropdown({ label, value, onChange, options, placeholder = 'Select…', required, error }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  const sel = options.find((o) => (typeof o === 'string' ? o : o.value) === value);
  const selLabel = sel ? (typeof sel === 'string' ? sel : sel.label) : '';
  const borderColor = error ? T.red : (open ? T.purple : T.line);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label && <MonoLabel>{label}{required && <span style={{ color: T.purple, marginLeft: 3 }}>*</span>}</MonoLabel>}
      <button onClick={() => setOpen((o) => !o)} aria-invalid={!!error} style={{
        width: '100%', textAlign: 'left', marginTop: label ? 6 : 0,
        padding: '8px 0', background: 'transparent',
        border: 'none', borderBottom: `1px solid ${borderColor}`,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: T.sans, fontSize: 16, color: sel ? T.ink : T.muteSoft,
        transition: 'border-color .15s',
      }}>
        <span>{selLabel || placeholder}</span>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke={T.mute} strokeWidth="1.6" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
          <path d="M2 4l3.5 3.5L9 4"/>
        </svg>
      </button>
      {error && (
        <div role="alert" style={{
          display: 'flex', alignItems: 'center', gap: 4, marginTop: 6,
          fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: 0.4,
          textTransform: 'uppercase', color: T.red,
        }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="5.5" cy="5.5" r="4.5"/><path d="M5.5 3v3M5.5 7.8v.2"/></svg>
          {error}
        </div>
      )}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 30,
          background: '#fff', border: `1px solid ${T.line}`, borderRadius: 6,
          boxShadow: '0 8px 24px rgba(30,27,46,0.12)', padding: 4, maxHeight: 240, overflow: 'auto',
        }}>
          {options.map((o) => {
            const v = typeof o === 'string' ? o : o.value;
            const l = typeof o === 'string' ? o : o.label;
            const isSel = v === value;
            return (
              <button key={v} onClick={() => { onChange && onChange(v); setOpen(false); }} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 10px', border: 'none', cursor: 'pointer',
                background: isSel ? T.purpleTint : 'transparent', borderRadius: 4,
                fontFamily: 'inherit', fontSize: 14, color: T.ink, fontWeight: isSel ? 600 : 500,
              }}
                onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = '#F7F6FA'; }}
                onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
              >{l}</button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Switch toggle
function Switch({ on, onChange, size = 'md' }) {
  const w = size === 'sm' ? 34 : 40;
  const h = size === 'sm' ? 18 : 22;
  const knob = size === 'sm' ? 14 : 18;
  return (
    <button onClick={(e) => { e.preventDefault(); onChange(!on); }} role="switch" aria-checked={on} style={{
      width: w, height: h, borderRadius: h / 2, border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0,
      background: on ? T.purple : '#D5D2E0', position: 'relative', transition: 'background .18s',
    }}>
      <span style={{
        position: 'absolute', top: 2, left: on ? w - knob - 2 : 2, width: knob, height: knob, borderRadius: knob / 2,
        background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.18)', transition: 'left .18s',
      }} />
    </button>
  );
}

// Chip-style multi-option selector
function ChipSelect({ value, onChange, options, mono = true }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map((o) => {
        const sel = value === o;
        return (
          <button key={o} onClick={() => onChange(o)} style={{
            padding: '6px 12px', borderRadius: 14, cursor: 'pointer',
            border: `1px solid ${sel ? T.purple : T.line}`,
            background: sel ? T.purple : '#fff', color: sel ? '#fff' : T.inkSoft,
            fontFamily: mono ? T.mono : T.sans,
            fontSize: mono ? 10.5 : 13, fontWeight: mono ? 700 : 500,
            letterSpacing: mono ? 0.6 : 0,
            textTransform: mono ? 'uppercase' : 'none',
            transition: 'all .15s',
          }}>{o}</button>
        );
      })}
    </div>
  );
}

// Sample/Live status chip — TWO SEGMENTS
function StatusChip({ live, onEdit }) {
  if (live) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        height: 26, borderRadius: 13, padding: '0 12px',
        background: T.greenTint, border: `1px solid rgba(10, 140, 92, 0.25)`,
        fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
        textTransform: 'uppercase', color: T.green,
      }}>
        <span style={{ position: 'relative', width: 7, height: 7 }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: T.green, opacity: 0.3, animation: 'roi-pulse 1.6s ease-out infinite' }} />
          <span style={{ position: 'absolute', inset: 1.5, borderRadius: '50%', background: T.green }} />
        </span>
        Edit inputs
      </div>
    );
  }
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'stretch', height: 26, borderRadius: 13,
      background: T.purpleTint, border: `1px solid ${T.purpleBorder}`, fontFamily: T.mono,
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 10px 0 12px', color: T.purple2, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
        <span style={{ position: 'relative', width: 7, height: 7 }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: T.purple, opacity: 0.3, animation: 'roi-pulse 2.2s ease-out infinite' }} />
          <span style={{ position: 'absolute', inset: 1.5, borderRadius: '50%', background: T.purple }} />
        </span>
        Sample
      </div>
      <span style={{ width: 1, background: T.purpleBorder, margin: '6px 0' }} />
      <button onClick={onEdit} style={{
        all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '0 12px', color: T.purple, fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
        textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>
        Edit inputs
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 4.5h7M5 1.5l3 3-3 3"/></svg>
      </button>
    </div>
  );
}

// Primary button
function PrimaryBtn({ children, fullWidth, onClick, size = 'md', style }) {
  const padding = size === 'lg' ? '16px 28px' : size === 'sm' ? '8px 14px' : '12px 22px';
  const fontSize = size === 'lg' ? 15 : size === 'sm' ? 12 : 14;
  return (
    <button onClick={onClick} style={{
      width: fullWidth ? '100%' : 'auto',
      background: T.purple, color: '#fff',
      fontFamily: T.sans, fontSize, fontWeight: 600, letterSpacing: -0.1,
      border: 'none', padding, borderRadius: 6, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      boxShadow: '0 1px 0 rgba(255,255,255,0.2) inset, 0 2px 8px rgba(109,40,217,0.25)',
      transition: 'background .15s',
      ...style,
    }}
      onMouseEnter={(e) => e.currentTarget.style.background = T.purple2}
      onMouseLeave={(e) => e.currentTarget.style.background = T.purple}
    >{children}</button>
  );
}

function GhostBtn({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', color: T.purple,
      fontFamily: T.mono, fontSize: 11, fontWeight: 700, letterSpacing: 1,
      textTransform: 'uppercase', border: `1.5px solid ${T.purple}`,
      padding: '8px 12px', borderRadius: 4, cursor: 'pointer', lineHeight: 1,
      display: 'inline-flex', alignItems: 'center', gap: 6, ...style,
    }}>{children}</button>
  );
}

// Mini bar chart for cost comparison
function CostBars({ spend, esList, height = 90 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, paddingTop: 6 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 34, height, background: 'linear-gradient(180deg, #E8E6F0 0%, #CFC9DF 100%)', borderRadius: '4px 4px 2px 2px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontFamily: T.mono, fontSize: 9.5, color: T.mute, fontWeight: 600, whiteSpace: 'nowrap' }}>{spend}</div>
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.muteSoft }}>Now</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 34, height: Math.max(20, height * 0.32), background: T.purple, borderRadius: '4px 4px 2px 2px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontFamily: T.mono, fontSize: 9.5, color: T.purple2, fontWeight: 700, whiteSpace: 'nowrap' }}>{esList}</div>
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.purple }}>EQ</div>
      </div>
    </div>
  );
}

// Tooltip — hover/focus reveals a small note next to the label
function InfoTip({ text, color }) {
  const [open, setOpen] = React.useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle', marginLeft: 4 }}>
      <span
        tabIndex={0}
        onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
        style={{
          width: 13, height: 13, borderRadius: '50%',
          border: `1px solid ${color || T.muteSoft}`, color: color || T.mute,
          fontFamily: T.mono, fontSize: 8.5, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'help', lineHeight: 1, userSelect: 'none',
        }}
      >i</span>
      {open && (
        <span style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
          background: T.ink, color: '#fff',
          fontFamily: T.sans, fontSize: 11.5, fontWeight: 500, lineHeight: 1.45, letterSpacing: 0,
          textTransform: 'none',
          padding: '8px 10px', borderRadius: 5, width: 220, zIndex: 100,
          boxShadow: '0 6px 18px rgba(20,18,30,0.22)', pointerEvents: 'none',
        }}>
          {text}
          <span style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 8, height: 8, background: T.ink }} />
        </span>
      )}
    </span>
  );
}

Object.assign(window, {
  MonoLabel, SectionHeader, FormField, Dropdown, Switch, ChipSelect, StatusChip,
  PrimaryBtn, GhostBtn, CostBars, InfoTip,
});
