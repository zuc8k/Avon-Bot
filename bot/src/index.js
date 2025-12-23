require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  Collection
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

/* ================== COMMANDS COLLECTION ================== */
client.commands = new Collection();

/* ================== READY ================== */
client.once(Events.ClientReady, async () => {
  console.log(`🤖 AVON BOT logged in as ${client.user.tag}`);

  // Register slash commands + load to collection
  await registerCommands(client);
});

/* ================== INTERACTIONS ================== */
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    return interaction.reply({
      content: '❌ Command not found',
      ephemeral: true
    });
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error('❌ Command Error:', err);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: '❌ حصل خطأ أثناء تنفيذ الأمر',
        ephemeral: true
      });
    } else {
      await interaction.reply({
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