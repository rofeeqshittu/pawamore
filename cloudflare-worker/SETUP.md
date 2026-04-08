# Cloudflare Worker OG Proxy Setup

This guide will help you set up a custom domain (e.g., `share.pawamore.com`) that serves rich social previews while keeping your URLs clean.

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│  Share URL: https://share.pawamore.com/products/itel-solar-gen     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  WhatsApp/Facebook/Twitter Crawler ──▶ Returns OG HTML with:       │
│    • Product image                                                  │
│    • Product name                                                   │
│    • Price: ₦45,000                                                 │
│    • Rich preview card                                              │
│                                                                     │
│  Human Click ──▶ 302 Redirect to:                                  │
│    https://pawamore.lovable.app/products/itel-solar-gen            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Step 1: Create Cloudflare Account

1. Go to [cloudflare.com](https://cloudflare.com) and sign up (free tier works)
2. You don't need to add your domain to Cloudflare DNS

## Step 2: Create the Worker

1. Go to **Workers & Pages** in the left sidebar
2. Click **Create Worker**
3. Give it a name: `pawamore-og-proxy`
4. Click **Deploy** (creates empty worker)
5. Click **Edit Code**
6. Delete all existing code
7. Paste the entire contents of `og-proxy-worker.js`
8. Click **Deploy**

## Step 3: Add Environment Variables

1. Go to your worker → **Settings** → **Variables**
2. Add these **Environment Variables**:

| Variable Name | Value |
|--------------|-------|
| `SUPABASE_URL` | `https://caxlowsbpzjuegdwdqsi.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase anon key (from Supabase dashboard) |
| `APP_URL` | `https://pawamore.lovable.app` |

3. Click **Save**

## Step 4: Set Up Custom Domain

### Option A: Use a Subdomain (Recommended)

1. Go to your worker → **Settings** → **Triggers**
2. Click **Add Custom Domain**
3. Enter: `share.pawamore.com` (or `s.pawamore.com` for shorter)
4. Cloudflare will guide you to add a CNAME record to your DNS

**DNS Record to Add:**
```
Type: CNAME
Name: share (or s)
Target: pawamore-og-proxy.<your-account>.workers.dev
```

### Option B: Use Workers.dev Subdomain (No DNS needed)

Your worker is already available at:
```
https://pawamore-og-proxy.<your-account>.workers.dev
```

You can use this URL directly, just not as clean.

## Step 5: Update Your App

After setting up the custom domain, update the share URL in your app:

### ProductCard.tsx
```tsx
// Change from:
const shareUrl = `${supabaseUrl}/functions/v1/og-image-proxy?slug=${encodeURIComponent(product.slug)}`;

// Change to:
const shareUrl = `https://share.pawamore.com/products/${encodeURIComponent(product.slug)}`;
```

### ProductDetail.tsx
```tsx
// Change from:
const shareUrl = product?.slug 
  ? `${supabaseUrl}/functions/v1/og-image-proxy?slug=${encodeURIComponent(product.slug)}`
  : productUrl;

// Change to:
const shareUrl = product?.slug 
  ? `https://share.pawamore.com/products/${encodeURIComponent(product.slug)}`
  : productUrl;
```

## Testing

### Test with curl (simulating WhatsApp):
```bash
curl -A "WhatsApp/2.0" "https://share.pawamore.com/products/itel-solar-gen"
```
Should return HTML with OG tags.

### Test as human:
```bash
curl -I "https://share.pawamore.com/products/itel-solar-gen"
```
Should return `302 Found` with `Location: https://pawamore.lovable.app/products/itel-solar-gen`

### Test in WhatsApp:
1. Send the share URL to yourself
2. Should show rich preview with product image, name, price
3. Click the link → opens clean pawamore.lovable.app URL

## Troubleshooting

### Preview not showing?
- WhatsApp caches previews aggressively. Add `?v=2` to the URL to bust cache
- Wait 24-48 hours for WhatsApp cache to expire

### Wrong image showing?
- Check the product has images in Supabase
- Verify `is_primary` is set on one image

### Worker error?
- Check **Logs** in your worker dashboard
- Verify environment variables are set correctly

## Cost

Cloudflare Workers free tier includes:
- 100,000 requests/day
- More than enough for social sharing

## Alternative: Use workers.dev Directly

If you don't want to set up a custom domain, you can update the app to use the workers.dev URL:

```tsx
const shareUrl = `https://pawamore-og-proxy.<your-account>.workers.dev/products/${product.slug}`;
```

Not as clean, but works immediately without DNS setup.
