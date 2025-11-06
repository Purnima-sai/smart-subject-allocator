const mongoose = require('mongoose');
require('dotenv').config();
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Subject = require('../models/Subject');

const seed = async () => {
  try {
    await connectDB();
    // create admin user if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    let admin = await User.findOne({ email: adminEmail });
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash('admin123', 10);
    if (!admin) {
      admin = await User.create({ name: 'Administrator', email: adminEmail, password: hashed, role: 'admin' });
      console.log('Admin created:', adminEmail);
    } else {
      // ensure password is hashed (update if plaintext)
      const isHashed = admin.password && admin.password.length > 20; // crude check
      if (!isHashed) {
        admin.password = hashed;
        await admin.save();
        console.log('Admin password hashed and updated for', adminEmail);
      } else {
        console.log('Admin already exists:', adminEmail);
      }
    }

    // seed sample subjects
    const samples = [
      { code: 'EL101', title: 'Introduction to Robotics', capacity: 40, sections: [{ name: 'A', capacity: 20 }, { name: 'B', capacity: 20 }] },
      { code: 'EL102', title: 'AI & Machine Learning', capacity: 35, sections: [{ name: 'A', capacity: 35 }] },
      { code: 'EL103', title: 'Renewable Energy Systems', capacity: 30, sections: [{ name: 'A', capacity: 15 }, { name: 'B', capacity: 15 }] },
    ];
    for (const s of samples) {
      const exists = await Subject.findOne({ code: s.code });
      if (!exists) {
        await Subject.create(s);
        console.log('Created subject', s.code);
      }
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
