const { SlashCommandBuilder } = require('discord.js');
let transferChannel = {}; // مؤقت – بعدين نخزنه في DB

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
    transferChannel[interaction.guild.id] =
      interaction.options.getChannel('channel').id;

    interaction.reply({
      content: '✅ Transfer channel set successfully',
      ephemeral: true
    });
  },

  getChannel(guildId) {
    return transferChannel[guildId];
  }
};