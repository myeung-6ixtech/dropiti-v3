export const FONT_CONFIG = {
  primary: {
    family: 'Plus Jakarta Sans',
    fallbacks: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
    weights: {
      extraLight: 200,
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
      extraBold: 800,
    },
    styles: {
      normal: 'normal',
      italic: 'italic',
    }
  },
  secondary: {
    family: 'Inter',
    fallbacks: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  }
} as const;

export type FontWeight = keyof typeof FONT_CONFIG.primary.weights;
export type FontStyle = keyof typeof FONT_CONFIG.primary.styles;
