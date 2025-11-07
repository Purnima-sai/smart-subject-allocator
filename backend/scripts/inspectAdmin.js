require('dotenv').config();
const { connectDB } = require('../config/db');
const User = require('../models/User');

const printAdmin = async () => {
  try {
    await connectDB();
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const admin = await User.findOne({ email: adminEmail }).lean();
    if (!admin) {
      console.error('Admin user not found for', adminEmail);
      process.exit(2);
    }
    // Hide sensitive fields only partially (we'll show length and first few chars)
    const shown = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      password_preview: admin.password ? admin.password.slice(0, 10) + '...' : null,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
    console.log('== Admin document ==');
    console.log(JSON.stringify(shown, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error inspecting admin:', err);
    process.exit(1);
  }
};

printAdmin();
