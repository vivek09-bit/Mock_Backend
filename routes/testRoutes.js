const express = require("express");
const router = express.Router();
const { Test, UserTestRecord } = require("../models/Structure");
const auth = require("../middleware/authMiddleware");

// Get all available tests (with filters)
router.get("/", auth, async (req, res) => {
    try {
      const { category, examTarget, stage, type } = req.query;

      // Build filter object based on query params
      const filter = {};
      if (category) filter.category = category;
      if (examTarget) filter.examTarget = examTarget;
      if (stage) filter.stage = stage;
      if (type) filter.type = type;

      const tests = await Test.find(filter);
      
      res.json(tests);
  
    } catch (error) {
      // console.error("Error fetching tests:", error); // 👈 Log the exact error
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  

// Get test details by ID
router.get("/:testId", auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId).populate("questionSets.setId");
    if (!test) return res.status(404).json({ message: "Test not found" });

    const questions = test.questionSets.flatMap(set => set.setId.questions.slice(0, set.numToPick));
    
    res.json({
      name: test.name,
      description: test.description,
      questions,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/submit", auth, async (req, res) => {
  try {
      const { testId, userId, answers } = req.body;
      // console.log(req.body);

      if (!testId || !userId || !answers) {
          return res.status(400).json({ message: "Missing required fields" });
      }

      // Fetch test details
      const test = await Test.findById(testId).populate("questionSets.setId");

      if (!test) {
          return res.status(404).json({ message: "Test not found" });
      }

      let totalQuestions = 0;
      let correctAnswers = 0;
      let attemptedQuestions = [];

      // Iterate through all question sets in the test
      for (const set of test.questionSets) {
          if (!set.setId) continue;

          totalQuestions += set.numToPick;

          const selectedQuestions = set.setId.questions.slice(0, set.numToPick);

          selectedQuestions.forEach((question) => {
              const selectedOption = answers[question._id]; // User sends the Option Value (String) now

              if (selectedOption !== undefined) {
                  // Direct string comparison since both are strings now
                  const isCorrect = selectedOption === question.correct_option;
                  if (isCorrect) correctAnswers++;

                  attemptedQuestions.push({
                      questionId: question._id,
                      questionText: question.question.text, // Access nested text
                      selectedOption,
                      isCorrect,
                  });
              }
          });
      }

      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = score >= test.passingScore;

      // Save user test attempt
      const userTestRecord = await UserTestRecord.findOneAndUpdate(
          { userId, testId },
          {
              $push: {
                  attempts: {
                      questionsAttempted: attemptedQuestions,
                      score,
                      timestamp: new Date(),
                  },
              },
              $set: { 
                lastAttempted: new Date(),
                testDetails: {
                  testName: test.name,
                  totalQuestions: totalQuestions,
                  passingScore: test.passingScore
                }
              },
              $max: { bestScore: score },
          },
          { upsert: true, new: true }
      );

      res.json({
          message: "Test submitted successfully",
          score,
          testId,
          passed,
          totalQuestions,
          correctAnswers,
          userTestRecord,
      });
  } catch (error) {
      // console.error("Error submitting test:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
});



module.exports = router;
