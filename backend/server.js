const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const mealRoutes = require('./routes/mealRoutes');
const registerRoutes = require('./routes/registerRoutes');
const statsRoutes = require('./routes/statsRoutes');
const unitRoutes = require('./routes/unitRoutes');
const configRoutes = require('./routes/configRoutes');
const logRoutes = require('./routes/logRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/config', configRoutes);
app.use('/api/logs', logRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// FIX: Express 5 không còn hỗ trợ '*' nữa
// 404 handler (FIX CHUẨN)
app.use(/.*/, (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Database: ${process.env.DB_NAME}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`📊 Available routes:`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/users/* (admin only)`);
  console.log(`   POST   /api/register/register`);
  console.log(`   POST   /api/register/cancel/:id`);
  console.log(`   GET    /api/stats/*`);
  console.log(`   GET    /api/config/* (admin only)`);
});
