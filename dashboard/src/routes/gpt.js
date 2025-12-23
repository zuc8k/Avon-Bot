const express = require('express');
const router = express.Router();
const GPTUsage = require('../../bot/src/models/GPTUsage');
const plans = require('../../bot/src/config/gptPlans');

router.get('/', async (req, res) => {
  try {
    const { guildId } = req.query;
    const userId = req.user.id;

    const usage = await GPTUsage.findOne({
      userId,
      guildId
    });

    const plan = req.query.plan || 'free';

    res.json({
      used: usage?.usedWords || 0,
      limit: plans[plan] || 0,
      remaining: Math.max(
        (plans[plan] || 0) - (usage?.usedWords || 0),
        0
      )
    });
  } catch (err) {
    console.error('GPT ROUTE ERROR:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;