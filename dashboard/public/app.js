const express = require('express');
const session = require('express-session');
const passport = require('passport');

const authMiddleware = require('./middleware/auth');

// ================== ROUTES ==================
const meRoute = require('./routes/me');
const creditsRoute = require('./routes/credits');
const creditLogsRoute = require('./routes/credit-logs');
const premiumRoute = require('./routes/premium');
const logsRoute = require('./routes/logs');
const gptRoute = require('./routes/gpt');
const premiumAdminRoute = require('./routes/premium-admin');

const app = express();

/* ================== MIDDLEWARE ================== */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ Static files (Dashboard UI)
app.use(express.static('public'));

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
app.use('/api/me', authMiddleware, meRoute);
app.use('/api/credits', authMiddleware, creditsRoute);
app.use('/api/credit-logs', authMiddleware, creditLogsRoute);
app.use('/api/premium', authMiddleware, premiumRoute);
app.use('/api/logs', authMiddleware, logsRoute);
app.use('/api/gpt', authMiddleware, gptRoute);
app.use('/api/premium-admin', authMiddleware, premiumAdminRoute);

/* ================== HEALTH CHECK ================== */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'AVON Dashboard'
  });
});

/* ================== ERROR HANDLER ================== */
app.use((err, req, res, next) => {
  console.error('DASHBOARD ERROR:', err);
  res.status(500).json({
    error: 'Internal Server Error'
  });
});

/* ================== EXPORT ================== */
module.exports = app;