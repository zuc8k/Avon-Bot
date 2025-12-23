const mongoose = require('mongoose');

module.exports = mongoose.model(
  'Premium',
  new mongoose.Schema({
    userId: String,
    guildId: String,
    plan: {
      type: String,
      enum: ['free', 'plus', 'premium', 'max'],
      default: 'free'
    },
    startAt: Date,
    endAt: Date,
    active: Boolean
  })
);