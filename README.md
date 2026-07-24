# Trip Planner (trip-planner.co)

AI-powered travel planning — natural-language itineraries with maps, weather, budget, chat refinement, sharing, and collaboration.

**Live:** [https://trip-planner.co](https://trip-planner.co)  
**Repo:** [brandonlacoste9-tech/aivoyage](https://github.com/brandonlacoste9-tech/aivoyage)

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase Auth + Postgres + RLS
- xAI Grok (primary AI) via Vercel AI SDK
- Mapbox, WeatherAPI, Stripe (optional)
- Netlify hosting

## Local development

```bash
git clone https://github.com/brandonlacoste9-tech/aivoyage.git
cd aivoyage
npm install
cp .env.example .env.local
# fill Supabase + XAI keys
npm run dev
```

## Production env (Netlify)

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://trip-planner.co` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable / anon key |
| `XAI_API_KEY` | Grok API key |
| `WEATHER_API_KEY` | WeatherAPI.com |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public token |
| `MAPBOX_ACCESS_TOKEN` | Same or secret Mapbox token |

## Supabase Auth URLs

Set Site URL and redirects to:

- `https://trip-planner.co`
- `https://trip-planner.co/**`
- `http://localhost:3000/**` (local)

## License

See [LICENSE](./LICENSE).
