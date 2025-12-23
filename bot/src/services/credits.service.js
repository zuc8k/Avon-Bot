const Wallet = require('../models/Wallet');
const CreditLog = require('../models/CreditLog');
const { getUserPlan } = require('./premium.service');

/*
  نسب الضريبة حسب خطة البريميم
  free     => 5%
  plus     => 3%
  premium  => 0%
  max      => 0%
*/
const TAX_BY_PLAN = {
  free: 0.05,
  plus: 0.03,
  premium: 0,
  max: 0
};

/* ================== WALLET ================== */
async function getWallet(userId, guildId) {
  let wallet = await Wallet.findOne({ userId, guildId });

  if (!wallet) {
    wallet = await Wallet.create({
      userId,
      guildId,
      balance: 0
    });
  }

  return wallet;
}

/* ================== TAX ================== */
function calcTax(amount, plan) {
  const rate = TAX_BY_PLAN[plan] ?? TAX_BY_PLAN.free;
  return Math.floor(amount * rate);
}

/* ================== TRANSFER ================== */
async function transferCredits(guildId, fromId, toId, amount) {
  if (amount <= 0) {
    throw new Error('INVALID_AMOUNT');
  }

  const fromWallet = await getWallet(fromId, guildId);
  const toWallet = await getWallet(toId, guildId);

  if (fromWallet.balance < amount) {
    throw new Error('INSUFFICIENT_BALANCE');
  }

  // جلب خطة البريميم للمُرسل
  const plan = await getUserPlan(fromId, guildId);

  // حساب الضريبة حسب الخطة
  const tax = calcTax(amount, plan);
  const received = amount - tax;

  // تنفيذ التحويل
  fromWallet.balance -= amount;
  toWallet.balance += received;

  await fromWallet.save();
  await toWallet.save();

  // تسجيل اللوج
  await CreditLog.create({
    guildId,
    from: fromId,
    to: toId,
    amount,
    tax,
    received
  });

  return {
    tax,
    received,
    plan
  };
}

module.exports = {
  getWallet,
  transferCredits
};