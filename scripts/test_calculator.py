#!/usr/bin/env python3
"""
EquityList ROI Calculator - Python Test Suite
Tests the calculation logic with various input combinations
"""

import json
import sys
from itertools import product

# ============ DATA TABLES ============
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

FUNDRAISING_WORKFLOWS = {
    'capTable': 3,
    'secretarial': 4
}

VALUATION_PRICING = {
    'us': {'409a': 1500},
    'india': {'409a': 100000, 'blackscholes': 100000, 'rv': 50000, 'mb': 90000},
    'singapore': {'409a': 1500},
    'uk': {'409a': 1500}
}

EL_VALUATION_PRICING = {
    'us': {'409a': 1200},
    'india': {'409a': 75000, 'blackscholes': 75000, 'rv': 42000, 'mb': 70000},
    'singapore': {'409a': 1200},
    'uk': {'409a': 1200}
}


def compute_roi(inputs):
    """Compute ROI based on inputs"""
    sh = inputs.get('sh', 30)
    oh = inputs.get('oh', 15)
    gr = inputs.get('gr', 10)
    geo_inc = inputs.get('geo_inc', 'india')
    geo_op = inputs.get('geo_op', 'india')
    stage = inputs.get('stage', 'seriesab')
    meth = inputs.get('meth', 'in-house')
    planning_to_fundraise = inputs.get('planning_to_fundraise', False)
    fundraise_round = inputs.get('fundraise_round', 'seed')
    new_shareholders = inputs.get('new_shareholders', 0)
    valuation_frequency = inputs.get('valuation_frequency', None)
    valuation_type = inputs.get('valuation_type', None)

    # Validate inputs
    if geo_inc not in STAGE_HOURLY_RATES:
        raise ValueError(f"Invalid geo_inc: {geo_inc}")
    if geo_op not in STAGE_HOURLY_RATES:
        raise ValueError(f"Invalid geo_op: {geo_op}")
    if stage not in STAFFING_MATRIX:
        raise ValueError(f"Invalid stage: {stage}")
    if meth not in ['in-house', 'outsourced']:
        raise ValueError(f"Invalid method: {meth}")

    # Calculate blended hourly rate
    matrix = STAFFING_MATRIX[stage]
    rate = 0
    for role in ['founder', 'hr', 'finance', 'cs']:
        fte = matrix.get(role, 0)
        if fte > 0:
            role_rate = STAGE_HOURLY_RATES[geo_op][stage][role]
            rate += fte * role_rate

    # Method multiplier
    mult = 1 if meth == 'in-house' else 0.4
    gr_hr = 1.5
    comp_hr = COMPLIANCE[geo_inc]

    # Grant admin
    gr_hrs = gr * gr_hr
    gr_cost = gr_hrs * mult * rate

    # Compliance
    cp_cost = comp_hr * mult * rate

    # Cap table
    ct_raw = (3 + max(0, (sh - 20) / 50) * 2) * 12
    ct_hrs = ct_raw * mult
    ct_cost = ct_hrs * rate

    # Fundraising cap table
    round_complexity = {'safe': 0.5, 'bridge': 0.75, 'seed': 1.0, 'seriesab': 1.5, 'seriesbc': 2.0, 'seriesc': 2.5}
    round_multiplier = round_complexity.get(fundraise_round, 1.0) if planning_to_fundraise else 0
    ct_fundraising_hours = planning_to_fundraise and FUNDRAISING_WORKFLOWS['capTable'] * 2.5 * round_multiplier or 0
    ct_fundraising_hrs = ct_fundraising_hours * mult
    ct_fundraising_cost = ct_fundraising_hrs * rate

    # Secretarial
    base_workflows = SECRETARIAL_WORKFLOWS_BY_GEO[geo_inc][stage]
    sec_base_hours = base_workflows * 2.5
    shareholder_scaling = 1 + max(0, (sh - 20) / 100) * 0.5
    sec_raw = sec_base_hours * shareholder_scaling
    sec_hrs = sec_raw * mult
    sec_rate = STAGE_HOURLY_RATES[geo_op][stage]['cs']
    sec_cost = sec_hrs * sec_rate

    # Secretarial fundraising
    sec_fundraising_workflows = FUNDRAISING_WORKFLOWS['secretarial'] if planning_to_fundraise else 0
    sec_fundraising_hours = sec_fundraising_workflows * 2.5 * round_multiplier
    effective_shareholders = (sh + new_shareholders) if planning_to_fundraise else sh
    sec_fundraising_scaling = 1 + max(0, (effective_shareholders - 20) / 100) * 0.5
    sec_fundraising_raw = sec_fundraising_hours * sec_fundraising_scaling
    sec_fundraising_hrs = sec_fundraising_raw * mult
    sec_fundraising_cost = sec_fundraising_hrs * sec_rate

    # Method cost
    method_ext_cost = STAGE_RETAINER[geo_op][stage] if meth == 'outsourced' else 0

    # Valuation
    valuation_cost = 0
    el_valuation_cost = 0
    if valuation_frequency and valuation_type:
        events = 1 if valuation_frequency == 'annually' else 4 if valuation_frequency == 'quarterly' else 0
        price_per_event = VALUATION_PRICING.get(geo_inc, {}).get(valuation_type, 0)
        el_price_per_event = EL_VALUATION_PRICING.get(geo_inc, {}).get(valuation_type, 0)
        valuation_cost = events * price_per_event
        el_valuation_cost = events * el_price_per_event

    # Annual cost
    ann_cost = gr_cost + cp_cost + ct_cost + sec_cost + ct_fundraising_cost + sec_fundraising_cost + method_ext_cost + valuation_cost

    # Hours calculation
    manual_h_total = gr_hrs + comp_hr + ct_raw + sec_raw + ct_fundraising_hours + sec_fundraising_raw
    adjusted_h_total = manual_h_total * mult
    el_oversight_hours = manual_h_total * 0.1
    internal_h_total = adjusted_h_total - el_oversight_hours

    # EquityList cost
    stakeholders = min(sh + oh, 10000)
    el_overhead = manual_h_total * 0.1 * rate
    el_ann = stakeholders * PRICING[geo_op] + el_overhead + el_valuation_cost

    # Results
    diff = ann_cost - el_ann
    is_savings = diff >= 0
    roi = round((abs(diff) / el_ann) * 10) / 10 if el_ann > 0 else 0
    time_saved_pct = round(((manual_h_total - internal_h_total) / manual_h_total) * 100) if manual_h_total > 0 else 0

    return {
        'ann_cost': round(ann_cost),
        'el_ann': round(el_ann),
        'diff': round(diff),
        'is_savings': is_savings,
        'roi': roi,
        'stakeholders': stakeholders,
        'rate': round(rate),
        'manual_h_total': round(manual_h_total * 10) / 10,
        'internal_h_total': round(internal_h_total * 10) / 10,
        'time_saved_pct': time_saved_pct,
    }


def test_default_scenario():
    """Test default India Series A/B scenario"""
    print("\n" + "="*60)
    print("TEST: Default Scenario (India, Series A/B, In-house)")
    print("="*60)

    result = compute_roi({
        'sh': 30,
        'oh': 15,
        'gr': 10,
        'geo_inc': 'india',
        'geo_op': 'india',
        'stage': 'seriesab',
        'meth': 'in-house'
    })

    print(f"Annual cost (current):     ₹{result['ann_cost']:,.0f}")
    print(f"EquityList annual cost:    ₹{result['el_ann']:,.0f}")
    print(f"Potential savings:         ₹{result['diff']:,.0f}")
    print(f"ROI multiple:              {result['roi']}×")
    print(f"Hours saved annually:      {result['manual_h_total'] - result['internal_h_total']:.0f} hrs/yr")
    print(f"Time saved percentage:     {result['time_saved_pct']}%")

    assert result['ann_cost'] > 0, "Annual cost should be positive"
    assert result['el_ann'] > 0, "EquityList cost should be positive"
    assert result['roi'] >= 0, "ROI should be non-negative"
    print("✓ PASSED")


def test_outsourced_scenario():
    """Test outsourced method scenario"""
    print("\n" + "="*60)
    print("TEST: Outsourced Method (India, Series B/C, Outsourced)")
    print("="*60)

    result = compute_roi({
        'sh': 50,
        'oh': 30,
        'gr': 20,
        'geo_inc': 'india',
        'geo_op': 'india',
        'stage': 'seriesbc',
        'meth': 'outsourced'
    })

    print(f"Annual cost (current):     ₹{result['ann_cost']:,.0f}")
    print(f"EquityList annual cost:    ₹{result['el_ann']:,.0f}")
    print(f"Potential savings:         ₹{result['diff']:,.0f}")
    print(f"ROI multiple:              {result['roi']}×")

    assert result['ann_cost'] > 0, "Annual cost should be positive"
    assert result['el_ann'] > 0, "EquityList cost should be positive"
    print("✓ PASSED")


def test_us_scenario():
    """Test US-based company"""
    print("\n" + "="*60)
    print("TEST: US Company (US, Seed, In-house)")
    print("="*60)

    result = compute_roi({
        'sh': 20,
        'oh': 10,
        'gr': 8,
        'geo_inc': 'us',
        'geo_op': 'us',
        'stage': 'seed',
        'meth': 'in-house'
    })

    print(f"Annual cost (current):     ${result['ann_cost']:,.0f}")
    print(f"EquityList annual cost:    ${result['el_ann']:,.0f}")
    print(f"Potential savings:         ${result['diff']:,.0f}")
    print(f"ROI multiple:              {result['roi']}×")

    assert result['ann_cost'] > 0, "Annual cost should be positive"
    assert result['el_ann'] > 0, "EquityList cost should be positive"
    print("✓ PASSED")


def test_with_fundraising():
    """Test with fundraising scenario"""
    print("\n" + "="*60)
    print("TEST: With Fundraising (India, Series A/B, Series B round)")
    print("="*60)

    result = compute_roi({
        'sh': 30,
        'oh': 15,
        'gr': 10,
        'geo_inc': 'india',
        'geo_op': 'india',
        'stage': 'seriesab',
        'meth': 'in-house',
        'planning_to_fundraise': True,
        'fundraise_round': 'seriesbc',
        'new_shareholders': 5
    })

    print(f"Annual cost (current):     ₹{result['ann_cost']:,.0f}")
    print(f"EquityList annual cost:    ₹{result['el_ann']:,.0f}")
    print(f"Potential savings:         ₹{result['diff']:,.0f}")
    print(f"ROI multiple:              {result['roi']}×")

    assert result['ann_cost'] > 0, "Annual cost should be positive"
    assert result['el_ann'] > 0, "EquityList cost should be positive"
    print("✓ PASSED")


def test_with_valuation():
    """Test with valuation reports"""
    print("\n" + "="*60)
    print("TEST: With Valuation (India, Series A/B, Quarterly 409A)")
    print("="*60)

    result = compute_roi({
        'sh': 30,
        'oh': 15,
        'gr': 10,
        'geo_inc': 'india',
        'geo_op': 'india',
        'stage': 'seriesab',
        'meth': 'in-house',
        'valuation_frequency': 'quarterly',
        'valuation_type': '409a'
    })

    print(f"Annual cost (current):     ₹{result['ann_cost']:,.0f}")
    print(f"EquityList annual cost:    ₹{result['el_ann']:,.0f}")
    print(f"Potential savings:         ₹{result['diff']:,.0f}")
    print(f"ROI multiple:              {result['roi']}×")

    assert result['ann_cost'] > 0, "Annual cost should be positive"
    assert result['el_ann'] > 0, "EquityList cost should be positive"
    print("✓ PASSED")


def test_edge_cases():
    """Test edge cases"""
    print("\n" + "="*60)
    print("TEST: Edge Cases")
    print("="*60)

    # Minimal company
    print("\n1. Minimal company (Pre-seed, 1 shareholder, 1 grant/yr)")
    result = compute_roi({
        'sh': 1,
        'oh': 0,
        'gr': 1,
        'geo_inc': 'india',
        'geo_op': 'india',
        'stage': 'preseed',
        'meth': 'in-house'
    })
    assert result['ann_cost'] > 0, "Minimal company should have positive cost"
    print(f"   Annual cost: ₹{result['ann_cost']:,.0f}")
    print("   ✓ PASSED")

    # Large company
    print("\n2. Large company (Series C+, 10,000 stakeholders)")
    result = compute_roi({
        'sh': 9500,
        'oh': 500,
        'gr': 100,
        'geo_inc': 'india',
        'geo_op': 'india',
        'stage': 'seriesc',
        'meth': 'in-house'
    })
    assert result['ann_cost'] > 0, "Large company should have positive cost"
    assert result['stakeholders'] == 10000, "Should cap stakeholders at 10k"
    print(f"   Annual cost: ₹{result['ann_cost']:,.0f}")
    print(f"   Stakeholders (capped): {result['stakeholders']:,}")
    print("   ✓ PASSED")

    # Geographies
    print("\n3. Testing all geographies (Series A/B, 30 shareholders)")
    for geo in ['india', 'us', 'singapore', 'uk']:
        result = compute_roi({
            'sh': 30,
            'oh': 15,
            'gr': 10,
            'geo_inc': geo,
            'geo_op': geo,
            'stage': 'seriesab',
            'meth': 'in-house'
        })
        print(f"   {geo.upper():12} - Cost: {result['ann_cost']:>10,.0f}")
        assert result['ann_cost'] > 0, f"Cost should be positive for {geo}"
    print("   ✓ PASSED")


def test_all_combinations():
    """Test all combinations of inputs"""
    print("\n" + "="*60)
    print("TEST: All Combinations (Smoke Test)")
    print("="*60)

    stages = ['preseed', 'seed', 'seriesab', 'seriesbc', 'seriesc']
    geos = ['india', 'us', 'singapore', 'uk']
    methods = ['in-house', 'outsourced']

    count = 0
    failed = 0

    for stage, geo, method in product(stages, geos, methods):
        try:
            result = compute_roi({
                'sh': 30,
                'oh': 15,
                'gr': 10,
                'geo_inc': geo,
                'geo_op': geo,
                'stage': stage,
                'meth': method
            })
            assert result['ann_cost'] > 0, "Cost should be positive"
            assert result['el_ann'] > 0, "EL cost should be positive"
            assert result['roi'] >= 0, "ROI should be non-negative"
            count += 1
        except Exception as e:
            print(f"   ✗ FAILED: {stage} / {geo} / {method}: {str(e)}")
            failed += 1

    print(f"   {count} combinations tested")
    if failed > 0:
        print(f"   ✗ {failed} failed")
        return False
    else:
        print("   ✓ PASSED")
        return True


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("EquityList ROI Calculator - Test Suite")
    print("="*60)

    try:
        test_default_scenario()
        test_outsourced_scenario()
        test_us_scenario()
        test_with_fundraising()
        test_with_valuation()
        test_edge_cases()
        test_all_combinations()

        print("\n" + "="*60)
        print("✓ ALL TESTS PASSED")
        print("="*60)
        return 0
    except AssertionError as e:
        print(f"\n✗ TEST FAILED: {str(e)}")
        return 1
    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
