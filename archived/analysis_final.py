"""
Final comprehensive analysis - CA retainer vs In-house cost comparison
Uses multiplier 0.2 (current value in code)
"""

import itertools
from collections import defaultdict

# Actual data tables from the calculator
STAGE_HOURLY_RATES = {
    'india': {
        'preseed': {'founder': 500, 'hr': 288, 'finance': 325, 'cs': 250},
        'seed': {'founder': 1000, 'hr': 563, 'finance': 650, 'cs': 475},
        'seriesab': {'founder': 1875, 'hr': 1025, 'finance': 1188, 'cs': 875},
        'seriesbc': {'founder': 2750, 'hr': 1438, 'finance': 1688, 'cs': 1225},
        'seriesc': {'founder': 4000, 'hr': 2000, 'finance': 2313, 'cs': 1688},
    },
    'us': {
        'preseed': {'founder': 113, 'hr': 63, 'finance': 69, 'cs': 56},
        'seed': {'founder': 181, 'hr': 94, 'finance': 110, 'cs': 88},
        'seriesab': {'founder': 288, 'hr': 131, 'finance': 156, 'cs': 119},
        'seriesbc': {'founder': 356, 'hr': 169, 'finance': 200, 'cs': 150},
        'seriesc': {'founder': 431, 'hr': 219, 'finance': 250, 'cs': 200},
    },
    'singapore': {
        'preseed': {'founder': 100, 'hr': 63, 'finance': 69, 'cs': 54},
        'seed': {'founder': 188, 'hr': 103, 'finance': 119, 'cs': 85},
        'seriesab': {'founder': 331, 'hr': 181, 'finance': 200, 'cs': 150},
        'seriesbc': {'founder': 431, 'hr': 250, 'finance': 275, 'cs': 213},
        'seriesc': {'founder': 563, 'hr': 325, 'finance': 375, 'cs': 288},
    },
    'uk': {
        'preseed': {'founder': 63, 'hr': 40, 'finance': 44, 'cs': 31},
        'seed': {'founder': 110, 'hr': 63, 'finance': 70, 'cs': 55},
        'seriesab': {'founder': 181, 'hr': 98, 'finance': 110, 'cs': 85},
        'seriesbc': {'founder': 225, 'hr': 125, 'finance': 138, 'cs': 113},
        'seriesc': {'founder': 281, 'hr': 169, 'finance': 188, 'cs': 150},
    },
}

STAGE_RETAINER = {
    'india': {'preseed': 60000, 'seed': 90000, 'seriesab': 151000, 'seriesbc': 256000, 'seriesc': 407000},
    'us': {'preseed': 6000, 'seed': 11000, 'seriesab': 18000, 'seriesbc': 35000, 'seriesc': 60000},
    'singapore': {'preseed': 10000, 'seed': 16000, 'seriesab': 21000, 'seriesbc': 40000, 'seriesc': 71000},
    'uk': {'preseed': 4500, 'seed': 8000, 'seriesab': 12000, 'seriesbc': 22000, 'seriesc': 40000},
}

STAFFING_MATRIX = {
    'preseed': {'founder': 1.0, 'hr': 0.0, 'finance': 0.0, 'cs': 0.0},
    'seed': {'founder': 0.5, 'hr': 0.25, 'finance': 0.25, 'cs': 0.0},
    'seriesab': {'founder': 0.15, 'hr': 0.25, 'finance': 0.35, 'cs': 0.25},
    'seriesbc': {'founder': 0.05, 'hr': 0.3, 'finance': 0.35, 'cs': 0.3},
    'seriesc': {'founder': 0.02, 'hr': 0.25, 'finance': 0.35, 'cs': 0.38},
}

COMPLIANCE = {'india': 72, 'us': 68, 'singapore': 54, 'uk': 54}

def get_dynamic_compliance_hours(stage, shareholders, oh, geo_inc, gr_new_hire, gr_refresh):
    base_hrs = COMPLIANCE[geo_inc]
    stage_scale = {'preseed': 0.5, 'seed': 0.75, 'seriesab': 1.0, 'seriesbc': 1.25, 'seriesc': 1.5}
    scale = stage_scale.get(stage, 1.0)
    
    shareholder_scale = 1 + max(0, shareholders - 10) / 100 if shareholders > 0 else 1
    option_scale = 1 + max(0, oh - 5) / 50 if oh > 0 else 1
    grant_scale = 1 + max(0, (gr_new_hire + gr_refresh) - 3) / 30 if (gr_new_hire + gr_refresh) > 0 else 1
    
    return base_hrs * scale * shareholder_scale * option_scale * grant_scale

def compute_cost(inputs, meth):
    sh = inputs.get('sh', 30)
    oh = inputs.get('oh', 15)
    gr_new_hire = inputs.get('grNewHire', 5)
    gr_refresh = inputs.get('grRefresh', 5)
    geo_inc = inputs.get('geoInc', 'india')
    stage = inputs.get('stage', 'seriesab')
    planning_to_fundraise = inputs.get('planningToFundraise', False)
    fundraise_round = inputs.get('fundraiseRound', 'seed')
    
    if geo_inc not in STAGE_HOURLY_RATES or stage not in STAFFING_MATRIX:
        return None
    
    stage_key = fundraise_round if planning_to_fundraise else stage
    
    # Calculate rate
    matrix = STAFFING_MATRIX[stage_key]
    rate = 0
    for role in ['founder', 'hr', 'finance', 'cs']:
        if role == 'hr' and oh == 0 and gr_new_hire == 0:
            continue
        fte = matrix.get(role, 0)
        if fte > 0:
            role_rate = STAGE_HOURLY_RATES[geo_inc][stage_key][role]
            rate += fte * role_rate
    
    mult = 1 if meth == 'in-house' else 0.2
    
    gr_hr = 1.5
    comp_hr = get_dynamic_compliance_hours(stage_key, sh, oh, geo_inc, gr_new_hire, gr_refresh)
    
    total_grant_admin_work = oh + gr_new_hire + gr_refresh
    gr_hrs = total_grant_admin_work * gr_hr
    gr_cost = gr_hrs * mult * rate
    cp_cost = comp_hr * mult * rate
    
    # Cap table
    ct_shareholder_scale = max(0, (sh - 20) / 50) if sh > 0 else 0
    ct_monthly_hours = (3 + (ct_shareholder_scale * 2)) if sh > 0 else 0
    ct_raw = ct_monthly_hours * 12
    ct_hrs = ct_raw * mult
    ct_cost = ct_hrs * rate
    
    # Fundraising
    round_mult = {'preseed': 0.5, 'seed': 1.0, 'seriesab': 1.5, 'seriesbc': 2.0, 'seriesc': 2.5}.get(fundraise_round, 1.0)
    ct_fundraising_hours = (3 * 2.5) * round_mult if planning_to_fundraise else 0
    ct_fundraising_hrs = ct_fundraising_hours * mult
    ct_fundraising_cost = ct_fundraising_hrs * rate
    
    sec_rate = STAGE_HOURLY_RATES[geo_inc][stage_key]['cs']
    sec_fundraising_base = (3 * 2.5) if planning_to_fundraise else 0
    sec_fundraising_hours = sec_fundraising_base * round_mult
    sec_fundraising_scaling = 1 + max(0, (sh - 20) / 100) * 0.5
    sec_fundraising_raw = sec_fundraising_hours * sec_fundraising_scaling
    sec_fundraising_hrs = sec_fundraising_raw * mult
    sec_fundraising_cost = sec_fundraising_hrs * sec_rate
    
    # Method cost (retainer for outsourced)
    method_ext_cost = STAGE_RETAINER[geo_inc][stage_key] if meth == 'outsourced' else 0
    
    ann_cost = gr_cost + cp_cost + ct_cost + ct_fundraising_cost + sec_fundraising_cost + method_ext_cost
    
    return round(ann_cost)

# Test parameters
geos = ['india', 'us', 'singapore', 'uk']
stages = ['preseed', 'seed', 'seriesab', 'seriesbc', 'seriesc']
shareholders_range = [10, 20, 30, 50, 100, 200]
option_holders_range = [0, 5, 15, 30, 50]
grants_range = [0, 3, 5, 10, 20]
fundraise_flags = [False, True]
fundraise_rounds = ['seed', 'seriesab', 'seriesc']

results = {
    'ca_cheaper_count': 0,
    'inhouse_cheaper_count': 0,
    'equal_count': 0,
    'total_tests': 0,
    'cases_ca_cheaper': [],
    'by_stage': defaultdict(lambda: {'ca_cheaper': 0, 'inhouse_cheaper': 0, 'total': 0}),
    'by_geo': defaultdict(lambda: {'ca_cheaper': 0, 'inhouse_cheaper': 0, 'total': 0}),
}

# Run all tests
for geo, stage, sh, oh, gr_new, gr_ref, fr_flag in itertools.product(
    geos, stages, shareholders_range, option_holders_range, grants_range, grants_range, fundraise_flags
):
    for fr_round in (fundraise_rounds if fr_flag else [stage]):
        inputs = {
            'sh': sh, 'oh': oh, 'grNewHire': gr_new, 'grRefresh': gr_ref,
            'geoInc': geo, 'stage': stage, 'planningToFundraise': fr_flag, 'fundraiseRound': fr_round,
        }
        
        cost_inhouse = compute_cost(inputs, 'in-house')
        cost_outsourced = compute_cost(inputs, 'outsourced')
        
        if cost_inhouse is None or cost_outsourced is None:
            continue
        
        results['total_tests'] += 1
        
        if cost_outsourced < cost_inhouse:
            results['ca_cheaper_count'] += 1
            results['cases_ca_cheaper'].append({
                'geo': geo, 'stage': stage, 'sh': sh, 'oh': oh,
                'gr_new': gr_new, 'gr_ref': gr_ref, 'fr_flag': fr_flag, 'fr_round': fr_round,
                'inhouse': cost_inhouse, 'outsourced': cost_outsourced, 'savings': cost_inhouse - cost_outsourced,
            })
            results['by_stage'][stage]['ca_cheaper'] += 1
            results['by_geo'][geo]['ca_cheaper'] += 1
        elif cost_inhouse < cost_outsourced:
            results['inhouse_cheaper_count'] += 1
            results['by_stage'][stage]['inhouse_cheaper'] += 1
            results['by_geo'][geo]['inhouse_cheaper'] += 1
        else:
            results['equal_count'] += 1
        
        results['by_stage'][stage]['total'] += 1
        results['by_geo'][geo]['total'] += 1

# Print results
print("=" * 100)
print("CA RETAINER VS IN-HOUSE COMPARISON - ACROSS ALL PERMUTATIONS (Multiplier: 0.2)")
print("=" * 100)
print()
print(f"TOTAL TEST CASES: {results['total_tests']:,}")
print()
print("SUMMARY:")
print(f"  CA Retainer Cheaper: {results['ca_cheaper_count']:,} ({100*results['ca_cheaper_count']/results['total_tests']:.1f}%)")
print(f"  In-house Cheaper:    {results['inhouse_cheaper_count']:,} ({100*results['inhouse_cheaper_count']/results['total_tests']:.1f}%)")
print(f"  Equal:               {results['equal_count']:,} ({100*results['equal_count']/results['total_tests']:.1f}%)")
print()

print("BY STAGE:")
for stage in stages:
    data = results['by_stage'][stage]
    pct = 100*data['ca_cheaper']/data['total'] if data['total'] > 0 else 0
    print(f"  {stage.upper():12} CA Cheaper: {data['ca_cheaper']:,}/{data['total']:,} ({pct:.1f}%)")
print()

print("BY GEOGRAPHY:")
for geo in geos:
    data = results['by_geo'][geo]
    pct = 100*data['ca_cheaper']/data['total'] if data['total'] > 0 else 0
    print(f"  {geo.upper():12} CA Cheaper: {data['ca_cheaper']:,}/{data['total']:,} ({pct:.1f}%)")
print()

print("EXAMPLES WHERE CA RETAINER IS CHEAPER (Top 10 by savings):")
sorted_cases = sorted(results['cases_ca_cheaper'], key=lambda x: x['savings'], reverse=True)
for i, case in enumerate(sorted_cases[:10], 1):
    print()
    print(f"  #{i}:")
    print(f"    Location: {case['geo'].upper()}, Stage: {case['stage'].upper()}")
    print(f"    Shareholders: {case['sh']}, Option Holders: {case['oh']}")
    print(f"    Grants: {case['gr_new']}/yr new hire, {case['gr_ref']}/yr refresh")
    print(f"    In-house: {case['inhouse']:,}, CA Retainer: {case['outsourced']:,}")
    print(f"    Savings: {case['savings']:,}")
print()
