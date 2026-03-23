"use client";

import { useState } from "react";
import { parseNaturalLanguage, calculateNutrition, type FoodItem } from "@/lib/foodDatabase";
import { Sparkles, Check } from "lucide-react";

interface ParsedFood {
  food: FoodItem;
  quantity: number;
}

interface NutritionResult {
  name: string;
  quantity_g: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NaturalLanguageLogProps {
  onResult: (items: NutritionResult[]) => void;
}

export default function NaturalLanguageLog({ onResult }: NaturalLanguageLogProps) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedFood[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [showPreview, setShowPreview] = useState(false);

  const handleParse = () => {
    const results = parseNaturalLanguage(text);
    setParsed(results);
    const qMap: Record<number, number> = {};
    results.forEach((r, i) => (qMap[i] = r.quantity));
    setQuantities(qMap);
    setShowPreview(true);
  };

  const totals = parsed.reduce(
    (acc, { food }, i) => {
      const q = quantities[i] ?? food.default_portion_g;
      const n = calculateNutrition(food, q);
      return {
        calories: acc.calories + n.calories,
        protein: acc.protein + n.protein,
        carbs: acc.carbs + n.carbs,
        fat: acc.fat + n.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleConfirm = () => {
    const results: NutritionResult[] = parsed.map(({ food }, i) => {
      const q = quantities[i] ?? food.default_portion_g;
      const n = calculateNutrition(food, q);
      return { name: food.name, quantity_g: q, ...n };
    });
    onResult(results);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setShowPreview(false); }}
          placeholder="Ex: j'ai mangé 200g de poulet avec du riz et une salade..."
          rows={4}
          className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#555] focus:border-[#F5C400] outline-none resize-none"
        />
      </div>

      <button
        onClick={handleParse}
        disabled={!text.trim()}
        className="w-full flex items-center justify-center gap-2 bg-[#1C1C1C] border border-[#F5C400]/50 text-[#F5C400] font-semibold py-3 rounded-xl min-h-[52px] disabled:opacity-40"
      >
        <Sparkles size={18} />
        Analyser le repas
      </button>

      {showPreview && parsed.length === 0 && (
        <p className="text-[#888888] text-sm text-center">
          Aucun aliment reconnu. Essayez d&apos;être plus précis (ex: &quot;100g de pâtes, 150g de poulet&quot;).
        </p>
      )}

      {showPreview && parsed.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#F5C400] bg-[#F5C400]/10 px-2 py-1 rounded-full">
              ~ Approximatif
            </span>
            <span className="text-xs text-[#888888]">{parsed.length} aliment(s) reconnu(s)</span>
          </div>

          {parsed.map(({ food }, i) => {
            const q = quantities[i] ?? food.default_portion_g;
            const n = calculateNutrition(food, q);
            return (
              <div key={i} className="bg-[#1C1C1C] rounded-xl p-3 border border-[#2A2A2A]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{food.name}</span>
                  <span className="text-sm font-bold text-[#F5C400]">{n.calories} kcal</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={q}
                    onChange={(e) => setQuantities({ ...quantities, [i]: Number(e.target.value) })}
                    min={1}
                    className="w-20 bg-[#141414] border border-[#2A2A2A] rounded-lg px-2 py-1 text-sm text-white text-center focus:border-[#F5C400] outline-none"
                  />
                  <span className="text-xs text-[#888888]">g •</span>
                  <span className="text-xs text-[#888888]">P:{n.protein}g G:{n.carbs}g L:{n.fat}g</span>
                </div>
              </div>
            );
          })}

          {/* Totals */}
          <div className="bg-[#141414] rounded-xl p-3 border border-[#2A2A2A]">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-white">Total repas</span>
              <span className="text-lg font-bold text-[#F5C400]">{totals.calories} kcal</span>
            </div>
            <div className="flex gap-4 mt-1">
              <span className="text-xs text-[#888888]">P: <span className="text-white">{totals.protein}g</span></span>
              <span className="text-xs text-[#888888]">G: <span className="text-white">{totals.carbs}g</span></span>
              <span className="text-xs text-[#888888]">L: <span className="text-white">{totals.fat}g</span></span>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full flex items-center justify-center gap-2 bg-[#F5C400] text-black font-bold py-3.5 rounded-xl min-h-[52px]"
          >
            <Check size={18} />
            Ajouter ce repas
          </button>
        </div>
      )}
    </div>
  );
}
