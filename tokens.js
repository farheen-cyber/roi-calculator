/**
 * Design Tokens for Direction A
 * All colors, typography, spacing, and semantic values
 */

export const TOKENS = {
  // ========== COLORS ==========
  colors: {
    // Primary
    purple: '#6D28D9',
    purple2: '#5B21B6',

    // Neutral
    ink: '#15121F',
    inkSoft: '#3A3650',
    mute: '#7B7792',

    // Semantic
    green: '#0A8C5C',
    red: '#C03021',
    amber: '#A66A00',

    // Backgrounds
    white: '#FFFFFF',
    gray50: '#F9F7FC',
    gray100: '#F2EEF9',
    gray200: '#E8E4F0',
    gray300: '#D9D3E3',
  },

  // ========== TYPOGRAPHY ==========
  fonts: {
    mono: '"JetBrains Mono","IBM Plex Mono","Menlo","Monaco","monospace"',
    sans: '"Inter","SF Pro Text","-apple-system","BlinkMacSystemFont","Segoe UI","Helvetica Neue","sans-serif"',
    serif: '"Fraunces","Tiempos Headline","Georgia","serif"',
  },

  // ========== FONT SIZES & WEIGHTS ==========
  type: {
    // Mono Labels (uppercase, letter-spaced)
    monoXs: {
      fontSize: '11px',
      fontFamily: 'JetBrains Mono',
      fontWeight: 600,
      letterSpacing: '1.4px',
      textTransform: 'uppercase',
      lineHeight: '16px',
    },
    // Sans Body Text (regular, tabular figures for numbers)
    sansSm: {
      fontSize: '13px',
      fontFamily: 'Inter',
      fontWeight: 400,
      lineHeight: '20px',
      fontVariantNumeric: 'tabular-nums',
    },
    sansBase: {
      fontSize: '14px',
      fontFamily: 'Inter',
      fontWeight: 400,
      lineHeight: '22px',
      fontVariantNumeric: 'tabular-nums',
    },
    sansMd: {
      fontSize: '15px',
      fontFamily: 'Inter',
      fontWeight: 400,
      lineHeight: '24px',
      fontVariantNumeric: 'tabular-nums',
    },
    // Sans Semi Bold (for labels and secondary info)
    sansMdSemi: {
      fontSize: '15px',
      fontFamily: 'Inter',
      fontWeight: 600,
      lineHeight: '24px',
      fontVariantNumeric: 'tabular-nums',
    },
    // Sans Large (headings)
    sansLg: {
      fontSize: '18px',
      fontFamily: 'Inter',
      fontWeight: 600,
      lineHeight: '28px',
    },
    sansXl: {
      fontSize: '20px',
      fontFamily: 'Inter',
      fontWeight: 600,
      lineHeight: '30px',
    },
    // Serif Display (hero, accents)
    serifMdItalic: {
      fontSize: '17px',
      fontFamily: 'Fraunces',
      fontStyle: 'italic',
      fontWeight: 500,
      lineHeight: '26px',
    },
  },

  // ========== SPACING ==========
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
    xxxl: '48px',
  },

  // ========== BREAKPOINTS ==========
  breakpoints: {
    mobile: 720,      // < 720px
    tablet: 1100,     // 720px - 1099px
    desktop: 1100,    // >= 1100px
  },

  // ========== SEMANTIC SHADOWS ==========
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },

  // ========== BORDERS ==========
  borders: {
    xs: '1px solid',
    sm: '2px solid',
  },

  // ========== TRANSITIONS ==========
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // ========== Z-INDEX ==========
  zIndex: {
    base: 0,
    dropdown: 100,
    modal: 1000,
    drawer: 1001,
    tooltip: 1100,
  },
};

export default TOKENS;
