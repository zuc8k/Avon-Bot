const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require('discord.js');

const CreditSettings = require('../models/CreditSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-credits')
    .setDescription('Set credits transfer channel')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Channel for credits transfer')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guildId;
    const channel = interaction.options.getChannel('channel');

    await CreditSettings.findOneAndUpdate(
      { guildId },
      { transferChannelId: channel.id },
      { upsert: true }
    );

    await interaction.reply({
      content: `✅ Credits transfer channel set to ${channel}`,
      ephemeral: true
    });
  }
};