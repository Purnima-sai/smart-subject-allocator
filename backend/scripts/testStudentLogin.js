const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ssaems';

async function testLogin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test credentials from the image
    const testEmail = 'student19@college.edu';
    const testPassword = 'HWlpKBAx';

    console.log('🔍 Testing login for:', testEmail);
    console.log('Password:', testPassword);
    console.log('═══════════════════════════════════════\n');

    // Find user
    const user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log('❌ User not found in database!');
      
      // Check if similar email exists
      const allUsers = await User.find({ email: { $regex: 'student19', $options: 'i' } });
      console.log('\nSearching for similar emails...');
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (role: ${u.role})`);
      });
      
      await mongoose.connection.close();
      return;
    }

    console.log('✅ User found in database');
    console.log('User ID:', user._id);
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Hashed Password:', user.password.substring(0, 20) + '...\n');

    // Test password comparison
    const isMatch = await bcrypt.compare(testPassword, user.password);
    
    if (isMatch) {
      console.log('✅ Password matches! Login should work.\n');
      
      // Find associated student record
      const student = await Student.findOne({ user: user._id });
      if (student) {
        console.log('📋 Student Details:');
        console.log('Roll Number:', student.rollNumber);
        console.log('Year:', student.year);
        console.log('CGPA:', student.cgpa);
        console.log('Department:', student.department);
      }
    } else {
      console.log('❌ Password does NOT match!\n');
      
      // Try to find what the actual password should be
      console.log('🔍 Checking CSV data for this student...');
      const fs = require('fs');
      const csv = require('csv-parser');
      
      fs.createReadStream('../../Generated_Student_Excel_Dataset.csv')
        .pipe(csv())
        .on('data', (row) => {
          if (row.Email === testEmail) {
            console.log('Found in CSV:');
            console.log('  Name:', row.Name);
            console.log('  Email:', row.Email);
            console.log('  Password:', row.Password);
            console.log('\nTrying to hash and compare...');
            
            bcrypt.hash(row.Password, 10).then(hashedFromCSV => {
              console.log('Hashed from CSV:', hashedFromCSV.substring(0, 20) + '...');
              console.log('Stored in DB:', user.password.substring(0, 20) + '...');
            });
          }
        });
    }

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testLogin();
