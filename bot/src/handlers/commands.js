const { REST, Routes } = require('discord.js');
const loadCommands = require('../commands');

module.exports = async (client) => {
  const commands = loadCommands();
  client.commands = new Map();

  commands.forEach(cmd => {
    client.commands.set(cmd.data.name, cmd);
  });

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

  try {
    console.log('⏳ Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands.map(c => c.data.toJSON()) }
    );
    console.log('✅ Slash commands registered');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
};