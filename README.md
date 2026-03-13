# DDAminni

Lightweight Next.js app for family, cleaning, and sticky-note tracking.

## Local Development

1. Install dependencies:
	`npm install`
2. Create env file:
	`cp .env.example .env`
3. Run dev server:
	`npm run dev`

## Vercel Deployment

1. Import this repository in Vercel.
2. Set `Root Directory` to `apps/web`.
3. Add environment variable:
	- `MONGODB_URI`
4. Build command:
	- `npm run build`

## Lightweight Hosting Notes

- Build output and cache directories are git-ignored (`.next/`, `*.tsbuildinfo`, `dist/`, `coverage/`).
- Local env files are git-ignored (`.env`, `.env.*`, except `.env.example`).
- Unused frontend packages were removed (`axios`, `tailwindcss`, `postcss`, `autoprefixer`).
- MongoDB connection is cached for serverless runtime efficiency.