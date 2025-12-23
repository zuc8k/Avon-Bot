const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  guildId: { type: String, unique: true },
  creditLogChannelId: String
});

module.exports = mongoose.model('LogSettings', schema);