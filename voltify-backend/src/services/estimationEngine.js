const pool = require('../config/db');

// Tamil Nadu TANGEDCO tariff rates (₹ per unit)
const TARIFF_RATES = {
  'Chennai':   8.0,
  'Mumbai':    9.5,
  'Delhi':     7.5,
  'Bangalore': 7.8,
  'Hyderabad': 8.2,
  'default':   8.0,
};

/**
 * Gets the tariff rate for a given location
 */
const getTariffRate = (location) => {
  return TARIFF_RATES[location] || TARIFF_RATES['default'];
};

/**
 * Gets seasonal multiplier for AC based on current month
 * India: April–June = peak summer, Dec–Feb = winter
 */
const getSeasonalMultiplier = (applianceName, month) => {
  const m = month + 1; // month is 0-indexed from JS Date
  if (applianceName.toLowerCase().includes('ac')) {
    if ([4, 5, 6].includes(m)) return 1.3;   // Summer peak
    if ([12, 1, 2].includes(m)) return 0.4;  // Winter — barely used
    return 1.0;
  }
  if (applianceName.toLowerCase().includes('geyser')) {
    if ([12, 1, 2].includes(m)) return 1.4;  // Winter — heavy geyser use
    if ([4, 5, 6].includes(m)) return 0.5;   // Summer — barely used
    return 1.0;
  }
  return 1.0;
};

/**
 * Checks if an appliance should be active in a given month
 * based on its seasonality setting
 */
const isApplianceActiveInMonth = (seasonality, month) => {
  const m = month + 1;
  if (seasonality === 'whole_year') return true;
  if (seasonality === 'summer') return [3, 4, 5, 6, 7].includes(m);
  if (seasonality === 'winter') return [10, 11, 12, 1, 2].includes(m);
  return true;
};

/**
 * Adds ±10% random noise to make daily estimates look realistic
 * Not truly random — seeded by date so same date = same value
 */
const addDailyNoise = (value, date) => {
  const seed = new Date(date).getTime() % 1000;
  const noise = (seed / 1000 - 0.5) * 0.2; // -0.1 to +0.1
  return Math.max(0, value * (1 + noise));
};

/**
 * Weekend usage multiplier — people stay home more
 */
const getDayOfWeekMultiplier = (date) => {
  const day = new Date(date).getDay();
  return (day === 0 || day === 6) ? 1.15 : 1.0;
};

/**
 * CORE FUNCTION: Calculates estimated monthly kWh per appliance
 */
const calculateMonthlyEstimates = (appliances, month, location = 'Chennai') => {
  const tariff = getTariffRate(location);

  return appliances.map((appliance) => {
    if (!isApplianceActiveInMonth(appliance.seasonality, month)) {
      return {
        ...appliance,
        estimated_monthly_kwh: 0,
        estimated_cost: 0,
        percentage: 0,
      };
    }

    const seasonalMultiplier = getSeasonalMultiplier(appliance.name, month);

    const estimatedMonthlyKwh =
      parseFloat(appliance.power_kw) *
      parseFloat(appliance.avg_hours_day) *
      30 *
      seasonalMultiplier;

    const estimatedCost = estimatedMonthlyKwh * tariff;

    return {
      ...appliance,
      estimated_monthly_kwh: parseFloat(estimatedMonthlyKwh.toFixed(3)),
      estimated_cost: parseFloat(estimatedCost.toFixed(2)),
      percentage: 0,
    };
  });
};

/**
 * Adds percentage breakdown to each appliance
 */
const addPercentageBreakdown = (appliancesWithEstimates) => {
  const totalKwh = appliancesWithEstimates.reduce(
    (sum, a) => sum + a.estimated_monthly_kwh, 0
  );

  if (totalKwh === 0) return appliancesWithEstimates;

  return appliancesWithEstimates.map((a) => ({
    ...a,
    percentage: parseFloat(((a.estimated_monthly_kwh / totalKwh) * 100).toFixed(1)),
  }));
};

/**
 * CORE FUNCTION: Estimates daily usage for a given date
 */
const estimateDailyUsage = (appliances, date, location = 'Chennai') => {
  const dateObj = new Date(date);
  const month = dateObj.getMonth();
  const tariff = getTariffRate(location);

  const baseDaily = appliances.reduce((sum, appliance) => {
    if (!isApplianceActiveInMonth(appliance.seasonality, month)) return sum;

    const seasonalMultiplier = getSeasonalMultiplier(appliance.name, month);
    const dailyKwh = parseFloat(appliance.power_kw) * parseFloat(appliance.avg_hours_day) * seasonalMultiplier;
    return sum + dailyKwh;
  }, 0);

  const withNoise = addDailyNoise(baseDaily, date);
  const withWeekend = withNoise * getDayOfWeekMultiplier(date);
  const dailyUnits = parseFloat(withWeekend.toFixed(3));
  const dailyCost = parseFloat((dailyUnits * tariff).toFixed(2));

  return { units: dailyUnits, cost: dailyCost };
};

/**
 * Calculates match percentage between estimated and actual units
 */
const calculateMatchPercentage = (estimatedUnits, actualUnits) => {
  if (actualUnits === 0) return 0;
  const diff = Math.abs(estimatedUnits - actualUnits);
  const matchPct = Math.max(0, (1 - diff / actualUnits) * 100);
  return parseFloat(matchPct.toFixed(1));
};

/**
 * PREDICTIONS: Simple moving average for next day/week/month
 */
const generatePredictions = (last7DaysEstimates, location = 'Chennai') => {
  const tariff = getTariffRate(location);

  if (!last7DaysEstimates || last7DaysEstimates.length === 0) {
    return {
      tomorrow: { units: 0, cost: 0, confidence: 0 },
      next_week: { units: 0, cost: 0, confidence: 0 },
      next_month: { units: 0, cost: 0, confidence: 0 },
    };
  }

  const avgDaily = last7DaysEstimates.reduce((sum, d) => sum + parseFloat(d.estimated_units), 0) / last7DaysEstimates.length;
  const nextDayUnits = parseFloat((avgDaily * 1.02).toFixed(3));
  const nextWeekUnits = parseFloat((avgDaily * 7).toFixed(3));
  const nextMonthUnits = parseFloat((avgDaily * 30).toFixed(3));

  return {
    tomorrow: {
      units: nextDayUnits,
      cost: parseFloat((nextDayUnits * tariff).toFixed(2)),
      confidence: 85,
    },
    next_week: {
      units: nextWeekUnits,
      cost: parseFloat((nextWeekUnits * tariff).toFixed(2)),
      confidence: 75,
    },
    next_month: {
      units: nextMonthUnits,
      cost: parseFloat((nextMonthUnits * tariff).toFixed(2)),
      confidence: 65,
    },
  };
};

/**
 * BILL SHOCK DETECTION
 */
const detectBillShock = (dailyEstimatesThisMonth, lastMonthBill, daysElapsed, location = 'Chennai') => {
  const tariff = getTariffRate(location);

  if (!dailyEstimatesThisMonth || dailyEstimatesThisMonth.length === 0 || !lastMonthBill) {
    return { risk: false, probability: 0, projected_bill: 0, projected_units: 0 };
  }

  const totalSoFar = dailyEstimatesThisMonth.reduce((sum, d) => sum + parseFloat(d.estimated_units), 0);
  const avgPerDay = totalSoFar / Math.max(daysElapsed, 1);
  const projectedMonthlyUnits = avgPerDay * 30;
  const projectedBill = parseFloat((projectedMonthlyUnits * tariff).toFixed(2));

  const increaseRatio = projectedBill / parseFloat(lastMonthBill);
  const risk = increaseRatio > 1.15;

  return {
    risk,
    probability: risk ? Math.min(95, Math.round((increaseRatio - 1) * 200)) : 0,
    projected_bill: projectedBill,
    projected_units: parseFloat(projectedMonthlyUnits.toFixed(3)),
    increase_pct: parseFloat(((increaseRatio - 1) * 100).toFixed(1)),
  };
};

/**
 * WHAT-IF CALCULATOR
 */
const calculateWhatIf = (appliances, applianceName, changeType, changeValue, location = 'Chennai') => {
  const tariff = getTariffRate(location);
  const month = new Date().getMonth();

  const appliance = appliances.find(a =>
    a.name.toLowerCase().includes(applianceName.toLowerCase())
  );

  if (!appliance) {
    return { error: `Appliance "${applianceName}" not found` };
  }

  const currentMonthlyKwh =
    parseFloat(appliance.power_kw) *
    parseFloat(appliance.avg_hours_day) *
    30 *
    getSeasonalMultiplier(appliance.name, month);

  let newMonthlyKwh = currentMonthlyKwh;

  if (changeType === 'hours') {
    const newHours = Math.max(0, parseFloat(appliance.avg_hours_day) - parseFloat(changeValue));
    newMonthlyKwh =
      parseFloat(appliance.power_kw) *
      newHours *
      30 *
      getSeasonalMultiplier(appliance.name, month);
  }

  if (changeType === 'temperature' && applianceName.toLowerCase().includes('ac')) {
    const tempIncrease = parseFloat(changeValue);
    newMonthlyKwh = currentMonthlyKwh * (1 - (tempIncrease * 0.06));
  }

  const savedKwh = Math.max(0, currentMonthlyKwh - newMonthlyKwh);
  const monthlySavingsRs = parseFloat((savedKwh * tariff).toFixed(2));
  const annualSavingsRs = parseFloat((monthlySavingsRs * 12).toFixed(2));
  const coinsEarned = Math.round(savedKwh * 10);

  return {
    appliance: appliance.name,
    current_monthly_kwh: parseFloat(currentMonthlyKwh.toFixed(3)),
    new_monthly_kwh: parseFloat(newMonthlyKwh.toFixed(3)),
    saved_kwh: parseFloat(savedKwh.toFixed(3)),
    monthly_savings_rs: monthlySavingsRs,
    annual_savings_rs: annualSavingsRs,
    coins_earned: coinsEarned,
  };
};

/**
 * MAIN: Generates and saves daily estimates for a user
 */
const generateAndSaveDailyEstimates = async (userId, appliances, location, daysBack = 30) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const estimates = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const { units, cost } = estimateDailyUsage(appliances, dateStr, location);

      await client.query(
        `INSERT INTO daily_estimates (user_id, date, estimated_units, estimated_cost)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, date) DO UPDATE
         SET estimated_units = EXCLUDED.estimated_units,
             estimated_cost  = EXCLUDED.estimated_cost`,
        [userId, dateStr, units, cost]
      );

      estimates.push({ date: dateStr, units, cost });
    }

    await client.query('COMMIT');
    return estimates;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Generates and saves monthly appliance estimates
 */
const generateAndSaveApplianceEstimates = async (userId, appliances, location) => {
  const month = new Date();
  month.setDate(1);
  const monthStr = month.toISOString().split('T')[0];

  const monthIndex = new Date().getMonth();
  const withEstimates = calculateMonthlyEstimates(appliances, monthIndex, location);
  const withPercentages = addPercentageBreakdown(withEstimates);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const appliance of withPercentages) {
      await client.query(
        `INSERT INTO appliance_estimates (user_id, appliance_id, month, estimated_units, estimated_pct, estimated_cost)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, appliance_id, month) DO UPDATE
         SET estimated_units = EXCLUDED.estimated_units,
             estimated_pct   = EXCLUDED.estimated_pct,
             estimated_cost  = EXCLUDED.estimated_cost`,
        [userId, appliance.id, monthStr, appliance.estimated_monthly_kwh, appliance.percentage, appliance.estimated_cost]
      );
    }

    await client.query('COMMIT');
    return withPercentages;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  getTariffRate,
  calculateMonthlyEstimates,
  addPercentageBreakdown,
  estimateDailyUsage,
  calculateMatchPercentage,
  generatePredictions,
  detectBillShock,
  calculateWhatIf,
  generateAndSaveDailyEstimates,
  generateAndSaveApplianceEstimates,
};
