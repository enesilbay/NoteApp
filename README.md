# NoteA+

A cross-platform note-taking app built to replace Google Keep. Write notes on the web, phone or tablet and keep them in sync with a single account.

**Live site:** https://notea-plus.enesilbayy.workers.dev (Android APK download at `/indir`)

## Features

- Account with email and password, Google sign-in and password reset (Supabase Auth)
- Create, edit and **autosave** notes
- Pin notes, archive them, and move them to the trash with undo and restore
- Cover colours for notes with a colour picker
- Grid and list views with a responsive layout for phone, tablet and desktop
- Search across note titles and content
- **Realtime sync** between all open devices
- Import your notes from Google Keep
- Installable **PWA** and a native **Android app** (Capacitor)
- Demo mode: without a backend configuration the app runs entirely in the browser's `localStorage`

See [ROADMAP.md](ROADMAP.md) for planned features such as checklists, labels, folders, images, handwriting, locked notes, a built-in calculator and offline mode.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite (PWA) |
| UI | Tailwind CSS 4, shadcn/ui (Radix) |
| Backend | Supabase (Auth, Postgres with Row Level Security, Realtime) |
| Mobile | Capacitor 8 (Android) |
| Hosting | Cloudflare Workers (static site) |
| Tooling | oxlint, Vitest, GitHub Actions CI |

## Getting Started

```bash
npm install
npm run dev
```

Without a `.env` file the app starts in **demo mode**: no login is required and notes are stored only in the current browser. This is enough to try the interface.

### Supabase setup (accounts and sync)

1. Create a free project at [supabase.com](https://supabase.com).
2. Run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) in the **SQL Editor**. It creates the tables, Row Level Security policies and the realtime publication.
3. Copy `.env.example` to `.env` and fill in the project URL and the `anon` key from **Project Settings → API**:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
4. In **Authentication → URL Configuration** set the *Site URL* to `http://localhost:5173` (your real domain in production).
5. *(Optional)* Enable Google sign-in under **Authentication → Providers → Google** with an OAuth client created in the Google Cloud Console.

Restart the dev server and the login screen appears.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server at http://localhost:5173 |
| `npm run build` | Type check and production build (`dist/`) |
| `npm run preview` | Serve the production build locally (for testing the PWA) |
| `npm run lint` | Lint with oxlint |
| `npm test` | Unit tests with Vitest |
| `npm run deploy` | Build and deploy to Cloudflare (run `npx wrangler login` first) |
| `npm run apk` | Bump the version and build a signed Android APK |

To try the app on a phone or tablet, run `npm run dev -- --host` and open your computer's IP address from a device on the same Wi-Fi network.

## Android build

`npm run apk` requires the Android SDK, JDK 21 (`JAVA_HOME`) and a signing key (`android/keystore.properties` plus the referenced `.jks` file). **Neither is stored in git, so keep backups.** Without the original key, new APKs cannot update an existing installation.

In Supabase, the redirect URLs must include the site address (`/**`), `http://localhost:5173/**` and `com.enesilbay.noteaplus://auth/callback`.

## Project Structure

```
src/
├── components/       App components (AppShell, NoteCard, NoteEditor, ...)
│   └── ui/           shadcn/ui components
├── lib/              Supabase client, notes repository, contexts, types
└── pages/            Login, notes (all / archive / trash), reset password, download
android/              Capacitor Android project
supabase/migrations/  Database schema
```

All note access goes through the `NotesRepo` interface in `src/lib/notes-repo.ts`, with a Supabase implementation and a local demo implementation. The planned offline layer will be added as another implementation of it.

## Contributing

Create a branch, make your change and make sure `npm run lint && npm run build` passes before opening a pull request. GitHub Actions runs lint and build on every push and pull request.
