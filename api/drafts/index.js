const jwt = require('jsonwebtoken');
const { db } = require('../_lib/db');

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) throw new Error('No token');
  return jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
}

const ALLOWED_ORIGIN = process.env.FRONTEND_URL || 'https://saglps.vercel.app';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    verifyToken(req);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const draft = await db.getDraft();
      return res.json(draft?.data || null);
    }

    if (req.method === 'PUT') {
      const { pages, layoutId } = req.body || {};
      if (!pages || !Array.isArray(pages)) {
        return res.status(400).json({ error: 'pages array is required' });
      }
      const result = await db.upsertDraft({ pages, layoutId });
      return res.json({ ok: true, updated_at: result.updated_at });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
