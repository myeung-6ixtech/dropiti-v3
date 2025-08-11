module.exports = {
  // Extend the base ESLint configuration
  extends: [
    '../.eslintrc.js', // Extend the root ESLint config
  ],
  
  // Override rules for the styles folder
  rules: {
    // Allow CSS custom properties and design tokens
    'no-unused-vars': 'off', // CSS variables might appear unused to ESLint
    
    // Allow @apply directives and Tailwind CSS classes
    'tailwindcss/no-custom-classname': 'off',
    'tailwindcss/classnames-order': 'warn',
    
    // Allow CSS imports and @layer directives
    'import/no-unresolved': 'off',
    
    // Allow CSS custom properties in :root
    'css-property-no-unknown': 'off',
    
    // Allow vendor prefixes for better browser support
    'property-no-vendor-prefix': 'off',
    'value-no-vendor-prefix': 'off',
    
    // Allow important declarations for utility classes
    'declaration-no-important': 'off',
    
    // Allow empty rules for component placeholders
    'block-no-empty': 'off',
    
    // Allow duplicate properties for fallbacks
    'declaration-block-no-duplicate-properties': 'off',
    
    // Allow shorthand properties
    'declaration-block-no-redundant-longhand-properties': 'off',
    
    // Allow vendor prefixes in media queries
    'media-feature-name-no-vendor-prefix': 'off',
    
    // Allow unknown at-rules for Tailwind CSS
    'at-rule-no-unknown': 'off',
    
    // Allow unknown properties for CSS custom properties
    'property-no-unknown': 'off',
    
    // Allow unknown units for design tokens
    'unit-no-unknown': 'off',
    
    // Allow unknown values for CSS custom properties
    'value-no-unknown': 'off',
  },
  
  // Override parser options for CSS files
  overrides: [
    {
      files: ['*.css'],
      parser: 'postcss-scss',
      plugins: ['stylelint'],
      rules: {
        // Stylelint rules for CSS files
        'stylelint/at-rule-no-unknown': [
          true,
          {
            ignoreAtRules: [
              'tailwind',
              'apply',
              'variants',
              'responsive',
              'screen',
              'layer',
            ],
          },
        ],
        'stylelint/declaration-block-no-duplicate-properties': true,
        'stylelint/declaration-block-no-redundant-longhand-properties': true,
        'stylelint/declaration-no-important': false,
        'stylelint/no-duplicate-selectors': true,
        'stylelint/no-empty-source': false,
        'stylelint/no-invalid-double-slash-comments': true,
        'stylelint/no-unknown-animations': false,
        'stylelint/order/properties-order': 'off',
        'stylelint/property-no-vendor-prefix': false,
        'stylelint/selector-no-qualifying-type': false,
        'stylelint/selector-no-vendor-prefix': false,
        'stylelint/string-quotes': 'single',
        'stylelint/value-no-vendor-prefix': false,
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        // TypeScript-specific rules for design system
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off', // Allow any for design tokens
        '@typescript-eslint/ban-ts-comment': 'off', // Allow @ts-ignore for CSS
        '@typescript-eslint/no-non-null-assertion': 'off', // Allow ! for CSS
      },
    },
  ],
  
  // Environment settings
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  
  // Parser options
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  
  // Global variables for design system
  globals: {
    // CSS custom properties
    '--color-primary-50': 'readonly',
    '--color-primary-100': 'readonly',
    '--color-primary-200': 'readonly',
    '--color-primary-300': 'readonly',
    '--color-primary-400': 'readonly',
    '--color-primary-500': 'readonly',
    '--color-primary-600': 'readonly',
    '--color-primary-700': 'readonly',
    '--color-primary-800': 'readonly',
    '--color-primary-900': 'readonly',
    
    '--color-secondary-50': 'readonly',
    '--color-secondary-100': 'readonly',
    '--color-secondary-200': 'readonly',
    '--color-secondary-300': 'readonly',
    '--color-secondary-400': 'readonly',
    '--color-secondary-500': 'readonly',
    '--color-secondary-600': 'readonly',
    '--color-secondary-700': 'readonly',
    '--color-secondary-800': 'readonly',
    '--color-secondary-900': 'readonly',
    
    '--color-success-50': 'readonly',
    '--color-success-100': 'readonly',
    '--color-success-200': 'readonly',
    '--color-success-300': 'readonly',
    '--color-success-400': 'readonly',
    '--color-success-500': 'readonly',
    '--color-success-600': 'readonly',
    '--color-success-700': 'readonly',
    '--color-success-800': 'readonly',
    '--color-success-900': 'readonly',
    
    '--color-error-50': 'readonly',
    '--color-error-100': 'readonly',
    '--color-error-200': 'readonly',
    '--color-error-300': 'readonly',
    '--color-error-400': 'readonly',
    '--color-error-500': 'readonly',
    '--color-error-600': 'readonly',
    '--color-error-700': 'readonly',
    '--color-error-800': 'readonly',
    '--color-error-900': 'readonly',
    
    '--color-warning-50': 'readonly',
    '--color-warning-100': 'readonly',
    '--color-warning-200': 'readonly',
    '--color-warning-300': 'readonly',
    '--color-warning-400': 'readonly',
    '--color-warning-500': 'readonly',
    '--color-warning-600': 'readonly',
    '--color-warning-700': 'readonly',
    '--color-warning-800': 'readonly',
    '--color-warning-900': 'readonly',
    
    // Spacing tokens
    '--spacing-xs': 'readonly',
    '--spacing-sm': 'readonly',
    '--spacing-md': 'readonly',
    '--spacing-lg': 'readonly',
    '--spacing-xl': 'readonly',
    '--spacing-2xl': 'readonly',
    '--spacing-3xl': 'readonly',
    
    // Border radius tokens
    '--radius-sm': 'readonly',
    '--radius-md': 'readonly',
    '--radius-lg': 'readonly',
    '--radius-xl': 'readonly',
    '--radius-2xl': 'readonly',
    
    // Shadow tokens
    '--shadow-sm': 'readonly',
    '--shadow-md': 'readonly',
    '--shadow-lg': 'readonly',
    '--shadow-xl': 'readonly',
    
    // Transition tokens
    '--transition-fast': 'readonly',
    '--transition-normal': 'readonly',
    '--transition-slow': 'readonly',
    
    // Z-index tokens
    '--z-dropdown': 'readonly',
    '--z-sticky': 'readonly',
    '--z-fixed': 'readonly',
    '--z-modal-backdrop': 'readonly',
    '--z-modal': 'readonly',
    '--z-popover': 'readonly',
    '--z-tooltip': 'readonly',
  },
};
