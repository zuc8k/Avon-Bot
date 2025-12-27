const express = require('express');
const router = express.Router();
const { isAdmin } = require('../services/permission.service');

const {
  freezeUser,
  unfreezeUser,
  getFrozenUsers,
  getFreezeLogs
} = require('../../bot/src/services/creditFreeze.service');

/* ================== CURRENT FREEZES ================== */
router.get('/', async (req, res) => {
  if (!isAdmin(req.user)) return res.sendStatus(403);

  const { guildId } = req.query;
  if (!guildId) {
    return res.status(400).json({ error: 'guildId is required' });
  }

  const list = await getFrozenUsers(guildId);
  res.json(list);
});

/* ================== FREEZE USER ================== */
router.post('/freeze', async (req, res) => {
  if (!isAdmin(req.user)) return res.sendStatus(403);

  const { guildId, userId, reason } = req.body;
  if (!guildId || !userId) {
    return res.status(400).json({ error: 'guildId and userId are required' });
  }

  await freezeUser({
    userId,
    guildId,
    reason: reason || 'No reason provided',
    frozenBy: req.user.id
  });

  res.json({ success: true });
});

/* ================== UNFREEZE USER ================== */
router.post('/unfreeze', async (req, res) => {
  if (!isAdmin(req.user)) return res.sendStatus(403);

  const { guildId, userId } = req.body;
  if (!guildId || !userId) {
    return res.status(400).json({ error: 'guildId and userId are required' });
  }

  await unfreezeUser(userId, guildId);
  res.json({ success: true });
});

/* ================== FREEZE LOGS ================== */
router.get('/logs', async (req, res) => {
  if (!isAdmin(req.user)) return res.sendStatus(403);

  const { guildId } = req.query;
  if (!guildId) {
    return res.status(400).json({ error: 'guildId is required' });
  }

  const logs = await getFreezeLogs(guildId);
  res.json(logs);
});

module.exports = router;