require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const connectMongo = require('./config/mongo');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`🤖 AVON BOT logged in as ${client.user.tag}`);
});

client.login(process.env.BOT_TOKEN);
connectMongo();