const express = require('express');
const session = require('express-session');
const passport = require('passport');

const authMiddleware = require('./middleware/auth');

// ================== ROUTES ==================
const meRoute = require('./routes/me');
const creditsRoute = require('./routes/credits');
const creditLogsRoute = require('./routes/credit-logs');
const premiumRoute = require('./routes/premium');
const gptRoute = require('./routes/gpt');
const logsRoute = require('./routes/logs');

const app = express();

/* ================== MIDDLEWARE ================== */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'avon_secret',
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ================== API ROUTES ================== */

// current user info
app.use('/api/me', authMiddleware, meRoute);

// credits balance
app.use('/api/credits', authMiddleware, creditsRoute);

// credits transfer logs (admin / owner)
app.use('/api/credit-logs', authMiddleware, creditLogsRoute);

// premium system
app.use('/api/premium', authMiddleware, premiumRoute);

// GPT usage
app.use('/api/gpt', authMiddleware, gptRoute);

// general logs (admin / owner)
app.use('/api/logs', authMiddleware, logsRoute);

/* ================== HEALTH CHECK ================== */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'AVON Dashboard'
  });
});

/* ================== ERROR HANDLER ================== */
app.use((err, req, res, next) => {
  console.error('❌ Dashboard Error:', err);
  res.status(500).json({
    error: 'Internal Server Error'
  });
});

/* ================== EXPORT APP ================== */
module.exports = app;