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
    // Faculty ID Format: 2 digits (institution) + 2 letters (department) + 2 digits (year) + 1 letter (role) + 4 digits (ID)
    // Example: 01CSE20F0001
    const facultyExists = await User.findOne({ username: '01CSE20F0001' });
    if (!facultyExists) {
      const faculty = new User({
        username: '01CSE20F0001',
        email: 'faculty@example.com',
        password: 'password123',
        role: 'faculty',
        facultyId: '01CSE20F0001',
        name: 'Dr. John Smith',
        department: 'CSE'
      });
      await faculty.save();
      console.log('Faculty user created:', faculty.username);
    } else {
      console.log('Faculty user already exists');
    }

    // Create Student Users
    // USN Format: 2 digits (institution) + 2 letters (category) + 2 digits (year) + 3 letters (program) + 3 digits (ID)
    // Example: 01AB20CSE001
    const students = [
      {
        username: '01AB20CSE001',
        email: 'student1@example.com',
        password: 'password123',
        role: 'student',
        usn: '01AB20CSE001',
        name: 'Alice Johnson',
        department: 'CSE',
        semester: '5',
        division: 'C',
        academicYear: '2020-2024'
      },
      {
        username: '01AB20CSE002',
        email: 'student2@example.com',
        password: 'password123',
        role: 'student',
        usn: '01AB20CSE002',
        name: 'Bob Williams',
        department: 'CSE',
        semester: '5',
        division: 'C',
        academicYear: '2020-2024'
      },
      {
        username: '01AB20CSE003',
        email: 'student3@example.com',
        password: 'password123',
        role: 'student',
        usn: '01AB20CSE003',
        name: 'Charlie Brown',
        department: 'CSE',
        semester: '5',
        division: 'C',
        academicYear: '2020-2024'
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
      { studentId: '01AB20CSE001', usn: '01AB20CSE001', courseCode: '25ECSC301', courseName: 'Software Engineering', marks: 85, semester: '5', division: 'C', department: 'CSE' },
      { studentId: '01AB20CSE001', usn: '01AB20CSE001', courseCode: '24ECSP304', courseName: 'Web Technologies Lab', marks: 92, semester: '5', division: 'C', department: 'CSE' },
      { studentId: '01AB20CSE001', usn: '01AB20CSE001', courseCode: '24ECSC303', courseName: 'Computer Networks', marks: 78, semester: '5', division: 'C', department: 'CSE' },
      { studentId: '01AB20CSE002', usn: '01AB20CSE002', courseCode: '25ECSC301', courseName: 'Software Engineering', marks: 75, semester: '5', division: 'C', department: 'CSE' },
      { studentId: '01AB20CSE002', usn: '01AB20CSE002', courseCode: '24ECSP304', courseName: 'Web Technologies Lab', marks: 88, semester: '5', division: 'C', department: 'CSE' },
      { studentId: '01AB20CSE002', usn: '01AB20CSE002', courseCode: '24ECSC303', courseName: 'Computer Networks', marks: 82, semester: '5', division: 'C', department: 'CSE' },
      { studentId: '01AB20CSE003', usn: '01AB20CSE003', courseCode: '25ECSC301', courseName: 'Software Engineering', marks: 95, semester: '5', division: 'C', department: 'CSE' },
      { studentId: '01AB20CSE003', usn: '01AB20CSE003', courseCode: '24ECSP304', courseName: 'Web Technologies Lab', marks: 90, semester: '5', division: 'C', department: 'CSE' },
      { studentId: '01AB20CSE003', usn: '01AB20CSE003', courseCode: '24ECSC303', courseName: 'Computer Networks', marks: 87, semester: '5', division: 'C', department: 'CSE' },
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
    console.log('Faculty - Username: 01CSE20F0001, Password: password123');
    console.log('Student - Username: 01AB20CSE001, Password: password123');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedData();

