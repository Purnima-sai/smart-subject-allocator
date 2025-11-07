const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const csv = require('csv-parser');

// Import models
const User = require('../models/User');
const Student = require('../models/Student');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ssaems';

// CSV file path
const CSV_FILE_PATH = path.join(__dirname, '../../Generated_Student_Excel_Dataset.csv');

async function importStudents() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!\n');

    // Clear existing student data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing student data...');
    await User.deleteMany({ role: 'student' });
    await Student.deleteMany({});
    console.log('✅ Existing student data cleared.\n');

    const students = [];
    const users = [];
    let count = 0;

    console.log('📖 Reading CSV file...');

    // Read CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE_PATH)
        .pipe(csv())
        .on('data', async (row) => {
          try {
            // Parse CSV row
            const regNo = row['Reg No'] || row['RegNo'] || row['Reg_No'];
            const name = row['Name'];
            const year = parseInt(row['Year']);
            const semester = parseInt(row['Semester']);
            const email = row['Email'];
            const cgpa = parseFloat(row['CGPA']);
            const password = row['Password'];

            if (!regNo || !name || !email || !password) {
              console.warn(`⚠️  Skipping incomplete row: ${JSON.stringify(row)}`);
              return;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create User document
            const user = {
              name: name,
              email: email,
              password: hashedPassword,
              role: 'student'
            };

            // Create Student document (will link to user later)
            const student = {
              rollNumber: regNo,
              year: year,
              semester: semester,
              cgpa: cgpa,
              department: 'CSE', // Default department
              preferences: [],
              allocated: false,
              email: email // Temporary field for linking
            };

            users.push(user);
            students.push(student);
            count++;

            // Show progress every 100 records
            if (count % 100 === 0) {
              console.log(`📊 Processed ${count} records...`);
            }
          } catch (error) {
            console.error(`❌ Error processing row: ${error.message}`);
          }
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    console.log(`\n✅ CSV file read complete. Total records: ${count}\n`);

    if (users.length === 0) {
      console.log('⚠️  No valid data to import. Exiting...');
      await mongoose.connection.close();
      return;
    }

    // Bulk insert users
    console.log('💾 Inserting users into database...');
    const insertedUsers = await User.insertMany(users, { ordered: false });
    console.log(`✅ Inserted ${insertedUsers.length} users successfully!\n`);

    // Create a map of email to userId for linking
    const emailToUserId = {};
    insertedUsers.forEach(user => {
      emailToUserId[user.email] = user._id;
    });

    // Link students with user IDs
    students.forEach(student => {
      student.user = emailToUserId[student.email];
      delete student.email; // Remove temporary email field
    });

    // Bulk insert students
    console.log('💾 Inserting student records into database...');
    const insertedStudents = await Student.insertMany(students, { ordered: false });
    console.log(`✅ Inserted ${insertedStudents.length} student records successfully!\n`);

    // Display summary
    console.log('📊 Import Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`Total Records Processed: ${count}`);
    console.log(`Users Created: ${insertedUsers.length}`);
    console.log(`Student Records Created: ${insertedStudents.length}`);
    console.log('═══════════════════════════════════════\n');

    // Show sample data
    console.log('📝 Sample Student Data:');
    const sampleStudents = await Student.find().limit(5).populate('user', 'name email role');
    sampleStudents.forEach((student, index) => {
      console.log(`\n${index + 1}. ${student.user?.name || 'N/A'}`);
      console.log(`   Roll Number: ${student.rollNumber}`);
      console.log(`   Email: ${student.user?.email || 'N/A'}`);
      console.log(`   Year: ${student.year}`);
      console.log(`   CGPA: ${student.cgpa}`);
      console.log(`   Department: ${student.department}`);
    });

    console.log('\n✅ Import completed successfully!');
    console.log('🔐 Students can now login with their email and password from the CSV file.\n');

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during import:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run the import
console.log('🚀 Starting Student Data Import...\n');
importStudents();
