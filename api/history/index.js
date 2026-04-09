const jwt = require('jsonwebtoken');
const { db } = require('../_lib/db');

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) throw new Error('No token');
  return jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
}

const ALLOWED_ORIGIN = process.env.FRONTEND_URL || 'https://printer-image-generator.vercel.app';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    verifyToken(req);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const data = await db.listHistory();
      return res.json(data);
    }

    if (req.method === 'POST') {
      const { action, template_name, auto_name, filled_count, copies, page_count, labels_per_page, pages } = req.body || {};
      if (!action) return res.status(400).json({ error: 'action is required' });
      const entry = {
        action,
        template_name: template_name || null,
        auto_name: auto_name || null,
        filled_count: filled_count || 0,
        copies: copies || 1,
        page_count: page_count || 1,
        labels_per_page: labels_per_page || 12,
        pages: pages || [],
      };
      const data = await db.addHistory(entry);
      return res.status(201).json(data);
    }

    if (req.method === 'DELETE') {
      await db.clearHistory();
      return res.json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
