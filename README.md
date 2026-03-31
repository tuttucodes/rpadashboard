# RPA Course Dashboard

Live student feedback dashboard for the **Robot Process Automation** course under **Dr Umesh K**.  
Team: Rohan · Dhaanya · Rahul Babu

## Stack
- React 18 + Vite
- Recharts (radar + bar charts)
- PapaParse (CSV parsing)
- CSS Modules

## Local Development

```bash
npm install
npm run dev
```

## Deploy to Vercel

### Option A — Vercel CLI (fastest)
```bash
npm install -g vercel
vercel
```
Follow the prompts. Done — your URL is live in ~60 seconds.

### Option B — GitHub + Vercel UI
1. Push this folder to a GitHub repo
2. Go to https://vercel.com/new
3. Import the repo
4. Leave all settings as default (Vite is auto-detected)
5. Click **Deploy**

## Live Data
Pulls from the published Google Sheet CSV automatically on every page load.  
Hit **Refresh** in the header to re-fetch without reloading the page.

If the sheet is unavailable, the dashboard falls back to sample data with a warning banner.

## Updating the sheet URL
Edit `src/data.js` → change `CSV_URL` to your new published CSV link.
# rpadashboard
