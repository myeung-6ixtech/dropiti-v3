# Dropiti Design System

A comprehensive, centralized design system for the Dropiti application that provides consistent styling, components, and utilities while maintaining ESLint compatibility and following best practices.

## 🎨 Overview

The Dropiti Design System is built on top of Tailwind CSS and provides:

- **Design Tokens**: CSS custom properties for colors, spacing, and more
- **Component Classes**: Pre-built, reusable component styles
- **Utility Classes**: Helper classes for common patterns
- **TypeScript Support**: Full type definitions and configuration
- **ESLint Compatibility**: Follows best practices and linting rules

## 📁 File Structure

```
src/styles/
├── design-system.ts       # TypeScript configuration and tokens
└── README.md             # This documentation

src/app/
└── globals.css           # Main design system implementation
```

## 🚀 Getting Started

### 1. The Design System is Already Imported

The design system is automatically imported in `src/app/globals.css` and available throughout your application.

### 2. Use TypeScript Tokens

```typescript
import { colors, spacing, theme } from '@/styles/design-system';

// Use color tokens
const primaryColor = colors.primary[500];

// Use spacing tokens
const margin = spacing.lg;

// Use the full theme
const themeConfig = theme;
```

## 🎯 Design Tokens

### Colors

The design system provides a comprehensive color palette:

```css
:root {
  /* Primary Colors */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;
}
```

### Spacing

Consistent spacing scale:

```css
:root {
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
}
```

## 🧩 Component Classes

### Buttons

```html
<!-- Primary button -->
<button class="btn btn-primary">Primary Action</button>

<!-- Secondary button -->
<button class="btn btn-secondary">Secondary Action</button>
```

### Forms

```html
<!-- Form input -->
<input type="email" class="form-input" />

<!-- Form label -->
<label class="form-label">Email</label>
```

### Cards

```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here</p>
  </div>
</div>
```

### Property Cards

```html
<div class="property-card">
  <div class="property-card-image">
    <img src="property.jpg" alt="Property" />
  </div>
  <div class="property-card-content">
    <h3 class="property-card-title">Modern Apartment</h3>
    <p class="property-card-location">Downtown, City</p>
    <div class="property-card-price">$2,500/month</div>
  </div>
</div>
```

## 🛠️ Utility Classes

### Layout Utilities

```html
<!-- Flexbox utilities -->
<div class="flex-center">Centered content</div>
<div class="flex-between">Space between content</div>

<!-- Container utilities -->
<div class="container">Standard container</div>
<div class="page-container">Page container</div>
```

### Spacing Utilities

```html
<!-- Custom spacing -->
<div class="space-page">Page spacing</div>
<div class="space-section">Section spacing</div>
<div class="space-component">Component spacing</div>
```

## 🎨 Customization

### Adding New Colors

1. Add to CSS custom properties in `globals.css`:

```css
:root {
  --color-accent-500: #8b5cf6;
  --color-accent-600: #7c3aed;
}
```

2. Add to TypeScript configuration in `design-system.ts`:

```typescript
export const colors = {
  // ... existing colors
  accent: {
    500: '#8b5cf6',
    600: '#7c3aed',
  },
} as const;
```

### Adding New Components

1. Create component styles in `globals.css`:

```css
@layer components {
  .custom-component {
    @apply bg-white rounded-lg shadow-sm p-4;
  }
}
```

2. Use in your components:

```html
<div class="custom-component">Custom component</div>
```

## 📱 Responsive Design

The design system includes responsive utilities:

```html
<!-- Responsive containers -->
<div class="container">Responsive container</div>
<div class="page-container">Page container</div>
```

## ♿ Accessibility

### Focus Management

```html
<!-- Focus ring -->
<button class="btn btn-primary">Primary button</button>
```

## 🌙 Dark Mode Support

The design system automatically supports dark mode through CSS custom properties and can be extended as needed.

## 📊 Performance

The design system is optimized for performance:

- Uses Tailwind CSS for efficient CSS generation
- Minimal custom CSS for maximum compatibility
- Leverages CSS custom properties for dynamic theming

## 🔧 ESLint Compatibility

The design system is designed to be ESLint-friendly:

- Uses `@apply` directives properly
- Follows Tailwind CSS best practices
- Maintains consistent naming conventions
- Avoids conflicting CSS rules

## 📚 Best Practices

### 1. Use Design Tokens

✅ **Good:**
```html
<div class="bg-primary text-white p-md rounded-lg">
  Content
</div>
```

❌ **Avoid:**
```html
<div class="bg-blue-600 text-white p-4 rounded-lg">
  Content
</div>
```

### 2. Leverage Component Classes

✅ **Good:**
```html
<button class="btn btn-primary">Primary Button</button>
```

❌ **Avoid:**
```html
<button class="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg">
  Primary Button
</button>
```

### 3. Use Utility Classes for Layout

✅ **Good:**
```html
<div class="flex-center space-y-4">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
</div>
```

❌ **Avoid:**
```html
<div class="flex items-center justify-center space-y-4">
  <div class="bg-white rounded-lg shadow-sm p-4">Card 1</div>
  <div class="bg-white rounded-lg shadow-sm p-4">Card 2</div>
</div>
```

## 🚨 Migration Guide

### From Old System

1. **Replace custom classes:**
   ```html
   <!-- Old -->
   <div class="auth-container">
   
   <!-- New -->
   <div class="auth-container">
   <!-- (Still supported for backward compatibility) -->
   ```

2. **Update to new utilities:**
   ```html
   <!-- Old -->
   <div class="max-w-7xl mx-auto px-4">
   
   <!-- New -->
   <div class="container">
   ```

3. **Use new component classes:**
   ```html
   <!-- Old -->
   <button class="bg-blue-600 text-white px-4 py-2 rounded">
   
   <!-- New -->
   <button class="btn btn-primary">
   ```

## 🤝 Contributing

When adding new styles to the design system:

1. **Follow the naming convention**: Use descriptive, semantic names
2. **Add to globals.css**: All styles go in the main CSS file
3. **Include TypeScript types**: If adding new tokens, update `design-system.ts`
4. **Document usage**: Add examples to this README
5. **Test thoroughly**: Ensure styles work across different screen sizes

## 📖 Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CSS Custom Properties Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Design System Best Practices](https://www.designsystems.com/)

## 🆘 Support

For questions or issues with the design system:

1. Check this documentation first
2. Review existing component examples
3. Consult the TypeScript configuration
4. Open an issue with specific details about your use case

---

**Built with ❤️ for the Dropiti team**
