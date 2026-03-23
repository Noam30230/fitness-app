import type { Profile } from "./types";

export function calculateBMR(profile: Profile): number {
  const { weight, height, age, gender } = profile;
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

const ACTIVITY_COEFFICIENTS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.4,
  moderate: 1.6,
  intense: 1.8,
};

export function calculateTDEE(profile: Profile): number {
  const bmr = calculateBMR(profile);
  return bmr * ACTIVITY_COEFFICIENTS[profile.activity_level];
}

export function calculateDailyTarget(
  profile: Profile,
  workoutMinutes = 0
): number {
  const tdee = calculateTDEE(profile);
  const workoutCalories =
    (workoutMinutes / 60) * profile.workout_cal_per_hour;
  return Math.round(tdee + profile.calorie_adjustment + workoutCalories);
}
