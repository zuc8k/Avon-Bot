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
  res.json(await getFrozenUsers(guildId));
});

/* ================== FREEZE ================== */
router.post('/freeze', async (req, res) => {
  if (!isAdmin(req.user)) return res.sendStatus(403);

  const { guildId, userId, reason } = req.body;

  await freezeUser({
    userId,
    guildId,
    reason,
    frozenBy