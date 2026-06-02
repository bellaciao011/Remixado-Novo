import React, { useEffect, useRef } from 'react';
import { useSearch } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useVerifyCheckoutSession, getVerifyCheckoutSessionQueryKey } from '@workspace/api-client-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function OrderConfirmation() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const sessionId = searchParams.get('session_id');
  const { t } = useTranslation();
  const { clearCart } = useCart();
  const clearedRef = useRef(false);

  const { data: session, isLoading, isError } = useVerifyCheckoutSession(
    { session_id: sessionId || '' },
    { 
      query: { 
        enabled: !!sessionId,
        queryKey: getVerifyCheckoutSessionQueryKey({ session_id: sessionId || '' })
      } 
    }
  );

  useEffect(() => {
    if (session?.status === 'complete' && !clearedRef.current) {
      clearCart();
      clearedRef.current = true;
    }
  }, [session?.status, clearCart]);

  if (!sessionId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Sessão Inválida</h1>
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

  if (isError || session?.status !== 'complete') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <p className="text-destructive font-bold text-xl mb-4">Erro ao verificar o pedido.</p>
        <p className="text-muted-foreground mb-8">Não foi possível confirmar o pagamento desta sessão.</p>
        <Button asChild>
          <Link href="/produtos">{t('buttons.backToStore')}</Link>
        </Button>
      </div>
    );
  }

  const formatPrice = (amount: number | null, currency: string | null) => {
    if (amount === null) return '';
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: (currency || 'BRL').toUpperCase() 
    }).format(amount / 100);
  };

  return (
    <div className="min-h-[70vh] bg-background py-12 md:py-20">
      <div className="container max-w-3xl px-4">
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
          {session.customerEmail && (
            <p className="text-foreground font-medium mt-2">
              Um recibo foi enviado para: <span className="font-bold">{session.customerEmail}</span>
            </p>
          )}
        </div>

        <Card className="shadow-lg border-primary/20">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-2xl font-bold text-center">
              {t('checkout.orderDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 mb-8">
              {session.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b last:border-0">
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-lg">{item.name}</p>
                    <p className="text-muted-foreground text-sm">Quant: {item.quantity}</p>
                  </div>
                  <div className="font-black text-lg">
                    {formatPrice(item.amount, session.currency)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center py-4 px-6 bg-primary/5 rounded-xl border border-primary/10">
              <span className="text-xl font-bold uppercase">{t('labels.total')}</span>
              <span className="text-3xl font-black text-primary">
                {formatPrice(session.amountTotal, session.currency)}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <Button size="lg" asChild className="h-14 px-8 text-lg font-bold shadow-xl bg-primary hover:bg-primary/90">
            <Link href="/">
              {t('buttons.backToStore')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
