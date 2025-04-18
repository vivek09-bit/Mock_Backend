const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { User, Test } = require("../models/Structure");
const verifyToken = require("../middleware/verifyToken");
const { v4: uuidv4 } = require("uuid");
const { startTest, submitTest } = require("../controllers/testController");
const authMiddleware = require("../middleware/authMiddleware");


const router = express.Router();

// Helper function to handle errors
const handleError = (res, statusCode, message, error = null) => {
  // if (error) console.error(error);
  return res.status(statusCode).json({ success: false, message });
};


// =========================== REGISTER ===========================


router.post("/register", async (req, res) => {
  try {
    let { name, username, email, password, phone } = req.body;

    // Trim and normalize input
    name = name?.trim();
    username = username?.trim().toLowerCase();
    email = email?.trim().toLowerCase();
    phone = phone?.trim();

    // Input validation
    if (!name || !username || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ message: "Username must be 3–20 characters." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Phone number must be 10 digits." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      const conflictField = existingUser.email === email ? "Email" : "Username";
      return res.status(409).json({ message: `${conflictField} already in use.` });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate userID and profileURL
    const userID = uuidv4();
    const profileURL = `https://igniteverse.in/profile/${username}`;

    // Save user
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      phone,
      userID,
      profileURL,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully.",
      profileURL,
      username,
    });

  } catch (error) {
    console.error("❌ Registration error:", error.message);
    res.status(500).json({
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
});




// =========================== LOGIN ===========================
router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await User.findOne({ 
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }] 
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid username/email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username/email or password", error: error.message });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // console.log("Generated Token:", token); // Debugging log

    res.status(200).json({
      token,
      user: {
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profileURL: user.profileURL,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// =========================== PROFILE ===========================
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return handleError(res, 404, "User not found");
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    handleError(res, 500, "Server error", error);
  }
});


//============================Profile/ID===========================
router.get("/profile/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // Find user by username (exclude password)
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    // console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});




// =========================== MOCK TEST ===========================
router.get("/mocktest/:testId", async (req, res) => {
  const { testId } = req.params;

  try {
    const test = await Test.findOne({ _id: testId });
    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    res.status(200).json({ success: true, test });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =========================== QUIZ QUESTIONS ===========================

// Get all questions for a specific test
router.get("/quiz/questions", async (req, res) => {
  try {
    const questions = await Test.find(); 
    if (!questions) {
      return res.status(404).json({ success: false, message: "No questions found" });
    }
    res.status(200).json({ success: true, questions });
  } catch (error) {
    // console.error("Error fetching questions:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
});




router.get("/me", authMiddleware, async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1]?.trim();
    // console.log(`My token ${token}`);
    res.json({ message: "Authenticated user", user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
