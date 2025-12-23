const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setPremium } = require('../services/premium.service');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('premium-add')
    .setDescription('Add premium subscription to a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o =>
      o.setName('user')
        .setDescription('Target user')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('plan')
        .setDescription('Premium plan')
        .setRequired(true)
        .addChoices(
          { name: 'Plus', value: 'plus' },
          { name: 'Premium', value: 'premium' },
          { name: 'Max', value: 'max' }
        )
    )
    .addIntegerOption(o =>
      o.setName('days')
        .setDescription('Duration in days')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ Admin only',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('user');
    const plan = interaction.options.getString('plan');
    const days = interaction.options.getInteger('days');

    await setPremium(user.id, interaction.guild.id, plan, days);

    interaction.reply(
      `✅ Premium **${plan.toUpperCase()}** activated for ${user} for **${days} days**`
    );
  }
};