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
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const marks = await Marks.find(query)
      .sort({ usn: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student's own marks
router.get('/my-marks', auth, isStudent, async (req, res) => {
  try {
    const marks = await Marks.find({ usn: req.user.usn }).lean();
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload/Update marks (Faculty only)
router.post('/upload', auth, isFaculty, async (req, res) => {
  try {
    const { usn, courseCode, courseName, isa1, isa2, esa, semester, division, department } = req.body;

    // Validation - at least one mark must be provided
    if (!usn || !courseCode || !courseName || !semester || !division || !department) {
      return res.status(400).json({ message: 'Please provide all required fields (USN, Course, Semester, Division, Department)' });
    }

    // At least one assessment mark should be provided
    if (isa1 === undefined && isa2 === undefined && esa === undefined) {
      return res.status(400).json({ message: 'Please provide at least one assessment mark (ISA 1, ISA 2, or ESA)' });
    }

    // Convert to numbers, default to 0 if not provided
    const isa1Num = isa1 !== undefined && isa1 !== '' ? parseFloat(isa1) : 0;
    const isa2Num = isa2 !== undefined && isa2 !== '' ? parseFloat(isa2) : 0;
    const esaNum = esa !== undefined && esa !== '' ? parseFloat(esa) : 0;
    
    // Validate only if provided
    if (isa1 !== undefined && isa1 !== '') {
      if (isNaN(isa1Num)) {
        return res.status(400).json({ message: 'ISA 1 must be a valid number' });
      }
      if (isa1Num < 0 || isa1Num > 20) {
        return res.status(400).json({ message: 'ISA 1 must be between 0 and 20' });
      }
    }
    
    if (isa2 !== undefined && isa2 !== '') {
      if (isNaN(isa2Num)) {
        return res.status(400).json({ message: 'ISA 2 must be a valid number' });
      }
      if (isa2Num < 0 || isa2Num > 20) {
        return res.status(400).json({ message: 'ISA 2 must be between 0 and 20' });
      }
    }
    
    if (esa !== undefined && esa !== '') {
      if (isNaN(esaNum)) {
        return res.status(400).json({ message: 'ESA must be a valid number' });
      }
      if (esaNum < 0 || esaNum > 60) {
        return res.status(400).json({ message: 'ESA must be between 0 and 60' });
      }
    }

    const validCourses = ['25ECSC301', '24ECSP304', '24ECSC303'];
    if (!validCourses.includes(courseCode)) {
      return res.status(400).json({ message: 'Invalid course code' });
    }

    // Validate division
    const validDivisions = ['A', 'B', 'C'];
    if (!validDivisions.includes(division)) {
      return res.status(400).json({ message: 'Invalid division. Must be A, B, or C' });
    }

    // Find or create marks
    const existingMarks = await Marks.findOne({ usn, courseCode, semester, division }).lean();

    if (existingMarks) {
      // Update existing marks - only update fields that are provided
      if (isa1 !== undefined && isa1 !== '') {
        existingMarks.isa1 = isa1Num;
      }
      if (isa2 !== undefined && isa2 !== '') {
        existingMarks.isa2 = isa2Num;
      }
      if (esa !== undefined && esa !== '') {
        existingMarks.esa = esaNum;
      }
      existingMarks.courseName = courseName;
      existingMarks.facultyId = req.user.facultyId;
      await existingMarks.save();
      return res.json({ message: 'Marks updated successfully', marks: existingMarks });
    } else {
      // Create new marks - total and grade will be calculated by pre-save hook
      // Only include fields that were provided
      const marksData = {
        usn: usn.toUpperCase().trim(),
        studentId: usn.toUpperCase().trim(), // Keep for backward compatibility
        courseCode,
        courseName,
        semester,
        division: division.toUpperCase(),
        department,
        facultyId: req.user.facultyId
      };

      // Only add fields that were provided
      if (isa1 !== undefined && isa1 !== '') {
        marksData.isa1 = isa1Num;
      }
      if (isa2 !== undefined && isa2 !== '') {
        marksData.isa2 = isa2Num;
      }
      if (esa !== undefined && esa !== '') {
        marksData.esa = esaNum;
      }

      const newMarks = new Marks(marksData);
      await newMarks.save();
      return res.status(201).json({ message: 'Marks uploaded successfully', marks: newMarks });
    }
  } catch (error) {
    console.error('Error uploading marks:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Marks already exist for this student, course, semester, and division' });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: `Validation error: ${errors}` });
    }
    res.status(500).json({ message: 'Server error', error: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
});

// Update marks (Faculty only) - allows partial updates
router.put('/update/:id', auth, isFaculty, async (req, res) => {
  try {
    const { isa1, isa2, esa } = req.body;

    // At least one mark should be provided
    if (isa1 === undefined && isa2 === undefined && esa === undefined) {
      return res.status(400).json({ message: 'Please provide at least one assessment mark to update' });
    }

    const marksDoc = await Marks.findById(req.params.id);
    if (!marksDoc) {
      return res.status(404).json({ message: 'Marks not found' });
    }

    // Update only provided fields
    if (isa1 !== undefined && isa1 !== '') {
      const isa1Num = parseFloat(isa1);
      if (isNaN(isa1Num)) {
        return res.status(400).json({ message: 'ISA 1 must be a valid number' });
      }
      if (isa1Num < 0 || isa1Num > 20) {
        return res.status(400).json({ message: 'ISA 1 must be between 0 and 20' });
      }
      marksDoc.isa1 = isa1Num;
    }

    if (isa2 !== undefined && isa2 !== '') {
      const isa2Num = parseFloat(isa2);
      if (isNaN(isa2Num)) {
        return res.status(400).json({ message: 'ISA 2 must be a valid number' });
      }
      if (isa2Num < 0 || isa2Num > 20) {
        return res.status(400).json({ message: 'ISA 2 must be between 0 and 20' });
      }
      marksDoc.isa2 = isa2Num;
    }

    if (esa !== undefined && esa !== '') {
      const esaNum = parseFloat(esa);
      if (isNaN(esaNum)) {
        return res.status(400).json({ message: 'ESA must be a valid number' });
      }
      if (esaNum < 0 || esaNum > 60) {
        return res.status(400).json({ message: 'ESA must be between 0 and 60' });
      }
      marksDoc.esa = esaNum;
    }

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

