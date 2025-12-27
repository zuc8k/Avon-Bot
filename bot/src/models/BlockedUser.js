const mongoose = require('mongoose');

const blockedUserSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  blockedUntil: Date,
  reason: String
}, { timestamps: true });

blockedUserSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model('BlockedUser', blockedUserSchema);