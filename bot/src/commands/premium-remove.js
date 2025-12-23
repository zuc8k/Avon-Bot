const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { removePremium } = require('../services/premium.service');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('premium-remove')
    .setDescription('Remove premium subscription from a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o =>
      o.setName('user')
        .setDescription('Target user')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user');

    await removePremium(user.id, interaction.guild.id);

    interaction.reply(
      `🗑️ Premium subscription removed from ${user}`
    );
  }
};