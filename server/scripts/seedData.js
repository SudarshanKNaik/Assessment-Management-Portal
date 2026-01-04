const mongoose = require('mongoose');
const User = require('../models/User');
const Marks = require('../models/Marks');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/internal-assessment';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Marks.deleteMany({});

    // Create Faculty User
    const facultyExists = await User.findOne({ username: 'faculty1' });
    if (!facultyExists) {
      const faculty = new User({
        username: 'faculty1',
        email: 'faculty@example.com',
        password: 'password123',
        role: 'faculty',
        name: 'Dr. John Smith'
      });
      await faculty.save();
      console.log('Faculty user created:', faculty.username);
    } else {
      console.log('Faculty user already exists');
    }

    // Create Student Users
    const students = [
      {
        username: 'student1',
        email: 'student1@example.com',
        password: 'password123',
        role: 'student',
        studentId: 'STU001',
        name: 'Alice Johnson'
      },
      {
        username: 'student2',
        email: 'student2@example.com',
        password: 'password123',
        role: 'student',
        studentId: 'STU002',
        name: 'Bob Williams'
      },
      {
        username: 'student3',
        email: 'student3@example.com',
        password: 'password123',
        role: 'student',
        studentId: 'STU003',
        name: 'Charlie Brown'
      }
    ];

    for (const studentData of students) {
      const studentExists = await User.findOne({ username: studentData.username });
      if (!studentExists) {
        const student = new User(studentData);
        await student.save();
        console.log('Student user created:', student.username);
      } else {
        console.log(`Student user ${studentData.username} already exists`);
      }
    }

    // Create sample marks
    const sampleMarks = [
      { studentId: 'STU001', courseCode: 'CS101', courseName: 'Introduction to Computer Science', marks: 85 },
      { studentId: 'STU001', courseCode: 'CS102', courseName: 'Data Structures and Algorithms', marks: 92 },
      { studentId: 'STU001', courseCode: 'CS103', courseName: 'Database Management Systems', marks: 78 },
      { studentId: 'STU002', courseCode: 'CS101', courseName: 'Introduction to Computer Science', marks: 75 },
      { studentId: 'STU002', courseCode: 'CS102', courseName: 'Data Structures and Algorithms', marks: 88 },
      { studentId: 'STU002', courseCode: 'CS103', courseName: 'Database Management Systems', marks: 82 },
      { studentId: 'STU003', courseCode: 'CS101', courseName: 'Introduction to Computer Science', marks: 95 },
      { studentId: 'STU003', courseCode: 'CS102', courseName: 'Data Structures and Algorithms', marks: 90 },
      { studentId: 'STU003', courseCode: 'CS103', courseName: 'Database Management Systems', marks: 87 },
    ];

    for (const markData of sampleMarks) {
      const markExists = await Marks.findOne({ studentId: markData.studentId, courseCode: markData.courseCode });
      if (!markExists) {
        const mark = new Marks(markData);
        await mark.save();
        console.log(`Marks created for ${markData.studentId} - ${markData.courseCode}`);
      } else {
        console.log(`Marks for ${markData.studentId} - ${markData.courseCode} already exist`);
      }
    }

    console.log('\nSeed data completed successfully!');
    console.log('\nTest Credentials:');
    console.log('Faculty - Username: faculty1, Password: password123');
    console.log('Student - Username: student1, Password: password123');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedData();

