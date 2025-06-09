import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  name: String,
  result: String,
  difficulty_level: String,
  date: String,
  notes: String,
  title: String, // For AI activities
  why_it_works: String, // For AI activities
  skills_supported: [String], // For AI activities
});

const studentSchema = new mongoose.Schema({
  toddler_id: String,
  toddler_description: String,
  name: String,
  age_months: Number,
  // gender: String,
  personality: String,
  developmental_stage: String,
  recent_activity: {
    name: String,
    result: String,
    difficulty_level: String,
    observations: String,
  },
  interests: [String],
  preferred_learning_style: String,
  social_behavior: String,
  energy_level: String,
  // daily_routine_notes: String,
  goals: [String],
  activity_history: [activitySchema],
  saved_activities: [activitySchema], 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Add reference to User
});

export default mongoose.model('Student', studentSchema);