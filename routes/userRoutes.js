const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Use existing auth middleware
const upload = require('../middleware/upload'); // New upload middleware
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  getPreferences,
  updatePreferences,
  getStats,
  deleteAccount
} = require('../controllers/userController'); // New user controller

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), uploadAvatar);
router.get('/preferences', authMiddleware, getPreferences);
router.put('/preferences', authMiddleware, updatePreferences);
router.get('/stats', authMiddleware, getStats);
router.delete('/account', authMiddleware, deleteAccount);

module.exports = router;
