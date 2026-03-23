"use client";

import { useProfile } from "./ProfileContext";

export default function ProfileSelector() {
  const { profiles, activeProfile, setActiveProfile } = useProfile();

  if (profiles.length <= 1) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {profiles.map((profile) => (
        <button
          key={profile.id}
          onClick={() => setActiveProfile(profile)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            activeProfile?.id === profile.id
              ? "bg-[#F5C400] text-black"
              : "bg-[#1C1C1C] text-[#888888] border border-[#2A2A2A] hover:border-[#F5C400]/50"
          }`}
        >
          {profile.name}
        </button>
      ))}
    </div>
  );
}
