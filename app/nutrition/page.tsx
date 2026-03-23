"use client";

import { useState, useEffect, useCallback } from "react";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  PlusCircle,
  X,
  Trash2,
  Scan,
  MessageSquare,
  Star,
  Check,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import { useProfile } from "@/components/ProfileContext";
import CalorieRing from "@/components/CalorieRing";
import MacroBars from "@/components/MacroBar";
import BarcodeScanner from "@/components/BarcodeScanner";
import NaturalLanguageLog from "@/components/NaturalLanguageLog";
import { calculateDailyTarget } from "@/lib/nutrition";
import type { NutritionLog, SavedMeal } from "@/lib/types";

type AddMode = "scan" | "natural" | "saved";

export default function NutritionPage() {
  const { activeProfile } = useProfile();
  const [showSheet, setShowSheet] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>("scan");
  const [todayLogs, setTodayLogs] = useState<NutritionLog[]>([]);
  const [logs7d, setLogs7d] = useState<NutritionLog[]>([]);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [loading, setLoading] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");

  const fetchData = useCallback(async () => {
    if (!activeProfile) return;
    const [todayRes, weekRes, savedRes] = await Promise.all([
      fetch(`/api/nutrition?profile_id=${activeProfile.id}&date=${today}`),
      fetch(`/api/nutrition?profile_id=${activeProfile.id}&days=7`),
      fetch(`/api/saved-meals?profile_id=${activeProfile.id}`),
    ]);
    if (todayRes.ok) setTodayLogs(await todayRes.json());
    if (weekRes.ok) setLogs7d(await weekRes.json());
    if (savedRes.ok) setSavedMeals(await savedRes.json());
  }, [activeProfile, today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!activeProfile) return null;

  const dailyTarget = calculateDailyTarget(activeProfile);
  const targetProtein = Math.round((dailyTarget * 0.3) / 4);
  const targetCarbs = Math.round((dailyTarget * 0.45) / 4);
  const targetFat = Math.round((dailyTarget * 0.25) / 9);

  const todayCalories = todayLogs.reduce((s, l) => s + l.calories, 0);
  const todayProtein = Math.round(todayLogs.reduce((s, l) => s + l.protein, 0));
  const todayCarbs = Math.round(todayLogs.reduce((s, l) => s + l.carbs, 0));
  const todayFat = Math.round(todayLogs.reduce((s, l) => s + l.fat, 0));

  // 7-day chart data
  const daily7d = [];
  for (let i = 6; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");
    const dayLogs = logs7d.filter((l) => l.date === date);
    daily7d.push({
      day: format(subDays(new Date(), i), "EEE", { locale: fr }),
      calories: dayLogs.reduce((s, l) => s + l.calories, 0),
    });
  }

  const daysOnTarget = daily7d.filter(
    (d) => d.calories >= dailyTarget * 0.9 && d.calories <= dailyTarget * 1.1
  ).length;
  const avgCal7d = Math.round(
    daily7d.filter(d => d.calories > 0).reduce((s, d) => s + d.calories, 0) /
      (daily7d.filter(d => d.calories > 0).length || 1)
  );

  const handleDelete = async (id: string) => {
    await fetch(`/api/nutrition?id=${id}`, { method: "DELETE" });
    await fetchData();
  };

  const addNutritionLog = async (items: {
    meal_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    quantity_g?: number;
    source: "barcode" | "natural" | "saved";
    is_approximate?: boolean;
  }[]) => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      const payloads = items.map((item) => ({
        ...item,
        profile_id: activeProfile.id,
        date: today,
      }));
      await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloads),
      });
      await fetchData();
      setShowSheet(false);
    } finally {
      setLoading(false);
    }
  };

  const logSavedMeal = async (meal: SavedMeal) => {
    await addNutritionLog([{
      meal_name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      source: "saved",
    }]);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Nutrition</h1>
          <p className="text-[#888888] text-sm capitalize">
            {format(new Date(), "EEEE d MMMM", { locale: fr })}
          </p>
        </div>
        <button
          onClick={() => setShowSheet(true)}
          className="bg-[#F5C400] text-black p-2.5 rounded-xl"
        >
          <PlusCircle size={22} />
        </button>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Calorie ring + macros */}
        <div className="bg-[#141414] rounded-card border border-[#2A2A2A] p-4">
          <div className="flex items-center gap-4 mb-4">
            <CalorieRing consumed={todayCalories} target={dailyTarget} size={150} />
            <div className="flex-1">
              <MacroBars
                protein={todayProtein}
                carbs={todayCarbs}
                fat={todayFat}
                targetProtein={targetProtein}
                targetCarbs={targetCarbs}
                targetFat={targetFat}
              />
            </div>
          </div>
          <div className="flex gap-2 text-xs text-[#888888] justify-center">
            <span>Restant: <span className="text-white font-semibold">{Math.max(0, dailyTarget - todayCalories)} kcal</span></span>
            <span>•</span>
            <span>Objectif: <span className="text-white font-semibold">{dailyTarget} kcal</span></span>
          </div>
        </div>

        {/* Today's meals */}
        <div className="bg-[#141414] rounded-card border border-[#2A2A2A] p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Repas du jour</h3>
          {todayLogs.length === 0 ? (
            <p className="text-[#888888] text-sm text-center py-4">Aucun repas enregistré aujourd&apos;hui</p>
          ) : (
            <div className="flex flex-col gap-2">
              {todayLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between bg-[#1C1C1C] rounded-xl p-3 border border-[#2A2A2A]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white truncate">{log.meal_name}</span>
                      {log.is_approximate && (
                        <span className="text-[9px] bg-[#F5C400]/20 text-[#F5C400] px-1.5 py-0.5 rounded-full flex-shrink-0">~</span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-xs text-[#F5C400] font-semibold">{log.calories} kcal</span>
                      <span className="text-xs text-[#888888]">P:{log.protein}g G:{log.carbs}g L:{log.fat}g</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="p-1.5 text-[#888888] hover:text-red-400 flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 7-day chart */}
        <div className="bg-[#141414] rounded-card border border-[#2A2A2A] p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-white">7 derniers jours</h3>
            <div className="flex gap-3 text-xs text-[#888888]">
              <span>Moy: <span className="text-white font-semibold">{avgCal7d} kcal</span></span>
              <span>OK: <span className="text-[#22C55E] font-semibold">{daysOnTarget}/7</span></span>
            </div>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily7d} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#888", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, Math.max(dailyTarget * 1.3, ...daily7d.map(d => d.calories))]} />
                <Tooltip
                  contentStyle={{ background: "#1C1C1C", border: "1px solid #2A2A2A", borderRadius: 8 }}
                  itemStyle={{ color: "#F5C400" }}
                  formatter={(v: number) => [`${v} kcal`, ""]}
                />
                <ReferenceLine y={dailyTarget} stroke="#F5C400" strokeDasharray="4 4" strokeOpacity={0.5} />
                <Bar dataKey="calories" fill="#F5C400" radius={[4, 4, 0, 0]} opacity={0.9} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly summary */}
        <div className="bg-[#141414] rounded-card border border-[#2A2A2A] p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Bilan hebdomadaire</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#1C1C1C] rounded-xl p-3 border border-[#2A2A2A]">
              <div className="text-lg font-bold text-white">{avgCal7d}</div>
              <div className="text-xs text-[#888888]">Moy. kcal/j</div>
            </div>
            <div className="bg-[#1C1C1C] rounded-xl p-3 border border-[#2A2A2A]">
              <div className="text-lg font-bold text-[#22C55E]">{daysOnTarget}</div>
              <div className="text-xs text-[#888888]">Jours OK</div>
            </div>
            <div className="bg-[#1C1C1C] rounded-xl p-3 border border-[#2A2A2A]">
              <div className="text-lg font-bold text-[#F5C400]">{dailyTarget}</div>
              <div className="text-xs text-[#888888]">Objectif</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      {showSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSheet(false)} />
          <div className="relative bg-[#141414] rounded-t-3xl border-t border-[#2A2A2A] slide-up max-h-[90vh] flex flex-col">
            <div className="p-5 pb-0 flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Ajouter un repas</h2>
              <button onClick={() => setShowSheet(false)} className="text-[#888888]">
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-4">
            {/* Mode tabs */}
            <div className="flex gap-2 mb-5">
              {([
                { mode: "scan" as AddMode, icon: Scan, label: "Scan" },
                { mode: "natural" as AddMode, icon: MessageSquare, label: "Texte" },
                { mode: "saved" as AddMode, icon: Star, label: "Favoris" },
              ]).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setAddMode(mode)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    addMode === mode
                      ? "bg-[#F5C400] text-black"
                      : "bg-[#1C1C1C] text-[#888888] border border-[#2A2A2A]"
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* Scan mode */}
            {addMode === "scan" && (
              <BarcodeScanner
                onResult={(product, quantity_g) => {
                  addNutritionLog([{
                    meal_name: product.name,
                    calories: Math.round(product.calories_per_100g * quantity_g / 100),
                    protein: Math.round(product.protein_per_100g * quantity_g / 10) / 10,
                    carbs: Math.round(product.carbs_per_100g * quantity_g / 10) / 10,
                    fat: Math.round(product.fat_per_100g * quantity_g / 10) / 10,
                    quantity_g,
                    source: "barcode",
                  }]);
                }}
              />
            )}

            {/* Natural language mode */}
            {addMode === "natural" && (
              <NaturalLanguageLog
                onResult={(items) => {
                  addNutritionLog(items.map((item) => ({
                    meal_name: item.name,
                    calories: item.calories,
                    protein: item.protein,
                    carbs: item.carbs,
                    fat: item.fat,
                    quantity_g: item.quantity_g,
                    source: "natural",
                    is_approximate: true,
                  })));
                }}
              />
            )}

            {/* Saved meals */}
            {addMode === "saved" && (
              <div className="flex flex-col gap-3">
                {savedMeals.length === 0 ? (
                  <p className="text-[#888888] text-sm text-center py-6">
                    Aucun repas favori. Enregistrez des repas depuis le scan ou le texte.
                  </p>
                ) : (
                  savedMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between bg-[#1C1C1C] rounded-xl p-4 border border-[#2A2A2A]"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">{meal.name}</div>
                        <div className="text-xs text-[#888888] mt-0.5">
                          {meal.calories} kcal • P:{meal.protein}g G:{meal.carbs}g L:{meal.fat}g
                        </div>
                      </div>
                      <button
                        onClick={() => logSavedMeal(meal)}
                        disabled={loading}
                        className="bg-[#F5C400] text-black p-2 rounded-xl"
                      >
                        <Check size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
