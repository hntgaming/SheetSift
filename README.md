# SheetSift

Analyze and summarize your Google Sheets partner data. Upload a file of Network IDs to filter the main sheet and export a CSV report.

This app is a standard Next.js application and can be deployed on any Node.js server (VPS, Docker, PM2, Nginx).

---

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### 1. Install dependencies

```bash
npm ci
```

### 2. Environment variables

Copy the example env and set your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` | Yes | Full service account JSON as a single line (escape newlines). Needs **Spreadsheets (read-only)**. |
| `MAIN_SHEET_ID` | Yes | Google Sheet ID from the sheet URL (`https://docs.google.com/spreadsheets/d/<MAIN_SHEET_ID>/edit`). |

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002). For default port 3000 use `next dev` (see package.json scripts).

### 4. Production build

```bash
npm run build
npm start
```

`npm start` runs `next start`. Use `PORT=3000` (or set in env) to change port.

---

## Architecture summary

- **Framework:** Next.js 15 (App Router).
- **Data:** Server-side only. Main page loads data via `getMainSheetData()` (Google Sheets API) and passes it to the client.
- **UI:** Single page – header, main (report section), footer. Design tokens in `src/app/globals.css`; all components use CSS variables (no hardcoded colors).
- **Flow:** User uploads a CSV/TXT of Network IDs → client filters server-fetched rows by those IDs → table shows filtered rows; user can export CSV.

### Data flow

1. **Page load:** Server runs `getMainSheetData()` in `src/app/page.tsx` (uses `googleapis` + service account).
2. **Hydration:** `ReportPageClient` receives `mainSheetData` and manages file upload + filter state.
3. **Filter:** User selects file → IDs parsed → `filteredData` = rows where `networkId` is in the uploaded list.
4. **Export:** Client-side CSV generation from `filteredData` via `exportToCsv()` in `src/lib/utils.ts`.

### Key files

| Path | Role |
|------|------|
| `src/app/layout.tsx` | Root layout; AppHeader, AppFooter, Toaster. |
| `src/app/page.tsx` | Server component; fetches sheet data; renders error or ReportPageClient. |
| `src/components/app-shell.tsx` | Shared header and footer. |
| `src/components/report-page-client.tsx` | File upload, filter logic, ReportTable, export. |
| `src/components/report-table.tsx` | Table + loading skeleton + totals footer. |
| `src/lib/google-sheets.ts` | Google Auth + Sheets client; `getMainSheetData`. |
| `src/lib/data.ts` | Type: `ReportRow`. |
| `src/app/globals.css` | Design system (colors, radius, chart, sidebar variables). |

### API surface

- No REST API. Data is loaded in the server component and passed as props.

### Error handling

- Missing or invalid `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` or `MAIN_SHEET_ID`: thrown in `getMainSheetData`, caught in page, shown in Alert.
- Sheet missing required columns: error thrown and displayed.
- File read errors: toast (destructive).
- Empty filter result: toast “No Matches Found”.

---

## Deployment (direct server)

### Option A: Node + process manager (PM2)

On a VPS or server with Node 18+:

```bash
# Build
npm ci
npm run build

# Run with PM2 (install: npm i -g pm2)
PORT=3000 pm2 start npm --name "sheetsift" -- start

# Persist across reboots
pm2 save
pm2 startup
```

### Option B: Docker

Example Dockerfile (add to repo if you use Docker):

```dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system nodejs && adduser --system nextjs
COPY --from=base /app/public ./public
COPY --from=base --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

To use standalone output, add to `next.config.ts`:

```ts
const nextConfig = {
  output: 'standalone',
  // ...rest
};
```

Then build image and run:

```bash
docker build -t sheetsift .
docker run -p 3000:3000 --env-file .env.local sheetsift
```

### Option C: Nginx reverse proxy

Run the app (e.g. with PM2) on a local port (e.g. 3000), then in Nginx:

```nginx
server {
  listen 80;
  server_name your-domain.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### Option D: Vercel / other platforms

- **Vercel:** Connect repo, set env vars in dashboard, deploy. No extra config.
- **Other Node hosts:** Use `npm run build` and `npm start`; set `PORT` and env vars as required.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next dev with Turbopack on port 9002. |
| `npm run build` | Production build. |
| `npm start` | Run production server (after build). |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run `tsc --noEmit`. |

---

## Versioning and changelog

- **Version:** See `package.json` (`version`).
- **Changelog:** Maintain a `CHANGELOG.md` in the repo root for notable changes.

---

## Production checklist

- [ ] Set `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` and `MAIN_SHEET_ID` in production env.
- [ ] For strict builds: set `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` to `false` in `next.config.ts` and fix any reported issues.
- [ ] Use HTTPS (e.g. Nginx + Let’s Encrypt or platform TLS).
- [ ] Restrict Google service account to minimal scopes and only required sheet access.
