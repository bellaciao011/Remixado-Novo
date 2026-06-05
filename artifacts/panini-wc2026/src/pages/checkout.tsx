import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { utmifyEvent, fbq } from '@/lib/tracking';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart, CartItem } from '@/contexts/CartContext';
import { useCreatePaymentIntent, useGetCheckoutConfig } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, AlertCircle, Check, Pencil, Tag } from 'lucide-react';

const ORDER_BUMP = {
  id: 'order-bump-50packs',
  price: 2500,
  originalPrice: 5000,
  image: '/assets/figurinhas_1780497538703.webp',
  translations: {
    'pt-BR': {
      name: 'Caixa com 50 Envelopes – 350 Figurinhas Oficiais',
      shortDescription: '50 envelopes × 7 figurinhas = 350 figurinhas oficiais FIFA World Cup 2026™',
    },
    'en': {
      name: 'Box with 50 Packs – 350 Official Stickers',
      shortDescription: '50 packs × 7 stickers = 350 official FIFA World Cup 2026™ stickers',
    },
    'es': {
      name: 'Caja con 50 Sobres – 350 Cromos Oficiales',
      shortDescription: '50 sobres × 7 cromos = 350 cromos oficiales Copa Mundial FIFA 2026™',
    },
    'de': {
      name: 'Box mit 50 Tüten – 350 offizielle Sticker',
      shortDescription: '50 Tüten × 7 Sticker = 350 offizielle FIFA World Cup 2026™ Sticker',
    },
    'fr': {
      name: 'Boite avec 50 Pochettes – 350 Stickers Officiels',
      shortDescription: '50 pochettes × 7 stickers = 350 stickers officiels FIFA World Cup 2026™',
    },
    'it': {
      name: 'Scatola con 50 Bustine – 350 Figurine Ufficiali',
      shortDescription: '50 bustine × 7 figurine = 350 figurine ufficiali FIFA World Cup 2026™',
    },
  } as Record<string, { name: string; shortDescription: string }>,
};

const ORDER_BUMP_2 = {
  id: 'order-bump-100packs',
  price: 4700,
  originalPrice: 9400,
  image: '/assets/figurinhas_1780497538703.webp',
  translations: {
    'pt-BR': {
      name: 'Caixa com 100 Envelopes – 700 Figurinhas Oficiais',
      shortDescription: '100 envelopes × 7 figurinhas = 700 figurinhas oficiais FIFA World Cup 2026™',
    },
    'en': {
      name: 'Box with 100 Packs – 700 Official Stickers',
      shortDescription: '100 packs × 7 stickers = 700 official FIFA World Cup 2026™ stickers',
    },
    'es': {
      name: 'Caja con 100 Sobres – 700 Cromos Oficiales',
      shortDescription: '100 sobres × 7 cromos = 700 cromos oficiales Copa Mundial FIFA 2026™',
    },
    'de': {
      name: 'Box mit 100 Tüten – 700 offizielle Sticker',
      shortDescription: '100 Tüten × 7 Sticker = 700 offizielle FIFA World Cup 2026™ Sticker',
    },
    'fr': {
      name: 'Boite avec 100 Pochettes – 700 Stickers Officiels',
      shortDescription: '100 pochettes × 7 stickers = 700 stickers officiels FIFA World Cup 2026™',
    },
    'it': {
      name: 'Scatola con 100 Bustine – 700 Figurine Ufficiali',
      shortDescription: '100 bustine × 7 figurine = 700 figurine ufficiali FIFA World Cup 2026™',
    },
  } as Record<string, { name: string; shortDescription: string }>,
};

const getItemName = (item: CartItem, lang: string): string => {
  if (item.translations) {
    return item.translations[lang]?.name
      || item.translations['en']?.name
      || item.translations['pt-BR']?.name
      || item.name;
  }
  return item.name;
};

interface ShippingData {
  email: string;
  firstName: string;
  lastName: string;
  streetAddress: string;
  country: string;
  county: string;
  city: string;
  postCode: string;
}

type ShippingField = keyof ShippingData;

const REQUIRED_FIELDS: ShippingField[] = [
  'email', 'firstName', 'lastName', 'streetAddress', 'country', 'city', 'postCode',
];

const FIELD_LABEL_KEY: Record<ShippingField, string> = {
  email: 'checkout.emailAddress',
  firstName: 'checkout.firstName',
  lastName: 'checkout.lastName',
  streetAddress: 'checkout.streetAddress',
  country: 'checkout.country',
  county: 'checkout.county',
  city: 'checkout.city',
  postCode: 'checkout.postCode',
};

const COUNTRIES = [
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CA', name: 'Canada' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'MX', name: 'Mexico' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO', name: 'Norway' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
];

interface PaymentFormProps {
  amountTotal: number;
  shipping: ShippingData;
  items: CartItem[];
  orderBump1Selected: boolean;
  orderBump2Selected: boolean;
  paymentIntentId: string;
}

function PaymentForm({ amountTotal, shipping, items, orderBump1Selected, orderBump2Selected, paymentIntentId }: PaymentFormProps) {
  const { t, i18n } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    if (elements) {
      elements.fetchUpdates().catch(() => {});
    }
  }, [amountTotal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setStripeError(null);

    try {
      const baseOrderItems = items.map(item => ({
        name: item.name,
        translations: item.translations,
        quantity: item.quantity,
        price: item.price,
        originalPrice: item.originalPrice,
        currency: item.currency,
        image: item.image,
      }));
      const allOrderItems = [
        ...baseOrderItems,
        ...(orderBump2Selected ? [{
          name: ORDER_BUMP_2.translations[i18n.language]?.name || ORDER_BUMP_2.translations['en']?.name || ORDER_BUMP_2.translations['pt-BR'].name,
          translations: ORDER_BUMP_2.translations,
          quantity: 1,
          price: ORDER_BUMP_2.price / 100,
          originalPrice: ORDER_BUMP_2.originalPrice / 100,
          currency: 'eur',
          image: ORDER_BUMP_2.image,
        }] : []),
        ...(orderBump1Selected ? [{
          name: ORDER_BUMP.translations[i18n.language]?.name || ORDER_BUMP.translations['en']?.name || ORDER_BUMP.translations['pt-BR'].name,
          translations: ORDER_BUMP.translations,
          quantity: 1,
          price: ORDER_BUMP.price / 100,
          originalPrice: ORDER_BUMP.originalPrice / 100,
          currency: 'eur',
          image: ORDER_BUMP.image,
        }] : []),
      ];
      sessionStorage.setItem('panini_order_items', JSON.stringify(allOrderItems));
      sessionStorage.setItem('panini_order_shipping', JSON.stringify(shipping));
      sessionStorage.setItem('panini_order_bump', JSON.stringify(orderBump1Selected));
      if (paymentIntentId) {
        sessionStorage.setItem('panini_payment_intent_id', paymentIntentId);
      }
    } catch {}

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/pedido/confirmado`,
        receipt_email: shipping.email,
        shipping: {
          name: `${shipping.firstName} ${shipping.lastName}`,
          address: {
            line1: shipping.streetAddress,
            city: shipping.city,
            state: shipping.county || undefined,
            postal_code: shipping.postCode,
            country: shipping.country,
          },
        },
      },
    });

    if (error) {
      setStripeError(error.message || t('general.error'));
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      navigate(`/pedido/confirmado?payment_intent=${paymentIntent.id}`);
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ terms: { card: 'never', applePay: 'never', googlePay: 'never', paypal: 'never' } }} />

      {stripeError && (
        <div className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-destructive">{stripeError}</p>
        </div>
      )}

      <style>{`
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .btn-pulse { animation: pulse-scale 2s ease-in-out infinite; }
      `}</style>
      <Button
        type="submit"
        size="lg"
        className="w-full h-14 text-lg font-bold shadow-xl btn-pulse"
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing ? t('general.loading') : t('checkout.proceedToPayment')}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const { items, totalPrice } = useCart();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [amountTotal, setAmountTotal] = useState<number>(0);
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [isProceedingToPayment, setIsProceedingToPayment] = useState(false);
  const [proceedError, setProceedError] = useState<string | null>(null);
  const [orderBump1Selected, setOrderBump1Selected] = useState(false);
  const [orderBump2Selected, setOrderBump2Selected] = useState(false);
  const [isUpdatingBump1, setIsUpdatingBump1] = useState(false);
  const [isUpdatingBump2, setIsUpdatingBump2] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<string>('DE');
  const [shipping, setShipping] = useState<ShippingData>({
    email: '',
    firstName: '',
    lastName: '',
    streetAddress: '',
    country: 'DE',
    county: '',
    city: '',
    postCode: '',
  });
  const [invalidFields, setInvalidFields] = useState<Set<ShippingField>>(new Set());
  const shippingCardRef = useRef<HTMLDivElement>(null);

  const { data: configData } = useGetCheckoutConfig();
  const createPaymentIntent = useCreatePaymentIntent();

  useEffect(() => {
    const SUPPORTED = new Set(COUNTRIES.map(c => c.code));
    fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) })
      .then(r => r.json())
      .then((data: any) => {
        const code: string = (data?.country_code || '').toUpperCase();
        const resolved = SUPPORTED.has(code) ? code : 'DE';
        setDetectedCountry(resolved);
        setShipping(prev => ({ ...prev, country: resolved }));
      })
      .catch(() => {});
  }, []);

  const formatPrice = (val: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);

  const handleShipping = (field: ShippingField) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setShipping(prev => ({ ...prev, [field]: e.target.value }));
      if (invalidFields.has(field)) {
        setInvalidFields(prev => { const s = new Set(prev); s.delete(field); return s; });
      }
    };

  useEffect(() => {
    if (configData?.publishableKey) {
      setStripePromise(loadStripe(configData.publishableKey));
    }
  }, [configData?.publishableKey]);

  const handleProceedToPayment = () => {
    const missing = new Set(
      REQUIRED_FIELDS.filter(f => !shipping[f]?.trim())
    ) as Set<ShippingField>;

    if (missing.size > 0) {
      setInvalidFields(missing);
      shippingCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setInvalidFields(new Set());
    setProceedError(null);
    setIsProceedingToPayment(true);

    // Read UTM parameters stored by UTMify's utms.js
    // Primary source: window.utmParams (live URLSearchParams object)
    // Fallback: localStorage (utms.js persists them for 7 days)
    const getUtm = (key: string): string | null => {
      try {
        const fromWindow = (window as any).utmParams?.get?.(key);
        if (fromWindow && fromWindow !== 'null') return fromWindow;
        const fromStorage = localStorage.getItem(key);
        if (fromStorage && fromStorage !== 'null' && fromStorage !== '') return fromStorage;
      } catch { /* ignore */ }
      return null;
    };

    createPaymentIntent.mutate(
      {
        data: {
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          email: shipping.email,
          firstName: shipping.firstName,
          lastName: shipping.lastName,
          locale: i18n.language,
          utmSource: getUtm('utm_source'),
          utmMedium: getUtm('utm_medium'),
          utmCampaign: getUtm('utm_campaign'),
          utmContent: getUtm('utm_content'),
          utmTerm: getUtm('utm_term'),
        } as any,
      },
      {
        onSuccess: (data) => {
          setClientSecret(data.clientSecret);
          setAmountTotal(data.amountTotal);
          setPaymentIntentId(data.paymentIntentId || '');
          setOrderBump1Selected(false);
          setOrderBump2Selected(false);
          setStep('payment');
          setIsProceedingToPayment(false);
          setProceedError(null);
          sessionStorage.setItem('panini_order_product_ids', JSON.stringify(items.map(i => i.productId)));
          window.scrollTo({ top: 0, behavior: 'smooth' });
          const icValue = data.amountTotal;
          const icContentIds = items.map(i => i.productId);
          const icNumItems = items.reduce((s, i) => s + i.quantity, 0);
          try { utmifyEvent('InitiateCheckout', { value: icValue, currency: 'EUR', content_ids: icContentIds, num_items: icNumItems }); } catch { /* non-fatal */ }
          try { fbq('InitiateCheckout', { value: icValue, currency: 'EUR', content_ids: icContentIds, num_items: icNumItems }); } catch { /* non-fatal */ }
        },
        onError: (err: any) => {
          setIsProceedingToPayment(false);
          const apiMsg: string = err?.data?.error || err?.message || '';
          if (/email/i.test(apiMsg)) {
            setInvalidFields(prev => { const s = new Set(prev); s.add('email'); return s; });
            setProceedError(t('checkout.errorInvalidEmail'));
            shippingCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else if (/out of stock/i.test(apiMsg)) {
            setProceedError(t('checkout.errorOutOfStock'));
          } else if (/product/i.test(apiMsg)) {
            setProceedError(t('checkout.errorProduct'));
          } else {
            setProceedError(t('checkout.paymentError'));
          }
        },
      }
    );
  };

  const handleToggleBump1 = async () => {
    if (!paymentIntentId || isUpdatingBump1 || isUpdatingBump2) return;
    const next1 = !orderBump1Selected;
    setIsUpdatingBump1(true);
    try {
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/checkout/payment-intent/${paymentIntentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addOrderBump1: next1, addOrderBump2: orderBump2Selected }),
      });
      if (res.ok) {
        const data = await res.json();
        setAmountTotal(data.amountTotal);
        setOrderBump1Selected(next1);
      }
    } catch {}
    setIsUpdatingBump1(false);
  };

  const handleToggleBump2 = async () => {
    if (!paymentIntentId || isUpdatingBump1 || isUpdatingBump2) return;
    const next2 = !orderBump2Selected;
    setIsUpdatingBump2(true);
    try {
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/checkout/payment-intent/${paymentIntentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addOrderBump1: orderBump1Selected, addOrderBump2: next2 }),
      });
      if (res.ok) {
        const data = await res.json();
        setAmountTotal(data.amountTotal);
        setOrderBump2Selected(next2);
      }
    } catch {}
    setIsUpdatingBump2(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('cart.empty')}</h2>
        <Button asChild className="mt-4">
          <Link href="/produtos">{t('buttons.continueShopping')}</Link>
        </Button>
      </div>
    );
  }

  const inputClass = (field?: ShippingField) => {
    const isInvalid = field && invalidFields.has(field);
    return [
      'w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2',
      isInvalid
        ? 'border-destructive focus:ring-destructive/30'
        : 'border-input focus:ring-ring',
    ].join(' ');
  };

  const labelClass = (field?: ShippingField) => {
    const isInvalid = field && invalidFields.has(field);
    return `block text-sm font-semibold mb-1 ${isInvalid ? 'text-destructive' : ''}`;
  };

  const requiredMark = <span className="text-destructive ml-0.5">*</span>;
  const countryName = COUNTRIES.find(c => c.code === shipping.country)?.name || shipping.country;

  const effectiveTotal = step === 'payment' ? amountTotal : totalPrice;

  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="container max-w-3xl px-4 mx-auto">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 -ml-2 text-muted-foreground">
            <Link href="/produtos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('buttons.continueShopping')}
            </Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-black text-primary uppercase tracking-tight">
            {t('nav.checkout')}
          </h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex items-center gap-2 text-sm font-semibold ${step === 'shipping' ? 'text-primary' : 'text-muted-foreground'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'payment' ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground'}`}>
              {step === 'payment' ? <Check className="h-3 w-3" /> : '1'}
            </span>
            {t('checkout.shippingAddress')}
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={`flex items-center gap-2 text-sm font-semibold ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border'}`}>
              2
            </span>
            {t('checkout.paymentDetails')}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Order Summary */}
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-bold">{t('checkout.orderDetails')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 py-3 border-b last:border-0">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={item.image} alt={getItemName(item, i18n.language)} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{getItemName(item, i18n.language)}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('checkout.quantity')}: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      {item.originalPrice && item.originalPrice > item.price && (
                        <p className="text-[12px] text-[#999] line-through leading-none">
                          {formatPrice(item.originalPrice * item.quantity)}
                        </p>
                      )}
                      <p className="font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}

                {step === 'payment' && orderBump2Selected && (
                  <div className="flex items-center gap-4 py-3 border-b last:border-0">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={ORDER_BUMP_2.image} alt={ORDER_BUMP_2.translations[i18n.language]?.name || ORDER_BUMP_2.translations['pt-BR'].name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{ORDER_BUMP_2.translations[i18n.language]?.name || ORDER_BUMP_2.translations['pt-BR'].name}</p>
                      <p className="text-sm text-muted-foreground">{t('checkout.quantity')}: 1</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] text-[#999] line-through leading-none">
                        {formatPrice(ORDER_BUMP_2.originalPrice / 100)}
                      </p>
                      <p className="font-bold text-primary">{formatPrice(ORDER_BUMP_2.price / 100)}</p>
                    </div>
                  </div>
                )}
                {step === 'payment' && orderBump1Selected && (
                  <div className="flex items-center gap-4 py-3 border-b last:border-0">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={ORDER_BUMP.image} alt={ORDER_BUMP.translations[i18n.language]?.name || ORDER_BUMP.translations['pt-BR'].name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{ORDER_BUMP.translations[i18n.language]?.name || ORDER_BUMP.translations['pt-BR'].name}</p>
                      <p className="text-sm text-muted-foreground">{t('checkout.quantity')}: 1</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] text-[#999] line-through leading-none">
                        {formatPrice(ORDER_BUMP.originalPrice / 100)}
                      </p>
                      <p className="font-bold text-primary">{formatPrice(ORDER_BUMP.price / 100)}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 pt-4 border-t space-y-2">
                {(() => {
                  const totalOriginal = items.reduce((sum, item) =>
                    sum + ((item.originalPrice ?? item.price) * item.quantity), 0)
                    + (step === 'payment' && orderBump2Selected ? ORDER_BUMP_2.originalPrice / 100 : 0)
                    + (step === 'payment' && orderBump1Selected ? ORDER_BUMP.originalPrice / 100 : 0);
                  const savings = totalOriginal - effectiveTotal;
                  const hasDiscount = savings > 0.001;
                  return (
                    <>
                      {hasDiscount && (
                        <div className="flex justify-between items-center text-[#999]">
                          <span className="text-sm">{t('checkout.originalTotal')}</span>
                          <span className="text-base line-through">{formatPrice(totalOriginal)}</span>
                        </div>
                      )}
                      {hasDiscount && (
                        <div className="flex justify-between items-center text-[#e00]">
                          <span className="text-sm font-semibold">{t('checkout.youSave')}</span>
                          <span className="text-base font-bold">- {formatPrice(savings)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-xl font-bold uppercase">{t('labels.total')}</span>
                        <div className="text-right">
                          <span className="text-2xl font-black text-primary">{formatPrice(effectiveTotal)}</span>
                          {hasDiscount && (
                            <span className="block text-[11px] font-bold text-[#e00] uppercase tracking-wide">
                              {Math.round(savings / totalOriginal * 100)}% {t('checkout.offLabel')}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address — accordion collapse */}
          <Card className="shadow-sm overflow-hidden" ref={shippingCardRef as React.RefObject<HTMLDivElement>}>
            <CardHeader className="border-b flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">
                {t('checkout.shippingAddress')}
              </CardTitle>
              {step === 'payment' && (
                <button
                  onClick={() => setStep('shipping')}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t('checkout.editShipping')}
                </button>
              )}
            </CardHeader>

            {/* Collapsed summary */}
            <div
              style={{
                maxHeight: step === 'payment' ? '200px' : '0px',
                opacity: step === 'payment' ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-height 320ms ease, opacity 280ms ease',
              }}
            >
              <CardContent className="px-6 py-5">
                <div className="text-sm text-foreground space-y-0.5">
                  <p className="font-semibold">{shipping.firstName} {shipping.lastName}</p>
                  <p className="text-muted-foreground">{shipping.email}</p>
                  <p className="text-muted-foreground">{shipping.streetAddress}</p>
                  <p className="text-muted-foreground">
                    {shipping.city}{shipping.postCode ? `, ${shipping.postCode}` : ''}{shipping.county ? ` — ${shipping.county}` : ''}
                  </p>
                  <p className="text-muted-foreground">{countryName}</p>
                </div>
              </CardContent>
            </div>

            {/* Full form */}
            <div
              style={{
                maxHeight: step === 'shipping' ? '1200px' : '0px',
                opacity: step === 'shipping' ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-height 350ms ease, opacity 300ms ease',
              }}
            >
              <CardContent className="p-6">
                <div className="space-y-5">
                  {/* Validation alert */}
                  {invalidFields.size > 0 && (
                    <div className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-destructive">
                          {t('checkout.fillRequiredFields')}
                        </p>
                        <ul className="mt-2 text-sm text-destructive/90 space-y-1 list-disc list-inside">
                          {REQUIRED_FIELDS.filter(f => invalidFields.has(f)).map(field => (
                            <li key={field}>{t(FIELD_LABEL_KEY[field])}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className={labelClass('email')}>
                      {t('checkout.emailAddress')}{requiredMark}
                    </label>
                    <input
                      type="email"
                      className={inputClass('email')}
                      value={shipping.email}
                      onChange={handleShipping('email')}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{t('checkout.emailNote')}</p>
                  </div>

                  {/* First + Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass('firstName')}>{t('checkout.firstName')}{requiredMark}</label>
                      <input
                        type="text"
                        className={inputClass('firstName')}
                        value={shipping.firstName}
                        onChange={handleShipping('firstName')}
                      />
                    </div>
                    <div>
                      <label className={labelClass('lastName')}>{t('checkout.lastName')}{requiredMark}</label>
                      <input
                        type="text"
                        className={inputClass('lastName')}
                        value={shipping.lastName}
                        onChange={handleShipping('lastName')}
                      />
                    </div>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className={labelClass('streetAddress')}>{t('checkout.streetAddress')}{requiredMark}</label>
                    <input
                      type="text"
                      className={inputClass('streetAddress')}
                      value={shipping.streetAddress}
                      onChange={handleShipping('streetAddress')}
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className={labelClass('country')}>{t('checkout.country')}{requiredMark}</label>
                    <select
                      className={inputClass('country')}
                      value={shipping.country}
                      onChange={handleShipping('country')}
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* County (optional) */}
                  <div>
                    <label className={labelClass()}>{t('checkout.county')}</label>
                    <input
                      type="text"
                      className={inputClass()}
                      value={shipping.county}
                      onChange={handleShipping('county')}
                    />
                  </div>

                  {/* City + Post Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass('city')}>{t('checkout.city')}{requiredMark}</label>
                      <input
                        type="text"
                        className={inputClass('city')}
                        value={shipping.city}
                        onChange={handleShipping('city')}
                      />
                    </div>
                    <div>
                      <label className={labelClass('postCode')}>{t('checkout.postCode')}{requiredMark}</label>
                      <input
                        type="text"
                        className={inputClass('postCode')}
                        value={shipping.postCode}
                        onChange={handleShipping('postCode')}
                      />
                    </div>
                  </div>

                  {/* Proceed button */}
                  <style>{`
                    @keyframes pulse-scale {
                      0%, 100% { transform: scale(1); }
                      50% { transform: scale(1.03); }
                    }
                    .btn-pulse { animation: pulse-scale 2s ease-in-out infinite; }
                  `}</style>
                  {proceedError && (
                    <div className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-destructive">{proceedError}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    disabled={isProceedingToPayment}
                    className="btn-pulse w-full h-14 text-[15px] font-bold uppercase tracking-widest shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:animation-none"
                    style={{ backgroundColor: '#FFD600', color: '#1a1a1a' }}
                  >
                    {isProceedingToPayment ? t('general.loading') : t('checkout.continueToPayment')}
                  </button>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Order Bump 2 (100 packs) — shown first, only after shipping step */}
          {step === 'payment' && (
            <Card
              className="shadow-sm overflow-hidden border-2"
              style={{
                borderColor: orderBump2Selected ? '#FFD600' : '#e5e7eb',
                background: orderBump2Selected ? 'rgba(255,214,0,0.04)' : undefined,
                transition: 'border-color 250ms ease, background 250ms ease',
              }}
            >
              <CardContent className="p-0">
                <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ background: '#FFD600' }}>
                  <Tag className="h-4 w-4 text-[#1a1a1a]" />
                  <span className="text-sm font-black uppercase tracking-widest text-[#1a1a1a]">
                    {t('orderBump.exclusiveOffer')}
                  </span>
                </div>
                <div className="flex gap-4 p-5">
                  <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={ORDER_BUMP_2.image}
                      alt={ORDER_BUMP_2.translations[i18n.language]?.name || ORDER_BUMP_2.translations['pt-BR'].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className="inline-block text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded mb-1"
                      style={{ background: '#e00', color: '#fff' }}
                    >
                      {t('orderBump.badge')}
                    </span>
                    <p className="font-bold text-sm leading-snug mb-1">
                      {ORDER_BUMP_2.translations[i18n.language]?.name || ORDER_BUMP_2.translations['pt-BR'].name}
                    </p>
                    <p className="text-xs text-muted-foreground leading-snug mb-2">
                      {ORDER_BUMP_2.translations[i18n.language]?.shortDescription || ORDER_BUMP_2.translations['pt-BR'].shortDescription}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-[#999] line-through">
                        {formatPrice(ORDER_BUMP_2.originalPrice / 100)}
                      </span>
                      <span className="text-xl font-black text-primary">
                        {formatPrice(ORDER_BUMP_2.price / 100)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  {orderBump2Selected ? (
                    <div
                      className="w-full h-12 rounded-md font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 opacity-60 cursor-default"
                      style={{ background: '#22c55e', color: '#fff', border: '1.5px solid #22c55e' }}
                    >
                      <Check className="h-4 w-4" />
                      {t('orderBump.addedButton')}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleToggleBump2}
                      disabled={isUpdatingBump1 || isUpdatingBump2}
                      className="btn-pulse w-full h-12 rounded-md font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ background: '#FFD600', color: '#1a1a1a', border: '1.5px solid #FFD600' }}
                    >
                      {isUpdatingBump2 ? t('general.loading') : t('orderBump.addButton')}
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Bump 1 (50 packs) — shown second */}
          {step === 'payment' && (
            <Card
              className="shadow-sm overflow-hidden border-2"
              style={{
                borderColor: orderBump1Selected ? '#FFD600' : '#e5e7eb',
                background: orderBump1Selected ? 'rgba(255,214,0,0.04)' : undefined,
                transition: 'border-color 250ms ease, background 250ms ease',
              }}
            >
              <CardContent className="p-0">
                <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ background: '#FFD600' }}>
                  <Tag className="h-4 w-4 text-[#1a1a1a]" />
                  <span className="text-sm font-black uppercase tracking-widest text-[#1a1a1a]">
                    {t('orderBump.exclusiveOffer')}
                  </span>
                </div>
                <div className="flex gap-4 p-5">
                  <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={ORDER_BUMP.image}
                      alt={ORDER_BUMP.translations[i18n.language]?.name || ORDER_BUMP.translations['pt-BR'].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className="inline-block text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded mb-1"
                      style={{ background: '#e00', color: '#fff' }}
                    >
                      {t('orderBump.badge')}
                    </span>
                    <p className="font-bold text-sm leading-snug mb-1">
                      {ORDER_BUMP.translations[i18n.language]?.name || ORDER_BUMP.translations['pt-BR'].name}
                    </p>
                    <p className="text-xs text-muted-foreground leading-snug mb-2">
                      {ORDER_BUMP.translations[i18n.language]?.shortDescription || ORDER_BUMP.translations['pt-BR'].shortDescription}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-[#999] line-through">
                        {formatPrice(ORDER_BUMP.originalPrice / 100)}
                      </span>
                      <span className="text-xl font-black text-primary">
                        {formatPrice(ORDER_BUMP.price / 100)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  {orderBump1Selected ? (
                    <div
                      className="w-full h-12 rounded-md font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 opacity-60 cursor-default"
                      style={{ background: '#22c55e', color: '#fff', border: '1.5px solid #22c55e' }}
                    >
                      <Check className="h-4 w-4" />
                      {t('orderBump.addedButton')}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleToggleBump1}
                      disabled={isUpdatingBump1 || isUpdatingBump2}
                      className="btn-pulse w-full h-12 rounded-md font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ background: '#FFD600', color: '#1a1a1a', border: '1.5px solid #FFD600' }}
                    >
                      {isUpdatingBump1 ? t('general.loading') : t('orderBump.addButton')}
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stripe Elements — only shown after shipping is validated */}
          {step === 'payment' && stripePromise && clientSecret && (
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-xl font-bold">{t('checkout.paymentDetails')}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Elements
                  key={i18n.language}
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    locale: i18n.language as any,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        borderRadius: '8px',
                        fontSizeBase: '14px',
                        colorPrimary: 'hsl(220 70% 30%)',
                      },
                    },
                    defaultValues: {
                      billingDetails: {
                        address: {
                          country: shipping.country || detectedCountry,
                        },
                      },
                    },
                  }}
                >
                  <PaymentForm
                    amountTotal={amountTotal}
                    shipping={shipping}
                    items={items}
                    orderBump1Selected={orderBump1Selected}
                    orderBump2Selected={orderBump2Selected}
                    paymentIntentId={paymentIntentId}
                  />
                </Elements>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
