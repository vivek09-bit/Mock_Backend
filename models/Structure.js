const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true }, // Unique username
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ["Student"], default: "Student" },
  subscription_status: { type: String, default: "inactive" },
  userID: { type: String, unique: true }, // Unique user ID
  profileURL: { type: String, unique: true },  
}, { timestamps: true });

// Question Set Schema
const QuestionSetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  subcategory: { type: String, required: true },
  questions: [
    {
      questionText: { type: String, required: true },
      options: { type: [String], required: true },
      correctAnswer: { type: Number, required: true },
      answerExplanation: { type: String },
      difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
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
          selectedOption: { type: Number, required: true },
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

module.exports = {
  User: mongoose.model('User', UserSchema),
  QuestionSet: mongoose.model('QuestionSet', QuestionSetSchema),
  Test: mongoose.model('Test', TestSchema),
  UserTestRecord: mongoose.model('UserTestRecord', UserTestRecordSchema),
  Subscription: mongoose.model('Subscription', SubscriptionSchema),
  SubPlan: mongoose.model('SubPlan', SubPlanSchema)
};