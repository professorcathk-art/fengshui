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

The publishable Supabase key and the DeepSeek key are enough for the free audit. While `STRIPE_SECRET_KEY` is empty, Unlock opens the Flying Star chart without charging so the flow can be tested. After that key is set, the same button starts Stripe Checkout for $19.90.

The site language is English or Traditional Chinese, stored in the `geomancy-locale` cookie. The audit form also has its own choice for the language of the result. Case studies live at `/cases`.

The Supabase secret key is required before a paid chart can be written back onto a saved report.

Run `supabase/migrations` in the Supabase SQL editor, in filename order, before signed-in reports can be stored.
