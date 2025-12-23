const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  balance: { type: Number, default: 0 }
});

module.exports = mongoose.model('Wallet', walletSchema);