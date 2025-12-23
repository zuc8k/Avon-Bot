const Premium = require('../models/Premium');

/* ================== GET PLAN ================== */
async function getUserPlan(userId, guildId) {
  const sub = await Premium.findOne({
    userId,
    guildId,
    active: true,
    expiresAt: { $gt: new Date() }
  });

  return sub ? sub.plan : 'free';
}

/* ================== ADD / UPDATE ================== */
async function setPremium(userId, guildId, plan, days) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  return Premium.findOneAndUpdate(
    { userId, guildId },
    {
      plan,
      active: true,
      expiresAt
    },
    { upsert: true, new: true }
  );
}

/* ================== REMOVE ================== */
async function removePremium(userId, guildId) {
  return Premium.findOneAndUpdate(
    { userId, guildId },
    {
      active: false
    }
  );
}

/* ================== STATUS ================== */
async function getPremiumStatus(userId, guildId) {
  return Premium.findOne({ userId, guildId });
}

module.exports = {
  getUserPlan,
  setPremium,
  removePremium,
  getPremiumStatus
};