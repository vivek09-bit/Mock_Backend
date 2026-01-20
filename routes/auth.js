const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { User, Test } = require("../models/Structure");
const verifyToken = require("../middleware/verifyToken");
const { v4: uuidv4 } = require("uuid");
const { startTest, submitTest } = require("../controllers/testController");
const authMiddleware = require("../middleware/authMiddleware");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { welcomeEmailTemplate, resetPasswordTemplate, passwordChangeSuccessTemplate } = require('../utils/emailTemplates');


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

    // 1. Verify the Email Token first (Security Check)
    const { verificationToken } = req.body;
    if (!verificationToken) {
      return res.status(403).json({ message: "Email verification required before registration." });
    }

    try {
      const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET);
      if (decoded.email !== email || !decoded.verified) {
        return res.status(403).json({ message: "Invalid verification token for this email." });
      }
      // Valid token! Proceed with registration.
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired verification token." });
    }

    // Input validation
    if (!name || !username || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ message: "Username must be 3–20 characters." });
    }

    // Email validation (redundant if verified, but good for format check)
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

    // Send welcome email (best-effort; do not block registration on email failures)
    sendWelcomeEmail(newUser.email, newUser.username, newUser.name).catch(err => {
      console.error('Welcome email error:', err);
    });

    res.status(201).json({
      message: "User registered successfully.",
      profileURL,
      username,
    });

  } catch (error) {
    console.error("Registration error:", error.message);
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

// =========================== FORGOT / RESET PASSWORD ===========================
// Helper to send reset email if SMTP is configured; otherwise log the link
const sendResetEmail = async (toEmail, resetLink) => {
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: toEmail,
        subject: 'Password reset request - Ignite',
        html: resetPasswordTemplate(resetLink),
      });

      console.log('Reset email sent:', info.messageId);
      return info;
    } else {
      // Fallback: log the reset link so developer can use it in environments without SMTP
      console.log('No SMTP config found. Reset link (log only):', resetLink);
      return null;
    }
  } catch (err) {
    console.error('Error sending reset email:', err);
    throw err;
  }
};

// Helper to send welcome email after registration
const sendWelcomeEmail = async (toEmail, username, name) => {
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
      const subject = 'Welcome to Ignite! 🚀';
      const html = welcomeEmailTemplate(name, username);

      const info = await transporter.sendMail({
        from,
        to: toEmail,
        subject,
        html,
      });

      console.log('Welcome email sent:', info.messageId);
      return info;
    } else {
      // If SMTP not configured, log the welcome notice
      console.log(`Welcome email (log): To=${toEmail}, Username=${username}`);
      return null;
    }
  } catch (err) {
    console.error('Error sending welcome email:', err);
    throw err;
  }
};

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Do not reveal whether the email exists
      return res.status(200).json({ message: 'If the email exists, a reset link has been sent.' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontend}/reset-password/${token}`;

    await sendResetEmail(user.email, resetLink);

    res.status(200).json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password is required.' });

    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token.' });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: user.email,
        subject: "Password Changed Successfully - Ignite",
        html: passwordChangeSuccessTemplate(user.name || user.username),
      });
    }

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});
