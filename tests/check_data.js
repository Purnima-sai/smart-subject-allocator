const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

// Import models
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const User = require('../models/User');
const Allocation = require('../models/Allocation');
const AllocationSnapshot = require('../models/AllocationSnapshot');

async function checkCollections() {
    try {
        await connectDB();
        
        // Check Users
        const users = await User.find().lean();
        console.log('\nUsers:', users.length);
        users.forEach(u => console.log(` - ${u.name} (${u.email}), role: ${u.role}`));

        // Check Subjects
        const subjects = await Subject.find().lean();
        console.log('\nSubjects:', subjects.length);
        subjects.forEach(s => console.log(` - ${s.code}: ${s.title}, capacity: ${s.capacity}`));

        // Check Students with preferences
        const students = await Student.find()
            .populate('user')
            .populate('preferences')
            .lean();
        console.log('\nStudents:', students.length);
        students.forEach(s => {
            console.log(` - ${s.user ? s.user.name : 'No user'}`);
            console.log('   Preferences:', (s.preferences || []).length);
            s.preferences && s.preferences.forEach(p => 
                console.log(`   * ${p.code || p}: ${p.title || 'Unknown subject'}`));
        });

        // Check Allocations
        const allocations = await Allocation.find()
            .populate('student')
            .populate('subject')
            .lean();
        console.log('\nAllocations:', allocations.length);
        allocations.forEach(a => {
            const student = a.student && a.student.user ? a.student.user.name : 'Unknown student';
            const subject = a.subject ? a.subject.code : 'Unknown subject';
            console.log(` - ${student} -> ${subject} (priority: ${a.priority}, section: ${a.section || 'N/A'})`);
        });

        // Check Snapshots
        const snapshots = await AllocationSnapshot.find().lean();
        console.log('\nAllocation Snapshots:', snapshots.length);
        snapshots.forEach(s => {
            console.log(` - Created: ${s.createdAt}, Allocations: ${s.allocations.length}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkCollections();