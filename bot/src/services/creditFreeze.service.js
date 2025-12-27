const CreditFreeze = require('../models/CreditFreeze');
const FreezeLog = require('../models/FreezeLog');

/* ================== CHECK ================== */
async function isFrozen(userId, guildId) {
  const f = await CreditFreeze.findOne({ userId, guildId });
  return f;
}

/* ================== FREEZE ================== */
async function freezeUser({ userId, guildId, reason, frozenBy }) {
  await CreditFreeze.findOneAndUpdate(
    { userId, guildId },
    { reason, frozenBy },
    { upsert: true }
  );

  await FreezeLog.create({
    userId,
    guildId,
    action: 'freeze',
    reason,
    by: frozenBy
  });
}

/* ================== UNFREEZE ================== */
async function unfreezeUser(userId, guildId, by) {
  await CreditFreeze.deleteOne({ userId, guildId });

  await FreezeLog.create({
    userId,
    guildId,
    action: 'unfreeze',
    by
  });
}

/* ================== LIST ================== */
async function getFrozenUsers(guildId) {
  return CreditFreeze.find({ guildId }).sort({ createdAt: -1 });
}

/* ================== LOGS ================== */
async function getFreezeLogs(guildId) {
  return FreezeLog.find({ guildId }).sort({ createdAt: -1 }).limit(50);
}

module.exports = {
  isFrozen,
  freezeUser,
  unfreezeUser,
  getFrozenUsers,
  getFreezeLogs
};