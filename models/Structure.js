const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true }, // Unique username
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, unique: true },
  role: { type: String, enum: ["Student", "Teacher"], default: "Student" },
  subscription_status: { type: String, default: "inactive" },
  userID: { type: String, unique: true }, // Unique user ID
  profileURL: { type: String, unique: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

// Question Set Schema
const QuestionSetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  subcategory: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  questions: [
    {
      topic: { type: String },
      subtopic: { type: String },
      question: {
        text: { type: String, required: true }
      },
      options: { type: [String], required: true },
      correct_option: { type: String, required: true },
      explanation: {
        text: { type: String }
      },
      tags: [String]
    }
  ],
  totalQuestions: { type: Number, default: 0 },
  difficultyDistribution: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

// Test Schema
const TestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  isPublic: { type: Boolean, default: true },
  accessPasscode: { type: String, default: null },
  questionSets: [
    {
      setId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionSet' },
      numToPick: { type: Number, required: true }
    }
  ],
  passingScore: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// User Test Record Schema
const UserTestRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  testDetails: {
    testName: { type: String, required: true },
    totalQuestions: { type: Number, required: true },
    passingScore: { type: Number, required: true }
  },
  attempts: [
    {
      questionsAttempted: [
        {
          questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionSet.questions' },
          questionText: { type: String, required: true },
          selectedOption: { type: String, required: true }, // Changed from Number to String to match correct_option
          isCorrect: { type: Boolean, required: true }
        }
      ],
      score: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  bestScore: { type: Number, default: 0 },
  lastAttempted: { type: Date, default: null }
});

// Subscription Schema
const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubPlan', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Expired'], required: true }
});

// Subscription Plan Schema
const SubPlanSchema = new mongoose.Schema({
  planName: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add fields for preferences, stats, and avatar (required for new user APIs)
UserSchema.add({
  avatar: { type: String }, // URL or path to uploaded avatar
  preferences: { type: Map, of: String }, // e.g., { theme: 'dark', language: 'en' }
  stats: { type: Map, of: Number } // e.g., { testsTaken: 5, averageScore: 80 }
});


// Pending Verification Schema (for OTPs)
const PendingVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-delete after 10 minutes
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  QuestionSet: mongoose.model('QuestionSet', QuestionSetSchema),
  Test: mongoose.model('Test', TestSchema),
  UserTestRecord: mongoose.model('UserTestRecord', UserTestRecordSchema),
  Subscription: mongoose.model('Subscription', SubscriptionSchema),
  SubPlan: mongoose.model('SubPlan', SubPlanSchema),
  PendingVerification: mongoose.model('PendingVerification', PendingVerificationSchema)
};