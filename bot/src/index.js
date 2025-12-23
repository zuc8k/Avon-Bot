require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  Events
} = require('discord.js');

const connectMongo = require('./config/mongo');
const registerCommands = require('./handlers/commands');
const handlePrefix = require('./handlers/prefix');

/* ================== CLIENT ================== */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.Channel,
    Partials.Message
  ]
});

/* ================== READY ================== */
client.once(Events.ClientReady, async () => {
  console.log(`🤖 AVON BOT logged in as ${client.user.tag}`);
  await registerCommands(client);
});

/* ================== SLASH COMMANDS ================== */
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      interaction.reply({ content: '❌ Error', ephemeral: true });
    }
  }
});

/* ================== PREFIX COMMAND ================== */
client.on(Events.MessageCreate, async message => {
  handlePrefix(message);
});

/* ================== START ================== */
(async () => {
  try {
    await connectMongo();
    await client.login(process.env.BOT_TOKEN);
  } catch (err) {
    console.error('Startup Error:', err);
    process.exit(1);
  }
})();

module.exports = client;