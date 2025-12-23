const Wallet = require('../models/Wallet');
const CreditLog = require('../models/CreditLog');
const { getUserPlan } = require('./premium.service');

// نسب الضريبة حسب الخطة
const TAX_BY_PLAN = {
  free: 0.05,
  plus: 0.03,
  premium: 0,
  max: 0
};

async function getWallet(userId, guildId) {
  let wallet = await Wallet.findOne({ userId, guildId });
  if (!wallet) {
    wallet = await Wallet.create({ userId, guildId, balance: 0 });
  }
  return wallet;
}

function calcTax(amount, plan) {
  const rate = TAX_BY_PLAN[plan] ?? 0.05;
  return Math.floor(amount * rate);
}

async function transferCredits(guildId, fromId, toId, amount) {
  if (amount <= 0) throw new Error('INVALID_AMOUNT');

  const from = await getWallet(fromId, guildId);
  const to = await getWallet(toId, guildId);

  if (from.balance < amount) throw new Error('INSUFFICIENT_BALANCE');

  // 👑 هنا الربط مع البريميم
  const plan = await getUserPlan(fromId, guildId);
  const tax = calcTax(amount, plan);
  const received = amount - tax;

  from.balance -= amount;
  to.balance += received;

  await from.save();
  await to.save();

  await CreditLog.create({
    guildId,
    from: fromId,
    to: toId,
    amount,
    tax,
    received
  });

  return { tax, received, plan };
}

module.exports = {
  getWallet,
  transferCredits
};