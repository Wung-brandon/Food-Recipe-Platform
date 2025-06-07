export interface MealPlanEntry {
  id: number;
  date: string;
  meal_type: string;
  recipe: {
    id: number;
    title: string;
    image?: string;
  };
}

export interface MealPlan {
  id: number;
  start_date: string;
  end_date: string;
  entries: MealPlanEntry[];
}

export interface ShoppingList {
  ingredients: string[];
}

export interface Preferences {
  num_days: number;
  meal_types: string[];
  categories?: string[];
  difficulty?: string;
  max_cooking_time?: number;
  dietary_needs?: string[];
}