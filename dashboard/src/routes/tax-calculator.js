const express = require('express');
const router = express.Router();

// نفس نسب الضريبة في البوت
const TAX_BY_PLAN = {
  free: 0.05,
  plus: 0.03,
  premium: 0,
  max: 0
};

router.post('/', async (req, res) => {
  try {
    const { amount, plan } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const rate = TAX_BY_PLAN[plan] ?? TAX_BY_PLAN.free;
    const tax = Math.floor(amount * rate);
    const received = amount - tax;

    // المبلغ اللي لازم يتحول عشان المستلم ياخد الرقم كامل
    const requiredAmount = Math.ceil(amount / (1 - rate));

    res.json({
      amount,
      plan,
      tax,
      received,
      requiredAmount,
      rate: rate * 100
    });
  } catch (err) {
    console.error('Tax Calculator Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;