const express = require('express');
const router = express.Router();

const Premium = require('../../../bot/src/models/Premium');

/*
  GET /api/premium?guildId=XXXX
  - Member: يشوف حالته
  - Admin/Owner: يشوف حالة نفسه
*/
router.get('/', async (req, res) => {
  const { guildId } = req.query;

  const sub = await Premium.findOne({
    userId: req.user.id,
    guildId,
    active: true,
    expiresAt: { $gt: new Date() }
  });

  if (!sub) {
    return res.json({
      plan: 'free',
      active: false
    });
  }

  res.json({
    plan: sub.plan,
    active: true,
    expiresAt: sub.expiresAt
  });
});

/*
  POST /api/premium
  Owner / Admin فقط
  body:
  {
    userId,
    plan,
    days,
    guildId
  }
*/
router.post('/', async (req, res) => {
  if (!['owner', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { userId, plan, days, guildId } = req.body;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  const sub = await Premium.findOneAndUpdate(
    { userId, guildId },
    {
      plan,
      active: true,
      expiresAt
    },
    { upsert: true, new: true }
  );

  res.json({
    success: true,
    subscription: sub
  });
});

/*
  DELETE /api/premium
  Owner / Admin فقط
*/
router.delete('/', async (req, res) => {
  if (!['owner', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { userId, guildId } = req.body;

  await Premium.findOneAndUpdate(
    { userId, guildId },
    { active: false }
  );

  res.json({ success: true });
});

module.exports = router;