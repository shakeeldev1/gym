
export enum MeasurementSystem {
    Metric = 'metric',
    Imperial = 'imperial',
}

export enum EmotionalCommitmentLevel {
    Low = 'low',
    Moderate = 'moderate',
    High = 'high',
    VeryHigh = 'very high',
}

export enum PregnancyStatus {
    No = 'no',
    Yes = 'yes',
    NotApplicable = 'not applicable',
}

export enum EatingStyle {
    Omnivore = 'omnivore',
    Vegetarian = 'vegetarian',
    Vegan = 'vegan',
    Keto = 'keto',
    Paleo = 'paleo',
}

export enum CurrentExerciseLevel {
    Sedentary = 'sedentary',
    LightlyActive = 'lightly active',
    ModeratelyActive = 'moderately active',
    VeryActive = 'very active',
    Athlete = 'athlete',
}

export enum PreferredTrainingLocation {
    Home = 'home',
    Gym = 'gym',
    Outdoor = 'outdoor',
    Mixed = 'mixed',
}

export enum AccountabilityBuddyPreference {
    No = 'no',
    Friend = 'friend',
    Coach = 'coach',
    Group = 'group',
}

export enum SupportLevelPreference {
    Minimal = 'minimal',
    Moderate = 'moderate',
    High = 'high',
    Intensive = 'intensive',
}

// Legacy enums for backward compatibility
export enum Gender {
    Male = 'Male',
    Female = 'Female',
    Other = 'Other',
}

export enum ActivityLevel {
    Sedentary = 'Sedentary',
    LightlyActive = 'LightlyActive',
    ModeratelyActive = 'ModeratelyActive',
    VeryActive = 'VeryActive',
    ExtremelyActive = 'ExtremelyActive',
}

export enum WorkoutStyle {
    Cardio = 'Cardio',
    Strength = 'Strength',
    HIIT = 'HIIT',
    Stretching = 'Stretching',
    Running = 'Running',
    Cycling = 'Cycling',
}

export enum Goal {
    BuildMuscle = 'BuildMuscle',
    LoseWeight = 'LoseWeight',
    GainWeight = 'GainWeight',
    StayHealthy = 'StayHealthy',
}

export enum StressSource {
    Work = 'Work',
    Health = 'Health',
    Family = 'Family',
    Finances = 'Finances',
    Other = 'Other',
}

export enum ExercisePreference {
    Home = 'Home',
    Gym = 'Gym',
    Combination = 'Combination',
}

export enum SupportLevel {
    WeeklyCheckinsOnly = 'WeeklyCheckinsOnly',
    WeeklyCheckinsWithMessages = 'WeeklyCheckinsWithMessages',
    MessagesOnlyWithCheckins = 'MessagesOnlyWithCheckins',
    WeeklyCheckinsWithFrequentMessages = 'WeeklyCheckinsWithFrequentMessages',
}
