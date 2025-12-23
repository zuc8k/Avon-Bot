const mongoose = require('mongoose');

const premiumSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },

  guildId: {
    type: String,
    required: true
  },

  plan: {
    type: String,
    enum: ['free', 'plus', 'premium', 'max'],
    default: 'free'
  },

  active: {
    type: Boolean,
    default: true
  },

  expiresAt: {
    type: Date,
    required: true
  }
});

/*
  يمنع تكرار اشتراك لنفس الشخص
  في نفس السيرفر
*/
premiumSchema.index(
  { userId: 1, guildId: 1 },
  { unique: true }
);

module.exports = mongoose.model('Premium', premiumSchema);