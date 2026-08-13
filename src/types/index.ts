export type AgeRange = '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose_weight' | 'maintain' | 'gain_weight' | 'reduce_sugar';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
export type FoodSource = 'scan' | 'manual' | 'custom';
export type Units = 'metric' | 'imperial';

export type SugarLevel = 'low' | 'moderate' | 'high';

export interface Profile {
  id: string;
  full_name: string | null;
  age_range: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity_level: string | null;
  goal: string | null;
  calorie_goal: number | null;
  sugar_goal_g: number | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileInput {
  full_name?: string | null;
  age_range?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  activity_level?: string | null;
  goal?: string | null;
  calorie_goal?: number | null;
  sugar_goal_g?: number | null;
  onboarding_completed?: boolean;
}

export interface FoodLogItem {
  id: string;
  food_log_id: string;
  user_id: string;
  name: string;
  serving_label: string | null;
  quantity: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  added_sugar_g: number;
  confidence: number | null;
  created_at: string;
}

export interface FoodLog {
  id: string;
  user_id: string;
  logged_at: string;
  meal_type: MealType;
  image_path: string | null;
  source: FoodSource;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_fiber_g: number;
  total_sugar_g: number;
  total_added_sugar_g: number;
  ai_confidence: number | null;
  created_at: string;
  updated_at: string;
  food_log_items?: FoodLogItem[];
}

export interface FoodLogInput {
  logged_at: string;
  meal_type: MealType;
  image_path?: string | null;
  source: FoodSource;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_fiber_g: number;
  total_sugar_g: number;
  total_added_sugar_g: number;
  ai_confidence?: number | null;
}

export interface FoodLogItemInput {
  food_log_id: string;
  name: string;
  serving_label: string | null;
  quantity: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  added_sugar_g: number;
  confidence?: number | null;
}

export interface CustomFood {
  id: string;
  user_id: string;
  name: string;
  serving_label: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  added_sugar_g: number;
  created_at: string;
}

export interface CustomFoodInput {
  name: string;
  serving_label: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  added_sugar_g: number;
}

export interface ScanFeedback {
  id: string;
  user_id: string;
  food_log_id: string | null;
  original_ai_response: Record<string, unknown> | null;
  corrected_items: Record<string, unknown> | null;
  helpful: boolean | null;
  created_at: string;
}

export interface NutritionSummary {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  added_sugar_g: number;
}
