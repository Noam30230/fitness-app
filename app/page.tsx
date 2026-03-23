"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Flame, Dumbbell, TrendingUp, Target } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useProfile } from "@/components/ProfileContext";
import ProfileSelector from "@/components/ProfileSelector";
import CalorieRing from "@/components/CalorieRing";
import MacroBars from "@/components/MacroBar";
import { calculateDailyTarget } from "@/lib/nutrition";
import type { WorkoutLog, NutritionLog } from "@/lib/types";

export default function DashboardPage() {
  const { activeProfile, isLoading } = useProfile();
  const router = useRouter();

  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [nutritionToday, setNutritionToday] = useState<NutritionLog[]>([]);
  const [nutrition7d, setNutrition7d] = useState<NutritionLog[]>([]);

  const today = format(new Date(), "yyyy-MM-dd");

  const fetchData = useCallback(async () => {
    if (!activeProfile) return;
    const [wRes, nTodayRes, n7dRes] = await Promise.all([
      fetch(`/api/workout?profile_id=${activeProfile.id}&limit=50`),
      fetch(`/api/nutrition?profile_id=${activeProfile.id}&date=${today}`),
      fetch(`/api/nutrition?profile_id=${activeProfile.id}&days=7`),
    ]);
    if (wRes.ok) setWorkouts(await wRes.json());
    if (nTodayRes.ok) setNutritionToday(await nTodayRes.json());
    if (n7dRes.ok) setNutrition7d(await n7dRes.json());
  }, [activeProfile, today]);

  useEffect(() => {
    if (!isLoading && !activeProfile) {
      router.push("/onboarding");
      return;
    }
    fetchData();
  }, [isLoading, activeProfile, router, fetchData]);

  if (isLoading) return <LoadingScreen />;
  if (!activeProfile) return null;

  const dailyTarget = calculateDailyTarget(activeProfile);

  // Nutrition today
  const todayCalories = nutritionToday.reduce((s, l) => s + l.calories, 0);
  const todayProtein = nutritionToday.reduce((s, l) => s + l.protein, 0);
  const todayCarbs = nutritionToday.reduce((s, l) => s + l.carbs, 0);
  const todayFat = nutritionToday.reduce((s, l) => s + l.fat, 0);
  const targetProtein = Math.round((dailyTarget * 0.3) / 4);
  const targetCarbs = Math.round((dailyTarget * 0.45) / 4);
  const targetFat = Math.round((dailyTarget * 0.25) / 9);

  // Sport stats
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const monthStart = startOfMonth(new Date());
  const sessionsThisWeek = workouts.filter((w) => new Date(w.date) >= weekStart).length;
  const sessionsThisMonth = workouts.filter((w) => new Date(w.date) >= monthStart).length;
  const lastSession = workouts[0];

  // Streak
  const streak = computeStreak(workouts, activeProfile.streak_target);

  // 4 weeks bar data
  const weeklyData = getWeeklyWorkoutData(workouts);

  // 7 days nutrition
  const daily7d = get7DayNutrition(nutrition7d, dailyTarget);
  const daysOnTarget = daily7d.filter((d) => d.calories >= dailyTarget * 0.9 && d.calories <= dailyTarget * 1.1).length;
  const avgCalories7d = Math.round(
    daily7d.filter(d => d.calories > 0).reduce((s, d) => s + d.calories, 0) /
      (daily7d.filter(d => d.calories > 0).length || 1)
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Bonjour, {activeProfile.name.split(" ")[0]} 👋
            </h1>
            <p className="text-[#888888] text-sm capitalize">
              {format(new Date(), "EEEE d MMMM", { locale: fr })}
            </p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 bg-[#F5C400]/10 border border-[#F5C400]/30 px-3 py-1.5 rounded-full">
              <Flame size={16} className="text-[#F5C400]" />
              <span className="text-sm font-bold text-[#F5C400]">{streak}</span>
            </div>
          )}
        </div>
        <ProfileSelector />
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Sport card */}
        <div className="bg-[#141414] rounded-card border border-[#2A2A2A] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Dumbbell size={18} className="text-[#F5C400]" />
              <h2 className="text-base font-semibold text-white">Sport</h2>
            </div>
            <div className="flex gap-3 text-sm">
              <span className="text-[#888888]">
                Semaine: <span className="text-white font-semibold">{sessionsThisWeek}</span>
              </span>
              <span className="text-[#888888]">
                Mois: <span className="text-white font-semibold">{sessionsThisMonth}</span>
              </span>
            </div>
          </div>

          {lastSession && (
            <div className="bg-[#1C1C1C] rounded-xl p-3 mb-3 border border-[#2A2A2A]">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#888888]">Dernière séance</span>
                <span className="text-xs text-[#888888]">
                  {format(new Date(lastSession.date), "d MMM", { locale: fr })}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold text-white">
                  {lastSession.category ?? "Entraînement"}
                </span>
                <span className="text-xs text-[#888888]">• {lastSession.duration_minutes} min</span>
              </div>
            </div>
          )}

          {/* 4 weeks chart */}
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "#1C1C1C", border: "1px solid #2A2A2A", borderRadius: 8 }}
                  labelStyle={{ color: "#888" }}
                  itemStyle={{ color: "#F5C400" }}
                  formatter={(v: number) => [`${v} séance${v > 1 ? "s" : ""}`, ""]}
                />
                <Bar dataKey="sessions" fill="#F5C400" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nutrition card */}
        <div className="bg-[#141414] rounded-card border border-[#2A2A2A] p-4">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-[#F5C400]" />
            <h2 className="text-base font-semibold text-white">Nutrition</h2>
            <span className="ml-auto text-xs text-[#888888]">
              Obj: <span className="text-white font-semibold">{dailyTarget} kcal</span>
            </span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <CalorieRing consumed={todayCalories} target={dailyTarget} size={140} />
            <div className="flex-1">
              <MacroBars
                protein={Math.round(todayProtein)}
                carbs={Math.round(todayCarbs)}
                fat={Math.round(todayFat)}
                targetProtein={targetProtein}
                targetCarbs={targetCarbs}
                targetFat={targetFat}
              />
            </div>
          </div>

          {/* 7-day stats */}
          <div className="flex gap-3 mb-3">
            <StatPill label="Moy. 7j" value={`${avgCalories7d} kcal`} />
            <StatPill label="Jours OK" value={`${daysOnTarget}/7`} color="#22C55E" />
          </div>

          {/* 7-day chart */}
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily7d} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#888", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "#1C1C1C", border: "1px solid #2A2A2A", borderRadius: 8 }}
                  labelStyle={{ color: "#888" }}
                  itemStyle={{ color: "#F5C400" }}
                  formatter={(v: number) => [`${v} kcal`, ""]}
                />
                <Bar dataKey="calories" radius={[4, 4, 0, 0]}
                  fill="#F5C400"
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Target line hint */}
          <div className="flex items-center gap-2 mt-1">
            <div className="w-4 h-0.5 border-t-2 border-dashed border-[#888888]" />
            <span className="text-xs text-[#888888]">Objectif {dailyTarget} kcal</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-[#141414] rounded-card border border-[#2A2A2A] p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-[#F5C400]" />
            <h2 className="text-base font-semibold text-white">Aperçu</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Objectif journalier" value={`${dailyTarget} kcal`} />
            <StatCard label="Streak semaines" value={`${streak} sem.`} icon={<Flame size={16} className="text-[#F5C400]" />} />
            <StatCard label="Séances ce mois" value={`${sessionsThisMonth}`} />
            <StatCard label="Jours nutrition OK" value={`${daysOnTarget}/7`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, color = "#F5C400" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex-1 bg-[#1C1C1C] rounded-xl p-3 border border-[#2A2A2A] text-center">
      <div className="text-xs text-[#888888]">{label}</div>
      <div className="text-sm font-bold mt-0.5" style={{ color }}>{value}</div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-[#1C1C1C] rounded-xl p-3 border border-[#2A2A2A]">
      <div className="text-xs text-[#888888] mb-1">{label}</div>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-base font-bold text-white">{value}</span>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-2 border-[#F5C400] border-t-transparent rounded-full animate-spin" />
        <span className="text-[#888888] text-sm">Chargement...</span>
      </div>
    </div>
  );
}

function computeStreak(workouts: WorkoutLog[], weeklyTarget: number): number {
  if (workouts.length === 0) return 0;
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  let streak = 0;
  let currentWeekStart = weekStart;
  for (let i = 0; i < 52; i++) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const count = workouts.filter((w) => {
      const d = new Date(w.date);
      return d >= currentWeekStart && d < weekEnd;
    }).length;
    if (count >= weeklyTarget) {
      streak++;
    } else if (i > 0) {
      break;
    }
    currentWeekStart = new Date(currentWeekStart);
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  }
  return streak;
}

function getWeeklyWorkoutData(workouts: WorkoutLog[]) {
  const weeks = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = startOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 });
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const sessions = workouts.filter((w) => {
      const d = new Date(w.date);
      return d >= weekStart && d < weekEnd;
    }).length;
    weeks.push({
      week: `S${format(weekStart, "w")}`,
      sessions,
    });
  }
  return weeks;
}

function get7DayNutrition(logs: NutritionLog[], target: number) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");
    const dayLogs = logs.filter((l) => l.date === date);
    const calories = dayLogs.reduce((s, l) => s + l.calories, 0);
    days.push({
      day: format(subDays(new Date(), i), "EEE", { locale: fr }),
      date,
      calories,
      target,
    });
  }
  return days;
}
