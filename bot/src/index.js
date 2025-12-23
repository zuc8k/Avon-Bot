require('dotenv').config();

const { 
  Client, 
  GatewayIntentBits, 
  Partials,
  Events 
} = require('discord.js');

const connectMongo = require('./config/mongo');
const registerCommands = require('./handlers/commands');

/* ================== CLIENT ================== */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,            // Slash Commands
    GatewayIntentBits.GuildMessages,     // Messages (Credits, Captcha, GPT)
    GatewayIntentBits.MessageContent     // Read message content
  ],
  partials: [
    Partials.Channel,
    Partials.Message
  ]
});

/* ================== READY ================== */
client.once(Events.ClientReady, async () => {
  console.log(`🤖 AVON BOT logged in as ${client.user.tag}`);

  // Register slash commands
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
    console.error('❌ Command Error:', err);

    if (interaction.replied || interaction.deferred) {
      interaction.followUp({
        content: '❌ حصل خطأ أثناء تنفيذ الأمر',
        ephemeral: true
      });
    } else {
      interaction.reply({
        content: '❌ حصل خطأ أثناء تنفيذ الأمر',
        ephemeral: true
      });
    }
  }
});

/* ================== START ================== */
(async () => {
  try {
    await connectMongo();
    await client.login(process.env.BOT_TOKEN);
  } catch (err) {
    console.error('❌ Startup Error:', err);
    process.exit(1);
  }
})();

module.exports = client;