require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');
const connectMongo = require('./config/mongo');
const registerCommands = require('./handlers/commands');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

client.once(Events.ClientReady, async () => {
  console.log(`🤖 AVON BOT logged in as ${client.user.tag}`);
  await registerCommands(client);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    interaction.reply({ content: '❌ Error executing command', ephemeral: true });
  }
});

connectMongo();
client.login(process.env.BOT_TOKEN);