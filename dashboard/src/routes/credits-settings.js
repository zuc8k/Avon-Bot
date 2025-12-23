const express = require('express');
const router = express.Router();

const CreditSettings = require('../../../bot/src/models/CreditSettings');

// جلب الإعدادات
router.get('/', async (req, res) => {
  const { guildId } = req.query;

  const settings = await CreditSettings.findOne({ guildId });

  res.json({
    transferChannelId: settings?.transferChannelId || null
  });
});

// حفظ الإعدادات
router.post('/', async (req, res) => {
  if (!['owner', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { guildId, channelId } = req.body;

  await CreditSettings.findOneAndUpdate(
    { guildId },
    { transferChannelId: channelId },
    { upsert: true }
  );

  res.json({ success: true });
});

module.exports = router;