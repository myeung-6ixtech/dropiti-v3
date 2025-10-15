# Plus Jakarta Sans Font System

This project now uses **Plus Jakarta Sans** as the primary font with a centralized configuration system.

## 🎯 Overview

The font system provides:
- **Centralized control** over typography
- **Local font files** for better performance
- **TypeScript support** for font weights and styles
- **Tailwind CSS integration** for easy styling
- **Fallback fonts** for reliability

## 📁 File Structure

```
src/
├── config/
│   └── fonts.ts              # Font configuration
├── styles/
│   └── fonts.css             # @font-face declarations
├── utils/
│   └── fonts.ts              # Font utility functions
└── assets/fonts/
    └── PlusJakartaSans/       # Font files
        ├── PlusJakartaSans-Regular.woff
        ├── PlusJakartaSans-Medium.woff
        ├── PlusJakartaSans-Bold.woff
        └── ... (all weights)
```

## 🚀 Usage

### Tailwind Classes

```tsx
// Primary font (Plus Jakarta Sans)
<h1 className="font-sans font-bold">Heading</h1>
<p className="font-sans font-normal">Body text</p>

// Direct font family
<h2 className="font-plus-jakarta font-semibold">Direct usage</h2>

// Fallback to Inter
<p className="font-inter font-normal">Inter fallback</p>
```

### Utility Functions

```tsx
import { fontClasses, fontWeights } from '@/utils/fonts';

// Pre-defined classes
<h1 className={fontClasses.display}>Display text</h1>
<h2 className={fontClasses.heading}>Heading</h2>
<p className={fontClasses.body}>Body text</p>
<button className={fontClasses.button}>Button</button>

// Font weights
<p className={fontWeights.light}>Light text</p>
<p className={fontWeights.bold}>Bold text</p>
```

### CSS Custom Properties

```css
.custom-text {
  font-family: var(--font-primary); /* Plus Jakarta Sans */
}

.fallback-text {
  font-family: var(--font-secondary); /* Inter */
}
```

## 🎨 Available Font Weights

| Weight | Class | Value |
|--------|-------|-------|
| Extra Light | `font-extralight` | 200 |
| Light | `font-light` | 300 |
| Normal | `font-normal` | 400 |
| Medium | `font-medium` | 500 |
| Semi Bold | `font-semibold` | 600 |
| Bold | `font-bold` | 700 |
| Extra Bold | `font-extrabold` | 800 |

## 🔧 Configuration

### Font Configuration (`src/config/fonts.ts`)

```typescript
export const FONT_CONFIG = {
  primary: {
    family: 'Plus Jakarta Sans',
    fallbacks: ['Inter', '-apple-system', 'BlinkMacSystemFont', ...],
    weights: {
      extraLight: 200,
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
      extraBold: 800,
    }
  }
};
```

### Tailwind Configuration

```typescript
fontFamily: {
  sans: ['Plus Jakarta Sans', 'Inter', ...], // Primary
  'plus-jakarta': ['Plus Jakarta Sans', ...], // Direct
  'inter': ['Inter', ...], // Fallback
}
```

## 📱 Responsive Typography

```tsx
// Responsive font sizes
<h1 className="text-2xl md:text-4xl font-plus-jakarta font-bold">
  Responsive Heading
</h1>

// Mobile-optimized
<p className="text-sm md:text-base font-sans font-normal">
  Mobile-friendly text
</p>
```

## 🎯 Best Practices

1. **Use `font-sans`** for most text (automatically uses Plus Jakarta Sans)
2. **Use utility functions** for consistent styling
3. **Specify weights explicitly** for better control
4. **Test across devices** to ensure proper rendering
5. **Use fallbacks** for better reliability

## 🔄 Migration Notes

- **Old**: `font-inter` → **New**: `font-sans` (now Plus Jakarta Sans)
- **Old**: Google Fonts → **New**: Local font files
- **Old**: Manual font imports → **New**: Centralized configuration

## 🧪 Testing

Use the `FontTestComponent` to test all font variations:

```tsx
import FontTestComponent from '@/components/test/FontTestComponent';

// Add to any page for testing
<FontTestComponent />
```

## 🚀 Performance Benefits

- ✅ **Local fonts** = faster loading
- ✅ **Font-display: swap** = no layout shift
- ✅ **WOFF format** = optimal compression
- ✅ **Preloaded fonts** = instant rendering
