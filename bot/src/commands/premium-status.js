const { SlashCommandBuilder } = require('discord.js');
const { getPremiumStatus } = require('../services/premium.service');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('premium-status')
    .setDescription('Check premium status of a user')
    .addUserOption(o =>
      o.setName('user')
        .setDescription('User to check')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user =
      interaction.options.getUser('user') || interaction.user;

    const sub = await getPremiumStatus(user.id, interaction.guild.id);

    if (!sub || !sub.active) {
      return interaction.reply(
        `❌ ${user} has no active premium`
      );
    }

    interaction.reply(
      `👑 **Premium Status**
User: ${user}
Plan: **${sub.plan.toUpperCase()}**
Expires: <t:${Math.floor(sub.expiresAt.getTime() / 1000)}:R>`
    );
  }
};