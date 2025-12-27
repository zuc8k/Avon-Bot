const mongoose = require('mongoose');

const creditFreezeSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  reason: String,
  frozenBy: String
}, { timestamps: true });

creditFreezeSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model('CreditFreeze', creditFreezeSchema);