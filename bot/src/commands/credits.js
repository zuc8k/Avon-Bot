const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const { transferCredits } = require('../services/credits.service');
const CreditSettings = require('../models/CreditSettings');
const sendCreditLog = require('../utils/sendCreditLog');
const sendSpamAlert = require('../utils/sendSpamAlert');
const client = require('../index');

const {
  canTransfer,
  recordSuccess,
  recordFail
} = require('../services/antiSpam.service');

const {
  isFrozen
} = require('../services/creditFreeze.service');

const activeCaptcha = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('c')
    .setDescription('Transfer credits to another user')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('Target user')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('amount')
        .setDescription('Amount to transfer')
        .setRequired(true)
    ),

  async execute(interaction) {
    const fromId = interaction.user.id;
    const toUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const guildId = interaction.guildId;
    const channelId = interaction.channelId;

    /* ================== FREEZE CHECK (SENDER) ================== */
    const senderFrozen = await isFrozen(fromId, guildId);
    if (senderFrozen) {
      return interaction.reply({
        content:
          `🧊 **Your credits are frozen**\n` +
          `Reason: ${senderFrozen.reason || 'No reason provided'}`,
        ephemeral: true
      });
    }

    /* ================== FREEZE CHECK (RECEIVER) ================== */
    if (toUser) {
      const receiverFrozen = await isFrozen(toUser.id, guildId);
      if (receiverFrozen) {
        return interaction.reply({
          content: '🧊 This user credits are frozen. Transfer blocked.',
          ephemeral: true
        });
      }
    }

    /* ================== ANTI SPAM ================== */
    const spam = await canTransfer(fromId, guildId);
    if (!spam.allowed) {
      if (spam.alert) {
        await sendSpamAlert(client, {
          guildId,
          userId: fromId,
          userTag: interaction.user.tag,
          reason: spam.reason
        });
      }

      return interaction.reply({
        content: spam.reason,
        ephemeral: true
      });
    }

    /* ================== CHANNEL CHECK ================== */
    const settings = await CreditSettings.findOne({ guildId });
    if (!settings || settings.transferChannelId !== channelId) {
      return interaction.reply({
        content: '❌ Credit transfers are only allowed in the configured transfer channel.',
        ephemeral: true
      });
    }

    /* ================== VALIDATION ================== */
    if (toUser.bot || toUser.id === fromId || amount <= 0) {
      await recordFail(fromId, guildId);
      return interaction.reply({
        content: '❌ Invalid transfer request.',
        ephemeral: true
      });
    }

    /* ================== CAPTCHA ================== */
    const captcha = Math.floor(1000 + Math.random() * 9000).toString();

    activeCaptcha.set(fromId, {
      captcha,
      toId: toUser.id,
      amount,
      guildId,
      tries: 0
    });

    const embed = new EmbedBuilder()
      .setTitle('🔐 Credit Transfer Verification')
      .setDescription(
        `You are about to transfer **${amount} credits** to **${toUser.username}**\n\n` +
        `Type this code to confirm:\n\n` +
        `**\`${captcha}\`**`
      )
      .setColor('#b7faff')
      .setFooter({ text: '3 attempts • 60 seconds' });

    await interaction.reply({ embeds: [embed], ephemeral: true });

    const filter = m => m.author.id === fromId;
    const collector = interaction.channel.createMessageCollector({
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

          await recordSuccess(fromId);

          await msg.reply(
            `✅ **Transfer Successful**\n` +
            `Tax: **${result.tax}**\n` +
            `Received: **${result.received}**`
          );

          await sendCreditLog(client, {
            guildId,
            from: fromId,
            to: data.toId,
            amount: data.amount,
            tax: result.tax,
            received: result.received
          });

        } catch (err) {
          console.error(err);
          await msg.reply('❌ Transfer failed.');
        }

        activeCaptcha.delete(fromId);
        collector.stop();
      } else {
        data.tries++;
        const fail = await recordFail(fromId, guildId);

        if (fail.blocked) {
          await sendSpamAlert(client, {
            guildId,
            userId: fromId,
            userTag: interaction.user.tag,
            reason: fail.reason
          });
        }

        if (data.tries >= 3) {
          await msg.reply('🚫 Too many wrong attempts. Transfer cancelled.');
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
  }
};