const { getUserPlan } = require('../services/premium.service');

module.exports = async (interaction, requiredPlan) => {
  const plan = await getUserPlan(
    interaction.user.id,
    interaction.guild.id
  );

  const levels = ['free', 'plus', 'premium', 'max'];

  return levels.indexOf(plan) >= levels.indexOf(requiredPlan);
};