# Migration Guide: Code Organization & Pattern Consistency

This guide provides step-by-step instructions for migrating the codebase to follow consistent patterns while respecting the two distinct design systems: **Dashboard** and **Public/Marketing** pages.

---

## Table of Contents

1. [Overview](#overview)
2. [Two Design Systems](#two-design-systems)
3. [Component Organization Strategy](#component-organization-strategy)
4. [Migration Phases](#migration-phases)
5. [Dashboard Pattern Migration](#dashboard-pattern-migration)
6. [Public/Marketing Pattern Migration](#publicmarketing-pattern-migration)
7. [Common Patterns](#common-patterns)
8. [Step-by-Step Migration Examples](#step-by-step-migration-examples)
9. [Verification Checklist](#verification-checklist)

---

## Overview

### Current State Analysis

**Issues Identified:**
- ❌ No `_components/` folders for page-specific components
- ❌ Page-specific components mixed with shared components
- ❌ Inconsistent naming (PascalCase vs kebab-case)
- ❌ Mixed export patterns (default vs named)
- ❌ UI components don't follow documented patterns
- ❌ `components/common/` contains feature-specific components

**Goal:**
- ✅ Clear separation between Dashboard and Public page patterns
- ✅ Consistent component organization
- ✅ Page-specific components colocated with pages
- ✅ Standardized naming and export patterns
- ✅ Better UX/UI consistency within each design system

---

## Two Design Systems

### 1. Dashboard System (`/dashboard/*`)

**Characteristics:**
- Uses `dashboard/layout.tsx` with sidebar navigation
- Dashboard-specific CSS classes (`dashboard-container`, `dashboard-sidebar`, etc.)
- Components located in `components/dashboard/`
- Consistent sidebar + main content layout
- Authenticated user experience

**Layout Structure:**
```
app/dashboard/
├── layout.tsx          # Dashboard layout with sidebar
├── page.tsx            # Dashboard home
└── [feature]/
    └── page.tsx        # Feature pages
```

**Component Location:**
```
components/dashboard/   # Dashboard-specific reusable components
app/dashboard/[page]/_components/  # Page-specific components
```

### 2. Public/Marketing System (Rest of Site)

**Characteristics:**
- Uses root `layout.tsx` with top navigation
- Standard Tailwind CSS classes
- Components in `components/common/` and feature folders
- Top nav + mobile bottom nav
- Public-facing experience

**Layout Structure:**
```
app/
├── layout.tsx          # Root layout with Navigation
├── page.tsx            # Homepage
├── search/
│   └── page.tsx
└── property/
    └── [id]/
        └── page.tsx
```

**Component Location:**
```
components/common/       # Shared public components
components/[feature]/    # Feature-specific components
app/[route]/_components/ # Page-specific components
```

---

## Component Organization Strategy

### Component Hierarchy

```
1. Base UI Components (components/ui/)
   └── Most reusable, design system primitives
   
2. Feature Components (components/[feature]/)
   └── Domain-specific reusable components
   
3. Page Components (app/[route]/_components/)
   └── Components used by only one page
```

### Decision Tree: Where Should This Component Live?

```
Is it a base UI primitive (button, input, card)?
├─ YES → components/ui/[component-name].tsx
└─ NO ↓

Is it used by multiple pages across different features?
├─ YES → components/common/[component-name].tsx (public)
│        OR components/dashboard/[component-name].tsx (dashboard)
└─ NO ↓

Is it used by multiple pages in the same feature?
├─ YES → components/[feature]/[component-name].tsx
└─ NO ↓

Is it only used by one page?
└─ YES → app/[route]/_components/[component-name].tsx
```

---

## Migration Phases

### Phase 1: Establish Structure (Week 1)
1. Create `_components/` folders for existing pages
2. Document current component usage
3. Identify components to migrate

### Phase 2: Migrate Page-Specific Components (Week 2-3)
1. Move page-specific components to `_components/`
2. Update imports
3. Test functionality

### Phase 3: Reorganize Shared Components (Week 4-5)
1. Split `components/common/` by feature
2. Move dashboard components to `components/dashboard/`
3. Update all imports

### Phase 4: Standardize UI Components (Week 6)
1. Refactor UI components to use CVA
2. Standardize exports (named exports)
3. Add `data-slot` attributes

### Phase 5: Naming & Export Consistency (Week 7)
1. Rename files to kebab-case
2. Convert to named exports (except pages)
3. Update all imports

---

## Dashboard Pattern Migration

### Dashboard Page Structure

**Target Structure:**
```
app/dashboard/
├── layout.tsx
├── page.tsx
├── properties/
│   ├── _components/
│   │   ├── properties-list.tsx
│   │   ├── properties-header.tsx
│   │   └── properties-filters.tsx
│   └── page.tsx
└── offers/
    ├── _components/
    │   ├── offers-list.tsx
    │   └── offer-filters.tsx
    └── page.tsx
```

### Dashboard Component Migration Steps

#### Step 1: Identify Page-Specific Components

**Example: Dashboard Properties Page**

**Before:**
```typescript
// app/dashboard/properties/page.tsx
import PropertyCard from '@/components/PropertyCard';
import DraftCard from '@/components/dashboard/DraftCard';
import EmptyState from '@/components/common/EmptyState';
```

**After:**
```typescript
// app/dashboard/properties/page.tsx
import { PropertyCard } from '@/components/property/property-card';
import { DraftCard } from '@/components/dashboard/draft-card';
import { EmptyState } from '@/components/common/empty-state';
import { PropertiesHeader } from './_components/properties-header';
import { PropertiesFilters } from './_components/properties-filters';
```

#### Step 2: Create `_components/` Folder

```bash
mkdir -p app/dashboard/properties/_components
```

#### Step 3: Extract Page-Specific Logic

**Create: `app/dashboard/properties/_components/properties-header.tsx`**

```typescript
"use client"

import { PlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface PropertiesHeaderProps {
  propertyCount: number
  draftCount: number
}

export function PropertiesHeader({ 
  propertyCount, 
  draftCount 
}: PropertiesHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-0">Properties</h1>
          <p className="text-gray-600 mt-1">Manage your property listings</p>
        </div>
        <Link href="/dashboard/add-property" className="btn-primary flex items-center">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Property
        </Link>
      </div>
    </div>
  )
}
```

#### Step 4: Update Page to Use New Components

**Updated: `app/dashboard/properties/page.tsx`**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI } from '@/lib/api-client';
import { PropertyCard } from '@/components/property/property-card';
import { DraftCard } from '@/components/dashboard/draft-card';
import { PropertiesHeader } from './_components/properties-header';
import { PropertiesFilters } from './_components/properties-filters';
import { CenteredLoadingSpinner } from '@/components/common/loading-spinner';
import { EmptyState } from '@/components/common/empty-state';

export default function PropertiesPage() {
  // ... existing logic ...
  
  return (
    <div className="h-full flex flex-col">
      <PropertiesHeader 
        propertyCount={properties.length}
        draftCount={drafts.length}
      />
      {/* Rest of component */}
    </div>
  );
}
```

### Dashboard Component Naming Convention

**Files:**
- ✅ `kebab-case.tsx` - `properties-header.tsx`, `offer-filters.tsx`
- ❌ `PascalCase.tsx` - `PropertiesHeader.tsx`

**Exports:**
- ✅ Named exports - `export function PropertiesHeader() {}`
- ❌ Default exports (except pages) - `export default function PropertiesHeader() {}`

---

## Public/Marketing Pattern Migration

### Public Page Structure

**Target Structure:**
```
app/
├── search/
│   ├── _components/
│   │   ├── search-filters.tsx
│   │   ├── search-results.tsx
│   │   └── search-header.tsx
│   └── page.tsx
└── property/
    └── [id]/
        ├── _components/
        │   ├── property-gallery.tsx
        │   ├── property-details.tsx
        │   └── property-actions.tsx
        └── page.tsx
```

### Public Component Migration Steps

#### Step 1: Identify Page-Specific Components

**Example: Search Page**

**Before:**
```typescript
// app/search/SearchPageContent.tsx (in same directory as page.tsx)
export default function SearchPageContent() {
  // All search logic here
}
```

**After:**
```typescript
// app/search/page.tsx
import { SearchFilters } from './_components/search-filters';
import { SearchResults } from './_components/search-results';
import { SearchHeader } from './_components/search-header';

export default function SearchPage() {
  // Minimal page logic, delegates to components
}
```

#### Step 2: Create `_components/` Folder

```bash
mkdir -p app/search/_components
```

#### Step 3: Split Large Components

**Create: `app/search/_components/search-filters.tsx`**

```typescript
"use client"

import { useState } from 'react'
import { ModernFilter } from '@/components/search/modern-filter'
import { FilterTags } from '@/components/search/filter-tags'

interface SearchFiltersProps {
  filters: {
    location: string
    bedrooms: string
    maxPrice: string
  }
  onFiltersChange: (filters: SearchFiltersProps['filters']) => void
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <>
      <ModernFilter
        filters={filters}
        onFiltersChange={onFiltersChange}
        isOpen={isFilterOpen}
        onToggle={() => setIsFilterOpen(!isFilterOpen)}
      />
      <FilterTags filters={filters} onRemoveTag={(key) => {
        onFiltersChange({ ...filters, [key]: '' })
      }} />
    </>
  )
}
```

**Create: `app/search/_components/search-results.tsx`**

```typescript
"use client"

import { Property } from '@/types'
import { PropertyCard } from '@/components/property/property-card'
import { PropertyCardSkeletonGrid } from '@/components/common/property-card-skeleton'
import { propertyCardClasses } from '@/styles/property-card'

interface SearchResultsProps {
  properties: Property[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function SearchResults({
  properties,
  isLoading,
  currentPage,
  totalPages,
  onPageChange
}: SearchResultsProps) {
  if (isLoading) {
    return <PropertyCardSkeletonGrid />
  }

  return (
    <div className={propertyCardClasses.grid.default}>
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
      {/* Pagination */}
    </div>
  )
}
```

#### Step 4: Refactor Page Component

**Updated: `app/search/page.tsx`**

```typescript
import { Metadata } from 'next'
import { Suspense } from 'react'
import { SearchPageContent } from './_components/search-page-content'

export const metadata: Metadata = {
  title: 'Search Properties - dropiti',
  description: 'Search and discover amazing properties...',
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div>Loading...</div>}>
        <SearchPageContent />
      </Suspense>
    </div>
  )
}
```

**Create: `app/search/_components/search-page-content.tsx`**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SearchFilters } from './search-filters'
import { SearchResults } from './search-results'
import { SearchHeader } from './search-header'
import Footer from '@/components/common/footer'
import { propertiesAPI } from '@/lib/api-client'

export function SearchPageContent() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState([])
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  })

  // ... existing logic ...

  return (
    <>
      <SearchHeader />
      <SearchFilters filters={filters} onFiltersChange={setFilters} />
      <SearchResults 
        properties={properties}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      <Footer />
    </>
  )
}
```

---

## Common Patterns

### Pattern 1: Page with Multiple Sections

**Structure:**
```
app/[route]/
├── _components/
│   ├── [route]-header.tsx
│   ├── [route]-filters.tsx
│   ├── [route]-content.tsx
│   └── [route]-footer.tsx
└── page.tsx
```

**Example: Dashboard Offers Page**

```
app/dashboard/offers/
├── _components/
│   ├── offers-header.tsx
│   ├── incoming-offers-list.tsx
│   ├── outgoing-offers-list.tsx
│   └── offer-filters.tsx
└── page.tsx
```

### Pattern 2: Complex Page with Client/Server Split

**Structure:**
```
app/[route]/
├── _components/
│   ├── [route]-page-content.tsx  # Client component wrapper
│   ├── [route]-section-1.tsx
│   ├── [route]-section-2.tsx
│   └── [route]-section-3.tsx
└── page.tsx  # Server component
```

**Example: Property Detail Page**

```
app/property/[id]/
├── _components/
│   ├── property-page-content.tsx  # Client wrapper
│   ├── property-gallery.tsx
│   ├── property-details.tsx
│   ├── property-amenities.tsx
│   └── property-actions.tsx
└── page.tsx  # Server component with metadata
```

### Pattern 3: Shared Dashboard Components

**Location:** `components/dashboard/`

**When to use:**
- Component used by multiple dashboard pages
- Component specific to dashboard design system
- Component uses dashboard CSS classes

**Examples:**
- `components/dashboard/draft-card.tsx` - Used by properties and add-property pages
- `components/dashboard/chat-view.tsx` - Used by chat pages
- `components/dashboard/tenant-view.tsx` - Used by multiple dashboard pages

### Pattern 4: Shared Public Components

**Location:** `components/common/` or `components/[feature]/`

**When to use `components/common/`:**
- Component used across multiple unrelated features
- Generic UI component (EmptyState, LoadingSpinner, Footer)

**When to use `components/[feature]/`:**
- Component used by multiple pages in same feature
- Feature-specific logic (PropertyCard, OfferCard, ReviewCard)

---

## Step-by-Step Migration Examples

### Example 1: Migrating Dashboard Properties Page

#### Current State
```
app/dashboard/properties/
└── page.tsx  (259 lines, all logic inline)
```

#### Step 1: Analyze Component Usage
- Identify reusable vs page-specific code
- Note imported components
- List inline logic that could be extracted

#### Step 2: Create `_components/` Folder
```bash
mkdir -p app/dashboard/properties/_components
```

#### Step 3: Extract Header Component
```typescript
// app/dashboard/properties/_components/properties-header.tsx
"use client"

import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'

interface PropertiesHeaderProps {
  propertyCount: number
  draftCount: number
}

export function PropertiesHeader({ 
  propertyCount, 
  draftCount 
}: PropertiesHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-0">Properties</h1>
          <p className="text-gray-600 mt-1">Manage your property listings</p>
        </div>
        <Link 
          href="/dashboard/add-property" 
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Property
        </Link>
      </div>
    </div>
  )
}
```

#### Step 4: Extract Tabs Component
```typescript
// app/dashboard/properties/_components/properties-tabs.tsx
"use client"

import { useRouter } from 'next/navigation'

interface PropertiesTabsProps {
  activeTab: 'published' | 'drafts'
  propertyCount: number
  draftCount: number
}

export function PropertiesTabs({
  activeTab,
  propertyCount,
  draftCount
}: PropertiesTabsProps) {
  const router = useRouter()

  return (
    <div className="bg-white border-b border-gray-200 px-6">
      <div className="flex space-x-8">
        <button
          onClick={() => router.push('/dashboard/properties?tab=published')}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'published'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Published Properties
          {propertyCount > 0 && (
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
              {propertyCount}
            </span>
          )}
        </button>
        <button
          onClick={() => router.push('/dashboard/properties?tab=drafts')}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'drafts'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Drafts
          {draftCount > 0 && (
            <span className="ml-2 bg-purple-100 text-purple-700 py-0.5 px-2.5 rounded-full text-xs font-medium">
              {draftCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
```

#### Step 5: Update Main Page
```typescript
// app/dashboard/properties/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI } from '@/lib/api-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropertyCard } from '@/components/property/property-card';
import { DraftCard } from '@/components/dashboard/draft-card';
import { CenteredLoadingSpinner } from '@/components/common/loading-spinner';
import { EmptyState } from '@/components/common/empty-state';
import { PropertiesHeader } from './_components/properties-header';
import { PropertiesTabs } from './_components/properties-tabs';
import { propertyCardClasses } from '@/styles/property-card';

export default function PropertiesPage() {
  // ... existing state and effects ...
  
  return (
    <div className="h-full flex flex-col">
      <PropertiesHeader 
        propertyCount={properties.length}
        draftCount={drafts.length}
      />
      <PropertiesTabs
        activeTab={activeTab}
        propertyCount={properties.length}
        draftCount={drafts.length}
      />
      {/* Rest of component */}
    </div>
  );
}
```

### Example 2: Migrating Search Page

#### Current State
```
app/search/
├── page.tsx
└── SearchPageContent.tsx  (446 lines)
```

#### Step 1: Create `_components/` Folder
```bash
mkdir -p app/search/_components
```

#### Step 2: Extract Components
- `search-filters.tsx` - Filter UI
- `search-results.tsx` - Results grid
- `search-pagination.tsx` - Pagination controls
- `search-page-content.tsx` - Main client component

#### Step 3: Update Structure
```
app/search/
├── _components/
│   ├── search-page-content.tsx
│   ├── search-filters.tsx
│   ├── search-results.tsx
│   └── search-pagination.tsx
└── page.tsx
```

---

## Verification Checklist

### Before Migration
- [ ] Document current component structure
- [ ] Identify all page-specific components
- [ ] List all shared components and their usage
- [ ] Create backup branch

### During Migration
- [ ] Create `_components/` folder for each page
- [ ] Move page-specific components
- [ ] Update all imports
- [ ] Test each page after migration
- [ ] Verify no broken imports

### After Migration
- [ ] All pages follow consistent structure
- [ ] No components in wrong locations
- [ ] All imports use correct paths
- [ ] Named exports for components (except pages)
- [ ] Kebab-case file names
- [ ] Dashboard components use dashboard CSS classes
- [ ] Public components use standard Tailwind classes

### Code Quality Checks
- [ ] ESLint passes
- [ ] TypeScript compiles without errors
- [ ] No unused imports
- [ ] Components are properly typed
- [ ] Client components marked with `"use client"`

---

## Naming Conventions Reference

### Files
| Type | Convention | Example |
|------|-----------|---------|
| Page components | `kebab-case.tsx` | `properties-header.tsx` |
| Feature components | `kebab-case.tsx` | `property-card.tsx` |
| UI components | `kebab-case.tsx` | `button.tsx` |
| Pages | `page.tsx` | `page.tsx` |
| Layouts | `layout.tsx` | `layout.tsx` |

### Exports
| Type | Convention | Example |
|------|-----------|---------|
| Components | Named export | `export function Button() {}` |
| Pages | Default export | `export default function Page() {}` |
| Types | Named export | `export interface ButtonProps {}` |
| Variants | Named export | `export const buttonVariants = cva(...)` |

### Directories
| Type | Convention | Example |
|------|-----------|---------|
| Page components | `_components/` | `app/dashboard/properties/_components/` |
| Feature folders | `kebab-case/` | `components/property/` |
| Route groups | `(group)/` | `app/(main)/` |
| Dynamic routes | `[param]/` | `app/property/[id]/` |

---

## Common Pitfalls & Solutions

### Pitfall 1: Moving Shared Components to `_components/`

**Problem:**
```typescript
// ❌ Wrong: Component used by multiple pages
app/dashboard/properties/_components/property-card.tsx
app/dashboard/offers/_components/property-card.tsx  // Duplicate!
```

**Solution:**
```typescript
// ✅ Correct: Shared component in feature folder
components/property/property-card.tsx
```

### Pitfall 2: Mixing Dashboard and Public Components

**Problem:**
```typescript
// ❌ Wrong: Dashboard component in public folder
components/common/dashboard-card.tsx
```

**Solution:**
```typescript
// ✅ Correct: Dashboard component in dashboard folder
components/dashboard/dashboard-card.tsx
```

### Pitfall 3: Inconsistent Naming

**Problem:**
```typescript
// ❌ Wrong: Mixed naming
components/property/PropertyCard.tsx
components/property/property-card.tsx
```

**Solution:**
```typescript
// ✅ Correct: Consistent kebab-case
components/property/property-card.tsx
```

### Pitfall 4: Default Exports for Components

**Problem:**
```typescript
// ❌ Wrong: Default export for reusable component
export default function PropertyCard() {}
```

**Solution:**
```typescript
// ✅ Correct: Named export
export function PropertyCard() {}
```

---

## Migration Timeline

### Week 1: Foundation
- Create `_components/` folders for all pages
- Document current structure
- Set up migration tracking

### Week 2-3: Dashboard Pages
- Migrate `/dashboard/properties`
- Migrate `/dashboard/offers`
- Migrate `/dashboard/chat`
- Migrate remaining dashboard pages

### Week 4-5: Public Pages
- Migrate `/search`
- Migrate `/property/[id]`
- Migrate `/user/[id]`
- Migrate remaining public pages

### Week 6: Component Reorganization
- Split `components/common/` by feature
- Move dashboard components
- Update all imports

### Week 7: Standardization
- Rename files to kebab-case
- Convert to named exports
- Final verification

---

## Additional Resources

- [Coding Patterns Guide](./coding-pattern.md) - Full pattern reference
- [Next.js App Router Docs](https://nextjs.org/docs/app) - Next.js patterns
- [shadcn/ui Patterns](https://ui.shadcn.com) - UI component patterns

---

**Last Updated:** Based on codebase analysis  
**Maintained By:** Development Team
