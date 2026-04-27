export const CUR = {
  us: '$',
  india: '₹',
  singapore: 'S$',
  uk: '£'
};

export const RATES = {
  india: {
    founder: { p10: 131, p50: 1442, p90: 4808 },
    finance: { p10: 401, p50: 1923, p90: 3846 },
    hr: { p10: 322, p50: 1442, p90: 2404 },
    cs: { p10: 147, p50: 297, p90: 962 }
  },
  us: {
    founder: { p10: 40, p50: 85, p90: 166 },
    finance: { p10: 43, p50: 74, p90: 118 },
    hr: { p10: 32, p50: 49, p90: 74 },
    cs: { p10: 46, p50: 67, p90: 97 }
  },
  singapore: {
    founder: { p10: 13, p50: 114, p90: 280 },
    finance: { p10: 46, p50: 117, p90: 187 },
    hr: { p10: 21, p50: 75, p90: 138 },
    cs: { p10: 29, p50: 59, p90: 105 }
  },
  uk: {
    founder: { p10: 18, p50: 35, p90: 80 },
    finance: { p10: 27, p50: 49, p90: 83 },
    hr: { p10: 26, p50: 38, p90: 55 },
    cs: { p10: 12, p50: 22, p90: 41 }
  }
};

export const RATES_META = {
  india: {
    founder: { src: 'PayScale India CEO' },
    finance: { src: 'PayScale India CFO' },
    hr: { src: 'PayScale India HR Director' },
    cs: { src: 'PayScale India Corporate Secretary' }
  },
  us: {
    founder: { src: 'PayScale US CEO' },
    finance: { src: 'PayScale US CFO' },
    hr: { src: 'PayScale US HR Director' },
    cs: { src: 'PayScale US Corporate Counsel' }
  },
  singapore: {
    founder: { src: 'PayScale SG CEO' },
    finance: { src: 'PayScale SG CFO' },
    hr: { src: 'PayScale SG HR Director' },
    cs: { src: 'PayScale SG Legal Counsel' }
  },
  uk: {
    founder: { src: 'PayScale UK CEO' },
    finance: { src: 'PayScale UK CFO' },
    hr: { src: 'PayScale UK HR Director' },
    cs: { src: 'PayScale UK Corporate Secretary' }
  }
};

export const COMPLIANCE = {
  india: 72,
  us: 68,
  singapore: 54,
  uk: 54
};

export const EXT = {
  us: 18000,
  india: 180000,
  singapore: 15000,
  uk: 12000
};

export const STAGE_RETAINER = {
  usa: {
    preseed: 8000,
    seed: 12000,
    seriesab: 18000,
    seriesbc: 30000,
    seriesc: 50000
  },
  india: {
    preseed: 60000,
    seed: 90000,
    seriesab: 180000,
    seriesbc: 300000,
    seriesc: 500000
  },
  uk: {
    preseed: 5000,
    seed: 8000,
    seriesab: 12000,
    seriesbc: 20000,
    seriesc: 35000
  },
  singapore: {
    preseed: 5000,
    seed: 10000,
    seriesab: 15000,
    seriesbc: 25000,
    seriesc: 40000
  }
};

export const PRICING = {
  india: 1200,
  us: 40,
  uk: 30,
  singapore: 25
};

export const STAGE_HOURLY_RATES = {
  usa: {
    preseed: { founder: 113, finance: 69, hr: 63, cs: 56 },
    seed: { founder: 181, finance: 110, hr: 94, cs: 88 },
    seriesab: { founder: 288, finance: 156, hr: 131, cs: 119 },
    seriesbc: { founder: 356, finance: 200, hr: 169, cs: 150 },
    seriesc: { founder: 431, finance: 250, hr: 219, cs: 200 }
  },
  india: {
    preseed: { founder: 500, finance: 325, hr: 288, cs: 250 },
    seed: { founder: 1000, finance: 650, hr: 563, cs: 475 },
    seriesab: { founder: 1875, finance: 1188, hr: 1025, cs: 875 },
    seriesbc: { founder: 2750, finance: 1688, hr: 1438, cs: 1225 },
    seriesc: { founder: 4000, finance: 2313, hr: 2000, cs: 1688 }
  },
  uk: {
    preseed: { founder: 63, finance: 44, hr: 40, cs: 31 },
    seed: { founder: 110, finance: 70, hr: 63, cs: 55 },
    seriesab: { founder: 181, finance: 110, hr: 98, cs: 85 },
    seriesbc: { founder: 225, finance: 138, hr: 125, cs: 113 },
    seriesc: { founder: 281, finance: 188, hr: 169, cs: 150 }
  },
  singapore: {
    preseed: { founder: 100, finance: 69, hr: 63, cs: 54 },
    seed: { founder: 188, finance: 119, hr: 103, cs: 85 },
    seriesab: { founder: 331, finance: 200, hr: 181, cs: 150 },
    seriesbc: { founder: 431, finance: 275, hr: 250, cs: 213 },
    seriesc: { founder: 563, finance: 375, hr: 325, cs: 288 }
  }
};

export let FX = {
  india: 1,
  us: 0.01205,
  singapore: 0.01613,
  uk: 0.00943
};
