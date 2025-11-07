const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ssaems';

async function verifyImport() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Count users
    const totalUsers = await User.countDocuments();
    const studentUsers = await User.countDocuments({ role: 'student' });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const facultyUsers = await User.countDocuments({ role: 'faculty' });

    console.log('📊 User Statistics:');
    console.log('═══════════════════════════════════════');
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Students: ${studentUsers}`);
    console.log(`Admins: ${adminUsers}`);
    console.log(`Faculty: ${facultyUsers}`);
    console.log('═══════════════════════════════════════\n');

    // Count students
    const totalStudents = await Student.countDocuments();
    const studentsByYear = await Student.aggregate([
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('📚 Student Statistics:');
    console.log('═══════════════════════════════════════');
    console.log(`Total Student Records: ${totalStudents}`);
    console.log('\nBy Year:');
    studentsByYear.forEach(item => {
      console.log(`  Year ${item._id}: ${item.count} students`);
    });
    console.log('═══════════════════════════════════════\n');

    // Show sample students from each year
    console.log('📝 Sample Students (5 from each year):\n');
    for (let year = 1; year <= 4; year++) {
      const samples = await Student.find({ year }).limit(5).populate('user', 'name email');
      if (samples.length > 0) {
        console.log(`Year ${year}:`);
        samples.forEach((s, idx) => {
          console.log(`  ${idx + 1}. ${s.rollNumber} - ${s.user?.name} (CGPA: ${s.cgpa})`);
        });
        console.log('');
      }
    }

    // Average CGPA
    const avgCGPA = await Student.aggregate([
      { $group: { _id: null, avgCGPA: { $avg: '$cgpa' } } }
    ]);
    console.log(`📊 Average CGPA: ${avgCGPA[0]?.avgCGPA?.toFixed(4) || 'N/A'}\n`);

    // Test a sample login
    console.log('🔐 Testing Sample Login:');
    console.log('═══════════════════════════════════════');
    const sampleStudent = await Student.findOne().populate('user');
    if (sampleStudent) {
      console.log(`Email: ${sampleStudent.user.email}`);
      console.log(`Roll Number: ${sampleStudent.rollNumber}`);
      console.log(`Name: ${sampleStudent.user.name}`);
      console.log(`Year: ${sampleStudent.year}`);
      console.log('\n💡 Note: Use the password from the CSV file to login');
    }
    console.log('═══════════════════════════════════════\n');

    await mongoose.connection.close();
    console.log('✅ Verification complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyImport();
