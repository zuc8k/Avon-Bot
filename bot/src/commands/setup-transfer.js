const { SlashCommandBuilder } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-transfer')
    .setDescription('Set credits transfer channel')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Transfer channel')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.guild.ownerId !== interaction.user.id) {
      return interaction.reply({
        content: '❌ Owner only',
        ephemeral: true
      });
    }

    const channel = interaction.options.getChannel('channel');

    await GuildSettings.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { transferChannelId: channel.id },
      { upsert: true }
    );

    interaction.reply({
      content: `✅ Transfer channel set to ${channel}`,
      ephemeral: true
    });
  }
};