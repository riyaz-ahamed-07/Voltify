require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');

// Import all routes
const authRoutes         = require('./src/routes/auth.routes');
const onboardingRoutes   = require('./src/routes/onboarding.routes');
const dashboardRoutes    = require('./src/routes/dashboard.routes');
const coachRoutes        = require('./src/routes/coach.routes');
const gamificationRoutes = require('./src/routes/gamification.routes');
const leaderboardRoutes  = require('./src/routes/leaderboard.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const profileRoutes      = require('./src/routes/profile.routes');
const settingsRoutes     = require('./src/routes/settings.routes');

const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// ───────────────────────────────
// MIDDLEWARE
// ───────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ───────────────────────────────
// HEALTH CHECK (no auth needed)
// ───────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'voltify-api',
    version: '1.0.0',
  });
});

// ───────────────────────────────
// API ROUTES
// ───────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/onboarding',    onboardingRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/coach',         coachRoutes);
app.use('/api/gamification',  gamificationRoutes);
app.use('/api/leaderboard',   leaderboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile',       profileRoutes);
app.use('/api/settings',      settingsRoutes);

// ───────────────────────────────
// 404 HANDLER
// ───────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ───────────────────────────────
// GLOBAL ERROR HANDLER (MUST BE LAST)
// ───────────────────────────────
app.use(errorHandler);

module.exports = app;
