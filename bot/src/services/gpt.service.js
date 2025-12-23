const GPTUsage = require('../models/GPTUsage');
const { getUserPlan } = require('./premium.service');
const plans = require('../config/gptPlans');

function countWords(text) {
  return text.trim().split(/\s+/).length;
}

async function canUseGPT(userId, guildId, text) {
  const plan = await getUserPlan(userId, guildId);
  const limit = plans[plan];

  let usage = await GPTUsage.findOne({ userId, guildId });
  if (!usage) {
    usage = await GPTUsage.create({
      userId,
      guildId,
      usedWords: 0,
      resetAt: new Date()
    });
  }

  const words = countWords(text);

  return {
    allowed: usage.usedWords + words <= limit,
    words,
    used: usage.usedWords,
    limit,
    plan
  };
}

async function consumeGPT(userId, guildId, words) {
  await GPTUsage.findOneAndUpdate(
    { userId, guildId },
    { $inc: { usedWords: words } },
    { upsert: true }
  );
}

module.exports = {
  canUseGPT,
  consumeGPT
};