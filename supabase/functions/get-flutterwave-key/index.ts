const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const publicKey = Deno.env.get("FLUTTERWAVE_PUBLIC_KEY");
  
  return new Response(JSON.stringify({ publicKey: publicKey || "" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
