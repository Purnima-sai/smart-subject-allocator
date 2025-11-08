require('dotenv').config();
const { connectDB } = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function verify(email, password) {
  try {
    await connectDB();
    const user = await User.findOne({ email }).lean();
    if (!user) {
      console.log(`User not found: ${email}`);
      return process.exit(2);
    }
    console.log(`Found user: ${user.email} (role=${user.role})`);
    console.log(`Stored password preview: ${user.password ? user.password.slice(0,12) + '...' : '(none)'} (len=${user.password ? user.password.length : 0})`);
    const match = await bcrypt.compare(password, user.password || '');
    console.log(`Password match for provided password: ${match}`);
    if (!match) {
      console.log('If this is false, the stored password and provided password differ.');
      console.log('You can reset the password using the seed script or update the user record to a bcrypt-hashed password.');
    }
    process.exit(match ? 0 : 3);
  } catch (err) {
    console.error('Error verifying login:', err);
    process.exit(1);
  }
}

const email = process.argv[2];
const password = process.argv[3];
if (!email || !password) {
  console.error('Usage: node scripts/verifyLogin.js <email> <password>');
  process.exit(1);
}
verify(email, password);
