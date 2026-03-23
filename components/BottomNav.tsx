"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, UtensilsCrossed, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/sport", icon: Dumbbell, label: "Sport" },
  { href: "/nutrition", icon: UtensilsCrossed, label: "Nutrition" },
  { href: "/settings", icon: Settings, label: "Paramètres" },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/onboarding") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#141414] border-t border-[#2A2A2A] safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 py-2 px-3 min-w-[60px]"
            >
              <Icon
                size={22}
                className={
                  isActive ? "text-[#F5C400]" : "text-[#888888]"
                }
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-[#F5C400]" : "text-[#888888]"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
