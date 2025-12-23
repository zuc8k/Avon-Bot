const GPTUsage = require('../../models/GPTUsage');
const { getUserPlan } = require('../../services/premium.service');
const plans = require('../../config/gptPlans');

module.exports = {
  name: 'gptstats',
  async execute(interaction) {
    const usage = await GPTUsage.findOne({
      userId: interaction.user.id,
      guildId: interaction.guild.id
    });

    const plan = await getUserPlan(
      interaction.user.id,
      interaction.guild.id
    );

    const used = usage?.usedWords || 0;
    const limit = plans[plan];

    interaction.reply({
      content:
`🧠 AVON GPT
Plan: ${plan}
Words Used: ${used} / ${limit}
Remaining: ${limit - used}`,
      ephemeral: true
    });
  }
};