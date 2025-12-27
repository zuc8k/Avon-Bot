const mongoose = require('mongoose');

const freezeLogSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  action: {
    type: String,
    enum: ['freeze', 'unfreeze']
  },
  reason: String,
  by: String
}, { timestamps: true });

module.exports = mongoose.model('FreezeLog', freezeLogSchema);