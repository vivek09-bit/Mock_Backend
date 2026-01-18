const express = require('express');
const router = express.Router();
const { UserTestRecord } = require('../models/Structure');

// Get test records for a user
router.get('/tests/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const records = await UserTestRecord.find({ userId }).lean();
    if (!records || records.length === 0) {
      return res.status(200).json({ success: true, records: [] });
    }
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
