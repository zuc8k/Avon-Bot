const express = require('express');
const router = express.Router();
const Premium = require('../../bot/src/models/Premium');

router.get('/', async (req, res) => {
  const sub = await Premium.findOne({
    userId: req.user.id,
    guildId: req.query.guildId,
    active: true
  });
  res.json(sub || { plan: 'free' });
});

module.exports = router;