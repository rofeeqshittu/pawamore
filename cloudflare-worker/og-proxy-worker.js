/**
 * Cloudflare Worker: OG Image Proxy for PawaMore
 * 
 * This worker detects social media crawlers and serves them product-specific
 * Open Graph meta tags. Human visitors are redirected to the clean app URL.
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Go to https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Paste this entire code
 * 3. Add environment variables in Settings → Variables:
 *    - SUPABASE_URL: Your Supabase project URL (e.g., https://xxx.supabase.co)
 *    - SUPABASE_ANON_KEY: Your Supabase anon key
 *    - APP_URL: https://pawamore.lovable.app (or your custom domain)
 * 4. Deploy the worker
 * 5. Set up a custom domain for this worker (e.g., share.pawamore.com)
 *    - In Workers → your worker → Settings → Triggers → Custom Domains
 * 
 * USAGE:
 * Share links will be: https://share.pawamore.com/products/product-slug
 * - Crawlers see OG tags with product image, name, price
 * - Humans get instant 302 redirect to https://pawamore.lovable.app/products/product-slug
 */

// User-Agent patterns for social media crawlers
const CRAWLER_PATTERNS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'Slackbot',
  'TelegramBot',
  'Discord',
  'Pinterest',
  'Googlebot',
  'bingbot',
  'Applebot',
  'ia_archiver',
  'Embedly',
  'Quora Link Preview',
  'Outbrain',
  'W3C_Validator',
  'redditbot',
  'Tumblr',
  'Viber',
  'SkypeUriPreview',
  'Iframely',
  'bitlybot',
  'developers.google.com/+/web/snippet',
  'Google-PageRenderer',
];

function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_PATTERNS.some(pattern => ua.includes(pattern.toLowerCase()));
}

async function fetchProductFromSupabase(slug, env) {
  const url = `${env.SUPABASE_URL}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}&status=eq.active&select=id,name,slug,short_description,description,price,discount_price,stock_quantity,product_images(image_url,is_primary)`;
  
  const response = await fetch(url, {
    headers: {
      'apikey': env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Supabase fetch failed:', response.status);
    return null;
  }

  const products = await response.json();
  return products?.[0] || null;
}

function generateOGHtml(product, canonicalUrl, appUrl) {
  const primaryImage = product.product_images?.find(i => i.is_primary)?.image_url 
    || product.product_images?.[0]?.image_url 
    || `${appUrl}/placeholder-logo.png`;
  
  const price = product.discount_price || product.price;
  const formattedPrice = `₦${Number(price).toLocaleString('en-NG')}`;
  
  const description = product.short_description || product.description || 'Quality solar and battery solutions at PawaMore Systems Nigeria';
  const availability = product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock';
  
  const title = `${product.name} - ${formattedPrice} | PawaMore`;
  const fullDescription = `${description} | ${formattedPrice} | ${availability}. Free delivery in Lagos.`;
  
  // Redirect URL for human visitors
  const productUrl = `${appUrl}/products/${encodeURIComponent(product.slug)}`;

  return `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns# product: https://ogp.me/ns/product#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${escapeHtml(title)}</title>
  <meta name="title" content="${escapeHtml(title)}">
  <meta name="description" content="${escapeHtml(fullDescription)}">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${escapeHtml(productUrl)}">
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="product">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(fullDescription)}">
  <meta property="og:image" content="${escapeHtml(primaryImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(product.name)}">
  <meta property="og:site_name" content="PawaMore Systems">
  <meta property="og:locale" content="en_NG">
  
  <!-- Product-specific OG tags -->
  <meta property="product:price:amount" content="${price}">
  <meta property="product:price:currency" content="NGN">
  <meta property="product:availability" content="${availability.toLowerCase().replace(' ', '_')}">
  <meta property="product:brand" content="PawaMore">
  <meta property="product:retailer_item_id" content="${product.id}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeHtml(canonicalUrl)}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(fullDescription)}">
  <meta name="twitter:image" content="${escapeHtml(primaryImage)}">
  
  <!-- Redirect human visitors instantly -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(productUrl)}">
  
  <!-- JSON-LD Schema for rich snippets -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "${escapeJson(product.name)}",
    "image": "${escapeJson(primaryImage)}",
    "description": "${escapeJson(description)}",
    "brand": {
      "@type": "Brand",
      "name": "PawaMore"
    },
    "offers": {
      "@type": "Offer",
      "url": "${escapeJson(productUrl)}",
      "priceCurrency": "NGN",
      "price": ${price},
      "availability": "${product.stock_quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'}",
      "seller": {
        "@type": "Organization",
        "name": "PawaMore Systems"
      }
    }
  }
  </script>
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .loading {
      text-align: center;
      color: #666;
    }
    .loading::after {
      content: '';
      display: block;
      width: 40px;
      height: 40px;
      margin: 20px auto;
      border: 3px solid #f59e0b;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loading">
    <p>Redirecting to PawaMore...</p>
  </div>
  <script>
    // Fallback redirect for browsers that don't honor meta refresh
    window.location.href = "${escapeHtml(productUrl)}";
  </script>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeJson(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function generate404Html(appUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product Not Found | PawaMore</title>
  <meta http-equiv="refresh" content="0;url=${appUrl}/products">
</head>
<body>
  <p>Product not found. Redirecting to products page...</p>
  <script>window.location.href = "${appUrl}/products";</script>
</body>
</html>`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('User-Agent') || '';
    
    // Default app URL (can be overridden by env var)
    const appUrl = env.APP_URL || 'https://pawamore.lovable.app';
    
    // Parse the path - expecting /products/slug or /p/slug
    const pathMatch = url.pathname.match(/^\/(products?|p)\/([^\/]+)\/?$/);
    
    if (!pathMatch) {
      // Not a product URL - redirect to main app
      return Response.redirect(`${appUrl}${url.pathname}`, 302);
    }
    
    const slug = decodeURIComponent(pathMatch[2]);
    const productAppUrl = `${appUrl}/products/${encodeURIComponent(slug)}`;
    
    // If NOT a crawler, redirect immediately to the clean app URL
    if (!isCrawler(userAgent)) {
      return Response.redirect(productAppUrl, 302);
    }
    
    // For crawlers: fetch product data and return OG-rich HTML
    try {
      const product = await fetchProductFromSupabase(slug, env);
      
      if (!product) {
        return new Response(generate404Html(appUrl), {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
      
      const html = generateOGHtml(product, url.href, appUrl);
      
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          'X-Robots-Tag': 'noindex, nofollow', // Don't index the proxy URL
        },
      });
    } catch (error) {
      console.error('Worker error:', error);
      // On error, redirect to the app
      return Response.redirect(productAppUrl, 302);
    }
  },
};
