const mongoose = require('mongoose');

const antiSpamSchema = new mongoose.Schema({
  guildId: {
    type: String,
    unique: true
  },
  cooldownSeconds: {
    type: Number,
    default: 60
  },
  maxFails: {
    type: Number,
    default: 3
  },
  blockMinutes: {
    type: Number,
    default: 5
  }
});

module.exports = mongoose.model('AntiSpamSettings', antiSpamSchema);