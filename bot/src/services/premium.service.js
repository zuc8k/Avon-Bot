const Premium = require('../models/Premium');

async function getUserPlan(userId, guildId) {
  const sub = await Premium.findOne({
    userId,
    guildId,
    active: true,
    expiresAt: { $gt: new Date() }
  });

  return sub ? sub.plan : 'free';
}

module.exports = {
  getUserPlan
};