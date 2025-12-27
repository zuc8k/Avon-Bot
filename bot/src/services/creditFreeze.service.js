const AntiSpamSettings = require('../models/AntiSpamSettings');

const spamMap = new Map();

/* ================== SETTINGS ================== */
async function getSettings(guildId) {
  let s = await AntiSpamSettings.findOne({ guildId });
  if (!s) {
    s = await AntiSpamSettings.create({ guildId });
  }
  return s;
}

/* ================== CHECK ================== */
async function canTransfer(userId, guildId) {
  const now = Date.now();
  const data = spamMap.get(userId);
  const settings = await getSettings(guildId);

  if (data?.blockedUntil && data.blockedUntil > now) {
    return {
      allowed: false,
      reason: `🚫 Blocked for ${Math.ceil((data.blockedUntil - now) / 1000)}s`,
      alert: true
    };
  }

  if (
    data?.lastTransfer &&
    now - data.lastTransfer < settings.cooldownSeconds * 1000
  ) {
    return {
      allowed: false,
      reason: `⏱️ Wait ${settings.cooldownSeconds}s between transfers`,
      alert: false
    };
  }

  return { allowed: true };
}

/* ================== SUCCESS ================== */
async function recordSuccess(userId) {
  spamMap.set(userId, {
    lastTransfer: Date.now(),
    fails: 0
  });
}

/* ================== FAIL ================== */
async function recordFail(userId, guildId) {
  const now = Date.now();
  const data = spamMap.get(userId) || { fails: 0 };
  const settings = await getSettings(guildId);

  data.fails++;

  if (data.fails >= settings.maxFails) {
    data.blockedUntil = now + settings.blockMinutes * 60 * 1000;
    data.fails = 0;

    spamMap.set(userId, data);
    return {
      blocked: true,
      reason: 'Exceeded max failed attempts'
    };
  }

  spamMap.set(userId, data);
  return { blocked: false };
}

module.exports = {
  canTransfer,
  recordSuccess,
  recordFail
};