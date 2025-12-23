const express = require('express');
const router = express.Router();
const Wallet = require('../../bot/src/models/Wallet');
const GPTUsage = require('../../bot/src/models/GPTUsage');
const { getUserPlan } = require('../../bot/src/services/premium.service');
const plans = require('../../bot/src/config/gptPlans');

router.get('/', async (req, res) => {
  const userId = req.user.id;
  const guildId = req.query.guildId;

  const wallet = await Wallet.findOne({ userId });
  const plan = await getUserPlan(userId, guildId);
  const usage = await GPTUsage.findOne({ userId, guildId });

  res.json({
    user: req.user,
    role: req.user.role,
    credits: wallet?.balance || 0,
    plan,
    gpt: {
      used: usage?.usedWords || 0,
      limit: plans[plan]
    }
  });
});

module.exports = router;