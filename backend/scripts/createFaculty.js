const mongoose = require('mongoose');
require('dotenv').config();
const { connectDB } = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createFaculty = async () => {
  try {
    await connectDB();
    
    const facultyEmail = 'faculty@example.com';
    let faculty = await User.findOne({ email: facultyEmail });
    
    if (!faculty) {
      const hashedPassword = await bcrypt.hash('faculty123', 10);
      faculty = await User.create({
        name: 'Dr. John Smith',
        email: facultyEmail,
        password: hashedPassword,
        role: 'faculty'
      });
      console.log('✅ Faculty user created successfully!');
      console.log('Email:', facultyEmail);
      console.log('Password: faculty123');
    } else {
      console.log('Faculty user already exists:', facultyEmail);
      // Update password if needed
      const hashedPassword = await bcrypt.hash('faculty123', 10);
      faculty.password = hashedPassword;
      await faculty.save();
      console.log('✅ Faculty password updated!');
      console.log('Email:', facultyEmail);
      console.log('Password: faculty123');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating faculty:', err);
    process.exit(1);
  }
};

createFaculty();
