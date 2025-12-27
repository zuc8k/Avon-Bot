const mongoose = require('mongoose');

const creditFreezeLogSchema = new mongoose.Schema({
  guildId: String,
  userId: String,
  action: {
    type: String,
    enum: ['freeze', 'unfreeze']
  },
  reason: String,
  by: String
}, { timestamps: true });

module.exports = mongoose.model('CreditFreezeLog', creditFreezeLogSchema);