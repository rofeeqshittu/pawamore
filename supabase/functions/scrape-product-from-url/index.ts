import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ProductData {
  name: string;
  price: number;
  currency: string;
  images: string[];
  description: string;
  specifications: Record<string, string>;
  brand?: string;
  model?: string;
}

interface AIRewrittenData {
  name: string;
  short_description: string;
  description: string;
  key_features: string[];
  benefits: string[];
  meta_description: string;
  seo_keywords: string[];
  nigerian_context: string;
  suggested_category: string;
  price_ngn: number;
}

const siteSelectors: Record<string, {
  name: string[];
  price: string[];
  images: string[];
  description: string[];
  specs: string[];
  brand?: string[];
}> = {
  'ecoflow.com': {
    name: ['.product-title', 'h1[class*="product"]', '.product-name'],
    price: ['.price', '[class*="price-value"]', '[data-price]'],
    images: ['.product-gallery img', '.product-image img', '[class*="product-img"]'],
    description: ['.product-description', '[class*="description"]', '.product-details'],
    specs: ['.specifications', '.specs', '[class*="specification"]'],
    brand: ['.brand', '[data-brand]'],
  },
  'default': {
    name: ['h1', '[class*="product-title"]', '[class*="product-name"]', '[itemprop="name"]'],
    price: ['[class*="price"]', '[itemprop="price"]', '[data-price]'],
    images: ['[class*="product"] img', '[class*="gallery"] img', 'img[alt*="product"]'],
    description: ['[class*="description"]', '[itemprop="description"]', '.product-info'],
    specs: ['[class*="spec"]', 'table', '.product-details'],
    brand: ['[class*="brand"]', '[itemprop="brand"]'],
  }
};

function compactHtml(raw: string): string {
  let text = raw;
  // Remove scripts and styles
  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script[^>]*>/gi, '');
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style[^>]*>/gi, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/\s{2,}/g, ' ');
  return text.slice(0, 45000);
}

async function scrapeProductPage(url: string): Promise<ProductData> {
  console.log('Fetching product page:', url);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch (${response.status}): ${response.statusText}`);
  }

  const html = await response.text();
  const domain = new URL(url).hostname.replace('www.', '');
  const selectors = siteSelectors[domain] || siteSelectors['default'];

  const extractText = (keywords: string[], html: string): string => {
    for (const selector of keywords) {
      const regex = new RegExp(`<[^>]*class=["'][^"']*${selector}[^"']*["'][^>]*>([^<]+)<`, 'i');
      const match = html.match(regex);
      if (match?.[1]?.trim()) return match[1].trim();
    }
    for (const keyword of keywords) {
      const regex = new RegExp(`<[^>]*${keyword}[^>]*>([^<]+)<`, 'i');
      const match = html.match(regex);
      if (match?.[1]?.trim()) return match[1].trim();
    }
    return '';
  };

  const extractImages = (): string[] => {
    const images: string[] = [];
    const baseUrl = new URL(url).origin;
    const imgRegex = /<img[^>]*(?:src|data-src|srcset)=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      let imgUrl = match[1].split(',')[0].split(' ')[0];
      if (imgUrl.includes('icon') || imgUrl.includes('logo') ||
          imgUrl.includes('thumb') || imgUrl.includes('avatar') ||
          imgUrl.includes('ui/') || imgUrl.includes('button')) continue;
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
      else if (imgUrl.startsWith('/')) imgUrl = baseUrl + imgUrl;
      else if (!imgUrl.startsWith('http')) continue;
      images.push(imgUrl);
    }
    return [...new Set(images)].slice(0, 5);
  };

  const extractPrice = (): number => {
    const patterns = [
      /[\$₦£€]\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*[\$₦£€]/,
      /"price[^"]*"[^>]*>[\s\S]*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
      /data-price=["'](\d+(?:\.\d{2})?)/i,
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price > 0) return price;
      }
    }
    return 0;
  };

  const detectCurrency = (): string => {
    if (html.includes('₦') || html.includes('NGN') || html.includes('Naira')) return 'NGN';
    if (html.includes('$') || html.includes('USD')) return 'USD';
    if (html.includes('£') || html.includes('GBP')) return 'GBP';
    if (html.includes('€') || html.includes('EUR')) return 'EUR';
    return 'USD';
  };

  return {
    name: extractText(selectors.name, html) || 'Unnamed Product',
    price: extractPrice(),
    currency: detectCurrency(),
    images: extractImages(),
    description: extractText(selectors.description, html) || '',
    specifications: {},
    brand: extractText(selectors.brand || [], html) || undefined,
    model: extractText(['model', 'sku', 'model-number'], html) || undefined,
  };
}

// AI rewriting using Lovable AI Gateway
async function rewriteWithAI(productData: ProductData, lovableApiKey: string): Promise<AIRewrittenData> {
  console.log('Rewriting content with Lovable AI...');

  const prompt = `You are a product copywriter for PawaMore Systems, Nigeria's leading solar and battery solutions provider.

TASK: Rewrite this product information for our Nigerian e-commerce platform.

ORIGINAL PRODUCT DATA:
Name: ${productData.name}
Price: ${productData.currency} ${productData.price}
Description: ${productData.description}
Brand: ${productData.brand || 'Unknown'}

GUIDELINES:
1. Use Nigerian English and context
2. Emphasize how it solves Nigeria's power issues (NEPA, fuel costs)
3. Convert price to Naira (NGN) - use ₦600/USD if USD
4. Make it emotional and persuasive
5. Focus on benefits, not just features
6. Use active voice and power words
7. Keep tone professional but approachable
8. Optimize for SEO with Nigerian keywords
9. Suggest appropriate product category

OUTPUT FORMAT (JSON only, no other text):
{
  "name": "Compelling product name (keep original name structure)",
  "short_description": "One punchy sentence (max 160 chars)",
  "description": "Full rewritten description (2-3 compelling paragraphs with Nigerian context)",
  "key_features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
  "benefits": ["Benefit 1 for Nigerian customers", "Benefit 2", "Benefit 3"],
  "meta_description": "SEO-optimized meta description",
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "nigerian_context": "One sentence about why this matters for Nigerians",
  "suggested_category": "Battery Systems|Solar Panels|Inverters|Accessories",
  "price_ngn": ${productData.currency === 'NGN' ? productData.price : Math.round(productData.price * 600)}
}

Return ONLY valid JSON, no markdown, no other text.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a professional Nigerian e-commerce copywriter. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content.trim();
    const jsonContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const aiData: AIRewrittenData = JSON.parse(jsonContent);

    console.log('AI rewriting complete');
    return aiData;

  } catch (error) {
    console.error('AI rewriting error:', error);
    return {
      name: productData.name,
      short_description: productData.description.slice(0, 160) || 'Quality power solution for Nigerian homes',
      description: productData.description || 'High-quality power solution designed for reliable performance.',
      key_features: ['High quality', 'Reliable performance', 'Energy efficient', 'Durable construction'],
      benefits: ['Reduces power costs', 'Reliable backup power', 'Silent operation', 'Long-lasting'],
      meta_description: `${productData.name} - Quality power solution in Nigeria`,
      seo_keywords: ['solar', 'battery', 'power', 'Nigeria'],
      nigerian_context: 'Perfect for Nigerian homes experiencing frequent power outages',
      suggested_category: 'Battery Systems',
      price_ngn: productData.currency === 'NGN' ? productData.price : Math.round(productData.price * 600),
    };
  }
}

async function uploadImages(images: string[], supabase: ReturnType<typeof createClient>): Promise<string[]> {
  console.log('Uploading images to storage...');
  const uploadedUrls: string[] = [];

  for (let i = 0; i < Math.min(images.length, 5); i++) {
    const imageUrl = images[i];
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) continue;

      const blob = await response.blob();
      const fileName = `${Date.now()}-${i}.${blob.type.split('/')[1] || 'jpg'}`;
      const filePath = `products/${fileName}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, blob, { contentType: blob.type, cacheControl: '3600' });

      if (error) { console.error('Upload error:', error); continue; }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
      console.log(`Uploaded image ${i + 1}/${images.length}`);
    } catch (error) {
      console.error(`Failed to upload image ${i}:`, error);
    }
  }

  return uploadedUrls;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let importLogId: string | null = null;
  let supabase: ReturnType<typeof createClient> | undefined;

  try {
    const { url } = await req.json();

    if (!url || !url.startsWith('http')) {
      throw new Error('Invalid URL provided. Must start with http:// or https://');
    }

    const urlObj = new URL(url);
    if (urlObj.protocol !== 'https:' && !url.includes('localhost')) {
      throw new Error('Only HTTPS URLs are allowed for security reasons');
    }

    if (url.length > 2000) {
      throw new Error('URL is too long (max 2000 characters)');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables');
    }

    if (!lovableApiKey) {
      throw new Error('AI service not configured');
    }

    supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      } catch {
        console.warn('Failed to extract user from token');
      }
    }

    // Create import log
    const { data: logEntry, error: logError } = await supabase
      .from('product_import_logs')
      .insert({ source_url: url, imported_by: userId, status: 'pending' })
      .select()
      .single();

    if (!logError && logEntry) {
      importLogId = logEntry.id;
    }

    // Step 1: Scrape
    console.log('Starting scrape for:', url);
    const productData = await scrapeProductPage(url);

    if (importLogId) {
      await supabase.from('product_import_logs')
        .update({ original_data: productData as unknown as Record<string, unknown> })
        .eq('id', importLogId);
    }

    // Step 2: AI rewrite
    console.log('Starting AI rewrite...');
    const aiData = await rewriteWithAI(productData, lovableApiKey);

    // Step 3: Upload images
    console.log('Uploading images...');
    const imageUrls = productData.images.length > 0
      ? await uploadImages(productData.images, supabase)
      : [];

    // Step 4: Build response
    const processedData = {
      source_url: url,
      original_name: productData.name,
      original_price: productData.price,
      original_currency: productData.currency,
      name: aiData.name,
      short_description: aiData.short_description,
      description: aiData.description,
      price: aiData.price_ngn,
      brand: productData.brand || aiData.name.split(' ')[0],
      category: aiData.suggested_category,
      key_features: aiData.key_features,
      benefits: aiData.benefits,
      specifications: productData.specifications,
      meta_description: aiData.meta_description,
      seo_keywords: aiData.seo_keywords.join(', '),
      images: imageUrls,
      nigerian_context: aiData.nigerian_context,
      scraped_at: new Date().toISOString(),
    };

    if (importLogId) {
      await supabase.from('product_import_logs')
        .update({
          status: 'success',
          processed_data: processedData as unknown as Record<string, unknown>,
          ai_response: aiData as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        })
        .eq('id', importLogId);
    }

    return new Response(JSON.stringify({ success: true, data: processedData, log_id: importLogId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape product';

    if (importLogId && supabase) {
      try {
        await supabase.from('product_import_logs')
          .update({ status: 'failed', error_message: errorMessage, updated_at: new Date().toISOString() })
          .eq('id', importLogId);
      } catch (logUpdateError) {
        console.error('Failed to update error log:', logUpdateError);
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: errorMessage, log_id: importLogId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    );
  }
});
