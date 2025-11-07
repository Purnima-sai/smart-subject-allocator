const mongoose = require('mongoose');
require('dotenv').config();
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

const createTestStudent = async () => {
  try {
    await connectDB();
    
    // Check if student already exists
    let user = await User.findOne({ email: 'student@example.com' });
    
    if (user) {
      console.log('Student user already exists: student@example.com');
      console.log('Password: student123');
      process.exit(0);
    }
    
    // Create student user
    const hashedPassword = await bcrypt.hash('student123', 10);
    user = await User.create({
      name: 'John Doe',
      email: 'student@example.com',
      password: hashedPassword,
      role: 'student'
    });
    
    // Create student profile
    await Student.create({
      user: user._id,
      rollNumber: 'STU2023001',
      department: 'Computer Science',
      year: 3,
      cgpa: 8.7
    });
    
    console.log('✓ Test student created successfully!');
    console.log('Email: student@example.com');
    console.log('Password: student123');
    console.log('Role: student');
    
    process.exit(0);
  } catch (err) {
    console.error('Error creating test student:', err);
    process.exit(1);
  }
};

createTestStudent();
