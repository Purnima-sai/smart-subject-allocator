const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Student = require('../models/Student');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ssaems';

async function importStudents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Read CSV file
    const csvPath = path.join(__dirname, '..', '..', 'Generated_Student_Excel_Dataset.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    console.log(`📊 Found ${lines.length - 1} student records in CSV`);
    console.log('🔄 Starting import...\n');

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Process each student (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      
      if (values.length < 7) {
        console.log(`⚠️  Skipping line ${i + 1}: Invalid format`);
        skipped++;
        continue;
      }

      const [regNo, name, year, semester, email, cgpa, password] = values;

      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          console.log(`⏭️  Skipping ${email} - Already exists`);
          skipped++;
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User account
        const user = await User.create({
          name,
          email,
          password: hashedPassword,
          role: 'student'
        });

        // Create Student record
        await Student.create({
          userId: user._id,
          rollNumber: regNo,
          department: 'Computer Science', // Default department
          year: parseInt(year),
          semester: parseInt(semester),
          cgpa: parseFloat(cgpa),
          preferences: [],
          allocated: null
        });

        imported++;
        if (imported % 100 === 0) {
          console.log(`✅ Imported ${imported} students...`);
        }

      } catch (error) {
        console.log(`❌ Error importing ${email}: ${error.message}`);
        errors++;
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Successfully imported: ${imported}`);
    console.log(`   ⏭️  Skipped (already exists): ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📝 Total processed: ${imported + skipped + errors}`);

    // Display sample credentials
    console.log('\n🔐 Sample Login Credentials:');
    console.log('   Email: student1@college.edu');
    console.log('   Password: mOj7CDJ7');
    console.log('\n   Email: student2@college.edu');
    console.log('   Password: JX00c3aY');

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the import
importStudents();
