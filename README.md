# Marrow Study Groups

A web app for NEET PG aspirants to study together in small groups. Built as an extension to Marrow.

## What this is

Solo exam prep is lonely. Conventional leaderboards create rank anxiety. This product is designed around **presence, effort, and collective reward** instead of comparison.

Each member sets personal weekly goals (MCQs and videos watched). When they sit down to study, they enter **Focus Mode** — pick an organ character as their avatar and join a virtual study table where other group members appear seated around them. Inactive members appear dimmed at the table with a nudge bell above their head. Weekly goal completion contributes toward unlocking medical textbook badges in the **Library**.

## Stack

- **React 18** + **Vite**
- **Plain CSS** with design tokens (no Tailwind, no CSS-in-JS)
- **localStorage** for state (swap to Supabase for production)

## Develop locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for production

```bash
npm run build
npm run preview
```

The `dist/` folder is deployable to Vercel, Netlify, or any static host.

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Or push to GitHub and connect the repo on vercel.com.

## Project structure

```
src/
├── main.jsx              # entry
├── App.jsx               # routing
├── lib/
│   ├── db.js             # localStorage data layer (replace with Supabase)
│   ├── catalog.js        # organ + textbook catalogs
│   └── context.jsx       # Auth, Toast, Router contexts
├── screens/
│   ├── SignIn.jsx
│   ├── Callback.jsx
│   ├── Landing.jsx
│   ├── Create.jsx
│   ├── Join.jsx
│   ├── Invite.jsx
│   └── Group.jsx         # the main dashboard
├── components/
│   ├── TopBar.jsx
│   ├── GoalRing.jsx
│   ├── Character.jsx
│   ├── Scene.jsx         # the study table
│   ├── LibraryScene.jsx
│   ├── ModulesList.jsx
│   └── modals/...
├── styles/
│   └── tokens.css        # Spine design tokens
└── assets/
    └── characters/       # organ PNGs (heart, brain, liver, kidneys)
```

## Asset slots

The app expects PNGs at `src/assets/characters/{organ}.png`. Currently shipped:
- heart.png
- brain.png
- liver.png
- kidneys.png

To extend the catalog (Lungs, Stomach, etc.), drop a transparent PNG in that folder and add the organ id to `src/lib/catalog.js`.

## Swapping localStorage for Supabase

All data goes through `src/lib/db.js`. To wire up Supabase:

1. Add the `@supabase/supabase-js` package
2. Replace each function in `db.js` with a Supabase query
3. Tables to create: `users`, `groups`, `memberships`, `focus_sessions`, `shared_modules`, `nudges`, `progress_logs`, `week_badges`
4. Enable Row Level Security with per-group policies via the `memberships` table
5. Enable Realtime on `focus_sessions` and `nudges`

## Design system

Tokens live in `src/styles/tokens.css` — colors, typography, spacing, radius, shadows, motion. The system is called **Spine** and follows Marrow's existing visual language. Marrow blue (`#62C8DF`) is the anchor.

## License

Internal / proprietary. Built by Kush Bandwal for Marrow.
