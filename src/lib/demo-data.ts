import type { FoodLogItemInput, MealType } from '@/types';

export interface DemoFood {
  id: string;
  name: string;
  serving_label: string;
  base_quantity: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  added_sugar_g: number;
  emoji: string;
  swaps?: string[];
}

export const DEMO_FOODS: DemoFood[] = [
  {
    id: 'masala-chai-sugar',
    name: 'Masala Chai with Sugar',
    serving_label: '1 cup (150 ml)',
    base_quantity: 1,
    unit: 'cup',
    calories: 90,
    protein_g: 3,
    carbs_g: 14,
    fat_g: 2,
    fiber_g: 0,
    sugar_g: 12,
    added_sugar_g: 10,
    emoji: '☕',
    swaps: ['Plain masala chai without sugar (0g added sugar)', 'Green tea with lemon (0g sugar)'],
  },
  {
    id: 'sweet-coffee',
    name: 'Sweet Coffee',
    serving_label: '1 cup (150 ml)',
    base_quantity: 1,
    unit: 'cup',
    calories: 80,
    protein_g: 1,
    carbs_g: 12,
    fat_g: 1,
    fiber_g: 0,
    sugar_g: 11,
    added_sugar_g: 10,
    emoji: '☕',
    swaps: ['Black coffee without sugar (0g sugar)', 'Cold brew with a dash of milk (1g sugar)'],
  },
  {
    id: 'marie-biscuits',
    name: 'Marie Biscuits',
    serving_label: '2 biscuits',
    base_quantity: 2,
    unit: 'biscuit',
    calories: 70,
    protein_g: 1,
    carbs_g: 12,
    fat_g: 1.5,
    fiber_g: 0.5,
    sugar_g: 4,
    added_sugar_g: 3,
    emoji: '🍪',
  },
  {
    id: 'poha',
    name: 'Poha',
    serving_label: '1 katori (200 g)',
    base_quantity: 1,
    unit: 'katori',
    calories: 270,
    protein_g: 6,
    carbs_g: 45,
    fat_g: 7,
    fiber_g: 3,
    sugar_g: 3,
    added_sugar_g: 0,
    emoji: '🍚',
  },
  {
    id: 'dal-chawal',
    name: 'Dal Chawal',
    serving_label: '1 plate (300 g)',
    base_quantity: 1,
    unit: 'plate',
    calories: 350,
    protein_g: 14,
    carbs_g: 55,
    fat_g: 8,
    fiber_g: 6,
    sugar_g: 2,
    added_sugar_g: 0,
    emoji: '🍛',
  },
  {
    id: 'paneer',
    name: 'Paneer (Dry)',
    serving_label: '1 katori (150 g)',
    base_quantity: 1,
    unit: 'katori',
    calories: 280,
    protein_g: 18,
    carbs_g: 8,
    fat_g: 20,
    fiber_g: 2,
    sugar_g: 3,
    added_sugar_g: 0,
    emoji: '🧀',
  },
  {
    id: 'mango-lassi',
    name: 'Mango Lassi',
    serving_label: '1 glass (250 ml)',
    base_quantity: 1,
    unit: 'glass',
    calories: 180,
    protein_g: 4,
    carbs_g: 32,
    fat_g: 3,
    fiber_g: 1,
    sugar_g: 28,
    added_sugar_g: 16,
    emoji: '🥭',
    swaps: ['Plain lassi without added sugar (8g sugar)', 'Chaas / buttermilk with salt (3g sugar)'],
  },
  {
    id: 'gulab-jamun',
    name: 'Gulab Jamun (1 piece)',
    serving_label: '1 piece',
    base_quantity: 1,
    unit: 'piece',
    calories: 150,
    protein_g: 2,
    carbs_g: 25,
    fat_g: 5,
    fiber_g: 0.5,
    sugar_g: 20,
    added_sugar_g: 18,
    emoji: '🍮',
    swaps: ['Rasgulla (drained syrup) — 10g sugar', 'Fresh fruit like guava (5g sugar)'],
  },
];

export function getDemoFood(id: string): DemoFood | undefined {
  return DEMO_FOODS.find((f) => f.id === id);
}

export function scaleNutrition(food: DemoFood, quantity: number) {
  const factor = quantity / food.base_quantity;
  return {
    calories: Math.round(food.calories * factor),
    protein_g: Math.round(food.protein_g * factor * 10) / 10,
    carbs_g: Math.round(food.carbs_g * factor * 10) / 10,
    fat_g: Math.round(food.fat_g * factor * 10) / 10,
    fiber_g: Math.round(food.fiber_g * factor * 10) / 10,
    sugar_g: Math.round(food.sugar_g * factor * 10) / 10,
    added_sugar_g: Math.round(food.added_sugar_g * factor * 10) / 10,
  };
}

export function demoFoodToLogItem(food: DemoFood, quantity: number): Omit<FoodLogItemInput, 'food_log_id'> {
  const n = scaleNutrition(food, quantity);
  return {
    name: food.name,
    serving_label: food.serving_label,
    quantity,
    calories: n.calories,
    protein_g: n.protein_g,
    carbs_g: n.carbs_g,
    fat_g: n.fat_g,
    fiber_g: n.fiber_g,
    sugar_g: n.sugar_g,
    added_sugar_g: n.added_sugar_g,
    confidence: 0.85,
  };
}

export interface DemoDiaryEntry {
  meal_type: MealType;
  logged_at: string;
  items: { name: string; serving_label: string; quantity: number; calories: number; sugar_g: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number; added_sugar_g: number }[];
}

export function getDemoDiaryForToday(): DemoDiaryEntry[] {
  const today = new Date().toISOString();
  return [
    {
      meal_type: 'breakfast' as MealType,
      logged_at: today,
      items: [
        { name: 'Masala Chai with Sugar', serving_label: '1 cup', quantity: 1, calories: 90, sugar_g: 12, added_sugar_g: 10, protein_g: 3, carbs_g: 14, fat_g: 2, fiber_g: 0 },
        { name: 'Poha', serving_label: '1 katori', quantity: 1, calories: 270, sugar_g: 3, added_sugar_g: 0, protein_g: 6, carbs_g: 45, fat_g: 7, fiber_g: 3 },
      ],
    },
    {
      meal_type: 'lunch' as MealType,
      logged_at: today,
      items: [
        { name: 'Dal Chawal', serving_label: '1 plate', quantity: 1, calories: 350, sugar_g: 2, added_sugar_g: 0, protein_g: 14, carbs_g: 55, fat_g: 8, fiber_g: 6 },
        { name: 'Paneer (Dry)', serving_label: '1 katori', quantity: 1, calories: 280, sugar_g: 3, added_sugar_g: 0, protein_g: 18, carbs_g: 8, fat_g: 20, fiber_g: 2 },
      ],
    },
    {
      meal_type: 'snacks' as MealType,
      logged_at: today,
      items: [
        { name: 'Marie Biscuits', serving_label: '2 biscuits', quantity: 2, calories: 70, sugar_g: 4, added_sugar_g: 3, protein_g: 1, carbs_g: 12, fat_g: 1.5, fiber_g: 0.5 },
        { name: 'Sweet Coffee', serving_label: '1 cup', quantity: 1, calories: 80, sugar_g: 11, added_sugar_g: 10, protein_g: 1, carbs_g: 12, fat_g: 1, fiber_g: 0 },
      ],
    },
  ];
}

export function getDemoWeeklyProgress(): { day: string; sugar_g: number; calories: number; target_hit: boolean }[] {
  return [
    { day: 'Mon', sugar_g: 22, calories: 1850, target_hit: false },
    { day: 'Tue', sugar_g: 18, calories: 1700, target_hit: false },
    { day: 'Wed', sugar_g: 12, calories: 1600, target_hit: true },
    { day: 'Thu', sugar_g: 8, calories: 1550, target_hit: true },
    { day: 'Fri', sugar_g: 28, calories: 1950, target_hit: false },
    { day: 'Sat', sugar_g: 15, calories: 1750, target_hit: true },
    { day: 'Sun', sugar_g: 10, calories: 1580, target_hit: true },
  ];
}
