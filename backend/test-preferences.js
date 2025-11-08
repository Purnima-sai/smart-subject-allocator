// Test script to verify preference submission flow
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const Subject = require('./models/Subject');
const User = require('./models/User');

async function testPreferences() {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ssaems');
    console.log('✓ Connected to MongoDB');

    // Find a test student
    const testUser = await User.findOne({ email: 'student10@college.edu' });
    if (!testUser) {
      console.log('✗ Test user not found');
      return;
    }
    console.log('✓ Found test user:', testUser.email);

    // Find student profile
    const student = await Student.findOne({ user: testUser._id })
      .populate('preferences', 'code title');
    
    if (!student) {
      console.log('✗ Student profile not found');
      return;
    }
    
    console.log('\n=== Student Profile ===');
    console.log('Roll Number:', student.rollNumber);
    console.log('Year:', student.year);
    console.log('Semester:', student.semester);
    console.log('Preferences Locked:', student.preferencesLocked);
    console.log('Submitted At:', student.preferencesSubmittedAt);
    console.log('Current Preferences:', student.preferences.length);
    
    if (student.preferences.length > 0) {
      console.log('\nPreference Details:');
      student.preferences.forEach((pref, idx) => {
        console.log(`  ${idx + 1}. ${pref.code} - ${pref.title}`);
      });
    }

    // Check available subjects for this student
    const subjects = await Subject.find({ 
      year: student.year, 
      semester: student.semester 
    }).limit(5);
    
    console.log(`\n✓ Found ${subjects.length} subjects for Year ${student.year}, Semester ${student.semester}`);
    subjects.forEach(s => {
      console.log(`  - ${s.code}: ${s.title}`);
    });

    // Check all registered students
    const allRegistered = await Student.find({ 
      preferences: { $exists: true, $ne: [] } 
    }).countDocuments();
    
    console.log(`\n✓ Total students with registered preferences: ${allRegistered}`);

    mongoose.connection.close();
    console.log('\n✓ Test completed successfully!');
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    mongoose.connection.close();
  }
}

testPreferences();
