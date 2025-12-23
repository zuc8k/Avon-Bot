const { EmbedBuilder } = require('discord.js');
const LogSettings = require('../models/LogSettings');

module.exports = async function sendCreditLog(client, log) {
  const settings = await LogSettings.findOne({ guildId: log.guildId });
  if (!settings) return;

  const channel = await client.channels.fetch(settings.creditLogChannelId).catch(() => null);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle('💸 Credit Transfer')
    .addFields(
      { name: 'From', value: `<@${log.from}>`, inline: true },
      { name: 'To', value: `<@${log.to}>`, inline: true },
      { name: 'Amount', value: `${log.amount}`, inline: true },
      { name: 'Tax', value: `${log.tax}`, inline: true },
      { name: 'Received', value: `${log.received}`, inline: true }
    )
    .setTimestamp()
    .setColor('#b7faff');

  channel.send({ embeds: [embed] });
};