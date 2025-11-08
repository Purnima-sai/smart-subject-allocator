require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
  // Give time for logging then exit
  setTimeout(() => process.exit(1), 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection:', err);
});

// routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const subjectRoutes = require('./routes/subjectRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// serve uploaded files (temporary CSVs, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// connect DB
connectDB();

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/allocation', allocationRoutes);
app.use('/api/subjects', subjectRoutes);

// error handler
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5001;
try {
  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use. Please free it or change PORT in .env`);
      process.exit(1);
    } else {
      logger.error('Server error:', err);
      process.exit(1);
    }
  });
} catch (err) {
  logger.error('Failed to start server:', err);
  process.exit(1);
}
