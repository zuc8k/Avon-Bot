const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  guildId: String,
  command: String,
  enabled: { type: Boolean, default: true }
});

schema.index({ guildId: 1, command: 1 }, { unique: true });

module.exports = mongoose.model('CommandToggle', schema);