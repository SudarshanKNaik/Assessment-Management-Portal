const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password, 
      role, 
      name,
      // Student fields
      usn,
      academicYear,
      // Faculty fields
      facultyId,
      course,
      // Common fields
      department,
      semester,
      division
    } = req.body;

    // Validation
    if (!username || !email || !password || !role || !name || !department) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (role === 'student') {
      if (!usn || !semester || !division || !academicYear) {
        return res.status(400).json({ message: 'Student: USN, Semester, Division, and Academic Year are required' });
      }
      // Validate USN format: 2 digits + 2 letters + 2 digits + 3 letters + 3 digits = 12 characters
      const usnPattern = /^\d{2}[A-Z]{2}\d{2}[A-Z]{3}\d{3}$/;
      const usnUpper = usn.toUpperCase().trim();
      if (usnUpper.length !== 12 || !usnPattern.test(usnUpper)) {
        return res.status(400).json({ message: 'Invalid USN format. Format: 2 digits + 2 letters + 2 digits + 3 letters + 3 digits (e.g., 01AB20CSE001)' });
      }
    }

    if (role === 'faculty') {
      if (!facultyId) {
        return res.status(400).json({ message: 'Faculty: Faculty ID is required' });
      }
      // Validate Faculty ID format: 2 digits + 2 letters + 2 digits + 1 letter + 4 digits = 11 characters
      const facultyIdPattern = /^\d{2}[A-Z]{2}\d{2}[A-Z]\d{4}$/;
      const facultyIdUpper = facultyId.toUpperCase().trim();
      if (facultyIdUpper.length !== 11 || !facultyIdPattern.test(facultyIdUpper)) {
        return res.status(400).json({ message: 'Invalid Faculty ID format. Format: 2 digits + 2 letters + 2 digits + 1 letter + 4 digits (e.g., 01CSE20F0001)' });
      }
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        { username },
        ...(usn ? [{ usn }] : []),
        ...(facultyId ? [{ facultyId }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email, username, USN, or Faculty ID' });
    }

    const userData = {
      username,
      email,
      password,
      role,
      name,
      department
    };

    if (role === 'student') {
      userData.usn = usn.toUpperCase().trim();
      userData.semester = semester;
      userData.division = division;
      userData.academicYear = academicYear;
    }

    if (role === 'faculty') {
      userData.facultyId = facultyId.toUpperCase().trim();
      // Course, semester, and division are not required during registration
      // Faculty can teach multiple courses/divisions/semesters
    }

    const user = new User(userData);
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        usn: user.usn,
        facultyId: user.facultyId,
        department: user.department,
        semester: user.semester,
        division: user.division,
        course: user.course,
        academicYear: user.academicYear
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        usn: user.usn,
        facultyId: user.facultyId,
        department: user.department,
        semester: user.semester,
        division: user.division,
        course: user.course,
        academicYear: user.academicYear
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

