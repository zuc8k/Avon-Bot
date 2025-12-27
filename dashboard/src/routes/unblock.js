const express = require('express');
const router = express.Router();
const { isAdmin } = require('../services/permission.service');
const { unblockUser } = require('../../bot/src/services/antiSpam.service');

router.post('/', async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { guildId, userId } = req.body;
  await unblockUser(userId, guildId);

  res.json({ success: true });
});

module.exports = router;