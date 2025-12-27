const CreditFreeze = require('../models/CreditFreeze');
const CreditFreezeLog = require('../models/CreditFreezeLog');

/* ================== CHECK ================== */
async function isFrozen(userId, guildId) {
  const f = await CreditFreeze.findOne({ userId, guildId });
  return !!f;
}

/* ================== FREEZE ================== */
async function freezeUser({ userId, guildId, reason, frozenBy }) {
  await CreditFreeze.findOneAndUpdate(
    { userId, guildId },
    { reason, frozenBy },
    { upsert: true }
  );

  await CreditFreezeLog.create({
    guildId,
    userId,
    action: 'freeze',
    reason,
    by: frozenBy
  });
}

/* ================== UNFREEZE ================== */
async function unfreezeUser(userId, guildId, by) {
  await CreditFreeze.deleteOne({ userId, guildId });

  await CreditFreezeLog.create({
    guildId,
    userId,
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
  return CreditFreezeLog
    .find({ guildId })
    .sort({ createdAt: -1 })
    .limit(50);
}

module.exports = {
  isFrozen,
  freezeUser,
  unfreezeUser,
  getFrozenUsers,
  getFreezeLogs
};