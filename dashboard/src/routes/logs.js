const express = require('express');
const router = express.Router();
const Transaction = require('../../bot/src/models/Transaction');

router.get('/', async (req, res) => {
  if (!['owner', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const logs = await Transaction.find({}).sort({ createdAt: -1 }).limit(50);
  res.json(logs);
});

module.exports = router;