const { SlashCommandBuilder } = require('discord.js');
const { transferCredits } = require('../services/credits.service');
const GuildSettings = require('../models/GuildSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('credits')
    .setDescription('Transfer credits')
    .addUserOption(o =>
      o.setName('user').setDescription('Target user').setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName('amount').setDescription('Amount').setRequired(true)
    ),

  async execute(interaction) {
    const { guild, channel, user } = interaction;

    const settings = await GuildSettings.findOne({ guildId: guild.id });
    if (!settings || settings.transferChannelId !== channel.id) {
      return interaction.reply({
        content: '❌ Use this command in the transfer channel only',
        ephemeral: true
      });
    }

    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (target.bot || target.id === user.id) {
      return interaction.reply({
        content: '❌ Invalid target user',
        ephemeral: true
      });
    }

    const captcha = Math.floor(1000 + Math.random() * 9000);

    await interaction.reply(
      `🔐 **Captcha Required**\nType this code to confirm transfer:\n**${captcha}**`
    );

    const filter = m =>
      m.author.id === user.id &&
      m.content === captcha.toString();

    try {
      const collected = await channel.awaitMessages({
        filter,
        max: 1,
        time: 15000,
        errors: ['time']
      });

    
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