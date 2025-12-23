const { SlashCommandBuilder } = require('discord.js');
const { transferCredits } = require('../services/credits.service');
const GuildSettings = require('../models/GuildSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('credits')
    .setDescription('Transfer credits with captcha confirmation')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to send credits to')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Amount of credits to transfer')
        .setRequired(true)
    ),

  async execute(interaction) {
    const { guild, channel, user } = interaction;

    /* ================== CHECK TRANSFER CHANNEL ================== */
    const settings = await GuildSettings.findOne({ guildId: guild.id });

    if (!settings || settings.transferChannelId !== channel.id) {
      return interaction.reply({
        content: '❌ This command can only be used in the transfer channel',
        ephemeral: true
      });
    }

    /* ================== GET INPUT ================== */
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (target.bot || target.id === user.id) {
      return interaction.reply({
        content: '❌ You cannot transfer credits to this user',
        ephemeral: true
      });
    }

    if (amount <= 0) {
      return interaction.reply({
        content: '❌ Amount must be greater than 0',
        ephemeral: true
      });
    }

    /* ================== CAPTCHA ================== */
    const captcha = Math.floor(1000 + Math.random() * 9000);

    await interaction.reply(
      `🔐 **Captcha Required**
Please type the following code to confirm the transfer:

**${captcha}**`
    );

    const filter = message =>
      message.author.id === user.id &&
      message.content === captcha.toString();

    try {
      await channel.awaitMessages({
        filter,
        max: 1,
        time: 15000,
        errors: ['time']
      });

      /* ================== TRANSFER ================== */
      const { tax, received, plan } = await transferCredits(
        guild.id,
        user.id,
        target.id,
        amount
      );

      await interaction.followUp(
        `✅ **Transfer Successful**
👤 Plan: **${plan.toUpperCase()}**
💸 Sent: ${amount}
🧾 Tax: ${tax}
📥 ${target} received: ${received}`
      );
    } catch (error) {
      await interaction.followUp(
        '❌ Transfer cancelled or captcha was incorrect / timed out'
      );
    }
  }
};