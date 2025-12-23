const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const { transferCredits } = require('../services/credits.service');
const CreditSettings = require('../models/CreditSettings');
const sendCreditLog = require('../utils/sendCreditLog');
const client = require('../index');

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

    /* ================== CHANNEL CHECK ================== */
    const settings = await CreditSettings.findOne({ guildId });

    if (!settings || settings.transferChannelId !== channelId) {
      return interaction.reply({
        content: '❌ Credit transfers are only allowed in the configured transfer channel.',
        ephemeral: true
      });
    }

    /* ================== VALIDATION ================== */
    if (toUser.bot) {
      return interaction.reply({
        content: '❌ You cannot transfer credits to bots.',
        ephemeral: true
      });
    }

    if (toUser.id === fromId) {
      return interaction.reply({
        content: '❌ You cannot transfer credits to yourself.',
        ephemeral: true
      });
    }

    if (amount <= 0) {
      return interaction.reply({
        content: '❌ Invalid amount.',
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
        `Please type the following code to confirm:\n\n` +
        `**\`${captcha}\`**`
      )
      .setColor('#b7faff')
      .setFooter({ text: 'You have 3 attempts • 60 seconds' });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

    /* ================== COLLECTOR ================== */
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

          await msg.reply(
            `✅ **Transfer Successful**\n` +
            `Tax: **${result.tax}**\n` +
            `Received: **${result.received}**`
          );

          /* ================== SEND LOG ================== */
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
          await msg.reply('❌ Transfer failed. Please try again later.');
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
  }
};