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


    // Generate 60 dummy students for each semester and division
    const indianFirstNames = [
      'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
      'Ananya', 'Aadhya', 'Diya', 'Myra', 'Anika', 'Sara', 'Ira', 'Avni', 'Saanvi', 'Aarohi',
      'Priya', 'Riya', 'Sneha', 'Pooja', 'Kavya', 'Meera', 'Nisha', 'Tanvi', 'Shreya', 'Aisha',
      'Rahul', 'Rohan', 'Amit', 'Siddharth', 'Karan', 'Manish', 'Suresh', 'Vikas', 'Deepak', 'Akhil',
      'Lakshmi', 'Divya', 'Shweta', 'Neha', 'Pallavi', 'Swati', 'Rashmi', 'Jyoti', 'Sunita', 'Preeti',
      'Vivek', 'Sanjay', 'Ajay', 'Rajesh', 'Prakash', 'Dinesh', 'Mahesh', 'Gaurav', 'Harsh', 'Yash'
    ];
    const indianLastNames = [
      'Sharma', 'Verma', 'Patel', 'Reddy', 'Nair', 'Gupta', 'Mehta', 'Jain', 'Agarwal', 'Kumar',
      'Singh', 'Chopra', 'Joshi', 'Das', 'Rao', 'Menon', 'Bose', 'Chatterjee', 'Banerjee', 'Mishra',
      'Pandey', 'Tripathi', 'Dubey', 'Yadav', 'Saxena', 'Srivastava', 'Kapoor', 'Malhotra', 'Bhat', 'Shetty'
    ];
    const divisions = ['A', 'B', 'C'];
    const totalSemesters = 8;
    const students = [];
    let studentCounter = 1;
    for (let sem = 1; sem <= totalSemesters; sem++) {
      for (const division of divisions) {
        for (let i = 0; i < 60; i++) {
          const firstName = indianFirstNames[(studentCounter + i) % indianFirstNames.length];
          const lastName = indianLastNames[(studentCounter + i) % indianLastNames.length];
          const name = `${firstName} ${lastName}`;
          const usn = `01AB20CSE${String(studentCounter).padStart(3, '0')}`;
          const username = usn;
          const email = `student${studentCounter}@example.com`;
          students.push({
            username,
            email,
            password: 'password123',
            role: 'student',
            usn,
            name,
            department: 'CSE',
            semester: String(sem),
            division,
            academicYear: '2020-2024'
          });
          studentCounter++;
        }
      }
    }

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


    // Add marks for all dummy students
    const courseList = [
      { code: '25ECSC301', name: 'Software Engineering' },
      { code: '24ECSP304', name: 'Web Technologies Lab' },
      { code: '24ECSC303', name: 'Computer Networks' }
    ];

    for (const studentData of students) {
      for (const course of courseList) {
        // Generate random marks for each student and course
        const isa1 = Math.floor(Math.random() * 21); // 0-20
        const isa2 = Math.floor(Math.random() * 21); // 0-20
        const esa = Math.floor(Math.random() * 61);  // 0-60
        const markData = {
          studentId: studentData.username,
          usn: studentData.usn,
          courseCode: course.code,
          courseName: course.name,
          isa1,
          isa2,
          esa,
          semester: studentData.semester,
          division: studentData.division,
          department: studentData.department
        };
        const markExists = await Marks.findOne({ studentId: markData.studentId, courseCode: markData.courseCode });
        if (!markExists) {
          const mark = new Marks(markData);
          await mark.save();
          console.log(`Marks created for ${markData.studentId} - ${markData.courseCode}`);
        } else {
          console.log(`Marks for ${markData.studentId} - ${markData.courseCode} already exist`);
        }
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

