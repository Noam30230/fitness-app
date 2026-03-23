import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get("profile_id");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  let query = supabase
    .from("workout_logs")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);

  if (profileId) query = query.eq("profile_id", profileId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await req.json();

  const payload = {
    profile_id: body.profile_id,
    date: body.date,
    duration_minutes: body.duration_minutes,
    category: body.category ?? null,
    exercises_done: body.exercises_done ?? null,
    note: body.note ?? null,
  };

  const { data, error } = await supabase
    .from("workout_logs")
    .insert(payload)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase.from("workout_logs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
