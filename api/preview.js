const PAGE_PREVIEWS = {
  "/solar-calculator": {
    title: "Solar Calculator - Estimate Your Power Needs | PawaMore",
    description:
      "Use our free solar calculator to estimate battery, inverter, and panel sizing for homes and businesses in Nigeria.",
    image: "/favicon.png",
    type: "website",
  },
  "/resources": {
    title: "Solar Resources Hub — PawaMore Systems",
    description:
      "Practical resources for Nigerian buyers: calculator, buyer's guide, FAQs, and expert insights.",
    image: "/favicon.png",
    type: "website",
  },
  "/resources/buyers-guide": {
    title: "Solar Buyer's Guide (Nigeria) — PawaMore Systems",
    description:
      "A practical buying guide covering sizing, batteries, inverters, budgeting, and installer vetting.",
    image: "/favicon.png",
    type: "article",
  },
  "/faqs": {
    title: "Frequently Asked Questions — PawaMore Systems",
    description:
      "Answers to common questions about pricing, sizing, battery lifespan, delivery, and support.",
    image: "/favicon.png",
    type: "website",
  },
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export default function handler(req, res) {
  const rawPath = typeof req.query.path === "string" ? req.query.path : "";
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const page = PAGE_PREVIEWS[path];

  const host = req.headers.host || "pawamore.vercel.app";
  const protocol =
    req.headers["x-forwarded-proto"] ||
    (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
  const appUrl = `${protocol}://${host}`;

  if (!page) {
    res.statusCode = 302;
    res.setHeader("Location", `${appUrl}${path}`);
    res.end();
    return;
  }

  const canonicalUrl = `${appUrl}${path}`;
  const image = page.image.startsWith("http") ? page.image : `${appUrl}${page.image}`;

  const html = `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <meta property="og:type" content="${escapeHtml(page.type)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(page.title)}">
  <meta property="og:site_name" content="PawaMore Systems">
  <meta property="og:locale" content="en_NG">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(page.title)}">
  <meta name="twitter:description" content="${escapeHtml(page.description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <meta http-equiv="refresh" content="0;url=${escapeHtml(canonicalUrl)}">
</head>
<body>
  <p>Redirecting to PawaMore...</p>
  <script>window.location.href="${escapeHtml(canonicalUrl)}";</script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.status(200).send(html);
}
