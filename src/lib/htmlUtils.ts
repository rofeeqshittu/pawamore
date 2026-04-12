export function decodeHtmlEntities(input: string) {
  if (!input) return input;
  // Use DOMParser in browser to decode HTML entities
  try {
    const doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent || "";
  } catch (err) {
    // Fallback
    return input.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  }
}

export function stripHtml(input: string) {
  if (!input) return input;
  // Decode entities first
  const decoded = decodeHtmlEntities(input);
  // Remove any tags
  return decoded.replace(/<[^>]*>/g, "").trim();
}
