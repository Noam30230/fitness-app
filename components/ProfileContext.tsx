"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { Profile } from "@/lib/types";

interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile) => void;
  refreshProfiles: () => Promise<void>;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType>({
  profiles: [],
  activeProfile: null,
  setActiveProfile: () => {},
  refreshProfiles: async () => {},
  isLoading: true,
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfiles = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data: Profile[] = await res.json();
        setProfiles(data);

        // Restore active profile from localStorage
        const savedId =
          typeof window !== "undefined"
            ? localStorage.getItem("activeProfileId")
            : null;

        if (savedId) {
          const found = data.find((p) => p.id === savedId);
          if (found) {
            setActiveProfileState(found);
          } else if (data.length > 0) {
            setActiveProfileState(data[0]);
          }
        } else if (data.length > 0) {
          setActiveProfileState(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profiles", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfiles();
  }, [refreshProfiles]);

  const setActiveProfile = useCallback((profile: Profile) => {
    setActiveProfileState(profile);
    if (typeof window !== "undefined") {
      localStorage.setItem("activeProfileId", profile.id);
    }
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        setActiveProfile,
        refreshProfiles,
        isLoading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
