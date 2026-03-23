"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/ProfileContext";
import { calculateBMR, calculateTDEE, calculateDailyTarget } from "@/lib/nutrition";
import type { Profile, Gender, ActivityLevel, Goal, WorkoutMode } from "@/lib/types";
import { Save, Plus, Trash2, UserPlus, ChevronDown, ChevronUp } from "lucide-react";

export default function SettingsPage() {
  const { activeProfile, refreshProfiles } = useProfile();
  const router = useRouter();
  const [form, setForm] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exerciseInput, setExerciseInput] = useState("");
  const [showNewProfile, setShowNewProfile] = useState(false);

  useEffect(() => {
    if (activeProfile) {
      setForm({ ...activeProfile });
    }
  }, [activeProfile]);

  if (!activeProfile || !form.name) return null;

  const mockProfile = form as Profile;
  const bmr = calculateBMR(mockProfile);
  const tdee = calculateTDEE(mockProfile);
  const target = calculateDailyTarget(mockProfile);

  const handleSave = async () => {
    if (!activeProfile) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/profile/${activeProfile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await refreshProfiles();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const addExercise = () => {
    const trimmed = exerciseInput.trim();
    if (trimmed && !(form.exercise_list ?? []).includes(trimmed)) {
      setForm({ ...form, exercise_list: [...(form.exercise_list ?? []), trimmed] });
      setExerciseInput("");
    }
  };

  const removeExercise = (ex: string) => {
    setForm({ ...form, exercise_list: (form.exercise_list ?? []).filter((e) => e !== ex) });
  };

  const F = <K extends keyof Profile>(key: K, value: Profile[K]) => setForm({ ...form, [key]: value });

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-white">Paramètres</h1>
        <p className="text-[#888888] text-sm">Profil : {activeProfile.name}</p>
      </div>

      <div className="px-4 flex flex-col gap-4 max-w-lg mx-auto">
        {/* Live macros */}
        <div className="bg-[#141414] rounded-card border border-[#2A2A2A] p-4">
          <h3 className="text-sm font-semibold text-[#888888] mb-3 uppercase tracking-wide">Calculs en temps réel</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <CalcCard label="BMR" value={Math.round(bmr)} unit="kcal" />
            <CalcCard label="TDEE" value={Math.round(tdee)} unit="kcal" />
            <CalcCard label="Objectif" value={Math.round(target)} unit="kcal" highlight />
          </div>
        </div>

        {/* Identity */}
        <Section title="Identité">
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-[#888888] mb-1 block">Prénom</label>
              <input
                value={form.name ?? ""}
                onChange={(e) => F("name", e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white focus:border-[#F5C400] outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-[#888888] mb-1 block">Genre</label>
              <div className="flex gap-2">
                {(["male", "female"] as Gender[]).map((g) => (
                  <button key={g} onClick={() => F("gender", g)}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${form.gender === g ? "bg-[#F5C400] text-black" : "bg-[#1C1C1C] text-[#888888] border border-[#2A2A2A]"}`}>
                    {g === "male" ? "Homme" : "Femme"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Mensurations */}
        <Section title="Mensurations">
          <div className="grid grid-cols-3 gap-3">
            {([
              { key: "age" as const, label: "Âge", unit: "ans" },
              { key: "weight" as const, label: "Poids", unit: "kg" },
              { key: "height" as const, label: "Taille", unit: "cm" },
            ]).map(({ key, label, unit }) => (
              <div key={key}>
                <label className="text-xs text-[#888888] mb-1 block">{label}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={(form[key] as number) ?? 0}
                    onChange={(e) => F(key, Number(e.target.value))}
                    className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-3 py-3 text-white text-center focus:border-[#F5C400] outline-none"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555] text-xs">{unit}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Activity */}
        <Section title="Activité">
          <div className="grid grid-cols-2 gap-2">
            {([
              { v: "sedentary" as ActivityLevel, l: "Sédentaire", d: "0-1 séance/sem." },
              { v: "light" as ActivityLevel, l: "Léger", d: "2-3 séances/sem." },
              { v: "moderate" as ActivityLevel, l: "Modéré", d: "4-5 séances/sem." },
              { v: "intense" as ActivityLevel, l: "Intense", d: "6-7 séances/sem." },
            ]).map(({ v, l, d }) => (
              <button key={v} onClick={() => F("activity_level", v)}
                className={`py-3 px-3 rounded-xl text-sm font-semibold flex flex-col items-center transition-all ${form.activity_level === v ? "bg-[#F5C400] text-black" : "bg-[#1C1C1C] text-[#888888] border border-[#2A2A2A]"}`}>
                <span>{l}</span>
                <span className={`text-xs ${form.activity_level === v ? "text-black/60" : "text-[#555]"}`}>{d}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Goal */}
        <Section title="Objectif nutritionnel">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {([
              { v: "maintain" as Goal, l: "Maintien" },
              { v: "cut" as Goal, l: "Sèche" },
              { v: "bulk" as Goal, l: "Prise de masse" },
            ]).map(({ v, l }) => (
              <button key={v} onClick={() => F("goal", v)}
                className={`py-3 rounded-xl text-xs font-semibold transition-all ${form.goal === v ? "bg-[#F5C400] text-black" : "bg-[#1C1C1C] text-[#888888] border border-[#2A2A2A]"}`}>
                {l}
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs text-[#888888] mb-1 block">Ajustement calorique</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={form.calorie_adjustment ?? 0}
                onChange={(e) => F("calorie_adjustment", Number(e.target.value))}
                className="flex-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-center focus:border-[#F5C400] outline-none"
              />
              <span className="text-[#888888] text-sm">kcal</span>
            </div>
          </div>
        </Section>

        {/* Sport config */}
        <Section title="Configuration sport">
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-[#888888] mb-1 block">Mode d&apos;entraînement</label>
              <div className="flex gap-2">
                {(["category", "exercises"] as WorkoutMode[]).map((m) => (
                  <button key={m} onClick={() => F("workout_mode", m)}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${form.workout_mode === m ? "bg-[#F5C400] text-black" : "bg-[#1C1C1C] text-[#888888] border border-[#2A2A2A]"}`}>
                    {m === "category" ? "Catégories" : "Exercices"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-[#888888] mb-1 block">Objectif de streak (séances/semaine)</label>
              <input
                type="number"
                min={1} max={7}
                value={form.streak_target ?? 3}
                onChange={(e) => F("streak_target", Number(e.target.value))}
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-center focus:border-[#F5C400] outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-[#888888] mb-1 block">Calories brûlées/heure (sport)</label>
              <input
                type="number"
                value={form.workout_cal_per_hour ?? 300}
                onChange={(e) => F("workout_cal_per_hour", Number(e.target.value))}
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-center focus:border-[#F5C400] outline-none"
              />
            </div>
          </div>
        </Section>

        {/* Exercise list */}
        {form.workout_mode === "exercises" && (
          <Section title="Liste d'exercices">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={exerciseInput}
                onChange={(e) => setExerciseInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addExercise()}
                placeholder="Ajouter un exercice..."
                className="flex-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#555] focus:border-[#F5C400] outline-none"
              />
              <button onClick={addExercise} className="bg-[#F5C400] text-black px-4 rounded-xl font-bold">
                <Plus size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {(form.exercise_list ?? []).map((ex) => (
                <div key={ex} className="flex items-center justify-between bg-[#1C1C1C] rounded-xl px-4 py-2.5 border border-[#2A2A2A]">
                  <span className="text-sm text-white">{ex}</span>
                  <button onClick={() => removeExercise(ex)} className="text-[#888888] hover:text-red-400">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl min-h-[52px] transition-all ${
            saved ? "bg-[#22C55E] text-white" : "bg-[#F5C400] text-black"
          } disabled:opacity-40`}
        >
          <Save size={18} />
          {saved ? "Sauvegardé ✓" : saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>

        {/* Create second profile */}
        <div className="bg-[#141414] rounded-card border border-[#2A2A2A] p-4">
          <button
            onClick={() => setShowNewProfile(!showNewProfile)}
            className="w-full flex items-center justify-between text-sm font-semibold text-white"
          >
            <div className="flex items-center gap-2">
              <UserPlus size={18} className="text-[#F5C400]" />
              Créer un second profil
            </div>
            {showNewProfile ? <ChevronUp size={18} className="text-[#888888]" /> : <ChevronDown size={18} className="text-[#888888]" />}
          </button>
          {showNewProfile && (
            <div className="mt-3">
              <p className="text-[#888888] text-sm mb-3">
                Crée un profil pour un autre utilisateur. Tu pourras switcher entre les profils depuis le dashboard.
              </p>
              <button
                onClick={() => router.push("/onboarding")}
                className="w-full bg-[#1C1C1C] border border-[#F5C400]/50 text-[#F5C400] font-semibold py-3 rounded-xl"
              >
                Nouveau profil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#141414] rounded-card border border-[#2A2A2A] p-4">
      <h3 className="text-sm font-semibold text-[#888888] mb-3 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

function CalcCard({ label, value, unit, highlight = false }: { label: string; value: number; unit: string; highlight?: boolean }) {
  return (
    <div className="bg-[#1C1C1C] rounded-xl p-3 border border-[#2A2A2A] text-center">
      <div className={`text-lg font-bold ${highlight ? "text-[#F5C400]" : "text-white"}`}>{value}</div>
      <div className="text-xs text-[#888888]">{unit}</div>
      <div className="text-[10px] text-[#555] mt-0.5">{label}</div>
    </div>
  );
}
