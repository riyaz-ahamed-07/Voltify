/**
 * migrate.js - Safe idempotent schema migration
 * Adds missing columns and unique constraints to the Voltify DB.
 * Run: node migrate.js
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connected to Supabase DB');

    // 1. Add appliance_count to users (if not exists)
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS appliance_count INTEGER DEFAULT 0
    `);
    console.log('✅ users.appliance_count — ok');

    // 2. Add type column to appliances (if not exists)
    await client.query(`
      ALTER TABLE appliances
      ADD COLUMN IF NOT EXISTS type VARCHAR(50)
    `);
    console.log('✅ appliances.type — ok');

    // 3. Add UNIQUE constraint to daily_estimates (user_id, date)
    //    We use a DO block to skip if constraint already exists
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'daily_estimates_user_id_date_key'
        ) THEN
          ALTER TABLE daily_estimates
          ADD CONSTRAINT daily_estimates_user_id_date_key UNIQUE (user_id, date);
        END IF;
      END;
      $$
    `);
    console.log('✅ daily_estimates UNIQUE(user_id, date) — ok');

    // 4. Add UNIQUE constraint to appliance_estimates (user_id, appliance_id, month)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'appliance_estimates_user_id_appliance_id_month_key'
        ) THEN
          ALTER TABLE appliance_estimates
          ADD CONSTRAINT appliance_estimates_user_id_appliance_id_month_key
            UNIQUE (user_id, appliance_id, month);
        END IF;
      END;
      $$
    `);
    console.log('✅ appliance_estimates UNIQUE(user_id, appliance_id, month) — ok');

    // 5. Create notifications table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        action_url VARCHAR(255),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ notifications table — ok');

    // 6. Create challenges table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS challenges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) DEFAULT 'weekly',
        title VARCHAR(255) NOT NULL,
        description TEXT,
        target_units DECIMAL(10,2),
        current_units DECIMAL(10,2) DEFAULT 0,
        reward_coins INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ challenges table — ok');

    // 7. Create coin_transactions table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS coin_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        coins INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        reason TEXT,
        multiplier DECIMAL(4,2) DEFAULT 1.0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ coin_transactions table — ok');

    console.log('\n🎉 Migration complete! All schema changes applied.');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(() => process.exit(1));
