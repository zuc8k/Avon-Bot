module.exports = (interaction) => {
  return interaction.guild.ownerId === interaction.user.id;
};