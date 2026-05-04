// Direction A — Refined.
// Same DNA as the live calculator: purple, mono labels, underline inputs.
// Tighter rhythm, better hierarchy, sticky live panel on desktop,
// bottom drawer on mobile, fixes for sample chip / fundraise / valuation.

const A = window.ROI_TOKENS;

// ─── Header ────────────────────────────────────────────────

function AHeader({ width }) {
  const compact = width < 720;
  const tiny = width < 480;
  return (
    <header style={{
      borderBottom: `1px solid ${A.line}`, background: '#fff',
      padding: compact ? '14px 20px' : '18px 40px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <div style={{ fontFamily: A.sans, fontSize: 17, fontWeight: 700, letterSpacing: -0.3, color: A.ink, display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 18, height: 18, borderRadius: 4, background: A.purple, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>E</span>
          EquityList
        </div>
        {!compact && (
          <nav style={{ display: 'flex', gap: 22 }}>
            {['Products', 'Solutions', 'Customers', 'Pricing', 'Resources'].map((l) => (
              <span key={l} style={{ fontSize: 13.5, color: A.inkSoft, cursor: 'pointer' }}>{l}</span>
            ))}
          </nav>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: tiny ? 8 : 12 }}>
        {!tiny && <span style={{ fontSize: 13.5, color: A.inkSoft, cursor: 'pointer' }}>Sign in</span>}
        <button style={{
          background: A.ink, color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 4,
          fontFamily: A.sans, fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Get started</button>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────

function AHero({ width }) {
  const compact = width < 720;
  return (
    <section style={{
      padding: compact ? '40px 20px 24px' : '64px 40px 36px',
      maxWidth: 1280, margin: '0 auto',
    }}>
      <div style={{ fontFamily: A.mono, fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: A.purple, marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: A.purple }} />
        ROI Calculator · v2.4
      </div>
      <h1 style={{
        fontFamily: A.sans, fontSize: compact ? 32 : 52, fontWeight: 600, letterSpacing: -1.6,
        color: A.ink, lineHeight: 1.05, margin: 0, maxWidth: 880, textWrap: 'pretty',
      }}>
        How much is managing equity on{' '}
        <span style={{
          fontStyle: 'italic', fontFamily: A.serif, fontWeight: 500, color: A.purple,
          background: `linear-gradient(180deg, transparent 60%, ${A.purpleTint2} 60%)`, padding: '0 4px',
        }}>spreadsheets</span>{' '}
        costing you?
      </h1>
      <p style={{
        fontSize: compact ? 15 : 17, color: A.inkSoft, lineHeight: 1.5,
        maxWidth: 620, marginTop: 20, marginBottom: 0,
      }}>
        Based on industry benchmarks and real company data — see precisely how much time and capital is wasted on manual administration.
      </p>
    </section>
  );
}

// ─── Input method picker (manual vs upload) ─────────────────

function AInputMethod({ width }) {
  const compact = width < 720;
  return (
    <section style={{
      padding: compact ? '12px 20px 28px' : '16px 40px 36px',
      maxWidth: 1280, margin: '0 auto',
    }}>
      <MonoLabel size={10.5} color={A.muteSoft} style={{ marginBottom: 14 }}>Input method</MonoLabel>
      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: compact ? 10 : 14 }}>
        <MethodCard
          active
          eyebrow="Recommended"
          title="Enter manually"
          desc="Model ROI using stage-based benchmarks and research-backed assumptions."
          cta="Enter details"
        />
        <MethodCard
          eyebrow="High precision"
          title="Upload cap table"
          desc="Extract stakeholders and grants from your files for a high-precision audit."
          cta="Upload CSV or Excel"
          accepts="Excel (.xlsx), CSV — processed locally, never stored"
        />
      </div>
    </section>
  );
}

function MethodCard({ active, eyebrow, title, desc, cta, accepts }) {
  return (
    <div style={{
      background: active ? '#fff' : '#fff',
      border: `1px solid ${active ? A.purpleBorder : A.line}`,
      borderRadius: 8, padding: 22,
      boxShadow: active ? '0 1px 0 rgba(109,40,217,0.06), 0 4px 16px rgba(109,40,217,0.04)' : 'none',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{
          fontFamily: A.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
          color: active ? A.purple : A.muteSoft,
          padding: '3px 8px', borderRadius: 3,
          background: active ? A.purpleTint : 'transparent',
          border: active ? `1px solid ${A.purpleBorder}` : 'none',
        }}>{eyebrow}</span>
        {active && (
          <div style={{ width: 18, height: 18, borderRadius: 9, background: A.purple, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M1 4.5l2.5 2.5L8 1.5"/></svg>
          </div>
        )}
      </div>
      <h3 style={{ fontFamily: A.sans, fontSize: 19, fontWeight: 600, color: A.ink, margin: 0, letterSpacing: -0.4 }}>{title}</h3>
      <p style={{ fontSize: 13.5, color: A.mute, lineHeight: 1.5, marginTop: 8, marginBottom: 16 }}>{desc}</p>
      {accepts && <div style={{ fontFamily: A.mono, fontSize: 10, color: A.muteSoft, marginBottom: 12, lineHeight: 1.5 }}>{accepts}</div>}
      <div style={{
        fontFamily: A.mono, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
        color: active ? A.purple : A.inkSoft, display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        {cta} <span>→</span>
      </div>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────

function AForm({ width, onCalculate, showErrors = false }) {
  const [stage, setStage] = React.useState('Series A/B');
  const [shareholders, setShareholders] = React.useState('30');
  const [optionHolders, setOptionHolders] = React.useState('15');
  const [grants, setGrants] = React.useState(showErrors ? '' : '10');
  const [legalEntity, setLegalEntity] = React.useState('');
  const [fundraise, setFundraise] = React.useState(false);
  const [valuation, setValuation] = React.useState(false);
  const [valFreq, setValFreq] = React.useState(null);
  const [adminMethod, setAdminMethod] = React.useState('In-house (Spreadsheets)');
  const grantsErr = showErrors && !grants ? 'Field required' : null;

  const oneColumn = width < 720;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {/* 01 Company Profile */}
      <FormSection number={1} title="Company Profile" subtitle="Geography determines compliance requirements and salary benchmarks.">
        <div style={{ display: 'grid', gridTemplateColumns: oneColumn ? '1fr' : '1fr 1fr', gap: oneColumn ? 20 : 28 }}>
          <Dropdown label={<>Country of Incorporation <InfoTip text="Determines which valuation reports, tax filings, and statutory compliance apply." /></>} value="India" required options={['India', 'United States', 'Singapore', 'United Kingdom']} onChange={() => {}} />
          <Dropdown label={<>Country of Operation <InfoTip text="Where your team is based — drives salary benchmarks for in-house equity admin." /></>} value="India" required options={['India', 'United States', 'Singapore', 'United Kingdom']} onChange={() => {}} />
          <Dropdown label={<>Current Stage <InfoTip text="Used to estimate your blended hourly rate and the typical staffing mix at this stage." /></>} value={stage} required options={['Pre-seed', 'Seed', 'Series A/B', 'Series B/C', 'Series C+']} onChange={setStage} />
          <FormField label="Legal Entity Name" placeholder="Optional" value={legalEntity} onChange={setLegalEntity} />
        </div>
      </FormSection>

      {/* 02 Equity Structure */}
      <FormSection number={2} title="Equity Structure" subtitle="Stakeholder volume scales your cap table reconciliation and grant overhead.">
        <div style={{ display: 'grid', gridTemplateColumns: oneColumn ? '1fr 1fr' : '1fr 1fr 1fr', gap: oneColumn ? 16 : 24 }}>
          <FormField label={<>Shareholders <InfoTip text="Founders, investors, and any other equity holders on your cap table." /></>} required value={shareholders} onChange={setShareholders} type="number" />
          <FormField label={<>Option holders <InfoTip text="Employees and advisors with vested or unvested options outstanding." /></>} required value={optionHolders} onChange={setOptionHolders} type="number" />
          <FormField label={<>Grants per year <InfoTip text="New ESOP grants you issue annually — drives grant-admin overhead." /></>} required value={grants} onChange={setGrants} type="number" error={grantsErr} />
        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SwitchCard
            on={fundraise} onChange={setFundraise}
            title="Planning to fundraise in the next 12 months?"
            subtitle="Helps us model upcoming governance & onboarding workflows."
          >
            <FundraiseExpanded oneColumn={oneColumn} />
          </SwitchCard>
          <SwitchCard
            on={valuation} onChange={setValuation}
            title="Do you need valuation reports?"
            subtitle="Required for ESOP grant pricing, fundraising, and exit events."
          >
            <ValuationExpanded oneColumn={oneColumn} freq={valFreq} setFreq={setValFreq} />
          </SwitchCard>
        </div>
      </FormSection>

      {/* 03 Current Operations */}
      <FormSection number={3} title="Current Operations" subtitle="How you currently manage equity administration.">
        <Dropdown label="Administrative Method" value={adminMethod} required options={['In-house (Spreadsheets)', 'Outsourced (CA/Law Firm)']} onChange={setAdminMethod} />
      </FormSection>

      <PrimaryBtn fullWidth size="lg" onClick={onCalculate}>
        Calculate ROI
        <span style={{ opacity: 0.7 }}>→</span>
      </PrimaryBtn>
    </div>
  );
}

function FormSection({ number, title, subtitle, children }) {
  return (
    <section>
      <SectionHeader number={number} title={title} subtitle={subtitle} style={{ marginBottom: 20 }} />
      <div style={{ marginLeft: 28 }}>{children}</div>
    </section>
  );
}

function SwitchCard({ on, onChange, title, subtitle, children }) {
  // Keep overflow:hidden ONLY while the expand/collapse animation is running,
  // so dropdown popups inside `children` aren't clipped once we're settled.
  const [animating, setAnimating] = React.useState(false);
  const prevOn = React.useRef(on);
  React.useEffect(() => {
    if (prevOn.current !== on) {
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 320);
      prevOn.current = on;
      return () => clearTimeout(t);
    }
  }, [on]);
  const clipped = !on || animating;
  return (
    <div style={{
      border: `1px solid ${on ? A.purpleBorder : A.line}`,
      background: on ? A.purpleTint : '#fff',
      borderRadius: 8, transition: 'all .2s',
    }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: 'pointer' }}>
        <Switch on={on} onChange={onChange} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: A.ink, letterSpacing: -0.1 }}>{title}</div>
          <div style={{ fontSize: 12, color: A.mute, marginTop: 2 }}>{subtitle}</div>
        </div>
        <div style={{
          fontFamily: A.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
          color: on ? A.purple2 : A.muteSoft,
        }}>{on ? 'Yes' : 'No'}</div>
      </label>
      <div style={{
        maxHeight: on ? 600 : 0,
        overflow: clipped ? 'hidden' : 'visible',
        transition: 'max-height .3s ease',
      }}>
        <div style={{ padding: '4px 16px 16px', borderTop: `1px solid ${A.purpleBorder}` }}>
          <div style={{ paddingTop: 16 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function FundraiseExpanded({ oneColumn }) {
  const [round, setRound] = React.useState('Seed');
  const [timing, setTiming] = React.useState('3–6 mo');
  const [shareholders, setShareholders] = React.useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: oneColumn ? '1fr' : '1fr 1fr', gap: 16 }}>
        <div>
          <MonoLabel>Round type</MonoLabel>
          <div style={{ marginTop: 8 }}>
            <ChipSelect value={round} onChange={setRound} options={['SAFE', 'Seed', 'Series A', 'Series B', 'Bridge']} />
          </div>
        </div>
        <div>
          <MonoLabel>Expected timing</MonoLabel>
          <div style={{ marginTop: 8 }}>
            <ChipSelect value={timing} onChange={setTiming} options={['<3 mo', '3–6 mo', '6–12 mo']} />
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: oneColumn ? '1fr' : '180px 1fr', gap: 16, alignItems: 'flex-end' }}>
        <FormField label="New shareholders" placeholder="e.g. 8" value={shareholders} onChange={setShareholders} type="number" />
        <div style={{ fontSize: 12, color: A.mute, lineHeight: 1.5 }}>
          Investors, SAFE conversions, and new ESOP grants all count toward stakeholder load.
        </div>
      </div>
    </div>
  );
}

function ValuationExpanded({ oneColumn, freq, setFreq }) {
  const [type, setType] = React.useState(null);
  const opts = [
    { value: 'rv', label: 'Registered Valuer Assessment' },
    { value: 'mb', label: 'Merchant Banker Assessment' },
  ];
  const events = freq === 'annually' ? 1 : freq === 'quarterly' ? 4 : freq === 'as-needed' ? 2 : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: oneColumn ? '1fr' : '1fr 1fr', gap: 16 }}>
        <Dropdown label="How often?" required value={freq} onChange={setFreq} options={[
          { value: 'annually', label: 'Annually (1× per year)' },
          { value: 'quarterly', label: 'Quarterly (4× per year)' },
          { value: 'as-needed', label: 'As-needed' },
        ]} placeholder="Select frequency" />
        <Dropdown label="Report type · for India" required value={type} onChange={setType} options={opts} placeholder="Select report type" />
      </div>
      {freq && type && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          background: '#fff', border: `1px dashed ${A.purpleBorder}`, borderRadius: 6,
          fontSize: 12, color: A.inkSoft,
        }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke={A.purple} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M2 12L6 8l3 3 5-6"/><path d="M10 5h4v4"/>
          </svg>
          Estimate will include <strong style={{ color: A.purple2, fontWeight: 700 }}>{events} event{events === 1 ? '' : 's'}/yr</strong>.
        </div>
      )}
    </div>
  );
}

// ─── Live estimate panel ──────────────────────────────────

function ALiveEstimate({ width, isLive, onEdit, sticky = true }) {
  const compact = width < 460;
  const [breakdownOpen, setBreakdownOpen] = React.useState(true);
  const [hourlyRate, setHourlyRate] = React.useState('4150.5');
  const [totalHours, setTotalHours] = React.useState('159');

  const v = isLive
    ? { spend: '₹857,997', esList: '₹170,118', savings: '₹687,879', savingsPct: '80%', roi: '4×', hrs: '143' }
    : { spend: '₹857,997', esList: '₹170,118', savings: '₹687,879', savingsPct: '80%', roi: '4×', hrs: '143' };

  const items = [
    { key: 'grant', label: 'Grant Admin', formula: '1.5 hrs/grant × 10 grants/yr × 1 × ₹4150.5/hr', value: '₹62,258', pct: '7%', tip: null },
    { key: 'compliance', label: 'Compliance', formula: '72 hrs/yr (6h/mo, INDIA statutory baseline) × 1 × ₹4150.5/hr', value: '₹298,836', pct: '35%', tip: 'Baseline statutory work — board minutes, ROC filings, ESOP approvals.' },
    { key: 'captable', label: 'Cap Table', formula: '3h/mo base + 0.20h/mo scaling = 3.4h/mo × 12 = 41 hrs/yr × 1 × ₹4150.5/hr', value: '₹169,340', pct: '20%', tip: 'Reconciling holdings, processing transfers, and keeping the cap table audit-ready.' },
    { key: 'secretarial', label: 'Secretarial & Board Operations', formula: '12 workflows/yr × 2.5 hrs/workflow × 1.05 (shareholder scaling) = 32 hrs/yr × 1 × ₹875/hr', value: '₹27,563', pct: '3%', tip: 'Board meetings, shareholder resolutions, and statutory filings.' },
    { key: 'valuation', label: 'Valuation Reports', formula: '1 event/yr', value: '₹300,000', pct: '35%', tip: null },
  ];

  return (
    <aside style={{
      ...(sticky ? { position: 'sticky', top: 24 } : {}),
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <MonoLabel size={11} color={A.ink}>Live Estimate</MonoLabel>
            <span style={{ width: 1, height: 14, background: A.line }} />
            <StatusChip live={isLive} onEdit={onEdit} />
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: A.mute, marginTop: 6 }}>
          {isLive ? 'Tailored to your inputs — recalculate any time.' : 'Illustrative — based on a typical mid-market scenario.'}
        </div>
      </div>

      {/* Hero card: savings */}
      <div style={{
        background: '#fff', border: `1px solid ${A.line}`, borderRadius: 8,
        padding: '20px 22px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 130, height: 130, background: `radial-gradient(circle at top right, ${A.greenTint}, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <MonoLabel size={9.5} color={A.mute} style={{ marginBottom: 6 }}>Your potential savings</MonoLabel>
          <div style={{
            fontFamily: A.sans, fontSize: compact ? 32 : 38, fontWeight: 600, letterSpacing: -1.2,
            color: A.green, fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          }}>{v.savings}</div>
          <div style={{ marginTop: 8, fontSize: 12, color: A.mute }}>per year · {v.savingsPct} reduction in equity-admin overhead</div>

          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${A.lineSoft}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <BreakdownRow label="Current spend" value={v.spend} />
            <BreakdownRow label="With EquityList" value={v.esList} valueColor={A.purple2} />
          </div>
        </div>
      </div>

      {/* Cost breakdown — collapsible */}
      <div style={{ background: '#fff', border: `1px solid ${A.line}`, borderRadius: 8 }}>
        <button
          onClick={() => setBreakdownOpen((o) => !o)}
          aria-expanded={breakdownOpen}
          style={{
            width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: breakdownOpen ? `1px solid ${A.lineSoft}` : 'none',
          }}
        >
          <MonoLabel size={10.5} color={A.ink}>Cost breakdown</MonoLabel>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke={A.mute} strokeWidth="1.6" strokeLinecap="round" style={{ transform: breakdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
            <path d="M2 4l3.5 3.5L9 4"/>
          </svg>
        </button>
        {breakdownOpen && (
          <div style={{ padding: '4px 18px 18px' }}>
            {items.map((it, i) => (
              <div key={it.key} style={{
                padding: '14px 0',
                borderBottom: i < items.length - 1 ? `1px solid ${A.lineSoft}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <MonoLabel size={10} color={A.inkSoft}>{it.label}</MonoLabel>
                  {it.tip && <InfoTip text={it.tip} />}
                </div>
                <div style={{ fontFamily: A.mono, fontSize: 10.5, color: A.muteSoft, lineHeight: 1.5, marginBottom: 6, wordBreak: 'break-word' }}>{it.formula}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontFamily: A.sans, fontSize: 17, fontWeight: 600, color: A.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3 }}>{it.value}</div>
                  <div style={{ fontFamily: A.mono, fontSize: 10.5, fontWeight: 700, color: A.muteSoft }}>{it.pct}</div>
                </div>
              </div>
            ))}

            {/* Editable rate / hours */}
            <div style={{ marginTop: 8, paddingTop: 16, borderTop: `1px solid ${A.line}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MonoLabel size={10} color={A.inkSoft}>Blended hourly rate</MonoLabel>
                  <InfoTip text="Weighted across the staffing mix typical for your stage. Edit if your team's loaded cost differs." />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: A.mono, fontSize: 11, color: A.mute }}>₹</span>
                  <input
                    value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)}
                    style={{
                      width: 72, textAlign: 'right',
                      border: 'none', borderBottom: `1px solid ${A.line}`,
                      padding: '4px 0', outline: 'none', background: 'transparent',
                      fontFamily: A.sans, fontSize: 14, fontWeight: 600, color: A.ink, fontVariantNumeric: 'tabular-nums',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderBottomColor = A.purple}
                    onBlur={(e) => e.currentTarget.style.borderBottomColor = A.line}
                  />
                  <span style={{ fontFamily: A.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: A.muteSoft }}>SeriesAB mix</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <MonoLabel size={10} color={A.inkSoft}>Total equity management hours</MonoLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    value={totalHours} onChange={(e) => setTotalHours(e.target.value)}
                    style={{
                      width: 56, textAlign: 'right',
                      border: 'none', borderBottom: `1px solid ${A.line}`,
                      padding: '4px 0', outline: 'none', background: 'transparent',
                      fontFamily: A.sans, fontSize: 14, fontWeight: 600, color: A.ink, fontVariantNumeric: 'tabular-nums',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderBottomColor = A.purple}
                    onBlur={(e) => e.currentTarget.style.borderBottomColor = A.line}
                  />
                  <span style={{ fontFamily: A.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: A.muteSoft }}>hrs/yr</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                <PrimaryBtn size="sm">Apply</PrimaryBtn>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ROI block */}
      <div style={{ background: '#fff', border: `1px solid ${A.line}`, borderRadius: 8, padding: '4px 18px' }}>
        <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${A.lineSoft}` }}>
          <MonoLabel size={10.5} color={A.ink}>ROI</MonoLabel>
        </div>
        <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${A.lineSoft}` }}>
          <MonoLabel size={10}>Your ROI with EquityList</MonoLabel>
          <div style={{ fontFamily: A.sans, fontSize: 18, fontWeight: 700, color: A.ink, letterSpacing: -0.4 }}>{v.roi}</div>
        </div>
        <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <MonoLabel size={10}>Hours saved annually</MonoLabel>
          <div style={{ fontFamily: A.sans, fontSize: 16, fontWeight: 700, color: A.green, fontVariantNumeric: 'tabular-nums' }}>
            {v.hrs} <span style={{ fontFamily: A.mono, fontSize: 10, color: A.green, fontWeight: 700 }}>hrs/yr</span>
          </div>
        </div>
      </div>

      {/* Takeaway */}
      <div style={{
        background: A.purpleTint, border: `1px solid ${A.purpleBorder}`, borderRadius: 8,
        padding: '16px 18px',
      }}>
        <MonoLabel size={9.5} color={A.purple2} style={{ marginBottom: 8 }}>The takeaway</MonoLabel>
        <p style={{ fontSize: 13, color: A.inkSoft, lineHeight: 1.55, margin: 0, marginBottom: 14 }}>
          You're currently overspending on equity operations. You could save <strong style={{ color: A.ink, fontWeight: 700 }}>{v.savings}/year</strong> while eliminating most manual work. EquityList ensures your cap table stays accurate, audit-ready, and compliant as you scale.
        </p>
        <PrimaryBtn fullWidth size="md">
          Book a demo
          <span style={{ opacity: 0.7 }}>→</span>
        </PrimaryBtn>
      </div>

      <div style={{ fontSize: 11, color: A.muteSoft, lineHeight: 1.5 }}>
        Pricing is indicative — based on benchmarks for companies of your size. Final pricing is tailored.
      </div>
    </aside>
  );
}

function BreakdownRow({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
      <MonoLabel size={9.5}>{label}</MonoLabel>
      <div style={{ fontFamily: A.sans, fontSize: 15, fontWeight: 600, color: valueColor || A.inkSoft, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.2 }}>{value}</div>
    </div>
  );
}

function StatCell({ label, value, unit, valueColor }) {
  return (
    <div>
      <MonoLabel size={9.5}>{label}</MonoLabel>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 5 }}>
        <div style={{ fontFamily: A.sans, fontSize: 24, fontWeight: 600, color: valueColor || A.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5, lineHeight: 1 }}>{value}</div>
        {unit && <div style={{ fontFamily: A.mono, fontSize: 10, color: A.mute, fontWeight: 600 }}>{unit}</div>}
      </div>
    </div>
  );
}

// ─── Mobile bottom drawer for live estimate ─────────────────

function ABottomDrawer({ width, isLive, onEdit }) {
  const [expanded, setExpanded] = React.useState(false);
  const v = isLive
    ? { savings: '₹229,500' }
    : { savings: '₹167,183' };
  return (
    <div style={{
      position: 'sticky', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: '#fff',
      borderTop: `1px solid ${A.line}`,
      boxShadow: '0 -8px 24px rgba(30,27,46,0.06)',
      transition: 'all .25s ease',
    }}>
      {/* Collapsed strip */}
      <div style={{
        padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div
          role="button" tabIndex={0} onClick={() => setExpanded(!expanded)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(!expanded); } }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flex: 1, minWidth: 0, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MonoLabel size={9} color={A.mute}>Potential savings</MonoLabel>
            </div>
            <div style={{
              fontFamily: A.sans, fontSize: 22, fontWeight: 700, letterSpacing: -0.6,
              color: A.green, fontVariantNumeric: 'tabular-nums', marginTop: 2, lineHeight: 1.1,
            }}>{v.savings}<span style={{ fontSize: 11, color: A.mute, fontWeight: 500, marginLeft: 6 }}>/yr</span></div>
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={A.mute} strokeWidth="1.8" strokeLinecap="round" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }}>
            <path d="M3 9l4-4 4 4"/>
          </svg>
        </div>
        <StatusChip live={isLive} onEdit={onEdit} />
      </div>
      {expanded && (
        <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${A.lineSoft}` }}>
          <div style={{ paddingTop: 16 }}>
            <ALiveEstimate width={width} isLive={isLive} onEdit={onEdit} sticky={false} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Composed page ─────────────────────────────────────────

function ScreenA({ width, height, isLive = false, showErrors = false }) {
  const [live, setLive] = React.useState(isLive);
  const handleEdit = () => setLive(true);

  const isMobile = width < 720;
  const isTablet = width >= 720 && width < 1100;
  const isDesktop = width >= 1100;

  return (
    <div style={{
      width, height, overflow: 'auto',
      fontFamily: A.sans, color: A.ink, background: '#fff',
      WebkitFontSmoothing: 'antialiased',
      position: 'relative',
    }}>
      <style>{`@keyframes roi-pulse{0%{transform:scale(1);opacity:.35}70%{transform:scale(2.4);opacity:0}100%{transform:scale(2.4);opacity:0}}`}</style>

      <AHeader width={width} />
      <AHero width={width} />
      <AInputMethod width={width} />

      {/* Form + Live panel layout */}
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: isMobile ? '12px 20px 24px' : '24px 40px 80px',
        display: 'grid',
        gridTemplateColumns: isDesktop ? '1fr 380px' : '1fr',
        gap: isDesktop ? 56 : 32,
        alignItems: 'flex-start',
      }}>
        <AForm width={width} onCalculate={() => setLive(true)} showErrors={showErrors} />
        {!isMobile && !isTablet && <ALiveEstimate width={Math.min(380, width - 80)} isLive={live} onEdit={handleEdit} sticky />}
        {isTablet && <ALiveEstimate width={width - 80} isLive={live} onEdit={handleEdit} sticky={false} />}
      </div>

      {isMobile && <ABottomDrawer width={width} isLive={live} onEdit={handleEdit} />}

      {/* footer */}
      <footer style={{
        borderTop: `1px solid ${A.line}`, padding: isMobile ? '20px' : '28px 40px',
        fontSize: 12, color: A.mute, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div>© 2026 EquityList</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>Privacy</span><span>Terms</span><span>Contact</span>
        </div>
      </footer>
    </div>
  );
}

Object.assign(window, { ScreenA });
