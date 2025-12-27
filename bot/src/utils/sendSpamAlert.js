const { EmbedBuilder } = require('discord.js');

async function sendSpamAlert(client, {
  guildId,
  userId,
  reason
}) {
  try {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) return;

    const member = await guild.members.fetch(userId);

    // هات كل الأونر + الأدمن
    const targets = guild.members.cache.filter(m =>
      m.permissions.has('Administrator') || m.id === guild.ownerId
    );

    const embed = new EmbedBuilder()
      .setTitle('🚨 Credit Spam Attempt')
      .setColor('#ff4d4d')
      .addFields(
        { name: 'User', value: `${member.user.tag} (${member.id})` },
        { name: 'Server', value: guild.name },
        { name: 'Reason', value: reason },
        { name: 'Time', value: new Date().toLocaleString() }
      )
      .setTimestamp();

    for (const admin of targets.values()) {
      try {
        await admin.send({ embeds: [embed] });
      } catch {
        // لو الـ DM مقفول
      }
    }
  } catch (err) {
    console.error('Spam Alert Error:', err);
  }
}

module.exports = sendSpamAlert;