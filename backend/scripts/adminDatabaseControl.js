const mongoose = require('mongoose');
const readline = require('readline');
const User = require('../models/User');
const Student = require('../models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ssaems';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function adminDashboard() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('\n✅ Connected to MongoDB as ADMIN\n');

    let running = true;

    while (running) {
      console.log('\n╔════════════════════════════════════════╗');
      console.log('║     ADMIN DATABASE CONTROL PANEL      ║');
      console.log('╚════════════════════════════════════════╝');
      console.log('\n1. View All Students');
      console.log('2. View Student by Roll Number');
      console.log('3. Update Student CGPA');
      console.log('4. Delete Student');
      console.log('5. View Statistics');
      console.log('6. Search Students by Year');
      console.log('7. Export Student List');
      console.log('8. Exit\n');

      const choice = await prompt('Enter your choice (1-8): ');

      switch (choice.trim()) {
        case '1':
          await viewAllStudents();
          break;
        case '2':
          await viewStudentByRoll();
          break;
        case '3':
          await updateStudentCGPA();
          break;
        case '4':
          await deleteStudent();
          break;
        case '5':
          await viewStatistics();
          break;
        case '6':
          await searchByYear();
          break;
        case '7':
          await exportStudents();
          break;
        case '8':
          running = false;
          console.log('\n👋 Goodbye Admin!\n');
          break;
        default:
          console.log('\n❌ Invalid choice. Please try again.\n');
      }
    }

    await mongoose.connection.close();
    rl.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    rl.close();
    process.exit(1);
  }
}

async function viewAllStudents() {
  const limit = parseInt(await prompt('\nHow many students to display? (default 10): ') || '10');
  const students = await Student.find().limit(limit).populate('user', 'name email');
  
  console.log('\n📋 Student List:');
  console.log('═══════════════════════════════════════════════════════════════');
  students.forEach((s, idx) => {
    console.log(`${idx + 1}. ${s.rollNumber} | ${s.user?.name} | Year ${s.year} | CGPA: ${s.cgpa}`);
  });
  console.log('═══════════════════════════════════════════════════════════════');
}

async function viewStudentByRoll() {
  const rollNo = await prompt('\nEnter Roll Number: ');
  const student = await Student.findOne({ rollNumber: rollNo }).populate('user');
  
  if (student) {
    console.log('\n📝 Student Details:');
    console.log('═══════════════════════════════════════');
    console.log(`Roll Number: ${student.rollNumber}`);
    console.log(`Name: ${student.user?.name}`);
    console.log(`Email: ${student.user?.email}`);
    console.log(`Year: ${student.year}`);
    console.log(`CGPA: ${student.cgpa}`);
    console.log(`Department: ${student.department}`);
    console.log(`Allocated: ${student.allocated ? 'Yes' : 'No'}`);
    console.log('═══════════════════════════════════════');
  } else {
    console.log('\n❌ Student not found!');
  }
}

async function updateStudentCGPA() {
  const rollNo = await prompt('\nEnter Roll Number: ');
  const newCGPA = parseFloat(await prompt('Enter new CGPA: '));
  
  const result = await Student.updateOne(
    { rollNumber: rollNo },
    { $set: { cgpa: newCGPA } }
  );
  
  if (result.modifiedCount > 0) {
    console.log('\n✅ CGPA updated successfully!');
  } else {
    console.log('\n❌ Student not found or CGPA unchanged!');
  }
}

async function deleteStudent() {
  const rollNo = await prompt('\nEnter Roll Number to DELETE: ');
  const confirm = await prompt(`⚠️  Are you sure you want to delete ${rollNo}? (yes/no): `);
  
  if (confirm.toLowerCase() === 'yes') {
    const student = await Student.findOne({ rollNumber: rollNo });
    if (student) {
      await User.deleteOne({ _id: student.user });
      await Student.deleteOne({ rollNumber: rollNo });
      console.log('\n✅ Student deleted successfully!');
    } else {
      console.log('\n❌ Student not found!');
    }
  } else {
    console.log('\n❌ Deletion cancelled.');
  }
}

async function viewStatistics() {
  const totalStudents = await Student.countDocuments();
  const studentsByYear = await Student.aggregate([
    { $group: { _id: '$year', count: { $sum: 1 }, avgCGPA: { $avg: '$cgpa' } } },
    { $sort: { _id: 1 } }
  ]);
  const overallAvg = await Student.aggregate([
    { $group: { _id: null, avgCGPA: { $avg: '$cgpa' } } }
  ]);

  console.log('\n📊 Database Statistics:');
  console.log('═══════════════════════════════════════');
  console.log(`Total Students: ${totalStudents}`);
  console.log(`\nBreakdown by Year:`);
  studentsByYear.forEach(item => {
    console.log(`  Year ${item._id}: ${item.count} students (Avg CGPA: ${item.avgCGPA.toFixed(2)})`);
  });
  console.log(`\nOverall Average CGPA: ${overallAvg[0]?.avgCGPA?.toFixed(4) || 'N/A'}`);
  console.log('═══════════════════════════════════════');
}

async function searchByYear() {
  const year = parseInt(await prompt('\nEnter Year (1-4): '));
  const students = await Student.find({ year }).populate('user', 'name email');
  
  console.log(`\n📋 Year ${year} Students (Total: ${students.length}):`);
  console.log('═══════════════════════════════════════════════════════════════');
  students.forEach((s, idx) => {
    console.log(`${idx + 1}. ${s.rollNumber} | ${s.user?.name} | CGPA: ${s.cgpa}`);
  });
  console.log('═══════════════════════════════════════════════════════════════');
}

async function exportStudents() {
  const students = await Student.find().populate('user', 'name email');
  console.log('\n📄 Exporting student data...\n');
  console.log('Roll Number,Name,Email,Year,CGPA,Department');
  students.forEach(s => {
    console.log(`${s.rollNumber},${s.user?.name},${s.user?.email},${s.year},${s.cgpa},${s.department}`);
  });
  console.log('\n✅ Export complete! (Copy the output above)');
}

console.log('\n🔐 Starting Admin Database Control Panel...');
adminDashboard();
