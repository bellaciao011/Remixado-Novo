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

type Locale = 'en' | 'fr' | 'de' | 'es' | 'it' | 'pt-BR';

function resolveLocale(raw: string | null): Locale {
  if (!raw) return 'en';
  if (raw.startsWith('fr')) return 'fr';
  if (raw.startsWith('de')) return 'de';
  if (raw.startsWith('es')) return 'es';
  if (raw.startsWith('it')) return 'it';
  if (raw.startsWith('pt')) return 'pt-BR';
  return 'en';
}

const MILESTONES_EN = [
  { day: 1,  label: 'Order confirmed',               description: 'Payment received successfully',                        Icon: CheckCircle2 },
  { day: 2,  label: 'Logistics preparation',          description: 'Order being prepared in warehouse',                    Icon: Package },
  { day: 4,  label: 'Handed to carrier',              description: 'Package picked up by delivery service',                Icon: Truck },
  { day: 7,  label: 'International logistics center', description: 'Package arrived at international distribution center', Icon: Globe },
  { day: 10, label: 'Transit update',                 description: 'Package in transit',                                   Icon: RotateCw },
  { day: 13, label: 'Arrived at local center',        description: 'Package arrived at local distribution center',         Icon: MapPin },
  { day: 16, label: 'Delivery preparation',           description: 'Package prepared for final delivery',                  Icon: Box },
  { day: 18, label: 'Out for delivery',               description: 'Package on its way to your address',                   Icon: Navigation },
  { day: 20, label: 'Estimated delivery',             description: 'Package should have arrived at your location',         Icon: Home },
];

const MILESTONES_FR = [
  { day: 1,  label: 'Commande confirmée',              description: 'Paiement reçu avec succès',                           Icon: CheckCircle2 },
  { day: 2,  label: 'Préparation logistique',          description: 'Commande en cours de préparation en entrepôt',        Icon: Package },
  { day: 4,  label: 'Remis au transporteur',           description: 'Colis pris en charge par le service de livraison',    Icon: Truck },
  { day: 7,  label: 'Centre logistique international', description: 'Colis arrivé au centre de distribution international',Icon: Globe },
  { day: 10, label: 'Mise à jour de transit',          description: 'Colis en cours de transit',                           Icon: RotateCw },
  { day: 13, label: 'Arrivée au centre local',         description: 'Colis arrivé au centre de distribution local',        Icon: MapPin },
  { day: 16, label: 'Préparation de la livraison',     description: 'Colis préparé pour la livraison finale',              Icon: Box },
  { day: 18, label: 'En cours de livraison',           description: 'Colis en route vers votre adresse',                   Icon: Navigation },
  { day: 20, label: 'Livraison estimée',               description: 'Le colis devrait être arrivé chez vous',              Icon: Home },
];

const MILESTONES_DE = [
  { day: 1,  label: 'Bestellung bestätigt',            description: 'Zahlung erfolgreich eingegangen',                     Icon: CheckCircle2 },
  { day: 2,  label: 'Logistische Vorbereitung',        description: 'Bestellung wird im Lager vorbereitet',                Icon: Package },
  { day: 4,  label: 'An Spediteur übergeben',          description: 'Paket vom Zusteller abgeholt',                        Icon: Truck },
  { day: 7,  label: 'Internationales Logistikzentrum', description: 'Paket am internationalen Verteilzentrum angekommen',  Icon: Globe },
  { day: 10, label: 'Transit-Update',                  description: 'Paket im Transit',                                    Icon: RotateCw },
  { day: 13, label: 'Lokales Zentrum angekommen',      description: 'Paket am lokalen Verteilzentrum angekommen',          Icon: MapPin },
  { day: 16, label: 'Liefervorbereitung',              description: 'Paket für die Endlieferung vorbereitet',              Icon: Box },
  { day: 18, label: 'Wird ausgeliefert',               description: 'Paket auf dem Weg zu Ihrer Adresse',                  Icon: Navigation },
  { day: 20, label: 'Geschätzter Liefertag',           description: 'Das Paket sollte bei Ihnen angekommen sein',          Icon: Home },
];

const MILESTONES_ES = [
  { day: 1,  label: 'Pedido confirmado',               description: 'Pago recibido con éxito',                             Icon: CheckCircle2 },
  { day: 2,  label: 'Preparación logística',           description: 'Pedido en preparación en almacén',                    Icon: Package },
  { day: 4,  label: 'Entregado al transportista',      description: 'Paquete recogido por el servicio de entrega',         Icon: Truck },
  { day: 7,  label: 'Centro logístico internacional',  description: 'Paquete llegado al centro de distribución',           Icon: Globe },
  { day: 10, label: 'Actualización de tránsito',       description: 'Paquete en tránsito',                                 Icon: RotateCw },
  { day: 13, label: 'Llegado al centro local',         description: 'Paquete en el centro de distribución local',          Icon: MapPin },
  { day: 16, label: 'Preparación de entrega',          description: 'Paquete preparado para la entrega final',             Icon: Box },
  { day: 18, label: 'En camino',                       description: 'Paquete en camino a su dirección',                    Icon: Navigation },
  { day: 20, label: 'Entrega estimada',                description: 'El paquete debería haber llegado',                    Icon: Home },
];

const getMilestones = (locale: Locale) => {
  if (locale === 'fr') return MILESTONES_FR;
  if (locale === 'de') return MILESTONES_DE;
  if (locale === 'es') return MILESTONES_ES;
  return MILESTONES_EN;
};

interface Content {
  pageTitle: string;
  pageSubtitle: string;
  searchPlaceholder: string;
  searchButton: string;
  searching: string;
  notFound: string;
  orderSummary: string;
  customer: string;
  orderCode: string;
  orderDate: string;
  estimatedDelivery: string;
  totalAmount: string;
  shippingStatus: string;
  daysSince: (n: number) => string;
  statusPaid: string;
  statusPending: string;
  statusDenied: string;
  inProgress: string;
  done: string;
  paymentPending: string;
  paymentPendingDesc: string;
  faq: Array<{ icon: string; q: string; a: string }>;
  supportTitle: string;
  supportSubtitle: string;
  faqLabel: string;
  supportFormLabel: string;
  formName: string;
  formNamePlaceholder: string;
  formOrder: string;
  formEmail: string;
  formEmailPlaceholder: string;
  formMessage: string;
  formMessagePlaceholder: string;
  formOption: string;
  formOptions: Array<{ val: string; label: string }>;
  formSend: string;
  formSending: string;
  formSentTitle: string;
  formSentDesc: string;
  formError: string;
  openSupport: string;
  dateLocale: string;
}

const EN: Content = {
  pageTitle: 'Order Tracking',
  pageSubtitle: 'Enter your order code to track your delivery',
  searchPlaceholder: 'Order code (e.g. PANTP5YHA)',
  searchButton: 'Search',
  searching: 'Searching for order…',
  notFound: 'Order not found',
  orderSummary: 'Order Summary',
  customer: 'Customer',
  orderCode: 'Order Code',
  orderDate: 'Order Date',
  estimatedDelivery: 'Estimated Delivery',
  totalAmount: 'Total Amount',
  shippingStatus: 'Shipping Status',
  daysSince: (n) => `Day ${n} since order`,
  statusPaid: 'Paid',
  statusPending: 'Pending',
  statusDenied: 'Declined',
  inProgress: 'In progress',
  done: 'Delivered',
  paymentPending: 'Payment pending',
  paymentPendingDesc: 'Delivery tracking will be activated after payment confirmation.',
  faq: [
    { icon: '📦', q: 'Where is my order?', a: 'Your order goes through several international logistics stages. After confirmation, it is prepared in our warehouse, handed to the carrier and processed through customs. The full process usually takes 15 to 20 business days.' },
    { icon: '⏳', q: 'What is the delivery time?', a: 'The estimated delivery time is 15 to 20 business days from the order date. International shipments may vary slightly depending on the customs procedures of the destination country.' },
    { icon: '🚚', q: 'My tracking is not updated', a: "Don't worry! There can sometimes be delays in status updates, especially on weekends and public holidays. Your package is constantly monitored and will be delivered as planned." },
    { icon: '💬', q: 'Contact support', a: 'Our team responds within 24 to 72 hours. Use the form below to contact us directly.' },
  ],
  supportTitle: 'How can we help you?',
  supportSubtitle: 'Panini FIFA World Cup 2026 Support',
  faqLabel: 'Frequently asked questions',
  supportFormLabel: '📝 Support form',
  formName: 'Full Name *',
  formNamePlaceholder: 'Your name',
  formOrder: 'Order Number',
  formEmail: 'Email Address *',
  formEmailPlaceholder: 'your@email.com',
  formMessage: 'Your message *',
  formMessagePlaceholder: 'Describe your request…',
  formOption: 'Preferred option *',
  formOptions: [
    { val: 'follow_up', label: 'Track my order' },
    { val: 'priority',  label: 'Get a priority update' },
    { val: 'refund',    label: 'Request a refund review' },
  ],
  formSend: 'Send request',
  formSending: 'Sending…',
  formSentTitle: 'Request received',
  formSentDesc: 'We will respond within 24 to 72 hours.',
  formError: 'Error sending. Please try again.',
  openSupport: 'Open support',
  dateLocale: 'en-US',
};

const FR: Content = {
  pageTitle: 'Suivi de commande',
  pageSubtitle: 'Entrez votre code de commande pour suivre votre livraison',
  searchPlaceholder: 'Code de commande (ex. PANTP5YHA)',
  searchButton: 'Rechercher',
  searching: 'Recherche de la commande…',
  notFound: 'Commande introuvable',
  orderSummary: 'Récapitulatif de la commande',
  customer: 'Client',
  orderCode: 'Code de commande',
  orderDate: 'Date de commande',
  estimatedDelivery: 'Livraison estimée',
  totalAmount: 'Montant total',
  shippingStatus: "Statut d'expédition",
  daysSince: (n) => `Jour ${n} depuis la commande`,
  statusPaid: 'Payé',
  statusPending: 'En attente',
  statusDenied: 'Refusé',
  inProgress: 'En cours',
  done: 'Terminé',
  paymentPending: 'Paiement en attente',
  paymentPendingDesc: 'Le suivi de livraison sera activé après confirmation du paiement.',
  faq: [
    { icon: '📦', q: 'Où est ma commande ?', a: "Votre commande passe par plusieurs étapes logistiques internationales. Après confirmation, elle est préparée dans notre entrepôt, remise au transporteur et traitée par la douane. L'ensemble du processus prend généralement 15 à 20 jours ouvrables." },
    { icon: '⏳', q: 'Quel est le délai de livraison ?', a: 'Le délai de livraison estimé est de 15 à 20 jours ouvrables à compter de la date de commande. Les envois internationaux peuvent varier légèrement selon les procédures douanières du pays de destination.' },
    { icon: '🚚', q: "Mon suivi n'est pas mis à jour", a: "Pas d'inquiétude ! Il peut parfois y avoir des délais dans la mise à jour des statuts, notamment les week-ends et jours fériés. Votre colis est constamment surveillé et sera livré comme prévu." },
    { icon: '💬', q: 'Contacter le support', a: 'Notre équipe répond dans un délai de 24 à 72 heures. Utilisez le formulaire ci-dessous pour nous contacter directement.' },
  ],
  supportTitle: 'Comment pouvons-nous vous aider ?',
  supportSubtitle: 'Panini FIFA World Cup 2026 Support',
  faqLabel: 'Questions fréquentes',
  supportFormLabel: '📝 Formulaire de support',
  formName: 'Nom complet *',
  formNamePlaceholder: 'Votre nom',
  formOrder: 'Numéro de commande',
  formEmail: 'Adresse e-mail *',
  formEmailPlaceholder: 'votre@email.fr',
  formMessage: 'Votre message *',
  formMessagePlaceholder: 'Décrivez votre demande…',
  formOption: 'Option souhaitée *',
  formOptions: [
    { val: 'follow_up', label: 'Suivre ma commande' },
    { val: 'priority',  label: 'Obtenir une mise à jour prioritaire' },
    { val: 'refund',    label: 'Demander une analyse de remboursement' },
  ],
  formSend: 'Envoyer la demande',
  formSending: 'Envoi en cours…',
  formSentTitle: 'Demande reçue',
  formSentDesc: 'Nous vous répondrons dans un délai de 24 à 72 heures.',
  formError: "Erreur lors de l'envoi. Veuillez réessayer.",
  openSupport: 'Ouvrir le support',
  dateLocale: 'fr-FR',
};

const DE: Content = {
  pageTitle: 'Bestellverfolgung',
  pageSubtitle: 'Geben Sie Ihren Bestellcode ein, um Ihre Lieferung zu verfolgen',
  searchPlaceholder: 'Bestellcode (z.B. PANTP5YHA)',
  searchButton: 'Suchen',
  searching: 'Bestellung wird gesucht…',
  notFound: 'Bestellung nicht gefunden',
  orderSummary: 'Bestellübersicht',
  customer: 'Kunde',
  orderCode: 'Bestellcode',
  orderDate: 'Bestelldatum',
  estimatedDelivery: 'Geschätzter Liefertermin',
  totalAmount: 'Gesamtbetrag',
  shippingStatus: 'Versandstatus',
  daysSince: (n) => `Tag ${n} seit der Bestellung`,
  statusPaid: 'Bezahlt',
  statusPending: 'Ausstehend',
  statusDenied: 'Abgelehnt',
  inProgress: 'In Bearbeitung',
  done: 'Geliefert',
  paymentPending: 'Zahlung ausstehend',
  paymentPendingDesc: 'Die Lieferverfolgung wird nach Zahlungsbestätigung aktiviert.',
  faq: [
    { icon: '📦', q: 'Wo ist meine Bestellung?', a: 'Ihre Bestellung durchläuft mehrere internationale Logistikstufen. Nach der Bestätigung wird sie in unserem Lager vorbereitet, an den Spediteur übergeben und vom Zoll bearbeitet. Der gesamte Prozess dauert in der Regel 15 bis 20 Werktage.' },
    { icon: '⏳', q: 'Wie lange dauert die Lieferung?', a: 'Die geschätzte Lieferzeit beträgt 15 bis 20 Werktage ab dem Bestelldatum. Internationale Sendungen können je nach Zollverfahren des Ziellandes leicht variieren.' },
    { icon: '🚚', q: 'Meine Sendungsverfolgung wird nicht aktualisiert', a: 'Keine Sorge! Es kann manchmal Verzögerungen bei Statusaktualisierungen geben, besonders an Wochenenden und Feiertagen. Ihr Paket wird ständig überwacht und wird wie geplant geliefert.' },
    { icon: '💬', q: 'Support kontaktieren', a: 'Unser Team antwortet innerhalb von 24 bis 72 Stunden. Nutzen Sie das untenstehende Formular, um uns direkt zu kontaktieren.' },
  ],
  supportTitle: 'Wie können wir Ihnen helfen?',
  supportSubtitle: 'Panini FIFA World Cup 2026 Support',
  faqLabel: 'Häufig gestellte Fragen',
  supportFormLabel: '📝 Support-Formular',
  formName: 'Vollständiger Name *',
  formNamePlaceholder: 'Ihr Name',
  formOrder: 'Bestellnummer',
  formEmail: 'E-Mail-Adresse *',
  formEmailPlaceholder: 'ihre@email.de',
  formMessage: 'Ihre Nachricht *',
  formMessagePlaceholder: 'Beschreiben Sie Ihr Anliegen…',
  formOption: 'Gewünschte Option *',
  formOptions: [
    { val: 'follow_up', label: 'Meine Bestellung verfolgen' },
    { val: 'priority',  label: 'Prioritätsaktualisierung erhalten' },
    { val: 'refund',    label: 'Rückerstattungsprüfung beantragen' },
  ],
  formSend: 'Anfrage senden',
  formSending: 'Wird gesendet…',
  formSentTitle: 'Anfrage erhalten',
  formSentDesc: 'Wir antworten innerhalb von 24 bis 72 Stunden.',
  formError: 'Fehler beim Senden. Bitte versuchen Sie es erneut.',
  openSupport: 'Support öffnen',
  dateLocale: 'de-DE',
};

const ES: Content = {
  pageTitle: 'Seguimiento de pedido',
  pageSubtitle: 'Ingrese su código de pedido para rastrear su entrega',
  searchPlaceholder: 'Código de pedido (ej. PANTP5YHA)',
  searchButton: 'Buscar',
  searching: 'Buscando pedido…',
  notFound: 'Pedido no encontrado',
  orderSummary: 'Resumen del pedido',
  customer: 'Cliente',
  orderCode: 'Código de pedido',
  orderDate: 'Fecha de pedido',
  estimatedDelivery: 'Entrega estimada',
  totalAmount: 'Importe total',
  shippingStatus: 'Estado de envío',
  daysSince: (n) => `Día ${n} desde el pedido`,
  statusPaid: 'Pagado',
  statusPending: 'Pendiente',
  statusDenied: 'Rechazado',
  inProgress: 'En curso',
  done: 'Entregado',
  paymentPending: 'Pago pendiente',
  paymentPendingDesc: 'El seguimiento de entrega se activará tras la confirmación del pago.',
  faq: [
    { icon: '📦', q: '¿Dónde está mi pedido?', a: 'Su pedido pasa por varias etapas logísticas internacionales. Tras la confirmación, se prepara en nuestro almacén, se entrega al transportista y se tramita por aduanas. El proceso completo suele tardar 15 a 20 días hábiles.' },
    { icon: '⏳', q: '¿Cuál es el plazo de entrega?', a: 'El plazo de entrega estimado es de 15 a 20 días hábiles desde la fecha del pedido. Los envíos internacionales pueden variar según los procedimientos aduaneros del país de destino.' },
    { icon: '🚚', q: 'Mi seguimiento no se actualiza', a: '¡No se preocupe! A veces puede haber retrasos en las actualizaciones de estado, especialmente los fines de semana y festivos. Su paquete está constantemente monitorizado y llegará según lo previsto.' },
    { icon: '💬', q: 'Contactar con soporte', a: 'Nuestro equipo responde en 24 a 72 horas. Use el formulario de abajo para contactarnos directamente.' },
  ],
  supportTitle: '¿Cómo podemos ayudarle?',
  supportSubtitle: 'Panini FIFA World Cup 2026 Support',
  faqLabel: 'Preguntas frecuentes',
  supportFormLabel: '📝 Formulario de soporte',
  formName: 'Nombre completo *',
  formNamePlaceholder: 'Su nombre',
  formOrder: 'Número de pedido',
  formEmail: 'Dirección de correo *',
  formEmailPlaceholder: 'su@email.es',
  formMessage: 'Su mensaje *',
  formMessagePlaceholder: 'Describa su solicitud…',
  formOption: 'Opción deseada *',
  formOptions: [
    { val: 'follow_up', label: 'Rastrear mi pedido' },
    { val: 'priority',  label: 'Obtener una actualización prioritaria' },
    { val: 'refund',    label: 'Solicitar revisión de reembolso' },
  ],
  formSend: 'Enviar solicitud',
  formSending: 'Enviando…',
  formSentTitle: 'Solicitud recibida',
  formSentDesc: 'Le responderemos en 24 a 72 horas.',
  formError: 'Error al enviar. Por favor, inténtelo de nuevo.',
  openSupport: 'Abrir soporte',
  dateLocale: 'es-ES',
};

const CONTENT: Record<Locale, Content> = { en: EN, fr: FR, de: DE, es: ES, it: EN, 'pt-BR': EN };

function daysSince(isoDate: string): number {
  const paid = new Date(isoDate);
  const now = new Date();
  return Math.floor((now.getTime() - paid.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(isoDate: string, dateLocale: string): string {
  return new Date(isoDate).toLocaleDateString(dateLocale, {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function addDays(isoDate: string, days: number, dateLocale: string): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatAmount(amount: number, currency: string): string {
  const curr = currency.toUpperCase();
  const locale = curr === 'USD' ? 'en-US' : curr === 'EUR' ? 'fr-FR' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: curr }).format(amount);
}

function StatusBadge({ status, c }: { status: string; c: Content }) {
  if (status === 'succeeded') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
        <CheckCircle2 className="h-3.5 w-3.5" /> {c.statusPaid}
      </span>
    );
  }
  if (status === 'requires_payment_method' || status === 'requires_action') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
        <Clock className="h-3.5 w-3.5" /> {c.statusPending}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
      <AlertCircle className="h-3.5 w-3.5" /> {c.statusDenied}
    </span>
  );
}

function Timeline({ paidAt, locale }: { paidAt: string; locale: Locale }) {
  const milestones = getMilestones(locale);
  const c = CONTENT[locale];
  const days = daysSince(paidAt);
  const currentIdx = (() => {
    let idx = 0;
    for (let i = 0; i < milestones.length; i++) {
      if (days >= milestones[i].day) idx = i;
    }
    return idx;
  })();

  return (
    <div className="space-y-0">
      {milestones.map((m, i) => {
        const done = days >= m.day;
        const current = i === currentIdx && days < milestones[milestones.length - 1].day + 1;
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
              {i < milestones.length - 1 && (
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
                    {c.inProgress}
                  </span>
                )}
                {done && !current && i === milestones.length - 1 && (
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-green-500 text-white rounded-full">
                    {c.done}
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

function FaqAccordion({ c }: { c: Content }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {c.faq.map((item, i) => (
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

function SupportForm({ defaultOrderId, c }: { defaultOrderId?: string; c: Content }) {
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
      if (!res.ok) throw new Error('Error');
      setSent(true);
    } catch {
      setError(c.formError);
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
        <p className="font-bold text-[#1a1a1a]">{c.formSentTitle}</p>
        <p className="text-sm text-muted-foreground">{c.formSentDesc}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-2">
      <div>
        <label className="block text-xs font-semibold mb-1 text-[#1a1a1a]">{c.formName}</label>
        <input
          required
          type="text"
          value={formData.fullName}
          onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
          placeholder={c.formNamePlaceholder}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-[#1a1a1a]">{c.formOrder}</label>
        <input
          type="text"
          value={formData.orderId}
          onChange={e => setFormData(p => ({ ...p, orderId: e.target.value }))}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
          placeholder="PANXXXXXXX"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-[#1a1a1a]">{c.formEmail}</label>
        <input
          required
          type="email"
          value={formData.email}
          onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
          placeholder={c.formEmailPlaceholder}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-[#1a1a1a]">{c.formMessage}</label>
        <textarea
          required
          rows={3}
          value={formData.message}
          onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD600] resize-none"
          placeholder={c.formMessagePlaceholder}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-2 text-[#1a1a1a]">{c.formOption}</label>
        <div className="space-y-2">
          {c.formOptions.map(opt => (
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
        {sending ? c.formSending : c.formSend}
      </Button>
    </form>
  );
}

function SupportWidget({ orderId, c }: { orderId?: string; c: Content }) {
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
        aria-label={c.openSupport}
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
                <p className="font-black text-base text-[#1a1a1a]">{c.supportTitle}</p>
                <p className="text-xs text-muted-foreground">{c.supportSubtitle}</p>
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
                  {c.faqLabel}
                </p>
                <FaqAccordion c={c} />
              </div>

              <div className="border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSupportOpen(!supportOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#1a3a6b] text-white"
                >
                  <span className="text-sm font-bold">{c.supportFormLabel}</span>
                  {supportOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {supportOpen && (
                  <div className="px-4 pb-4 bg-gray-50">
                    <SupportForm defaultOrderId={orderId} c={c} />
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
  const [locale, setLocale] = useState<Locale>('en');
  const [codigo, setCodigo] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('codigo');
    const l = resolveLocale(params.get('locale'));
    setLocale(l);
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
        if (!res.ok) return res.json().then(d => { throw new Error(d.error || c.notFound); });
        return res.json();
      })
      .then(data => setResult(data))
      .catch(err => setError(err.message || c.notFound))
      .finally(() => setLoading(false));
  }, [codigo]);

  const c = CONTENT[locale];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) setCodigo(inputValue.trim());
  };

  return (
    <div className="min-h-screen bg-background py-10 md:py-16">
      <div className="container max-w-2xl px-4 mx-auto">

        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tight">
            {c.pageTitle}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {c.pageSubtitle}
          </p>
        </div>

        <Card className="shadow-sm mb-6">
          <CardContent className="p-5">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={c.searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                />
              </div>
              <Button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="px-5 font-bold shrink-0"
                style={{ background: '#FFD600', color: '#1a1a1a' }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : c.searchButton}
              </Button>
            </form>
          </CardContent>
        </Card>

        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">{c.searching}</span>
          </div>
        )}

        {error && !loading && (
          <Card className="shadow-sm border-destructive/30">
            <CardContent className="p-5 flex gap-3 items-start">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-sm text-destructive">{c.notFound}</p>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {result && !loading && (
          <div className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="border-b pb-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <CardTitle className="text-base font-black">{c.orderSummary}</CardTitle>
                  <StatusBadge status={result.status} c={c} />
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {result.customerName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{c.customer}</span>
                    <span className="font-semibold">{result.customerName.split(' ')[0]}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{c.orderCode}</span>
                  <span className="font-mono text-xs font-bold text-[#1a1a1a] truncate max-w-[160px]">{result.orderId}</span>
                </div>
                {result.paidAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{c.orderDate}</span>
                    <span className="font-semibold">{formatDate(result.paidAt, c.dateLocale)}</span>
                  </div>
                )}
                {result.paidAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{c.estimatedDelivery}</span>
                    <span className="font-semibold text-green-700">{addDays(result.paidAt, 20, c.dateLocale)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{c.totalAmount}</span>
                  <span className="font-black text-primary">{formatAmount(result.amount, result.currency)}</span>
                </div>

                {result.items.length > 0 && (
                  <div className="mt-2 pt-3 border-t space-y-1.5">
                    {result.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate mr-2">{item.quantity}× {item.name}</span>
                        <span className="font-semibold shrink-0">{formatAmount(item.price * item.quantity, result.currency)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {result.status === 'succeeded' && result.paidAt && (
              <Card className="shadow-sm">
                <CardHeader className="border-b pb-3">
                  <CardTitle className="text-base font-black">{c.shippingStatus}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.daysSince(daysSince(result.paidAt))}
                  </p>
                </CardHeader>
                <CardContent className="p-5">
                  <Timeline paidAt={result.paidAt} locale={locale} />
                </CardContent>
              </Card>
            )}

            {result.status !== 'succeeded' && (
              <Card className="shadow-sm border-yellow-200 bg-yellow-50">
                <CardContent className="p-5 flex gap-3 items-start">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-yellow-800">{c.paymentPending}</p>
                    <p className="text-xs text-yellow-700 mt-1">{c.paymentPendingDesc}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <SupportWidget orderId={result?.orderId || codigo || undefined} c={c} />
    </div>
  );
}
