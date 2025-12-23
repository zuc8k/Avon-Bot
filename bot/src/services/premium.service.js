const Premium = require('../models/Premium');

async function getUserPlan(userId, guildId) {
  const sub = await Premium.findOne({
    userId,
    guildId,
    active: true,
    endAt: { $gt: new Date() }
  });

  return sub ? sub.plan : 'free';
}

async function isPremium(userId, guildId) {
  const plan = await getUserPlan(userId, guildId);
  return plan !== 'free';
}

module.exports = {
  getUserPlan,
  isPremium
};