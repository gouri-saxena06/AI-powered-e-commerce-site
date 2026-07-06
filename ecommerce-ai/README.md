# Marketflow — AI-Powered E-Commerce App

Full-stack e-commerce app: **React + Vite + Tailwind** frontend, **Node/Express + PostgreSQL** backend,
**Stripe Checkout** for payments, and a **Gemini-powered AI shopping assistant** (plus an AI product-description
writer in the admin dashboard).

## What's included

- Email/password auth with JWT (the first account you register becomes an admin automatically)
- Product catalog with search/category filters, product detail pages
- Cart (persisted in localStorage) → Stripe Checkout → order history
- AI shopping assistant chat widget (bottom-right ✦ button) grounded in your real product catalog
- Admin dashboard: create/edit/delete products, AI-generate product descriptions, view all orders
- Stripe webhook to mark orders "paid"

## 1. Prerequisites

- Node.js 18+
- PostgreSQL (or Docker, see below)
- A [Stripe](https://dashboard.stripe.com/apikeys) test secret key
- A [Google AI Studio](https://aistudio.google.com/app/apikey) Gemini API key

## 2. Database

Easiest path — use the included Docker Compose file:

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` with database `ecommerce_ai` (user/pass `postgres`/`postgres`).

If you'd rather use an existing Postgres install, just create a database named `ecommerce_ai` and update
`DATABASE_URL` in `backend/.env` accordingly.

Then create the tables:

```bash
cd backend
psql "$DATABASE_URL" -f schema.sql
```

(Or open `schema.sql` and run it with any Postgres GUI, e.g. TablePlus/pgAdmin.)

## 3. Backend setup

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in:

- `DATABASE_URL` — leave as-is if you used Docker Compose above
- `JWT_SECRET` — any long random string
- `STRIPE_SECRET_KEY` — your Stripe test secret key (starts with `sk_test_`)
- `STRIPE_WEBHOOK_SECRET` — see step 5 below (optional to start)
- `GEMINI_API_KEY` — your Gemini API key
- `GEMINI_MODEL` — defaults to `gemini-2.5-flash`; change if you want a different model
- `CLIENT_URL` — leave as `http://localhost:5173`

Install and run:

```bash
npm install
npm run seed    # adds 6 demo products, optional but recommended
npm run dev     # starts the API on http://localhost:5000
```

## 4. Frontend setup

In a new terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev     # starts the app on http://localhost:5173
```

Open **http://localhost:5173**. Register an account (it becomes admin automatically since it's the first
one), then visit **/admin** to manage products, or just start shopping.

## 5. Stripe webhook (optional, for automatic "paid" status)

Without a webhook, orders stay `pending` in the database even after a successful Stripe payment (the
success page will still show "Payment successful" since Stripe already charged the card — this only
affects the status field in your admin dashboard).

To wire it up locally with the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:5000/api/checkout/webhook
```

Copy the `whsec_...` value it prints into `STRIPE_WEBHOOK_SECRET` in `backend/.env` and restart the backend.

## 6. Testing payments

Use Stripe's test card: `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.

## Project structure

```
backend/
  src/
    config/db.js          Postgres connection pool
    controllers/           auth, products, checkout (Stripe), ai (Gemini)
    middleware/auth.js      JWT verification + admin guard
    routes/                 route definitions
    server.js                Express app entry point
    seed.js                   demo product seeder
  schema.sql                 database schema

frontend/
  src/
    api/client.js            axios instance with auth header
    context/                  AuthContext, CartContext
    components/                Navbar, ProductCard, AIAssistantWidget
    pages/                      Home, ProductDetail, Cart, Login, Register,
                                 OrderSuccess, MyOrders, AdminDashboard
```

## Notes on the AI assistant

The `/api/ai/assistant` endpoint pulls your current product catalog (id, name, price, category, stock,
description) into the model's context on every request, and is explicitly instructed not to invent
products that aren't in your database. This means recommendations always reflect real inventory — add or
remove products in the admin dashboard and the assistant's knowledge updates immediately, no retraining
or re-indexing needed.

## Troubleshooting

- **"Failed to create checkout session"** — check `STRIPE_SECRET_KEY` is set and valid.
- **AI assistant says it's unavailable** — check `GEMINI_API_KEY` and that `GEMINI_MODEL` is a model your
  key has access to.
- **CORS errors** — make sure `CLIENT_URL` in `backend/.env` matches the URL you're loading the frontend
  from (default `http://localhost:5173`).
