import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await req.json();

  const payload = {
    name: body.name,
    gender: body.gender,
    age: body.age,
    weight: body.weight,
    height: body.height,
    activity_level: body.activity_level,
    goal: body.goal,
    calorie_adjustment: body.calorie_adjustment ?? 0,
    workout_mode: body.workout_mode ?? "category",
    streak_target: body.streak_target ?? 3,
    exercise_list: body.exercise_list ?? [],
    workout_cal_per_hour: body.workout_cal_per_hour ?? 300,
  };

  const { data, error } = await supabase
    .from("profiles")
    .insert(payload)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
