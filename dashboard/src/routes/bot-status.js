const express = require('express');
const router = express.Router();

// نفس Client بتاع البوت
const client = require('../../../bot/src/index');

router.get('/', (req, res) => {
  if (!client || !client.user) {
    return res.json({
      online: false
    });
  }

  res.json({
    online: true,
    username: client.user.username,
    ping: Math.round(client.ws.ping),
    guilds: client.guilds.cache.size,
    commands: client.application.commands.cache.size
  });
});

module.exports = router;