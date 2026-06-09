import { useState, useEffect, useRef } from 'react';
import {
  Search, CheckCircle2, Package, Truck, Globe, RotateCw,
  MapPin, Box, Navigation, Home, MessageCircle, X,
  ChevronDown, ChevronUp, Loader2, AlertCircle, Clock, Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';

interface TrackingResult {
  orderId: string;
  status: string;
  customerName: string | null;
  amount: number;
  currency: string;
  paidAt: string | null;
  items: Array<{ name: string; quantity: number; price: number }>;
}

const MILESTONES = [
  { day: 1,  label: 'Bestellung bestätigt',            description: 'Zahlung erfolgreich erhalten',                       Icon: CheckCircle2 },
  { day: 2,  label: 'Logistische Vorbereitung',         description: 'Bestellung wird im Lager vorbereitet',               Icon: Package },
  { day: 4,  label: 'An den Transporteur übergeben',    description: 'Paket beim Versanddienstleister eingegangen',        Icon: Truck },
  { day: 7,  label: 'Internationales Logistikzentrum',  description: 'Paket im internationalen Verteilzentrum',           Icon: Globe },
  { day: 10, label: 'Transportaktualisierung',          description: 'Paket auf dem Transportweg',                         Icon: RotateCw },
  { day: 13, label: 'Ankunft im lokalen Zentrum',       description: 'Paket im lokalen Verteilzentrum angekommen',        Icon: MapPin },
  { day: 16, label: 'Vorbereitung der Lieferung',       description: 'Paket für die Endzustellung vorbereitet',           Icon: Box },
  { day: 18, label: 'Auf dem Weg zur Lieferung',        description: 'Paket ist unterwegs zu Ihrer Adresse',              Icon: Navigation },
  { day: 20, label: 'Voraussichtliche Lieferung',       description: 'Paket sollte bei Ihnen angekommen sein',            Icon: Home },
];

const FAQ_ITEMS = [
  {
    icon: '📦',
    q: 'Wo ist meine Bestellung?',
    a: 'Ihre Bestellung durchläuft mehrere internationale Logistikstufen. Nach der Bestätigung wird sie von unserem Lager vorbereitet, an den Versanddienstleister übergeben und durch das Zollverfahren geleitet. Der gesamte Vorgang dauert in der Regel 15–20 Werktage.',
  },
  {
    icon: '⏳',
    q: 'Wie lange dauert die Lieferung?',
    a: 'Die geschätzte Lieferzeit beträgt 15–20 Werktage ab Bestelldatum. Internationale Sendungen können je nach Zollabwicklung im Zielland etwas variieren.',
  },
  {
    icon: '🚚',
    q: 'Meine Sendung wird nicht aktualisiert',
    a: 'Keine Sorge! Manchmal gibt es Verzögerungen bei Statusaktualisierungen, insbesondere an Wochenenden und Feiertagen. Ihr Paket wird ständig überwacht und planmäßig zugestellt.',
  },
  {
    icon: '💬',
    q: 'Support kontaktieren',
    a: 'Unser Team antwortet innerhalb von 24 bis 72 Stunden. Nutzen Sie das Formular unten für eine direkte Kontaktaufnahme.',
  },
];

function daysSince(isoDate: string): number {
  const paid = new Date(isoDate);
  const now = new Date();
  return Math.floor((now.getTime() - paid.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatEur(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'succeeded') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
        <CheckCircle2 className="h-3.5 w-3.5" /> Bezahlt
      </span>
    );
  }
  if (status === 'requires_payment_method' || status === 'requires_action') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
        <Clock className="h-3.5 w-3.5" /> Ausstehend
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
      <AlertCircle className="h-3.5 w-3.5" /> Abgelehnt
    </span>
  );
}

function Timeline({ paidAt }: { paidAt: string }) {
  const days = daysSince(paidAt);
  const currentIdx = (() => {
    let idx = 0;
    for (let i = 0; i < MILESTONES.length; i++) {
      if (days >= MILESTONES[i].day) idx = i;
    }
    return idx;
  })();

  return (
    <div className="space-y-0">
      {MILESTONES.map((m, i) => {
        const done = days >= m.day;
        const current = i === currentIdx && days < MILESTONES[MILESTONES.length - 1].day + 1;
        const { Icon } = m;
        return (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                  done && !current
                    ? 'bg-green-500 border-green-500 text-white'
                    : current
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'bg-white border-gray-200 text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              {i < MILESTONES.length - 1 && (
                <div className={`w-0.5 h-8 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
            <div className="pb-4 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-bold ${done || current ? 'text-[#1a1a1a]' : 'text-gray-400'}`}>
                  {m.label}
                </span>
                {current && (
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-red-500 text-white rounded-full">
                    Aktuell
                  </span>
                )}
                {done && !current && i === MILESTONES.length - 1 && (
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-green-500 text-white rounded-full">
                    Abgeschlossen
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${done || current ? 'text-muted-foreground' : 'text-gray-300'}`}>
                {m.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3 text-left bg-white hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="text-sm font-semibold flex items-center gap-2">
              <span>{item.icon}</span>
              {item.q}
            </span>
            {open === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {open === i && (
            <div className="px-4 pb-4 text-sm text-muted-foreground bg-gray-50">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SupportForm({ defaultOrderId }: { defaultOrderId?: string }) {
  const [formData, setFormData] = useState({
    fullName: '',
    orderId: defaultOrderId || '',
    email: '',
    message: '',
    option: 'follow_up',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/public/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Fehler beim Senden');
      setSent(true);
    } catch {
      setError('Fehler beim Senden. Bitte versuchen Sie es erneut.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <p className="font-bold text-[#1a1a1a]">Anfrage erhalten</p>
        <p className="text-sm text-muted-foreground">Wir melden uns innerhalb von 24–72 Stunden bei Ihnen.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-2">
      <div>
        <label className="block text-xs font-semibold mb-1 text-[#1a1a1a]">Vollständiger Name *</label>
        <input
          required
          type="text"
          value={formData.fullName}
          onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
          placeholder="Ihr Name"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-[#1a1a1a]">Bestellnummer</label>
        <input
          type="text"
          value={formData.orderId}
          onChange={e => setFormData(p => ({ ...p, orderId: e.target.value }))}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
          placeholder="pi_XXXXXXXXX"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-[#1a1a1a]">E-Mail-Adresse *</label>
        <input
          required
          type="email"
          value={formData.email}
          onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
          placeholder="ihre@email.de"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-[#1a1a1a]">Ihr Anliegen *</label>
        <textarea
          required
          rows={3}
          value={formData.message}
          onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD600] resize-none"
          placeholder="Beschreiben Sie Ihr Anliegen..."
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-2 text-[#1a1a1a]">Gewünschte Option *</label>
        <div className="space-y-2">
          {[
            { val: 'follow_up', label: 'Bestellung weiterverfolgen' },
            { val: 'priority',  label: 'Prioritätsaktualisierung erhalten' },
            { val: 'refund',    label: 'Rückerstattungsanalyse beantragen' },
          ].map(opt => (
            <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="option"
                value={opt.val}
                checked={formData.option === opt.val}
                onChange={() => setFormData(p => ({ ...p, option: opt.val }))}
                className="accent-[#1a3a6b]"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button
        type="submit"
        disabled={sending}
        className="w-full h-11 font-bold text-sm gap-2"
        style={{ background: '#1a3a6b' }}
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {sending ? 'Wird gesendet...' : 'Anfrage senden'}
      </Button>
    </form>
  );
}

function SupportWidget({ orderId }: { orderId?: string }) {
  const [open, setOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState<boolean>(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95"
        style={{ background: '#e00' }}
        aria-label="Support öffnen"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div
            ref={drawerRef}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white shadow-2xl flex flex-col"
            style={{ height: '88dvh', maxHeight: '88dvh' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
              <div>
                <p className="font-black text-base text-[#1a1a1a]">Wie können wir helfen?</p>
                <p className="text-xs text-muted-foreground">Panini FIFA World Cup 2026 Support</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
                  Häufige Fragen
                </p>
                <FaqAccordion />
              </div>

              <div className="border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSupportOpen(!supportOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#1a3a6b] text-white"
                >
                  <span className="text-sm font-bold">📝 Support-Formular</span>
                  {supportOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {supportOpen && (
                  <div className="px-4 pb-4 bg-gray-50">
                    <SupportForm defaultOrderId={orderId} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function RastreioPage() {
  const [codigo, setCodigo] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('codigo');
    if (c) {
      setInputValue(c);
      setCodigo(c);
    }
  }, []);

  useEffect(() => {
    if (!codigo) return;
    setLoading(true);
    setError(null);
    setResult(null);
    fetch(`${API_BASE}/api/orders/track/${encodeURIComponent(codigo)}`)
      .then(res => {
        if (!res.ok) return res.json().then(d => { throw new Error(d.error || 'Bestellung nicht gefunden'); });
        return res.json();
      })
      .then(data => setResult(data))
      .catch(err => setError(err.message || 'Bestellung nicht gefunden'))
      .finally(() => setLoading(false));
  }, [codigo]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) setCodigo(inputValue.trim());
  };

  return (
    <div className="min-h-screen bg-background py-10 md:py-16">
      <div className="container max-w-2xl px-4 mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tight">
            Sendungsverfolgung
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Geben Sie Ihren Bestellcode ein, um den Status zu verfolgen
          </p>
        </div>

        {/* Search */}
        <Card className="shadow-sm mb-6">
          <CardContent className="p-5">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Bestellcode eingeben (z. B. PANTP5YHA)"
                  className="w-full pl-9 pr-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                />
              </div>
              <Button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="px-5 font-bold shrink-0"
                style={{ background: '#FFD600', color: '#1a1a1a' }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Suchen'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Bestellung wird gesucht…</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <Card className="shadow-sm border-destructive/30">
            <CardContent className="p-5 flex gap-3 items-start">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-sm text-destructive">Bestellung nicht gefunden</p>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="space-y-4">
            {/* Order summary card */}
            <Card className="shadow-sm">
              <CardHeader className="border-b pb-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <CardTitle className="text-base font-black">Bestellübersicht</CardTitle>
                  <StatusBadge status={result.status} />
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {result.customerName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kunde</span>
                    <span className="font-semibold">{result.customerName.split(' ')[0]}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bestellcode</span>
                  <span className="font-mono text-xs font-bold text-[#1a1a1a] truncate max-w-[160px]">{result.orderId}</span>
                </div>
                {result.paidAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bestelldatum</span>
                    <span className="font-semibold">{formatDate(result.paidAt)}</span>
                  </div>
                )}
                {result.paidAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Voraussichtliche Lieferung</span>
                    <span className="font-semibold text-green-700">{addDays(result.paidAt, 20)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gesamtbetrag</span>
                  <span className="font-black text-primary">{formatEur(result.amount)}</span>
                </div>

                {result.items.length > 0 && (
                  <div className="mt-2 pt-3 border-t space-y-1.5">
                    {result.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate mr-2">{item.quantity}× {item.name}</span>
                        <span className="font-semibold shrink-0">{formatEur(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline (only for paid orders) */}
            {result.status === 'succeeded' && result.paidAt && (
              <Card className="shadow-sm">
                <CardHeader className="border-b pb-3">
                  <CardTitle className="text-base font-black">Versandstatus</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tag {daysSince(result.paidAt)} seit der Bestellung
                  </p>
                </CardHeader>
                <CardContent className="p-5">
                  <Timeline paidAt={result.paidAt} />
                </CardContent>
              </Card>
            )}

            {result.status !== 'succeeded' && (
              <Card className="shadow-sm border-yellow-200 bg-yellow-50">
                <CardContent className="p-5 flex gap-3 items-start">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-yellow-800">Zahlung ausstehend</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Die Sendungsverfolgung wird nach Zahlungsbestätigung aktiviert.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <SupportWidget orderId={result?.orderId || codigo || undefined} />
    </div>
  );
}
