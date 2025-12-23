const checkPermission = require('../../permissions/checkPermission');

async execute(interaction) {
  const allowed = await checkPermission(interaction, 'owner');
  if (!allowed) {
    return interaction.reply({
      content: '❌ الأمر ده متاح للـ Owner فقط',
      ephemeral: true
    });
  }

  // كمل تنفيذ الأمر
}