import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

// Site-specific selectors for better scraping accuracy
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

// Extract product data from HTML with improved parsing
async function scrapeProductPage(url: string): Promise<ProductData> {
  console.log('Fetching product page:', url);
  
  try {
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
    
    // Enhanced text extraction with multiple strategies
    const extractText = (keywords: string[], html: string): string => {
      // Strategy 1: Try CSS selectors
      for (const selector of keywords) {
        const regex = new RegExp(`<[^>]*class=["'][^"']*${selector}[^"']*["'][^>]*>([^<]+)<`, 'i');
        const match = html.match(regex);
        if (match?.[1]?.trim()) return match[1].trim();
      }
      
      // Strategy 2: Try element + class pattern
      for (const keyword of keywords) {
        const regex = new RegExp(`<[^>]*${keyword}[^>]*>([^<]+)<`, 'i');
        const match = html.match(regex);
        if (match?.[1]?.trim()) return match[1].trim();
      }
      
      return '';
    };

    // Enhanced image extraction
    const extractImages = (): string[] => {
      const images: string[] = [];
      const baseUrl = new URL(url).origin;
      
      // Strategy 1: Find images with product-related attributes
      const imgRegex = /<img[^>]*(?:src|data-src|srcset)=["']([^"']+)["'][^>]*>/gi;
      let match;
      
      while ((match = imgRegex.exec(html)) !== null) {
        let imgUrl = match[1].split(',')[0].split(' ')[0]; // Handle srcset
        
        // Filter out icons, thumbnails, and UI elements
        if (imgUrl.includes('icon') || imgUrl.includes('logo') || 
            imgUrl.includes('thumb') || imgUrl.includes('avatar') ||
            imgUrl.includes('ui/') || imgUrl.includes('button')) {
          continue;
        }
        
        // Resolve relative URLs
        if (imgUrl.startsWith('//')) {
          imgUrl = 'https:' + imgUrl;
        } else if (imgUrl.startsWith('/')) {
          imgUrl = baseUrl + imgUrl;
        } else if (!imgUrl.startsWith('http')) {
          continue; // Skip data URIs and invalid URLs
        }
        
        images.push(imgUrl);
      }
      
      // Return unique images, limited to first 5
      return [...new Set(images)].slice(0, 5);
    };

    // Enhanced price extraction
    const extractPrice = (): number => {
      // Try multiple price patterns
      const patterns = [
        /[\$₦£€]\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,  // $1,234.56
        /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*[\$₦£€]/,  // 1,234.56$
        /"price[^"]*"[^>]*>[\s\S]*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,  // In price element
        /data-price=["'](\d+(?:\.\d{2})?)/i,  // data-price attribute
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

    // Detect currency
    const detectCurrency = (): string => {
      if (html.includes('₦') || html.includes('NGN') || html.includes('Naira')) return 'NGN';
      if (html.includes('$') || html.includes('USD')) return 'USD';
      if (html.includes('£') || html.includes('GBP')) return 'GBP';
      if (html.includes('€') || html.includes('EUR')) return 'EUR';
      return 'USD'; // default
    };

    const productData: ProductData = {
      name: extractText(selectors.name, html) || 'Unnamed Product',
      price: extractPrice(),
      currency: detectCurrency(),
      images: extractImages(),
      description: extractText(selectors.description, html) || '',
      specifications: {},
      brand: extractText(selectors.brand || [], html) || undefined,
      model: extractText(['model', 'sku', 'model-number'], html) || undefined,
    };

    // Validate extracted data
    if (!productData.name || productData.name === 'Unnamed Product') {
      console.warn('Could not extract product name from page');
    }
    
    if (productData.price === 0) {
      console.warn('Could not extract price from page');
    }
    
    if (productData.images.length === 0) {
      console.warn('Could not extract any product images');
    }

    console.log('Scraped product data:', {
      ...productData,
      description: productData.description.slice(0, 100) + '...',
    });
    
    return productData;
    
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(`Failed to scrape product: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// AI rewriting using OpenAI
async function rewriteWithAI(productData: ProductData, openaiKey: string): Promise<AIRewrittenData> {
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

BRAND VOICE:
- Empowering, confident, trustworthy
- Speaks directly to power frustrations
- Solutions-focused
- Uses "you" and "your"
- Mentions fuel savings, silent operation, reliability

Example good copy:
"Tired of ₦50,000 monthly fuel bills? This 1000Wh battery system powers your essentials all night—fridge, TV, fans, lights—while you sleep soundly. No noise. No fumes. Just clean, reliable power."

Return ONLY valid JSON, no markdown, no other text.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional Nigerian e-commerce copywriter. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    const jsonContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const aiData: AIRewrittenData = JSON.parse(jsonContent);
    
    console.log('AI rewriting complete');
    return aiData;
    
  } catch (error) {
    console.error('AI rewriting error:', error);
    // Fallback to original data with minimal processing
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

// Upload images to Supabase Storage
async function uploadImages(images: string[], supabase: ReturnType<typeof createClient>): Promise<string[]> {
  console.log('Uploading images to Supabase Storage...');
  const uploadedUrls: string[] = [];

  for (let i = 0; i < Math.min(images.length, 5); i++) {
    const imageUrl = images[i];
    try {
      // Download image
      const response = await fetch(imageUrl);
      if (!response.ok) continue;

      const blob = await response.blob();
      const fileName = `${Date.now()}-${i}.${blob.type.split('/')[1] || 'jpg'}`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, blob, {
          contentType: blob.type,
          cacheControl: '3600',
        });

      if (error) {
        console.error('Upload error:', error);
        continue;
      }

      // Get public URL
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
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let importLogId: string | null = null;
  let supabase: ReturnType<typeof createClient>;

  try {
    const { url } = await req.json();

    // Validate URL
    if (!url || !url.startsWith('http')) {
      throw new Error('Invalid URL provided. Must start with http:// or https://');
    }

    // Security: Only allow HTTPS URLs in production
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'https:' && !url.includes('localhost')) {
      throw new Error('Only HTTPS URLs are allowed for security reasons');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY')!;
    
    if (!supabaseUrl || !supabaseKey || !openaiKey) {
      throw new Error('Missing required environment variables');
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

    // Create import log entry
    const { data: logEntry, error: logError } = await supabase
      .from('product_import_logs')
      .insert({
        source_url: url,
        imported_by: userId,
        status: 'pending',
      })
      .select()
      .single();

    if (!logError && logEntry) {
      importLogId = logEntry.id;
    }

    // Step 1: Scrape product page
    console.log('Starting scrape for:', url);
    const productData = await scrapeProductPage(url);

    // Update log with original data
    if (importLogId) {
      await supabase
        .from('product_import_logs')
        .update({ original_data: productData })
        .eq('id', importLogId);
    }

    // Step 2: AI rewrite content
    console.log('Starting AI rewrite...');
    const aiData = await rewriteWithAI(productData, openaiKey);

    // Step 3: Upload images
    console.log('Uploading images...');
    const imageUrls = productData.images.length > 0 
      ? await uploadImages(productData.images, supabase)
      : [];

    // Step 4: Prepare response data
    const processedData = {
      // Original data
      source_url: url,
      original_name: productData.name,
      original_price: productData.price,
      original_currency: productData.currency,
      
      // AI-processed data
      name: aiData.name,
      short_description: aiData.short_description,
      description: aiData.description,
      price: aiData.price_ngn,
      brand: productData.brand || aiData.name.split(' ')[0],
      category: aiData.suggested_category,
      
      // Features and specs
      key_features: aiData.key_features,
      benefits: aiData.benefits,
      specifications: productData.specifications,
      
      // SEO
      meta_description: aiData.meta_description,
      seo_keywords: aiData.seo_keywords.join(', '),
      
      // Images
      images: imageUrls,
      
      // Nigerian context
      nigerian_context: aiData.nigerian_context,
      
      // Metadata
      scraped_at: new Date().toISOString(),
    };

    // Update log with success status
    if (importLogId) {
      await supabase
        .from('product_import_logs')
        .update({
          status: 'success',
          processed_data: processedData,
          ai_response: aiData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', importLogId);
    }

    const response = {
      success: true,
      data: processedData,
      log_id: importLogId,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape product';
    
    // Update log with failure status
    if (importLogId && supabase) {
      try {
        await supabase
          .from('product_import_logs')
          .update({
            status: 'failed',
            error_message: errorMessage,
            updated_at: new Date().toISOString(),
          })
          .eq('id', importLogId);
      } catch (logUpdateError) {
        console.error('Failed to update error log:', logUpdateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        log_id: importLogId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
