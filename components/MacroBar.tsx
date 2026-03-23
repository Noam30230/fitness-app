"use client";

import { useEffect, useRef } from "react";

interface MacroBarProps {
  label: string;
  value: number;
  target: number;
  color: string;
  unit?: string;
}

function SingleMacroBar({ label, value, target, color, unit = "g" }: MacroBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const pct = Math.min((value / target) * 100, 100);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    bar.style.width = "0%";
    void bar.getBoundingClientRect();
    bar.style.transition = "width 0.6s ease-out";
    bar.style.width = `${pct}%`;
  }, [pct]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-[#888888] font-medium">{label}</span>
        <span className="text-xs font-semibold">
          <span style={{ color }}>{value}{unit}</span>
          <span className="text-[#888888]"> / {target}{unit}</span>
        </span>
      </div>
      <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
        <div
          ref={barRef}
          className="h-full rounded-full"
          style={{ backgroundColor: color, width: "0%" }}
        />
      </div>
    </div>
  );
}

interface MacroBarsProps {
  protein: number;
  carbs: number;
  fat: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export default function MacroBars({
  protein,
  carbs,
  fat,
  targetProtein,
  targetCarbs,
  targetFat,
}: MacroBarsProps) {
  return (
    <div className="flex flex-col gap-3">
      <SingleMacroBar label="Protéines" value={protein} target={targetProtein} color="#3B82F6" />
      <SingleMacroBar label="Glucides" value={carbs} target={targetCarbs} color="#F5C400" />
      <SingleMacroBar label="Lipides" value={fat} target={targetFat} color="#EF4444" />
    </div>
  );
}
