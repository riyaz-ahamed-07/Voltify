const pool = require('../config/db');
const coinService = require('../services/coinService');
const challengeService = require('../services/challengeService');
const { coinShopItems } = require('../utils/mockData');
const notificationService = require('../services/notificationService');

/**
 * GET /api/gamification/stats
 */
const getStats = async (req, res) => {
  const userId = req.user.id;
  const coinStats = await coinService.getCoinStats(userId);

  const userResult = await pool.query(
    'SELECT household_type FROM users WHERE id = $1',
    [userId]
  );
  const householdType = userResult.rows[0]?.household_type || 'family';

  const multipliers = [];
  if (coinStats.streak_days >= 7) {
    let multiplierVal = 1.0;
    if (coinStats.streak_days >= 90) multiplierVal = 1.6;
    else if (coinStats.streak_days >= 30) multiplierVal = 1.35;
    else multiplierVal = 1.15;
    multipliers.push({
      type: 'streak',
      label: `🔥 ${coinStats.streak_days}-day streak`,
      value: multiplierVal,
    });
  }

  const nextMilestone =
    coinStats.streak_days < 7  ? { days: 7,  bonus_coins: 50,  multiplier: 1.15 } :
    coinStats.streak_days < 30 ? { days: 30, bonus_coins: 150, multiplier: 1.35 } :
    coinStats.streak_days < 90 ? { days: 90, bonus_coins: 500, multiplier: 1.60 } :
    null;

  return res.status(200).json({
    ...coinStats,
    household_type: householdType,
    active_multipliers: multipliers,
    next_milestone: nextMilestone,
  });
};

/**
 * GET /api/gamification/challenge
 */
const getChallenge = async (req, res) => {
  const userId = req.user.id;
  const challenge = await challengeService.getActiveChallenge(userId);
  const history = await challengeService.getChallengeHistory(userId);

  return res.status(200).json({ challenge, history });
};

/**
 * POST /api/gamification/check-challenge
 */
const checkChallenge = async (req, res) => {
  const userId = req.user.id;
  const result = await challengeService.checkAndResolveChallenge(userId);
  return res.status(200).json(result);
};

/**
 * GET /api/gamification/shop
 */
const getShop = async (req, res) => {
  const userId = req.user.id;
  const userResult = await pool.query('SELECT coins FROM users WHERE id = $1', [userId]);
  const userCoins = userResult.rows[0]?.coins || 0;

  const itemsWithAffordability = coinShopItems.map(item => ({
    ...item,
    can_afford: userCoins >= item.coins_required,
    coins_needed: Math.max(0, item.coins_required - userCoins),
  }));

  return res.status(200).json({ items: itemsWithAffordability, user_coins: userCoins });
};

/**
 * POST /api/gamification/redeem
 */
const redeemItem = async (req, res) => {
  const { item_id } = req.body;
  const userId = req.user.id;

  if (!item_id) {
    return res.status(400).json({ error: 'item_id is required' });
  }

  const item = coinShopItems.find(i => i.id === item_id);
  if (!item) {
    return res.status(404).json({ error: 'Shop item not found' });
  }

  const userResult = await pool.query('SELECT coins FROM users WHERE id = $1', [userId]);
  const userCoins = userResult.rows[0]?.coins || 0;

  if (userCoins < item.coins_required) {
    return res.status(400).json({
      error: `Insufficient coins. You have ${userCoins} coins, need ${item.coins_required}`,
      coins_needed: item.coins_required - userCoins,
    });
  }

  await pool.query(
    `UPDATE users SET coins = coins - $1 WHERE id = $2`,
    [item.coins_required, userId]
  );

  await pool.query(
    `INSERT INTO coin_transactions (user_id, coins, type, reason, multiplier)
     VALUES ($1, $2, 'redeemed', $3, 1.0)`,
    [userId, -item.coins_required, `Redeemed: ${item.reward}`]
  );

  await notificationService.create(userId, {
    type: 'redemption',
    title: '🎉 Redemption Submitted!',
    message: `Your request for "${item.reward}" has been submitted. We'll contact you within 24 hours.`,
    action_url: '/leaderboard',
  });

  const newBalance = userCoins - item.coins_required;
  return res.status(200).json({
    success: true,
    message: "Redemption request submitted! We'll contact you within 24 hours.",
    redeemed_item: item.reward,
    coins_spent: item.coins_required,
    new_balance: newBalance,
  });
};

module.exports = { getStats, getChallenge, checkChallenge, getShop, redeemItem };
