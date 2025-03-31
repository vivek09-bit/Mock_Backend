const jwt = require("jsonwebtoken");
const { User } = require("../models/Structure");

const authMiddleware = async (req, res, next) => {
  
  const token = req.header("Authorization")?.split(" ")[1]?.trim();
  console.log(`My token ${token}`);
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No token in request. Header:", authHeader);  // ✅ Debug log
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // const token = authHeader.split(" ")[1];
  console.log("✅ Extracted Token:", token);  // ✅ Debug log

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Token:", decoded);  // ✅ Debug log

    req.user = await User.findById(decoded.userId).select("-password");
    if (!req.user) {
      console.log("❌ User not found in DB:", decoded.userId);  // ✅ Debug log
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);  // ✅ Debug log
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;

