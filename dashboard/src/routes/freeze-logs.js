const express = require('express');
const router = express.Router();
const CreditFreeze = require('../../bot/src/models/CreditFreeze');
const { isAdmin } = require('../services/permission.service');

router.get('/', async (req, res) => {
  if (!isAdmin(req.user)) return res.sendStatus(403);

  const { guildId } = req.query;
  const logs = await CreditFreeze.find({ guildId }).sort({ createdAt: -1 });
  res.json(logs);
});

module.exports = router;