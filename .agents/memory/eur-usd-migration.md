---
name: EUR→USD migration
description: Full funnel currency conversion from EUR to USD for US market, with locale-aware tracking page for old French customers.
---

## Rule
All Stripe PaymentIntents, productData prices, FB Pixel events, UTMify events, and email templates use USD. Legacy EUR orders in Stripe will still format correctly via backward-compat fallbacks (`cur === 'EUR' ? 'fr-FR' : 'en-US'`).

**Why:** Store pivoted from French/EUR market to US/USD. Old FR customers still receive correct locale (FR) via `?locale=fr` URL param in tracking email links.

## How to apply
- `productData.ts`: prices stored in centavos (USD cents), `currency: 'usd'`
- All Stripe PI creates: `currency: 'usd'`
- All FB Pixel / UTMify events: `currency: 'USD'`
- UTMify webhook: converts USD→BRL via Stripe balance_transaction (L1) → exchange_rate (L2) → er-api.com/v6/latest/USD (L3)
- `checkout.ts` default PI locale metadata: `'en'` (was `'de'`)
- Email tracking URL: `?codigo=...&locale=${locale}` — old FR customers who click get `?locale=fr` → rastreio.tsx shows French
- `rastreio.tsx`: reads `?locale=` param, `resolveLocale()` returns Locale, renders bilingual content (EN/FR/DE/ES)
- `resolveLocale` in templates.ts: `'en'` → returns `'en'` correctly; fallback `'pt-BR'` only for legacy no-locale orders
- Format helpers keep EUR branch: `cur === 'USD' ? 'en-US' : cur === 'EUR' ? 'fr-FR' : 'en-US'`
