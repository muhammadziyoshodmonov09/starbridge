import { query, initializeDatabase } from './db.js';

let dbInitialized = false;

async function ensureTable() {
  if (!dbInitialized && process.env.DATABASE_URL) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

/**
 * Creates a new pending transaction in the persistent database.
 */
export async function createPendingTransaction(payload) {
  await ensureTable();
  if (!process.env.DATABASE_URL) return null; // Graceful skip
  
  try {
    const res = await query(
      `INSERT INTO transactions (service, username, amount, duration, order_id, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING id`,
      [
        payload.service,
        payload.username,
        payload.amount || null,
        payload.duration || null,
        payload.order_id || null
      ]
    );
    return res.rows[0]?.id || null;
  } catch (error) {
    console.error("Database Error (createPendingTransaction):", error);
    return null;
  }
}

/**
 * Updates an active pending transaction to its final status (success/failed).
 */
export async function completeTransaction(id, updates) {
  if (!process.env.DATABASE_URL || !id) return;
  
  try {
    await query(
      `UPDATE transactions SET 
        status = $1, 
        ton_cost = $2, 
        usd_value = $3, 
        ton_price_usd = $4, 
        provider_error_code = $5, 
        provider_message = $6,
        completed_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [
        updates.status,
        updates.ton_cost || null,
        updates.usd_value || null,
        updates.ton_price_usd || null,
        updates.provider_error_code || null,
        updates.provider_message || null,
        id
      ]
    );
  } catch (error) {
    console.error("Database Error (completeTransaction):", error);
  }
}
