// Script to fix existing preferences and lock them
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

async function fixPreferences() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ssaems');
    console.log('✓ Connected to MongoDB');

    // Find all students with preferences but not locked
    const students = await Student.find({ 
      preferences: { $exists: true, $ne: [] },
      $or: [
        { preferencesLocked: false },
        { preferencesLocked: { $exists: false } }
      ]
    });

    console.log(`Found ${students.length} students with unlocked preferences`);

    for (const student of students) {
      console.log(`\nFixing student: ${student.rollNumber}`);
      console.log(`  Current preferences: ${student.preferences.length}`);
      console.log(`  Current lock status: ${student.preferencesLocked}`);
      
      // Update to lock the preferences
      student.preferencesLocked = true;
      if (!student.preferencesSubmittedAt) {
        student.preferencesSubmittedAt = new Date();
      }
      await student.save();
      
      console.log(`  ✓ Locked preferences for ${student.rollNumber}`);
    }

    console.log('\n✓ All preferences locked successfully!');
    mongoose.connection.close();
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    mongoose.connection.close();
  }
}

fixPreferences();
