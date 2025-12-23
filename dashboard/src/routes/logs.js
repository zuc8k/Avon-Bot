const express = require('express');
const router = express.Router();
const CreditLog = require('../../bot/src/models/CreditLog');

router.get('/', async (req, res) => {
  try {
    if (!['owner', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { guildId } = req.query;

    const logs = await CreditLog
      .find({ guildId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (err) {
    console.error('LOGS ERROR:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;