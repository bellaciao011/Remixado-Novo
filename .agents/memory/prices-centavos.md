---
name: Price convention — centavos throughout
description: Prices stored in centavos (integer) in backend, divided by 100 in frontend
---

# Prices in Centavos

## Rule
Store all prices as integers in centavos in `productData.ts` (e.g. R$19,90 → 1990). The frontend divides by 100 to display. The checkout route receives the divided price and multiplies by 100 again for Stripe's `unit_amount`.

**Why:** Stripe requires integer centavos. Having a single convention prevents display bugs (R$0,20 instead of R$19,90) and incorrect Stripe charges.

**How to apply:**
- `productData.ts`: `price: 1990` (not 19.90)
- Frontend `ProductCard.tsx` / `product.tsx`: `const price = product.price / 100`
- `CartContext`: stores price after `/100`; `checkout.ts` does `Math.round(item.price * 100)` for Stripe
