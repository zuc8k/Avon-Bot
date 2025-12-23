const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  guildId: { type: String, unique: true },
  transferChannelId: String
});

module.exports = mongoose.model('CreditSettings', schema);