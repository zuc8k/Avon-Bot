const AntiSpamSettings = require('../models/AntiSpamSettings');
const BlockedUser = require('../models/BlockedUser');

const spamMap = new Map();

/* ================== SETTINGS ================== */
async function getSettings(guildId) {
  let s = await AntiSpamSettings.findOne({ guildId });
  if (!s) s = await AntiSpamSettings.create({ guildId });
  return s;
}

/* ================== CHECK ================== */
async function canTransfer(userId, guildId) {
  const now = Date.now();

  const dbBlock = await BlockedUser.findOne({ userId, guildId });
  if (dbBlock && dbBlock.blockedUntil > now) {
    return {
      allowed: false,
      reason: `🚫 You are blocked until ${dbBlock.blockedUntil.toLocaleString()}`,
      alert: true
    };
  }

  const data = spamMap.get(userId);
  const settings = await getSettings(guildId);

  if (
    data?.lastTransfer &&
    now - data.lastTransfer < settings.cooldownSeconds * 1000
  ) {
    return {
      allowed: false,
      reason: `⏱️ Please wait ${settings.cooldownSeconds} seconds`,
      alert: false
    };
  }

  return { allowed: true };
}

/* ================== SUCCESS ================== */
async function recordSuccess(userId) {
  spamMap.set(userId, { lastTransfer: Date.now(), fails: 0 });
}

/* ================== FAIL ================== */
async function recordFail(userId, guildId) {
  const now = Date.now();
  const settings = await getSettings(guildId);
  const data = spamMap.get(userId) || { fails: 0 };

  data.fails++;

  if (data.fails >= settings.maxFails) {
    const until = new Date(now + settings.blockMinutes * 60 * 1000);

    await BlockedUser.findOneAndUpdate(
      { userId, guildId },
      {
        blockedUntil: until,
        reason: 'Exceeded spam limit'
      },
      { upsert: true }
    );

    spamMap.delete(userId);

    return { blocked: true, reason: 'Auto block applied' };
  }

  spamMap.set(userId, data);
  return { blocked: false };
}

/* ================== UNBLOCK ================== */
async function unblockUser(userId, guildId) {
  await BlockedUser.deleteOne({ userId, guildId });
  spamMap.delete(userId);
}

module.exports = {
  canTransfer,
  recordSuccess,
  recordFail,
  unblockUser
};