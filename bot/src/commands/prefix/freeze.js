const parseDuration = require('../../utils/parseDuration');
const { freezeUser } = require('../../services/creditFreeze.service');

module.exports = async (message, args) => {
  if (!message.member.permissions.has('Administrator')) return;

  const user = message.mentions.users.first();
  const time = args[1];
  const reason = args.slice(2).join(' ') || 'No reason';

  const durationMs = parseDuration(time);

  await freezeUser({
    userId: user.id,
    guildId: message.guild.id,
    reason,
    frozenBy: message.author.id,
    durationMs
  });

  message.reply(`❄️ ${user.username} frozen ${time || 'permanently'}`);
};