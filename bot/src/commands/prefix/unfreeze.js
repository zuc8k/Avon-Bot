const { unfreezeUser } = require('../../services/creditFreeze.service');

module.exports = async (message, args) => {
  if (!message.member.permissions.has('Administrator')) return;

  const user = message.mentions.users.first();

  await unfreezeUser(user.id, message.guild.id, message.author.id);
  message.reply(`✅ ${user.username} unfrozen`);
};