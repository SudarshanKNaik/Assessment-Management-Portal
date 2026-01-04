const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    ref: 'User'
  },
  usn: {
    type: String,
    required: true
  },
  courseCode: {
    type: String,
    required: true,
    enum: ['CS101', 'CS102', 'CS103']
  },
  courseName: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  division: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C']
  },
  department: {
    type: String,
    required: true
  },
  marks: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    enum: ['S', 'A', 'B', 'C', 'D', 'F'],
    required: true
  },
  assessmentType: {
    type: String,
    default: 'Internal Assessment'
  },
  facultyId: {
    type: String,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient queries
marksSchema.index({ usn: 1, courseCode: 1, semester: 1, division: 1 }, { unique: true });

// Calculate grade based on marks
marksSchema.pre('save', function(next) {
  if (this.marks >= 90) {
    this.grade = 'S';
  } else if (this.marks >= 80) {
    this.grade = 'A';
  } else if (this.marks >= 70) {
    this.grade = 'B';
  } else if (this.marks >= 60) {
    this.grade = 'C';
  } else if (this.marks >= 50) {
    this.grade = 'D';
  } else {
    this.grade = 'F';
  }
  next();
});

module.exports = mongoose.model('Marks', marksSchema);

