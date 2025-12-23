const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  guildId: String,
  from: String,
  to: String,
  amount: Number,
  tax: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CreditLog', logSchema);