const express = require('express');
const router = express.Router();
const { isAdmin } = require('../services/permission.service');
const {
  freezeUser,
  unfreezeUser,
  getFrozenUsers
} = require('../../bot/src/services/creditFreeze.service');

router.get('/', async (req, res) => {
  if (!isAdmin(req.user)) return res.sendStatus(403);
  const { guildId } = req.query;
  res.json(await getFrozenUsers(guildId));
});

router.post('/freeze', async (req, res) => {
  if (!isAdmin(req.user)) return res.sendStatus(403);

  const { guildId, userId, reason } = req.body;
  await freezeUser({
    userId,
    guildId,
    reason,
    frozenBy: req.user.id
  });

  res.json({ success: true });
});

router.post('/unfreeze', async (req, res) => {
  if (!isAdmin(req.user)) return res.sendStatus(403);

  const { guildId, userId } = req.body;
  await unfreezeUser(userId, guildId);
  res.json({ success: true });
});

module.exports = router;