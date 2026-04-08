import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Compact the HTML to keep the AI prompt within token limits.
// This output is sent only to the AI API and is NEVER rendered in a browser.
// We apply each replacement repeatedly until no more matches remain to avoid
// re-introduced partial tags from nested/malformed markup.
function compactHtml(raw: string): string {
  const removeAll = (src: string, pattern: RegExp): string => {
    let prev = src;
    let cur = src.replace(pattern, "");
    while (cur !== prev) { prev = cur; cur = cur.replace(pattern, ""); }
    return cur;
  };

  let text = removeAll(raw, /<script\b[^>]*>[\s\S]*?<\/script[^>]*>/gi);
  text = removeAll(text, /<style\b[^>]*>[\s\S]*?<\/style[^>]*>/gi);
  text = removeAll(text, /<!--[\s\S]*?-->/g);
  text = text.replace(/\s{2,}/g, " ");
  return text.slice(0, 40000);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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
  images: { url: string; alt_text: string }[];
  brand_name?: string;
  category_name?: string;
}

const EXTRACTION_PROMPT = `You are a product data extraction assistant for an e-commerce store that sells solar and energy products in Nigeria.

Extract the following fields from the HTML of a product page and return ONLY valid JSON — no markdown, no code fences.

Required JSON shape:
{
  "name": "Full product name",
  "slug": "url-safe-slug-derived-from-name",
  "short_description": "One or two sentence summary (max 200 chars)",
  "description": "Full HTML description preserving headings, lists and paragraphs",
  "price": 0,
  "discount_price": null,
  "specs": { "key": "value", … },
  "powers": "Comma-separated list of appliances the product can power",
  "ideal_for": "Comma-separated use cases",
  "is_featured": false,
  "is_popular": false,
  "promo_label": null,
  "stock_quantity": 0,
  "status": "active",
  "images": [{ "url": "https://…", "alt_text": "…" }],
  "brand_name": "Brand if identifiable",
  "category_name": "Category if identifiable"
}

Rules:
- price must be a plain number in Nigerian Naira (NGN). If the currency is not NGN, convert to NGN at the current approximate rate and still store as a number.
- status: use "out_of_stock" if the page says "out of stock" or quantity is 0; otherwise "active".
- If a field cannot be determined from the page, use the default shown above.
- slug must be URL-safe lowercase with hyphens, max 120 chars.
- Return ONLY the JSON object — absolutely no other text.`;

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

  // Verify caller is an authenticated admin
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
  const { data: { user: authUser }, error: authError } = await userClient.auth.getUser();
  if (authError || !authUser) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Check admin role
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

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { url } = body;
  if (!url || typeof url !== "string") {
    return new Response(
      JSON.stringify({ error: "url is required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Create a scraper_runs record
  const { data: runRow, error: runInsertError } = await supabase
    .from("scraper_runs")
    .insert({ url, status: "running" })
    .select("id")
    .single();

  if (runInsertError || !runRow) {
    console.error("Failed to create scraper_runs record:", runInsertError);
    return new Response(
      JSON.stringify({ error: "Failed to initialise scraper run" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const runId: string = runRow.id;

  const markError = async (msg: string) => {
    await supabase
      .from("scraper_runs")
      .update({ status: "error", error_message: msg })
      .eq("id", runId);
  };

  // Fetch the product page
  let html: string;
  try {
    const pageRes = await fetch(url, {
      headers: { "User-Agent": "PawaMore-Scraper/1.0 (+https://pawamore.lovable.app)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!pageRes.ok) {
      const errMsg = `Failed to fetch URL: HTTP ${pageRes.status}`;
      await markError(errMsg);
      return new Response(
        JSON.stringify({ run_id: runId, status: "error", error: errMsg }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    html = await pageRes.text();
  } catch (fetchErr) {
    const errMsg = `Network error fetching URL: ${(fetchErr as Error).message}`;
    await markError(errMsg);
    return new Response(
      JSON.stringify({ run_id: runId, status: "error", error: errMsg }),
      { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const compacted = compactHtml(html);

  // Ask Gemini to extract product data
  let extracted: ExtractedProduct;
  try {
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
          { role: "user", content: compacted },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!aiRes.ok) {
      const errMsg = `AI extraction failed: HTTP ${aiRes.status}`;
      await markError(errMsg);
      return new Response(
        JSON.stringify({ run_id: runId, status: "error", error: errMsg }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiRes.json();
    const rawText: string = aiData.choices?.[0]?.message?.content ?? "";

    // Strip optional markdown code fence if the model wraps its answer
    const jsonText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    extracted = JSON.parse(jsonText) as ExtractedProduct;
  } catch (aiErr) {
    const errMsg = `AI parsing error: ${(aiErr as Error).message}`;
    await markError(errMsg);
    return new Response(
      JSON.stringify({ run_id: runId, status: "error", error: errMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Resolve or create brand
  let brandId: string | null = null;
  if (extracted.brand_name) {
    const brandSlug = slugify(extracted.brand_name);
    const { data: existingBrand } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", brandSlug)
      .maybeSingle();
    if (existingBrand) {
      brandId = existingBrand.id;
    } else {
      const { data: newBrand } = await supabase
        .from("brands")
        .insert({ name: extracted.brand_name, slug: brandSlug })
        .select("id")
        .single();
      if (newBrand) brandId = newBrand.id;
    }
  }

  // Resolve or create category
  let categoryId: string | null = null;
  if (extracted.category_name) {
    const catSlug = slugify(extracted.category_name);
    const { data: existingCat } = await supabase
      .from("product_categories")
      .select("id")
      .eq("slug", catSlug)
      .maybeSingle();
    if (existingCat) {
      categoryId = existingCat.id;
    } else {
      const { data: newCat } = await supabase
        .from("product_categories")
        .insert({ name: extracted.category_name, slug: catSlug })
        .select("id")
        .single();
      if (newCat) categoryId = newCat.id;
    }
  }

  // Ensure slug is unique — append a short random suffix if needed
  let finalSlug = extracted.slug || slugify(extracted.name);
  const { count: slugCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("slug", finalSlug);
  if (slugCount && slugCount > 0) {
    finalSlug = `${finalSlug}-${crypto.randomUUID().slice(0, 8)}`;
  }

  // Upsert the product (slug-based deduplication)
  const productPayload = {
    name: extracted.name,
    slug: finalSlug,
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
  };

  const { data: productRow, error: productError } = await supabase
    .from("products")
    .upsert(productPayload, { onConflict: "slug" })
    .select("id")
    .single();

  if (productError || !productRow) {
    const errMsg = `Failed to upsert product: ${productError?.message ?? "unknown"}`;
    await markError(errMsg);
    return new Response(
      JSON.stringify({ run_id: runId, status: "error", error: errMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const productId: string = productRow.id;

  // Insert product images (skip if no images extracted)
  if (Array.isArray(extracted.images) && extracted.images.length > 0) {
    const imageRows = extracted.images.map((img, idx) => ({
      product_id: productId,
      image_url: img.url,
      alt_text: img.alt_text || extracted.name,
      sort_order: idx,
      is_primary: idx === 0,
    }));

    // Remove old images so a re-scrape stays fresh
    await supabase.from("product_images").delete().eq("product_id", productId);
    await supabase.from("product_images").insert(imageRows);
  }

  // Update the scraper_runs row with success
  await supabase
    .from("scraper_runs")
    .update({
      status: "success",
      product_id: productId,
      extracted_data: extracted as unknown as Record<string, unknown>,
    })
    .eq("id", runId);

  return new Response(
    JSON.stringify({
      run_id: runId,
      product_id: productId,
      product_name: extracted.name,
      status: "success",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
