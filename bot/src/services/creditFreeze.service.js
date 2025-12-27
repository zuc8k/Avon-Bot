const CreditFreeze = require('../models/CreditFreeze');

/* ================== CHECK ================== */
async function isFrozen(userId, guildId) {
  const freeze = await CreditFreeze.findOne({ userId, guildId });
  if (!freeze) return false;

  // ⏱️ فريز مؤقت وانتهى
  if (freeze.expiresAt && freeze.expiresAt <= new Date()) {
    await CreditFreeze.deleteOne({ userId, guildId });
    return false;
  }

  return true;
}

/* ================== INFO ================== */
async function getFreezeInfo(userId, guildId) {
  const freeze = await CreditFreeze.findOne({ userId, guildId });
  if (!freeze) return null;

  if (freeze.expiresAt && freeze.expiresAt <= new Date()) {
    await CreditFreeze.deleteOne({ userId, guildId });
    return null;
  }

  return freeze;
}

/* ================== FREEZE ================== */
async function freezeUser({
  userId,
  guildId,
  reason,
  frozenBy,
  durationMinutes
}) {
  let expiresAt = null;

  if (durationMinutes) {
    expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);
  }

  await CreditFreeze.findOneAndUpdate(
    { userId, guildId },
    { reason, frozenBy, expiresAt },
    { upsert: true }
  );
}

/* ================== UNFREEZE ================== */
async function unfreezeUser(userId, guildId) {
  await CreditFreeze.deleteOne({ userId, guildId });
}

/* ================== LIST ================== */
async function getFrozenUsers(guildId) {
  return CreditFreeze.find({ guildId }).sort({ createdAt: -1 });
}

module.exports = {
  isFrozen,
  getFreezeInfo,
  freezeUser,
  unfreezeUser,
  getFrozenUsers
};