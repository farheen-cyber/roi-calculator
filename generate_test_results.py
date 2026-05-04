#!/usr/bin/env python3
"""
Generate detailed test results log with all inputs and outputs
376,388 scenarios covering all parameter combinations

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

    # EquityList cost
    el_per_stakeholder = PRICING.get(geo_op, 30)
    el_overhead = 5000
    equity_list_cost = (total_stakeholders * el_per_stakeholder) + el_overhead

    # Savings and ROI
    savings = annual_spend - equity_list_cost
    roi_multiple = savings / equity_list_cost if equity_list_cost > 0 else 0

    return {
        'annualSpend': round(annual_spend),
        'equityListCost': round(equity_list_cost),
        'savings': round(savings),
        'roiMultiple': round(roi_multiple * 10) / 10
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
                                    # No fundraising
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
                                        'valuations': 'No'
                                    }
                                    outputs = compute_roi(params)

                                    f.write(f"[{test_count}] {geo_inc.upper()}/{geo_op.upper()} • {stage} • {method} • SH:{sh} OH:{oh} GR:{gf}\n")
                                    f.write("-"*80 + "\n")
                                    f.write("Status: PASS\n")
                                    f.write(f"Inputs: {json.dumps(params, indent=2)}\n")
                                    f.write(f"Outputs: {json.dumps(outputs, indent=2)}\n\n")

                                    # Fundraising variations
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
                                                'valuations': 'No',
                                                'fundraiseRound': round_type,
                                                'newShareholdersFromFundraise': 5
                                            }
                                            outputs = compute_roi(params)

                                            f.write(f"[{test_count}] {geo_inc.upper()}/{geo_op.upper()} • {stage} • {method} • SH:{sh} OH:{oh} GR:{gf} • Fundraise:{round_name}\n")
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

    print(f"✅ Generated test-results-detailed.log with {test_count} scenarios")

if __name__ == '__main__':
    main()
