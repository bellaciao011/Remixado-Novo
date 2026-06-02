import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { useCreateCheckoutSession } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, ShieldCheck, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const { items, totalPrice } = useCart();
  const createCheckout = useCreateCheckoutSession();
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const handleProceedToPayment = () => {
    setError(null);
    createCheckout.mutate(
      {
        data: {
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            name: item.name,
          })),
          successUrl: `${window.location.origin}/pedido/confirmado?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout`,
          locale: i18n.language,
        }
      },
      {
        onSuccess: (data) => {
          if (data.url) {
            window.location.href = data.url;
          }
        },
        onError: (err: any) => {
          setError(err?.message || t('general.error'));
        }
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

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>{t('checkout.securePayment')}</span>
          </div>

          {error && (
            <p className="text-destructive font-medium text-sm">{error}</p>
          )}

          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold shadow-xl"
            onClick={handleProceedToPayment}
            disabled={createCheckout.isPending}
          >
            <ShieldCheck className="mr-2 h-5 w-5" />
            {createCheckout.isPending ? t('general.loading') : t('checkout.proceedToPayment')}
          </Button>
        </div>
      </div>
    </div>
  );
}
