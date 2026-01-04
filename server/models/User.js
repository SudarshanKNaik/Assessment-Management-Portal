const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['faculty', 'student'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  // Student fields
  usn: {
    type: String,
    sparse: true,
    unique: true,
    trim: true
  },
  // Faculty fields
  facultyId: {
    type: String,
    sparse: true,
    unique: true,
    trim: true
  },
  // Common fields
  department: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: String,
    trim: true
  },
  division: {
    type: String,
    enum: ['A', 'B', 'C'],
    trim: true
  },
  // Faculty specific
  course: {
    type: String,
    trim: true
  },
  // Student specific
  academicYear: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

