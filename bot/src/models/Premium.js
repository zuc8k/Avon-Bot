const mongoose = require('mongoose');

const premiumSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  plan: {
    type: String,
    enum: ['free', 'plus', 'premium', 'max'],
    default: 'free'
  },
  active: { type: Boolean, default: true },
  expiresAt: Date
});

premiumSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model('Premium', premiumSchema);