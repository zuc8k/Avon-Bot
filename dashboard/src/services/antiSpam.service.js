const spamMap = new Map();

/*
  Structure:
  userId => {
    lastTransfer: timestamp,
    fails: number,
    blockedUntil: timestamp
  }
*/

function canTransfer(userId) {
  const now = Date.now();
  const data = spamMap.get(userId);

  if (!data) return { allowed: true };

  // لو محظور مؤقتًا
  if (data.blockedUntil && data.blockedUntil > now) {
    return {
      allowed: false,
      reason: `🚫 You are blocked for ${Math.ceil(
        (data.blockedUntil - now) / 1000
      )} seconds`
    };
  }

  // Cooldown 60 ثانية
  if (data.lastTransfer && now - data.lastTransfer < 60000) {
    return {
      allowed: false,
      reason: '⏱️ Please wait before making another transfer'
    };
  }

  return { allowed: true };
}

function recordSuccess(userId) {
  spamMap.set(userId, {
    lastTransfer: Date.now(),
    fails: 0
  });
}

function recordFail(userId) {
  const now = Date.now();
  const data = spamMap.get(userId) || { fails: 0 };

  data.fails += 1;

  // بعد 3 محاولات فاشلة → حظر 5 دقايق
  if (data.fails >= 3) {
    data.blockedUntil = now + 5 * 60 * 1000;
    data.fails = 0;
  }

  spamMap.set(userId, data);
}

module.exports = {
  canTransfer,
  recordSuccess,
  recordFail
};