import { FONT_CONFIG, FontWeight, FontStyle } from '@/config/fonts';

export const getFontFamily = (primary: boolean = true) => {
  return primary ? FONT_CONFIG.primary.family : FONT_CONFIG.secondary.family;
};

export const getFontWeight = (weight: FontWeight) => {
  return FONT_CONFIG.primary.weights[weight];
};

export const getFontClass = (weight: FontWeight = 'regular', style: FontStyle = 'normal') => {
  const weightClass = `font-${weight}`;
  const styleClass = style === 'italic' ? 'italic' : 'not-italic';
  return `${weightClass} ${styleClass}`;
};

// Tailwind class helpers
export const fontClasses = {
  heading: 'font-plus-jakarta font-semibold',
  body: 'font-plus-jakarta font-normal',
  caption: 'font-plus-jakarta font-light text-sm',
  button: 'font-plus-jakarta font-medium',
  display: 'font-plus-jakarta font-bold',
  subheading: 'font-plus-jakarta font-medium',
} as const;

// Font weight mappings for Tailwind
export const fontWeights = {
  extraLight: 'font-extralight',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extraBold: 'font-extrabold',
} as const;
