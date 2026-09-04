import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { Brand, Product } from "@/lib/data";

export const runtime = "nodejs";

/**
 * POST /api/search  { q, brands, products }
 * Turns a natural-language "how I'm feeling" query into a structured intent
 * using Claude, then ranks the catalogue the client sent. If no API key is
 * configured the route returns { ok: false } and the client falls back to the
 * local heuristic engine in src/lib/catalog.ts.
 */
type Intent = { summary: string; moods: string[]; styles: string[]; categories: string[]; materials: string[]; values: string[]; maxPrice: number | null; brandSlugs: string[]; productSlugs: string[] };

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ ok: false, reason: "no-key" }, { status: 200 });
  const { q, brands, products } = (await req.json()) as { q: string; brands: Brand[]; products: Product[] };
  if (!q?.trim()) return NextResponse.json({ ok: false, reason: "empty" });

  const client = new Anthropic();
  const catalogue = brands.map((b) => ({ slug: b.slug, name: b.name, where: `${b.city}, ${b.country}`, styles: b.styles, moods: b.moods, categories: b.categories, materials: b.materials, values: b.values, priceBand: b.priceBand, products: products.filter((p) => p.brand === b.slug).map((p) => ({ slug: p.slug, name: p.name, price: p.price, category: p.category, tags: p.tags ?? [] })) }));

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 2000,
      output_config: { effort: "low", format: { type: "json_schema", schema: {
        type: "object", additionalProperties: false,
        required: ["summary", "moods", "styles", "categories", "materials", "values", "maxPrice", "brandSlugs", "productSlugs"],
        properties: {
          summary: { type: "string" }, moods: { type: "array", items: { type: "string" } }, styles: { type: "array", items: { type: "string" } },
          categories: { type: "array", items: { type: "string" } }, materials: { type: "array", items: { type: "string" } }, values: { type: "array", items: { type: "string" } },
          maxPrice: { type: ["number", "null"] }, brandSlugs: { type: "array", items: { type: "string" } }, productSlugs: { type: "array", items: { type: "string" } },
        } } } },
      system: [{ type: "text", text: "You are the search engine for Kindred, a marketplace of independent clothing brands. A shopper types how they feel or what they are doing, not a SKU. Read the catalogue (brand onboarding facts + products) and return: a one-sentence summary of what they want, the moods/styles/categories/materials/values that match, a maxPrice if they mention one, and the best matching brand slugs (up to 6) and product slugs (up to 10) ranked best first. Only use slugs that exist in the catalogue.", cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: `Catalogue:\n${JSON.stringify(catalogue)}\n\nShopper typed: "${q}"` }],
    });
    if (response.stop_reason === "refusal") return NextResponse.json({ ok: false, reason: "refusal" });
    const text = response.content.find((b) => b.type === "text")?.text ?? "{}";
    const intent = JSON.parse(text) as Intent;
    return NextResponse.json({ ok: true, intent });
  } catch (err) {
    const msg = err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : String(err);
    return NextResponse.json({ ok: false, reason: msg });
  }
}
