export default function handler(req, res) {
  // Simple health check endpoint mapping to /api/health
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  res.status(200).json({
    ok: true,
    service: "StarBridge API",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
}
