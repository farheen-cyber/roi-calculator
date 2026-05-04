/**
 * Direction A - React App Component
 * Main app logic with form state, validation, calculation, and live estimate updates
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TOKENS } from './tokens.js';
import {
  MonoLabel, SectionHeader, Caption, FormField, Dropdown, Switch,
  PrimaryBtn, GhostBtn, StatusChip, StatCell, formatCurrency
} from './direction-a-primitives.jsx';
import { CUR, PRICING, STAGE_HOURLY_RATES, STAGE_RETAINER, STAFFING_MATRIX, SECRETARIAL_WORKFLOWS_BY_GEO, FUNDRAISING_WORKFLOWS, VALUATION_TYPES, COMPLIANCE } from './data.js';
import { computeROI } from './roi-calculator.js';

const T = TOKENS;

// ========== MAIN APP COMPONENT ==========

export default function DirectionAApp() {
  // ========== FORM STATE ==========
  const [formData, setFormData] = useState(() => {
    const saved = loadFormState();
    return saved || {
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
  });

  // ========== RESULTS & STATE ==========
  const [results, setResults] = useState(null);
  const [isStale, setIsStale] = useState(false);
  const [errors, setErrors] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    fundraising: formData.fundraising,
    valuation: formData.valuation,
  });

  // Track if using sample data
  const isUsingSampleData = useCallback(() => {
    return !!(
      formData.geoInc === 'india' &&
      formData.geoOp === 'india' &&
      formData.stage === 'seriesab' &&
      formData.shareholders === 30 &&
      formData.optionHolders === 15 &&
      formData.grants === 10 &&
      formData.method === 'in-house'
    );
  }, [formData]);

  // ========== FORM VALUE HANDLERS ==========

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user edits
    setErrors(prev => ({
      ...prev,
      [field]: '',
    }));
    setIsStale(true);
  }, []);

  const handleSwitchToggle = useCallback((field, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked,
    }));
    setExpandedSections(prev => ({
      ...prev,
      [field]: checked,
    }));
    setIsStale(true);
  }, []);

  // ========== VALIDATION ==========

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.geoInc) {
      newErrors.geoInc = 'Please select a country';
    }
    if (!formData.geoOp) {
      newErrors.geoOp = 'Please select a country';
    }
    if (!formData.stage) {
      newErrors.stage = 'Please select a stage';
    }
    if (!formData.method) {
      newErrors.method = 'Please select a method';
    }
    if (formData.shareholders === '' || formData.shareholders === null) {
      newErrors.shareholders = 'Number of shareholders required';
    } else if (formData.shareholders < 0 || isNaN(formData.shareholders)) {
      newErrors.shareholders = 'Must be a positive number';
    }
    if (formData.optionHolders === '' || formData.optionHolders === null) {
      newErrors.optionHolders = 'Number of option holders required';
    } else if (formData.optionHolders < 0 || isNaN(formData.optionHolders)) {
      newErrors.optionHolders = 'Must be a positive number';
    }
    if (formData.grants === '' || formData.grants === null) {
      newErrors.grants = 'Grants per year required';
    } else if (formData.grants < 0 || isNaN(formData.grants)) {
      newErrors.grants = 'Must be a positive number';
    }

    return newErrors;
  }, [formData]);

  // ========== CALCULATION ==========

  const handleCalculate = useCallback(() => {
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const input = {
        geo_inc: formData.geoInc,
        geo_op: formData.geoOp,
        stage: formData.stage,
        meth: formData.method,
        sh: parseInt(formData.shareholders) || 0,
        oh: parseInt(formData.optionHolders) || 0,
        gr: parseInt(formData.grants) || 0,
        fundraising: formData.fundraising ? {
          type: formData.fundraisingType,
          timing: formData.fundraisingTiming,
        } : null,
        valuation: formData.valuation ? {
          type: formData.valuationType,
          frequency: formData.valuationFrequency,
        } : null,
      };

      const calculationResults = computeROI(
        input,
        STAGE_HOURLY_RATES,
        COMPLIANCE,
        {},
        PRICING,
        STAGE_HOURLY_RATES,
        STAGE_RETAINER,
        STAFFING_MATRIX,
        SECRETARIAL_WORKFLOWS_BY_GEO,
        FUNDRAISING_WORKFLOWS,
        {}
      );

      setResults(calculationResults);
      setIsStale(false);
      saveFormState(formData);
    } catch (error) {
      console.error('Calculation error:', error);
      setErrors({ _global: 'Calculation error: ' + error.message });
    }
  }, [formData, validateForm]);

  const handleReset = useCallback(() => {
    const defaultForm = {
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
    setFormData(defaultForm);
    setResults(null);
    setIsStale(false);
    setErrors({});
    setExpandedSections({ fundraising: false, valuation: false });
    clearFormState();
  }, []);

  // ========== PERSISTENCE ==========

  const saveFormState = useCallback((data) => {
    const scope = 'roi-calc:v3:form';
    localStorage.setItem(scope, JSON.stringify(data));
    localStorage.setItem('roi-calc:v3:timestamp', new Date().toISOString());
  }, []);

  // ========== LIVE ESTIMATE PANEL ==========

  const renderLiveEstimate = () => {
    const currency = CUR[formData.geoOp] || '₹';

    if (!results && !isStale) {
      return (
        <div style={{
          padding: '24px',
          textAlign: 'center',
          color: T.colors.mute,
        }}>
          Calculate to see ROI estimate
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Stale banner */}
        {isStale && (
          <div style={{
            padding: '14px',
            background: `linear-gradient(135deg, ${T.colors.amber}25 0%, ${T.colors.amber}10 100%)`,
            borderRadius: '8px',
            border: `1px solid ${T.colors.amber}40`,
            borderLeft: `4px solid ${T.colors.amber}`,
            color: T.colors.amber,
            fontSize: '13px',
            fontWeight: 500,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '16px' }}>⚠</span>
            <span>Results outdated — click Calculate to update</span>
          </div>
        )}

        {/* Status chip */}
        {results && (
          <StatusChip type={isUsingSampleData() ? 'sample' : 'live'} />
        )}

        {/* Results */}
        {results && (
          <>
            {/* Hero: Annual Savings */}
            <div style={{
              textAlign: 'center',
              padding: '24px',
              background: `linear-gradient(135deg, ${T.colors.green}15 0%, ${T.colors.green}05 100%)`,
              border: `1px solid ${T.colors.green}30`,
              borderRadius: '12px',
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '1.4px',
                textTransform: 'uppercase',
                color: T.colors.mute,
                marginBottom: '8px',
              }}>
                Annual Savings
              </div>
              <div style={{
                fontSize: '32px',
                fontWeight: 600,
                color: T.colors.green,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {formatCurrency(results.diff || 0, currency)}
              </div>
              {results.roi !== undefined && (
                <div style={{
                  fontSize: '12px',
                  color: T.colors.mute,
                  marginTop: '8px',
                }}>
                  {((results.roi || 0) * 100).toFixed(0)}% ROI
                </div>
              )}
            </div>

            {/* 2×2 Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}>
              <StatCell
                label="Your Annual Cost"
                value={formatCurrency(results.annCost || 0, currency)}
              />
              <StatCell
                label="EquityList Annual Cost"
                value={formatCurrency(results.elAnn || 0, currency)}
              />
              {results.extInt && (
                <>
                  <StatCell
                    label="External Support (per year)"
                    value={formatCurrency(results.extInt || 0, currency)}
                  />
                  <StatCell
                    label="Implementation Time"
                    value={results.impl ? `${results.impl} weeks` : '—'}
                  />
                </>
              )}
            </div>

            {/* Cost Breakdown */}
            {results.costBreakdown && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px',
                backgroundColor: T.colors.gray50,
                borderRadius: '8px',
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: T.colors.mute,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  Cost Breakdown
                </div>
                {results.costBreakdown.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    padding: '8px 0',
                    borderBottom: idx < results.costBreakdown.length - 1 ? `1px solid ${T.colors.gray200}` : 'none',
                  }}>
                    <span style={{ fontSize: '13px', color: T.colors.mute }}>
                      {item.label}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: T.colors.ink,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {formatCurrency(item.value, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // ========== RENDER ==========

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: T.spacing.lg,
      padding: `${T.spacing.lg} ${T.spacing.xl}`,
    }}>
      {/* COMPANY BASICS */}
      <section>
        <SectionHeader>Company Basics</SectionHeader>
        <Dropdown
          label="Country of Incorporation"
          id="field-geo-inc"
          options={[
            ['india', 'India'],
            ['us', 'United States'],
            ['singapore', 'Singapore'],
            ['uk', 'United Kingdom'],
          ]}
          value={formData.geoInc}
          onChange={(e) => handleFieldChange('geoInc', e.target.value)}
          error={errors.geoInc}
        />
        <Dropdown
          label="Country of Operation"
          id="field-geo-op"
          options={[
            ['india', 'India'],
            ['us', 'United States'],
            ['singapore', 'Singapore'],
            ['uk', 'United Kingdom'],
          ]}
          value={formData.geoOp}
          onChange={(e) => handleFieldChange('geoOp', e.target.value)}
          error={errors.geoOp}
        />
        <Dropdown
          label="Funding Stage"
          id="field-stage"
          options={[
            ['preseed', 'Pre-seed'],
            ['seed', 'Seed'],
            ['seriesab', 'Series A/B'],
            ['seriesbc', 'Series B/C'],
            ['seriesc', 'Series C+'],
          ]}
          value={formData.stage}
          onChange={(e) => handleFieldChange('stage', e.target.value)}
          error={errors.stage}
        />
        <Dropdown
          label="How do you administer equity?"
          id="field-method"
          options={[
            ['in-house', 'In-house (with HR/Finance staff)'],
            ['outsourced', 'Outsourced (CA or law firm)'],
          ]}
          value={formData.method}
          onChange={(e) => handleFieldChange('method', e.target.value)}
          error={errors.method}
        />
      </section>

      {/* EQUITY STRUCTURE */}
      <section>
        <SectionHeader>Equity Structure</SectionHeader>
        <FormField
          label="Number of Shareholders"
          id="field-shareholders"
          type="number"
          value={formData.shareholders}
          onChange={(e) => handleFieldChange('shareholders', parseInt(e.target.value) || e.target.value)}
          error={errors.shareholders}
        />
        <FormField
          label="Number of Option Holders"
          id="field-option-holders"
          type="number"
          value={formData.optionHolders}
          onChange={(e) => handleFieldChange('optionHolders', parseInt(e.target.value) || e.target.value)}
          error={errors.optionHolders}
        />
        <FormField
          label="Grants Per Year"
          id="field-grants"
          type="number"
          value={formData.grants}
          onChange={(e) => handleFieldChange('grants', parseInt(e.target.value) || e.target.value)}
          error={errors.grants}
        />
      </section>

      {/* OPTIONAL: FUNDRAISING */}
      <section>
        <Switch
          label="Planning a fundraising round?"
          id="field-fundraising"
          checked={formData.fundraising}
          onChange={(e) => handleSwitchToggle('fundraising', e.target.checked)}
        />
        {expandedSections.fundraising && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: T.spacing.md }}>
            <Dropdown
              label="Round Type"
              id="field-fundraising-type"
              options={[
                ['safe', 'SAFE'],
                ['bridge', 'Bridge'],
                ['seed', 'Seed'],
                ['seriesab', 'Series A/B'],
                ['seriesbc', 'Series B/C'],
              ]}
              value={formData.fundraisingType}
              onChange={(e) => handleFieldChange('fundraisingType', e.target.value)}
            />
            <Dropdown
              label="When?"
              id="field-fundraising-timing"
              options={[
                ['within-12-months', 'Within 12 months'],
                ['6-12-months', '6-12 months'],
                ['3-6-months', '3-6 months'],
                ['next-month', 'Next month'],
              ]}
              value={formData.fundraisingTiming}
              onChange={(e) => handleFieldChange('fundraisingTiming', e.target.value)}
            />
          </div>
        )}
      </section>

      {/* OPTIONAL: VALUATION */}
      <section>
        <Switch
          label="Need valuation services?"
          id="field-valuation"
          checked={formData.valuation}
          onChange={(e) => handleSwitchToggle('valuation', e.target.checked)}
        />
        {expandedSections.valuation && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: T.spacing.md }}>
            <Dropdown
              label="Valuation Type"
              id="field-valuation-type"
              options={VALUATION_TYPES.map(v => [v.name, v.name])}
              value={formData.valuationType}
              onChange={(e) => handleFieldChange('valuationType', e.target.value)}
            />
            <Dropdown
              label="Frequency"
              id="field-valuation-frequency"
              options={[
                ['annual', 'Annual'],
                ['quarterly', 'Quarterly'],
              ]}
              value={formData.valuationFrequency}
              onChange={(e) => handleFieldChange('valuationFrequency', e.target.value)}
            />
          </div>
        )}
      </section>

      {/* ACTION BUTTONS */}
      <div style={{
        display: 'flex',
        gap: T.spacing.md,
        marginTop: T.spacing.xl,
      }}>
        <PrimaryBtn onClick={handleCalculate}>Calculate ROI</PrimaryBtn>
        <GhostBtn onClick={handleReset}>Reset</GhostBtn>
      </div>

      {/* GLOBAL ERROR */}
      {errors._global && (
        <div style={{
          padding: T.spacing.md,
          backgroundColor: `${T.colors.red}10`,
          border: `1px solid ${T.colors.red}30`,
          borderRadius: '8px',
          color: T.colors.red,
          fontSize: '13px',
        }}>
          {errors._global}
        </div>
      )}
    </div>
  );
}

// ========== UTILITIES ==========

function loadFormState() {
  const scope = 'roi-calc:v3:form';
  const saved = localStorage.getItem(scope);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load form state:', e);
      return null;
    }
  }
  return null;
}

function clearFormState() {
  localStorage.removeItem('roi-calc:v3:form');
  localStorage.removeItem('roi-calc:v3:timestamp');
}
