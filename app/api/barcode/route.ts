import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const barcode = searchParams.get("barcode");

  if (!barcode) {
    return NextResponse.json({ error: "barcode required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}?fields=product_name,nutriments`,
      {
        headers: { "User-Agent": "FitTrack/1.0 (contact@fittrack.app)" },
        next: { revalidate: 86400 }, // cache 24h
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    const json = await res.json();

    if (json.status !== 1 || !json.product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    const { product } = json;
    const n = product.nutriments ?? {};

    const result = {
      name: product.product_name || "Produit inconnu",
      calories_per_100g: Math.round(n["energy-kcal_100g"] ?? n["energy-kcal"] ?? 0),
      protein_per_100g: Math.round((n.proteins_100g ?? 0) * 10) / 10,
      carbs_per_100g: Math.round((n.carbohydrates_100g ?? 0) * 10) / 10,
      fat_per_100g: Math.round((n.fat_100g ?? 0) * 10) / 10,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("OpenFoodFacts error:", err);
    return NextResponse.json({ error: "Erreur réseau" }, { status: 502 });
  }
}
