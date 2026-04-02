import { verifyAdminKey } from '../../lib/api/adminSecurity.js';
import { query } from '../../lib/api/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  if (!verifyAdminKey(req)) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const { service, status, limit } = req.query;

  let baseQuery = `SELECT * FROM transactions WHERE 1=1`;
  const params = [];

  if (service) {
    params.push(service);
    baseQuery += ` AND service = $${params.length}`;
  }
  if (status) {
    params.push(status);
    baseQuery += ` AND status = $${params.length}`;
  }

  baseQuery += ` ORDER BY created_at DESC`;

  if (limit && !isNaN(parseInt(limit))) {
    params.push(parseInt(limit));
    baseQuery += ` LIMIT $${params.length}`;
  }

  try {
    const result = await query(baseQuery, params);
    return res.status(200).json({
      ok: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error("Admin Transactions Vector Error:", err);
    return res.status(500).json({ ok: false, error: "Database mapping error." });
  }
}
