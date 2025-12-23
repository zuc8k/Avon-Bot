const express = require('express');
const session = require('express-session');

const auth = require('./middleware/auth');

const app = express();
app.use(express.json());
app.use(session({ secret: 'avon', resave: false, saveUninitialized: false }));

app.use('/api/me', auth, require('./routes/me'));
app.use('/api/credits', auth, require('./routes/credits'));
app.use('/api/premium', auth, require('./routes/premium'));
app.use('/api/gpt', auth, require('./routes/gpt'));
app.use('/api/logs', auth, require('./routes/logs'));

module.exports = app;