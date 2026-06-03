import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart, CartItem } from '@/contexts/CartContext';
import { useCreatePaymentIntent, useGetCheckoutConfig } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, Lock, AlertCircle, Check, Pencil } from 'lucide-react';

const getItemName = (item: CartItem, lang: string): string => {
  if (item.translations) {
    return item.translations[lang]?.name
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
  invalidFields: Set<ShippingField>;
  onShippingInvalid: (fields: Set<ShippingField>) => void;
  shippingCardRef: React.RefObject<HTMLDivElement>;
}

function PaymentForm({ shipping, items }: PaymentFormProps) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setStripeError(null);

    try {
      sessionStorage.setItem('panini_order_items', JSON.stringify(items.map(item => ({
        name: item.name,
        translations: item.translations,
        quantity: item.quantity,
        price: item.price,
        originalPrice: item.originalPrice,
        currency: item.currency,
        image: item.image,
      }))));
      sessionStorage.setItem('panini_order_shipping', JSON.stringify(shipping));
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
      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-bold">{t('checkout.paymentDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <PaymentElement />
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>{t('checkout.securePayment')}</span>
      </div>

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
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amountTotal, setAmountTotal] = useState<number>(0);
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [isProceedingToPayment, setIsProceedingToPayment] = useState(false);
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
    setIsProceedingToPayment(true);

    createPaymentIntent.mutate(
      {
        data: {
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      {
        onSuccess: (data) => {
          setClientSecret(data.clientSecret);
          setAmountTotal(data.amountTotal);
          setStep('payment');
          setIsProceedingToPayment(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        onError: () => {
          setIsProceedingToPayment(false);
        },
      }
    );
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
              </div>
              <div className="mt-6 pt-4 border-t space-y-2">
                {(() => {
                  const totalOriginal = items.reduce((sum, item) =>
                    sum + ((item.originalPrice ?? item.price) * item.quantity), 0);
                  const savings = totalOriginal - totalPrice;
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
                          <span className="text-2xl font-black text-primary">{formatPrice(totalPrice)}</span>
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

          {/* Shipping Address */}
          <Card className="shadow-sm" ref={shippingCardRef as React.RefObject<HTMLDivElement>}>
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
            <CardContent className="p-6">

              {/* In payment step, show read-only summary */}
              {step === 'payment' ? (
                <div className="text-sm text-foreground space-y-1">
                  <p className="font-semibold">{shipping.firstName} {shipping.lastName}</p>
                  <p className="text-muted-foreground">{shipping.email}</p>
                  <p className="text-muted-foreground">{shipping.streetAddress}</p>
                  <p className="text-muted-foreground">
                    {shipping.city}{shipping.postCode ? `, ${shipping.postCode}` : ''}{shipping.county ? ` — ${shipping.county}` : ''}
                  </p>
                  <p className="text-muted-foreground">{countryName}</p>
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>

          {/* Stripe Elements — only shown after shipping is validated */}
          {step === 'payment' && stripePromise && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                amountTotal={amountTotal}
                shipping={shipping}
                items={items}
                invalidFields={invalidFields}
                onShippingInvalid={setInvalidFields}
                shippingCardRef={shippingCardRef as React.RefObject<HTMLDivElement>}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
