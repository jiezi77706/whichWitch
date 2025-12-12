// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('../src/backend/routes/auth');
const marketplaceRoutes = require('../src/backend/routes/marketplace');
const cybergraphRoutes = require('../src/backend/routes/cybergraph');
const aiRoutes = require('../src/backend/routes/ai');
const transactionRoutes = require('../src/backend/routes/transactions');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/cybergraph', cybergraphRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'whichWitch API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Export for Vercel
module.exports = app;