import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { fbq, utmifyEvent, sendCapiEvent } from '@/lib/tracking';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft, ShoppingCart, AlertCircle, Check, Pencil, Tag,
  Copy, CheckCircle2, Loader2, Building2, CreditCard,
} from 'lucide-react';

const ORDER_BUMP_PRICE = 1350;          // cêntimos (€13.50)
const ORDER_BUMP_ORIGINAL_PRICE = 5400; // cêntimos antes de 75% off

const ORDER_BUMP_PT = {
  image: '/assets/figurinhas_1780497538703.webp',
  name: 'Caixa com 50 Envelopes – 350 Figurinhas Oficiais',
  shortDescription: '50 envelopes × 7 figurinhas = 350 figurinhas oficiais FIFA World Cup 2026™',
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
const REQUIRED_FIELDS: ShippingField[] = ['email', 'firstName', 'lastName', 'streetAddress', 'country', 'city', 'postCode'];

const COUNTRIES = [
  { code: 'PT', name: 'Portugal' },
  { code: 'AT', name: 'Áustria' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'BR', name: 'Brasil' },
  { code: 'HR', name: 'Croácia' },
  { code: 'CY', name: 'Chipre' },
  { code: 'CZ', name: 'República Checa' },
  { code: 'DK', name: 'Dinamarca' },
  { code: 'EE', name: 'Estónia' },
  { code: 'FI', name: 'Finlândia' },
  { code: 'FR', name: 'França' },
  { code: 'DE', name: 'Alemanha' },
  { code: 'GR', name: 'Grécia' },
  { code: 'HU', name: 'Hungria' },
  { code: 'IE', name: 'Irlanda' },
  { code: 'IT', name: 'Itália' },
  { code: 'LV', name: 'Letónia' },
  { code: 'LT', name: 'Lituânia' },
  { code: 'LU', name: 'Luxemburgo' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Países Baixos' },
  { code: 'NO', name: 'Noruega' },
  { code: 'PL', name: 'Polónia' },
  { code: 'RO', name: 'Roménia' },
  { code: 'SK', name: 'Eslováquia' },
  { code: 'SI', name: 'Eslovénia' },
  { code: 'ES', name: 'Espanha' },
  { code: 'SE', name: 'Suécia' },
  { code: 'CH', name: 'Suíça' },
  { code: 'GB', name: 'Reino Unido' },
];

const formatPrice = (val: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val);

interface TransactionData {
  transactionID: string;
  amount: number;
  method: string;
  referenceData?: { entity: string; reference: string; expiresAt: string };
  trackingCode: string;
}

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();

  const [step, setStep] = useState<'shipping' | 'payment' | 'waiting'>('shipping');
  const [shipping, setShipping] = useState<ShippingData>({
    email: '', firstName: '', lastName: '', streetAddress: '',
    country: 'PT', county: '', city: '', postCode: '',
  });
  const [invalidFields, setInvalidFields] = useState<Set<ShippingField>>(new Set());
  const [paymentMethod, setPaymentMethod] = useState<'multibanco' | 'mbway'>('multibanco');
  const [nif, setNif] = useState('');
  const [phone, setPhone] = useState('');
  const [orderBump1Selected, setOrderBump1Selected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shippingCardRef = useRef<HTMLDivElement>(null);
  const orderBumpRef = useRef<HTMLDivElement>(null);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

  // Detecção automática de país
  useEffect(() => {
    const SUPPORTED = new Set(COUNTRIES.map(c => c.code));
    fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) })
      .then(r => r.json())
      .then((data: any) => {
        const code = (data?.country_code || '').toUpperCase();
        if (SUPPORTED.has(code)) setShipping(prev => ({ ...prev, country: code }));
      })
      .catch(() => {});
  }, []);

  const getUtm = (key: string): string | null => {
    try {
      const fromWindow = (window as any).utmParams?.get?.(key);
      if (fromWindow && fromWindow !== 'null') return fromWindow;
      const fromStorage = localStorage.getItem(key);
      if (fromStorage && fromStorage !== 'null' && fromStorage !== '') return fromStorage;
    } catch { /* ignore */ }
    return null;
  };

  const handleShipping = (field: ShippingField) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShipping(prev => ({ ...prev, [field]: e.target.value }));
    if (invalidFields.has(field)) setInvalidFields(prev => { const s = new Set(prev); s.delete(field); return s; });
  };

  const handleProceedToPayment = () => {
    const missing = new Set(REQUIRED_FIELDS.filter(f => !shipping[f]?.trim())) as Set<ShippingField>;
    if (missing.size > 0) {
      setInvalidFields(missing);
      shippingCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setInvalidFields(new Set());
    setStep('payment');
    setTimeout(() => {
      orderBumpRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
    const value = totalPrice;
    const ids = items.map(i => i.productId);
    const num = items.reduce((s, i) => s + i.quantity, 0);
    try { fbq('InitiateCheckout', { value, currency: 'EUR', content_ids: ids, num_items: num }); } catch {}
    try { utmifyEvent('InitiateCheckout', { value, currency: 'EUR' }); } catch {}
    sendCapiEvent('InitiateCheckout', { value, currency: 'EUR', contentIds: ids, numItems: num, eventSourceUrl: window.location.href });
  };

  const handleSubmitPayment = async () => {
    if (paymentMethod === 'mbway' && !phone.trim()) {
      setSubmitError('Por favor, indique o número de telemóvel para MB WAY.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const allItems = [
        ...items.map(item => ({
          name: item.name, translations: item.translations,
          quantity: item.quantity, price: item.price,
          originalPrice: item.originalPrice, currency: item.currency, image: item.image,
        })),
        ...(orderBump1Selected ? [{
          name: ORDER_BUMP_PT.name, translations: {}, quantity: 1,
          price: ORDER_BUMP_PRICE / 100, originalPrice: ORDER_BUMP_ORIGINAL_PRICE / 100,
          currency: 'eur', image: ORDER_BUMP_PT.image,
        }] : []),
      ];
      sessionStorage.setItem('panini_order_items', JSON.stringify(allItems));
      sessionStorage.setItem('panini_order_shipping', JSON.stringify(shipping));
      sessionStorage.setItem('panini_order_bump', JSON.stringify(orderBump1Selected));

      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/waymb/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          email: shipping.email,
          firstName: shipping.firstName,
          lastName: shipping.lastName,
          method: paymentMethod,
          nif: nif.trim() || undefined,
          phone: phone.trim() || undefined,
          addOrderBump: orderBump1Selected,
          locale: 'pt',
          utmSource: getUtm('utm_source'),
          utmMedium: getUtm('utm_medium'),
          utmCampaign: getUtm('utm_campaign'),
          utmContent: getUtm('utm_content'),
          utmTerm: getUtm('utm_term'),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any)?.error || 'Erro ao processar encomenda');
      }

      const data = await res.json() as TransactionData;
      setTransactionData(data);
      if (data.trackingCode) sessionStorage.setItem('panini_tracking_code', data.trackingCode);
      sessionStorage.setItem('panini_transaction_id', data.transactionID);
      setStep('waiting');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao criar encomenda. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckPayment = async () => {
    if (!transactionData?.transactionID || isPolling) return;
    setIsPolling(true);
    setPollingStatus(null);
    try {
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/waymb/transaction-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: transactionData.transactionID }),
      });
      if (!res.ok) throw new Error('Erro ao verificar');
      const info = await res.json() as any;
      setPollingStatus(info.status || 'PENDING');
    } catch {
      setPollingStatus('ERROR');
    } finally {
      setIsPolling(false);
    }
  };

  const handleCopy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  if (items.length === 0 && step !== 'waiting') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">O seu carrinho está vazio</h2>
        <Button asChild className="mt-4"><Link href="/productos">Continuar a comprar</Link></Button>
      </div>
    );
  }

  const inputClass = (field?: ShippingField) => {
    const inv = field && invalidFields.has(field);
    return `w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 ${inv ? 'border-destructive focus:ring-destructive/30' : 'border-input focus:ring-ring'}`;
  };
  const labelClass = (field?: ShippingField) => `block text-sm font-semibold mb-1 ${field && invalidFields.has(field) ? 'text-destructive' : ''}`;
  const requiredMark = <span className="text-destructive ml-0.5">*</span>;
  const countryName = COUNTRIES.find(c => c.code === shipping.country)?.name || shipping.country;
  const bumpEur = orderBump1Selected ? ORDER_BUMP_PRICE / 100 : 0;
  const effectiveTotal = step === 'payment' ? totalPrice + bumpEur : totalPrice;

  // ── ECRÃ DE AGUARDAR PAGAMENTO ──────────────────────────────────────────────
  if (step === 'waiting' && transactionData) {
    const isMultibanco = transactionData.method === 'multibanco';
    const ref = transactionData.referenceData;
    return (
      <div className="min-h-screen bg-background py-12 md:py-20">
        <div className="container max-w-xl px-4 mx-auto space-y-6">
          {isMultibanco ? (
            <>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-black text-primary uppercase tracking-tight">Pagamento por Multibanco</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Dirija-se a qualquer caixa Multibanco ou utilize o seu homebanking para efectuar o pagamento.
                </p>
              </div>

              <Card className="shadow-md border-2 border-blue-100">
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Entidade</p>
                      <p className="text-2xl font-black tracking-widest">{ref?.entity || '—'}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Valor a pagar</p>
                      <p className="text-2xl font-black text-primary">{formatPrice(transactionData.amount)}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Referência</p>
                    <div className="flex items-center gap-3">
                      <p className="text-3xl font-black tracking-widest text-blue-900 flex-1">{ref?.reference || '—'}</p>
                      <button
                        onClick={() => handleCopy(ref?.reference || '')}
                        className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-md transition-colors"
                        style={{ background: copied ? '#22c55e' : '#1d4ed8', color: '#fff' }}
                      >
                        {copied ? <><Check className="h-3.5 w-3.5" /> Copiado</> : <><Copy className="h-3.5 w-3.5" /> Copiar</>}
                      </button>
                    </div>
                  </div>

                  {ref?.expiresAt && (
                    <p className="text-xs text-center text-muted-foreground">
                      Válido até: <strong>{new Date(ref.expiresAt).toLocaleDateString('pt-PT')}</strong>
                    </p>
                  )}
                  <div className="text-center space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Ref. encomenda: <strong className="font-mono">{transactionData.transactionID}</strong>
                    </p>
                    {transactionData.trackingCode && (
                      <p className="text-xs text-muted-foreground">
                        Código de rastreio: <strong className="font-mono">{transactionData.trackingCode}</strong>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
                  <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                </div>
                <h1 className="text-2xl font-black text-primary uppercase tracking-tight">Pagamento por MB WAY</h1>
                <p className="text-muted-foreground mt-2 text-sm">
                  Foi enviada uma notificação para o seu telemóvel.<br />
                  Abra a aplicação <strong>MB WAY</strong> e confirme o pagamento de{' '}
                  <strong>{formatPrice(transactionData.amount)}</strong>.
                </p>
                <div className="mt-4 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Ref. encomenda: <strong className="font-mono">{transactionData.transactionID}</strong>
                  </p>
                  {transactionData.trackingCode && (
                    <p className="text-xs text-muted-foreground">
                      Código de rastreio: <strong className="font-mono">{transactionData.trackingCode}</strong>
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Verificar pagamento */}
          <div className="space-y-3">
            {pollingStatus === 'COMPLETED' && (
              <div className="flex gap-3 rounded-lg border border-green-300 bg-green-50 p-4">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-green-800">Pagamento confirmado!</p>
                  <p className="text-xs text-green-700 mt-0.5">A sua encomenda foi processada. Receberá um email de confirmação em breve.</p>
                </div>
              </div>
            )}
            {pollingStatus === 'DECLINED' && (
              <div className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-destructive">Pagamento recusado. Por favor, tente novamente.</p>
              </div>
            )}
            {pollingStatus === 'PENDING' && (
              <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
                <Loader2 className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5 animate-spin" />
                <p className="text-sm font-medium text-amber-800">Pagamento ainda não confirmado. Por favor, aguarde e tente novamente.</p>
              </div>
            )}
            {pollingStatus === 'ERROR' && (
              <div className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-destructive">Não foi possível verificar o pagamento. Por favor, tente mais tarde.</p>
              </div>
            )}

            {pollingStatus !== 'COMPLETED' && (
              <button
                onClick={handleCheckPayment}
                disabled={isPolling}
                className="w-full h-12 rounded-md font-bold text-sm border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPolling ? <><Loader2 className="h-4 w-4 animate-spin" /> A verificar...</> : 'Já efectuei o pagamento'}
              </button>
            )}
          </div>

          <div className="text-center">
            <Link href="/productos" className="text-sm text-muted-foreground hover:underline">← Voltar à loja</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── CHECKOUT PRINCIPAL ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="container max-w-3xl px-4 mx-auto">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 -ml-2 text-muted-foreground">
            <Link href="/productos"><ArrowLeft className="mr-2 h-4 w-4" />Continuar a comprar</Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-black text-primary uppercase tracking-tight">Finalizar Encomenda</h1>
        </div>

        {/* Indicador de passo */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex items-center gap-2 text-sm font-semibold ${step === 'shipping' ? 'text-primary' : 'text-muted-foreground'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'payment' ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground'}`}>
              {step === 'payment' ? <Check className="h-3 w-3" /> : '1'}
            </span>
            Morada de Envio
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={`flex items-center gap-2 text-sm font-semibold ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border'}`}>2</span>
            Pagamento
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">

          {/* Resumo da encomenda */}
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-bold">Resumo da Encomenda</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.productId} className="flex items-center gap-4 py-3 border-b last:border-0">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={item.image} alt={item.translations?.['pt-BR']?.name || item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.translations?.['pt-BR']?.name || item.name}</p>
                      <p className="text-sm text-muted-foreground">Quantidade: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      {item.originalPrice && item.originalPrice > item.price && (
                        <p className="text-[12px] text-[#999] line-through leading-none">{formatPrice(item.originalPrice * item.quantity)}</p>
                      )}
                      <p className="font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}

                {step === 'payment' && orderBump1Selected && (
                  <div className="flex items-center gap-4 py-3 border-b last:border-0">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={ORDER_BUMP_PT.image} alt={ORDER_BUMP_PT.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{ORDER_BUMP_PT.name}</p>
                      <p className="text-sm text-muted-foreground">Quantidade: 1</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] text-[#999] line-through leading-none">{formatPrice(ORDER_BUMP_ORIGINAL_PRICE / 100)}</p>
                      <p className="font-bold text-primary">{formatPrice(ORDER_BUMP_PRICE / 100)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t space-y-2">
                {(() => {
                  const totalOriginal = items.reduce((s, i) => s + ((i.originalPrice ?? i.price) * i.quantity), 0)
                    + (step === 'payment' && orderBump1Selected ? ORDER_BUMP_ORIGINAL_PRICE / 100 : 0);
                  const savings = totalOriginal - effectiveTotal;
                  const hasDiscount = savings > 0.001;
                  return (
                    <>
                      {hasDiscount && (
                        <div className="flex justify-between items-center text-[#999]">
                          <span className="text-sm">Total original</span>
                          <span className="text-base line-through">{formatPrice(totalOriginal)}</span>
                        </div>
                      )}
                      {hasDiscount && (
                        <div className="flex justify-between items-center text-[#e00]">
                          <span className="text-sm font-semibold">Poupa</span>
                          <span className="text-base font-bold">- {formatPrice(savings)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-xl font-bold uppercase">Total</span>
                        <span className="text-2xl font-black text-primary">{formatPrice(effectiveTotal)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Morada de envio */}
          <Card className="shadow-sm overflow-hidden" ref={shippingCardRef as React.RefObject<HTMLDivElement>}>
            <CardHeader className="border-b flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">Morada de Envio</CardTitle>
              {step === 'payment' && (
                <button onClick={() => setStep('shipping')} className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </button>
              )}
            </CardHeader>

            {/* Resumo colapsado */}
            <div style={{ maxHeight: step === 'payment' ? '200px' : '0px', opacity: step === 'payment' ? 1 : 0, overflow: 'hidden', transition: 'max-height 320ms ease, opacity 280ms ease' }}>
              <CardContent className="px-6 py-5">
                <div className="text-sm text-foreground space-y-0.5">
                  <p className="font-semibold">{shipping.firstName} {shipping.lastName}</p>
                  <p className="text-muted-foreground">{shipping.email}</p>
                  <p className="text-muted-foreground">{shipping.streetAddress}</p>
                  <p className="text-muted-foreground">{shipping.city}{shipping.postCode ? `, ${shipping.postCode}` : ''}{shipping.county ? ` — ${shipping.county}` : ''}</p>
                  <p className="text-muted-foreground">{countryName}</p>
                </div>
              </CardContent>
            </div>

            {/* Formulário completo */}
            <div style={{ maxHeight: step === 'shipping' ? '1400px' : '0px', opacity: step === 'shipping' ? 1 : 0, overflow: 'hidden', transition: 'max-height 350ms ease, opacity 300ms ease' }}>
              <CardContent className="p-6">
                <div className="space-y-5">
                  {invalidFields.size > 0 && (
                    <div className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold text-destructive">Por favor, preencha todos os campos obrigatórios.</p>
                    </div>
                  )}

                  <div>
                    <label className={labelClass('email')}>Email{requiredMark}</label>
                    <input type="email" className={inputClass('email')} value={shipping.email} onChange={handleShipping('email')} />
                    <p className="text-xs text-muted-foreground mt-1">Receberá a confirmação da encomenda neste endereço.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass('firstName')}>Nome{requiredMark}</label>
                      <input type="text" className={inputClass('firstName')} value={shipping.firstName} onChange={handleShipping('firstName')} />
                    </div>
                    <div>
                      <label className={labelClass('lastName')}>Apelido{requiredMark}</label>
                      <input type="text" className={inputClass('lastName')} value={shipping.lastName} onChange={handleShipping('lastName')} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass('streetAddress')}>Morada{requiredMark}</label>
                    <input type="text" className={inputClass('streetAddress')} value={shipping.streetAddress} onChange={handleShipping('streetAddress')} />
                  </div>

                  <div>
                    <label className={labelClass('country')}>País{requiredMark}</label>
                    <select className={inputClass('country')} value={shipping.country} onChange={handleShipping('country')}>
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass()}>Distrito / Região</label>
                    <input type="text" className={inputClass()} value={shipping.county} onChange={handleShipping('county')} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass('city')}>Localidade{requiredMark}</label>
                      <input type="text" className={inputClass('city')} value={shipping.city} onChange={handleShipping('city')} />
                    </div>
                    <div>
                      <label className={labelClass('postCode')}>Código Postal{requiredMark}</label>
                      <input type="text" className={inputClass('postCode')} value={shipping.postCode} onChange={handleShipping('postCode')} />
                    </div>
                  </div>

                  <style>{`@keyframes pulse-scale{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}.btn-pulse{animation:pulse-scale 2s ease-in-out infinite}`}</style>
                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    className="btn-pulse w-full h-14 text-[15px] font-bold uppercase tracking-widest shadow-xl"
                    style={{ backgroundColor: '#FFD600', color: '#1a1a1a' }}
                  >
                    Continuar para Pagamento
                  </button>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Oferta exclusiva (order bump) */}
          {step === 'payment' && (
            <>
              <div ref={orderBumpRef} style={{ scrollMarginTop: '16px' }} />
              <Card className="shadow-sm overflow-hidden border-2" style={{ borderColor: orderBump1Selected ? '#FFD600' : '#e5e7eb', background: orderBump1Selected ? 'rgba(255,214,0,0.04)' : undefined, transition: 'border-color 250ms ease, background 250ms ease' }}>
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ background: '#FFD600' }}>
                    <Tag className="h-4 w-4 text-[#1a1a1a]" />
                    <span className="text-sm font-black uppercase tracking-widest text-[#1a1a1a]">Oferta Exclusiva</span>
                  </div>
                  <div className="flex gap-4 p-5">
                    <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted">
                      <img src={ORDER_BUMP_PT.image} alt={ORDER_BUMP_PT.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-block text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded mb-1" style={{ background: '#e00', color: '#fff' }}>75% Desconto</span>
                      <p className="font-bold text-sm leading-snug mb-1">{ORDER_BUMP_PT.name}</p>
                      <p className="text-xs text-muted-foreground leading-snug mb-2">{ORDER_BUMP_PT.shortDescription}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-[#999] line-through">{formatPrice(ORDER_BUMP_ORIGINAL_PRICE / 100)}</span>
                        <span className="text-xl font-black text-primary">{formatPrice(ORDER_BUMP_PRICE / 100)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    {orderBump1Selected ? (
                      <div className="w-full h-12 rounded-md font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2" style={{ background: '#22c55e', color: '#fff' }}>
                        <Check className="h-4 w-4" /> Adicionado à Encomenda
                      </div>
                    ) : (
                      <button type="button" onClick={() => setOrderBump1Selected(true)} className="btn-pulse w-full h-12 rounded-md font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2" style={{ background: '#FFD600', color: '#1a1a1a', border: '1.5px solid #FFD600' }}>
                        Adicionar à Encomenda
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Método de pagamento */}
          {step === 'payment' && (
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-xl font-bold">Método de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Selector de método */}
                <div className="grid grid-cols-2 gap-3">
                  {(['multibanco', 'mbway'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-lg border-2 font-bold text-sm transition-all ${paymentMethod === m ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
                    >
                      {m === 'multibanco' ? <Building2 className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />}
                      {m === 'multibanco' ? 'Multibanco' : 'MB WAY'}
                    </button>
                  ))}
                </div>

                {/* NIF (opcional) */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    NIF <span className="text-muted-foreground font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Ex: 123456789"
                    value={nif}
                    onChange={e => setNif(e.target.value)}
                    maxLength={9}
                  />
                </div>

                {/* Telemóvel — obrigatório para MB WAY */}
                {paymentMethod === 'mbway' && (
                  <div>
                    <label className="block text-sm font-semibold mb-1">Telemóvel{requiredMark}</label>
                    <input
                      type="tel"
                      className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Ex: +351 912 345 678"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Número associado à sua conta MB WAY.</p>
                  </div>
                )}

                {paymentMethod === 'multibanco' && (
                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800">
                    Após confirmar, receberá os dados de pagamento Multibanco (Entidade, Referência e Valor). Efectue o pagamento em qualquer ATM ou via homebanking.
                  </div>
                )}
                {paymentMethod === 'mbway' && (
                  <div className="rounded-lg bg-green-50 border border-green-100 p-4 text-sm text-green-800">
                    Após confirmar, receberá uma notificação na aplicação MB WAY para aprovar o pagamento.
                  </div>
                )}

                {submitError && (
                  <div className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-destructive">{submitError}</p>
                  </div>
                )}

                <Button
                  onClick={handleSubmitPayment}
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full h-14 text-lg font-bold shadow-xl btn-pulse"
                >
                  {isSubmitting ? (
                    <><Loader2 className="h-5 w-5 animate-spin mr-2" /> A processar...</>
                  ) : (
                    `Confirmar Encomenda — ${formatPrice(effectiveTotal)}`
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
