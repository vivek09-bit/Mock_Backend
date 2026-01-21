const express = require("express");
const router = express.Router();

const { sendEmail } = require("../utils/emailService");
const jwt = require("jsonwebtoken");
const { User, PendingVerification } = require("../models/Structure");
const { verificationEmailTemplate } = require("../utils/emailTemplates");

// Helper to send verification email
const sendVerificationEmail = async (email, otp) => {
  // This function sends a verification email to the user with the provided OTP
  await sendEmail(
    email,
    "Verify your email - Ignite",
    verificationEmailTemplate(otp)
  );
};

// 1. Initiate Verification (Send OTP)
router.post("/initiate", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save or update OTP
    await PendingVerification.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        otp,
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Send OTP email via Brevo
    await sendVerificationEmail(normalizedEmail, otp);

    res.json({
      success: true,
      message: "Verification code sent to email",
    });
  } catch (error) {
    console.error("Verification Initiate Error:", error);
    res.status(500).json({ message: "Failed to send verification email" });
  }
});

// 2. Verify OTP
router.post("/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const normalizedEmail = email.toLowerCase();

    const record = await PendingVerification.findOne({
      email: normalizedEmail,
    });

    if (!record) {
      return res.status(400).json({
        message: "Verification code expired",
      });
    }


    if (record.otp !== otp) {
      return res.status(400).json({
        message: "Invalid verification code",
      });
    }

    // Issue verification token
    const verificationToken = jwt.sign(
      {
        email: normalizedEmail,
        verified: true,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );


    await PendingVerification.deleteOne({ email: normalizedEmail });

    res.json({
      success: true,
      verificationToken,
    });

  } catch (error) {
    console.error("Verification Verify Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
