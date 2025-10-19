# SEO Environment Variables Setup

Add these environment variables to your `.env.local` file:

```bash
# SEO Configuration
NEXT_PUBLIC_SITE_URL=https://dropiti.com
BING_VERIFICATION_ID=your_bing_verification_id_here
BING_VERIFICATION_CODE=your_bing_verification_code_here
GOOGLE_VERIFICATION_ID=your_google_verification_id_here

# Analytics (Optional)
BING_CLARITY_PROJECT_ID=your_bing_clarity_project_id_here
GOOGLE_ANALYTICS_ID=your_google_analytics_id_here
```

## How to Get Verification Codes:

### Bing Webmaster Tools:
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site
3. Choose "HTML meta tag" verification method
4. Copy the content value from the meta tag
5. Add it to `BING_VERIFICATION_ID`

### Google Search Console:
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property
3. Choose "HTML tag" verification method
4. Copy the content value from the meta tag
5. Add it to `GOOGLE_VERIFICATION_ID`

### Bing Clarity (Optional):
1. Go to [Microsoft Clarity](https://clarity.microsoft.com/)
2. Create a new project
3. Copy the project ID
4. Add it to `BING_CLARITY_PROJECT_ID`
