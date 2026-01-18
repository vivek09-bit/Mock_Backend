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

// Sample test attempts data
const createTestAttempts = async () => {
  try {
    await connectDB();

    // Fetch all question sets
    const questionSets = await QuestionSet.find();

    if (questionSets.length === 0) {
      console.log('No question sets found. Please run insertQuestions.js first.');
      process.exit(0);
    }

    console.log(`Found ${questionSets.length} question sets\n`);

    // Create test attempt records for each question set
    for (const questionSet of questionSets) {
      const testAttempts = [
        {
          questionSetId: questionSet._id,
          questionSetName: questionSet.name,
          userId: '64a7c9e1f8b2d3e4f5g6h7i8', // Sample user ID
          username: 'john_doe',
          email: 'john@example.com',
          answers: questionSet.questions.map((q, idx) => ({
            questionId: idx,
            questionText: q.questionText,
            selectedAnswerIndex: Math.floor(Math.random() * q.options.length),
            correctAnswerIndex: q.correctAnswer,
            isCorrect: Math.random() > 0.4, // 60% correct answers
            timeTaken: Math.floor(Math.random() * 120) + 10, // 10-130 seconds
          })),
          totalQuestions: questionSet.questions.length,
          totalCorrect: 0,
          totalWrong: 0,
          totalSkipped: 0,
          score: 0,
          percentage: 0,
          difficulty: questionSet.subcategory,
          subject: questionSet.subject,
          startTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last 7 days
          endTime: new Date(),
          totalTime: Math.floor(Math.random() * 3600) + 300, // 5 mins to 1 hour
          status: 'completed'
        },
        {
          questionSetId: questionSet._id,
          questionSetName: questionSet.name,
          userId: '64a7c9e1f8b2d3e4f5g6h7i9', // Different user ID
          username: 'jane_smith',
          email: 'jane@example.com',
          answers: questionSet.questions.map((q, idx) => ({
            questionId: idx,
            questionText: q.questionText,
            selectedAnswerIndex: Math.floor(Math.random() * q.options.length),
            correctAnswerIndex: q.correctAnswer,
            isCorrect: Math.random() > 0.3, // 70% correct answers
            timeTaken: Math.floor(Math.random() * 100) + 20, // 20-120 seconds
          })),
          totalQuestions: questionSet.questions.length,
          totalCorrect: 0,
          totalWrong: 0,
          totalSkipped: 0,
          score: 0,
          percentage: 0,
          difficulty: questionSet.subcategory,
          subject: questionSet.subject,
          startTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          endTime: new Date(),
          totalTime: Math.floor(Math.random() * 3600) + 300,
          status: 'completed'
        }
      ];

      // Calculate scores for each attempt
      for (const attempt of testAttempts) {
        attempt.answers.forEach(answer => {
          if (answer.isCorrect) {
            attempt.totalCorrect++;
          } else {
            attempt.totalWrong++;
          }
        });
        
        attempt.score = attempt.totalCorrect;
        attempt.percentage = Math.round((attempt.totalCorrect / attempt.totalQuestions) * 100);
      }

      // Log the test attempts
      console.log(`\n📝 Test Attempts for: "${questionSet.name}"\n`);
      
      for (const attempt of testAttempts) {
        console.log(`  👤 User: ${attempt.username} (${attempt.email})`);
        console.log(`     Score: ${attempt.score}/${attempt.totalQuestions} (${attempt.percentage}%)`);
        console.log(`     ✓ Correct: ${attempt.totalCorrect} | ✗ Wrong: ${attempt.totalWrong}`);
        console.log(`     Time Taken: ${(attempt.totalTime / 60).toFixed(2)} minutes\n`);
      }

      console.log(`✓ Created ${testAttempts.length} test attempts for "${questionSet.name}"`);
      console.log('─'.repeat(60));
    }

    console.log('\n✓ All test attempts logged successfully!');
    console.log('\nNote: These are sample test attempt records for demonstration.');
    console.log('To save these to database, add a database model and save() calls.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test attempts:', error.message);
    process.exit(1);
  }
};

// Run the script
createTestAttempts();
