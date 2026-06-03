import React, { useEffect, useRef, useState } from 'react';
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
import { CheckCircle2, User, MapPin, CreditCard, Package, Truck, Zap } from 'lucide-react';

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
    <div className="min-h-[70vh] bg-background py-12 md:py-20">
      <div className="container max-w-3xl px-4 mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tight mb-4">
            {t('checkout.confirmed')}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('checkout.thankYou')}
          </p>
          {customerEmail && (
            <p className="text-foreground font-medium mt-2">
              {t('checkout.receiptSent')} <span className="font-bold">{customerEmail}</span>
            </p>
          )}
        </div>

        <div className="space-y-5">

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

          {/* Consolidated Order Summary — updates as upsells are purchased */}
          <Card className="shadow-sm border-primary/10">
            <CardHeader className="border-b bg-muted/20 py-4">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Package className="h-5 w-5 text-primary" />
                {t('checkout.orderDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-3 mb-5">
                {/* Original order items */}
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
                          <img src={img} alt={name} className="h-full w-full object-cover" />
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

                {/* Upsell items added after confirmation */}
                {upsellPurchases.map((u, idx) => (
                  <div key={`upsell-${idx}`} className="flex items-center gap-4 py-3 border-b last:border-0">
                    {u.image && (
                      <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img src={u.image} alt={u.name} className="h-full w-full object-cover" />
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

              <div className="space-y-2 pt-2">
                {hasSavings && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t('checkout.originalTotal')}</span>
                    <span className="line-through">{formatPrice(totalOriginal)}</span>
                  </div>
                )}
                {hasSavings && (
                  <div className="flex justify-between text-sm text-[#e00] font-semibold">
                    <span>{t('checkout.youSave')}</span>
                    <span>- {formatPrice(savings)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 px-4 bg-primary/5 rounded-xl border border-primary/10 mt-2">
                  <span className="text-lg font-bold uppercase">{t('labels.total')}</span>
                  <span className="text-2xl font-black text-primary">
                    {formatPrice(upsellPurchases.length > 0 ? cumulativeTotal : (storedItems.length > 0 ? totalPaid : data.amountTotal))}
                  </span>
                </div>
                {upsellPurchases.length > 0 && (
                  <p className="text-xs text-center text-muted-foreground pt-1">
                    {t('upsell.cumulativeTotal')}
                  </p>
                )}
              </div>
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

          {/* One-Click Upsell Section */}
          {showUpsell && upsellProducts.length > 0 && (
            <div className="mt-8">
              <div className="text-center mb-6">
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest mb-3"
                  style={{ background: '#FFD600', color: '#1a1a1a' }}
                >
                  <Zap className="h-4 w-4" />
                  {t('upsell.badge')}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tight">
                  {t('upsell.sectionTitle')}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upsellProducts.map(product => {
                  const state = upsellStates[product.id] || 'idle';
                  const purchasedNow = state === 'success';
                  const alreadyOwned = ownedProductIds.has(product.id);
                  const isOwned = purchasedNow || alreadyOwned;
                  const loading = state === 'loading';
                  const errored = state === 'error';
                  const upsellPrice = product.price * 0.5 / 100;
                  const originalPrice = product.price / 100;
                  const name = getProductName(product);

                  return (
                    <div
                      key={product.id}
                      className="rounded-xl border overflow-hidden shadow-sm transition-colors"
                      style={{
                        borderColor: isOwned ? '#22c55e' : '#e5e7eb',
                        background: isOwned ? 'rgba(34,197,94,0.04)' : undefined,
                      }}
                    >
                      {product.images[0] && (
                        <div className="h-40 w-full overflow-hidden bg-muted">
                          <img
                            src={product.images[0]}
                            alt={name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}

                      <div className="p-4">
                        <span
                          className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded mb-2"
                          style={{ background: '#e00', color: '#fff' }}
                        >
                          -50%
                        </span>

                        <p className="font-bold text-sm leading-snug mb-3">{name}</p>

                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(originalPrice)}
                          </span>
                          <span className="text-xl font-black text-primary">
                            {formatPrice(upsellPrice)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => !isOwned && !loading && handleUpsellPurchase(product)}
                          disabled={isOwned || loading}
                          className="w-full h-11 rounded-md font-bold text-sm uppercase tracking-wider transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          style={
                            isOwned
                              ? { background: '#22c55e', color: '#fff', border: '1.5px solid #22c55e' }
                              : loading
                              ? { background: '#f5f5f5', color: '#999', border: '1.5px solid #e5e7eb' }
                              : errored
                              ? { background: '#fee2e2', color: '#dc2626', border: '1.5px solid #fca5a5' }
                              : { background: '#FFD600', color: '#1a1a1a', border: '1.5px solid #FFD600' }
                          }
                        >
                          {isOwned ? (
                            <><CheckCircle2 className="h-4 w-4" />{alreadyOwned && !purchasedNow ? t('upsell.alreadyOwned') : t('upsell.boughtButton')}</>
                          ) : loading ? (
                            t('upsell.buyingButton')
                          ) : errored ? (
                            t('upsell.errorMessage')
                          ) : (
                            t('upsell.buyButton')
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/produtos">{t('buttons.backToStore')}</Link>
          </Button>
        </div>

      </div>
    </div>
  );
}
