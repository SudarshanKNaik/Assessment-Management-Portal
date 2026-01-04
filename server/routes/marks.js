const express = require('express');
const router = express.Router();
const Marks = require('../models/Marks');
const { auth, isFaculty, isStudent } = require('../middleware/auth');

// Get all marks (Faculty only) - filtered by query parameters
router.get('/all', auth, isFaculty, async (req, res) => {
  try {
    const { courseCode, division, semester } = req.query;
    
    if (!courseCode || !division || !semester) {
      return res.status(400).json({ message: 'Course, Division, and Semester are required' });
    }
    
    const query = {
      courseCode,
      division,
      semester
    };
    
    const marks = await Marks.find(query).sort({ usn: 1 });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student's own marks
router.get('/my-marks', auth, isStudent, async (req, res) => {
  try {
    const marks = await Marks.find({ usn: req.user.usn });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload/Update marks (Faculty only)
router.post('/upload', auth, isFaculty, async (req, res) => {
  try {
    const { usn, courseCode, courseName, marks, semester, division, department } = req.body;

    // Validation
    if (!usn || !courseCode || !courseName || marks === undefined || !semester || !division || !department) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (marks < 0 || marks > 100) {
      return res.status(400).json({ message: 'Marks must be between 0 and 100' });
    }

    const validCourses = ['25ECSC301', '24ECSP304', '24ECSC303'];
    if (!validCourses.includes(courseCode)) {
      return res.status(400).json({ message: 'Invalid course code' });
    }

    // Find or create marks
    const existingMarks = await Marks.findOne({ usn, courseCode, semester, division });

    if (existingMarks) {
      // Update existing marks
      existingMarks.marks = marks;
      existingMarks.courseName = courseName;
      existingMarks.facultyId = req.user.facultyId;
      await existingMarks.save();
      return res.json({ message: 'Marks updated successfully', marks: existingMarks });
    } else {
      // Create new marks
      const newMarks = new Marks({
        usn,
        studentId: usn, // Keep for backward compatibility
        courseCode,
        courseName,
        marks,
        semester,
        division,
        department,
        facultyId: req.user.facultyId
      });
      await newMarks.save();
      return res.status(201).json({ message: 'Marks uploaded successfully', marks: newMarks });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Marks already exist for this student, course, semester, and division' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update marks (Faculty only)
router.put('/update/:id', auth, isFaculty, async (req, res) => {
  try {
    const { marks } = req.body;

    if (marks === undefined || marks < 0 || marks > 100) {
      return res.status(400).json({ message: 'Marks must be between 0 and 100' });
    }

    const marksDoc = await Marks.findById(req.params.id);
    if (!marksDoc) {
      return res.status(404).json({ message: 'Marks not found' });
    }

    marksDoc.marks = marks;
    await marksDoc.save();

    res.json({ message: 'Marks updated successfully', marks: marksDoc });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete marks (Faculty only)
router.delete('/delete/:id', auth, isFaculty, async (req, res) => {
  try {
    const marks = await Marks.findByIdAndDelete(req.params.id);
    if (!marks) {
      return res.status(404).json({ message: 'Marks not found' });
    }
    res.json({ message: 'Marks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

