const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Test AVON BOT response'),

  async execute(interaction) {
    await interaction.reply('🏓 Pong from AVON BOT');
  }
};