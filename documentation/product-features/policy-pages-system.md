# Policy Pages System

*Last updated: January 1, 2025*

## Overview

The Policy Pages System provides a centralized, maintainable way to display legal and policy documents with consistent styling, proper HTML hierarchy, and a unified footer across all policy pages.

## Features

### ✅ **Markdown to HTML Conversion**
- **Proper HTML hierarchy** maintained from markdown structure
- **Consistent typography** and spacing across all pages
- **Responsive design** for mobile and desktop
- **SEO-friendly** HTML output

### ✅ **Centralized Styling**
- **Single source of truth** for all policy page styles
- **Tailwind CSS classes** for consistent design
- **Easy maintenance** and updates
- **Responsive breakpoints** built-in

### ✅ **Existing Footer Integration**
- **Uses existing Footer component** from `components/common/Footer.tsx`
- **Navigation links** to all policy pages already included
- **Contact information** and support details
- **Copyright notice** with dynamic year
- **Consistent branding** across all pages

### ✅ **Easy Content Management**
- **Markdown files** for simple text updates
- **No code changes** needed for content updates
- **Version control** friendly
- **Quick deployment** of policy changes

## Architecture

### File Structure
```
src/
├── app/(policy)/[slug]/page.tsx          # Dynamic policy page router
├── components/common/
│   ├── MarkdownRenderer.tsx              # Markdown to HTML converter
│   └── Footer.tsx                        # Existing footer component (used by policy pages)
└── styles/
    └── design-system.css                 # Centralized styles (includes policy styles)
```

### Markdown Files
```
public/terms-and-conditions/
├── listing-guidelines.md                 # Property listing guidelines
├── privacy.md                           # Privacy policy
├── terms.md                             # Terms of service
├── cookies.md                           # Cookie policy
└── faq.md                               # Frequently asked questions
```

## Usage

### Adding New Policy Pages

1. **Create Markdown File**
   ```markdown
   # New Policy Title
   
   ## Section 1
   Content here...
   
   ### Subsection
   More content...
   ```

2. **Update Route Mapping**
   ```typescript
   // In src/app/(policy)/[slug]/page.tsx
   const SLUG_TO_FILE: Record<string, string> = {
     // ... existing mappings
     'new-policy': '/terms-and-conditions/new-policy.md',
   };
   ```

3. **Add to Footer Navigation**
   ```typescript
   // In src/components/common/Footer.tsx
   const footerSections: FooterSection[] = [
     {
       title: 'Support',
       links: [
         // ... existing links
         { name: 'New Policy', href: '/new-policy' },
       ]
     }
   ];
   ```

### Updating Existing Content

1. **Edit Markdown File**
   - Modify the `.md` file in `public/terms-and-conditions/`
   - Use proper markdown syntax for hierarchy
   - Save the file

2. **Automatic Updates**
   - Changes appear immediately on the website
   - No code deployment needed
   - HTML hierarchy automatically maintained

### Customizing Styles

1. **Modify Central Styles**
   ```css
   /* In src/styles/design-system.css */
   .policy-container {
     @apply max-w-4xl mx-auto px-4 py-10 text-gray-900;
   }
   ```

2. **Add New Style Classes**
   ```css
   .policy-custom-element {
     @apply text-blue-600 font-semibold;
   }
   ```

3. **Responsive Design**
   ```css
   @media (max-width: 768px) {
     .policy-container {
       @apply px-6 py-8;
     }
   }
   ```

## Markdown Guidelines

### Headings
- `#` → Main title (H1)
- `##` → Section headers (H2)
- `###` → Subsection headers (H3)
- `####` → Minor headers (H4)

### Text Formatting
- `**bold text**` → Strong emphasis
- `*italic text*` → Emphasis
- `- list item` → Unordered lists
- `1. list item` → Ordered lists

### Links and References
- `[link text](url)` → External links
- `**email@example.com**` → Contact information
- `[internal link](/page)` → Internal navigation

## Styling System

### CSS Classes Available

#### Layout
- `.policy-container` - Main page wrapper
- `.policy-content` - Content area wrapper

#### Footer Elements
- **Uses existing Footer component** - No additional footer styles needed
- **Footer navigation** already includes all policy page links
- **Contact information** and social links included
- **Bottom bar** with additional policy links

#### States
- `.policy-loading` - Loading state container
- `.policy-loading-spinner` - Loading animation
- `.policy-loading-text` - Loading message
- `.policy-error` - Error state container

### Responsive Breakpoints
- **Desktop**: Full layout with existing footer design
- **Tablet**: Responsive footer with existing breakpoints
- **Mobile**: Single-column layout with existing mobile footer

## Benefits

### For Developers
- **Centralized code** - Easy to maintain and update
- **Reusable components** - Consistent across all pages
- **Type safety** - Full TypeScript support
- **Performance** - Optimized markdown rendering

### For Content Managers
- **Simple updates** - Just edit markdown files
- **No technical knowledge** required for content changes
- **Version control** - Track all policy changes
- **Quick deployment** - Instant content updates

### For Users
- **Consistent experience** - Same look and feel across all pages
- **Easy navigation** - Footer links to all policies
- **Mobile friendly** - Responsive design for all devices
- **Professional appearance** - Clean, readable typography

## Maintenance

### Regular Tasks
1. **Review content** - Check for outdated information
2. **Update dates** - Keep "last updated" timestamps current
3. **Test responsiveness** - Ensure mobile compatibility
4. **Validate links** - Check footer navigation works

### Performance Monitoring
- **Build times** - Monitor for any build issues
- **Bundle size** - Ensure markdown libraries don't bloat
- **Loading speed** - Check page load performance

## Troubleshooting

### Common Issues

#### Content Not Updating
- Check markdown file syntax
- Verify file path in route mapping
- Clear browser cache

#### Styling Issues
- Ensure CSS classes are properly defined
- Check Tailwind CSS compilation
- Verify responsive breakpoints

#### Footer Problems
- Check footer links in `Footer.tsx` component
- Verify footer styles are properly imported
- Test navigation functionality

### Debug Steps
1. **Check console** for JavaScript errors
2. **Inspect elements** for CSS issues
3. **Verify file paths** and imports
4. **Test on different devices** for responsive issues

## Future Enhancements

### Planned Features
- **Search functionality** across all policy pages
- **Table of contents** generation
- **Print-friendly** versions
- **Multi-language** support
- **Version history** tracking

### Integration Opportunities
- **CMS integration** for non-technical users
- **Analytics tracking** for policy page usage
- **A/B testing** for content optimization
- **User feedback** collection system

## Support

For technical support with the Policy Pages System:
- **Email**: support@dropiti.com
- **Documentation**: This file and inline code comments
- **Code Repository**: Check git history for recent changes
