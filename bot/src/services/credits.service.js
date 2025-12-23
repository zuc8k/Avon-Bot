const Wallet = require('../models/Wallet');
const CreditLog = require('../models/CreditLog');

const TAX_RATE = 0.05;

async function getWallet(userId, guildId) {
  let wallet = await Wallet.findOne({ userId, guildId });
  if (!wallet) {
    wallet = await Wallet.create({ userId, guildId, balance: 0 });
  }
  return wallet;
}

function calcTax(amount) {
  return Math.floor(amount * TAX_RATE);
}

async function transferCredits(guildId, fromId, toId, amount) {
  if (amount <= 0) throw new Error('INVALID_AMOUNT');

  const from = await getWallet(fromId, guildId);
  const to = await getWallet(toId, guildId);

  if (from.balance < amount) throw new Error('INSUFFICIENT_BALANCE');

  const tax = calcTax(amount);
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

  return { tax, received };
}

module.exports = {
  getWallet,
  transferCredits
};