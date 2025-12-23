const mongoose = require('mongoose');

module.exports = mongoose.model(
  'GPTUsage',
  new mongoose.Schema({
    userId: String,
    guildId: String,
    usedWords: { type: Number, default: 0 },
    resetAt: Date
  })
);