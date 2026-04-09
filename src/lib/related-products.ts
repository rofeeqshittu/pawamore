export interface RelatedProductSource {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  price: number;
  discount_price: number | null;
  ideal_for: string | null;
  powers: string | null;
  specs: unknown;
  stock_quantity: number | null;
  is_featured?: boolean | null;
  is_popular?: boolean | null;
  product_images: { image_url: string; is_primary: boolean }[] | null;
  product_categories: { name: string; slug: string } | null;
  brands: { name: string; slug: string } | null;
}

export interface RelatedProduct extends RelatedProductSource {
  suggestionReason: string;
  suggestionScore: number;
}

type ProductKind = "all-in-one" | "inverter" | "battery" | "panel" | "general";

const includesAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term));

const normalize = (value: string | null | undefined) => (value || "").toLowerCase();

const kindOf = (product: RelatedProductSource): ProductKind => {
  const text = [
    product.name,
    product.short_description ?? "",
    product.ideal_for ?? "",
    product.powers ?? "",
    product.product_categories?.name ?? "",
    product.product_categories?.slug ?? "",
    JSON.stringify(product.specs ?? {}),
  ]
    .join(" ")
    .toLowerCase();

  if (includesAny(text, ["solar generator", "power station", "all-in-one", "iess"])) return "all-in-one";
  if (includesAny(text, ["inverter", "hybrid", "kva"])) return "inverter";
  if (includesAny(text, ["battery", "lifepo4", "kwh", "ah"])) return "battery";
  if (includesAny(text, ["panel", "pv", "mono", "solar module"])) return "panel";
  return "general";
};

const complementaryKinds: Record<ProductKind, ProductKind[]> = {
  "all-in-one": ["panel", "battery"],
  inverter: ["battery", "panel"],
  battery: ["inverter", "panel"],
  panel: ["inverter", "battery", "all-in-one"],
  general: ["general"],
};

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 4);

const overlapScore = (aText: string, bText: string): number => {
  const a = new Set(tokenize(aText));
  const b = new Set(tokenize(bText));
  if (a.size === 0 || b.size === 0) return 0;
  let overlap = 0;
  for (const token of a) {
    if (b.has(token)) overlap += 1;
  }
  return Math.min(3, overlap * 0.4);
};

export function getRelatedProducts(
  current: RelatedProductSource,
  candidates: RelatedProductSource[],
  limit = 2
): RelatedProduct[] {
  const currentKind = kindOf(current);
  const currentPrice = Number(current.discount_price ?? current.price ?? 0);
  const currentText = [
    current.name,
    current.short_description ?? "",
    current.ideal_for ?? "",
    current.powers ?? "",
    current.product_categories?.name ?? "",
    JSON.stringify(current.specs ?? {}),
  ].join(" ");

  const scored = candidates
    .filter((candidate) => candidate.id !== current.id && candidate.slug !== current.slug)
    .map((candidate) => {
      const reasons: string[] = [];
      let score = 0;

      if (candidate.stock_quantity === null || candidate.stock_quantity > 0) {
        score += 1.8;
      }

      if (current.product_categories?.slug && candidate.product_categories?.slug === current.product_categories.slug) {
        score += 4.5;
        reasons.push("same category");
      }

      if (current.brands?.slug && candidate.brands?.slug === current.brands.slug) {
        score += 2.8;
        reasons.push("same brand");
      }

      const candidateKind = kindOf(candidate);
      if (complementaryKinds[currentKind].includes(candidateKind)) {
        score += 3.2;
        reasons.push("good add-on");
      }

      if (candidate.is_featured) score += 0.8;
      if (candidate.is_popular) score += 0.7;

      const candidatePrice = Number(candidate.discount_price ?? candidate.price ?? 0);
      if (currentPrice > 0 && candidatePrice > 0) {
        const delta = Math.abs(candidatePrice - currentPrice) / currentPrice;
        if (delta <= 0.4) {
          score += 1;
          reasons.push("similar budget band");
        }
      }

      const candidateText = [
        candidate.name,
        candidate.short_description ?? "",
        candidate.ideal_for ?? "",
        candidate.powers ?? "",
        candidate.product_categories?.name ?? "",
        JSON.stringify(candidate.specs ?? {}),
      ].join(" ");
      score += overlapScore(currentText, candidateText);

      const reason =
        candidateKind === "panel" && currentKind !== "panel"
          ? "Smart panel add-on to complete your setup."
          : candidateKind === "battery" && currentKind !== "battery"
            ? "Useful battery upgrade for longer backup hours."
            : candidateKind === "inverter" && currentKind !== "inverter"
              ? "Strong inverter companion for stable power delivery."
              : reasons.includes("same category")
                ? "Closest alternative in the same product class."
                : reasons.includes("same brand")
                  ? "Same-brand option with similar performance profile."
                  : "Good fit based on specs, use-case, and availability.";

      return {
        ...candidate,
        suggestionScore: score,
        suggestionReason: reason,
      } satisfies RelatedProduct;
    })
    .sort((a, b) => b.suggestionScore - a.suggestionScore);

  return scored.slice(0, limit);
}
