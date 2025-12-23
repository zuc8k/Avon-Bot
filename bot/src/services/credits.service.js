const Wallet = require('../models/Wallet');
const CreditLog = require('../models/CreditLog');

function calcTax(amount) {
  return Math.floor(amount * 0.05); // 5%
}

async function getWallet(userId, guildId) {
  let wallet = await Wallet.findOne({ userId, guildId });
  if (!wallet) {
    wallet = await Wallet.create({ userId, guildId, balance: 0 });
  }
  return wallet;
}

async function transferCredits(guildId, fromId, toId, amount) {
  const from = await getWallet(fromId, guildId);
  const to = await getWallet(toId, guildId);

  const tax = calcTax(amount);
  const receive = amount - tax;

  if (from.balance < amount) {
    throw new Error('INSUFFICIENT_BALANCE');
  }

  from.balance -= amount;
  to.balance += receive;

  await from.save();
  await to.save();

  await CreditLog.create({
    guildId,
    from: fromId,
    to: toId,
    amount,
    tax
  });

  return { tax, receive };
}

module.exports = {
  transferCredits
};