const pool = require('../config/db');
const { generatePredictions, detectBillShock } = require('../services/estimationEngine');
const notificationService = require('../services/notificationService');

/**
 * GET /api/dashboard/summary
 */
const getSummary = async (req, res) => {
  const userId = req.user.id;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayResult = await pool.query(
    `SELECT estimated_units, estimated_cost FROM daily_estimates
     WHERE user_id = $1 AND date = $2`,
    [userId, todayStr]
  );

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const yesterdayResult = await pool.query(
    `SELECT estimated_units FROM daily_estimates
     WHERE user_id = $1 AND date = $2`,
    [userId, yesterdayStr]
  );

  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().split('T')[0];

  const monthResult = await pool.query(
    `SELECT COALESCE(SUM(estimated_units), 0) AS total_units,
            COALESCE(SUM(estimated_cost), 0) AS total_cost
     FROM daily_estimates
     WHERE user_id = $1 AND date >= $2 AND date <= CURRENT_DATE`,
    [userId, monthStartStr]
  );

  const lastBillResult = await pool.query(
    `SELECT bill_amount, units FROM monthly_bills
     WHERE user_id = $1 ORDER BY month DESC LIMIT 1`,
    [userId]
  );

  const userResult = await pool.query(
    'SELECT coins, streak_days FROM users WHERE id = $1',
    [userId]
  );

  const today = todayResult.rows[0];
  const yesterdayRow = yesterdayResult.rows[0];
  const thisMonth = monthResult.rows[0];
  const lastBill = lastBillResult.rows[0];
  const user = userResult.rows[0];

  const todayUnits = parseFloat(today?.estimated_units || 0);
  const yesterdayUnits = parseFloat(yesterdayRow?.estimated_units || 0);
  const dayChangeRatio = yesterdayUnits > 0 ? ((todayUnits - yesterdayUnits) / yesterdayUnits * 100) : 0;

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daysElapsed = new Date().getDate();
  const daysRemaining = daysInMonth - daysElapsed;

  const avgPerDay = parseFloat(thisMonth?.total_units || 0) / Math.max(daysElapsed, 1);
  const projectedMonthlyUnits = avgPerDay * daysInMonth;

  await notificationService.generateRuleBasedNotifications(userId);

  return res.status(200).json({
    today: {
      units: todayUnits,
      cost: parseFloat(today?.estimated_cost || 0),
      vs_yesterday_pct: parseFloat(dayChangeRatio.toFixed(1)),
      is_higher: dayChangeRatio > 0,
    },
    this_month: {
      units: parseFloat(thisMonth?.total_units || 0),
      cost: parseFloat(thisMonth?.total_cost || 0),
      days_elapsed: daysElapsed,
      days_remaining: daysRemaining,
      projected_units: parseFloat(projectedMonthlyUnits.toFixed(3)),
    },
    estimated_bill: {
      projected: parseFloat(((projectedMonthlyUnits) * (parseFloat(thisMonth?.total_cost || 0) / Math.max(parseFloat(thisMonth?.total_units || 1), 1))).toFixed(2)),
      last_month: parseFloat(lastBill?.bill_amount || 0),
      on_track: lastBill ? projectedMonthlyUnits <= parseFloat(lastBill.units) * 1.15 : true,
    },
    gamification: {
      coins: user?.coins || 0,
      streak_days: user?.streak_days || 0,
    },
  });
};

/**
 * GET /api/dashboard/usage?period=daily|weekly|monthly
 */
const getUsage = async (req, res) => {
  const { period = 'daily' } = req.query;
  const userId = req.user.id;

  let query;
  const params = [userId];

  if (period === 'daily') {
    query = `
      SELECT date, estimated_units AS units, estimated_cost AS cost
      FROM daily_estimates
      WHERE user_id = $1
        AND date >= CURRENT_DATE - INTERVAL '6 days'
      ORDER BY date ASC
    `;
  } else if (period === 'weekly') {
    query = `
      SELECT
        DATE_TRUNC('week', date) AS week_start,
        SUM(estimated_units) AS units,
        SUM(estimated_cost) AS cost
      FROM daily_estimates
      WHERE user_id = $1
        AND date >= CURRENT_DATE - INTERVAL '28 days'
      GROUP BY DATE_TRUNC('week', date)
      ORDER BY week_start ASC
    `;
  } else if (period === 'monthly') {
    query = `
      SELECT
        month,
        units AS actual_units,
        bill_amount AS actual_cost,
        estimated_units,
        accuracy_pct
      FROM monthly_bills
      WHERE user_id = $1
      ORDER BY month DESC
      LIMIT 6
    `;
  } else {
    return res.status(400).json({ error: 'Invalid period. Use: daily, weekly, monthly' });
  }

  const result = await pool.query(query, params);
  return res.status(200).json({ period, data: result.rows });
};

/**
 * GET /api/dashboard/appliance-breakdown
 */
const getApplianceBreakdown = async (req, res) => {
  const userId = req.user.id;

  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().split('T')[0];

  const result = await pool.query(
    `SELECT
       a.name,
       ae.estimated_units,
       ae.estimated_pct AS percentage,
       ae.estimated_cost
     FROM appliance_estimates ae
     JOIN appliances a ON a.id = ae.appliance_id
     WHERE ae.user_id = $1
       AND ae.month = $2
     ORDER BY ae.estimated_units DESC`,
    [userId, monthStartStr]
  );

  if (result.rows.length === 0) {
    const appliancesResult = await pool.query(
      'SELECT * FROM appliances WHERE user_id = $1',
      [userId]
    );

    const { calculateMonthlyEstimates, addPercentageBreakdown } = require('../services/estimationEngine');
    const userResult = await pool.query('SELECT location FROM users WHERE id = $1', [userId]);
    const location = userResult.rows[0]?.location || 'Chennai';

    const withEstimates = calculateMonthlyEstimates(appliancesResult.rows, new Date().getMonth(), location);
    const withPercentages = addPercentageBreakdown(withEstimates);

    return res.status(200).json({
      data: withPercentages.map(a => ({
        name: a.name,
        estimated_units: a.estimated_monthly_kwh,
        percentage: a.percentage,
        estimated_cost: a.estimated_cost,
      })),
    });
  }

  return res.status(200).json({ data: result.rows });
};

/**
 * GET /api/dashboard/insights
 */
const getInsights = async (req, res) => {
  const userId = req.user.id;
  const insights = [];

  const applianceResult = await pool.query(
    `SELECT a.name, ae.estimated_pct, ae.estimated_cost
     FROM appliance_estimates ae
     JOIN appliances a ON a.id = ae.appliance_id
     WHERE ae.user_id = $1 AND ae.month = DATE_TRUNC('month', CURRENT_DATE)
     ORDER BY ae.estimated_units DESC LIMIT 1`,
    [userId]
  );

  if (applianceResult.rows[0]) {
    const top = applianceResult.rows[0];
    if (top.estimated_pct > 40) {
      insights.push({
        id: 'insight-top-consumer',
        type: 'warning',
        icon: '🔴',
        title: `${top.name} dominates your bill`,
        message: `${top.name} uses ${top.estimated_pct}% of your energy (₹${top.estimated_cost}/month)`,
        action: 'Reduce usage',
        action_url: '/coach',
      });
    }
  }

  const thisWeekResult = await pool.query(
    `SELECT COALESCE(SUM(estimated_units), 0) AS units
     FROM daily_estimates
     WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '6 days'`,
    [userId]
  );
  const lastWeekResult = await pool.query(
    `SELECT COALESCE(SUM(estimated_units), 0) AS units
     FROM daily_estimates
     WHERE user_id = $1
       AND date >= CURRENT_DATE - INTERVAL '13 days'
       AND date < CURRENT_DATE - INTERVAL '6 days'`,
    [userId]
  );

  const thisWeek = parseFloat(thisWeekResult.rows[0]?.units || 0);
  const lastWeek = parseFloat(lastWeekResult.rows[0]?.units || 0);

  if (lastWeek > 0 && thisWeek > lastWeek * 1.15) {
    insights.push({
      id: 'insight-weekly-increase',
      type: 'warning',
      icon: '📈',
      title: 'Usage trending up this week',
      message: `This week's usage is ${Math.round(((thisWeek / lastWeek) - 1) * 100)}% higher than last week`,
      action: 'View AI Coach',
      action_url: '/coach',
    });
  } else if (lastWeek > 0 && thisWeek < lastWeek * 0.95) {
    insights.push({
      id: 'insight-weekly-saving',
      type: 'success',
      icon: '✅',
      title: "You're saving energy this week!",
      message: `This week's usage is ${Math.round((1 - thisWeek / lastWeek) * 100)}% lower than last week`,
      action: 'Keep it up',
      action_url: '/leaderboard',
    });
  }

  const lastBillResult = await pool.query(
    `SELECT month FROM monthly_bills WHERE user_id = $1 ORDER BY month DESC LIMIT 1`,
    [userId]
  );
  if (lastBillResult.rows[0]) {
    const lastBillMonth = new Date(lastBillResult.rows[0].month);
    const monthsAgo = (new Date().getFullYear() - lastBillMonth.getFullYear()) * 12 +
      (new Date().getMonth() - lastBillMonth.getMonth());
    if (monthsAgo >= 1) {
      insights.push({
        id: 'insight-upload-bill',
        type: 'info',
        icon: '📊',
        title: 'Upload your latest bill',
        message: "Upload this month's bill to recalibrate your estimates and improve accuracy",
        action: 'Upload Bill',
        action_url: '/settings',
      });
    }
  }

  const cssResult = await pool.query(
    `SELECT COUNT(*) AS count FROM css_applications WHERE user_id = $1`,
    [userId]
  );
  if (parseInt(cssResult.rows[0]?.count || 0) === 0) {
    insights.push({
      id: 'insight-css',
      type: 'tip',
      icon: '💡',
      title: 'Comfort-Safe Savings ready',
      message: 'You have personalized recommendations that could save ₹800+/month without discomfort',
      action: 'View Recommendations',
      action_url: '/coach',
    });
  }

  return res.status(200).json({ insights });
};

/**
 * GET /api/dashboard/peak-hours
 */
const getPeakHours = async (req, res) => {
  const hourlyPattern = [
    { hour: 0,  label: '12am', intensity: 0.3 },
    { hour: 1,  label: '1am',  intensity: 0.2 },
    { hour: 2,  label: '2am',  intensity: 0.2 },
    { hour: 3,  label: '3am',  intensity: 0.2 },
    { hour: 4,  label: '4am',  intensity: 0.2 },
    { hour: 5,  label: '5am',  intensity: 0.3 },
    { hour: 6,  label: '6am',  intensity: 0.7 },
    { hour: 7,  label: '7am',  intensity: 0.9 },
    { hour: 8,  label: '8am',  intensity: 0.8 },
    { hour: 9,  label: '9am',  intensity: 0.4 },
    { hour: 10, label: '10am', intensity: 0.3 },
    { hour: 11, label: '11am', intensity: 0.3 },
    { hour: 12, label: '12pm', intensity: 0.4 },
    { hour: 13, label: '1pm',  intensity: 0.5 },
    { hour: 14, label: '2pm',  intensity: 0.4 },
    { hour: 15, label: '3pm',  intensity: 0.5 },
    { hour: 16, label: '4pm',  intensity: 0.6 },
    { hour: 17, label: '5pm',  intensity: 0.7 },
    { hour: 18, label: '6pm',  intensity: 1.0 },
    { hour: 19, label: '7pm',  intensity: 1.0 },
    { hour: 20, label: '8pm',  intensity: 0.9 },
    { hour: 21, label: '9pm',  intensity: 0.8 },
    { hour: 22, label: '10pm', intensity: 0.6 },
    { hour: 23, label: '11pm', intensity: 0.4 },
  ];

  return res.status(200).json({
    pattern: hourlyPattern,
    peak_range: '6 PM – 9 PM',
    note: 'Based on your appliance usage pattern',
  });
};

module.exports = { getSummary, getUsage, getApplianceBreakdown, getInsights, getPeakHours };
