const express = require('express');
const router = express.Router();
const Premium = require('../../bot/src/models/Premium');

router.post('/add', async (req, res) => {
  try {
    if (!['owner', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { userId, guildId, plan, days } = req.body;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const sub = await Premium.findOneAndUpdate(
      { userId, guildId },
      {
        plan,
        active: true,
        expiresAt
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      subscription: sub
    });
  } catch (err) {
    console.error('PREMIUM ADD ERROR:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/remove', async (req, res) => {
  try {
    if (!['owner', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { userId, guildId } = req.body;

    await Premium.findOneAndUpdate(
      { userId, guildId },
      { active: false }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('PREMIUM REMOVE ERROR:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;