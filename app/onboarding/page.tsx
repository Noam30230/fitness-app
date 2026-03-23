"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/ProfileContext";
import { calculateDailyTarget } from "@/lib/nutrition";

const GOAL_ADJUSTMENTS: Record<string, number> = {
  maintain: 0,
  cut: -400,
  bulk: 300,
};
import type { Profile, Gender, ActivityLevel, Goal, WorkoutMode } from "@/lib/types";
import { Dumbbell } from "lucide-react";

const defaultForm = {
  name: "",
  gender: "male" as Gender,
  age: 25,
  weight: 75,
  height: 175,
  activity_level: "moderate" as ActivityLevel,
  goal: "maintain" as Goal,
  calorie_adjustment: 0,
  workout_mode: "category" as WorkoutMode,
  streak_target: 3,
  exercise_list: [] as string[],
  workout_cal_per_hour: 300,
};

export default function OnboardingPage() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [exerciseInput, setExerciseInput] = useState("");
  const router = useRouter();
  const { refreshProfiles } = useProfile();

  const mockProfile = form as unknown as Profile;
  const target = calculateDailyTarget(mockProfile);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await refreshProfiles();
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const addExercise = () => {
    const trimmed = exerciseInput.trim();
    if (trimmed && !form.exercise_list.includes(trimmed)) {
      setForm({ ...form, exercise_list: [...form.exercise_list, trimmed] });
      setExerciseInput("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center pt-12 pb-6 px-6">
        <div className="w-16 h-16 bg-[#F5C400] rounded-2xl flex items-center justify-center mb-4">
          <Dumbbell size={32} className="text-black" />
        </div>
        <h1 className="text-2xl font-bold text-white">Bienvenue sur FitTrack</h1>
        <p className="text-[#888888] text-sm mt-1 text-center">
          Crée ton profil pour commencer le suivi
        </p>
      </div>

      <div className="flex-1 px-4 pb-8 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {/* Name */}
        <Section title="Nom">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ton prénom"
            className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder:text-[#555] focus:border-[#F5C400] outline-none"
          />
        </Section>

        {/* Gender */}
        <Section title="Genre">
          <div className="flex gap-2">
            {(["male", "female"] as Gender[]).map((g) => (
              <button
                key={g}
                onClick={() => setForm({ ...form, gender: g })}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                  form.gender === g ? "bg-[#F5C400] text-black" : "bg-[#1C1C1C] text-[#888888] border border-[#2A2A2A]"
                }`}
              >
                {g === "male" ? "Homme" : "Femme"}
              </button>
            ))}
          </div>
        </Section>

        {/* Age / Weight / Height */}
        <Section title="Mensurations">
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { key: "age", label: "Âge", unit: "ans" },
                { key: "weight", label: "Poids", unit: "kg" },
                { key: "height", label: "Taille", unit: "cm" },
              ] as { key: "age" | "weight" | "height"; label: string; unit: string }[]
            ).map(({ key, label, unit }) => (
              <div key={key}>
                <label className="text-xs text-[#888888] mb-1 block">{label}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
                    className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-3 text-white text-center focus:border-[#F5C400] outline-none"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555] text-xs">{unit}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Activity */}
        <Section title="Niveau d'activité">
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { v: "sedentary", l: "Sédentaire", d: "0-1 séance/sem." },
                { v: "light", l: "Léger", d: "2-3 séances/sem." },
                { v: "moderate", l: "Modéré", d: "4-5 séances/sem." },
                { v: "intense", l: "Intense", d: "6-7 séances/sem." },
              ] as { v: ActivityLevel; l: string; d: string }[]
            ).map(({ v, l, d }) => (
              <button
                key={v}
                onClick={() => setForm({ ...form, activity_level: v })}
                className={`py-3 px-3 rounded-xl text-sm font-semibold flex flex-col items-center transition-all ${
                  form.activity_level === v ? "bg-[#F5C400] text-black" : "bg-[#1C1C1C] text-[#888888] border border-[#2A2A2A]"
                }`}
              >
                <span>{l}</span>
                <span className={`text-xs ${form.activity_level === v ? "text-black/60" : "text-[#555]"}`}>{d}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Goal */}
        <Section title="Objectif">
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { v: "maintain", l: "Maintien" },
                { v: "cut", l: "Sèche" },
                { v: "bulk", l: "Prise de masse" },
              ] as { v: Goal; l: string }[]
            ).map(({ v, l }) => (
              <button
                key={v}
                onClick={() => setForm({ ...form, goal: v, calorie_adjustment: GOAL_ADJUSTMENTS[v] })}
                className={`py-3 rounded-xl text-xs font-semibold transition-all ${
                  form.goal === v ? "bg-[#F5C400] text-black" : "bg-[#1C1C1C] text-[#888888] border border-[#2A2A2A]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </Section>


        {/* Workout mode */}
        <Section title="Mode d'entraînement">
          <div className="flex gap-2">
            <button
              onClick={() => setForm({ ...form, workout_mode: "category" })}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                form.workout_mode === "category" ? "bg-[#F5C400] text-black" : "bg-[#1C1C1C] text-[#888888] border border-[#2A2A2A]"
              }`}
            >
              Catégories
            </button>
            <button
              onClick={() => setForm({ ...form, workout_mode: "exercises" })}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                form.workout_mode === "exercises" ? "bg-[#F5C400] text-black" : "bg-[#1C1C1C] text-[#888888] border border-[#2A2A2A]"
              }`}
            >
              Exercices
            </button>
          </div>
        </Section>

        {/* Exercise list (mode B) */}
        {form.workout_mode === "exercises" && (
          <Section title="Liste d'exercices">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={exerciseInput}
                onChange={(e) => setExerciseInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addExercise()}
                placeholder="Ex: Squat, Bench Press..."
                className="flex-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#555] focus:border-[#F5C400] outline-none"
              />
              <button
                onClick={addExercise}
                className="bg-[#F5C400] text-black px-4 rounded-xl font-bold"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.exercise_list.map((ex) => (
                <span
                  key={ex}
                  className="bg-[#1C1C1C] border border-[#2A2A2A] px-3 py-1 rounded-full text-xs text-white flex items-center gap-1"
                >
                  {ex}
                  <button
                    onClick={() =>
                      setForm({ ...form, exercise_list: form.exercise_list.filter((e) => e !== ex) })
                    }
                    className="text-[#888888] hover:text-red-400 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Calories preview */}
        <div className="bg-[#141414] rounded-xl p-4 border border-[#2A2A2A] flex items-center justify-between">
          <span className="text-sm text-[#888888]">Objectif journalier estimé</span>
          <span className="text-xl font-bold text-[#F5C400]">{Math.round(target)} kcal</span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!form.name.trim() || loading}
          className="w-full bg-[#F5C400] text-black font-bold py-4 rounded-xl min-h-[52px] text-base disabled:opacity-40"
        >
          {loading ? "Création..." : "Créer mon profil"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[#888888] mb-2 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}
