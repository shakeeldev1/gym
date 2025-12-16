export interface MacroSource {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface PopulatedMealItem {
  food?: MacroSource;
  recipe?: MacroSource;
  quantity: number;
}

export interface PopulatedMeal {
  items: PopulatedMealItem[];
}