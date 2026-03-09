import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  FitnessWorkout,
  FitnessWorkoutDocument,
} from './schemas/fitness-workout.schema';
import {
  CreateFitnessWorkoutDto,
  UpdateFitnessWorkoutDto,
} from './dto/fitness-workout.dto';

@Injectable()
export class FitnessService {
  constructor(
    @InjectModel(FitnessWorkout.name)
    private fitnessWorkoutModel: Model<FitnessWorkoutDocument>,
  ) {}

  async create(
    dto: CreateFitnessWorkoutDto,
    userId: string,
  ): Promise<FitnessWorkout> {
    const workout = new this.fitnessWorkoutModel({
      ...dto,
      createdBy: userId,
    });
    return workout.save();
  }

  async findAll(query: {
    category?: string;
    difficulty?: string;
    subcategory?: string;
    intensity?: string;
    search?: string;
  }): Promise<FitnessWorkout[]> {
    const filter: any = { isActive: true };

    if (query.category) {
      filter.category = query.category;
    }
    if (query.difficulty) {
      filter.difficulty = query.difficulty;
    }
    if (query.subcategory) {
      filter.subcategory = query.subcategory;
    }
    if (query.intensity) {
      filter.intensity = query.intensity;
    }
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { tags: { $regex: query.search, $options: 'i' } },
      ];
    }

    return this.fitnessWorkoutModel
      .find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();
  }

  async findByCategory(category: string): Promise<FitnessWorkout[]> {
    return this.fitnessWorkoutModel
      .find({ category, isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<FitnessWorkout> {
    const workout = await this.fitnessWorkoutModel.findById(id).exec();
    if (!workout) {
      throw new NotFoundException('Workout not found');
    }
    return workout;
  }

  async update(
    id: string,
    dto: UpdateFitnessWorkoutDto,
  ): Promise<FitnessWorkout> {
    const workout = await this.fitnessWorkoutModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .exec();
    if (!workout) {
      throw new NotFoundException('Workout not found');
    }
    return workout;
  }

  async delete(id: string): Promise<{ message: string }> {
    const workout = await this.fitnessWorkoutModel.findByIdAndDelete(id).exec();
    if (!workout) {
      throw new NotFoundException('Workout not found');
    }
    return { message: 'Workout deleted successfully' };
  }

  async seedDefaultWorkouts(): Promise<{ message: string; count: number }> {
    const existingCount = await this.fitnessWorkoutModel.countDocuments();
    if (existingCount > 0) {
      return {
        message: 'Workouts already seeded',
        count: existingCount,
      };
    }

    const defaultWorkouts: Partial<FitnessWorkout>[] = [
      // ===== YOGA =====
      {
        name: 'Sun Salutation Flow',
        description:
          'A classic yoga sequence that warms up the body and connects breath with movement. Perfect for morning practice.',
        category: 'yoga',
        subcategory: 'sun_salutation',
        difficulty: 'beginner',
        duration: 20,
        caloriesBurn: 150,
        intensity: 'low',
        targetMuscles: ['full_body', 'core', 'shoulders'],
        equipment: ['yoga_mat'],
        tags: ['morning', 'flexibility', 'warmup'],
        exercises: [
          { name: 'Mountain Pose (Tadasana)', duration: 30, instructions: 'Stand tall with feet together, arms by sides' },
          { name: 'Upward Salute (Urdhva Hastasana)', duration: 15, instructions: 'Inhale, sweep arms overhead' },
          { name: 'Standing Forward Bend (Uttanasana)', duration: 20, instructions: 'Exhale, fold forward from hips' },
          { name: 'Half Forward Bend (Ardha Uttanasana)', duration: 10, instructions: 'Inhale, lift halfway, flat back' },
          { name: 'Plank Pose', duration: 15, instructions: 'Step back to plank position' },
          { name: 'Four-Limbed Staff Pose (Chaturanga)', duration: 10, instructions: 'Exhale, lower body to hover' },
          { name: 'Upward-Facing Dog', duration: 15, instructions: 'Inhale, press up, open chest' },
          { name: 'Downward-Facing Dog', duration: 30, instructions: 'Exhale, lift hips up and back' },
        ],
        sortOrder: 1,
      },
      {
        name: 'Mind Body Balance',
        description:
          'A calming yoga practice focusing on balance, flexibility, and mindfulness. Ideal for stress relief.',
        category: 'yoga',
        subcategory: 'balance',
        difficulty: 'intermediate',
        duration: 30,
        caloriesBurn: 200,
        intensity: 'medium',
        targetMuscles: ['core', 'legs', 'back'],
        equipment: ['yoga_mat'],
        tags: ['balance', 'mindfulness', 'flexibility'],
        exercises: [
          { name: 'Tree Pose (Vrksasana)', duration: 60, sets: 2, instructions: 'Balance on one leg, foot on inner thigh' },
          { name: 'Warrior III (Virabhadrasana III)', duration: 45, sets: 2, instructions: 'Balance on one leg, body parallel to floor' },
          { name: 'Eagle Pose (Garudasana)', duration: 45, sets: 2, instructions: 'Wrap arms and legs, balance on one foot' },
          { name: 'Half Moon Pose (Ardha Chandrasana)', duration: 30, sets: 2, instructions: 'Balance on one leg, open body sideways' },
          { name: 'Dancer Pose (Natarajasana)', duration: 30, sets: 2, instructions: 'Stand on one leg, hold back foot' },
          { name: 'Boat Pose (Navasana)', duration: 30, sets: 3, instructions: 'Sit, lift legs and arms, balance on sit bones' },
        ],
        sortOrder: 2,
      },
      {
        name: 'Power Yoga',
        description:
          'An intense, fitness-based approach to yoga that builds strength, flexibility and stamina.',
        category: 'yoga',
        subcategory: 'power',
        difficulty: 'advanced',
        duration: 45,
        caloriesBurn: 350,
        intensity: 'high',
        targetMuscles: ['full_body', 'core', 'arms'],
        equipment: ['yoga_mat'],
        tags: ['strength', 'power', 'endurance'],
        exercises: [
          { name: 'Chair Pose Flow', duration: 45, sets: 3, instructions: 'Sit deep in chair pose, flow with breath' },
          { name: 'Warrior I to Warrior II Flow', duration: 60, sets: 3, instructions: 'Flow between warrior poses' },
          { name: 'Side Plank (Vasisthasana)', duration: 30, sets: 2, instructions: 'Stack feet, lift top arm' },
          { name: 'Crow Pose (Bakasana)', duration: 20, sets: 3, instructions: 'Hands on mat, knees on triceps, lift feet' },
          { name: 'Wheel Pose (Urdhva Dhanurasana)', duration: 20, sets: 2, instructions: 'Hands and feet on mat, press up' },
        ],
        sortOrder: 3,
      },
      // ===== CARDIO =====
      {
        name: 'Cardio Blast',
        description:
          'High-energy cardio workout to boost your heart rate and burn calories fast.',
        category: 'cardio',
        subcategory: 'general',
        difficulty: 'intermediate',
        duration: 30,
        caloriesBurn: 400,
        intensity: 'high',
        targetMuscles: ['full_body', 'legs', 'core'],
        equipment: [],
        tags: ['fat_burn', 'endurance', 'no_equipment'],
        exercises: [
          { name: 'Jumping Jacks', duration: 60, sets: 3, restTime: 15, instructions: 'Jump feet wide, arms overhead' },
          { name: 'High Knees', duration: 45, sets: 3, restTime: 15, instructions: 'Run in place, knees up to hip height' },
          { name: 'Burpees', reps: '10', sets: 3, restTime: 30, instructions: 'Squat, jump back, push-up, jump up' },
          { name: 'Mountain Climbers', duration: 45, sets: 3, restTime: 15, instructions: 'Plank position, alternate driving knees' },
          { name: 'Box Jumps', reps: '12', sets: 3, restTime: 30, instructions: 'Jump onto elevated surface' },
          { name: 'Speed Skaters', duration: 45, sets: 3, restTime: 15, instructions: 'Lateral jumps, touch floor on each side' },
        ],
        sortOrder: 1,
      },
      {
        name: 'Low Impact Cardio',
        description:
          'Gentle on joints but effective for burning calories and improving heart health.',
        category: 'cardio',
        subcategory: 'low_impact',
        difficulty: 'beginner',
        duration: 25,
        caloriesBurn: 250,
        intensity: 'low',
        targetMuscles: ['full_body', 'legs'],
        equipment: [],
        tags: ['beginner_friendly', 'joint_safe', 'no_equipment'],
        exercises: [
          { name: 'Marching in Place', duration: 60, sets: 3, instructions: 'March with high knees, pump arms' },
          { name: 'Step Touch', duration: 60, sets: 3, instructions: 'Step side to side, add arm movements' },
          { name: 'Modified Squat Walks', duration: 45, sets: 3, instructions: 'Walk in squat position' },
          { name: 'Arm Circles with Step', duration: 45, sets: 3, instructions: 'Circle arms while stepping' },
          { name: 'Standing Oblique Crunches', reps: '15', sets: 3, instructions: 'Elbow to knee, standing' },
        ],
        sortOrder: 2,
      },
      // ===== HIIT =====
      {
        name: 'Tabata Burner',
        description:
          '20 seconds of intense work followed by 10 seconds rest. 8 rounds per exercise.',
        category: 'hiit',
        subcategory: 'tabata',
        difficulty: 'advanced',
        duration: 20,
        caloriesBurn: 350,
        intensity: 'high',
        targetMuscles: ['full_body', 'core', 'legs'],
        equipment: [],
        tags: ['tabata', 'intense', 'fat_burn'],
        exercises: [
          { name: 'Squat Jumps', duration: 20, restTime: 10, sets: 8, instructions: 'Deep squat, explode up' },
          { name: 'Push-Up to Spider', duration: 20, restTime: 10, sets: 8, instructions: 'Push-up, bring knee to elbow' },
          { name: 'Burpee Tuck Jumps', duration: 20, restTime: 10, sets: 8, instructions: 'Burpee with tuck jump at top' },
          { name: 'Mountain Climber Sprint', duration: 20, restTime: 10, sets: 8, instructions: 'Fast alternating knee drives' },
        ],
        sortOrder: 1,
      },
      {
        name: 'Full Body EMOM',
        description:
          'Every Minute On the Minute — complete the prescribed work within 60 seconds.',
        category: 'hiit',
        subcategory: 'emom',
        difficulty: 'intermediate',
        duration: 25,
        caloriesBurn: 300,
        intensity: 'high',
        targetMuscles: ['full_body'],
        equipment: [],
        tags: ['emom', 'conditioning', 'full_body'],
        exercises: [
          { name: 'Kettlebell Swings', reps: '15', instructions: 'Hip drive, swing to shoulder height' },
          { name: 'Box Jumps', reps: '10', instructions: 'Jump onto elevated surface' },
          { name: 'Push Presses', reps: '12', instructions: 'Dip and drive weight overhead' },
          { name: 'Assault Bike Calories', reps: '12 cal', instructions: 'All-out effort on bike' },
        ],
        sortOrder: 2,
      },
      {
        name: 'Beginner HIIT',
        description:
          'Introduction to HIIT training with modified exercises and longer rest periods.',
        category: 'hiit',
        subcategory: 'beginner',
        difficulty: 'beginner',
        duration: 20,
        caloriesBurn: 200,
        intensity: 'medium',
        targetMuscles: ['full_body'],
        equipment: [],
        tags: ['beginner', 'modified', 'starter'],
        exercises: [
          { name: 'Marching High Knees', duration: 30, restTime: 30, sets: 4, instructions: 'March with high knees, steady pace' },
          { name: 'Modified Burpees', reps: '8', restTime: 30, sets: 4, instructions: 'Step back instead of jump' },
          { name: 'Bodyweight Squats', reps: '12', restTime: 20, sets: 4, instructions: 'Sit back and down, chest up' },
          { name: 'Standing Bicycle Crunches', reps: '10 each side', restTime: 20, sets: 4, instructions: 'Elbow to opposite knee' },
        ],
        sortOrder: 3,
      },
      // ===== STRETCHING =====
      {
        name: 'Full Body Stretch Routine',
        description:
          'Complete stretching routine targeting all major muscle groups for improved flexibility.',
        category: 'stretching',
        subcategory: 'full_body',
        difficulty: 'beginner',
        duration: 20,
        caloriesBurn: 80,
        intensity: 'low',
        targetMuscles: ['full_body'],
        equipment: ['yoga_mat'],
        tags: ['flexibility', 'recovery', 'cooldown'],
        exercises: [
          { name: 'Neck Circles', duration: 30, instructions: 'Slowly rotate head in circles' },
          { name: 'Shoulder Rolls', duration: 30, instructions: 'Roll shoulders forward and backward' },
          { name: 'Cat-Cow Stretch', duration: 45, sets: 3, instructions: 'Alternate between arching and rounding back' },
          { name: 'Standing Quad Stretch', duration: 30, sets: 2, instructions: 'Pull heel to glute, balance' },
          { name: 'Seated Forward Fold', duration: 45, instructions: 'Legs extended, reach for toes' },
          { name: 'Pigeon Pose', duration: 60, sets: 2, instructions: 'One leg forward bent, other extended back' },
          { name: 'Spinal Twist', duration: 45, sets: 2, instructions: 'Seated twist, look over shoulder' },
        ],
        sortOrder: 1,
      },
      {
        name: 'Upper Body Stretch',
        description:
          'Focus on shoulders, chest, arms, and upper back for tension relief.',
        category: 'stretching',
        subcategory: 'upper_body',
        difficulty: 'beginner',
        duration: 15,
        caloriesBurn: 50,
        intensity: 'low',
        targetMuscles: ['shoulders', 'chest', 'arms', 'upper_back'],
        equipment: [],
        tags: ['desk_friendly', 'tension_relief', 'upper_body'],
        exercises: [
          { name: 'Cross-Body Shoulder Stretch', duration: 30, sets: 2, instructions: 'Pull arm across chest' },
          { name: 'Tricep Stretch', duration: 30, sets: 2, instructions: 'Reach behind head, pull elbow' },
          { name: 'Chest Opener', duration: 45, instructions: 'Clasp hands behind back, lift chest' },
          { name: 'Wrist Circles', duration: 30, instructions: 'Rotate wrists both directions' },
          { name: 'Eagle Arms', duration: 30, sets: 2, instructions: 'Wrap arms, lift elbows' },
        ],
        sortOrder: 2,
      },
      {
        name: 'Lower Body Stretch',
        description:
          'Deep stretches for hips, hamstrings, quads, and calves.',
        category: 'stretching',
        subcategory: 'lower_body',
        difficulty: 'beginner',
        duration: 15,
        caloriesBurn: 50,
        intensity: 'low',
        targetMuscles: ['hips', 'hamstrings', 'quads', 'calves'],
        equipment: ['yoga_mat'],
        tags: ['leg_day', 'recovery', 'flexibility'],
        exercises: [
          { name: 'Standing Calf Stretch', duration: 30, sets: 2, instructions: 'Press heel into floor, lean forward' },
          { name: 'Lying Hamstring Stretch', duration: 45, sets: 2, instructions: 'Lie on back, pull leg toward chest' },
          { name: 'Butterfly Stretch', duration: 60, instructions: 'Soles together, press knees down' },
          { name: 'Low Lunge Hip Flexor Stretch', duration: 45, sets: 2, instructions: 'Deep lunge, push hips forward' },
          { name: 'Figure Four Stretch', duration: 45, sets: 2, instructions: 'Cross ankle over knee, pull toward chest' },
        ],
        sortOrder: 3,
      },
      {
        name: 'Back & Spine Stretch',
        description:
          'Relieve back pain and improve spinal mobility.',
        category: 'stretching',
        subcategory: 'back_spine',
        difficulty: 'beginner',
        duration: 15,
        caloriesBurn: 50,
        intensity: 'low',
        targetMuscles: ['back', 'spine', 'core'],
        equipment: ['yoga_mat'],
        tags: ['back_pain', 'spine_health', 'mobility'],
        exercises: [
          { name: 'Child\'s Pose', duration: 60, instructions: 'Kneel, sit back on heels, reach arms forward' },
          { name: 'Cat-Cow', duration: 45, sets: 3, instructions: 'On hands and knees, alternate arch and round' },
          { name: 'Thread the Needle', duration: 30, sets: 2, instructions: 'Reach arm under body, rotate torso' },
          { name: 'Cobra Stretch', duration: 30, sets: 2, instructions: 'Lie face down, press chest up' },
          { name: 'Seated Spinal Twist', duration: 45, sets: 2, instructions: 'Sit, cross leg over, twist toward bent knee' },
        ],
        sortOrder: 4,
      },
      // ===== FITNESS =====
      {
        name: 'Full Body Strength',
        description:
          'Complete strength training workout targeting all major muscle groups.',
        category: 'fitness',
        subcategory: 'strength',
        difficulty: 'intermediate',
        duration: 45,
        caloriesBurn: 400,
        intensity: 'medium',
        targetMuscles: ['full_body'],
        equipment: ['dumbbells'],
        tags: ['strength', 'muscle_building', 'compound'],
        exercises: [
          { name: 'Goblet Squats', reps: '12', sets: 4, restTime: 60, instructions: 'Hold weight at chest, squat deep' },
          { name: 'Dumbbell Bench Press', reps: '10', sets: 4, restTime: 60, instructions: 'Lie on bench, press weights up' },
          { name: 'Bent Over Rows', reps: '12', sets: 4, restTime: 60, instructions: 'Hinge at hips, pull weights to ribs' },
          { name: 'Overhead Press', reps: '10', sets: 3, restTime: 60, instructions: 'Press weights overhead from shoulders' },
          { name: 'Romanian Deadlifts', reps: '12', sets: 3, restTime: 60, instructions: 'Hinge at hips, lower weights along legs' },
          { name: 'Plank Hold', duration: 45, sets: 3, restTime: 30, instructions: 'Hold rigid plank position' },
        ],
        sortOrder: 1,
      },
      {
        name: 'Bodyweight Basics',
        description:
          'No equipment needed. Build functional strength using only your bodyweight.',
        category: 'fitness',
        subcategory: 'bodyweight',
        difficulty: 'beginner',
        duration: 30,
        caloriesBurn: 250,
        intensity: 'medium',
        targetMuscles: ['full_body'],
        equipment: [],
        tags: ['no_equipment', 'beginner', 'home'],
        exercises: [
          { name: 'Push-Ups', reps: '10', sets: 3, restTime: 45, instructions: 'Hands shoulder-width, lower chest to floor' },
          { name: 'Bodyweight Squats', reps: '15', sets: 3, restTime: 45, instructions: 'Feet shoulder-width, sit back and down' },
          { name: 'Lunges', reps: '10 each', sets: 3, restTime: 45, instructions: 'Step forward, lower back knee' },
          { name: 'Plank', duration: 30, sets: 3, restTime: 30, instructions: 'Hold rigid plank position' },
          { name: 'Superman', reps: '12', sets: 3, restTime: 30, instructions: 'Lie face down, lift arms and legs' },
          { name: 'Glute Bridges', reps: '15', sets: 3, restTime: 30, instructions: 'Lie on back, drive hips up' },
        ],
        sortOrder: 2,
      },
      // ===== FAT LOSS =====
      {
        name: 'Full Body Fat Loss',
        description:
          'High-intensity circuit designed to maximize calorie burn and fat loss.',
        category: 'fat_loss',
        subcategory: 'full_body',
        difficulty: 'intermediate',
        duration: 30,
        caloriesBurn: 450,
        intensity: 'high',
        targetMuscles: ['full_body'],
        equipment: [],
        tags: ['fat_burn', 'circuit', 'intense'],
        exercises: [
          { name: 'Burpees', reps: '10', sets: 4, restTime: 20, instructions: 'Full burpee with push-up and jump' },
          { name: 'Jump Squats', reps: '15', sets: 4, restTime: 20, instructions: 'Squat deep, explode up' },
          { name: 'Mountain Climbers', duration: 40, sets: 4, restTime: 20, instructions: 'Fast alternating knee drives' },
          { name: 'Lateral Lunges', reps: '12 each', sets: 3, restTime: 20, instructions: 'Step wide to side, lunge' },
          { name: 'High Knees', duration: 30, sets: 4, restTime: 15, instructions: 'Fast running in place, knees high' },
          { name: 'Plank Jacks', duration: 30, sets: 3, restTime: 15, instructions: 'Plank position, jump feet in and out' },
        ],
        sortOrder: 1,
      },
      {
        name: 'Belly Fat Burner',
        description:
          'Targeted core and full-body exercises to help reduce belly fat.',
        category: 'fat_loss',
        subcategory: 'belly',
        difficulty: 'intermediate',
        duration: 25,
        caloriesBurn: 350,
        intensity: 'high',
        targetMuscles: ['core', 'abs', 'obliques'],
        equipment: [],
        tags: ['core', 'abs', 'belly_fat'],
        exercises: [
          { name: 'Bicycle Crunches', reps: '20', sets: 4, restTime: 15, instructions: 'Alternate elbow to opposite knee' },
          { name: 'Russian Twists', reps: '20', sets: 3, restTime: 15, instructions: 'Seated twist, touch floor each side' },
          { name: 'Plank to Push-Up', reps: '10', sets: 3, restTime: 20, instructions: 'Alternate between forearm and hand plank' },
          { name: 'Flutter Kicks', duration: 30, sets: 4, restTime: 15, instructions: 'Lie on back, alternate small leg kicks' },
          { name: 'Burpees', reps: '8', sets: 3, restTime: 30, instructions: 'Full burpee for cardio burn' },
        ],
        sortOrder: 2,
      },
      {
        name: 'Cardio Fat Loss',
        description:
          'Sustained cardio intervals to keep heart rate elevated and burn maximum fat.',
        category: 'fat_loss',
        subcategory: 'cardio',
        difficulty: 'beginner',
        duration: 30,
        caloriesBurn: 350,
        intensity: 'medium',
        targetMuscles: ['full_body', 'legs'],
        equipment: [],
        tags: ['cardio', 'endurance', 'beginner_fat_loss'],
        exercises: [
          { name: 'Jumping Jacks', duration: 60, sets: 4, restTime: 20, instructions: 'Continuous jumping jacks' },
          { name: 'Speed Skaters', duration: 45, sets: 3, restTime: 20, instructions: 'Lateral jumps, touch floor' },
          { name: 'Step-Up Alternating', reps: '20', sets: 3, restTime: 20, instructions: 'Step up on elevated surface' },
          { name: 'Shadow Boxing', duration: 60, sets: 3, restTime: 15, instructions: 'Punch combinations, stay light on feet' },
          { name: 'Butt Kicks', duration: 45, sets: 3, restTime: 15, instructions: 'Run in place kicking heels to glutes' },
        ],
        sortOrder: 3,
      },
      {
        name: 'Fat Burn HIIT',
        description:
          'Advanced HIIT workout designed specifically for maximum fat oxidation.',
        category: 'fat_loss',
        subcategory: 'hiit',
        difficulty: 'advanced',
        duration: 25,
        caloriesBurn: 500,
        intensity: 'high',
        targetMuscles: ['full_body'],
        equipment: [],
        tags: ['hiit', 'fat_burn', 'advanced'],
        exercises: [
          { name: 'Thrusters', reps: '12', sets: 5, restTime: 15, instructions: 'Squat to overhead press in one motion' },
          { name: 'Broad Jumps', reps: '8', sets: 4, restTime: 20, instructions: 'Jump forward as far as possible' },
          { name: 'Battle Rope Slams', duration: 30, sets: 4, restTime: 15, instructions: 'Slam ropes alternating or together' },
          { name: 'Tuck Jumps', reps: '10', sets: 4, restTime: 20, instructions: 'Jump high, tuck knees to chest' },
          { name: 'Devil\'s Press', reps: '8', sets: 3, restTime: 30, instructions: 'Burpee with dumbbell snatch' },
        ],
        sortOrder: 4,
      },
    ];

    const created = await this.fitnessWorkoutModel.insertMany(defaultWorkouts);
    return {
      message: 'Default workouts seeded successfully',
      count: created.length,
    };
  }
}
