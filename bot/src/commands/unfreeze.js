const { SlashCommandBuilder } = require('discord.js');
const { unfreezeUser } = require('../services/creditFreeze.service');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unfreeze')
    .setDescription('Unfreeze user credits')
    .addUserOption(o =>
      o.setName('user').setDescription('Target user').setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ No permission', ephemeral: true });
    }

    const user = interaction.options.getUser('user');

    await unfreezeUser(user.id, interaction.guildId, interaction.user.id);

    await interaction.reply(`✅ **${user.username}** has been unfrozen`);
  }
};