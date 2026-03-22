# AI Product Scraper - Implementation Plan

## 🎯 Overview
Enable admins to add products by simply pasting a product URL from manufacturer/partner websites. AI will automatically extract, rewrite, and populate all product data.

---

## 📋 Features

### **1. URL Input Interface**
- Admin dashboard has "Import from URL" button
- Modal with URL input field
- Validation (must be valid URL)
- Loading states with progress indicators

### **2. AI Product Scraping**
Extracts from product page:
- ✅ Product name
- ✅ Price (handles multiple currencies)
- ✅ Product images (all available)
- ✅ Product description (short & long)
- ✅ Technical specifications
- ✅ Features list
- ✅ Brand/manufacturer
- ✅ Product category
- ✅ Model number/SKU
- ✅ Dimensions, weight
- ✅ Warranty information

### **3. AI Content Rewriting**
Uses AI to:
- **Rewrite descriptions** in PawaMore brand voice
- **Localize for Nigeria** (NGN pricing, local context)
- **Optimize for SEO** (keywords, meta descriptions)
- **Add benefits** (how it solves Nigerian power issues)
- **Generate compelling copy** (emotional, persuasive)
- **Extract key specs** into structured format

### **4. Image Processing**
- Downloads all product images
- Uploads to Supabase Storage
- Sets primary image (first one or best quality)
- Generates thumbnails
- Compresses for web optimization

### **5. Data Validation & Preview**
- Shows scraped data in preview modal
- Admin can edit any field before saving
- Auto-categorizes product
- Suggests tags/keywords
- Validates required fields

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                          │
│  [Import from URL] button → Modal with URL input            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTION                         │
│  Function: scrape-product-from-url                          │
│  • Receives URL                                             │
│  • Uses Browserless/Puppeteer for scraping                  │
│  • Extracts product data with selectors                     │
│  • Calls AI for content rewriting                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    AI PROCESSING                            │
│  OpenAI/Anthropic API                                       │
│  • Rewrites product description                             │
│  • Localizes for Nigerian market                            │
│  • Optimizes for SEO                                        │
│  • Generates compelling copy                                │
│  • Extracts structured specs                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                 IMAGE PROCESSING                            │
│  • Downloads images from source URLs                        │
│  • Uploads to Supabase Storage (product-images bucket)      │
│  • Generates thumbnails                                     │
│  • Returns Supabase URLs                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              PREVIEW & CONFIRMATION                         │
│  • Shows scraped & AI-processed data                        │
│  • Admin can edit any field                                 │
│  • "Import Product" saves to database                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technical Stack

### **Backend (Supabase Edge Function)**
- **Runtime**: Deno
- **Scraping**: Cheerio (HTML parsing)
- **AI**: OpenAI GPT-4 or Anthropic Claude
- **Image Processing**: Deno fetch + Supabase Storage

### **Frontend (React)**
- **UI**: shadcn/ui components
- **State**: React hooks
- **Validation**: Zod schemas

---

## 📝 Implementation Steps

### **Phase 1: Edge Function Setup** (30 min)
1. Create `scrape-product-from-url` edge function
2. Install dependencies (cheerio, openai)
3. Implement URL scraping logic
4. Test with sample URLs

### **Phase 2: AI Integration** (30 min)
1. Set up OpenAI API
2. Create prompt for product rewriting
3. Test content generation
4. Validate output quality

### **Phase 3: Image Processing** (20 min)
1. Download images from URLs
2. Upload to Supabase Storage
3. Generate thumbnails
4. Return storage URLs

### **Phase 4: Frontend UI** (40 min)
1. Add "Import from URL" button to admin
2. Create import modal
3. Show loading states
4. Display preview
5. Handle errors

### **Phase 5: Testing & Polish** (20 min)
1. Test with various URLs
2. Handle edge cases
3. Add error messages
4. Optimize performance

**Total Time: ~2.5 hours**

---

## 🎨 UI/UX Flow

### **Step 1: Import Button**
```
Admin Dashboard → Products Tab
┌──────────────────────────────────────┐
│  Products                            │
│  ┌────────────┐  ┌────────────────┐ │
│  │ + Add New  │  │ 🔗 Import URL  │ │
│  └────────────┘  └────────────────┘ │
└──────────────────────────────────────┘
```

### **Step 2: URL Input Modal**
```
┌─────────────────────────────────────────┐
│  Import Product from URL                │
├─────────────────────────────────────────┤
│  Paste product URL from:                │
│  • Manufacturer website                 │
│  • Partner brand site                   │
│  • E-commerce listing                   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ https://example.com/product/... │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Cancel]  [Import Product →]          │
└─────────────────────────────────────────┘
```

### **Step 3: Processing**
```
┌─────────────────────────────────────────┐
│  Importing Product...                   │
├─────────────────────────────────────────┤
│  ⏳ Fetching product page...            │
│  ✅ Extracting product data...          │
│  ⏳ AI rewriting description...         │
│  ⏳ Processing images...                │
│  ⏳ Uploading to storage...             │
│                                         │
│  [████████░░░░░░] 60%                   │
└─────────────────────────────────────────┘
```

### **Step 4: Preview & Edit**
```
┌─────────────────────────────────────────────────────────────┐
│  Review Imported Product                                    │
├─────────────────────────────────────────────────────────────┤
│  [Product Image]                                            │
│                                                             │
│  Name: iTel 500W Solar Generator                           │
│  [Edit]                                                     │
│                                                             │
│  Price: ₦304,000 (converted from $380)                     │
│  [Edit]                                                     │
│                                                             │
│  Category: Battery Systems                                  │
│  Brand: iTel Energy                                         │
│                                                             │
│  Description:                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Say goodbye to fuel costs and generator noise!      │   │
│  │ The iTel 500W Solar Generator brings clean,         │   │
│  │ silent power to your Nigerian home...               │   │
│  └─────────────────────────────────────────────────────┘   │
│  [Edit Description]                                         │
│                                                             │
│  Specifications:                                            │
│  • Capacity: 1000Wh LiFePO4 Battery                        │
│  • Output: 500W Pure Sine Wave                             │
│  • Solar Input: 200W Max                                   │
│  ...                                                        │
│                                                             │
│  [Cancel]  [Save & Publish]  [Save as Draft]               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Prompt Template

```
You are a product copywriter for PawaMore Systems, Nigeria's leading solar and battery solutions provider. 

TASK: Rewrite this product information for our Nigerian e-commerce platform.

ORIGINAL PRODUCT DATA:
Name: {name}
Price: {price}
Description: {description}
Specifications: {specs}

GUIDELINES:
1. Use Nigerian English and context
2. Emphasize how it solves Nigeria's power issues
3. Convert prices to Naira (NGN)
4. Make it emotional and persuasive
5. Focus on benefits, not just features
6. Use active voice and power words
7. Keep tone professional but approachable
8. Include social proof if possible
9. Optimize for SEO (Nigerian keywords)

OUTPUT FORMAT (JSON):
{
  "name": "Compelling product name",
  "short_description": "One punchy sentence (max 160 chars)",
  "description": "Full rewritten description (2-3 paragraphs)",
  "key_features": ["Feature 1", "Feature 2", ...],
  "benefits": ["Benefit 1", "Benefit 2", ...],
  "meta_description": "SEO-optimized meta description",
  "seo_keywords": ["keyword1", "keyword2", ...],
  "nigerian_context": "Why this matters for Nigerians"
}

BRAND VOICE:
- Empowering, confident, trustworthy
- Speaks directly to power frustrations
- Solutions-focused, not problem-dwelling
- Uses "you" and "your"
- Friendly but professional

Example good copy:
"Tired of ₦50,000 monthly fuel bills? This 1000Wh battery system powers your essentials all night—fridge, TV, fans, lights—while you sleep soundly. No noise. No fumes. Just clean, reliable power."

Now rewrite the product:
```

---

## 💾 Database Schema Addition

Add new table for import logs:

```sql
CREATE TABLE product_import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  imported_by UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  status TEXT CHECK (status IN ('pending', 'success', 'failed')),
  original_data JSONB,
  processed_data JSONB,
  ai_response JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔒 Security & Validation

### **URL Validation**
- Must be HTTPS
- Domain whitelist (optional)
- Rate limiting (max 10 imports/hour)
- Timeout after 30 seconds

### **Content Validation**
- Required fields check
- Price format validation
- Image URL validation
- XSS sanitization

### **AI Safety**
- Content moderation
- Prompt injection prevention
- Output validation
- Fallback to original if AI fails

---

## 📊 Supported Websites

### **Priority Tier 1** (Easy to scrape)
- ✅ EcoFlow official site
- ✅ iTel Energy
- ✅ Felicity Solar
- ✅ Jackery
- ✅ Bluetti

### **Priority Tier 2** (Medium difficulty)
- ⚠️ Amazon product pages
- ⚠️ AliExpress
- ⚠️ Jumia Nigeria

### **Custom Selectors Database**
Store CSS selectors per website for accurate scraping:

```typescript
const siteSelectors = {
  'ecoflow.com': {
    name: '.product-title h1',
    price: '.price-value',
    images: '.product-gallery img',
    description: '.product-description',
    specs: '.specifications table tr'
  },
  'itelenergy.com': {
    // ... custom selectors
  }
};
```

---

## 🚀 Future Enhancements

1. **Bulk Import** - Import multiple products from CSV/Excel
2. **Auto-sync** - Periodically check for price updates
3. **Competitor Analysis** - Compare prices across sites
4. **Image AI** - Generate marketing images with product
5. **Review Scraping** - Import customer reviews
6. **Video Processing** - Extract product demo videos
7. **Translation** - Auto-translate to other Nigerian languages

---

## 📈 Success Metrics

- **Import Success Rate**: >85%
- **AI Quality Score**: >90% (admin satisfaction)
- **Time Saved**: 20 min → 2 min per product (90% reduction)
- **Data Accuracy**: >95%
- **Admin Adoption**: >80% of new products via import

---

## 🎯 Example Use Case

**Before** (Manual):
1. Admin opens manufacturer site
2. Copies product name
3. Copies price, converts to Naira
4. Downloads images one by one
5. Uploads to Supabase
6. Copies description
7. Rewrites for brand voice
8. Copies specs
9. Formats everything
10. Creates product in admin panel
**Time: 20-30 minutes per product**

**After** (AI Import):
1. Admin clicks "Import from URL"
2. Pastes product URL
3. Waits 30 seconds
4. Reviews AI-generated content
5. Clicks "Save & Publish"
**Time: 2-3 minutes per product**

**Impact**: **90% time reduction, 10x faster catalog growth!**

---

## ✅ Next Steps

Should I implement this now? It will take approximately 2.5 hours and includes:
1. ✅ Supabase Edge Function (scraping + AI)
2. ✅ Admin UI component
3. ✅ Image processing
4. ✅ Preview modal
5. ✅ Error handling
6. ✅ Testing with sample URLs

✅ **Implementation is complete.** See status table below.

---

**Built with 🤖 AI for PawaMore Systems** 🇳🇬⚡
---

## ✅ Implementation Status

Both scraper paths are now fully implemented:

| Component | Status |
|---|---|
| `scrape-product-from-url` Edge Function | ✅ Done |
| `scrape-product` Edge Function (Gemini AI) | ✅ Done |
| `product_import_logs` migration | ✅ Done |
| `scraper_runs` migration | ✅ Done |
| `ProductImportModal` admin UI | ✅ Done |
| `ScraperManager` admin UI (Scraper tab) | ✅ Done |
| AdminDashboard wired for both | ✅ Done |
| Scraper utility helpers + 15 unit tests | ✅ Done |

---

**Built with 🤖 AI for PawaMore Systems** 🇳🇬⚡

