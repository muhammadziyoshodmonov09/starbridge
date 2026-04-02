import pg from 'pg';

const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Provide SSL parameters strictly for cloud databases like Neon/Supabase if required
      ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
    });
  }
  return pool;
}

export async function query(text, params) {
  // If no DB URL is set, gracefully return mock data so local dev doesn't totally crash
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is missing. Database operations are disabled.");
    return { rows: [] };
  }
  
  const client = await getPool().connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

// Helper to assert table exists on boot
export async function initializeDatabase() {
  const tableQuery = `
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      service VARCHAR(50),
      username VARCHAR(255),
      amount INT,
      duration INT,
      order_id VARCHAR(255),
      status VARCHAR(50),
      ton_cost DECIMAL(10, 4),
      usd_value DECIMAL(10, 4),
      ton_price_usd DECIMAL(10, 4),
      provider_error_code VARCHAR(255),
      provider_message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP
    );
  `;
  await query(tableQuery);
}
