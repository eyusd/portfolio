# SEO Configuration Guide

This file contains all the places where you need to update your personal information for SEO.

## 🔧 Required Updates

### 1. **Base URL** (3 locations)
Replace `https://yourwebsite.com` with your actual domain:

- `src/app/robots.ts` - Line 8
- `src/app/sitemap.ts` - Line 4
- `src/lib/structured-data.ts` - Line 2

### 2. **Personal Information** (5 locations)

#### `src/app/layout.tsx`
- Line 7: `'Portfolio | Your Name'` → Your actual name
- Line 8: `'%s | Your Name'` → Your actual name
- Line 13: `{ name: 'Your Name', url: ... }` → Your name
- Line 14-15: `creator` and `publisher` → Your name
- Line 24: `'Portfolio | Your Name'` → Your name
- Line 26: `'Your Name Portfolio'` → Your name
- Line 36: `'Portfolio | Your Name'` → Your name
- Line 38: `'@yourhandle'` → Your Twitter/X handle

#### `src/lib/structured-data.ts`
- Line 6: `name: 'Your Name'` → Your name
- Line 9-12: Update social media links (GitHub, LinkedIn, Twitter)
- Line 14: `jobTitle: 'Software Engineer'` → Your job title
- Line 16: `name: 'Your Company'` → Current company (optional)
- Line 23: `name: 'Your Name Portfolio'` → Your site name
- Line 28: `name: 'Your Name'` → Your name

#### `src/app/opengraph-image.tsx`
- Line 4: `'Your Name Portfolio'` → Your name
- Line 25: `<div>Your Name</div>` → Your name
- Line 26: `<div>Software Engineer</div>` → Your title/tagline

#### `src/app/[locale]/lab/[slug]/page.tsx`
- Line 29: `authors: ['Your Name']` → Your name

### 3. **Open Graph Image**
The file `src/app/opengraph-image.tsx` generates a dynamic OG image. You can:
- Customize colors (Line 19: gradient colors)
- Update text size and layout
- Or replace with a static image by creating `src/app/opengraph-image.png` (1200x630px)

### 4. **Articles in Sitemap**
In `src/app/sitemap.ts` (Line 34), add your article slugs:
```typescript
const articles = ['make-10-solutions', 'your-second-article', 'third-article'];
```

## ✅ Verification Checklist

After updating:
1. [ ] Run `pnpm build` to check for errors
2. [ ] Visit `/sitemap.xml` to verify all URLs
3. [ ] Visit `/robots.txt` to verify configuration
4. [ ] Check OpenGraph preview with [OpenGraph.xyz](https://www.opengraph.xyz/)
5. [ ] Test with [Rich Results Test](https://search.google.com/test/rich-results)

## 🎨 Optional Enhancements

### Add More Social Links
In `src/lib/structured-data.ts`, add to `sameAs` array:
```typescript
sameAs: [
  'https://github.com/yourusername',
  'https://linkedin.com/in/yourusername',
  'https://twitter.com/yourhandle',
  'https://instagram.com/yourhandle',
  'https://youtube.com/@yourhandle',
],
```

### Custom OG Image per Article
Create `src/app/[locale]/lab/[slug]/opengraph-image.tsx` for article-specific images.

## 📊 SEO Score Impact

These changes will improve:
- ✅ **Sitemap Coverage**: All pages indexed
- ✅ **robots.txt**: Proper crawler instructions
- ✅ **Structured Data**: Google Knowledge Graph eligibility
- ✅ **Open Graph**: Better social media sharing
- ✅ **Hreflang Tags**: International SEO
- ✅ **Canonical URLs**: Duplicate content prevention
- ✅ **Meta Descriptions**: Click-through rate improvement

Expected improvements:
- **Google PageSpeed**: No change (already optimized)
- **SEO Score**: 85+ → 95+
- **Social Preview**: ⚠️ Missing → ✅ Perfect
- **Schema Validation**: 0 → 2 valid schemas
