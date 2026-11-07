# GrantX Web

GrantX — *Health on chain*. A secure medical-records platform: patients upload AES-256 encrypted records to IPFS, share them with doctors on their own terms, find doctors and book appointments. Doctors manage profiles, appointments and shared patient records; admins review doctor requests.

## Stack

React 18 · Vite 5 · Tailwind CSS 3 · React Router 6 · Framer Motion · Google OAuth

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev            # http://localhost:3000
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL of the GrantX backend (Express API) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth web client ID |

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build into `dist/`
- `npm run preview` — serve the production build

## Project layout

```
src/
  components/   shared UI (Navbar, Footer, Logo, Toast, PrivateRoute)
  contexts/     AuthContext
  lib/api.js    fetch wrapper with token handling
  services/     API calls per domain (auth, records, sharing, doctors, appointments, profile)
  pages/        public pages + auth, patient, doctor and admin areas
public/
  logo.svg      GrantX wordmark
  grantx.svg    favicon
```
