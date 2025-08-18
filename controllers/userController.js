const { User } = require("../models/Structure");

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body; // e.g., { name: 'New Name', email: 'new@email.com' }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload profile picture
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.avatar = req.file.path; // Save the file path
    await user.save();
    res.status(200).json({ message: "Avatar uploaded", avatar: user.avatar });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user preferences
exports.getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("preferences");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user.preferences || {});
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  try {
    const preferences = req.body; // e.g., { theme: 'dark', language: 'en' }
    const user = await User.findByIdAndUpdate(req.user._id, { preferences }, { new: true }).select("preferences");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user.preferences);
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user statistics
exports.getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("stats");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user.stats || {});
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Server error" });
  }
};
