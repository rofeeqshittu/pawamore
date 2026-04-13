import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ScraperStatus = "pending" | "running" | "success" | "error";
type ScrapeMode = "single" | "site";

interface ScrapeRequest {
  url?: string;
  mode?: ScrapeMode;
  batch_size?: number;
}

interface ExtractedImage {
  url: string;
  alt_text?: string;
}

interface ExtractedProduct {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price: number;
  discount_price: number | null;
  specs: Record<string, string>;
  powers: string;
  ideal_for: string;
  is_featured: boolean;
  is_popular: boolean;
  promo_label: string | null;
  stock_quantity: number;
  status: "active" | "draft" | "out_of_stock";
  images: ExtractedImage[];
  brand_name?: string;
  category_name?: string;
  product_type?: string;
  source_currency?: string | null;
  original_price_text?: string | null;
  extra_fields?: Record<string, unknown>;
}

const EXTRACTION_PROMPT = `You are extracting e-commerce product data from a manufacturer product page for a Nigerian solar store.

Return ONLY valid JSON (no markdown / no commentary) in this exact shape:
{
  "name": "string",
  "slug": "kebab-case-slug",
  "short_description": "max 200 chars - complete sentence summarizing the product",
  "description": "<html content - FULL rich description with all paragraphs, features, benefits. Do NOT truncate>",
  "price": 0,
  "discount_price": null,
  "specs": { "Key": "Value" },
  "powers": "comma-separated text",
  "ideal_for": "comma-separated text",
  "is_featured": false,
  "is_popular": false,
  "promo_label": null,
  "stock_quantity": 0,
  "status": "active",
  "images": [{ "url": "https://...", "alt_text": "..." }],
  "brand_name": "string or null",
  "category_name": "string or null",
  "product_type": "string or null",
  "source_currency": "NGN/USD/... or null",
  "original_price_text": "raw text seen on page or null",
  "extra_fields": { "sku": "...", "warranty": "...", "model": "...", "...": "..." }
}

Rules:
- Extract ALL meaningful product fields found on the page. If a field has no dedicated key above, put it in extra_fields.
- price must be numeric NGN. If source is another currency, convert approximately to NGN and keep original text in original_price_text.
- slug must be lowercase kebab-case, <= 120 chars.
- IMAGES: Extract ALL product gallery/carousel images. Look for:
  * Main product images and thumbnails (thumbnails often link to full-size versions)
  * data-src, data-large, data-zoom, data-full attributes (lazy-loaded images)
  * srcset values (pick the largest resolution)
  * Background images in style attributes
  * JSON-LD product image arrays
  * Open Graph og:image tags
  * Images inside gallery, carousel, slider, swiper containers
  * Do NOT include icons, logos, UI elements, social media icons, payment badges
  * Return the HIGHEST resolution version of each image
  * Typically products have 2-10 images - extract ALL of them
- description must be COMPLETE. Include all paragraphs, features, benefits found on the page. Do not truncate.
- If stock is unknown, use stock_quantity 10 and status active.
- Do not invent unavailable values.`;

function compactHtml(raw: string): string {
  const removeAll = (src: string, pattern: RegExp): string => {
    let prev = src;
    let cur = src.replace(pattern, "");
    while (cur !== prev) {
      prev = cur;
      cur = cur.replace(pattern, "");
    }
    return cur;
  };

  let text = removeAll(raw, /<script\b[^>]*>[\s\S]*?<\/script[^>]*>/gi);
  text = removeAll(text, /<style\b[^>]*>[\s\S]*?<\/style[^>]*>/gi);
  text = removeAll(text, /<!--[\s\S]*?-->/g);
  // Remove SVG elements (icons/logos)
  text = removeAll(text, /<svg\b[^>]*>[\s\S]*?<\/svg[^>]*>/gi);
  // Remove nav, footer, header elements to focus on product content
  text = removeAll(text, /<nav\b[^>]*>[\s\S]*?<\/nav[^>]*>/gi);
  text = removeAll(text, /<footer\b[^>]*>[\s\S]*?<\/footer[^>]*>/gi);
  text = text.replace(/\s{2,}/g, " ");
  // Increased limit to capture more product data
  return text.slice(0, 60000);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function clampBatchSize(batchSize?: number): number {
  if (batchSize === undefined || batchSize === null || Number.isNaN(batchSize)) return 5;
  return Math.max(1, Math.min(20, Math.floor(batchSize)));
}

function inferMode(url: URL, explicitMode?: ScrapeMode): ScrapeMode {
  if (explicitMode === "single" || explicitMode === "site") return explicitMode;
  return url.pathname.includes("/product/") ? "single" : "site";
}

function isLikelyProductUrl(value: string): boolean {
  return /\/product[s]?\//i.test(value) || /\/shop\/.+/i.test(value);
}

function sanitizeUrl(raw: string): string {
  const parsed = new URL(raw.trim());
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Only http:// and https:// URLs are allowed");
  }
  if (parsed.protocol === "http:" && !["localhost", "127.0.0.1"].includes(parsed.hostname)) {
    throw new Error("HTTP is only allowed for localhost");
  }
  parsed.hash = "";
  return parsed.toString();
}

async function fetchText(url: string, timeoutMs = 20000): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(timeoutMs),
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  }
  return await res.text();
}

function extractSitemapLocs(xml: string): string[] {
  const urls: string[] = [];
  const regex = /<loc>([^<]+)<\/loc>/gi;
  let match: RegExpExecArray | null = regex.exec(xml);
  while (match) {
    urls.push(match[1].trim());
    match = regex.exec(xml);
  }
  return urls;
}

function extractProductLinksFromHtml(html: string, baseUrl: string): string[] {
  const found = new Set<string>();
  const hrefRegex = /href=["']([^"'#]+)["']/gi;
  let match: RegExpExecArray | null = hrefRegex.exec(html);

  while (match) {
    const href = match[1].trim();
    try {
      const absolute = new URL(href, baseUrl).toString();
      if (isLikelyProductUrl(absolute)) {
        found.add(absolute);
      }
    } catch {
      // ignore malformed URLs
    }
    match = hrefRegex.exec(html);
  }

  return Array.from(found);
}

async function discoverProductUrls(rootUrl: string, limit: number): Promise<string[]> {
  if (isLikelyProductUrl(rootUrl)) return [rootUrl];

  const root = new URL(rootUrl);
  const origin = root.origin;
  const discovered = new Set<string>();

  const addIfProduct = (value: string) => {
    try {
      const parsed = new URL(value);
      if (parsed.origin === origin && isLikelyProductUrl(parsed.toString())) {
        discovered.add(parsed.toString());
      }
    } catch {
      // ignore
    }
  };

  const trySitemap = async (url: string) => {
    try {
      const xml = await fetchText(url, 12000);
      const locs = extractSitemapLocs(xml);
      for (const loc of locs) addIfProduct(loc);
      return locs;
    } catch {
      return [];
    }
  };

  const productSitemapUrl = `${origin}/product-sitemap.xml`;
  await trySitemap(productSitemapUrl);

  if (discovered.size < limit) {
    const sitemapIndexLocs = await trySitemap(`${origin}/sitemap_index.xml`);
    const candidateSitemaps = sitemapIndexLocs.filter((loc) =>
      /product|shop|catalog/i.test(loc)
    );

    for (const loc of candidateSitemaps) {
      if (discovered.size >= limit * 2) break;
      await trySitemap(loc);
    }
  }

  if (discovered.size < limit) {
    try {
      const mainSitemapLocs = await trySitemap(`${origin}/sitemap.xml`);
      for (const loc of mainSitemapLocs) addIfProduct(loc);
    } catch { /* ignore */ }
  }

  if (discovered.size < limit) {
    const html = await fetchText(rootUrl, 12000);
    extractProductLinksFromHtml(html, rootUrl).forEach((u) => addIfProduct(u));
  }

  return Array.from(discovered).slice(0, limit);
}

function parseJsonFromModel(rawText: string): ExtractedProduct {
  let jsonText = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  // Try to find JSON object if there's surrounding text
  const jsonStart = jsonText.indexOf("{");
  const jsonEnd = jsonText.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    jsonText = jsonText.slice(jsonStart, jsonEnd + 1);
  }

  return JSON.parse(jsonText) as ExtractedProduct;
}

function getExtensionFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const last = parsed.pathname.split("/").pop() ?? "";
    const ext = last.split(".").pop()?.toLowerCase();
    if (ext && /^[a-z0-9]{2,5}$/.test(ext)) return ext;
  } catch {
    // ignore
  }
  return "jpg";
}

function extensionFromContentType(contentType: string | null): string | null {
  if (!contentType) return null;
  const lowered = contentType.toLowerCase();
  if (lowered.includes("image/jpeg")) return "jpg";
  if (lowered.includes("image/png")) return "png";
  if (lowered.includes("image/webp")) return "webp";
  if (lowered.includes("image/gif")) return "gif";
  if (lowered.includes("image/svg+xml")) return "svg";
  return null;
}

async function uploadImageToStorage(
  supabase: ReturnType<typeof createClient>,
  sourceUrl: string,
  productSlug: string
): Promise<string> {
  try {
    const imageRes = await fetch(sourceUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "image/*,*/*;q=0.8",
        "Referer": new URL(sourceUrl).origin + "/",
      },
      signal: AbortSignal.timeout(25000),
      redirect: "follow",
    });
    if (!imageRes.ok) return sourceUrl;

    const contentType = imageRes.headers.get("content-type");
    if (contentType && !contentType.toLowerCase().startsWith("image/")) return sourceUrl;

    const ext = extensionFromContentType(contentType) ?? getExtensionFromUrl(sourceUrl);
    const path = `imports/${new Date().toISOString().slice(0, 10)}/${slugify(
      productSlug
    )}/${crypto.randomUUID()}.${ext}`;

    const bytes = await imageRes.arrayBuffer();
    
    // Skip tiny images (likely icons/tracking pixels)
    if (bytes.byteLength < 2000) return sourceUrl;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, bytes, {
        contentType: contentType ?? "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.warn("Image upload failed; using source URL:", uploadError.message);
      return sourceUrl;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.warn("Image upload error:", (err as Error).message);
    return sourceUrl;
  }
}

async function resolveOrCreateBrandId(
  supabase: ReturnType<typeof createClient>,
  brandName?: string
): Promise<string | null> {
  if (!brandName) return null;
  const slug = slugify(brandName);

  const { data: existing } = await (supabase
    .from("brands") as any)
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { data: inserted } = await (supabase
    .from("brands") as any)
    .insert({ name: brandName, slug })
    .select("id")
    .single();
  return inserted?.id ?? null;
}

async function resolveOrCreateCategoryId(
  supabase: ReturnType<typeof createClient>,
  categoryName?: string
): Promise<string | null> {
  if (!categoryName) return null;
  const slug = slugify(categoryName);

  const { data: existing } = await (supabase
    .from("product_categories") as any)
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { data: inserted } = await (supabase
    .from("product_categories") as any)
    .insert({ name: categoryName, slug })
    .select("id")
    .single();
  return inserted?.id ?? null;
}

async function ensureUniqueSlug(
  supabase: ReturnType<typeof createClient>,
  candidate: string,
  sourceUrl: string
): Promise<string> {
  let finalSlug = candidate || `product-${crypto.randomUUID().slice(0, 8)}`;
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await (supabase
      .from("products") as any)
      .select("id, source_url")
      .eq("slug", finalSlug)
      .maybeSingle();
    if (!existing || existing.source_url === sourceUrl) return finalSlug;
    finalSlug = `${candidate}-${crypto.randomUUID().slice(0, 6)}`;
  }
  return `${candidate}-${crypto.randomUUID().slice(0, 8)}`;
}

async function extractWithAI(
  lovableApiKey: string,
  sourceUrl: string,
  html: string
): Promise<ExtractedProduct> {
  const compacted = compactHtml(html);
  
  console.log(`AI extraction for ${sourceUrl}, HTML size: ${compacted.length} chars`);
  
  const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        {
          role: "user",
          content: `SOURCE_URL: ${sourceUrl}\n\nHTML:\n${compacted}`,
        },
      ],
      max_tokens: 8192,
      temperature: 0.1,
    }),
  });

  if (!aiRes.ok) {
    const errText = await aiRes.text();
    console.error("AI error response:", errText);
    if (aiRes.status === 429) {
      throw new Error("AI rate limit exceeded. Please try again in a minute.");
    }
    if (aiRes.status === 402) {
      throw new Error("AI credits exhausted. Please add funds in Settings > Workspace > Usage.");
    }
    throw new Error(`AI extraction failed: HTTP ${aiRes.status}`);
  }

  const aiData = await aiRes.json();
  const finishReason = aiData.choices?.[0]?.finish_reason;
  if (finishReason === "length" || finishReason === "MAX_TOKENS") {
    console.warn("AI output was truncated (finish_reason:", finishReason, "). Retrying with higher limit...");
    // Retry with even higher token limit
    const retryRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: EXTRACTION_PROMPT },
          {
            role: "user",
            content: `SOURCE_URL: ${sourceUrl}\n\nHTML:\n${compacted}`,
          },
        ],
        max_tokens: 16384,
        temperature: 0.1,
      }),
    });
    if (retryRes.ok) {
      const retryData = await retryRes.json();
      const retryText: string = retryData.choices?.[0]?.message?.content ?? "";
      return parseJsonFromModel(retryText);
    }
  }

  const rawText: string = aiData.choices?.[0]?.message?.content ?? "";
  if (!rawText.trim()) {
    throw new Error("AI returned empty response");
  }
  return parseJsonFromModel(rawText);
}

function normalizeExtracted(product: ExtractedProduct, sourceUrl: string): ExtractedProduct {
  const name = product.name?.trim() || "Imported Product";
  const fallbackSlug = slugify(name);
  const safeImages = Array.isArray(product.images)
    ? product.images.filter((img) => typeof img?.url === "string" && img.url.length > 0)
    : [];

  // Deduplicate images by URL
  const seenUrls = new Set<string>();
  const uniqueImages = safeImages.filter((img) => {
    const normalized = img.url.split("?")[0].toLowerCase();
    if (seenUrls.has(normalized)) return false;
    seenUrls.add(normalized);
    return true;
  });

  return {
    name,
    slug: product.slug ? slugify(product.slug) : fallbackSlug,
    short_description: (product.short_description || "").slice(0, 200),
    description: product.description || "",
    price: Number.isFinite(product.price) ? Number(product.price) : 0,
    discount_price:
      product.discount_price === null || product.discount_price === undefined
        ? null
        : Number(product.discount_price),
    specs: product.specs && typeof product.specs === "object" ? product.specs : {},
    powers: product.powers || "",
    ideal_for: product.ideal_for || "",
    is_featured: Boolean(product.is_featured),
    is_popular: Boolean(product.is_popular),
    promo_label: product.promo_label ?? null,
    stock_quantity:
      typeof product.stock_quantity === "number" && product.stock_quantity >= 0
        ? Math.floor(product.stock_quantity)
        : 10,
    status:
      product.status === "draft" || product.status === "out_of_stock" ? product.status : "active",
    images: uniqueImages,
    brand_name: product.brand_name?.trim() || undefined,
    category_name: product.category_name?.trim() || undefined,
    product_type: product.product_type?.trim() || undefined,
    source_currency: product.source_currency ?? null,
    original_price_text: product.original_price_text ?? null,
    extra_fields: {
      ...(product.extra_fields && typeof product.extra_fields === "object"
        ? product.extra_fields
        : {}),
      source_url: sourceUrl,
    },
  };
}

async function importSingleProduct(
  supabase: ReturnType<typeof createClient>,
  lovableApiKey: string,
  sourceUrl: string
): Promise<{
  url: string;
  status: "success" | "error";
  product_id?: string;
  product_name?: string;
  error?: string;
}> {
  try {
    const html = await fetchText(sourceUrl, 25000);
    console.log(`Fetched ${sourceUrl}: ${html.length} chars`);
    
    const extractedRaw = await extractWithAI(lovableApiKey, sourceUrl, html);
    const extracted = normalizeExtracted(extractedRaw, sourceUrl);
    
    console.log(`Extracted: ${extracted.name}, ${extracted.images.length} images, price: ${extracted.price}`);

    const brandId = await resolveOrCreateBrandId(supabase, extracted.brand_name);
    const categoryId = await resolveOrCreateCategoryId(supabase, extracted.category_name);
    const uniqueSlug = await ensureUniqueSlug(
      supabase,
      extracted.slug || slugify(extracted.name),
      sourceUrl
    );

    const productPayload = {
      name: extracted.name,
      slug: uniqueSlug,
      short_description: extracted.short_description || null,
      description: extracted.description || null,
      price: extracted.price,
      discount_price: extracted.discount_price ?? null,
      specs: extracted.specs ?? {},
      powers: extracted.powers || null,
      ideal_for: extracted.ideal_for || null,
      is_featured: extracted.is_featured ?? false,
      is_popular: extracted.is_popular ?? false,
      promo_label: extracted.promo_label ?? null,
      stock_quantity: extracted.stock_quantity ?? 0,
      status: extracted.status ?? "active",
      brand_id: brandId,
      category_id: categoryId,
      source_url: sourceUrl,
      product_type: extracted.product_type ?? null,
      source_metadata: {
        source_currency: extracted.source_currency ?? null,
        original_price_text: extracted.original_price_text ?? null,
        extra_fields: extracted.extra_fields ?? {},
      },
    };

    const { data: productRow, error: productError } = await (supabase
      .from("products") as any)
      .upsert(productPayload, { onConflict: "source_url" })
      .select("id")
      .single();

    if (productError || !productRow) {
      throw new Error(`Failed to upsert product: ${productError?.message ?? "unknown error"}`);
    }

    const productId: string = productRow.id;

    // Delete existing images before re-importing
    await supabase.from("product_images").delete().eq("product_id", productId);

    if (extracted.images.length > 0) {
      // Upload up to 10 images
      const limitedImages = extracted.images.slice(0, 10);
      console.log(`Uploading ${limitedImages.length} images for ${extracted.name}...`);
      
      const uploaded = await Promise.all(
        limitedImages.map(async (img) => ({
          image_url: await uploadImageToStorage(supabase, img.url, uniqueSlug),
          alt_text: img.alt_text || extracted.name,
        }))
      );

      const imageRows = uploaded.map((img, idx) => ({
        product_id: productId,
        image_url: img.image_url,
        alt_text: img.alt_text,
        sort_order: idx,
        is_primary: idx === 0,
      }));

      await (supabase.from("product_images") as any).insert(imageRows);
      console.log(`Inserted ${imageRows.length} images for product ${productId}`);
    }

    return {
      url: sourceUrl,
      status: "success",
      product_id: productId,
      product_name: extracted.name,
    };
  } catch (error) {
    console.error(`Error importing ${sourceUrl}:`, (error as Error).message);
    return {
      url: sourceUrl,
      status: "error",
      error: (error as Error).message,
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

  if (!lovableApiKey) {
    return new Response(
      JSON.stringify({ error: "AI service not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Authorization header required" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user: authUser },
    error: authError,
  } = await userClient.auth.getUser();
  if (authError || !authUser) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", authUser.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleData) {
    return new Response(
      JSON.stringify({ error: "Admin access required" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let body: ScrapeRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!body.url || typeof body.url !== "string") {
    return new Response(
      JSON.stringify({ error: "url is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let sanitizedUrl: string;
  try {
    sanitizedUrl = sanitizeUrl(body.url);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const parsedUrl = new URL(sanitizedUrl);
  const mode = inferMode(parsedUrl, body.mode);
  const batchSize = mode === "single" ? 1 : clampBatchSize(body.batch_size);

  const { data: runRow, error: runInsertError } = await supabase
    .from("scraper_runs")
    .insert({ url: sanitizedUrl, status: "running" satisfies ScraperStatus })
    .select("id")
    .single();

  if (runInsertError || !runRow) {
    return new Response(
      JSON.stringify({ error: "Failed to initialise scraper run" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const runId = runRow.id as string;

  const markRun = async (
    status: ScraperStatus,
    payload: {
      product_id?: string | null;
      error_message?: string | null;
      extracted_data?: Record<string, unknown>;
    }
  ) => {
    await supabase
      .from("scraper_runs")
      .update({
        status,
        product_id: payload.product_id ?? null,
        error_message: payload.error_message ?? null,
        extracted_data: payload.extracted_data ?? null,
      })
      .eq("id", runId);
  };

  try {
    console.log(`Scraper run ${runId}: mode=${mode}, batchSize=${batchSize}, url=${sanitizedUrl}`);
    const productUrls = await discoverProductUrls(sanitizedUrl, batchSize);

    if (productUrls.length === 0) {
      const errorMessage =
        "No product links discovered. Try a direct /product/... URL or a site with product sitemaps.";
      await markRun("error", { error_message: errorMessage });
      return new Response(
        JSON.stringify({ run_id: runId, status: "error", error: errorMessage }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Discovered ${productUrls.length} product URLs`);

    const results: Array<{
      url: string;
      status: "success" | "error";
      product_id?: string;
      product_name?: string;
      error?: string;
    }> = [];

    for (const productUrl of productUrls) {
      const result = await importSingleProduct(supabase, lovableApiKey, productUrl);
      results.push(result);
    }

    const successes = results.filter((r) => r.status === "success");
    const failures = results.filter((r) => r.status === "error");
    const summary = {
      mode,
      requested_batch_size: batchSize,
      discovered_urls: productUrls,
      processed_count: results.length,
      success_count: successes.length,
      failure_count: failures.length,
      results,
    };

    if (successes.length === 0) {
      await markRun("error", {
        error_message: failures[0]?.error ?? "All imports failed",
        extracted_data: summary as unknown as Record<string, unknown>,
      });
      return new Response(
        JSON.stringify({
          run_id: runId,
          status: "error",
          error: failures[0]?.error ?? "All imports failed",
          summary,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await markRun("success", {
      product_id: successes[0].product_id ?? null,
      extracted_data: summary as unknown as Record<string, unknown>,
    });

    return new Response(
      JSON.stringify({
        run_id: runId,
        status: "success",
        mode,
        imported_count: successes.length,
        failed_count: failures.length,
        product_id: successes[0].product_id,
        product_name: successes[0].product_name,
        products: successes,
        failures,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = (error as Error).message || "Unexpected scraper error";
    console.error(`Scraper run ${runId} failed:`, message);
    await markRun("error", { error_message: message });
    return new Response(
      JSON.stringify({ run_id: runId, status: "error", error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
