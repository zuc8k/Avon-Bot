const CreditFreeze = require('../models/CreditFreeze');

async function isFrozen(userId, guildId) {
  const f = await CreditFreeze.findOne({ userId, guildId });
  return !!f;
}

async function freezeUser({ userId, guildId, reason, frozenBy }) {
  await CreditFreeze.findOneAndUpdate(
    { userId, guildId },
    { reason, frozenBy },
    { upsert: true }
  );
}

async function unfreezeUser(userId, guildId) {
  await CreditFreeze.deleteOne({ userId, guildId });
}

async function getFrozenUsers(guildId) {
  return CreditFreeze.find({ guildId }).sort({ createdAt: -1 });
}

module.exports = {
  isFrozen,
  freezeUser,
  unfreezeUser,
  getFrozenUsers
};