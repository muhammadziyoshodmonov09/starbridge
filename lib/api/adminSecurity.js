export function verifyAdminKey(req) {
  const providedKey = req.headers['x-admin-key'];
  const actualKey = process.env.ADMIN_KEY;

  if (!actualKey || providedKey !== actualKey) {
    return false;
  }
  return true;
}
