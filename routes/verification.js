const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { User, PendingVerification } = require("../models/Structure");

// Helper to send email
const sendVerificationEmail = async (email, otp) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[DEV] SMTP not set. OTP for ${email} is: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Verify your email - Ignite",
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is: <strong>${otp}</strong></p>
      <p>This code expires in 10 minutes.</p>
    `,
  });
};

// 1. Initiate Verification (Send OTP)
router.post("/initiate", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB (upsert)
    await PendingVerification.findOneAndUpdate(
      { email: email.toLowerCase() },
      { email: email.toLowerCase(), otp: otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send Email
    await sendVerificationEmail(email, otp);

    res.json({ success: true, message: "Verification code sent to email" });
  } catch (error) {
    console.error("Verification Initiate Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 2. Verify OTP
router.post("/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    const record = await PendingVerification.findOne({ email: email.toLowerCase() });
    
    if (!record) {
      return res.status(400).json({ message: "Verification code expired or invalid" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // OTP Matches! Issue a specific "verification token" for registration
    // This token proves that this specific email was verified
    const verificationToken = jwt.sign(
      { email: email.toLowerCase(), verified: true },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Optional: Delete the pending record immediately (or let it expire)
    // await PendingVerification.deleteOne({ _id: record._id }); 
    // Keeping it might prevent spamming "initiate" again immediately, but for now let's keep logic simple.

    res.json({ success: true, verificationToken });

  } catch (error) {
    console.error("Verification Verify Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
