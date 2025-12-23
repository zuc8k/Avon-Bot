const express = require('express');
const router = express.Router();
const Wallet = require('../../bot/src/models/Wallet');

router.get('/', async (req, res) => {
  const wallet = await Wallet.findOne({ userId: req.user.id });
  res.json({ balance: wallet?.balance || 0 });
});

module.exports = router;