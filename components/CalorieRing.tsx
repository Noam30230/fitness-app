"use client";

import { useEffect, useRef } from "react";

interface CalorieRingProps {
  consumed: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}

export default function CalorieRing({
  consumed,
  target,
  size = 180,
  strokeWidth = 14,
}: CalorieRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(consumed / target, 1);
  const offset = circumference - progress * circumference;
  const isOver = consumed > target;

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;
    circle.style.transition = "none";
    circle.style.strokeDashoffset = String(circumference);
    // Force reflow
    void circle.getBoundingClientRect();
    circle.style.transition = "stroke-dashoffset 0.6s ease-out";
    circle.style.strokeDashoffset = String(offset);
  }, [consumed, target, circumference, offset]);

  const center = size / 2;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#2A2A2A"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          ref={circleRef}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={isOver ? "#EF4444" : "#F5C400"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold text-white leading-none">
          {consumed.toLocaleString("fr-FR")}
        </span>
        <span className="text-xs text-[#888888] mt-1">kcal</span>
        <span className="text-xs text-[#888888]">/ {target.toLocaleString("fr-FR")}</span>
        {isOver && (
          <span className="text-xs text-red-400 font-semibold mt-1">+{(consumed - target).toLocaleString("fr-FR")}</span>
        )}
      </div>
    </div>
  );
}
