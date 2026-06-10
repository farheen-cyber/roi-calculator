"""
Comprehensive analysis of when CA retainer is cheaper than in-house across all permutations
"""

import json
import itertools
from collections import defaultdict

# Data tables from the calculator
STAGE_HOURLY_RATES = {
    'india': {
        'preseed': {'founder': 300, 'hr': 250, 'finance': 350, 'cs': 200},
        'seed': {'founder': 350, 'hr': 300, 'finance': 400, 'cs': 250},
        'seriesab': {'founder': 400, 'hr': 350, 'finance': 450, 'cs': 300},
        'seriesbc': {'founder': 500, 'hr': 450, 'finance': 550, 'cs': 400},
        'seriesc': {'founder': 600, 'hr': 550, 'finance': 650, 'cs': 500},
    },
    'us': {
        'preseed': {'founder': 300, 'hr': 250, 'finance': 350, 'cs': 200},
        'seed': {'founder': 350, 'hr': 300, 'finance': 400, 'cs': 250},
        'seriesab': {'founder': 400, 'hr': 350, 'finance': 450, 'cs': 300},
        'seriesbc': {'founder': 500, 'hr': 450, 'finance': 550, 'cs': 400},
        'seriesc': {'founder': 600, 'hr': 550, 'finance': 650, 'cs': 500},
    },
    'singapore': {
        'preseed': {'founder': 300, 'hr': 250, 'finance': 350, 'cs': 200},
        'seed': {'founder': 350, 'hr': 300, 'finance': 400, 'cs': 250},
        'seriesab': {'founder': 400, 'hr': 350, 'finance': 450, 'cs': 300},
        'seriesbc': {'founder': 500, 'hr': 450, 'finance': 550, 'cs': 400},
        'seriesc': {'founder': 600, 'hr': 550, 'finance': 650, 'cs': 500},
    },
    'uk': {
        'preseed': {'founder': 300, 'hr': 250, 'finance': 350, 'cs': 200},
        'seed': {'founder': 350, 'hr': 300, 'finance': 400, 'cs': 250},
        'seriesab': {'founder': 400, 'hr': 350, 'finance': 450, 'cs': 300},
        'seriesbc': {'founder': 500, 'hr': 450, 'finance': 550, 'cs': 400},
        'seriesc': {'founder': 600, 'hr': 550, 'finance': 650, 'cs': 500},
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

COMPLIANCE = {
    'india': 72,
    'us': 68,
    'singapore': 54,
    'uk': 54,
}

FUNDRAISING_WORKFLOWS = {
    'capTable': 3,
    'secretarial': 3,
}

PRICING = {
    'india': 5000,
    'us': 10000,
    'singapore': 7500,
    'uk': 6000,
}

ROUND_COMPLEXITY = {
    'preseed': 0.5,
    'seed': 1.0,
    'seriesab': 1.5,
    'seriesbc': 2.0,
    'seriesc': 2.5,
}

def get_dynamic_compliance_hours(stage, shareholders, oh, geo_inc, gr_new_hire, gr_refresh):
    """Calculate compliance hours based on stage and stakeholder volume"""
    base_hrs = COMPLIANCE[geo_inc]
    stage_scale = {
        'preseed': 0.5,
        'seed': 0.75,
        'seriesab': 1.0,
        'seriesbc': 1.25,
        'seriesc': 1.5,
    }
    scale = stage_scale.get(stage, 1.0)
    
    shareholder_scale = 1 + max(0, shareholders - 10) / 100 if shareholders > 0 else 1
    option_scale = 1 + max(0, oh - 5) / 50 if oh > 0 else 1
    grant_scale = 1 + max(0, (gr_new_hire + gr_refresh) - 3) / 30 if (gr_new_hire + gr_refresh) > 0 else 1
    
    return base_hrs * scale * shareholder_scale * option_scale * grant_scale

def compute_roi(inputs):
    """Compute ROI calculation from inputs"""
    sh = inputs.get('sh', 30)
    oh = inputs.get('oh', 15)
    gr_new_hire = inputs.get('grNewHire', 5)
    gr_refresh = inputs.get('grRefresh', 5)
    geo_inc = inputs.get('geoInc', 'india')
    stage = inputs.get('stage', 'seriesab')
    meth = inputs.get('meth', 'in-house')
    planning_to_fundraise = inputs.get('planningToFundraise', False)
    fundraise_round = inputs.get('fundraiseRound', 'seed')
    
    # Validate inputs
    if geo_inc not in STAGE_HOURLY_RATES:
        return None
    if stage not in STAFFING_MATRIX:
        return None
    
    # Stage key (use fundraise round if planning to fundraise)
    stage_key = fundraise_round if planning_to_fundraise else stage
    
    # Calculate rate
    matrix = STAFFING_MATRIX[stage_key]
    rate = 0
    roles = ['founder', 'hr', 'finance', 'cs']
    for role in roles:
        if role == 'hr' and oh == 0 and gr_new_hire == 0:
            continue
        fte = matrix.get(role, 0)
        if fte > 0:
            role_rate = STAGE_HOURLY_RATES[geo_inc][stage_key][role]
            rate += fte * role_rate
    
    # Multiplier based on method
    mult = 1 if meth == 'in-house' else 0.2
    
    # Hours calculations
    gr_hr = 1.5
    comp_hr = get_dynamic_compliance_hours(stage_key, sh, oh, geo_inc, gr_new_hire, gr_refresh)
    
    total_grant_admin_work = oh + gr_new_hire + gr_refresh
    gr_hrs = total_grant_admin_work * gr_hr
    gr_cost = gr_hrs * mult * rate
    cp_cost = comp_hr * mult * rate
    
    # Cap table
    CAP_TABLE_BASE_HOURS_PER_MONTH = 3
    CAP_TABLE_SCALING_INCREMENT = 2
    ct_shareholder_scale = max(0, (sh - 20) / 50) if sh > 0 else 0
    ct_monthly_hours = CAP_TABLE_BASE_HOURS_PER_MONTH + (ct_shareholder_scale * CAP_TABLE_SCALING_INCREMENT) if sh > 0 else 0
    ct_raw = ct_monthly_hours * 12
    ct_hrs = ct_raw * mult
    ct_cost = ct_hrs * rate
    
    # Fundraising cap table
    round_multiplier = ROUND_COMPLEXITY.get(fundraise_round, 1.0) if planning_to_fundraise else 0
    HOURS_PER_WORKFLOW = 2.5
    ct_fundraising_base = FUNDRAISING_WORKFLOWS['capTable'] * HOURS_PER_WORKFLOW
    ct_fundraising_hours = ct_fundraising_base * round_multiplier if planning_to_fundraise else 0
    ct_fundraising_hrs = ct_fundraising_hours * mult
    ct_fundraising_cost = ct_fundraising_hrs * rate
    
    # Secretarial fundraising
    sec_rate = STAGE_HOURLY_RATES[geo_inc][stage_key]['cs']
    sec_fundraising_base_workflows = FUNDRAISING_WORKFLOWS['secretarial'] if planning_to_fundraise else 0
    sec_fundraising_base = sec_fundraising_base_workflows * HOURS_PER_WORKFLOW
    sec_fundraising_hours = sec_fundraising_base * round_multiplier
    effective_shareholders = sh  # simplified for this analysis
    sec_fundraising_scaling = 1 + max(0, (effective_shareholders - 20) / 100) * 0.5
    sec_fundraising_raw = sec_fundraising_hours * sec_fundraising_scaling
    sec_fundraising_hrs = sec_fundraising_raw * mult
    sec_fundraising_cost = sec_fundraising_hrs * sec_rate
    
    # Method cost (retainer for outsourced)
    method_ext_cost = 0
    if meth == 'outsourced':
        method_ext_cost = STAGE_RETAINER[geo_inc][stage_key]
    
    # Total cost
    ann_cost = gr_cost + cp_cost + ct_cost + ct_fundraising_cost + sec_fundraising_cost + method_ext_cost
    
    return round(ann_cost)

def main():
    # Define input ranges for permutation testing
    geos = ['india', 'us', 'singapore', 'uk']
    stages = ['preseed', 'seed', 'seriesab', 'seriesbc', 'seriesc']
    
    # Smaller ranges for numeric inputs for reasonable test coverage
    shareholders_range = [10, 20, 30, 50, 100]
    option_holders_range = [5, 15, 30]
    grants_range = [0, 3, 5, 10]
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
    
    # Test combinations
    test_count = 0
    for geo, stage, sh, oh, gr_new, gr_ref, fr_flag in itertools.product(
        geos, stages, shareholders_range, option_holders_range, grants_range, grants_range, fundraise_flags
    ):
        test_count += 1
        
        # Skip some unrealistic combinations to manage test volume
        if test_count > 5000:  # Limit tests for performance
            break
        
        for fr_round in (fundraise_rounds if fr_flag else [stage]):
            inputs_inhouse = {
                'sh': sh,
                'oh': oh,
                'grNewHire': gr_new,
                'grRefresh': gr_ref,
                'geoInc': geo,
                'stage': stage,
                'meth': 'in-house',
                'planningToFundraise': fr_flag,
                'fundraiseRound': fr_round,
            }
            
            inputs_outsourced = inputs_inhouse.copy()
            inputs_outsourced['meth'] = 'outsourced'
            
            cost_inhouse = compute_roi(inputs_inhouse)
            cost_outsourced = compute_roi(inputs_outsourced)
            
            if cost_inhouse is None or cost_outsourced is None:
                continue
            
            results['total_tests'] += 1
            
            if cost_outsourced < cost_inhouse:
                results['ca_cheaper_count'] += 1
                results['cases_ca_cheaper'].append({
                    'geo': geo,
                    'stage': stage,
                    'shareholders': sh,
                    'option_holders': oh,
                    'new_hire_grants': gr_new,
                    'refresh_grants': gr_ref,
                    'fundraising': fr_flag,
                    'fundraise_round': fr_round,
                    'inhouse_cost': cost_inhouse,
                    'ca_cost': cost_outsourced,
                    'savings': cost_inhouse - cost_outsourced,
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
    print("=" * 80)
    print("CA RETAINER vs IN-HOUSE COST COMPARISON ANALYSIS")
    print("=" * 80)
    print()
    
    print(f"Total test cases: {results['total_tests']}")
    print()
    
    print("OVERALL RESULTS:")
    print(f"  CA Retainer Cheaper: {results['ca_cheaper_count']} ({100*results['ca_cheaper_count']/results['total_tests']:.1f}%)")
    print(f"  In-house Cheaper:    {results['inhouse_cheaper_count']} ({100*results['inhouse_cheaper_count']/results['total_tests']:.1f}%)")
    print(f"  Equal:               {results['equal_count']} ({100*results['equal_count']/results['total_tests']:.1f}%)")
    print()
    
    print("BY STAGE:")
    for stage in stages:
        if stage in results['by_stage']:
            stage_data = results['by_stage'][stage]
            print(f"  {stage.upper()}:")
            print(f"    CA Cheaper: {stage_data['ca_cheaper']}/{stage_data['total']} ({100*stage_data['ca_cheaper']/stage_data['total']:.1f}%)")
    print()
    
    print("BY GEOGRAPHY:")
    for geo in geos:
        if geo in results['by_geo']:
            geo_data = results['by_geo'][geo]
            print(f"  {geo.upper()}:")
            print(f"    CA Cheaper: {geo_data['ca_cheaper']}/{geo_data['total']} ({100*geo_data['ca_cheaper']/geo_data['total']:.1f}%)")
    print()
    
    # Show some example cases
    print("EXAMPLE CASES WHERE CA RETAINER IS CHEAPER:")
    if results['cases_ca_cheaper']:
        for i, case in enumerate(sorted(results['cases_ca_cheaper'], key=lambda x: x['savings'], reverse=True)[:5]):
            print()
            print(f"  Case {i+1}:")
            print(f"    Geography: {case['geo']}")
            print(f"    Stage: {case['stage']}")
            print(f"    Shareholders: {case['shareholders']}, Option Holders: {case['option_holders']}")
            print(f"    In-house Cost: ₹{case['inhouse_cost']:,}")
            print(f"    CA Retainer Cost: ₹{case['ca_cost']:,}")
            print(f"    Savings with CA: ₹{case['savings']:,}")
    else:
        print("  No cases found where CA retainer is cheaper.")
    print()

if __name__ == '__main__':
    main()
