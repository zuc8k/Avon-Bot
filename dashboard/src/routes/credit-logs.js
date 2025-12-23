const express = require('express');
const router = express.Router();
const CreditLog = require('../../bot/src/models/CreditLog');
const { isAdmin } = require('../services/permission.service');

router.get('/', async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { guildId } = req.query;

  const logs = await CreditLog
    .find({ guildId })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(logs);
});

module.exports = router;