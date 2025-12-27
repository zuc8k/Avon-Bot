const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const {
  freezeUser,
  unfreezeUser
} = require('../services/creditFreeze.service');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('freeze')
    .setDescription('Freeze or unfreeze user credits')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(sc =>
      sc.setName('add')
        .setDescription('Freeze user credits')
        .addUserOption(o =>
          o.setName('user').setDescription('Target user').setRequired(true)
        )
        .addIntegerOption(o =>
          o.setName('minutes').setDescription('مدة التجميد بالدقائق (اختياري)')
        )
        .addStringOption(o =>
          o.setName('reason').setDescription('سبب التجميد')
        )
    )

    .addSubcommand(sc =>
      sc.setName('remove')
        .setDescription('Unfreeze user credits')
        .addUserOption(o =>
          o.setName('user').setDescription('Target user').setRequired(true)
        )
    ),

  async execute(interaction) {
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

      return interaction.reply({
        content: `🧊 تم تجميد حساب **${user.username}**${minutes ? ` لمدة ${minutes} دقيقة` : ' (تجميد دائم)'}`,
        ephemeral: true
      });
    }

    if (interaction.options.getSubcommand() === 'remove') {
      const user = interaction.options.getUser('user');
      await unfreezeUser(user.id, guildId);

      return interaction.reply({
        content: `✅ تم فك التجميد عن **${user.username}**`,
        ephemeral: true
      });
    }
  }
};