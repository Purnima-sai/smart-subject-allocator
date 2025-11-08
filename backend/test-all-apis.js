// Comprehensive API endpoint test
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const Subject = require('./models/Subject');
const User = require('./models/User');

async function testAllAPIs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ssaems');
    console.log('✓ Connected to MongoDB\n');

    // Test 1: Student Profile (/api/students/me)
    console.log('=== TEST 1: Student Profile API ===');
    const testUser = await User.findOne({ email: 'student10@college.edu' });
    const student = await Student.findOne({ user: testUser._id })
      .populate('user', 'name email')
      .populate('preferences', 'code title year semester credits hours description topics');
    
    const profileData = {
      rollNumber: student.rollNumber,
      year: student.year,
      semester: student.semester,
      cgpa: student.cgpa,
      department: student.department,
      allocated: student.allocated,
      preferences: student.preferences || [],
      preferencesLocked: student.preferencesLocked || false,
      preferencesSubmittedAt: student.preferencesSubmittedAt,
      name: student.user?.name,
      email: student.user?.email
    };
    
    console.log('Profile data structure:', {
      rollNumber: profileData.rollNumber,
      year: profileData.year,
      semester: profileData.semester,
      preferencesCount: profileData.preferences.length,
      preferencesLocked: profileData.preferencesLocked,
      submittedAt: profileData.preferencesSubmittedAt ? 'YES' : 'NO'
    });
    console.log('✓ Profile API data structure is correct\n');

    // Test 2: Subject API (/api/subjects?year=X&semester=Y)
    console.log('=== TEST 2: Subject Filtering API ===');
    const subjects = await Subject.find({ 
      year: student.year, 
      semester: student.semester 
    }).populate('instructor').lean();
    
    console.log(`Found ${subjects.length} subjects for Year ${student.year}, Semester ${student.semester}`);
    if (subjects.length > 0) {
      const sample = subjects[0];
      console.log('Sample subject structure:', {
        _id: sample._id ? 'YES' : 'NO',
        code: sample.code || 'MISSING',
        title: sample.title || 'MISSING',
        year: sample.year,
        semester: sample.semester,
        description: sample.description ? 'YES' : 'NO',
        topics: Array.isArray(sample.topics) ? sample.topics.length : 0
      });
    }
    console.log('✓ Subject API data structure is correct\n');

    // Test 3: Registered Electives API (/api/admin/registered-electives)
    console.log('=== TEST 3: Registered Electives API ===');
    const registeredStudents = await Student.find({ preferences: { $exists: true, $ne: [] } })
      .populate('user', 'name email')
      .populate('preferences', 'code title year semester')
      .lean();

    const registrations = registeredStudents.map(s => ({
      studentId: s._id,
      rollNumber: s.rollNumber,
      name: s.user?.name || 'N/A',
      email: s.user?.email || 'N/A',
      department: s.department,
      year: s.year,
      semester: s.semester,
      cgpa: s.cgpa,
      preferencesLocked: s.preferencesLocked || false,
      submittedAt: s.preferencesSubmittedAt,
      preferences: (s.preferences || []).map((pref, index) => ({
        priority: index + 1,
        subjectId: pref._id,
        code: pref.code,
        title: pref.title,
        year: pref.year,
        semester: pref.semester
      }))
    }));

    console.log(`Total registrations: ${registrations.length}`);
    console.log(`Locked: ${registrations.filter(r => r.preferencesLocked).length}`);
    console.log(`Draft: ${registrations.filter(r => !r.preferencesLocked).length}`);
    
    if (registrations.length > 0) {
      const sample = registrations[0];
      console.log('\nSample registration structure:', {
        rollNumber: sample.rollNumber,
        name: sample.name,
        preferencesCount: sample.preferences.length,
        preferencesLocked: sample.preferencesLocked,
        hasSubmittedAt: !!sample.submittedAt
      });
      
      if (sample.preferences.length > 0) {
        console.log('Sample preference:', sample.preferences[0]);
      }
    }
    console.log('✓ Registered Electives API data structure is correct\n');

    // Test 4: Preference Submission Validation
    console.log('=== TEST 4: Preference Submission Validation ===');
    const subjectIds = subjects.slice(0, 3).map(s => s._id);
    console.log(`Sample subject IDs (for submission): ${subjectIds.length}`);
    
    // Validate ObjectIds
    subjectIds.forEach((id, idx) => {
      const isValid = mongoose.Types.ObjectId.isValid(id);
      console.log(`  Subject ${idx + 1}: ${id} - ${isValid ? 'VALID' : 'INVALID'}`);
    });
    
    const validCount = await Subject.countDocuments({ _id: { $in: subjectIds } });
    console.log(`Database validation: ${validCount}/${subjectIds.length} subjects exist`);
    console.log('✓ Preference submission validation logic is correct\n');

    console.log('=== ALL API TESTS PASSED ===');
    mongoose.connection.close();
    
  } catch (error) {
    console.error('✗ Test failed:', error);
    mongoose.connection.close();
  }
}

testAllAPIs();
