import { verifyAdminKey } from '../../../lib/api/adminSecurity.js';
import { query } from '../../../lib/api/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  if (!verifyAdminKey(req)) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ ok: false, error: 'Missing transaction ID' });
  }

  try {
    const result = await query(`SELECT * FROM transactions WHERE id = $1`, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Transaction not found' });
    }

    return res.status(200).json({
      ok: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error("Admin Transaction Fetch Error:", err);
    return res.status(500).json({ ok: false, error: "Database mapping error." });
  }
}
