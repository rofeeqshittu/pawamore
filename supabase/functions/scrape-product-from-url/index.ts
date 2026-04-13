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

function compactHtml(raw: string): string {
  let text = raw;
  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script[^>]*>/gi, '');
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style[^>]*>/gi, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<svg\b[^>]*>[\s\S]*?<\/svg[^>]*>/gi, '');
  text = text.replace(/<nav\b[^>]*>[\s\S]*?<\/nav[^>]*>/gi, '');
  text = text.replace(/<footer\b[^>]*>[\s\S]*?<\/footer[^>]*>/gi, '');
  text = text.replace(/\s{2,}/g, ' ');
  return text.slice(0, 60000);
}

async function scrapeProductPage(url: string): Promise<ProductData> {
  console.log('Fetching product page:', url);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch (${response.status}): ${response.statusText}`);
  }

  const html = await response.text();
  console.log(`Fetched ${url}: ${html.length} chars`);

  // Extract ALL product images comprehensively
  const extractImages = (): string[] => {
    const images: string[] = [];
    const baseUrl = new URL(url).origin;
    const seenNormalized = new Set<string>();

    const addImage = (imgUrl: string) => {
      if (!imgUrl || imgUrl.length < 10) return;
      // Skip non-product images
      if (/icon|logo|avatar|button|social|payment|badge|flag|arrow|close|search|cart|menu|spinner|loading/i.test(imgUrl)) return;
      
      let resolved = imgUrl;
      if (resolved.startsWith('//')) resolved = 'https:' + resolved;
      else if (resolved.startsWith('/')) resolved = baseUrl + resolved;
      else if (!resolved.startsWith('http')) return;

      // Normalize for dedup
      const normalized = resolved.split('?')[0].toLowerCase();
      if (seenNormalized.has(normalized)) return;
      seenNormalized.add(normalized);
      images.push(resolved);
    };

    // 1. Standard img tags - src, data-src, data-large, data-zoom, data-full
    const imgRegex = /<img[^>]+>/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      const tag = match[0];
      // Extract all image-related attributes
      const attrs = ['data-large', 'data-zoom', 'data-full', 'data-original', 'data-src', 'src'];
      for (const attr of attrs) {
        const attrMatch = tag.match(new RegExp(`${attr}=["']([^"']+)["']`, 'i'));
        if (attrMatch?.[1]) {
          addImage(attrMatch[1].split(',')[0].split(' ')[0]);
        }
      }
      // Extract srcset - get the largest image
      const srcsetMatch = tag.match(/srcset=["']([^"']+)["']/i);
      if (srcsetMatch?.[1]) {
        const srcsetParts = srcsetMatch[1].split(',').map(s => s.trim());
        // Get the last (usually largest) entry
        for (const part of srcsetParts) {
          const partUrl = part.split(' ')[0];
          if (partUrl) addImage(partUrl);
        }
      }
    }

    // 2. JSON-LD structured data
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let jsonLdMatch;
    while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(jsonLdMatch[1]);
        const extractFromJsonLd = (obj: any) => {
          if (!obj) return;
          if (typeof obj.image === 'string') addImage(obj.image);
          if (Array.isArray(obj.image)) obj.image.forEach((i: any) => typeof i === 'string' ? addImage(i) : i?.url && addImage(i.url));
          if (obj['@graph']) obj['@graph'].forEach(extractFromJsonLd);
        };
        extractFromJsonLd(data);
      } catch { /* ignore malformed JSON-LD */ }
    }

    // 3. Open Graph images
    const ogRegex = /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/gi;
    while ((match = ogRegex.exec(html)) !== null) {
      addImage(match[1]);
    }

    // 4. Background images in style attributes
    const bgRegex = /url\(['"]?([^'")\s]+)['"]?\)/gi;
    while ((match = bgRegex.exec(html)) !== null) {
      const bgUrl = match[1];
      if (/\.(jpg|jpeg|png|webp)/i.test(bgUrl)) {
        addImage(bgUrl);
      }
    }

    return images.slice(0, 15);
  };

  // Extract price with better patterns
  const extractPrice = (): number => {
    const patterns = [
      /₦\s*([\d,]+(?:\.\d{2})?)/,
      /NGN\s*([\d,]+(?:\.\d{2})?)/,
      /\$\s*([\d,]+(?:\.\d{2})?)/,
      /USD\s*([\d,]+(?:\.\d{2})?)/,
      /£\s*([\d,]+(?:\.\d{2})?)/,
      /€\s*([\d,]+(?:\.\d{2})?)/,
      /"price"[^}]*?(\d[\d,.]+)/i,
      /data-price=["'](\d+(?:\.\d{2})?)/i,
      /itemprop=["']price["'][^>]*content=["'](\d+(?:\.\d{2})?)/i,
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
    if (html.includes('₦') || /NGN/i.test(html) || html.includes('Naira')) return 'NGN';
    if (html.includes('$') || html.includes('USD')) return 'USD';
    if (html.includes('£') || html.includes('GBP')) return 'GBP';
    if (html.includes('€') || html.includes('EUR')) return 'EUR';
    return 'USD';
  };

  // Extract product name from multiple sources
  const extractName = (): string => {
    // Try JSON-LD first
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const data = JSON.parse(jsonLdMatch[1]);
        if (data.name) return data.name;
        if (data['@graph']) {
          for (const item of data['@graph']) {
            if (item['@type'] === 'Product' && item.name) return item.name;
          }
        }
      } catch { /* ignore */ }
    }
    // Try og:title
    const ogMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (ogMatch?.[1]) return ogMatch[1].trim();
    // Try h1
    const h1Match = html.match(/<h1[^>]*>([^<]+)</i);
    if (h1Match?.[1]?.trim()) return h1Match[1].trim();
    // Try title tag
    const titleMatch = html.match(/<title>([^<]+)</i);
    if (titleMatch?.[1]?.trim()) return titleMatch[1].trim();
    return 'Unnamed Product';
  };

  // Extract description from multiple sources
  const extractDescription = (): string => {
    // Try JSON-LD
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const data = JSON.parse(jsonLdMatch[1]);
        if (data.description) return data.description;
      } catch { /* ignore */ }
    }
    // Try meta description
    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (metaMatch?.[1]?.trim()) return metaMatch[1].trim();
    // Try og:description
    const ogMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    if (ogMatch?.[1]?.trim()) return ogMatch[1].trim();
    return '';
  };

  const images = extractImages();
  console.log(`Extracted ${images.length} images from ${url}`);

  return {
    name: extractName(),
    price: extractPrice(),
    currency: detectCurrency(),
    images,
    description: extractDescription(),
    specifications: {},
    brand: undefined,
    model: undefined,
  };
}

async function rewriteWithAI(productData: ProductData, lovableApiKey: string): Promise<AIRewrittenData> {
  console.log('Rewriting content with AI...');

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
10. Write a COMPLETE, detailed description - at least 2-3 full paragraphs

OUTPUT FORMAT (JSON only, no other text):
{
  "name": "Compelling product name (keep original name structure)",
  "short_description": "One punchy sentence (max 160 chars)",
  "description": "Full rewritten description (2-3 compelling paragraphs with Nigerian context. Be detailed and complete.)",
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
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are a professional Nigerian e-commerce copywriter. Return only valid JSON. Write complete, detailed descriptions.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error('AI rate limit exceeded. Try again in a minute.');
      if (response.status === 402) throw new Error('AI credits exhausted. Add funds in Settings > Workspace > Usage.');
      throw new Error(`AI API error: ${response.status}`);
    }

    const result = await response.json();
    const finishReason = result.choices?.[0]?.finish_reason;
    if (finishReason === 'length' || finishReason === 'MAX_TOKENS') {
      console.warn('AI output truncated, retrying with higher limit...');
      const retryRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            { role: 'system', content: 'You are a professional Nigerian e-commerce copywriter. Return only valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 8192,
        }),
      });
      if (retryRes.ok) {
        const retryData = await retryRes.json();
        const retryContent = retryData.choices?.[0]?.message?.content?.trim() ?? '';
        const retryJson = retryContent.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(retryJson) as AIRewrittenData;
      }
    }

    const content = result.choices[0].message.content.trim();
    let jsonContent = content.replace(/```json\n?|\n?```/g, '').trim();
    // Find JSON object if surrounded by text
    const jsonStart = jsonContent.indexOf('{');
    const jsonEnd = jsonContent.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      jsonContent = jsonContent.slice(jsonStart, jsonEnd + 1);
    }
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

async function uploadImages(images: string[], supabase: ReturnType<typeof createClient>, sourceUrl: string): Promise<string[]> {
  console.log(`Uploading ${images.length} images to storage...`);
  const uploadedUrls: string[] = [];

  for (let i = 0; i < Math.min(images.length, 10); i++) {
    const imageUrl = images[i];
    try {
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/*,*/*;q=0.8',
          'Referer': new URL(sourceUrl).origin + '/',
        },
        signal: AbortSignal.timeout(20000),
        redirect: 'follow',
      });
      if (!response.ok) { console.warn(`Image fetch failed (${response.status}): ${imageUrl}`); continue; }

      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.toLowerCase().startsWith('image/')) continue;

      const blob = await response.arrayBuffer();
      
      // Skip tiny images (icons, tracking pixels)
      if (blob.byteLength < 2000) { console.log(`Skipping tiny image (${blob.byteLength}b): ${imageUrl}`); continue; }
      
      const ext = contentType?.includes('png') ? 'png' : contentType?.includes('webp') ? 'webp' : 'jpg';
      const fileName = `${Date.now()}-${i}-${crypto.randomUUID().slice(0, 6)}.${ext}`;
      const filePath = `products/${fileName}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, blob, { contentType: contentType ?? 'image/jpeg', cacheControl: '3600' });

      if (error) { console.error('Upload error:', error.message); continue; }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
      console.log(`Uploaded image ${i + 1}/${images.length}`);
    } catch (error) {
      console.error(`Failed to upload image ${i}:`, (error as Error).message);
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
    const { data: logEntry, error: logError } = await (supabase
      .from('product_import_logs') as any)
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
      await (supabase.from('product_import_logs') as any)
        .update({ original_data: productData as unknown as Record<string, unknown> })
        .eq('id', importLogId);
    }

    // Step 2: AI rewrite
    console.log('Starting AI rewrite...');
    const aiData = await rewriteWithAI(productData, lovableApiKey);

    // Step 3: Upload ALL images
    console.log(`Uploading ${productData.images.length} images...`);
    const imageUrls = productData.images.length > 0
      ? await uploadImages(productData.images, supabase, url)
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
      total_images_found: productData.images.length,
      total_images_uploaded: imageUrls.length,
      nigerian_context: aiData.nigerian_context,
      scraped_at: new Date().toISOString(),
    };

    if (importLogId) {
      await (supabase.from('product_import_logs') as any)
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
        await (supabase.from('product_import_logs') as any)
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
