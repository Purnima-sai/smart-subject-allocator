const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ssaems';

async function createIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully!\n');

    console.log('📊 Creating indexes for better performance...\n');

    // Create indexes for User collection
    console.log('Creating User indexes...');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    console.log('✅ User indexes created\n');

    // Create indexes for Student collection
    console.log('Creating Student indexes...');
    await Student.collection.createIndex({ rollNumber: 1 }, { unique: true });
    await Student.collection.createIndex({ user: 1 });
    await Student.collection.createIndex({ year: 1 });
    await Student.collection.createIndex({ department: 1 });
    await Student.collection.createIndex({ cgpa: -1 }); // Descending for top performers
    console.log('✅ Student indexes created\n');

    // List all indexes
    console.log('📋 Current Indexes:');
    console.log('═══════════════════════════════════════');
    
    const userIndexes = await User.collection.indexes();
    console.log('\nUser Collection:');
    userIndexes.forEach(idx => {
      console.log(`  - ${JSON.stringify(idx.key)} ${idx.unique ? '(unique)' : ''}`);
    });

    const studentIndexes = await Student.collection.indexes();
    console.log('\nStudent Collection:');
    studentIndexes.forEach(idx => {
      console.log(`  - ${JSON.stringify(idx.key)} ${idx.unique ? '(unique)' : ''}`);
    });
    
    console.log('═══════════════════════════════════════\n');
    console.log('✅ All indexes created successfully!');
    console.log('🚀 Database is now optimized for queries\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createIndexes();
