const CreditFreeze = require('../models/CreditFreeze');

/* ================== CHECK ================== */
async function isFrozen(userId, guildId) {
  const freeze = await CreditFreeze.findOne({ userId, guildId });
  if (!freeze) return false;

  // 🕒 فريز مؤقت وانتهى
  if (freeze.expiresAt && freeze.expiresAt <= new Date()) {
    await CreditFreeze.deleteOne({ userId, guildId });
    return false;
  }

  return true;
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

  if (durationMinutes && durationMinutes > 0) {
    expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);
  }

  await CreditFreeze.findOneAndUpdate(
    { userId, guildId },
    {
      reason,
      frozenBy,
      expiresAt
    },
    { upsert: true, new: true }
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
  freezeUser,
  unfreezeUser,
  getFrozenUsers
};