import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart, CartItem } from '@/contexts/CartContext';
import { useCreatePaymentIntent, useGetCheckoutConfig } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, Lock } from 'lucide-react';

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
  phoneNumber: string;
}

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

function PaymentForm({ amountTotal, shipping }: { amountTotal: number; shipping: ShippingData }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatPrice = (val: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const required: (keyof ShippingData)[] = [
      'email', 'firstName', 'lastName', 'streetAddress', 'country', 'city', 'postCode', 'phoneNumber',
    ];
    for (const field of required) {
      if (!shipping[field]?.trim()) {
        setErrorMessage(t('checkout.shippingRequired'));
        return;
      }
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/pedido/confirmado`,
        receipt_email: shipping.email,
        shipping: {
          name: `${shipping.firstName} ${shipping.lastName}`,
          phone: shipping.phoneNumber,
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
      setErrorMessage(error.message || t('general.error'));
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

      {errorMessage && (
        <p className="text-destructive font-medium text-sm">{errorMessage}</p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full h-14 text-lg font-bold shadow-xl"
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing
          ? t('general.loading')
          : `${t('checkout.proceedToPayment')} — ${formatPrice(amountTotal / 100)}`}
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
  const [shipping, setShipping] = useState<ShippingData>({
    email: '',
    firstName: '',
    lastName: '',
    streetAddress: '',
    country: 'DE',
    county: '',
    city: '',
    postCode: '',
    phoneNumber: '',
  });

  const { data: configData } = useGetCheckoutConfig();
  const createPaymentIntent = useCreatePaymentIntent();

  const formatPrice = (val: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);

  const handleShipping = (field: keyof ShippingData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setShipping(prev => ({ ...prev, [field]: e.target.value }));

  useEffect(() => {
    if (configData?.publishableKey) {
      setStripePromise(loadStripe(configData.publishableKey));
    }
  }, [configData?.publishableKey]);

  useEffect(() => {
    if (items.length > 0) {
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
          },
        }
      );
    }
  }, []);

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

  const inputClass =
    'w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring';
  const labelClass = 'block text-sm font-semibold mb-1';
  const requiredMark = <span className="text-destructive ml-0.5">*</span>;

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
                    <div className="font-bold text-primary">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold uppercase">{t('labels.total')}</span>
                  <span className="text-2xl font-black text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-bold uppercase tracking-wide">
                {t('checkout.shippingAddress')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Email */}
              <div>
                <label className={labelClass}>
                  {t('checkout.emailAddress')}{requiredMark}
                </label>
                <input
                  type="email"
                  className={inputClass}
                  value={shipping.email}
                  onChange={handleShipping('email')}
                />
                <p className="text-xs text-muted-foreground mt-1">{t('checkout.emailNote')}</p>
              </div>

              {/* First + Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('checkout.firstName')}{requiredMark}</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={shipping.firstName}
                    onChange={handleShipping('firstName')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('checkout.lastName')}{requiredMark}</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={shipping.lastName}
                    onChange={handleShipping('lastName')}
                  />
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className={labelClass}>{t('checkout.streetAddress')}{requiredMark}</label>
                <input
                  type="text"
                  className={inputClass}
                  value={shipping.streetAddress}
                  onChange={handleShipping('streetAddress')}
                />
              </div>

              {/* Country */}
              <div>
                <label className={labelClass}>{t('checkout.country')}{requiredMark}</label>
                <select
                  className={inputClass}
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
                <label className={labelClass}>{t('checkout.county')}</label>
                <input
                  type="text"
                  className={inputClass}
                  value={shipping.county}
                  onChange={handleShipping('county')}
                />
              </div>

              {/* City + Post Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('checkout.city')}{requiredMark}</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={shipping.city}
                    onChange={handleShipping('city')}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('checkout.postCode')}{requiredMark}</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={shipping.postCode}
                    onChange={handleShipping('postCode')}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className={labelClass}>{t('checkout.phoneNumber')}{requiredMark}</label>
                <input
                  type="tel"
                  className={inputClass}
                  value={shipping.phoneNumber}
                  onChange={handleShipping('phoneNumber')}
                />
                <p className="text-xs text-muted-foreground mt-1">{t('checkout.phoneNote')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Stripe Elements Payment Form */}
          {stripePromise && clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm amountTotal={amountTotal} shipping={shipping} />
            </Elements>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <span className="ml-3 text-muted-foreground">{t('general.loading')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
