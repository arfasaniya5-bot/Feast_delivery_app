# Feast Delivery App

This repository contains the full-stack food delivery app with a Vite + React frontend and Express backend.

## What is included

- `src/` — React frontend components and state management
- `server.ts` — Express backend with authentication, food list, cart, and orders APIs
- `vite.config.ts` — Vite configuration for development and build
- `tsconfig.json` — TypeScript settings for the app
- `.env.example` — environment variable template for local run

## Prerequisites

- Node.js installed (tested with Node 20.x)
- `npm` available in your shell

## Setup

1. Open the project folder:
   ```bash
   cd C:\Users\arfas\Downloads\food-delivery-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a local environment file:
   ```bash
   copy .env.example .env
   ```
4. Set your secrets in `.env`:
   - `JWT_SECRET` — any secure secret string
   - `STRIPE_SECRET_KEY` — Stripe API key for payments
   - `GEMINI_API_KEY` and `APP_URL` are optional for AI Studio/cloud integration

## Run Locally

Start the app in development mode:

```bash
npm run dev
```

Then open:

- `http://localhost:3000`

## Build and Run Production Locally

To build the frontend and backend for production:

```bash
npm run build
npm run start
```

## Useful commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build production assets: `npm run build`
- Run production server: `npm run start`
- TypeScript check: `npm run lint`

## Notes

- The backend serves built frontend files from `dist/` in production.
- `.env` is excluded from git; use `.env.example` as a template.
- If `npx` is unavailable in your shell, use the provided npm scripts instead.
