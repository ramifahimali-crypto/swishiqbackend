// SwishIQ chat backend — proxies chat requests to Anthropic's API,
// keeping your API key on the server instead of exposed in the website's
// code (which anyone could read in their browser).
//
// Deploy this on Vercel (see README.md in this folder for step-by-step
// instructions), then point your website's CHAT_API_URL at:
//   https://your-project.vercel.app/api/chat

const requestLog = new Map();
const RATE_LIMIT = 15; // max requests
const RATE_WINDOW_MS = 60 * 1000; // per minute, per visitor

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (requestLog.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

module.exports = async function handler(req, res) {
  // Allow the browser to call this from your website's domain.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server is missing its ANTHROPIC_API_KEY environment variable. Add it in your Vercel project settings.'
    });
  }

  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests — please wait a moment and try again.' });
  }

  const { messages, system } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array.' });
  }

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: typeof system === 'string' ? system : undefined,
        messages: messages
      })
    });

    const data = await anthropicResponse.json();
    return res.status(anthropicResponse.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong reaching the AI service.' });
  }
};
