import { verifyAdminKey } from '../../lib/api/adminSecurity.js';
import { query } from '../../lib/api/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  if (!verifyAdminKey(req)) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  try {
    const statsQuery = `
      SELECT 
        COUNT(id) as total_requests,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_requests,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_requests,
        SUM(CASE WHEN status = 'success' THEN ton_cost ELSE 0 END) as total_ton_spent,
        SUM(CASE WHEN status = 'success' THEN usd_value ELSE 0 END) as total_usd_spent
      FROM transactions
    `;

    const result = await query(statsQuery);
    const row = result.rows[0];

    return res.status(200).json({
      ok: true,
      data: {
        total_transactions: parseInt(row.total_requests || '0'),
        successful_transactions: parseInt(row.successful_requests || '0'),
        failed_transactions: parseInt(row.failed_requests || '0'),
        total_ton_value: parseFloat(row.total_ton_spent || '0'),
        total_usd_value: parseFloat(row.total_usd_spent || '0')
      }
    });
  } catch (err) {
    console.error("Admin Stats Aggregation Error:", err);
    return res.status(500).json({ ok: false, error: "Database mapping error." });
  }
}
