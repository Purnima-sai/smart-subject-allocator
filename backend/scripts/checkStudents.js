const mongoose = require('mongoose');
require('dotenv').config();
const { connectDB } = require('../config/db');
const Student = require('../models/Student');

const checkStudents = async () => {
  try {
    await connectDB();
    
    // Count all students
    const totalStudents = await Student.countDocuments();
    console.log(`\n📊 Total Students in Database: ${totalStudents}`);
    
    // Count students by year and semester
    const year2Sem2 = await Student.countDocuments({ year: 2, semester: 2 });
    console.log(`\n🎓 Students in Year 2, Semester 2: ${year2Sem2}`);
    
    // Get breakdown by year
    console.log('\n📈 Breakdown by Year:');
    for (let year = 1; year <= 4; year++) {
      const count = await Student.countDocuments({ year });
      console.log(`   Year ${year}: ${count} students`);
    }
    
    // Get breakdown by year and semester
    console.log('\n📋 Detailed Breakdown (Year, Semester):');
    for (let year = 1; year <= 4; year++) {
      for (let sem = 1; sem <= 2; sem++) {
        const count = await Student.countDocuments({ year, semester: sem });
        console.log(`   Year ${year}, Semester ${sem}: ${count} students`);
      }
    }
    
    // Get sample students from Year 2, Semester 2
    console.log('\n👥 Sample Students from Year 2, Semester 2:');
    const sampleStudents = await Student.find({ year: 2, semester: 2 })
      .limit(10);
    
    sampleStudents.forEach((student, index) => {
      console.log(`   ${index + 1}. Roll: ${student.rollNumber} - Dept: ${student.department} - CGPA: ${student.cgpa}`);
    });
    
    if (year2Sem2 > 10) {
      console.log(`   ... and ${year2Sem2 - 10} more students`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

checkStudents();
