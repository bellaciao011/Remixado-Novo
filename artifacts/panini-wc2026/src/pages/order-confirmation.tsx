import React, { useEffect, useRef, useState } from 'react';
import { fbq, utmifyEvent, gtagEvent, sendCapiEvent } from '@/lib/tracking';
import { useSearch } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import {
  useVerifyCheckoutSession,
  getVerifyCheckoutSessionQueryKey,
  useVerifyPaymentIntent,
  getVerifyPaymentIntentQueryKey,
  useListProducts,
} from '@workspace/api-client-react';
import type { Product } from '@workspace/api-client-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, User, MapPin, CreditCard, Package, Truck, Zap, ShoppingBag, RefreshCw } from 'lucide-react';

const CARD_BRAND_LABELS: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
  diners: 'Diners Club',
  jcb: 'JCB',
  unionpay: 'UnionPay',
};

interface UpsellPurchase {
  productId: string;
  name: string;
  price: number;
  image: string;
}

type UpsellState = 'idle' | 'loading' | 'success' | 'error';

export default function OrderConfirmation() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const sessionId = searchParams.get('session_id');
  const paymentIntentId = searchParams.get('payment_intent');
  const { t, i18n } = useTranslation();
  const { clearCart } = useCart();
  const clearedRef = useRef(false);

  const [upsellStates, setUpsellStates] = useState<Record<string, UpsellState>>({});
  const [upsellPurchases, setUpsellPurchases] = useState<UpsellPurchase[]>([]);
  const [countdown, setCountdown] = useState(7 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const { data: sessionData, isLoading: sessionLoading, isError: sessionError } = useVerifyCheckoutSession(
    { session_id: sessionId || '' },
    {
      query: {
        enabled: !!sessionId,
        queryKey: getVerifyCheckoutSessionQueryKey({ session_id: sessionId || '' }),
      },
    }
  );

  const { data: paymentData, isLoading: paymentLoading, isError: paymentError } = useVerifyPaymentIntent(
    { payment_intent_id: paymentIntentId || '' },
    {
      query: {
        enabled: !!paymentIntentId,
        queryKey: getVerifyPaymentIntentQueryKey({ payment_intent_id: paymentIntentId || '' }),
      },
    }
  );

  const { data: allProducts } = useListProducts();

  const data = sessionData || paymentData;
  const isLoading = sessionLoading || paymentLoading;
  const isError = (!sessionId && !paymentIntentId) ? false : (sessionId ? sessionError : paymentError);

  const storedItems: Array<{
    name: string;
    translations?: Record<string, { name: string }>;
    quantity: number;
    price: number;
    originalPrice?: number;
    image?: string;
  }> = (() => {
    try {
      const raw = sessionStorage.getItem('panini_order_items');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  })();

  const storedShipping: {
    email?: string;
    firstName?: string;
    lastName?: string;
    streetAddress?: string;
    country?: string;
    county?: string;
    city?: string;
    postCode?: string;
  } | null = (() => {
    try {
      const raw = sessionStorage.getItem('panini_order_shipping');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  const ownedProductIds: Set<string> = (() => {
    try {
      const raw = sessionStorage.getItem('panini_order_product_ids');
      const arr: string[] = raw ? JSON.parse(raw) : [];
      return new Set(arr);
    } catch { return new Set(); }
  })();

  useEffect(() => {
    if (data?.status === 'complete' && !clearedRef.current) {
      clearCart();
      clearedRef.current = true;

      const orderValue = data.amountTotal ?? 0;
      const contentIds = storedItems.map(i => i.name).filter(Boolean);
      const numItems = storedItems.reduce((s, i) => s + i.quantity, 0);
      const paymentIntentRef = (data as any).paymentIntentId || paymentIntentId || '';
      const eventId = `purchase_${paymentIntentRef || Date.now()}`;

      // UTMify — Purchase (with retry if pixel not yet loaded)
      try {
        utmifyEvent('Purchase', { value: orderValue, currency: 'EUR' });
      } catch { /* ignore */ }

      // Google Analytics — purchase event
      try {
        // @ts-ignore
        window.dataLayer = window.dataLayer || [];
        // @ts-ignore
        window.dataLayer.push({
          event: 'purchase',
          ecommerce: { transaction_id: paymentIntentRef, value: orderValue, currency: 'EUR' },
        });
        gtagEvent('purchase', {
          transaction_id: paymentIntentRef,
          value: orderValue,
          currency: 'EUR',
          items: storedItems.map(i => ({
            item_name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
        });
      } catch { /* ignore */ }

      // Facebook Pixel — Purchase (event_id for deduplication with CAPI)
      try {
        fbq('Purchase', {
          value: orderValue,
          currency: 'EUR',
          content_ids: contentIds,
          num_items: numItems || 1,
          eventID: eventId,
        });
      } catch { /* ignore */ }

      // Facebook CAPI — server-side Purchase (deduplicates with Pixel via event_id)
      const email = (data as any).customerEmail || storedShipping?.email || null;
      const firstName = storedShipping?.firstName || null;
      const lastName = storedShipping?.lastName || null;
      const country = storedShipping?.country || (data as any).shipping?.address?.country || null;
      sendCapiEvent('Purchase', {
        email,
        firstName,
        lastName,
        country,
        value: orderValue,
        currency: 'EUR',
        contentIds,
        numItems: numItems || 1,
        eventSourceUrl: window.location.href,
        eventId,
      });
    }
  }, [data?.status, clearCart]);

  const formatPrice = (amount: number | null) => {
    if (amount === null || amount === undefined) return '';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getItemName = (item: typeof storedItems[0]) => {
    if (item.translations) {
      return item.translations[i18n.language]?.name
        || item.translations['pt-BR']?.name
        || item.name;
    }
    return item.name;
  };

  const getProductName = (product: Product) => {
    const lang = i18n.language as keyof typeof product.translations;
    return product.translations[lang]?.name
      || product.translations['pt-BR']?.name
      || product.translations['en']?.name
      || '';
  };

  const handleUpsellPurchase = async (product: Product) => {
    const extData = paymentData as any;
    const customerId = extData?.stripeCustomerId;
    const pmId = extData?.paymentMethodId;
    if (!customerId || !pmId) return;

    setUpsellStates(prev => ({ ...prev, [product.id]: 'loading' }));

    try {
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/checkout/upsell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, paymentMethodId: pmId, productId: product.id }),
      });

      if (!res.ok) throw new Error('payment_failed');

      const name = getProductName(product);
      const upsellPrice = product.price * 0.5 / 100;

      setUpsellStates(prev => ({ ...prev, [product.id]: 'success' }));
      setUpsellPurchases(prev => [
        ...prev,
        { productId: product.id, name, price: upsellPrice, image: product.images[0] || '' },
      ]);
    } catch {
      setUpsellStates(prev => ({ ...prev, [product.id]: 'error' }));
    }
  };

  if (!sessionId && !paymentIntentId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">{t('checkout.invalidSession')}</h1>
        <Button asChild>
          <Link href="/produtos">{t('buttons.backToStore')}</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-muted rounded-full mb-4" />
          <div className="h-6 bg-muted rounded w-48 mb-2" />
          <div className="h-4 bg-muted rounded w-32" />
        </div>
      </div>
    );
  }

  if (isError || !data || data.status !== 'complete') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <p className="text-destructive font-bold text-xl mb-4">{t('checkout.verifyError')}</p>
        <p className="text-muted-foreground mb-8">{t('checkout.verifyErrorDetail')}</p>
        <Button asChild>
          <Link href="/produtos">{t('buttons.backToStore')}</Link>
        </Button>
      </div>
    );
  }

  const apiData = data as typeof data & {
    shipping?: {
      name?: string;
      address?: {
        line1?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
      };
    } | null;
    paymentMethod?: { brand: string; last4: string } | null;
    stripeCustomerId?: string | null;
    paymentMethodId?: string | null;
  };

  const customerEmail = apiData.customerEmail || storedShipping?.email || null;
  const shippingName = apiData.shipping?.name || (storedShipping ? `${storedShipping.firstName || ''} ${storedShipping.lastName || ''}`.trim() : null);
  const shippingAddress = apiData.shipping?.address || (storedShipping ? {
    line1: storedShipping.streetAddress,
    city: storedShipping.city,
    state: storedShipping.county,
    postal_code: storedShipping.postCode,
    country: storedShipping.country,
  } : null);
  const paymentMethod = apiData.paymentMethod || null;

  const upsellCustomerId = paymentIntentId ? (apiData.stripeCustomerId || null) : null;
  const upsellPaymentMethodId = paymentIntentId ? (apiData.paymentMethodId || null) : null;

  const displayItems = storedItems.length > 0 ? storedItems : (data.items || []);

  const totalOriginal = storedItems.reduce((sum, item) =>
    sum + ((item.originalPrice ?? item.price) * item.quantity), 0);
  const totalPaid = storedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const savings = totalOriginal - totalPaid;
  const hasSavings = savings > 0.001 && storedItems.length > 0;

  const upsellProducts = (allProducts || []).filter(p => p.inStock);

  const showUpsell = !!(upsellCustomerId && upsellPaymentMethodId);
  const cumulativeTotal = totalPaid + upsellPurchases.reduce((sum, u) => sum + u.price, 0);

  return (
    <div className="min-h-[70vh] bg-background pb-16">

      {/* ── Confirmed header ── */}
      <div className="bg-white border-b py-6 md:py-10 px-4 text-center">
        <div className="mx-auto w-14 h-14 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mb-3 md:mb-5">
          <CheckCircle2 className="h-7 w-7 md:h-10 md:w-10 text-green-600" />
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-primary uppercase tracking-tight mb-2 md:mb-3">
          {t('checkout.confirmed')}
        </h1>
        <p className="text-sm md:text-lg text-muted-foreground leading-snug">{t('checkout.thankYou')}</p>
        {customerEmail && (
          <p className="text-xs md:text-sm text-muted-foreground mt-1.5 md:mt-2">
            {t('checkout.receiptSent')}{' '}
            <span className="font-bold text-foreground break-all">{customerEmail}</span>
          </p>
        )}
      </div>

      {/* ── One-Click Upsell — positioned first, right after confirmation ── */}
      {showUpsell && upsellProducts.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg,#0a1628 0%,#1a2e50 100%)' }} className="py-8 px-4">
          <div className="max-w-3xl mx-auto">

            {/* Section header */}
            <div className="text-center mb-6">
              <div
                className="inline-flex flex-col items-center rounded-2xl px-8 py-3 mb-4"
                style={{ background: '#FFD600', color: '#1a1a1a' }}
              >
                <span className="font-mono text-4xl font-black tabular-nums leading-none tracking-tight">
                  {formatCountdown(countdown)}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest mt-1.5 opacity-80">
                  {t('upsell.badge')}
                </span>
              </div>
              <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight leading-tight px-2">
                {t('upsell.sectionTitle')}
              </h2>
            </div>

            {/* Product grid — 3 columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {upsellProducts.map(product => {
                const state = upsellStates[product.id] || 'idle';
                const purchasedNow = state === 'success';
                const alreadyOwned = ownedProductIds.has(product.id);
                const loading = state === 'loading';
                const errored = state === 'error';
                const msrp = product.originalPrice ? product.originalPrice / 100 : null;
                const sitePrice = product.price / 100;
                const upsellPrice = product.price * 0.5 / 100;
                const discountVsMsrp = msrp ? Math.round((1 - upsellPrice / msrp) * 100) : 50;
                const name = getProductName(product);

                return (
                  <div
                    key={product.id}
                    className="rounded-xl overflow-hidden shadow-lg flex flex-col"
                    style={{
                      background: '#fff',
                      border: purchasedNow ? '2px solid #22c55e' : alreadyOwned ? '2px solid #3b82f6' : '2px solid rgba(255,214,0,0.4)',
                    }}
                  >
                    {/* Image */}
                    <div className="relative bg-gray-50" style={{ height: '130px' }}>
                      {product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={name}
                          className="w-full h-full object-contain p-2"
                        />
                      )}
                      {/* Discount badge */}
                      <span
                        className="absolute top-1.5 left-1.5 text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded shadow"
                        style={{ background: '#cc0000', color: '#fff' }}
                      >
                        -{discountVsMsrp}%
                      </span>
                      {/* Status badge */}
                      {purchasedNow && (
                        <span className="absolute top-1.5 right-1.5 text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ background: '#22c55e', color: '#fff' }}>
                          <CheckCircle2 className="h-2.5 w-2.5" />{t('upsell.boughtButton')}
                        </span>
                      )}
                      {alreadyOwned && !purchasedNow && (
                        <span className="absolute top-1.5 right-1.5 text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ background: '#3b82f6', color: '#fff' }}>
                          <CheckCircle2 className="h-2.5 w-2.5" />{t('upsell.alreadyOwned')}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-2.5 flex flex-col flex-1">
                      <p className="font-bold text-[11px] leading-snug mb-2 line-clamp-2">{name}</p>

                      {/* Three-tier pricing */}
                      <div className="space-y-0.5 mb-2.5">
                        {msrp && (
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-gray-400 uppercase tracking-wide">{t('upsell.priceOriginal')}</span>
                            <span className="text-[10px] text-gray-400 line-through">{formatPrice(msrp)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-gray-400 uppercase tracking-wide">{t('upsell.priceSite')}</span>
                          <span className="text-[10px] text-gray-500 line-through">{formatPrice(sitePrice)}</span>
                        </div>
                        <div
                          className="flex items-center justify-between px-2 py-1 rounded-md mt-1"
                          style={{ background: '#fff9e6', border: '1px solid #FFD600' }}
                        >
                          <span className="text-[9px] font-black uppercase tracking-wide" style={{ color: '#b45309' }}>{t('upsell.priceExclusive')}</span>
                          <span className="text-sm font-black" style={{ color: '#b45309' }}>{formatPrice(upsellPrice)}</span>
                        </div>
                      </div>

                      {/* CTA */}
                      {purchasedNow ? (
                        <div
                          className="w-full h-8 rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1"
                          style={{ background: '#22c55e', color: '#fff' }}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {t('upsell.boughtButton')}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => !loading && handleUpsellPurchase(product)}
                          disabled={loading}
                          className="w-full h-8 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                          style={
                            loading
                              ? { background: '#f5f5f5', color: '#999' }
                              : errored
                              ? { background: '#fee2e2', color: '#dc2626' }
                              : { background: '#FFD600', color: '#1a1a1a' }
                          }
                        >
                          {loading ? t('upsell.buyingButton')
                            : errored ? t('upsell.errorMessage')
                            : alreadyOwned ? <><RefreshCw className="h-3 w-3" />{t('upsell.buyAgainButton')}</>
                            : <><ShoppingBag className="h-3 w-3" />{t('upsell.buyButton')}</>
                          }
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* ── Order details, buyer info, delivery ── */}
      <div className="container max-w-3xl px-4 mx-auto pt-8 space-y-5">

        {/* Buyer Info */}
        <Card className="shadow-sm border-primary/10">
          <CardHeader className="border-b bg-muted/20 py-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <User className="h-5 w-5 text-primary" />
              {t('checkout.buyerInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shippingName && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('checkout.firstName')} & {t('checkout.lastName')}</p>
                  <p className="font-semibold">{shippingName}</p>
                </div>
              )}
              {customerEmail && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('checkout.emailAddress')}</p>
                  <p className="font-semibold break-all">{customerEmail}</p>
                </div>
              )}
            </div>

            {shippingAddress && (
              <div className="pt-3 border-t">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {t('checkout.shippingAddress')}
                </p>
                <div className="text-sm space-y-0.5 text-foreground">
                  {shippingAddress.line1 && <p>{shippingAddress.line1}</p>}
                  <p>
                    {[shippingAddress.city, shippingAddress.postal_code].filter(Boolean).join(', ')}
                    {shippingAddress.state ? ` — ${shippingAddress.state}` : ''}
                  </p>
                  {shippingAddress.country && <p className="font-medium">{shippingAddress.country}</p>}
                </div>
              </div>
            )}

            {paymentMethod && (
              <div className="pt-3 border-t">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  {t('checkout.paymentMethodLabel')}
                </p>
                <p className="text-sm font-semibold">
                  {CARD_BRAND_LABELS[paymentMethod.brand] || paymentMethod.brand} &mdash; {t('checkout.cardEndingIn')} <span className="font-mono font-bold">•••• {paymentMethod.last4}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consolidated Order Summary */}
        <Card className="shadow-sm border-primary/10">
          <CardHeader className="border-b bg-muted/20 py-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Package className="h-5 w-5 text-primary" />
              {t('checkout.orderDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3 mb-5">
              {displayItems.map((item, idx) => {
                const name = 'translations' in item ? getItemName(item as typeof storedItems[0]) : (item as any).name;
                const itemPrice = 'price' in item ? (item as typeof storedItems[0]).price : (item as any).amount;
                const qty = item.quantity;
                const origPrice = 'originalPrice' in item ? (item as typeof storedItems[0]).originalPrice : undefined;
                const img = 'image' in item ? (item as typeof storedItems[0]).image : undefined;
                return (
                  <div key={idx} className="flex items-center gap-4 py-3 border-b">
                    {img && (
                      <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img src={img} alt={name} className="h-full w-full object-contain p-1" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm leading-snug">{name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t('checkout.quantity')}: {qty}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {origPrice && origPrice > itemPrice && (
                        <p className="text-[11px] text-muted-foreground line-through leading-none">
                          {formatPrice(origPrice * qty)}
                        </p>
                      )}
                      <p className="font-bold text-primary text-sm">{formatPrice(itemPrice * qty)}</p>
                    </div>
                  </div>
                );
              })}

              {upsellPurchases.map((u, idx) => (
                <div key={`upsell-${idx}`} className="flex items-center gap-4 py-3 border-b last:border-0">
                  {u.image && (
                    <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={u.image} alt={u.name} className="h-full w-full object-contain p-1" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-snug">{u.name}</p>
                    <p className="text-xs font-semibold" style={{ color: '#16a34a' }}>-50%</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-primary text-sm">{formatPrice(u.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            {hasSavings && (
              <div className="mt-4 rounded-xl overflow-hidden border border-gray-200">
                <div className="flex justify-between items-center px-4 py-2.5 bg-gray-50">
                  <span className="text-sm text-muted-foreground">{t('checkout.originalTotal')}</span>
                  <span className="text-sm text-muted-foreground line-through">{formatPrice(totalOriginal)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-2.5 bg-green-50 border-t border-green-100">
                  <span className="text-sm font-bold text-green-700">{t('checkout.youSave')}</span>
                  <span className="text-base font-black text-green-700">- {formatPrice(savings)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-3.5 bg-primary" style={{ background: 'hsl(var(--primary))' }}>
                  <span className="text-base font-black text-primary-foreground uppercase tracking-wide">{t('labels.total')}</span>
                  <span className="text-2xl font-black text-primary-foreground">
                    {formatPrice(upsellPurchases.length > 0 ? cumulativeTotal : totalPaid)}
                  </span>
                </div>
              </div>
            )}
            {!hasSavings && (
              <div className="mt-4 flex justify-between items-center px-4 py-3.5 rounded-xl bg-primary/5 border border-primary/10">
                <span className="text-lg font-bold uppercase">{t('labels.total')}</span>
                <span className="text-2xl font-black text-primary">
                  {formatPrice(upsellPurchases.length > 0 ? cumulativeTotal : (storedItems.length > 0 ? totalPaid : data.amountTotal))}
                </span>
              </div>
            )}
            {upsellPurchases.length > 0 && (
              <p className="text-xs text-center text-muted-foreground pt-2">
                {t('upsell.cumulativeTotal')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Delivery Info */}
        <Card className="shadow-sm border-primary/10">
          <CardHeader className="border-b bg-muted/20 py-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Truck className="h-5 w-5 text-primary" />
              {t('checkout.deliveryInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-muted-foreground">{t('checkout.estimatedDelivery')}</span>
              <span className="font-bold text-foreground">{t('checkout.deliveryTime')}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed border-t pt-3">
              {t('checkout.trackingNote')}
            </p>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
