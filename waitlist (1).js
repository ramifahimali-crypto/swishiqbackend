// SwishIQ waitlist backend — saves waitlist emails to a Supabase table so
// you can see every signup in one place (Table Editor at supabase.com).
//
// Deploy this alongside chat.js in the same Vercel project. See README.md
// in this folder for step-by-step setup, including the Supabase part.

const requestLog = new Map();
const RATE_LIMIT = 5; // max requests
const RATE_WINDOW_MS = 60 * 1000; // per minute, per visitor

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (requestLog.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      error: 'Server is missing its SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY environment variables.'
    });
  }

  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests — please wait a moment and try again.' });
  }

  const { email } = req.body || {};
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    const response = await fetch(supabaseUrl + '/rest/v1/waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: 'Bearer ' + supabaseKey,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() })
    });

    // 409 means this email is already on the list — treat that as success
    // from the visitor's point of view, not an error.
    if (!response.ok && response.status !== 409) {
      return res.status(500).json({ error: 'Could not save your email right now.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong saving your email.' });
  }
};
