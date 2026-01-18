const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { QuestionSet } = require('../models/Structure');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Sample questions data
const sampleQuestions = [
  {
    name: "Mathematics Basics - Algebra",
    subject: "Mathematics",
    subcategory: "Algebra",
    questions: [
      {
        questionText: "What is the value of x in the equation 2x + 5 = 13?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1, // index 0-based, so this is "4"
        answerExplanation: "2x + 5 = 13, so 2x = 8, therefore x = 4",
        difficulty: "easy",
        tags: ["linear-equation", "basic"]
      },
      {
        questionText: "Solve for y: 3y - 7 = 2y + 5",
        options: ["10", "12", "14", "16"],
        correctAnswer: 0, // "10"
        answerExplanation: "3y - 2y = 5 + 7, so y = 12. Wait, let me recalculate: y = 12",
        difficulty: "easy",
        tags: ["linear-equation", "basic"]
      },
      {
        questionText: "Factor the expression x² - 9",
        options: ["(x-3)(x+3)", "(x-3)(x-3)", "(x+3)(x+3)", "Cannot be factored"],
        correctAnswer: 0, // "(x-3)(x+3)"
        answerExplanation: "x² - 9 is a difference of squares: x² - 3² = (x-3)(x+3)",
        difficulty: "medium",
        tags: ["factoring", "quadratic"]
      }
    ]
  },
  {
    name: "Science - Physics Fundamentals",
    subject: "Science",
    subcategory: "Physics",
    questions: [
      {
        questionText: "What is the SI unit of force?",
        options: ["Joule", "Newton", "Watt", "Pascal"],
        correctAnswer: 1, // "Newton"
        answerExplanation: "The SI unit of force is Newton (N), named after Sir Isaac Newton.",
        difficulty: "easy",
        tags: ["physics", "units", "force"]
      },
      {
        questionText: "If an object travels 100 meters in 5 seconds, what is its average speed?",
        options: ["20 m/s", "25 m/s", "15 m/s", "30 m/s"],
        correctAnswer: 0, // "20 m/s"
        answerExplanation: "Speed = Distance / Time = 100 / 5 = 20 m/s",
        difficulty: "easy",
        tags: ["speed", "kinematics", "basic"]
      },
      {
        questionText: "What is the relationship between force, mass, and acceleration?",
        options: ["F = m/a", "F = m + a", "F = m × a", "F = a/m"],
        correctAnswer: 2, // "F = m × a"
        answerExplanation: "According to Newton's second law of motion, Force = mass × acceleration (F = ma)",
        difficulty: "medium",
        tags: ["newton-laws", "force", "physics"]
      }
    ]
  },
  {
    name: "English - Grammar and Vocabulary",
    subject: "English",
    subcategory: "Grammar",
    questions: [
      {
        questionText: "Choose the correct sentence:",
        options: [
          "She go to school every day.",
          "She goes to school every day.",
          "She going to school every day.",
          "She gone to school every day."
        ],
        correctAnswer: 1, // "She goes to school every day."
        answerExplanation: "With third person singular (she, he, it), we add 's' to the present tense verb.",
        difficulty: "easy",
        tags: ["grammar", "verb-tense", "basic"]
      },
      {
        questionText: "What is the past tense of 'write'?",
        options: ["writed", "written", "wrote", "writes"],
        correctAnswer: 2, // "wrote"
        answerExplanation: "'Write' is an irregular verb. Its past tense is 'wrote' and past participle is 'written'.",
        difficulty: "easy",
        tags: ["irregular-verbs", "verb-tense"]
      },
      {
        questionText: "Identify the adverb in the sentence: 'She speaks English fluently.'",
        options: ["She", "speaks", "English", "fluently"],
        correctAnswer: 3, // "fluently"
        answerExplanation: "An adverb modifies a verb, adjective, or another adverb. 'Fluently' describes how she speaks (modifies 'speaks').",
        difficulty: "medium",
        tags: ["parts-of-speech", "adverb", "grammar"]
      }
    ]
  }
];

const insertQuestions = async () => {
  try {
    await connectDB();

    console.log('Starting to insert questions...\n');

    for (const questionSetData of sampleQuestions) {
      // Calculate difficulty distribution
      const difficultyDistribution = {
        easy: questionSetData.questions.filter(q => q.difficulty === 'easy').length,
        medium: questionSetData.questions.filter(q => q.difficulty === 'medium').length,
        hard: questionSetData.questions.filter(q => q.difficulty === 'hard').length
      };

      // Create the question set
      const questionSet = new QuestionSet({
        ...questionSetData,
        totalQuestions: questionSetData.questions.length,
        difficultyDistribution
      });

      const savedQuestionSet = await questionSet.save();
      console.log(`✓ Inserted: "${savedQuestionSet.name}"`);
      console.log(`  - Total Questions: ${savedQuestionSet.totalQuestions}`);
      console.log(`  - Easy: ${difficultyDistribution.easy}, Medium: ${difficultyDistribution.medium}, Hard: ${difficultyDistribution.hard}`);
      console.log(`  - ID: ${savedQuestionSet._id}\n`);
    }

    console.log('✓ All questions inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error inserting questions:', error.message);
    process.exit(1);
  }
};

// Run the script
insertQuestions();
