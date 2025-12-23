const express = require('express');
const router = express.Router();
const GPTUsage = require('../../bot/src/models/GPTUsage');

router.get('/', async (req, res) => {
  const usage = await GPTUsage.findOne({
    userId: req.user.id,
    guildId: req.query.guildId
  });
  res.json(usage || { usedWords: 0 });
});

module.exports = router;