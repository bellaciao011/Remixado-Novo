import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { fbq, utmifyEvent, sendCapiEvent } from '@/lib/tracking';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft, ShoppingCart, AlertCircle, Check, Pencil, Tag,
  CheckCircle2, Loader2, Clock,
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

const formatCountdown = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

interface TransactionData {
  transactionID: string;
  amount: number;
  method: string;
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
  const [phone, setPhone] = useState('');
  const [orderBump1Selected, setOrderBump1Selected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [submittedPhone, setSubmittedPhone] = useState('');
  const [pollingStatus, setPollingStatus] = useState<string | null>(null);

  // Countdown: 5 minutos
  const [countdown, setCountdown] = useState(5 * 60);
  const timerExpired = countdown === 0;

  const shippingCardRef = useRef<HTMLDivElement>(null);
  const orderBumpRef = useRef<HTMLDivElement>(null);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

  // Timer — só corre enquanto na tela de espera
  useEffect(() => {
    if (step !== 'waiting') return;
    setCountdown(5 * 60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  // Auto-polling a cada 5s — detecta confirmação COMPLETED
  useEffect(() => {
    if (step !== 'waiting' || !transactionData?.transactionID) return;
    if (pollingStatus === 'COMPLETED' || pollingStatus === 'DECLINED') return;
    const poll = setInterval(async () => {
      try {
        const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '';
        const res = await fetch(`${apiBase}/api/waymb/transaction-info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: transactionData.transactionID }),
        });
        if (!res.ok) return;
        const info = await res.json() as any;
        if (info.status === 'COMPLETED' || info.status === 'DECLINED') {
          setPollingStatus(info.status);
          clearInterval(poll);
        }
      } catch { /* ignorar erros de rede temporários */ }
    }, 5000);
    return () => clearInterval(poll);
  }, [step, transactionData?.transactionID, pollingStatus]);

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
    if (!phone.trim()) {
      setSubmitError('Por favor, indique o número de telemóvel MB WAY.');
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
          method: 'mbway',
          phone: phone.trim(),
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
      setSubmittedPhone(phone.trim());
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

  // ── ECRÃ DE AGUARDAR PAGAMENTO MB WAY ──────────────────────────────────────
  if (step === 'waiting' && transactionData) {
    const isPaid = pollingStatus === 'COMPLETED';
    const isDeclined = pollingStatus === 'DECLINED';

    return (
      <div className="min-h-screen py-12 md:py-20" style={{ background: '#FFFDE7' }}>
        <div className="container max-w-lg px-4 mx-auto space-y-6">

          {isPaid ? (
            /* ── PAGO ── */
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-black text-green-800 uppercase tracking-tight">Pagamento Confirmado!</h1>
              <p className="text-green-700 mt-2 text-sm">A sua encomenda foi activada com sucesso. Irá receber um email de confirmação em breve.</p>
              <div className="mt-6">
                <Link href="/productos">
                  <Button className="font-bold">Continuar a comprar</Button>
                </Link>
              </div>
            </div>
          ) : isDeclined ? (
            /* ── RECUSADO ── */
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-black text-red-800 uppercase tracking-tight">Pagamento Não Confirmado</h1>
              <p className="text-red-700 mt-2 text-sm">O pagamento MB WAY não foi aceite. Pode tentar novamente com uma nova encomenda.</p>
              <div className="mt-6">
                <Link href="/productos">
                  <Button variant="outline" className="font-bold">Tentar novamente</Button>
                </Link>
              </div>
            </div>
          ) : (
            /* ── PENDENTE ── */
            <>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ background: '#FFF8E1', border: '3px solid #FFD600' }}>
                  <Clock className="h-10 w-10" style={{ color: '#F57F17' }} />
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: '#E65100' }}>
                  ⏳ Encomenda Pendente
                </h1>
                <p className="mt-1 text-sm font-semibold" style={{ color: '#BF360C' }}>
                  O seu pagamento ainda não foi confirmado.
                </p>
              </div>

              <div className="rounded-xl border-2 p-6 space-y-4" style={{ background: '#FFF8E1', borderColor: '#FFD600' }}>
                <p className="text-sm text-center" style={{ color: '#37474F' }}>
                  A sua encomenda foi gerada com sucesso. Para a activar,<br />
                  <strong>confirme o pagamento na sua app MB WAY.</strong>
                </p>

                <div className="rounded-lg p-4 text-sm space-y-1" style={{ background: '#FFF3E0', border: '1px solid #FFB300' }}>
                  <p style={{ color: '#37474F' }}>
                    Foi enviado um pedido de pagamento de{' '}
                    <strong>{formatPrice(transactionData.amount)}</strong> para o seu telemóvel{' '}
                    <strong>{submittedPhone}</strong>.
                  </p>
                  <p style={{ color: '#37474F' }}>
                    Abra a app <strong>MB WAY</strong> e confirme o pagamento.
                  </p>
                </div>

                {/* Spinner + countdown */}
                <div className="flex flex-col items-center gap-3 py-2">
                  {!timerExpired ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#F57F17' }} />
                      <div className="text-center">
                        <p className="text-3xl font-black font-mono" style={{ color: '#E65100' }}>
                          {formatCountdown(countdown)}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#78909C' }}>A aguardar confirmação...</p>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg p-4 text-sm text-center" style={{ background: '#FFF3E0', border: '1px solid #FFB300' }}>
                      <p className="font-semibold" style={{ color: '#E65100' }}>O tempo expirou.</p>
                      <p className="mt-1" style={{ color: '#546E7A' }}>
                        Se já confirmou o pagamento na app MB WAY, aguarde — a confirmação pode demorar alguns minutos.<br />
                        Se não confirmou, pode gerar uma nova encomenda.
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-center space-y-1">
                  <p className="text-xs" style={{ color: '#78909C' }}>
                    Ref. encomenda: <strong className="font-mono">{transactionData.transactionID}</strong>
                  </p>
                  {transactionData.trackingCode && (
                    <p className="text-xs" style={{ color: '#78909C' }}>
                      Código de rastreio: <strong className="font-mono">{transactionData.trackingCode}</strong>
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-center" style={{ color: '#90A4AE' }}>
                Após a confirmação do pagamento, receberá um email de confirmação.
              </p>
            </>
          )}

          <div className="text-center">
            <Link href="/productos" className="text-sm hover:underline" style={{ color: '#90A4AE' }}>
              ← Voltar à loja
            </Link>
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

          {/* Pagamento MB WAY */}
          {step === 'payment' && (
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-xl font-bold">Pagamento MB WAY</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
                  Após confirmar, receberá uma notificação na aplicação <strong>MB WAY</strong> para aprovar o pagamento de{' '}
                  <strong>{formatPrice(effectiveTotal)}</strong>.
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Número de Telemóvel MB WAY{requiredMark}
                  </label>
                  <input
                    type="tel"
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Ex: +351 912 345 678"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Número associado à sua conta MB WAY.</p>
                </div>

                {submitError && (
                  <div className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-destructive">{submitError}</p>
                  </div>
                )}

                <style>{`@keyframes pulse-scale{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}.btn-pulse{animation:pulse-scale 2s ease-in-out infinite}`}</style>
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
