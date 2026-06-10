"""
CORRECTED: CA vs In-house analysis with verified calculations
"""
import itertools
from collections import defaultdict

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
    
    if geo_inc not in STAGE_HOURLY_RATES or stage not in STAFFING_MATRIX:
        return None
    
    stage_key = stage
    
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
    
    ct_shareholder_scale = max(0, (sh - 20) / 50) if sh > 0 else 0
    ct_monthly_hours = (3 + (ct_shareholder_scale * 2)) if sh > 0 else 0
    ct_raw = ct_monthly_hours * 12
    ct_hrs = ct_raw * mult
    ct_cost = ct_hrs * rate
    
    ct_fundraising_cost = 0
    sec_fundraising_cost = 0
    
    method_ext_cost = STAGE_RETAINER[geo_inc][stage_key] if meth == 'outsourced' else 0
    
    ann_cost = gr_cost + cp_cost + ct_cost + ct_fundraising_cost + sec_fundraising_cost + method_ext_cost
    
    return round(ann_cost)

# Test a few specific scenarios
print("=" * 100)
print("VERIFICATION: Testing specific scenarios manually")
print("=" * 100)
print()

test_scenarios = [
    {'label': 'US Preseed (100 sh, 30 oh, 5/5 grants, no fundraise)', 'sh': 100, 'oh': 30, 'grNewHire': 5, 'grRefresh': 5, 'geoInc': 'us', 'stage': 'preseed'},
    {'label': 'India SeriesAB (100 sh, 30 oh, 20/20 grants, no fundraise)', 'sh': 100, 'oh': 30, 'grNewHire': 20, 'grRefresh': 20, 'geoInc': 'india', 'stage': 'seriesab'},
    {'label': 'India Preseed (10 sh, 5 oh, 0/0 grants)', 'sh': 10, 'oh': 5, 'grNewHire': 0, 'grRefresh': 0, 'geoInc': 'india', 'stage': 'preseed'},
]

for scenario in test_scenarios:
    label = scenario.pop('label')
    inhouse = compute_cost(scenario, 'in-house')
    outsourced = compute_cost(scenario, 'outsourced')
    
    geo = scenario['geoInc']
    currencies = {'india': '₹', 'us': '$', 'singapore': '$', 'uk': '£'}
    curr = currencies[geo]
    
    print(f"{label}")
    print(f"  In-house:     {curr}{inhouse:,}")
    print(f"  CA Retainer:  {curr}{outsourced:,}")
    if inhouse < outsourced:
        print(f"  Result: IN-HOUSE is cheaper by {curr}{inhouse - outsourced:,}")
    else:
        print(f"  Result: CA RETAINER is cheaper by {curr}{outsourced - inhouse:,}")
    print()

# Now do full analysis
print("=" * 100)
print("FULL ANALYSIS: 60,000 permutations")
print("=" * 100)
print()

geos = ['india', 'us', 'singapore', 'uk']
stages = ['preseed', 'seed', 'seriesab', 'seriesbc', 'seriesc']
shareholders_range = [10, 20, 30, 50, 100, 200]
option_holders_range = [0, 5, 15, 30, 50]
grants_range = [0, 3, 5, 10, 20]

results = {
    'ca_cheaper': 0, 'inhouse_cheaper': 0, 'total': 0,
    'by_stage': defaultdict(lambda: {'ca': 0, 'inhouse': 0, 'total': 0}),
    'by_geo': defaultdict(lambda: {'ca': 0, 'inhouse': 0, 'total': 0}),
}

for geo, stage, sh, oh, gr_new, gr_ref in itertools.product(
    geos, stages, shareholders_range, option_holders_range, grants_range, grants_range
):
    inputs = {'sh': sh, 'oh': oh, 'grNewHire': gr_new, 'grRefresh': gr_ref, 'geoInc': geo, 'stage': stage}
    
    inhouse = compute_cost(inputs, 'in-house')
    outsourced = compute_cost(inputs, 'outsourced')
    
    if inhouse is None or outsourced is None:
        continue
    
    results['total'] += 1
    
    if outsourced < inhouse:
        results['ca_cheaper'] += 1
        results['by_stage'][stage]['ca'] += 1
        results['by_geo'][geo]['ca'] += 1
    else:
        results['inhouse_cheaper'] += 1
        results['by_stage'][stage]['inhouse'] += 1
        results['by_geo'][geo]['inhouse'] += 1
    
    results['by_stage'][stage]['total'] += 1
    results['by_geo'][geo]['total'] += 1

print(f"TOTAL TEST CASES: {results['total']:,}")
print()
print(f"CA Retainer Cheaper:  {results['ca_cheaper']:,} ({100*results['ca_cheaper']/results['total']:.1f}%)")
print(f"In-house Cheaper:     {results['inhouse_cheaper']:,} ({100*results['inhouse_cheaper']/results['total']:.1f}%)")
print()

print("BY STAGE:")
for stage in stages:
    data = results['by_stage'][stage]
    pct = 100*data['ca']/data['total'] if data['total'] > 0 else 0
    print(f"  {stage.upper():12} CA Cheaper: {data['ca']:,}/{data['total']:,} ({pct:.1f}%)")
print()

print("BY GEOGRAPHY:")
for geo in geos:
    data = results['by_geo'][geo]
    pct = 100*data['ca']/data['total'] if data['total'] > 0 else 0
    print(f"  {geo.upper():12} CA Cheaper: {data['ca']:,}/{data['total']:,} ({pct:.1f}%)")
