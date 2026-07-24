# VoyageAI (aivoyage)

AI-powered travel planner — natural-language trip planning with day-by-day itineraries, maps, weather, budget, chat refinement, public sharing, and Stripe billing.

**Repo:** [brandonlacoste9-tech/aivoyage](https://github.com/brandonlacoste9-tech/aivoyage)  
**Deploy:** Netlify

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Supabase** Auth, Postgres, RLS
- **Anthropic Claude** via Vercel AI SDK (mock fallback without key)
- **Mapbox GL JS**, **WeatherAPI.com**, **Stripe**, **Resend** (optional)
- **Netlify** hosting (`@netlify/plugin-nextjs`)

## Local development

```bash
git clone https://github.com/brandonlacoste9-tech/aivoyage.git
cd aivoyage
npm install
cp .env.example .env.local
# fill NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY at minimum
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database

1. Create a Supabase project.
2. Run `supabase/migrations/001_init.sql` in the SQL editor.
3. Enable Email auth in Supabase Authentication settings.

## Netlify deploy

### One-time UI setup

1. [Netlify](https://app.netlify.com) → **Add new site** → **Import an existing project** → GitHub → `brandonlacoste9-tech/aivoyage`
2. Build settings are in `netlify.toml` (`npm run build`, Next.js plugin).
3. Add **environment variables** (Site settings → Environment variables) from `.env.example`.

### Required env vars

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_APP_URL` | Your Netlify URL, e.g. `https://aivoyage.netlify.app` |

### Optional env vars

| Variable | Feature |
|----------|---------|
| `ANTHROPIC_API_KEY` | Real AI itineraries + chat |
| `NEXT_PUBLIC_MAPBOX_TOKEN` / `MAPBOX_ACCESS_TOKEN` | Map |
| `WEATHER_API_KEY` | Weather panel |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_PRO` | Billing |
| `SUPABASE_SERVICE_ROLE_KEY` | Stripe webhook profile updates |
| `RESEND_API_KEY` | Email |

### CLI deploy (optional)

```bash
npm install -g netlify-cli
netlify login
netlify init   # link site
netlify env:set NEXT_PUBLIC_SUPABASE_URL "..."
netlify deploy --build --prod
```

### Stripe webhooks on Netlify

Point Stripe webhook to:

`https://<your-site>.netlify.app/api/stripe/webhook`

Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

### Supabase Auth redirect URLs

In Supabase → Authentication → URL configuration, add:

- Site URL: `https://<your-site>.netlify.app`
- Redirect: `https://<your-site>.netlify.app/**`

## Product routes

| Route | Description |
|-------|-------------|
| `/` | Landing |
| `/pricing` | Free / Pro |
| `/auth/sign-in`, `/auth/sign-up` | Auth |
| `/dashboard` | Home |
| `/trips`, `/trips/new`, `/trips/[id]` | List, wizard, workspace |
| `/share/[token]` | Public itinerary |
| `/billing` | Stripe Checkout + portal |
| `/explore` | Destination chips |
| `/settings` | Profile + integration status |

## Free tier defaults

- 3 AI generations / month  
- 3 active trips  
- Upgrade to Pro via Stripe for unlimited  

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm run start    # serve build
npm run lint     # eslint
```

## License

See [LICENSE](./LICENSE).
