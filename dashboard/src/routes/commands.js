const express = require('express');
const router = express.Router();
const CommandToggle = require('../../../bot/src/models/CommandToggle');

// جلب حالة كل الأوامر
router.get('/', async (req, res) => {
  const { guildId } = req.query;
  const rows = await CommandToggle.find({ guildId });
  res.json(rows);
});

// تفعيل / تعطيل أمر
router.post('/toggle', async (req, res) => {
  if (!['owner', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { guildId, command, enabled } = req.body;

  const row = await CommandToggle.findOneAndUpdate(
    { guildId, command },
    { enabled },
    { upsert: true, new: true }
  );

  res.json({ success: true, row });
});

module.exports = router;