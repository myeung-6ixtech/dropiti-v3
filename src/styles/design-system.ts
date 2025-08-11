/* ========================================
   DESIGN SYSTEM TYPESCRIPT CONFIGURATION
   ======================================== */

/* ========================================
   COLOR TOKENS
   ======================================== */

export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

/* ========================================
   SPACING TOKENS
   ======================================== */

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
  '5xl': '8rem',
} as const;

/* ========================================
   BORDER RADIUS TOKENS
   ======================================== */

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  md: '0.25rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

/* ========================================
   SHADOW TOKENS
   ======================================== */

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

/* ========================================
   TRANSITION TOKENS
   ======================================== */

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '250ms ease-in-out',
  slow: '350ms ease-in-out',
  slower: '500ms ease-in-out',
} as const;

/* ========================================
   Z-INDEX TOKENS
   ======================================== */

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  'modal-backdrop': 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

/* ========================================
   BREAKPOINT TOKENS
   ======================================== */

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/* ========================================
   TYPOGRAPHY TOKENS
   ======================================== */

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'Cambria', 'serif'],
    mono: ['Menlo', 'Monaco', 'Consolas', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const;

/* ========================================
   COMPONENT SIZES
   ======================================== */

export const componentSizes = {
  button: {
    sm: { height: '2rem', paddingX: '0.75rem', fontSize: '0.875rem' },
    md: { height: '2.5rem', paddingX: '1rem', fontSize: '0.875rem' },
    lg: { height: '3rem', paddingX: '1.5rem', fontSize: '1rem' },
    xl: { height: '3.5rem', paddingX: '2rem', fontSize: '1.125rem' },
  },
  input: {
    sm: { height: '2rem', paddingX: '0.75rem', fontSize: '0.875rem' },
    md: { height: '2.5rem', paddingX: '1rem', fontSize: '0.875rem' },
    lg: { height: '3rem', paddingX: '1rem', fontSize: '1rem' },
    xl: { height: '3.5rem', paddingX: '1.5rem', fontSize: '1.125rem' },
  },
  card: {
    sm: { padding: '1rem', borderRadius: '0.5rem' },
    md: { padding: '1.5rem', borderRadius: '0.75rem' },
    lg: { padding: '2rem', borderRadius: '1rem' },
    xl: { padding: '2.5rem', borderRadius: '1.25rem' },
  },
} as const;

/* ========================================
   THEME CONFIGURATION
   ======================================== */

export const theme = {
  colors,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  typography,
  componentSizes,
} as const;

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

export const getColor = (colorPath: string): string => {
  const path = colorPath.split('.');
  let value: Record<string, unknown> | string = colors;
  
  for (const key of path) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key] as Record<string, unknown> | string;
    } else {
      console.warn(`Color path "${colorPath}" not found`);
      return colors.gray[500];
    }
  }
  
  return value as string;
};

export const getSpacing = (size: keyof typeof spacing): string => {
  return spacing[size];
};

export const getBorderRadius = (size: keyof typeof borderRadius): string => {
  return borderRadius[size];
};

export const getShadow = (size: keyof typeof shadows): string => {
  return shadows[size];
};

export const getTransition = (speed: keyof typeof transitions): string => {
  return transitions[speed];
};

export const getZIndex = (level: keyof typeof zIndex): number => {
  return zIndex[level];
};

/* ========================================
   TYPE DEFINITIONS
   ======================================== */

export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type BorderRadiusToken = keyof typeof borderRadius;
export type ShadowToken = keyof typeof shadows;
export type TransitionToken = keyof typeof transitions;
export type ZIndexToken = keyof typeof zIndex;
export type BreakpointToken = keyof typeof breakpoints;

export type Theme = typeof theme;

/* ========================================
   DEFAULT EXPORT
   ======================================== */

export default theme;
