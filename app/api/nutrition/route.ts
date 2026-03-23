import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { format, subDays } from "date-fns";

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get("profile_id");
  const date = searchParams.get("date");
  const days = parseInt(searchParams.get("days") ?? "0");

  let query = supabase
    .from("nutrition_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (profileId) query = query.eq("profile_id", profileId);

  if (date) {
    query = query.eq("date", date);
  } else if (days > 0) {
    const from = format(subDays(new Date(), days - 1), "yyyy-MM-dd");
    query = query.gte("date", from);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await req.json();

  // Support batch insert (array)
  const items = Array.isArray(body) ? body : [body];
  const payloads = items.map((item) => ({
    profile_id: item.profile_id,
    date: item.date,
    meal_name: item.meal_name,
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
    quantity_g: item.quantity_g ?? null,
    source: item.source ?? "natural",
    is_approximate: item.is_approximate ?? false,
  }));

  const { data, error } = await supabase
    .from("nutrition_logs")
    .insert(payloads)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase.from("nutrition_logs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
