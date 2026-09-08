# SwishIQ Chat Backend

This is a tiny server whose only job is to keep your Anthropic API key safe
while letting the AI chat on your SwishIQ website work on your own domain —
not just inside the Claude preview.

**Why you need this:** right now, the chat on your website talks directly to
Anthropic using a connection that only works inside Claude's preview
environment. Once your website is on its own domain (like swishiq.com), that
direct connection stops working — a public website can't safely call an AI
service with a secret key baked into its code, because anyone could view the
page's source and steal it. This tiny server sits between your website and
Anthropic, holding the secret key privately, so your website never has to
expose it.

## What's in this folder

```
api/
  chat.js       <- the actual server code
package.json    <- tells the hosting service what this project is
```

## Deploy it — about 5 minutes, completely free

**1. Get an Anthropic API key**
Go to https://console.anthropic.com, sign up or log in, then
**Settings -> API Keys -> Create Key**. Copy the key somewhere safe — you'll
only see it once.

**2. Create a free Vercel account**
Go to https://vercel.com and sign up (signing in with GitHub is easiest).

**3. Upload this folder**
Easiest path: create a new, free GitHub repository, upload this whole folder
to it (drag-and-drop works right on github.com), then in Vercel click
**Add New -> Project** and import that repository.

**4. Add your API key as an environment variable**
Before you click Deploy, Vercel shows an "Environment Variables" section.
Add:
- **Name:** `ANTHROPIC_API_KEY`
- **Value:** (paste the key from step 1)

**5. Click Deploy**
Vercel gives you a live URL, something like:
`https://swishiq-chat-backend.vercel.app`

Your chat endpoint is now live at:
`https://swishiq-chat-backend.vercel.app/api/chat`

## Connect it to your website

Open `swishiq-website.html` in a text editor and search for `CHAT_API_URL`.
You'll find this line:

```js
const CHAT_API_URL = 'https://api.anthropic.com/v1/messages';
```

Change it to your new URL from step 5:

```js
const CHAT_API_URL = 'https://swishiq-chat-backend.vercel.app/api/chat';
```

Save the file and upload it to your own domain/hosting. The chat will now
work there permanently — no Claude preview needed.

## A couple of notes

- This includes basic spam protection (max 15 messages per minute per
  visitor). If you get a lot of traffic, you may want something sturdier —
  happy to help with that when you get there.
- If the chat ever stops responding once live, the most common cause is the
  `ANTHROPIC_API_KEY` environment variable — double-check it's set correctly
  in Vercel's project settings.
- This same `api/chat.js` logic can be adapted for Netlify Functions,
  Cloudflare Workers, or a plain Node server if you'd rather use one of
  those instead of Vercel.
