const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const {
  freezeUser,
  unfreezeUser
} = require('../services/creditFreeze.service');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('freeze')
    .setDescription('Freeze or unfreeze user credits')
    .addSubcommand(sc =>
      sc
        .setName('add')
        .setDescription('Freeze user credits')
        .addUserOption(o =>
          o
            .setName('user')
            .setDescription('Target user')
            .setRequired(true)
        )
        .addIntegerOption(o =>
          o
            .setName('minutes')
            .setDescription('Freeze duration in minutes (leave empty = permanent)')
        )
        .addStringOption(o =>
          o
            .setName('reason')
            .setDescription('Reason for freezing')
        )
    )
    .addSubcommand(sc =>
      sc
        .setName('remove')
        .setDescription('Unfreeze user credits')
        .addUserOption(o =>
          o
            .setName('user')
            .setDescription('Target user')
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guildId;

    /* ================== PERMISSION CHECK ================== */
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true
      });
    }

    const sub = interaction.options.getSubcommand();

    /* ================== FREEZE ================== */
    if (sub === 'add') {
      const user = interaction.options.getUser('user');
      const minutes = interaction.options.getInteger('minutes');
      const reason =
        interaction.options.getString('reason') || 'No reason provided';

      // ⏱️ تحويل الدقائق إلى milliseconds
      const durationMs = minutes ? minutes * 60 * 1000 : null;

      await freezeUser({
        userId: user.id,
        guildId,
        reason,
        frozenBy: interaction.user.id,
        durationMs
      });

      return interaction.reply(
        `🧊 **${user.username}** credits have been frozen ` +
        (minutes ? `for **${minutes} minutes**.` : '**permanently**.')
      );
    }

    /* ================== UNFREEZE ================== */
    if (sub === 'remove') {
      const user = interaction.options.getUser('user');

      await unfreezeUser(
        user.id,
        guildId,
        interaction.user.id
      );

      return interaction.reply(
        `✅ **${user.username}** credits have been unfrozen.`
      );
    }
  }
};