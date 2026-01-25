const {QuestionSet, UserTestRecord, Test} = require("../models/Structure");

// Start Test API
exports.startTest = async (req, res) => {
  try {
    const { testId } = req.body;
    const test = await Test.findById(testId).populate("questionSets.setId");

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    // Extract questions from the question sets
    let questions = [];
    test.questionSets.forEach((set) => {
      const selectedQuestions = set.setId.questions.slice(0, set.numToPick);
      questions = questions.concat(selectedQuestions);
    });

    res.status(200).json({
      testName: test.name,
      description: test.description,
      questions,
    });
  } catch (error) {
    console.error("Error starting test:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Submit Test API
exports.submitTest = async (req, res) => {
  try {
    const { testId, answers } = req.body;
    const test = await Test.findById(testId).populate("questionSets.setId");

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    let score = 0;
    let questionsAttempted = [];

    // Check answers
    test.questionSets.forEach((set) => {
      set.setId.questions.forEach((question) => {
        const userAnswer = answers.find((a) => a.questionId === question._id.toString());
        if (userAnswer) {
          const isCorrect = question.correct_option === userAnswer.selectedOption;
          if (isCorrect) score += 1;

          questionsAttempted.push({
            questionId: question._id,
            questionText: question.question.text,
            selectedOption: userAnswer.selectedOption,
            isCorrect,
          });
        }
      });
    });

    // Save test record
    const testRecord = await UserTestRecord.findOneAndUpdate(
      { userId: req.user.id, testId },
      {
        $push: { attempts: { questionsAttempted, score } },
        bestScore: { $max: ["$bestScore", score] },
        lastAttempted: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "Test submitted successfully",
      testId: test._id,
      testName: test.name,
      score: Math.round((score / questionsAttempted.length) * 100), // Return percentage
      totalQuestions: questionsAttempted.length,
      correctAnswers: score, // raw score = number of correct answers
      passingScore: test.passingScore,
      passed: (score / questionsAttempted.length) * 100 >= test.passingScore
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ message: "Server error" });
  }
};
