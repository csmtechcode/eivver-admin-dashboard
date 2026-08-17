# EIVVER Admin Dashboard

Administration dashboard for the EIVVER marketplace platform. Built with [Next.js](https://nextjs.org) (App Router) and Tailwind CSS, this dashboard lets EIVVER administrators manage customers, fixers, bookings, services, categories, payments, notifications, and platform settings.

## Features

- **Authentication** — JWT-based login with refresh-token rotation and role-protected routes
- **Dashboard** — revenue/commission charts, booking and payment stats
- **Customers & Fixers** — searchable listings, detail views, status history
- **Bookings** — full booking lifecycle views with status tracking
- **Services & Categories** — catalog management backed by the admin API
- **Payments** — transaction history and settlement summaries
- **Verification** — fixer verification queue and pending count
- **Notifications** — admin broadcast composer with audience/channel targeting, delivery logs, per-log and bulk retry, live status breakdown
- **Platform Settings** — inspect platform configuration
- **Dark mode** — light/dark/system themes (custom `ThemeProvider`, no external dependency) with anti-FOUC inline script
- **Responsive** — fixed desktop sidebar with a slide-out mobile drawer

## Getting Started

### Prerequisites

- Node.js 20+
- The [EIVVER backend](https://github.com/csmtechcode/fix-global-backend) running on port `4000`

### Install

```bash
npm install
```

### Environment

Copy the example env file and adjust as needed:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the EIVVER backend API (default `http://localhost:4000`) |

### Run

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (the port can be overridden with `-- -p <port>`).

### Build & Lint

```bash
npm run build
npm run lint
```

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript
- Tailwind CSS v4
- Zustand (client state)
- Axios (API client with envelope unwrapping and refresh-token interceptor)
- shadcn/ui-style components

## Project Structure

```
app/            # Routes (auth, dashboard pages)
components/     # Layout, dashboard widgets, sidebar, notifications, theme
lib/            # API client, auth storage, utilities, hooks
services/       # Typed API service functions per domain
store/          # Zustand stores
types/          # Shared TypeScript types
```

## API Contract

All backend responses follow the `{ success, message, data }` envelope. The axios client unwraps `data` automatically and transparently refreshes expired access tokens using the refresh token.

## Deployment

The app is a standard Next.js deployment (Vercel, Docker, or any Node host). Build with `npm run build` and serve with `npm run start`.