# GeoMancy AI

Traditional Feng Shui audits: a free Form School reading, then a paid Xuan Kong Flying Star chart.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Copy `.env.example` to `.env.local` for local work. In Vercel, set the same names under Project Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `DEEPSEEK_API_KEY`
- `SUPABASE_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

The publishable Supabase key and the DeepSeek key are enough for the free audit. Stripe and the Supabase secret key are required before a payment can unlock a saved chart.

Run `supabase/migrations` in the Supabase SQL editor, in filename order, before signed-in reports can be stored.
