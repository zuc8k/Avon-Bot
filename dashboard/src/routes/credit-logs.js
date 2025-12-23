const express = require('express');
const router = express.Router();

const CreditLog = require('../../bot/src/models/CreditLog');
const { isAdmin, isOwner } = require('../services/permission.service');

router.get('/', async (req, res) => {
  try {
    // صلاحيات: Owner أو Admin فقط
    if (!isOwner(req.user) && !isAdmin(req.user)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { guildId } = req.query;
    if (!guildId) {
      return res.status(400).json({ error: 'guildId is required' });
    }

    const logs = await CreditLog
      .find({ guildId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(logs);
  } catch (err) {
    console.error('Credit Logs Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;