# Google AdSense — review checklist for Dropiti

This guide summarizes **what Google expects** when you request AdSense review, and **how this repository already supports** (or should extend) those expectations. It is not legal advice; always read the current [AdSense Program policies](https://support.google.com/adsense/answer/48182) and [Google Publisher Policies](https://support.google.com/publisherpolicies/answer/10437842).

---

## 1. What Google is really checking

Reviewers and automated checks look for:

- A **real, navigable site** with enough **original, useful content** (not thin or placeholder pages).
- **Clear ownership** of the domain and a **coherent user experience** (no broken core flows, no deceptive UI).
- **Compliance with policies** (no prohibited content, no invalid clicks encouragement, no copyright abuse).
- For ads and cookies: **transparency** (privacy/cookie disclosure) and, where required, **consent before personalized ads**.

Dropiti is a **real-estate listings and community** product. That category is generally AdSense-eligible if listings and editorial pages are legitimate and policy-compliant.

---

## 2. Must-haves before asking for review

### Site quality and content

| Requirement | Notes for Dropiti |
|-------------|-------------------|
| **Sufficient content** | Public pages should offer real value: home/search, property detail, about, FAQ, policies. User-generated listings count as content, but **policy and “about” style pages** should be substantive, not empty. |
| **Original / valuable** | Avoid duplicate or scraped text across many URLs. Listing descriptions should be authentic. |
| **Working navigation** | Header/footer routes work; no mass 404s on linked pages crawlers use. |
| **No “under construction”** | The URL you submit should look finished on **desktop and mobile**. |

### Legal and transparency pages

| Requirement | In this codebase |
|-------------|------------------|
| **Privacy policy** | Served at `/privacy` from `public/terms-and-conditions/privacy.md` via `src/app/(policy)/[slug]/page.tsx`. |
| **Cookie / tracking disclosure** | `/cookies` from `public/terms-and-conditions/cookies.md`. Privacy also covers **Google AdSense** and opt-out links. |
| **Terms (recommended)** | `/terms` from `public/terms-and-conditions/terms.md`. Strongly expected for a platform with accounts and listings. |
| **Easy to find** | `src/components/common/Footer.tsx` links FAQ, Terms, Privacy, and Cookie Policy under **Support**. |

**Must-have for review:** Ensure these pages are **linked from every important layout** (footer is enough if the footer appears on reviewed pages). Keep markdown **in sync** with actual behavior (e.g. what loads on Accept vs Decline).

### Contact and identity

| Requirement | Notes |
|-------------|--------|
| **About / who you are** | `/about` exists (`src/app/about/page.tsx`). Reviewers often look for a clear operator or brand. |
| **Contact** | AdSense and users expect a way to reach you (email, form, or support link). Confirm **About**, **FAQ**, or footer exposes this if policies reference it. |

### Technical — ads identification and crawling

| Requirement | In this codebase |
|-------------|------------------|
| **Site connected in AdSense** | Use the same **publisher ID** everywhere (`ca-pub-…`). |
| **`ads.txt`** | `public/ads.txt` — served at `https://<your-domain>/ads.txt`. Must use your real `pub-…` ID (matches `layout.tsx` / AdSense). If you change publisher ID, update this file. |
| **AdSense meta tag** | `src/app/layout.tsx` includes `<meta name="google-adsense-account" content="ca-pub-…" />`. **Must match** the account you’re applying with. |
| **Script loading** | `src/components/analytics/CookieConsentAndAnalytics.tsx` loads `adsbygoogle.js` **only after** `localStorage` consent is `accepted`, using `NEXT_PUBLIC_ADSENSE_CLIENT_ID`. **Keep the meta tag’s `ca-pub-` ID aligned** with this env var in production. |
| **Robots / sitemap** | `public/robots.txt` allows crawlers on public paths and references `sitemap.xml`. Do not block the homepage or main content paths from `Googlebot`. |

### Privacy, cookies, and consent (EU / UK / similar)

| Requirement | In this codebase |
|-------------|------------------|
| **Consent before ad cookies (where required)** | The banner implements **Accept / Decline** and documents behavior in `privacy.md`. AdSense script runs **only on Accept** — good alignment with “no advertising cookies until consent” for a simple model. |
| **Decline path** | On Decline, AdSense does not load (no `adsbygoogle.js`). Ensure the **privacy/cookie copy** matches this (e.g. if you say “non-personalized ads” on decline, the implementation must match — today it is **no AdSense load** on decline). |
| **Google EU User Consent Policy** | If you monetize users in the EEA, UK, or Switzerland, Google requires consent for **personalized** ads and for **non-personalized** ads that use storage/cookies where applicable. A single Accept/Decline may be enough for your risk tolerance, but **high-traffic or legal review** may warrant a dedicated CMP or granular choices. |

---

## 3. What this repo already does well for AdSense

1. **Delayed AdSense load** until consent — reduces policy risk vs. loading ads for everyone by default.  
2. **Documented AdSense** in `privacy.md`, `cookies.md`, and `faq.md` with links to Google policies and Ad Settings.  
3. **Policy routes** centralized in `(policy)/[slug]/page.tsx` with markdown sources under `public/terms-and-conditions/`.  
4. **SEO-friendly defaults** in `layout.tsx` (metadata, robots, canonical base via `NEXT_PUBLIC_SITE_URL`).  
5. **Listing guidelines** at `/listing-guidelines` — helps show you moderate UGC, which supports “safe content” expectations.

---

## 4. Pre-submit checklist (actionable)

Use this right before you click **Request review** in AdSense:

- [ ] Production domain matches the site URL in AdSense (including `https` and `www` vs apex — be consistent with `NEXT_PUBLIC_SITE_URL`).  
- [ ] **`/ads.txt`** returns 200 on production (file: `public/ads.txt`) and validates in AdSense / Search Console.  
- [ ] **`google-adsense-account` meta** and **`NEXT_PUBLIC_ADSENSE_CLIENT_ID`** use the **same** `ca-pub-` ID.  
- [ ] Open `/privacy`, `/cookies`, `/terms` on production — no load errors, content current.  
- [ ] Footer visible on main templates with policy links.  
- [ ] **About** and **FAQ** read as complete; contact path is obvious.  
- [ ] No placeholder Lorem ipsum, fake listings, or policy-violating copy on sample pages.  
- [ ] Mobile: cookie banner usable; core pages scroll and render (map/search pages included).  
- [ ] You are not incentivizing clicks, placing ads in a way that causes accidental clicks, or blending ads with listings without labeling (follow placement rules when you add ad units).

---

## 5. Common rejection themes to avoid

- **Thin content** — only auth walls and empty states on the open web.  
- **Navigation / policy 404s** — broken legal URLs.  
- **Mismatch** — privacy says one thing; implementation does another.  
- **Copyright** — images or text you do not have rights to use.  
- **Prohibited categories** — illegal services, dangerous products, etc. (not typical for Dropiti if listings are legitimate housing).  
- **Unsupported regions** or **duplicate applications** — one AdSense account per publisher; site must be in a [supported country/region](https://support.google.com/adsense/answer/9727).  

---

## 6. After approval

- Add **ad units** in AdSense and place them in layout components **without** breaking core UX (e.g. avoid covering the mobile bottom nav or primary CTAs).  
- Monitor **Policy center** and **Ad experience** reports.  
- Re-check **privacy/cookies** text whenever you add new trackers or change consent logic.

---

## 7. File reference (quick map)

| Topic | Location |
|--------|-----------|
| Consent + conditional GA4 / AdSense | `src/components/analytics/CookieConsentAndAnalytics.tsx` |
| AdSense account meta tag | `src/app/layout.tsx` (`<head>`) |
| Policy slugs → markdown files | `src/app/(policy)/[slug]/page.tsx` |
| Privacy / cookies / terms / FAQ source | `public/terms-and-conditions/*.md` |
| Footer policy links | `src/components/common/Footer.tsx` |
| Crawling | `public/robots.txt`, `public/sitemap.xml` |
| AdSense seller declaration | `public/ads.txt` |

---

*Last updated to reflect the Dropiti codebase layout and AdSense-related implementation patterns.*
