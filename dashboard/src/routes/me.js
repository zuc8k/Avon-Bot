const express = require('express');
const router = express.Router();

const Wallet = require('../../bot/src/models/Wallet');
const Premium = require('../../bot/src/models/Premium');
const GPTUsage = require('../../bot/src/models/GPTUsage');
const { getUserPlan } = require('../../bot/src/services/premium.service');
const plans = require('../../bot/src/config/gptPlans');

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const guildId = req.query.guildId;

    /* ================== WALLET ================== */
    const wallet = await Wallet.findOne({
      userId,
      guildId
    });

    /* ================== PREMIUM ================== */
    const plan = await getUserPlan(userId, guildId);

    /* ================== GPT USAGE ================== */
    const usage = await GPTUsage.findOne({
      userId,
      guildId
    });

    res.json({
      user: {
        id: req.user.id,
        username: req.user.username
      },
      role: req.user.role,
      credits: wallet?.balance || 0,
      premium: {
        plan,
        active: plan !== 'free'
      },
      gpt: {
        used: usage?.usedWords || 0,
        limit: plans[plan] || 0,
        remaining: Math.max(
          (plans[plan] || 0) - (usage?.usedWords || 0),
          0
        )
      }
    });
  } catch (err) {
    console.error('ME ROUTE ERROR:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;