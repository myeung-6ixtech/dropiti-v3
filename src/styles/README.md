# Dropiti Design System

This directory contains the centralized design system for the Dropiti platform, ensuring consistency across all components.

## Files

- `design-system.css` - Core CSS with design tokens and utility classes
- `design-system.ts` - TypeScript configuration and type definitions
- `offer-card-status.ts` - Specialized styles for offer card status components
- `property-card.ts` - Specialized styles for property card components
- `auth.ts` - Specialized styles for authentication components

## Offer Card Status Styles

The offer card status components now use standardized styles for consistent look and feel across the platform.

### Usage

```typescript
import { offerStatusClasses } from '@/styles/offer-card-status';

// Use in your component
<div className={offerStatusClasses.statusContainer}>
  <div className={offerStatusClasses.finalTermsContainer}>
    <h4 className={offerStatusClasses.finalTermsHeader}>
      🎯 Final Accepted Terms
    </h4>
    {/* ... rest of the component */}
  </div>
</div>
```

### Available Classes

#### Final Terms Display
- `finalTermsContainer` - Main container for final terms
- `finalTermsHeader` - Header text styling
- `finalTermsGrid` - Grid layout for terms
- `finalTermsColumn` - Column styling
- `finalTermsRow` - Row styling for label-value pairs
- `finalTermsLabel` - Label text styling
- `finalTermsValue` - Value text styling
- `finalTermsDivider` - Divider line styling
- `finalTermsStatus` - Status section styling
- `finalTermsStatusLabel` - Status label styling
- `finalTermsStatusBadge` - Status badge styling

#### Status Messages
- `statusContainer` - Main status container
- `statusMessage` - Status message container
- `statusMessageText` - Main status text
- `statusMessageSubtext` - Subtitle text

#### Status Variants
- `accepted.container` - Accepted offer container
- `accepted.text` - Accepted offer text
- `accepted.subtext` - Accepted offer subtitle
- `rejected.container` - Rejected offer container
- `rejected.text` - Rejected offer text
- `rejected.subtext` - Rejected offer subtitle
- `withdrawn.container` - Withdrawn offer container
- `withdrawn.text` - Withdrawn offer text
- `pending.container` - Pending offer container
- `pending.text` - Pending offer text
- `pending.subtext` - Pending offer subtitle
- `counterRecipient.container` - Counter offer (recipient) container
- `counterRecipient.text` - Counter offer (recipient) text
- `counterRecipient.subtext` - Counter offer (recipient) subtitle
- `counterInitiator.container` - Counter offer (initiator) container
- `counterInitiator.text` - Counter offer (initiator) text
- `counterInitiator.subtext` - Counter offer (initiator) subtitle

#### Utility Classes
- `counterContainer` - Container for counter offer sections
- `rounded` - Border radius utility
- `padding` - Padding utility
- `margin` - Margin utility

## Property Card Styles

The PropertyCard component now uses standardized styles for consistent look and feel across all property listings.

### Usage

```typescript
import { propertyCardClasses } from '@/styles/property-card';

// Use in your component
<div className={propertyCardClasses.container}>
  <div className={propertyCardClasses.image.container}>
    {/* Property image */}
  </div>
  <div className={propertyCardClasses.details}>
    <h3 className={propertyCardClasses.title}>Property Title</h3>
    {/* ... rest of the component */}
  </div>
</div>
```

### Available Classes

#### Main Container
- `container` - Main property card container with shadow and hover effects

#### Image Section
- `image.container` - Image container with fixed dimensions
- `image.placeholder` - Image styling for placeholders

#### Details Section
- `details` - Main content container
- `title` - Property title styling

#### Features Section
- `features.container` - Features container with spacing
- `features.location` - Location text styling
- `features.row` - Row layout for features
- `features.feature` - Individual feature styling
- `features.icon` - Feature icon styling
- `features.text` - Feature text styling
- `features.type` - Property type styling

#### Price Section
- `price.container` - Price container layout
- `price.amount` - Price amount styling
- `price.unit` - Price unit styling

#### Actions Section
- `actions.container` - Actions button container
- `actions.button` - Base button styling
- `actions.buttonPrimary` - Primary button styling
- `actions.buttonSecondary` - Secondary button styling
- `actions.buttonFull` - Full-width button styling

#### Dashboard Edit Icon
- `editIcon.container` - Edit icon positioning
- `editIcon.link` - Edit icon link styling
- `editIcon.svg` - Edit icon SVG styling

#### Grid Layouts
- `grid.default` - Default grid layout (dashboard)
- `grid.search` - Search results grid layout

#### Hover Effects
- `hover` - Hover shadow and transition effects

#### Loading States
- `skeleton.container` - Skeleton loading container
- `skeleton.image` - Skeleton image placeholder
- `skeleton.content` - Skeleton content container
- `skeleton.title` - Skeleton title placeholder
- `skeleton.feature` - Skeleton feature placeholder
- `skeleton.price` - Skeleton price placeholder

#### Responsive Utilities
- `responsive` - Responsive width utilities
- `mobileOptimized` - Mobile-optimized padding

### Pre-built Patterns

```typescript
import { propertyCardPatterns } from '@/styles/property-card';

// Standard property card
<div className={propertyCardPatterns.standard}>
  {/* Content */}
</div>

// Dashboard property card
<div className={propertyCardPatterns.dashboard}>
  {/* Content */}
</div>

// Search result property card
<div className={propertyCardPatterns.search}>
  {/* Content */}
</div>

// Loading skeleton
<div className={propertyCardPatterns.skeleton}>
  {/* Content */}
</div>
```

### Grid Usage Examples

```typescript
// Dashboard properties grid
<div className={propertyCardClasses.grid.default}>
  {properties.map(property => (
    <PropertyCard key={property.id} property={property} isDashboard={true} />
  ))}
</div>

// Search results grid
<div className={propertyCardClasses.grid.search}>
  {searchResults.map(property => (
    <PropertyCard key={property.id} property={property} />
  ))}
</div>
```

## Auth Styles

The authentication components now use standardized styles for consistent look and feel across all auth pages and forms.

### Usage

```typescript
import { authClasses, authFormPatterns } from '@/styles/auth';

// Use in your component
<div className={authClasses.container}>
  <div className={authClasses.formSection}>
    <div className={authClasses.formWrapper}>
      <h1 className={authClasses.title}>Sign In</h1>
      {/* ... rest of the component */}
    </div>
  </div>
</div>
```

### Available Classes

#### Main Layout
- `container` - Main auth page container
- `formSection` - Form section styling
- `contentSection` - Content section styling
- `contentWrapper` - Content wrapper styling
- `formWrapper` - Form wrapper styling

#### Typography
- `title` - Main title styling
- `subtitle` - Subtitle text styling
- `heading` - Content heading styling
- `description` - Content description styling
- `textCenter` - Centered text styling

#### Buttons
- `button` - Primary button styling
- `buttonSecondary` - Secondary button styling

#### Form Elements
- `input` - Standard input styling
- `inputWithIcon` - Input with icon styling
- `inputIcon` - Input icon styling
- `label` - Form label styling
- `form` - Form container styling
- `checkbox` - Checkbox input styling
- `checkboxLabel` - Checkbox label styling

#### Spacing and Layout
- `sectionSpacing` - Section spacing utility
- `contentSpacing` - Content spacing utility

#### Links
- `backLink` - Back navigation link styling
- `link` - Primary link styling
- `linkSecondary` - Secondary link styling

#### Status Messages
- `success` - Success message styling
- `error` - Error message styling

#### Content Features
- `featureItem` - Feature item container
- `featureDot` - Feature dot indicator
- `featureText` - Feature text styling

#### Responsive Utilities
- `responsive` - Responsive padding utilities
- `mobileOptimized` - Mobile-optimized padding

#### Loading States
- `loading` - Loading state styling
- `loadingText` - Loading text styling

#### Focus States
- `focusRing` - Focus ring styling

#### Hover Effects
- `hover` - Hover transition effects

#### Animation Utilities
- `fadeIn` - Fade in animation
- `slideUp` - Slide up animation

### Pre-built Patterns

```typescript
import { authPatterns } from '@/styles/auth';

// Standard auth form
<div className={authPatterns.standardForm}>
  {/* Content */}
</div>

// Auth page layout
<div className={authPatterns.pageLayout}>
  {/* Content */}
</div>

// Form section
<div className={authPatterns.formSection}>
  {/* Content */}
</div>

// Content section
<div className={authPatterns.contentSection}>
  {/* Content */}
</div>

// Input field with icon
<input className={authPatterns.inputWithIcon} />

// Button with loading state
<button className={authPatterns.buttonLoading}>
  {/* Content */}
</button>

// Success message with animation
<div className={authPatterns.successMessage}>
  {/* Content */}
</div>

// Error message with animation
<div className={authPatterns.errorMessage}>
  {/* Content */}
</div>
```

### Form Field Patterns

```typescript
import { authFormPatterns } from '@/styles/auth';

// Standard form field
<div className={authFormPatterns.field.container}>
  <label className={authFormPatterns.field.label}>
    Field Name <span className={authFormPatterns.field.required}>*</span>
  </label>
  <input className={authFormPatterns.field.input} />
</div>

// Form field with icon
<div className={authFormPatterns.fieldWithIcon.container}>
  <label className={authFormPatterns.fieldWithIcon.label}>
    Password <span className={authFormPatterns.fieldWithIcon.required}>*</span>
  </label>
  <div className="relative">
    <input className={authFormPatterns.fieldWithIcon.input} />
    <button className={authFormPatterns.fieldWithIcon.icon}>
      Show
    </button>
  </div>
</div>

// Checkbox field
<div className={authFormPatterns.checkbox.container}>
  <input className={authFormPatterns.checkbox.input} />
  <label className={authFormPatterns.checkbox.label}>
    Remember me
  </label>
</div>

// Form actions
<div className={authFormPatterns.actions.container}>
  <button className={authFormPatterns.actions.button}>
    Submit
  </button>
</div>
```

### Page Layout Examples

```typescript
// Sign In Page
<div className={authClasses.container}>
  <div className={authClasses.formSection}>
    <SignInForm />
  </div>
  <div className={authClasses.contentSection}>
    <div className={authClasses.contentWrapper}>
      <h2 className={authClasses.heading}>Welcome to Dropiti</h2>
      <p className={authClasses.description}>
        Find your perfect property or list your space.
      </p>
      <div className={authClasses.contentSpacing}>
        <div className={authClasses.featureItem}>
          <div className={authClasses.featureDot}></div>
          <span className={authClasses.featureText}>Feature description</span>
        </div>
      </div>
    </div>
  </div>
</div>

// Form Component
<div className={authClasses.formWrapper}>
  <div className={authClasses.sectionSpacing}>
    <Link href="/" className={authClasses.backLink}>
      ← Back to dashboard
    </Link>
  </div>
  
  <div className={authClasses.sectionSpacing}>
    <h1 className={authClasses.title}>Sign In</h1>
    <p className={authClasses.subtitle}>
      Enter your credentials to access your account.
    </p>
  </div>
  
  <form className={authClasses.form}>
    {/* Form fields using authFormPatterns */}
  </form>
</div>
```

### Benefits

1. **Consistency** - All authentication components look identical across the platform
2. **Maintainability** - Changes to styles only need to be made in one place
3. **Reusability** - Styles can be easily applied to new auth-related components
4. **Type Safety** - TypeScript ensures correct class names are used
5. **Performance** - CSS classes are optimized and cached
6. **Responsive Design** - Built-in responsive utilities for different screen sizes
7. **Accessibility** - Consistent focus states and hover effects
8. **Animation Support** - Built-in animation utilities for enhanced UX

## Color Palette

The design system uses an Airbnb-inspired color palette:

- **Primary**: Black and gray tones for main elements
- **Success**: Green tones for positive states
- **Error**: Red tones for negative states
- **Warning**: Yellow/Orange tones for caution states
- **Secondary**: Blue tones for informational states

## Spacing

Consistent spacing scale:
- `xs`: 0.25rem (4px)
- `sm`: 0.5rem (8px)
- `md`: 1rem (16px)
- `lg`: 1.5rem (24px)
- `xl`: 2rem (32px)
- `2xl`: 3rem (48px)
- `3xl`: 4rem (64px)

## Typography

- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Text Sizes**: xs (12px), sm (14px), base (16px), lg (18px), xl (20px)

## Shadows

- **sm**: Subtle shadows for cards and buttons
- **md**: Medium shadows for elevated elements
- **lg**: Large shadows for modals and overlays
