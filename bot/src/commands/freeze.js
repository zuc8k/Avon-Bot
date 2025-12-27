const { SlashCommandBuilder } = require('discord.js');
const { freezeUser, unfreezeUser } = require('../services/creditFreeze.service');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('freeze')
    .setDescription('Freeze or unfreeze credits')
    .addSubcommand(sc =>
      sc.setName('add')
        .setDescription('Freeze user')
        .addUserOption(o => o.setName('user').setRequired(true))
        .addIntegerOption(o => o.setName('minutes').setDescription('Duration in minutes'))
        .addStringOption(o => o.setName('reason').setDescription('Reason'))
    )
    .addSubcommand(sc =>
      sc.setName('remove')
        .setDescription('Unfreeze user')
        .addUserOption(o => o.setName('user').setRequired(true))
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ No permission', ephemeral: true });
    }

    const guildId = interaction.guildId;

    if (interaction.options.getSubcommand() === 'add') {
      const user = interaction.options.getUser('user');
      const minutes = interaction.options.getInteger('minutes');
      const reason = interaction.options.getString('reason') || 'No reason';

      await freezeUser({
        userId: user.id,
        guildId,
        reason,
        frozenBy: interaction.user.id,
        durationMinutes: minutes
      });

      return interaction.reply(`🧊 ${user.username} credits frozen`);
    }

    if (interaction.options.getSubcommand() === 'remove') {
      const user = interaction.options.getUser('user');
      await unfreezeUser(user.id, guildId);
      return interaction.reply(`✅ ${user.username} unfrozen`);
    }
  }
};