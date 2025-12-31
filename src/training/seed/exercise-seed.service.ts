import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exercise } from '../exercise/exercise.schema';

@Injectable()
export class ExerciseSeedService implements OnModuleInit {
  constructor(
    @InjectModel(Exercise.name) private exerciseModel: Model<Exercise>,
  ) {}

  async onModuleInit() {
    const count = await this.exerciseModel.countDocuments();
    if (count === 0) {
      console.log('Seeding exercises...');
      await this.seedExercises();
      console.log('Exercise seeding complete!');
    }
  }

  private async seedExercises() {
    const exercises = [
      // BEGINNER SQUAT PATTERNS
      {
        name: 'Bodyweight Squat',
        targetMuscles: ['Quads', 'Glutes', 'Hamstrings'],
        equipment: [],
        description: 'Basic squat pattern with no added weight',
        difficulty: 'beginner',
        movementPattern: 'squat',
        contraindications: [],
        goalTags: ['conditioning', 'endurance'],
        isCustom: false,
      },
      {
        name: 'Goblet Squat',
        targetMuscles: ['Quads', 'Glutes', 'Core'],
        equipment: ['dumbbell', 'kettlebell'],
        description: 'Squat holding weight at chest level',
        difficulty: 'beginner',
        movementPattern: 'squat',
        contraindications: ['wrist'],
        goalTags: ['strength', 'hypertrophy'],
        isCustom: false,
      },
      {
        name: 'Box Squat',
        targetMuscles: ['Quads', 'Glutes', 'Hamstrings'],
        equipment: ['bodyweight', 'barbell'],
        description: 'Squat to a box or bench for depth control',
        difficulty: 'beginner',
        movementPattern: 'squat',
        contraindications: [],
        goalTags: ['strength'],
        isCustom: false,
      },

      // INTERMEDIATE/ADVANCED SQUAT
      {
        name: 'Back Squat',
        targetMuscles: ['Quads', 'Glutes', 'Hamstrings', 'Core'],
        equipment: ['barbell'],
        description: 'Barbell positioned on upper back',
        difficulty: 'intermediate',
        movementPattern: 'squat',
        contraindications: ['shoulder', 'back'],
        goalTags: ['strength', 'hypertrophy'],
        isCustom: false,
      },
      {
        name: 'Front Squat',
        targetMuscles: ['Quads', 'Core'],
        equipment: ['barbell'],
        description: 'Barbell positioned on front shoulders',
        difficulty: 'advanced',
        movementPattern: 'squat',
        contraindications: ['shoulder', 'wrist'],
        goalTags: ['strength', 'hypertrophy'],
        isCustom: false,
      },

      // BEGINNER HINGE PATTERNS
      {
        name: 'Romanian Deadlift (Dumbbell)',
        targetMuscles: ['Hamstrings', 'Glutes', 'Lower Back'],
        equipment: ['dumbbell'],
        description: 'Hip hinge with slight knee bend, dumbbells tracking down shins',
        difficulty: 'beginner',
        movementPattern: 'hinge',
        contraindications: [],
        goalTags: ['strength', 'hypertrophy'],
        isCustom: false,
      },
      {
        name: 'Kettlebell Swing',
        targetMuscles: ['Glutes', 'Hamstrings', 'Core'],
        equipment: ['kettlebell'],
        description: 'Explosive hip hinge movement',
        difficulty: 'beginner',
        movementPattern: 'hinge',
        contraindications: ['back'],
        goalTags: ['conditioning', 'strength'],
        isCustom: false,
      },

      // INTERMEDIATE/ADVANCED HINGE
      {
        name: 'Conventional Deadlift',
        targetMuscles: ['Hamstrings', 'Glutes', 'Back', 'Core'],
        equipment: ['barbell'],
        description: 'Full deadlift from floor with barbell',
        difficulty: 'intermediate',
        movementPattern: 'hinge',
        contraindications: ['back'],
        goalTags: ['strength', 'hypertrophy'],
        isCustom: false,
      },
      {
        name: 'Sumo Deadlift',
        targetMuscles: ['Quads', 'Glutes', 'Hamstrings'],
        equipment: ['barbell'],
        description: 'Wide stance deadlift variation',
        difficulty: 'intermediate',
        movementPattern: 'hinge',
        contraindications: ['back', 'hip'],
        goalTags: ['strength', 'hypertrophy'],
        isCustom: false,
      },

      // BEGINNER PUSH PATTERNS
      {
        name: 'Push-Up (Incline)',
        targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
        equipment: [],
        description: 'Push-up with hands elevated on bench or box',
        difficulty: 'beginner',
        movementPattern: 'push',
        contraindications: ['wrist'],
        goalTags: ['strength', 'endurance'],
        isCustom: false,
      },
      {
        name: 'Dumbbell Bench Press',
        targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
        equipment: ['dumbbell'],
        description: 'Press dumbbells while lying on bench',
        difficulty: 'beginner',
        movementPattern: 'push',
        contraindications: ['shoulder'],
        goalTags: ['strength', 'hypertrophy'],
        isCustom: false,
      },
      {
        name: 'Push-Up (Standard)',
        targetMuscles: ['Chest', 'Triceps', 'Core'],
        equipment: [],
        description: 'Standard push-up from floor',
        difficulty: 'beginner',
        movementPattern: 'push',
        contraindications: ['wrist', 'shoulder'],
        goalTags: ['strength', 'endurance'],
        isCustom: false,
      },

      // INTERMEDIATE/ADVANCED PUSH
      {
        name: 'Barbell Bench Press',
        targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
        equipment: ['barbell'],
        description: 'Classic barbell bench press',
        difficulty: 'intermediate',
        movementPattern: 'push',
        contraindications: ['shoulder'],
        goalTags: ['strength', 'hypertrophy'],
        isCustom: false,
      },
      {
        name: 'Overhead Press',
        targetMuscles: ['Shoulders', 'Triceps', 'Core'],
        equipment: ['barbell', 'dumbbell'],
        description: 'Press weight overhead from shoulders',
        difficulty: 'intermediate',
        movementPattern: 'push',
        contraindications: ['shoulder', 'back'],
        goalTags: ['strength', 'hypertrophy'],
        isCustom: false,
      },

      // BEGINNER PULL PATTERNS
      {
        name: 'Dumbbell Row',
        targetMuscles: ['Lats', 'Rhomboids', 'Biceps'],
        equipment: ['dumbbell'],
        description: 'Single-arm row with dumbbell',
        difficulty: 'beginner',
        movementPattern: 'pull',
        contraindications: [],
        goalTags: ['strength', 'hypertrophy'],
        isCustom: false,
      },
      {
        name: 'Inverted Row',
        targetMuscles: ['Lats', 'Rhomboids', 'Biceps'],
        equipment: ['bodyweight'],
        description: 'Horizontal pull using body weight',
        difficulty: 'beginner',
        movementPattern: 'pull',
        contraindications: ['shoulder'],
        goalTags: ['strength', 'endurance'],
        isCustom: false,
      },
      {
        name: 'Band Assisted Pull-Up',
        targetMuscles: ['Lats', 'Biceps'],
        equipment: ['band'],
        description: 'Pull-up with band assistance',
        difficulty: 'beginner',
        movementPattern: 'pull',
        contraindications: ['shoulder'],
        goalTags: ['strength'],
        isCustom: false,
      },

      // INTERMEDIATE/ADVANCED PULL
      {
        name: 'Barbell Row',
        targetMuscles: ['Lats', 'Rhomboids', 'Biceps', 'Core'],
        equipment: ['barbell'],
        description: 'Bent-over row with barbell',
        difficulty: 'intermediate',
        movementPattern: 'pull',
        contraindications: ['back'],
        goalTags: ['strength', 'hypertrophy'],
        isCustom: false,
      },
      {
        name: 'Pull-Up',
        targetMuscles: ['Lats', 'Biceps'],
        equipment: [],
        description: 'Standard pull-up from bar',
        difficulty: 'intermediate',
        movementPattern: 'pull',
        contraindications: ['shoulder'],
        goalTags: ['strength', 'hypertrophy'],
        isCustom: false,
      },
      {
        name: 'Weighted Pull-Up',
        targetMuscles: ['Lats', 'Biceps'],
        equipment: ['dumbbell', 'kettlebell'],
        description: 'Pull-up with added weight',
        difficulty: 'advanced',
        movementPattern: 'pull',
        contraindications: ['shoulder'],
        goalTags: ['strength', 'hypertrophy'],
        isCustom: false,
      },

      // CARRY PATTERNS
      {
        name: 'Farmer Carry',
        targetMuscles: ['Forearms', 'Traps', 'Core'],
        equipment: ['dumbbell', 'kettlebell'],
        description: 'Walk with heavy weights in each hand',
        difficulty: 'beginner',
        movementPattern: 'carry',
        contraindications: [],
        goalTags: ['strength', 'conditioning'],
        isCustom: false,
      },
      {
        name: 'Suitcase Carry',
        targetMuscles: ['Core', 'Obliques', 'Forearms'],
        equipment: ['dumbbell', 'kettlebell'],
        description: 'Carry heavy weight in one hand',
        difficulty: 'beginner',
        movementPattern: 'carry',
        contraindications: ['back'],
        goalTags: ['strength', 'conditioning'],
        isCustom: false,
      },
      {
        name: 'Overhead Carry',
        targetMuscles: ['Shoulders', 'Core'],
        equipment: ['dumbbell', 'kettlebell'],
        description: 'Walk with weight held overhead',
        difficulty: 'intermediate',
        movementPattern: 'carry',
        contraindications: ['shoulder'],
        goalTags: ['strength', 'conditioning'],
        isCustom: false,
      },

      // CORE PATTERNS
      {
        name: 'Plank',
        targetMuscles: ['Core', 'Abs'],
        equipment: [],
        description: 'Static hold in push-up position',
        difficulty: 'beginner',
        movementPattern: 'core',
        contraindications: ['back'],
        goalTags: ['strength', 'endurance'],
        isCustom: false,
      },
      {
        name: 'Dead Bug',
        targetMuscles: ['Core', 'Abs'],
        equipment: [],
        description: 'Alternating arm and leg movements on back',
        difficulty: 'beginner',
        movementPattern: 'core',
        contraindications: [],
        goalTags: ['strength', 'conditioning'],
        isCustom: false,
      },
      {
        name: 'Hanging Knee Raise',
        targetMuscles: ['Abs', 'Hip Flexors'],
        equipment: [],
        description: 'Raise knees to chest while hanging',
        difficulty: 'intermediate',
        movementPattern: 'core',
        contraindications: ['shoulder'],
        goalTags: ['strength', 'hypertrophy'],
        isCustom: false,
      },
      {
        name: 'Ab Wheel Rollout',
        targetMuscles: ['Core', 'Abs'],
        equipment: ['band'],
        description: 'Roll ab wheel out and back',
        difficulty: 'advanced',
        movementPattern: 'core',
        contraindications: ['back'],
        goalTags: ['strength', 'hypertrophy'],
        isCustom: false,
      },
      {
        name: 'Pallof Press',
        targetMuscles: ['Core', 'Obliques'],
        equipment: ['band', 'cable'],
        description: 'Anti-rotation core exercise',
        difficulty: 'beginner',
        movementPattern: 'core',
        contraindications: [],
        goalTags: ['strength', 'conditioning'],
        isCustom: false,
      },
    ];

    await this.exerciseModel.insertMany(exercises);
  }
}
