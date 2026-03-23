"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfWeek, startOfMonth, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  PlusCircle,
  Dumbbell,
  Clock,
  AlertTriangle,
  Flame,
  X,
  ChevronRight,
  Trash2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { useProfile } from "@/components/ProfileContext";
import type { WorkoutLog, WorkoutCategory } from "@/lib/types";

const CATEGORIES: WorkoutCategory[] = ["Push", "Pull", "Legs", "Cardio", "Full Body", "Autre"];
const CATEGORY_COLORS: Record<string, string> = {
  Push: "#F5C400",
  Pull: "#3B82F6",
  Legs: "#22C55E",
  Cardio: "#EF4444",
  "Full Body": "#A855F7",
  Autre: "#888888",
};

export default function SportPage() {
  const { activeProfile } = useProfile();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [showSheet, setShowSheet] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [duration, setDuration] = useState(60);
  const [category, setCategory] = useState<WorkoutCategory>("Push");
  const [exercisesDone, setExercisesDone] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const fetchWorkouts = useCallback(async () => {
    if (!activeProfile) return;
    const res = await fetch(`/api/workout?profile_id=${activeProfile.id}&limit=100`);
    if (res.ok) setWorkouts(await res.json());
  }, [activeProfile]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const handleSubmit = async () => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      const payload = {
        profile_id: activeProfile.id,
        date,
        duration_minutes: duration,
        ...(activeProfile.workout_mode === "category"
          ? { category }
          : { exercises_done: exercisesDone }),
        note: note || null,
      };
      const res = await fetch("/api/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchWorkouts();
        setShowSheet(false);
        setNote("");
        setExercisesDone([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/workout?id=${id}`, { method: "DELETE" });
    await fetchWorkouts();
  };

  if (!activeProfile) return null;

  // Stats
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const monthStart = startOfMonth(new Date());
  const thisWeek = workouts.filter((w) => new Date(w.date) >= weekStart);
  const thisMonth = workouts.filter((w) => new Date(w.date) >= monthStart);
  const totalDuration = thisMonth.reduce((s, w) => s + w.duration_minutes, 0);

  // Category breakdown (mode A)
  const categoryBreakdown = thisMonth.reduce((acc, w) => {
    if (w.category) acc[w.category] = (acc[w.category] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(categoryBreakdown).map(([name, value]) => ({ name, value }));

  // Push/Pull balance
  const pushCount = categoryBreakdown["Push"] ?? 0;
  const pullCount = categoryBreakdown["Pull"] ?? 0;
  const imbalanced = pushCount > 0 && pullCount > 0 && Math.abs(pushCount - pullCount) > 2;

  // Exercise frequency (mode B)
  const exerciseFrequency: Record<string, string> = {};
  if (activeProfile.workout_mode === "exercises") {
    for (const ex of activeProfile.exercise_list) {
      const lastLog = workouts.find((w) => w.exercises_done?.includes(ex));
      exerciseFrequency[ex] = lastLog ? lastLog.date : "jamais";
    }
  }
  const neglected = activeProfile.exercise_list.filter((ex) => {
    const last = exerciseFrequency[ex];
    if (last === "jamais") return true;
    const daysSince = (new Date().getTime() - new Date(last).getTime()) / 86400000;
    return daysSince > 14;
  });

  // Streak
  let streak = 0;
  let cur = startOfWeek(new Date(), { weekStartsOn: 1 });
  for (let i = 0; i < 52; i++) {
    const end = new Date(cur);
    end.setDate(end.getDate() + 7);
    const count = workouts.filter((w) => {
      const d = new Date(w.date);
      return d >= cur && d < end;
    }).length;
    if (count >= activeProfile.streak_target) {
      streak++;
    } else if (i > 0) break;
    cur = new Date(cur);
    cur.setDate(cur.getDate() - 7);
  }

  // Weekly data for chart
  const weeklyData = [];
  for (let i = 3; i >= 0; i--) {
    const ws = startOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 });
    const we = new Date(ws);
    we.setDate(we.getDate() + 7);
    const sessions = workouts.filter((w) => {
      const d = new Date(w.date);
      return d >= ws && d < we;
    }).length;
    weeklyData.push({ week: `S${format(ws, "w")}`, sessions });
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sport</h1>
          <p className="text-[#888888] text-sm">
            {thisWeek.length} séance{thisWeek.length !== 1 ? "s" : ""} cette semaine
          </p>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1 bg-[#F5C400]/10 border border-[#F5C400]/30 px-3 py-1.5 rounded-full">
              <Flame size={14} className="text-[#F5C400]" />
              <span className="text-sm font-bold text-[#F5C400]">{streak} sem.</span>
            </div>
          )}
          <button
            onClick={() => setShowSheet(true)}
            className="bg-[#F5C400] text-black p-2.5 rounded-xl"
          >
            <PlusCircle size={22} />
          </button>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <QuickStat label="Cette semaine" value={`${thisWeek.length}`} unit="séances" />
          <QuickStat label="Ce mois" value={`${thisMonth.length}`} unit="séances" />
          <QuickStat label="Durée totale" value={`${Math.round(totalDuration / 60)}h${totalDuration % 60}m`} unit="ce mois" />
        </div>

        {/* Alerts */}
        {imbalanced && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
            <p className="text-orange-300 text-sm">
              Déséquilibre Push/Pull : {pushCount} Push vs {pullCount} Pull ce mois.
            </p>
          </div>
        )}

        {neglected.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
            <p className="text-blue-300 text-sm font-semibold mb-1">
              Exercices délaissés (+14j)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {neglected.map((ex) => (
                <span key={ex} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">{ex}</span>
              ))}
            </div>
          </div>
        )}

        {/* Category chart (mode A) */}
        {activeProfile.workout_mode === "category" && pieData.length > 0 && (
          <div className="bg-[#141414] rounded-card border border-[#2A2A2A] p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Répartition ce mois</h3>
            <div className="flex items-center gap-4">
              <div className="h-32 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={55} strokeWidth={0}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? "#888"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#1C1C1C", border: "1px solid #2A2A2A", borderRadius: 8 }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[entry.name] ?? "#888" }} />
                    <span className="text-xs text-[#888888]">{entry.name}</span>
                    <span className="text-xs font-semibold text-white ml-auto">{entry.value}x</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Weekly trend */}
        <div className="bg-[#141414] rounded-card border border-[#2A2A2A] p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Tendance 4 semaines</h3>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "#1C1C1C", border: "1px solid #2A2A2A", borderRadius: 8 }}
                  itemStyle={{ color: "#F5C400" }}
                  formatter={(v: number) => [`${v} séance${v > 1 ? "s" : ""}`, ""]}
                />
                <Bar dataKey="sessions" fill="#F5C400" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent workouts */}
        <div className="bg-[#141414] rounded-card border border-[#2A2A2A] p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Séances récentes</h3>
          {workouts.length === 0 ? (
            <p className="text-[#888888] text-sm text-center py-4">Aucune séance enregistrée</p>
          ) : (
            <div className="flex flex-col gap-2">
              {workouts.slice(0, 10).map((w) => (
                <div key={w.id} className="flex items-center justify-between bg-[#1C1C1C] rounded-xl p-3 border border-[#2A2A2A]">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[w.category ?? "Autre"] ?? "#888" }}
                    />
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {w.category ?? (w.exercises_done?.join(", ") ?? "Entraînement")}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock size={11} className="text-[#888888]" />
                        <span className="text-xs text-[#888888]">{w.duration_minutes} min</span>
                        <span className="text-xs text-[#888888]">
                          • {format(new Date(w.date), "d MMM", { locale: fr })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="p-1.5 text-[#888888] hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {workouts.length > 10 && (
                <button className="flex items-center justify-center gap-1 text-[#888888] text-sm py-2">
                  Voir tout <ChevronRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sheet */}
      {showSheet && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSheet(false)} />
          <div className="relative bg-[#141414] rounded-t-3xl border-t border-[#2A2A2A] slide-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 pb-0">
              <h2 className="text-lg font-bold text-white">Nouvelle séance</h2>
              <button onClick={() => setShowSheet(false)} className="text-[#888888]">
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 pt-4 flex flex-col gap-4">
              {/* Date */}
              <div>
                <label className="text-xs text-[#888888] mb-2 block uppercase tracking-wide">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white focus:border-[#F5C400] outline-none"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="text-xs text-[#888888] mb-2 block uppercase tracking-wide">
                  Durée : <span className="text-white">{duration} min</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={180}
                  step={5}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-[#F5C400]"
                />
                <div className="flex justify-between text-xs text-[#555] mt-1">
                  <span>10 min</span><span>180 min</span>
                </div>
              </div>

              {/* Mode A: category */}
              {activeProfile.workout_mode === "category" && (
                <div>
                  <label className="text-xs text-[#888888] mb-2 block uppercase tracking-wide">Catégorie</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          category === c ? "text-black" : "text-[#888888] border border-[#2A2A2A] bg-[#1C1C1C]"
                        }`}
                        style={category === c ? { backgroundColor: CATEGORY_COLORS[c] } : {}}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode B: exercises */}
              {activeProfile.workout_mode === "exercises" && (
                <div>
                  <label className="text-xs text-[#888888] mb-2 block uppercase tracking-wide">Exercices réalisés</label>
                  <div className="flex flex-col gap-2">
                    {activeProfile.exercise_list.map((ex) => (
                      <label key={ex} className="flex items-center gap-3 bg-[#1C1C1C] rounded-xl px-4 py-3 border border-[#2A2A2A] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exercisesDone.includes(ex)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExercisesDone([...exercisesDone, ex]);
                            } else {
                              setExercisesDone(exercisesDone.filter((e2) => e2 !== ex));
                            }
                          }}
                          className="w-4 h-4 accent-[#F5C400]"
                        />
                        <span className="text-sm text-white">{ex}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Note */}
              <div>
                <label className="text-xs text-[#888888] mb-2 block uppercase tracking-wide">Note (optionnel)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ressenti, PR, observations..."
                  rows={2}
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#555] focus:border-[#F5C400] outline-none resize-none"
                />
              </div>

            </div>
            <div className="p-5 pt-3 border-t border-[#2A2A2A]" style={{ paddingBottom: "max(env(safe-area-inset-bottom) + 20px, 28px)" }}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#F5C400] text-black font-bold py-4 rounded-xl min-h-[52px] disabled:opacity-40"
              >
                {loading ? "Enregistrement..." : "Enregistrer la séance"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickStat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-[#141414] rounded-xl border border-[#2A2A2A] p-3 text-center">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-[10px] text-[#888888] mt-0.5 leading-tight">
        <span className="block">{unit}</span>
        <span className="block">{label}</span>
      </div>
    </div>
  );
}
