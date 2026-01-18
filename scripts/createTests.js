const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Test, QuestionSet } = require('../models/Structure');

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

const createTests = async () => {
  try {
    await connectDB();

    // Fetch all question sets
    const questionSets = await QuestionSet.find();

    if (questionSets.length === 0) {
      console.log('No question sets found. Please run insertQuestions.js first.');
      process.exit(0);
    }

    console.log(`Found ${questionSets.length} question sets\n`);
    console.log('Creating tests for newly inserted question sets...\n');

    // Filter out the old "General Knowledge" test and only process new ones
    const newQuestionSets = questionSets.filter(qs => 
      qs.name.includes('Mathematics') || 
      qs.name.includes('Science') || 
      qs.name.includes('English')
    );

    for (const questionSet of newQuestionSets) {
      // Create a test for each question set
      const newTest = new Test({
        name: `${questionSet.name} - Test`,
        description: `Full test covering ${questionSet.name}. Total ${questionSet.totalQuestions} questions.`,
        isPublic: true,
        accessPasscode: null,
        questionSets: [
          {
            setId: questionSet._id,
            numToPick: questionSet.totalQuestions // Include all questions from this set
          }
        ],
        passingScore: Math.ceil(questionSet.totalQuestions * 0.6) // 60% passing score
      });

      const savedTest = await newTest.save();
      
      console.log(`✓ Created Test: "${savedTest.name}"`);
      console.log(`  - ID: ${savedTest._id}`);
      console.log(`  - QuestionSet: ${questionSet.name}`);
      console.log(`  - Total Questions: ${questionSet.totalQuestions}`);
      console.log(`  - Passing Score: ${savedTest.passingScore}`);
      console.log(`  - Public: ${savedTest.isPublic}\n`);
    }

    // Verify all tests
    const allTests = await Test.find().populate('questionSets.setId');
    console.log('─'.repeat(70));
    console.log(`\n✓ Total Tests in Database: ${allTests.length}\n`);
    
    allTests.forEach((test, idx) => {
      console.log(`${idx + 1}. ${test.name}`);
      console.log(`   ID: ${test._id}`);
      console.log(`   Passing Score: ${test.passingScore}`);
      console.log(`   Question Sets: ${test.questionSets.length}\n`);
    });

    console.log('✓ All tests created and saved successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tests:', error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run the script
createTests();
