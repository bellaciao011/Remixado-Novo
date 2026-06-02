import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '@/contexts/CartContext';
import { useCreatePaymentIntent, useGetCheckoutConfig } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, Lock } from 'lucide-react';

function PaymentForm({ amountTotal }: { amountTotal: number }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/pedido/confirmado`,
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
          : `${t('checkout.proceedToPayment')} — ${formatPrice(amountTotal)}`}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { items, totalPrice } = useCart();
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amountTotal, setAmountTotal] = useState<number>(0);

  const { data: configData } = useGetCheckoutConfig();

  const createPaymentIntent = useCreatePaymentIntent();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

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

  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="container max-w-3xl px-4">
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
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
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

          {/* Stripe Elements Payment Form */}
          {stripePromise && clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm amountTotal={amountTotal} />
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
