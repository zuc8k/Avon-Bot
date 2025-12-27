const mongoose = require('mongoose');

const creditFreezeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  guildId: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    default: 'No reason provided'
  },
  frozenBy: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    default: null // لو null يبقى فريز دائم
  }
}, { timestamps: true });

creditFreezeSchema.index(
  { userId: 1, guildId: 1 },
  { unique: true }
);

module.exports = mongoose.model('CreditFreeze', creditFreezeSchema);