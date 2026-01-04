const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, isFaculty } = require('../middleware/auth');

// Get all students by division and semester (Faculty only)
router.get('/by-division-semester', auth, isFaculty, async (req, res) => {
  try {
    const { division, semester } = req.query;
    
    if (!division || !semester) {
      return res.status(400).json({ message: 'Division and Semester are required' });
    }
    
    const students = await User.find({
      role: 'student',
      division,
      semester
    }).select('usn name email department division semester academicYear').sort({ usn: 1 });
    
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

