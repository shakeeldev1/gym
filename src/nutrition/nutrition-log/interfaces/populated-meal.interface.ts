export interface MacroSource {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface PopulatedMealItem {
  food?: MacroSource;
  recipe?: MacroSource;
  quantity: number;
}

export interface PopulatedMeal {
  date: Date;
  mealType: string;
  items: PopulatedMealItem[];
}