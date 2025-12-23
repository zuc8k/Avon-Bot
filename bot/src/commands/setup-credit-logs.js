const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require('discord.js');

const LogSettings = require('../models/LogSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-credit-logs')
    .setDescription('Set credit logs channel')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Logs channel')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guildId;
    const channel = interaction.options.getChannel('channel');

    await LogSettings.findOneAndUpdate(
      { guildId },
      { creditLogChannelId: channel.id },
      { upsert: true }
    );

    await interaction.reply({
      content: `✅ Credit logs channel set to ${channel}`,
      ephemeral: true
    });
  }
};