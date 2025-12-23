const { canUseGPT, consumeGPT } = require('../services/gpt.service');
const { askGPT } = require('../services/openai.service');
const GuildSettings = require('../models/GuildSettings');

module.exports = (client) => {
  client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    const settings = await GuildSettings.findOne({
      guildId: message.guild.id
    });

    if (!settings || message.channel.id !== settings.gptChannelId) return;

    const check = await canUseGPT(
      message.author.id,
      message.guild.id,
      message.content
    );

    if (!check.allowed) {
      return message.reply(
        `🔒 AVON GPT Limit reached
Plan: ${check.plan}
Used: ${check.used}/${check.limit}`
      );
    }

    await message.channel.sendTyping();

    const reply = await askGPT(message.content);

    await consumeGPT(
      message.author.id,
      message.guild.id,
      check.words
    );

    message.reply(reply);
  });
};