const express = require('express');
const router = express.Router();
const Marks = require('../models/Marks');
const User = require('../models/User');
const { auth, isFaculty } = require('../middleware/auth');

// Get statistics for a course (Faculty only) - filtered by query parameters
router.get('/course/:courseCode', auth, isFaculty, async (req, res) => {
  try {
    const { courseCode } = req.params;
    const { division, semester } = req.query;
    
    const validCourses = ['25ECSC301', '24ECSP304', '24ECSC303'];
    if (!validCourses.includes(courseCode)) {
      return res.status(400).json({ message: 'Invalid course code' });
    }

    if (!division || !semester) {
      return res.status(400).json({ message: 'Division and Semester are required' });
    }

    const query = {
      courseCode,
      division,
      semester
    };

    // Get all students in this division and semester
    const allStudents = await User.find({
      role: 'student',
      division,
      semester
    });

    // Get marks for this course, division, and semester
    const marks = await Marks.find(query);
    
    // Calculate average only from students who have marks
    let average = 0;
    if (marks.length > 0) {
      const totalMarks = marks.reduce((sum, m) => sum + (m.total || m.marks || 0), 0);
      average = parseFloat((totalMarks / marks.length).toFixed(2));
    }

    // Count grades
    const gradeDistribution = {
      S: marks.filter(m => m.grade === 'S').length,
      A: marks.filter(m => m.grade === 'A').length,
      B: marks.filter(m => m.grade === 'B').length,
      C: marks.filter(m => m.grade === 'C').length,
      D: marks.filter(m => m.grade === 'D').length,
      F: marks.filter(m => m.grade === 'F').length
    };

    res.json({
      courseCode,
      division,
      semester,
      totalStudents: allStudents.length, // Total students in division/semester
      studentsWithMarks: marks.length, // Students who have marks for this course
      average: average,
      gradeDistribution
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get statistics for all courses (Faculty only) - This route is deprecated, use /course/:courseCode instead
router.get('/all', auth, isFaculty, async (req, res) => {
  try {
    res.status(400).json({ message: 'Please use /statistics/course/:courseCode with division and semester query parameters' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

