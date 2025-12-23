const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const { transferCredits } = require('../services/credits.service');

const activeCaptcha = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('c')
    .setDescription('Transfer credits to another user')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('Target user')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('amount')
        .setDescription('Amount to transfer')
        .setRequired(true)
    ),

  async execute(interaction) {
    const fromId = interaction.user.id;
    const toUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const guildId = interaction.guildId;

    if (toUser.bot) {
      return interaction.reply({ content: '❌ You cannot transfer to bots.', ephemeral: true });
    }

    if (amount <= 0) {
      return interaction.reply({ content: '❌ Invalid amount.', ephemeral: true });
    }

    // توليد كابتشا
    const captcha = Math.floor(1000 + Math.random() * 9000).toString();

    activeCaptcha.set(fromId, {
      captcha,
      toId: toUser.id,
      amount,
      guildId,
      tries: 0
    });

    const embed = new EmbedBuilder()
      .setTitle('🔐 Credit Transfer Verification')
      .setDescription(
        `To transfer **${amount} credits** to **${toUser.username}**\n\n` +
        `Please type the following code:\n\n` +
        `**\`${captcha}\`**`
      )
      .setColor('#b7faff')
      .setFooter({ text: 'You have 3 attempts' });

    await interaction.reply({ embeds: [embed], ephemeral: true });

    const filter = m => m.author.id === fromId;
    const collector = interaction.channel.createMessageCollector({
      filter,
      time: 60000
    });

    collector.on('collect', async msg => {
      const data = activeCaptcha.get(fromId);
      if (!data) return collector.stop();

      if (msg.content === data.captcha) {
        try {
          const result = await transferCredits(
            guildId,
            fromId,
            data.toId,
            data.amount
          );

          await msg.reply(
            `✅ Transfer successful!\n` +
            `Tax: **${result.tax}**\n` +
            `Received: **${result.received}**`
          );
        } catch (err) {
          await msg.reply('❌ Transfer failed.');
        }

        activeCaptcha.delete(fromId);
        collector.stop();
      } else {
        data.tries++;
        if (data.tries >= 3) {
          await msg.reply('❌ Too many attempts. Transfer cancelled.');
          activeCaptcha.delete(fromId);
          collector.stop();
        } else {
          await msg.reply('❌ Wrong code. Try again.');
        }
      }
    });

    collector.on('end', () => {
      activeCaptcha.delete(fromId);
    });
  }
};