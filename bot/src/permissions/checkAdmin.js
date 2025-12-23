const GuildSettings = require('../models/GuildSettings');

module.exports = async (interaction) => {
  const settings = await GuildSettings.findOne({ guildId: interaction.guild.id });
  if (!settings || !settings.adminRoleId) return false;

  return interaction.member.roles.cache.has(settings.adminRoleId);
};