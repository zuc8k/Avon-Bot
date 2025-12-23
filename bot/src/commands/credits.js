const { SlashCommandBuilder } = require('discord.js');
const { transferCredits } = require('../services/credits.service');
const setup = require('./setup-transfer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('credits')
    .setDescription('Transfer credits')
    .addUserOption(o =>
      o.setName('user').setDescription('Target user').setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName('amount').setDescription('Amount').setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const channelId = setup.getChannel(guildId);

    if (!channelId || interaction.channel.id !== channelId) {
      return interaction.reply({
        content: '❌ This command can only be used in the transfer channel',
        ephemeral: true
      });
    }

    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    const captcha = Math.floor(1000 + Math.random() * 9000);

    await interaction.reply(
      `🔐 Confirm transfer by typing this code: **${captcha}**`
    );

    const filter = m =>
      m.author.id === interaction.user.id &&
      m.content === captcha.toString();

    try {
      const collected = await interaction.channel.awaitMessages({
        filter,
        max: 1,
        time: 15000,
        errors: ['time']
      });

      const result = await transferCredits(
        guildId,
        interaction.user.id,
        target.id,
        amount
      );

      interaction.followUp(
        `✅ Transfer complete\n💰 Sent: ${amount}\n🧾 Tax: ${result.tax}\n📥 Received: ${result.receive}`
      );
    } catch {
      interaction.followUp('❌ Transfer canceled or wrong code');
    }
  }
};