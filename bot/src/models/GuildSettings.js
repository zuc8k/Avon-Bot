const mongoose = require('mongoose');

const guildSettingsSchema = new mongoose.Schema({
  guildId: { type: String, unique: true },
  transferChannelId: String
});

module.exports = mongoose.model('GuildSettings', guildSettingsSchema);