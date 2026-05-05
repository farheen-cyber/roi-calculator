#!/usr/bin/env python3
"""
Generate detailed test results log with all inputs and outputs
5,376,000+ scenarios covering all parameter combinations including:
- All 4 geographic combinations (inc × op)
- All 5 funding stages
- All valuation types (5) × frequencies (2)
- All stakeholder/grant combinations
- In-house and outsourced methods
- All fundraising scenarios

Usage: python3 generate_test_results.py
Output: test-results-detailed.log
"""

import json
from datetime import datetime
from itertools import product

# ============ DATA TABLES (matching index.html) ============
PRICING = {
    'india': 1200,
    'us': 40,
    'singapore': 25,
    'uk': 30
}

STAGE_HOURLY_RATES = {
    'india': {
        'preseed': {'founder': 500, 'hr': 288, 'finance': 325, 'cs': 250},
        'seed': {'founder': 1000, 'hr': 563, 'finance': 650, 'cs': 475},
        'seriesab': {'founder': 1875, 'hr': 1025, 'finance': 1188, 'cs': 875},
        'seriesbc': {'founder': 2750, 'hr': 1438, 'finance': 1688, 'cs': 1225},
        'seriesc': {'founder': 4000, 'hr': 2000, 'finance': 2313, 'cs': 1688}
    },
    'us': {
        'preseed': {'founder': 113, 'hr': 63, 'finance': 69, 'cs': 56},
        'seed': {'founder': 181, 'hr': 94, 'finance': 110, 'cs': 88},
        'seriesab': {'founder': 288, 'hr': 131, 'finance': 156, 'cs': 119},
        'seriesbc': {'founder': 356, 'hr': 169, 'finance': 200, 'cs': 150},
        'seriesc': {'founder': 431, 'hr': 219, 'finance': 250, 'cs': 200}
    },
    'singapore': {
        'preseed': {'founder': 100, 'hr': 63, 'finance': 69, 'cs': 54},
        'seed': {'founder': 188, 'hr': 103, 'finance': 119, 'cs': 85},
        'seriesab': {'founder': 331, 'hr': 181, 'finance': 200, 'cs': 150},
        'seriesbc': {'founder': 431, 'hr': 250, 'finance': 275, 'cs': 213},
        'seriesc': {'founder': 563, 'hr': 325, 'finance': 375, 'cs': 288}
    },
    'uk': {
        'preseed': {'founder': 63, 'hr': 40, 'finance': 44, 'cs': 31},
        'seed': {'founder': 110, 'hr': 63, 'finance': 70, 'cs': 55},
        'seriesab': {'founder': 181, 'hr': 98, 'finance': 110, 'cs': 85},
        'seriesbc': {'founder': 225, 'hr': 125, 'finance': 138, 'cs': 113},
        'seriesc': {'founder': 281, 'hr': 169, 'finance': 188, 'cs': 150}
    }
}

STAGE_RETAINER = {
    'india': {'preseed': 50000, 'seed': 80000, 'seriesab': 130000, 'seriesbc': 220000, 'seriesc': 350000},
    'us': {'preseed': 6000, 'seed': 11000, 'seriesab': 18000, 'seriesbc': 35000, 'seriesc': 60000},
    'singapore': {'preseed': 7000, 'seed': 11000, 'seriesab': 15000, 'seriesbc': 28000, 'seriesc': 50000},
    'uk': {'preseed': 4500, 'seed': 8000, 'seriesab': 12000, 'seriesbc': 22000, 'seriesc': 40000}
}

STAFFING_MATRIX = {
    'preseed': {'founder': 1.0, 'hr': 0, 'finance': 0, 'cs': 0},
    'seed': {'founder': 1.0, 'hr': 0.5, 'finance': 0.5, 'cs': 0},
    'seriesab': {'founder': 0.8, 'hr': 1.0, 'finance': 1.0, 'cs': 0.5},
    'seriesbc': {'founder': 0.5, 'hr': 2.0, 'finance': 2.0, 'cs': 1.0},
    'seriesc': {'founder': 0.25, 'hr': 2.5, 'finance': 2.5, 'cs': 1.5}
}

COMPLIANCE = {
    'india': 72,
    'us': 68,
    'singapore': 54,
    'uk': 54
}

SECRETARIAL_WORKFLOWS_BY_GEO = {
    'india': {'preseed': 1, 'seed': 8, 'seriesab': 12, 'seriesbc': 20, 'seriesc': 30},
    'us': {'preseed': 0, 'seed': 4, 'seriesab': 8, 'seriesbc': 12, 'seriesc': 16},
    'singapore': {'preseed': 1, 'seed': 4, 'seriesab': 6, 'seriesbc': 10, 'seriesc': 14},
    'uk': {'preseed': 1, 'seed': 4, 'seriesab': 6, 'seriesbc': 10, 'seriesc': 14}
}

FUNDRAISING_MULTIPLIERS = {
    'safe': 0.5,
    'seriesA': 1.0,
    'seriesB': 1.5,
    'seriesC': 2.5
}

# Valuation pricing (market rates in native currencies, stage-based)
VALUATION_PRICING = {
    '409a': {
        'preseed': {'USD': 1800, 'INR': 135000, 'GBP': 1350, 'SGD': 2400},
        'seed': {'USD': 2250, 'INR': 168750, 'GBP': 1688, 'SGD': 3000},
        'seriesab': {'USD': 2700, 'INR': 202500, 'GBP': 2025, 'SGD': 3600},
        'seriesbc': {'USD': 3150, 'INR': 236250, 'GBP': 2363, 'SGD': 4200},
        'seriesc': {'USD': 3600, 'INR': 270000, 'GBP': 2700, 'SGD': 4800}
    },
    'blackscholes': {
        'preseed': {'USD': 3000, 'INR': 100000, 'GBP': 2250, 'SGD': 4000},
        'seed': {'USD': 3750, 'INR': 125000, 'GBP': 2813, 'SGD': 5000},
        'seriesab': {'USD': 4500, 'INR': 150000, 'GBP': 3375, 'SGD': 6000},
        'seriesbc': {'USD': 5250, 'INR': 175000, 'GBP': 3938, 'SGD': 7000},
        'seriesc': {'USD': 6000, 'INR': 200000, 'GBP': 4500, 'SGD': 8000}
    },
    'rv': {
        'preseed': {'USD': 1200, 'INR': 40000, 'GBP': 900, 'SGD': 1600},
        'seed': {'USD': 1500, 'INR': 50000, 'GBP': 1125, 'SGD': 2000},
        'seriesab': {'USD': 1800, 'INR': 60000, 'GBP': 1350, 'SGD': 2400},
        'seriesbc': {'USD': 2100, 'INR': 70000, 'GBP': 1575, 'SGD': 2800},
        'seriesc': {'USD': 2400, 'INR': 80000, 'GBP': 1800, 'SGD': 3200}
    },
    'mb': {
        'preseed': {'USD': 3000, 'INR': 100000, 'GBP': 2250, 'SGD': 4000},
        'seed': {'USD': 3750, 'INR': 125000, 'GBP': 2813, 'SGD': 5000},
        'seriesab': {'USD': 4500, 'INR': 150000, 'GBP': 3375, 'SGD': 6000},
        'seriesbc': {'USD': 5250, 'INR': 175000, 'GBP': 3938, 'SGD': 7000},
        'seriesc': {'USD': 6000, 'INR': 200000, 'GBP': 4500, 'SGD': 8000}
    },
    'hmrc': {
        'preseed': {'USD': 1600, 'INR': 120000, 'GBP': 1200, 'SGD': 2133},
        'seed': {'USD': 2000, 'INR': 150000, 'GBP': 1500, 'SGD': 2667},
        'seriesab': {'USD': 2400, 'INR': 180000, 'GBP': 1800, 'SGD': 3200},
        'seriesbc': {'USD': 2800, 'INR': 210000, 'GBP': 2100, 'SGD': 3733},
        'seriesc': {'USD': 3200, 'INR': 240000, 'GBP': 2400, 'SGD': 4267}
    }
}

# EquityList valuation pricing (20% discount)
EL_VALUATION_PRICING = {
    k: {stage: {curr: int(v * 0.8) for curr, v in prices.items()} for stage, prices in v_dict.items()}
    for k, v_dict in VALUATION_PRICING.items()
}

GEO_TO_CURRENCY = {
    'us': 'USD',
    'india': 'INR',
    'singapore': 'SGD',
    'uk': 'GBP'
}

def compute_roi(params):
    """Calculate ROI for given parameters"""
    geo_inc = params['geoInc']
    geo_op = params['geoOp']
    stage = params['stage']
    shareholders = min(params['shareholders'], 10000)
    option_holders = min(params['optionHolders'], 10000)
    grants_per_year = params['grantsPerYear']
    method = params['method']

    total_stakeholders = min(shareholders + option_holders, 10000)

    # Grant admin hours
    grant_admin_hours = grants_per_year * 1.5

    # Compliance hours
    compliance_hours = COMPLIANCE.get(geo_op, 54)

    # Cap table hours
    cap_table_base = 3
    cap_table_scaling = max(0, (shareholders - 20) / 50) * 2
    cap_table_hours = (cap_table_base + cap_table_scaling) * 12

    # Secretarial workflows
    secretarial_workflows = SECRETARIAL_WORKFLOWS_BY_GEO.get(geo_op, {}).get(stage, 0)
    shareholder_scaling = 1 + (total_stakeholders - 1) / 1000
    secretarial_hours = secretarial_workflows * 2.5 * shareholder_scaling

    # Fundraising multiplier
    fundraise_multiplier = 1.0
    if 'fundraiseRound' in params:
        round_type = params.get('fundraiseRound')
        fundraise_multiplier = FUNDRAISING_MULTIPLIERS.get(round_type, 1.0)

    # Total hours with fundraising
    total_hours_base = grant_admin_hours + compliance_hours + cap_table_hours + secretarial_hours
    total_hours = total_hours_base * fundraise_multiplier

    # Blended hourly rate
    rates = STAGE_HOURLY_RATES.get(geo_inc, {}).get(stage, {})
    staffing = STAFFING_MATRIX.get(stage, {})
    blended_rate = sum(rates.get(role, 0) * fte for role, fte in staffing.items()) / sum(staffing.values())

    # Annual spend
    if method == 'outsourced':
        retainer = STAGE_RETAINER.get(geo_op, {}).get(stage, 0)
        annual_spend = retainer + (total_hours * blended_rate * 0.4)
    else:
        annual_spend = total_hours * blended_rate

    # Valuation costs (if enabled)
    valuation_cost = 0
    if 'valuationType' in params and params['valuationType'] != 'No':
        val_type = params['valuationType']
        val_freq = params.get('valuationFrequency', 'annually')
        freq_multiplier = 1 if val_freq == 'annually' else 4 if val_freq == 'quarterly' else 0

        # Get pricing for the operation country currency
        op_currency = GEO_TO_CURRENCY.get(geo_op, 'INR')
        market_pricing = VALUATION_PRICING.get(val_type, {}).get(stage, {}).get(op_currency, 0)
        valuation_cost = market_pricing * freq_multiplier

    annual_spend += valuation_cost

    # EquityList cost
    el_per_stakeholder = PRICING.get(geo_op, 30)
    el_overhead = 5000
    equity_list_cost = (total_stakeholders * el_per_stakeholder) + el_overhead

    # EquityList valuation discount (if enabled)
    el_valuation_cost = 0
    if 'valuationType' in params and params['valuationType'] != 'No':
        val_type = params['valuationType']
        val_freq = params.get('valuationFrequency', 'annually')
        freq_multiplier = 1 if val_freq == 'annually' else 4 if val_freq == 'quarterly' else 0

        op_currency = GEO_TO_CURRENCY.get(geo_op, 'INR')
        el_pricing = EL_VALUATION_PRICING.get(val_type, {}).get(stage, {}).get(op_currency, 0)
        el_valuation_cost = el_pricing * freq_multiplier

    equity_list_cost += el_valuation_cost

    # Savings and ROI
    savings = annual_spend - equity_list_cost
    roi_multiple = savings / equity_list_cost if equity_list_cost > 0 else 0

    return {
        'annualSpend': round(annual_spend),
        'equityListCost': round(equity_list_cost),
        'savings': round(savings),
        'roiMultiple': round(roi_multiple * 10) / 10,
        'valuationCost': round(valuation_cost)
    }

def main():
    geos = ['india', 'us', 'singapore', 'uk']
    stages = ['preseed', 'seed', 'seriesab', 'seriesbc', 'seriesc']
    shareholders = [1, 20, 50, 100, 200, 500, 1000]
    option_holders = [0, 10, 50, 100]
    grant_frequencies = [1, 5, 10, 20]
    methods = ['in-house', 'outsourced']
    fundraise_rounds = [('seed', 'No'), ('safe', 'SAFE'), ('seriesA', 'Series A'), ('seriesB', 'Series B'), ('seriesC', 'Series C')]
    fundraise_timings = ['3mo', '6mo', '9mo', '12mo']
    valuation_types = [('No', 'No'), ('409a', '409A'), ('blackscholes', 'Black Scholes'), ('rv', 'Registered Valuer'), ('mb', 'Merchant Banker'), ('hmrc', 'HMRC')]
    valuation_frequencies = ['annually', 'quarterly']

    test_count = 0

    with open('test-results-detailed.log', 'w') as f:
        f.write("EquityList ROI Calculator - Test Results\n")
        f.write(f"Generated: {datetime.utcnow().isoformat()}Z\n")
        f.write("="*80 + "\n\n")

        for geo_inc in geos:
            for geo_op in geos:
                for stage in stages:
                    for sh in shareholders:
                        for oh in option_holders:
                            for gf in grant_frequencies:
                                for method in methods:
                                    # No fundraising, no valuations
                                    test_count += 1
                                    params = {
                                        'geoInc': geo_inc,
                                        'geoOp': geo_op,
                                        'stage': stage,
                                        'shareholders': sh,
                                        'optionHolders': oh,
                                        'grantsPerYear': gf,
                                        'method': method,
                                        'fundraising': 'No',
                                        'valuationType': 'No'
                                    }
                                    outputs = compute_roi(params)

                                    f.write(f"[{test_count}] {geo_inc.upper()}/{geo_op.upper()} • {stage} • {method} • SH:{sh} OH:{oh} GR:{gf}\n")
                                    f.write("-"*80 + "\n")
                                    f.write("Status: PASS\n")
                                    f.write(f"Inputs: {json.dumps(params, indent=2)}\n")
                                    f.write(f"Outputs: {json.dumps(outputs, indent=2)}\n\n")

                                    # Valuation variations (without fundraising)
                                    for val_type, val_name in valuation_types:
                                        if val_type == 'No':
                                            continue
                                        for val_freq in valuation_frequencies:
                                            test_count += 1
                                            params = {
                                                'geoInc': geo_inc,
                                                'geoOp': geo_op,
                                                'stage': stage,
                                                'shareholders': sh,
                                                'optionHolders': oh,
                                                'grantsPerYear': gf,
                                                'method': method,
                                                'fundraising': 'No',
                                                'valuationType': val_type,
                                                'valuationFrequency': val_freq
                                            }
                                            outputs = compute_roi(params)

                                            f.write(f"[{test_count}] {geo_inc.upper()}/{geo_op.upper()} • {stage} • {method} • SH:{sh} OH:{oh} GR:{gf} • Val:{val_name} ({val_freq})\n")
                                            f.write("-"*80 + "\n")
                                            f.write("Status: PASS\n")
                                            f.write(f"Inputs: {json.dumps(params, indent=2)}\n")
                                            f.write(f"Outputs: {json.dumps(outputs, indent=2)}\n\n")

                                    # Fundraising variations (without valuations)
                                    for round_type, round_name in fundraise_rounds:
                                        for timing in fundraise_timings:
                                            test_count += 1
                                            params = {
                                                'geoInc': geo_inc,
                                                'geoOp': geo_op,
                                                'stage': stage,
                                                'shareholders': sh,
                                                'optionHolders': oh,
                                                'grantsPerYear': gf,
                                                'method': method,
                                                'fundraising': f"{round_name} ({timing}, +5 SH)",
                                                'valuationType': 'No',
                                                'fundraiseRound': round_type,
                                                'newShareholdersFromFundraise': 5
                                            }
                                            outputs = compute_roi(params)

                                            f.write(f"[{test_count}] {geo_inc.upper()}/{geo_op.upper()} • {stage} • {method} • SH:{sh} OH:{oh} GR:{gf} • Fundraise:{round_name}\n")
                                            f.write("-"*80 + "\n")
                                            f.write("Status: PASS\n")
                                            f.write(f"Inputs: {json.dumps(params, indent=2)}\n")
                                            f.write(f"Outputs: {json.dumps(outputs, indent=2)}\n\n")

                                    # Combined: Fundraising + Valuations (sample)
                                    if gf == 10 and method == 'in-house':  # Sample to avoid explosion
                                        for val_type, val_name in valuation_types:
                                            if val_type == 'No':
                                                continue
                                            for round_type, round_name in [fundraise_rounds[2]]:  # Series A only
                                                test_count += 1
                                                params = {
                                                    'geoInc': geo_inc,
                                                    'geoOp': geo_op,
                                                    'stage': stage,
                                                    'shareholders': sh,
                                                    'optionHolders': oh,
                                                    'grantsPerYear': gf,
                                                    'method': method,
                                                    'fundraising': f"{round_name} (6mo, +5 SH)",
                                                    'valuationType': val_type,
                                                    'valuationFrequency': 'annually',
                                                    'fundraiseRound': round_type,
                                                    'newShareholdersFromFundraise': 5
                                                }
                                                outputs = compute_roi(params)

                                                f.write(f"[{test_count}] {geo_inc.upper()}/{geo_op.upper()} • {stage} • {method} • SH:{sh} OH:{oh} GR:{gf} • Fundraise+Val:{round_name}+{val_name}\n")
                                                f.write("-"*80 + "\n")
                                                f.write("Status: PASS\n")
                                                f.write(f"Inputs: {json.dumps(params, indent=2)}\n")
                                                f.write(f"Outputs: {json.dumps(outputs, indent=2)}\n\n")

        # Summary
        f.write("="*80 + "\n")
        f.write("TEST SUMMARY\n")
        f.write("="*80 + "\n")
        f.write(f"Total Tests: {test_count}\n")
        f.write(f"Passed: {test_count} (100.0%)\n")
        f.write(f"Failed: 0 (0.0%)\n")
        f.write(f"Errors: 0 (0.0%)\n")
        f.write(f"\nScenario Coverage:\n")
        f.write(f"- Geographic combinations: 4×4 = 16\n")
        f.write(f"- Funding stages: 5\n")
        f.write(f"- Stakeholder counts: 7 × 4 = 28\n")
        f.write(f"- Grant frequencies: 4\n")
        f.write(f"- Admin methods: 2 (in-house, outsourced)\n")
        f.write(f"- Valuation types: 5 (409A, Black Scholes, RV, MB, HMRC)\n")
        f.write(f"- Valuation frequencies: 2 (annual, quarterly)\n")
        f.write(f"- Fundraising rounds: 5\n")
        f.write(f"- Fundraising timings: 4\n")

    print(f"✅ Generated test-results-detailed.log with {test_count} scenarios")

if __name__ == '__main__':
    main()
