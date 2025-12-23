const CreditSettings = require('../models/CreditSettings');
const { transferCredits } = require('../services/credits.service');

const activeCaptcha = new Map();

module.exports = async function handlePrefix(message) {
  if (message.author.bot) return;
  if (!message.guild) return;

  const prefix = 'c ';
  if (!message.content.toLowerCase().startsWith(prefix)) return;

  const guildId = message.guild.id;
  const channelId = message.channel.id;
  const fromId = message.author.id;

  /* ================== CHANNEL CHECK ================== */
  const settings = await CreditSettings.findOne({ guildId });
  if (!settings || settings.transferChannelId !== channelId) {
    return message.reply('❌ Credit transfers are not allowed in this channel.');
  }

  /* ================== PARSE ================== */
  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const user = message.mentions.users.first();
  const amount = parseInt(args[1], 10);

  if (!user || isNaN(amount)) {
    return message.reply('❌ Usage: c @user amount');
  }

  if (user.bot) {
    return message.reply('❌ You cannot transfer credits to bots.');
  }

  if (user.id === fromId) {
    return message.reply('❌ You cannot transfer credits to yourself.');
  }

  if (amount <= 0) {
    return message.reply('❌ Invalid amount.');
  }

  /* ================== CAPTCHA ================== */
  const captcha = Math.floor(1000 + Math.random() * 9000).toString();

  activeCaptcha.set(fromId, {
    captcha,
    toId: user.id,
    amount,
    guildId,
    tries: 0
  });

  await message.reply(
    `🔐 **Credit Transfer Verification**\n` +
    `You are transferring **${amount} credits** to **${user.username}**\n\n` +
    `Type this code to confirm:\n` +
    `**${captcha}**`
  );

  const filter = m => m.author.id === fromId;
  const collector = message.channel.createMessageCollector({
    filter,
    time: 60000
  });

  collector.on('collect', async msg => {
    const data = activeCaptcha.get(fromId);
    if (!data) return collector.stop();

    if (msg.content === data.captcha) {
      try {
        const result = await transferCredits(
          guildId,
          fromId,
          data.toId,
          data.amount
        );

        await msg.reply(
          `✅ **Transfer Successful**\n` +
          `Tax: **${result.tax}**\n` +
          `Received: **${result.received}**`
        );
      } catch (err) {
        console.error(err);
        await msg.reply('❌ Transfer failed.');
      }

      activeCaptcha.delete(fromId);
      collector.stop();
    } else {
      data.tries++;

      if (data.tries >= 3) {
        await msg.reply('❌ Too many wrong attempts. Transfer cancelled.');
        activeCaptcha.delete(fromId);
        collector.stop();
      } else {
        await msg.reply('❌ Wrong code. Try again.');
      }
    }
  });

  collector.on('end', () => {
    activeCaptcha.delete(fromId);
  });
};