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
    enum: ['25ECSC301', '24ECSP304', '24ECSC303']
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
  isa1: {
    type: Number,
    required: false,
    min: 0,
    max: 20
  },
  isa2: {
    type: Number,
    required: false,
    min: 0,
    max: 20
  },
  esa: {
    type: Number,
    required: false,
    min: 0,
    max: 60
  },
  total: {
    type: Number,
    required: false, // Will be calculated by pre-save hook
    min: 0,
    max: 100
  },
  marks: {
    type: Number,
    required: false, // Keep for backward compatibility, will be same as total
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    enum: ['S', 'A', 'B', 'C', 'D', 'F'],
    required: false // Will be set by pre-save hook
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

// Calculate total and grade based on ISA 1, ISA 2, and ESA
marksSchema.pre('save', function(next) {
  // Calculate total: ISA 1 (20) + ISA 2 (20) + ESA (60) = 100
  // Handle undefined, null, or empty values
  const isa1Value = (this.isa1 !== undefined && this.isa1 !== null) 
    ? (typeof this.isa1 === 'number' ? this.isa1 : parseFloat(this.isa1) || 0)
    : 0;
  const isa2Value = (this.isa2 !== undefined && this.isa2 !== null)
    ? (typeof this.isa2 === 'number' ? this.isa2 : parseFloat(this.isa2) || 0)
    : 0;
  const esaValue = (this.esa !== undefined && this.esa !== null)
    ? (typeof this.esa === 'number' ? this.esa : parseFloat(this.esa) || 0)
    : 0;
  
  this.total = isa1Value + isa2Value + esaValue;
  this.marks = this.total; // Keep for backward compatibility
  
  // Calculate grade based on total (only if total > 0)
  if (this.total === 0) {
    this.grade = undefined; // No grade if no marks entered
  } else if (this.total >= 90) {
    this.grade = 'S';
  } else if (this.total >= 80) {
    this.grade = 'A';
  } else if (this.total >= 70) {
    this.grade = 'B';
  } else if (this.total >= 60) {
    this.grade = 'C';
  } else if (this.total >= 50) {
    this.grade = 'D';
  } else {
    this.grade = 'F';
  }
  next();
});

module.exports = mongoose.model('Marks', marksSchema);

