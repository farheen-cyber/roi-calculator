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

export const PRICING = {
  india: 1200,
  us: 40,
  uk: 30,
  singapore: 25
};

export let FX = {
  india: 1,
  us: 0.01205,
  singapore: 0.01613,
  uk: 0.00943
};
