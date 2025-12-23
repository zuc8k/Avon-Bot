const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  guildId: String,
  from: String,
  to: String,
  amount: Number,
  tax: Number,
  received: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CreditLog', schema);