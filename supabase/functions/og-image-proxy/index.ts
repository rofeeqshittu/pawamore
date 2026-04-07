import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: product, error } = await supabase
      .from("products")
      .select(`
        name, short_description, price, discount_price, stock_quantity, slug,
        product_images(image_url, is_primary)
      `)
      .eq("slug", slug)
      .single();

    if (error || !product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const images = (product as any).product_images || [];
    const primaryImage = images.find((i: any) => i.is_primary)?.image_url || images[0]?.image_url || "";
    const displayPrice = product.discount_price || product.price;
    const formattedPrice = `₦${Number(displayPrice).toLocaleString("en-NG")}`;
    const availability = (product.stock_quantity ?? 0) > 0 ? "✅ In Stock" : "⏳ Pre-order";
    const description = `${product.short_description || product.name} | ${formattedPrice} | ${availability}. PawaMore Systems Nigeria.`;
    const productUrl = `https://pawamore.lovable.app/products/${product.slug}`;
    const title = `${product.name} - ${formattedPrice} | PawaMore Systems`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />

  <meta property="og:type" content="product" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(primaryImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(product.name)}" />
  <meta property="og:url" content="${escapeHtml(productUrl)}" />
  <meta property="og:site_name" content="PawaMore Systems" />
  <meta property="og:locale" content="en_NG" />
  <meta property="product:price:amount" content="${displayPrice}" />
  <meta property="product:price:currency" content="NGN" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(primaryImage)}" />
  <meta name="twitter:image:alt" content="${escapeHtml(product.name)}" />

  <link rel="canonical" href="${escapeHtml(productUrl)}" />
  
  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description || product.name,
    image: primaryImage,
    url: productUrl,
    offers: {
      "@type": "Offer",
      price: displayPrice,
      priceCurrency: "NGN",
      availability: (product.stock_quantity ?? 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      seller: { "@type": "Organization", name: "PawaMore Systems" },
    },
  })}
  </script>

  <meta http-equiv="refresh" content="0;url=${escapeHtml(productUrl)}" />
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(productUrl)}">${escapeHtml(product.name)}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
