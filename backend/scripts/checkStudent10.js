const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ssaems';

async function checkStudent10() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const student = await Student.findOne({ rollNumber: '231FA0010' }).populate('user');
    
    if (student) {
      console.log('📋 Student_10 Details:');
      console.log('═══════════════════════════════════════');
      console.log('Roll Number:', student.rollNumber);
      console.log('Name:', student.user?.name);
      console.log('Email:', student.user?.email);
      console.log('Year:', student.year);
      console.log('Semester:', student.semester);
      console.log('CGPA:', student.cgpa);
      console.log('Department:', student.department);
      console.log('═══════════════════════════════════════\n');
    } else {
      console.log('❌ Student_10 not found!');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkStudent10();
