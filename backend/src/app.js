require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initializeDatabase } = require('./database/db');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const connectionRoutes = require('./routes/connections');
const pollRoutes = require('./routes/polls');

const app = express();

app.use(cors());
app.use(express.json());

// Strict limiter for authentication endpoints (prevents brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

// General limiter for all other API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

// Initialize database and seed data on startup
initializeDatabase();

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profiles', apiLimiter, profileRoutes);
app.use('/api/connections', apiLimiter, connectionRoutes);
app.use('/api/polls', apiLimiter, pollRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SoulSync API running on port ${PORT}`);
});

module.exports = app;
