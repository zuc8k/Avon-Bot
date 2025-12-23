const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  balance: { type: Number, default: 0 }
});

walletSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model('Wallet', walletSchema);