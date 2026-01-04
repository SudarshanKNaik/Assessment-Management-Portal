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
    }

    if (role === 'faculty') {
      if (!facultyId) {
        return res.status(400).json({ message: 'Faculty: Faculty ID is required' });
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
      userData.usn = usn;
      userData.semester = semester;
      userData.division = division;
      userData.academicYear = academicYear;
    }

    if (role === 'faculty') {
      userData.facultyId = facultyId;
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

