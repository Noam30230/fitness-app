export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "intense";
export type Goal = "maintain" | "cut" | "bulk";
export type WorkoutMode = "category" | "exercises";
export type WorkoutCategory =
  | "Push"
  | "Pull"
  | "Legs"
  | "Cardio"
  | "Full Body"
  | "Autre";

export interface Profile {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  weight: number; // kg
  height: number; // cm
  activity_level: ActivityLevel;
  goal: Goal;
  calorie_adjustment: number;
  workout_mode: WorkoutMode;
  streak_target: number;
  exercise_list: string[];
  workout_cal_per_hour: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutLog {
  id: string;
  profile_id: string;
  date: string; // ISO date string YYYY-MM-DD
  duration_minutes: number;
  category?: WorkoutCategory;
  exercises_done?: string[];
  note?: string;
  created_at?: string;
}

export interface NutritionLog {
  id: string;
  profile_id: string;
  date: string;
  meal_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity_g?: number;
  source: "barcode" | "natural" | "saved";
  is_approximate?: boolean;
  created_at?: string;
}

export interface SavedMeal {
  id: string;
  profile_id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at?: string;
}

export interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyNutrition extends NutritionSummary {
  date: string;
  target_calories: number;
  logs: NutritionLog[];
}

export interface WeeklyStats {
  averageCalories: number;
  daysOnTarget: number;
  totalDays: number;
  dailyData: { date: string; calories: number; target: number }[];
}

export interface WorkoutStats {
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  totalDurationThisMonth: number;
  categoryBreakdown: Record<string, number>;
  streak: number;
  lastSession?: WorkoutLog;
  neglectedExercises: string[];
  pushPullBalance?: { push: number; pull: number };
  weeklyData: { week: string; sessions: number }[];
}
