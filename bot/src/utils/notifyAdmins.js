const { EmbedBuilder } = require('discord.js');

module.exports = async function notifyAdmins(client, guildId, data) {
  try {
    const guild = await client.guilds.fetch(guildId);
    const members = await guild.members.fetch();

    const admins = members.filter(m =>
      m.permissions.has('Administrator') || m.id === guild.ownerId
    );

    const embed = new EmbedBuilder()
      .setTitle('🚨 Credit Spam Alert')
      .setColor('#ff3b3b')
      .addFields(
        { name: 'User', value: `${data.userTag}`, inline: false },
        { name: 'User ID', value: data.userId, inline: false },
        { name: 'Server', value: guild.name, inline: false },
        { name: 'Reason', value: data.reason, inline: false },
        { name: 'Time', value: new Date().toLocaleString(), inline: false }
      )
      .setFooter({ text: 'AVON Anti-Spam System' });

    for (const [, member] of admins) {
      try {
        await member.send({ embeds: [embed] });
      } catch (e) {
        // لو الـ DM مقفول
      }
    }
  } catch (err) {
    console.error('❌ Failed to notify admins:', err);
  }
};