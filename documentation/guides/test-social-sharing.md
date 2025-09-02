# Social Sharing Test Guide

## Testing Meta Tags and Social Sharing

### 1. **Homepage Meta Tags**
- **URL**: `https://your-domain.com/`
- **Expected Title**: "dropiti - real estate platform"
- **Expected Description**: "Find your perfect home with dropiti - the leading real estate platform for property rentals and sales..."
- **Expected Image**: `/images/dropiti_logo.png`

### 2. **Search Page Meta Tags**
- **URL**: `https://your-domain.com/search`
- **Expected Title**: "Search Properties - dropiti"
- **Expected Description**: "Search and discover amazing properties for rent on dropiti..."

### 3. **Property Page Meta Tags**
- **URL**: `https://your-domain.com/property/[property-id]`
- **Expected Title**: "[Property Title] - dropiti"
- **Expected Description**: Property description or auto-generated description
- **Expected Image**: Property's main image or fallback to dropiti logo

## Testing Tools

### 1. **Facebook Sharing Debugger**
- URL: https://developers.facebook.com/tools/debug/
- Enter your URL to test Facebook sharing
- Shows how your page will appear when shared on Facebook

### 2. **Twitter Card Validator**
- URL: https://cards-dev.twitter.com/validator
- Enter your URL to test Twitter sharing
- Shows how your page will appear when shared on Twitter

### 3. **LinkedIn Post Inspector**
- URL: https://www.linkedin.com/post-inspector/
- Enter your URL to test LinkedIn sharing

### 4. **Open Graph Preview**
- URL: https://www.opengraph.xyz/
- Enter your URL to see how it will appear across social platforms

## Environment Variables Needed

Make sure you have these environment variables set:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
GOOGLE_VERIFICATION_ID=your-google-verification-id
```

## What to Test

1. **Homepage Sharing**: Share the main homepage URL
2. **Property Page Sharing**: Share a specific property URL
3. **Search Page Sharing**: Share the search page URL
4. **Image Display**: Verify that property images show up correctly
5. **Fallback Images**: Test that the dropiti logo shows when no property image is available

## Expected Results

- ✅ Title shows "dropiti - real estate platform" or property-specific titles
- ✅ Descriptions are relevant and engaging
- ✅ Images display correctly (property images for property pages, logo for other pages)
- ✅ Social platforms recognize the meta tags
- ✅ No errors in the sharing debuggers

## Troubleshooting

If images don't show:
1. Check that the image URLs are absolute (include domain)
2. Verify images are accessible publicly
3. Ensure images meet platform requirements (Facebook: 1200x630px recommended)

If titles/descriptions don't show:
1. Check that the metadata is being generated correctly
2. Verify the page is server-side rendered
3. Test with the social platform debuggers
