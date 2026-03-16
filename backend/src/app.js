require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database/db');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const connectionRoutes = require('./routes/connections');
const pollRoutes = require('./routes/polls');

const app = express();

app.use(cors());
app.use(express.json());

// Initialize database and seed data on startup
initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/polls', pollRoutes);

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
