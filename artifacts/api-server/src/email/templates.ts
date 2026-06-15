export type SupportedLocale = 'pt-BR' | 'en' | 'es' | 'de' | 'fr' | 'it';

export interface OrderInfo {
  customerEmail: string;
  customerName?: string;
  orderId: string;
  trackingCode?: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  currency: string;
  shippingAddress?: string;
  locale?: string;
}

export function resolveLocale(raw?: string): SupportedLocale {
  if (!raw) return 'pt-BR';
  if (raw.startsWith('pt')) return 'pt-BR';
  if (raw.startsWith('en')) return 'en';
  if (raw.startsWith('es')) return 'es';
  if (raw.startsWith('de')) return 'de';
  if (raw.startsWith('fr')) return 'fr';
  if (raw.startsWith('it')) return 'it';
  return 'pt-BR';
}

function formatCurrency(amount: number, currency: string, locale: SupportedLocale): string {
  const numLocale =
    locale === 'pt-BR' ? 'pt-BR' :
    locale === 'de' ? 'de-DE' :
    locale === 'es' ? 'es-ES' :
    locale === 'fr' ? 'fr-FR' :
    locale === 'it' ? 'it-IT' :
    'en-US';
  return new Intl.NumberFormat(numLocale, { style: 'currency', currency: currency.toUpperCase() }).format(amount);
}

interface LabelSet {
  greeting: (name?: string) => string;
  orderLabel: string;
  deliveryLabel: string;
  totalLabel: string;
  productCol: string;
  qtyCol: string;
  priceCol: string;
  copyright: string;
  autoEmail: string;
  htmlLang: string;
  trackButton: string;
  trackCode: string;
}

const LABELS: Record<SupportedLocale, LabelSet> = {
  'pt-BR': {
    greeting: (n) => n ? `Ola, ${n}!` : 'Ola!',
    orderLabel: 'Pedido No.',
    deliveryLabel: 'Endereco de entrega',
    totalLabel: 'Total',
    productCol: 'Produto',
    qtyCol: 'Qtd.',
    priceCol: 'Valor',
    copyright: '© 2026 Panini. Todos os direitos reservados.',
    autoEmail: 'Este e um e-mail automatico. Por favor, nao responda diretamente.',
    htmlLang: 'pt-BR',
    trackButton: 'Rastrear meu pedido',
    trackCode: 'Codigo do pedido',
  },
  en: {
    greeting: (n) => n ? `Hello, ${n}!` : 'Hello!',
    orderLabel: 'Order No.',
    deliveryLabel: 'Delivery address',
    totalLabel: 'Total',
    productCol: 'Product',
    qtyCol: 'Qty.',
    priceCol: 'Price',
    copyright: '© 2026 Panini. All rights reserved.',
    autoEmail: 'This is an automated email. Please do not reply directly.',
    htmlLang: 'en',
    trackButton: 'Track my order',
    trackCode: 'Order code',
  },
  es: {
    greeting: (n) => n ? `Hola, ${n}!` : 'Hola!',
    orderLabel: 'Pedido No.',
    deliveryLabel: 'Direccion de entrega',
    totalLabel: 'Total',
    productCol: 'Producto',
    qtyCol: 'Cant.',
    priceCol: 'Precio',
    copyright: '© 2026 Panini. Todos los derechos reservados.',
    autoEmail: 'Este es un correo electronico automatico. Por favor, no responda directamente.',
    htmlLang: 'es',
    trackButton: 'Rastrear mi pedido',
    trackCode: 'Codigo del pedido',
  },
  de: {
    greeting: (n) => n ? `Hallo, ${n}!` : 'Hallo!',
    orderLabel: 'Bestellung Nr.',
    deliveryLabel: 'Lieferadresse',
    totalLabel: 'Gesamt',
    productCol: 'Produkt',
    qtyCol: 'Menge',
    priceCol: 'Preis',
    copyright: '© 2026 Panini. Alle Rechte vorbehalten.',
    autoEmail: 'Dies ist eine automatische E-Mail. Bitte antworten Sie nicht direkt.',
    htmlLang: 'de',
    trackButton: 'Sendung verfolgen',
    trackCode: 'Bestellcode',
  },
  fr: {
    greeting: (n) => n ? `Bonjour, ${n} !` : 'Bonjour !',
    orderLabel: 'Commande No.',
    deliveryLabel: 'Adresse de livraison',
    totalLabel: 'Total',
    productCol: 'Produit',
    qtyCol: 'Qte.',
    priceCol: 'Prix',
    copyright: '© 2026 Panini. Tous droits reserves.',
    autoEmail: 'Ceci est un e-mail automatique. Merci de ne pas repondre directement.',
    htmlLang: 'fr',
    trackButton: 'Suivre ma commande',
    trackCode: 'Code de commande',
  },
  it: {
    greeting: (n) => n ? `Ciao, ${n}!` : 'Ciao!',
    orderLabel: 'Ordine No.',
    deliveryLabel: 'Indirizzo di consegna',
    totalLabel: 'Totale',
    productCol: 'Prodotto',
    qtyCol: 'Qta.',
    priceCol: 'Prezzo',
    copyright: '© 2026 Panini. Tutti i diritti riservati.',
    autoEmail: 'Questa e una e-mail automatica. Si prega di non rispondere direttamente.',
    htmlLang: 'it',
    trackButton: 'Traccia il mio ordine',
    trackCode: 'Codice ordine',
  },
};

function buildItemsTable(items: OrderInfo['items'], currency: string, locale: SupportedLocale): string {
  if (!items || items.length === 0) return '';
  const lbl = LABELS[locale];
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:10px 12px;text-align:left;font-size:13px;color:#555;font-weight:600;border-bottom:2px solid #e0e0e0;">${lbl.productCol}</th>
          <th style="padding:10px 12px;text-align:center;font-size:13px;color:#555;font-weight:600;border-bottom:2px solid #e0e0e0;">${lbl.qtyCol}</th>
          <th style="padding:10px 12px;text-align:right;font-size:13px;color:#555;font-weight:600;border-bottom:2px solid #e0e0e0;">${lbl.priceCol}</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
        <tr>
          <td style="padding:10px 12px;font-size:14px;color:#333;border-bottom:1px solid #f0f0f0;">${item.name}</td>
          <td style="padding:10px 12px;font-size:14px;color:#333;text-align:center;border-bottom:1px solid #f0f0f0;">${item.quantity}</td>
          <td style="padding:10px 12px;font-size:14px;color:#333;text-align:right;border-bottom:1px solid #f0f0f0;">${formatCurrency(item.price * item.quantity, currency, locale)}</td>
        </tr>`).join('')}
        <tr>
          <td colspan="2" style="padding:12px;font-size:15px;font-weight:700;color:#1a1a1a;text-align:right;">${lbl.totalLabel}:</td>
          <td style="padding:12px;font-size:15px;font-weight:700;color:#1a1a1a;text-align:right;">${formatCurrency(items.reduce((s, i) => s + i.price * i.quantity, 0), currency, locale)}</td>
        </tr>
      </tbody>
    </table>`;
}

export function buildEmailHtml(subject: string, bodyHtml: string, order: OrderInfo, logoUrl: string): string {
  const locale = resolveLocale(order.locale);
  const lbl = LABELS[locale];
  return `<!DOCTYPE html>
<html lang="${lbl.htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Open Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#FFD600;padding:28px 32px;text-align:center;">
            <img src="${logoUrl}" alt="Panini" width="140" height="auto" style="display:block;margin:0 auto;max-width:140px;" />
            <p style="margin:10px 0 0;font-size:13px;color:#1a1a1a;font-weight:600;letter-spacing:1px;text-transform:uppercase;">FIFA WORLD CUP 2026</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 36px;">
            <p style="margin:0 0 20px;font-size:17px;font-weight:700;color:#1a1a1a;">${lbl.greeting(order.customerName)}</p>
            ${bodyHtml}
            <div style="margin-top:28px;padding:20px;background:#fffbe6;border-left:4px solid #FFD600;border-radius:4px;">
              <p style="margin:0;font-size:13px;color:#555;"><strong>${lbl.orderLabel}:</strong> ${order.orderId}</p>
              ${order.shippingAddress ? `<p style="margin:6px 0 0;font-size:13px;color:#555;"><strong>${lbl.deliveryLabel}:</strong> ${order.shippingAddress}</p>` : ''}
              <p style="margin:6px 0 0;font-size:13px;color:#555;"><strong>${lbl.totalLabel}:</strong> ${formatCurrency(order.totalAmount, order.currency, locale)}</p>
            </div>
            <div style="margin-top:24px;text-align:center;">
              <a href="https://woldcupfranca.com/rastreio?codigo=${order.trackingCode || order.orderId}&locale=${locale}"
                 style="display:inline-block;background:#FFD600;color:#1a1a1a;font-weight:700;font-size:15px;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
                ${lbl.trackButton}
              </a>
              <p style="margin:10px 0 0;font-size:11px;color:#999;">${lbl.trackCode}: ${order.trackingCode || order.orderId}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1a1a;padding:24px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;color:#FFD600;font-weight:700;">Panini FIFA World Cup 2026</p>
            <p style="margin:0;font-size:12px;color:#999;">${lbl.copyright}</p>
            <p style="margin:8px 0 0;font-size:11px;color:#666;">${lbl.autoEmail}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const ORDER_CONFIRMATION_COPY: Record<SupportedLocale, { subject: string; body: string }> = {
  'pt-BR': {
    subject: 'Pedido Confirmado - Panini FIFA World Cup 2026',
    body: `
      <p style="font-size:15px;color:#333;line-height:1.6;">Seu pedido foi confirmado com sucesso! Estamos preparando sua colecao oficial Panini FIFA World Cup 2026 com muito cuidado.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Em breve voce recebera atualizacoes sobre o envio. Fique de olho nos proximos e-mails!</p>
    `,
  },
  en: {
    subject: 'Order Confirmed - Panini FIFA World Cup 2026',
    body: `
      <p style="font-size:15px;color:#333;line-height:1.6;">Your order has been successfully confirmed! We are carefully preparing your official Panini FIFA World Cup 2026 collection.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">You will soon receive shipping updates. Keep an eye on the next emails!</p>
    `,
  },
  es: {
    subject: 'Pedido Confirmado - Panini FIFA World Cup 2026',
    body: `
      <p style="font-size:15px;color:#333;line-height:1.6;">Tu pedido ha sido confirmado con exito. Estamos preparando tu coleccion oficial Panini FIFA World Cup 2026 con mucho cuidado.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Pronto recibiras actualizaciones sobre el envio. Estate atento a los proximos correos.</p>
    `,
  },
  de: {
    subject: 'Bestellung bestaetigt - Panini FIFA World Cup 2026',
    body: `
      <p style="font-size:15px;color:#333;line-height:1.6;">Deine Bestellung wurde erfolgreich bestaetigt! Wir bereiten deine offizielle Panini FIFA World Cup 2026 Kollektion mit grosser Sorgfalt vor.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Du wirst bald Versandaktualisierungen erhalten. Achte auf die naechsten E-Mails.</p>
    `,
  },
  fr: {
    subject: 'Commande Confirmee - Panini FIFA World Cup 2026',
    body: `
      <p style="font-size:15px;color:#333;line-height:1.6;">Votre commande a ete confirmee avec succes ! Nous preparons votre collection officielle Panini FIFA World Cup 2026 avec le plus grand soin.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Vous recevrez bientot des mises a jour sur l'expedition. Guettez les prochains e-mails !</p>
    `,
  },
  it: {
    subject: 'Ordine Confermato - Panini FIFA World Cup 2026',
    body: `
      <p style="font-size:15px;color:#333;line-height:1.6;">Il tuo ordine e stato confermato con successo! Stiamo preparando con cura la tua collezione ufficiale Panini FIFA World Cup 2026.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Riceverai presto aggiornamenti sulla spedizione. Tieni d'occhio le prossime e-mail!</p>
    `,
  },
};

export function buildOrderConfirmationEmail(order: OrderInfo, logoUrl: string): { subject: string; html: string } {
  const locale = resolveLocale(order.locale);
  const copy = ORDER_CONFIRMATION_COPY[locale];
  const tableHtml = buildItemsTable(order.items, order.currency, locale);
  const html = buildEmailHtml(copy.subject, `${copy.body}${tableHtml}`, order, logoUrl);
  return { subject: copy.subject, html };
}

const UPSELL_COPY: Record<SupportedLocale, {
  subject: string;
  body: (productName: string, amount: string) => string;
}> = {
  'pt-BR': {
    subject: 'Compra Adicional Confirmada - Panini FIFA World Cup 2026',
    body: (productName, amount) => `
      <p style="font-size:15px;color:#333;line-height:1.6;">Sua compra adicional de <strong>${productName}</strong> foi processada com sucesso no valor de ${amount}.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Este item sera enviado junto com seu pedido principal para otimizar a entrega.</p>
    `,
  },
  en: {
    subject: 'Additional Purchase Confirmed - Panini FIFA World Cup 2026',
    body: (productName, amount) => `
      <p style="font-size:15px;color:#333;line-height:1.6;">Your additional purchase of <strong>${productName}</strong> has been successfully processed for ${amount}.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">This item will be shipped together with your main order to optimize delivery.</p>
    `,
  },
  es: {
    subject: 'Compra Adicional Confirmada - Panini FIFA World Cup 2026',
    body: (productName, amount) => `
      <p style="font-size:15px;color:#333;line-height:1.6;">Tu compra adicional de <strong>${productName}</strong> ha sido procesada con exito por ${amount}.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Este articulo se enviara junto con tu pedido principal para optimizar la entrega.</p>
    `,
  },
  de: {
    subject: 'Zusaetzlicher Kauf bestaetigt - Panini FIFA World Cup 2026',
    body: (productName, amount) => `
      <p style="font-size:15px;color:#333;line-height:1.6;">Dein zusaetzlicher Kauf von <strong>${productName}</strong> wurde erfolgreich fuer ${amount} verarbeitet.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Dieser Artikel wird zusammen mit deiner Hauptbestellung versandt, um die Lieferung zu optimieren.</p>
    `,
  },
  fr: {
    subject: 'Achat Supplementaire Confirme - Panini FIFA World Cup 2026',
    body: (productName, amount) => `
      <p style="font-size:15px;color:#333;line-height:1.6;">Votre achat supplementaire de <strong>${productName}</strong> a ete traite avec succes pour ${amount}.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Cet article sera expedie avec votre commande principale pour optimiser la livraison.</p>
    `,
  },
  it: {
    subject: 'Acquisto Aggiuntivo Confermato - Panini FIFA World Cup 2026',
    body: (productName, amount) => `
      <p style="font-size:15px;color:#333;line-height:1.6;">Il tuo acquisto aggiuntivo di <strong>${productName}</strong> e stato elaborato con successo per ${amount}.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Questo articolo verra spedito insieme al tuo ordine principale per ottimizzare la consegna.</p>
    `,
  },
};

export function buildUpsellConfirmationEmail(order: OrderInfo, upsellProductName: string, upsellAmount: number, logoUrl: string): { subject: string; html: string } {
  const locale = resolveLocale(order.locale);
  const copy = UPSELL_COPY[locale];
  const amountStr = formatCurrency(upsellAmount, order.currency, locale);
  const subject = copy.subject;
  const html = buildEmailHtml(subject, copy.body(upsellProductName, amountStr), order, logoUrl);
  return { subject, html };
}

type LogisticsStep = { subject: string; body: string };

const LOGISTICS_COPY: Record<SupportedLocale, LogisticsStep[]> = {
  'pt-BR': [
    {
      subject: 'Seu pedido esta sendo preparado - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pedido esta sendo separado e conferido com muito cuidado pelo nosso time. Cada item sera embalado com seguranca para chegar perfeito ate voce.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Status atual:</strong> Em preparacao no armazem Panini.</p>`,
    },
    {
      subject: 'Pedido em processamento - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pedido passou pela conferencia de qualidade e esta sendo embalado. Cada produto e inspecionado individualmente para garantir que chegue em perfeito estado.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Tempo estimado para envio:</strong> 1-2 dias uteis.</p>`,
    },
    {
      subject: 'Seu pedido foi despachado - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pedido acabou de sair do nosso armazem e esta a caminho da transportadora. Em breve voce recebera o codigo de rastreamento.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Status atual:</strong> Despachado.</p>`,
    },
    {
      subject: 'Codigo de rastreamento disponivel - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pacote esta com a transportadora e em transito. Voce pode acompanhar a entrega pelo site da transportadora utilizando o numero do seu pedido.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Status:</strong> Em transito.</p>`,
    },
    {
      subject: 'Em transito internacional - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pedido esta em transito internacional e ja passou pelo processo de exportacao. O pacote esta a caminho e deve chegar em breve.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Estamos monitorando cada etapa da entrega para garantir que tudo chegue corretamente.</p>`,
    },
    {
      subject: 'Pedido chegou ao pais de destino - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pacote ja chegou ao pais de destino e esta passando pelo processo de desembaraco aduaneiro.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Proxima etapa:</strong> Distribuicao nacional para entrega final.</p>`,
    },
    {
      subject: 'Pedido em distribuicao local - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pedido esta na etapa final de distribuicao. O pacote foi entregue ao servico postal local e em breve estara na sua porta.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Previsao:</strong> Entrega nos proximos 2 a 4 dias uteis.</p>`,
    },
    {
      subject: 'Seu pedido esta proximo de voce - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pacote esta muito perto! Ele foi encaminhado para a unidade de distribuicao mais proxima da sua regiao.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Certifique-se de que havera alguem no endereco indicado para receber o pacote. Caso contrario, o entregador deixara um aviso.</p>`,
    },
    {
      subject: 'Saiu para entrega hoje - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pedido saiu para entrega e deve chegar ate o final do dia no endereco informado.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Certifique-se de estar disponivel no endereco para receber seu pacote.</p>`,
    },
    {
      subject: 'Atualizacao de entrega - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Estamos verificando o status do seu pedido. As vezes ha pequenos atrasos por parte da transportadora. Fique tranquilo, seu pacote esta em monitoramento constante.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Status:</strong> Em acompanhamento pela transportadora.</p>`,
    },
    {
      subject: 'Sua colecao Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Esperamos que voce ja esteja aproveitando sua colecao de figurinhas da Copa do Mundo!</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Compartilhe sua colecao com amigos e familia. A Copa do Mundo e mais divertida quando todo mundo coleciona junto!</p>`,
    },
    {
      subject: 'Dica para completar seu album - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Voce sabia que um album completo da Copa do Mundo FIFA 2026 tem <strong>980 figurinhas diferentes</strong>?</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Dica de colecionador: organize suas figurinhas repetidas para trocar com amigos e familia. E a maneira mais rapida e divertida de completar o album!</p>`,
    },
    {
      subject: 'Faltam poucos dias para a Copa - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">A contagem regressiva para a FIFA World Cup 2026 continua! Enquanto o torneio se aproxima, sua colecao Panini registra cada momento historico.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Com <strong>48 selecoes</strong> e jogadores de todo o mundo, seu album e o guia definitivo para acompanhar a Copa.</p>`,
    },
    {
      subject: 'Obrigado por fazer parte da colecao - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Ja se passou um mes desde o seu pedido e queremos agradecer por confiar na Panini para a sua colecao da Copa do Mundo FIFA 2026.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Esperamos que voce esteja aproveitando cada figurinha e compartilhando a paixao pelo futebol com quem voce ama.</p>`,
    },
  ],
  en: [
    {
      subject: 'Your order is being prepared - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Your order is being carefully picked and verified by our team. Every item will be securely packaged to arrive in perfect condition.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Current status:</strong> Being prepared in the Panini warehouse.</p>`,
    },
    {
      subject: 'Order in processing - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Your order has passed quality inspection and is being packed. Each product is individually checked to ensure it arrives in perfect condition.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Estimated time to shipment:</strong> 1-2 business days.</p>`,
    },
    {
      subject: 'Your order has been dispatched - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Your order has just left our warehouse and is on its way to the carrier. You will receive a tracking code soon.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Current status:</strong> Dispatched.</p>`,
    },
    {
      subject: 'Tracking code available - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Your package is with the carrier and in transit. You can track your delivery on the carrier's website using your order number.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Status:</strong> In transit.</p>`,
    },
    {
      subject: 'In international transit - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Your order is in international transit and has already gone through the export process. The package is on its way and should arrive soon.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">We are monitoring every step of the delivery to ensure everything arrives correctly.</p>`,
    },
    {
      subject: 'Order arrived in destination country - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Your package has arrived in the destination country and is going through customs clearance.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Next step:</strong> National distribution for final delivery.</p>`,
    },
    {
      subject: 'Order in local distribution - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Your order is in the final distribution stage. The package has been handed over to the local postal service and will be at your door soon.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Estimated delivery:</strong> Within 2 to 4 business days.</p>`,
    },
    {
      subject: 'Your order is near you - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Your package is very close! It has been forwarded to the distribution center nearest to your area.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Please ensure someone is available at the address to receive the package. Otherwise the courier will leave a notice.</p>`,
    },
    {
      subject: 'Out for delivery today - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Your order is out for delivery and should arrive by the end of today at the address provided.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Please make sure someone is available at the delivery address to receive the package.</p>`,
    },
    {
      subject: 'Delivery update - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">We are checking the status of your order. Sometimes there are small delays on the carrier's side. Rest assured, your package is being constantly monitored.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Status:</strong> Being monitored by the carrier.</p>`,
    },
    {
      subject: 'Your Panini FIFA World Cup 2026 collection',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">We hope you are already enjoying your World Cup sticker collection!</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Share your collection with friends and family. The World Cup is more fun when everyone collects together!</p>`,
    },
    {
      subject: 'Tip to complete your album - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Did you know that a complete FIFA World Cup 2026 album has <strong>980 different stickers</strong>?</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Collector's tip: organize your duplicate stickers to trade with friends and family. It is the fastest and most fun way to complete your album!</p>`,
    },
    {
      subject: 'Just days until the World Cup - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">The countdown to FIFA World Cup 2026 continues! As the tournament approaches, your Panini collection captures every historic moment.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">With <strong>48 national teams</strong> and players from around the world, your album is the ultimate guide to following the Cup.</p>`,
    },
    {
      subject: 'Thank you for being part of the collection - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">A month has passed since your order and we want to thank you for trusting Panini for your FIFA World Cup 2026 collection.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">We hope you are enjoying every sticker and sharing the love of football with those you care about.</p>`,
    },
  ],
  es: [
    {
      subject: 'Tu pedido esta siendo preparado - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Tu pedido esta siendo seleccionado y verificado cuidadosamente por nuestro equipo. Cada articulo sera empaquetado de forma segura para llegar en perfecto estado.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Estado actual:</strong> En preparacion en el almacen Panini.</p>`,
    },
    {
      subject: 'Pedido en procesamiento - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Tu pedido ha pasado la inspeccion de calidad y esta siendo empaquetado. Cada producto es inspeccionado individualmente para garantizar que llegue en perfecto estado.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Tiempo estimado de envio:</strong> 1 a 2 dias habiles.</p>`,
    },
    {
      subject: 'Tu pedido ha sido despachado - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Tu pedido acaba de salir de nuestro almacen y esta de camino a la empresa de transporte. Pronto recibiras el codigo de seguimiento.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Estado actual:</strong> Despachado.</p>`,
    },
    {
      subject: 'Codigo de seguimiento disponible - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Tu paquete esta con la empresa de transporte y en transito. Puedes hacer seguimiento de la entrega en el sitio web de la empresa utilizando el numero de pedido.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Estado:</strong> En transito.</p>`,
    },
    {
      subject: 'En transito internacional - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Tu pedido esta en transito internacional y ya paso por el proceso de exportacion. El paquete esta en camino y deberia llegar pronto.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Estamos monitoreando cada etapa de la entrega para garantizar que todo llegue correctamente.</p>`,
    },
    {
      subject: 'Pedido llegado al pais de destino - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Tu paquete ya llego al pais de destino y esta pasando por el proceso de aduana.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Proxima etapa:</strong> Distribucion nacional para la entrega final.</p>`,
    },
    {
      subject: 'Pedido en distribucion local - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Tu pedido esta en la etapa final de distribucion. El paquete fue entregado al servicio postal local y pronto estara en tu puerta.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Estimacion:</strong> Entrega en los proximos 2 a 4 dias habiles.</p>`,
    },
    {
      subject: 'Tu pedido esta cerca de ti - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Tu paquete esta muy cerca. Ha sido enviado al centro de distribucion mas cercano a tu area.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Asegurate de que haya alguien en la direccion indicada para recibir el paquete. De lo contrario, el mensajero dejara un aviso.</p>`,
    },
    {
      subject: 'Salio para entrega hoy - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Tu pedido salio para entrega y deberia llegar antes del final del dia en la direccion indicada.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Asegurate de estar disponible en la direccion de entrega para recibir el paquete.</p>`,
    },
    {
      subject: 'Actualizacion de entrega - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Estamos verificando el estado de tu pedido. A veces hay pequenos retrasos por parte de la empresa de transporte. Tu paquete esta en monitoreo constante.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Estado:</strong> En seguimiento por la empresa de transporte.</p>`,
    },
    {
      subject: 'Tu coleccion Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Esperamos que ya estes disfrutando tu coleccion de estampas de la Copa del Mundo!</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Comparte tu coleccion con amigos y familia. La Copa del Mundo es mas divertida cuando todos coleccionan juntos.</p>`,
    },
    {
      subject: 'Consejo para completar tu album - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Sabias que un album completo de la Copa del Mundo FIFA 2026 tiene <strong>980 estampas diferentes</strong>?</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Consejo de coleccionista: organiza tus estampas repetidas para intercambiar con amigos y familia. Es la manera mas rapida y divertida de completar el album.</p>`,
    },
    {
      subject: 'Faltan pocos dias para la Copa - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">La cuenta regresiva para la FIFA World Cup 2026 continua. Mientras el torneio se acerca, tu coleccion Panini registra cada momento historico.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Con <strong>48 selecciones</strong> y jugadores de todo el mundo, tu album es la guia definitiva para seguir la Copa.</p>`,
    },
    {
      subject: 'Gracias por ser parte de la coleccion - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Ya paso un mes desde tu pedido y queremos agradecerte por confiar en Panini para tu coleccion de la Copa del Mundo FIFA 2026.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Esperamos que estes disfrutando cada estampa y compartiendo la pasion por el futbol con quienes amas.</p>`,
    },
  ],
  de: [
    {
      subject: 'Deine Bestellung wird vorbereitet - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Deine Bestellung wird von unserem Team sorgfaeltig zusammengestellt und geprueft. Jeder Artikel wird sicher verpackt, damit er einwandfrei bei dir ankommt.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Aktueller Status:</strong> Wird im Panini-Lager vorbereitet.</p>`,
    },
    {
      subject: 'Bestellung in Bearbeitung - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Deine Bestellung hat die Qualitaetspruefung bestanden und wird gerade verpackt. Jedes Produkt wird einzeln geprueft, um sicherzustellen, dass es in einwandfreiem Zustand ankommt.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Voraussichtliche Versandzeit:</strong> 1 bis 2 Werktage.</p>`,
    },
    {
      subject: 'Deine Bestellung wurde versandt - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Deine Bestellung hat gerade unser Lager verlassen und ist auf dem Weg zum Carrier. Du erhaeltst bald eine Tracking-Nummer.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Aktueller Status:</strong> Versandt.</p>`,
    },
    {
      subject: 'Tracking-Code verfuegbar - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Dein Paket befindet sich beim Carrier und ist unterwegs. Du kannst die Lieferung auf der Website des Carriers mit deiner Bestellnummer verfolgen.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Status:</strong> Unterwegs.</p>`,
    },
    {
      subject: 'Im internationalen Transit - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Deine Bestellung befindet sich im internationalen Transit und hat bereits den Exportprozess durchlaufen. Das Paket ist unterwegs und sollte bald ankommen.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Wir ueberwachen jeden Schritt der Lieferung, um sicherzustellen, dass alles korrekt ankommt.</p>`,
    },
    {
      subject: 'Bestellung im Zielland angekommen - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Dein Paket ist im Zielland angekommen und durchlaeuft gerade die Zollabfertigung.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Naechster Schritt:</strong> Nationale Verteilung fuer die abschliessende Lieferung.</p>`,
    },
    {
      subject: 'Bestellung in lokaler Verteilung - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Deine Bestellung befindet sich in der letzten Verteilungsphase. Das Paket wurde an den lokalen Postdienst uebergeben und ist bald bei dir.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Voraussichtliche Lieferung:</strong> Innerhalb von 2 bis 4 Werktagen.</p>`,
    },
    {
      subject: 'Deine Bestellung ist in deiner Naehe - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Dein Paket ist ganz nah! Es wurde an das Verteilzentrum in deiner Naehe weitergeleitet.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Bitte stelle sicher, dass jemand an der Lieferadresse anwesend ist, um das Paket entgegenzunehmen. Andernfalls hinterlaesst der Zusteller eine Benachrichtigung.</p>`,
    },
    {
      subject: 'Heute zur Auslieferung - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Deine Bestellung ist zur Auslieferung unterwegs und sollte bis Ende des Tages an der angegebenen Adresse ankommen.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Bitte stelle sicher, dass jemand an der Lieferadresse anwesend ist.</p>`,
    },
    {
      subject: 'Lieferaktualisierung - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Wir ueberpruefenr den Status deiner Bestellung. Manchmal gibt es kleine Verzoegerungen seitens des Carriers. Keine Sorge, dein Paket wird staendig ueberwacht.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Status:</strong> Wird vom Carrier ueberwacht.</p>`,
    },
    {
      subject: 'Deine Panini FIFA World Cup 2026 Kollektion',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Wir hoffen, dass du deine WM-Stickersammlung bereits geniesst!</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Teile deine Sammlung mit Freunden und Familie. Die Weltmeisterschaft macht mehr Spass, wenn alle zusammen sammeln!</p>`,
    },
    {
      subject: 'Tipp zum Vervollstaendigen deines Albums - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Wusstest du, dass ein vollstaendiges FIFA World Cup 2026 Album <strong>980 verschiedene Sticker</strong> hat?</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Sammlertipp: Organisiere deine doppelten Sticker, um sie mit Freunden und Familie zu tauschen. Das ist der schnellste und spassigste Weg, das Album zu vervollstaendigen.</p>`,
    },
    {
      subject: 'Nur noch wenige Tage bis zur WM - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Der Countdown zur FIFA World Cup 2026 laeuft! Waehrend das Turnier naeher rueckt, haelt deine Panini-Sammlung jeden historischen Moment fest.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Mit <strong>48 Nationalmannschaften</strong> und Spielern aus aller Welt ist dein Album der ultimative Begleiter fuer die WM.</p>`,
    },
    {
      subject: 'Danke, dass du Teil der Sammlung bist - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Ein Monat ist seit deiner Bestellung vergangen und wir moechten dir danken, dass du Panini fuer deine FIFA World Cup 2026 Sammlung vertraust.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Wir hoffen, dass du jeden Sticker geniesst und die Leidenschaft fuer Fussball mit deinen Liebsten teilst.</p>`,
    },
  ],
  fr: [
    {
      subject: 'Votre commande Panini FIFA World Cup 2026 est en cours de traitement',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Bonne nouvelle ! Votre commande a ete recue et est maintenant en cours de traitement dans notre entrepot.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Vous recevrez une confirmation d'expedition avec les informations de suivi des que votre colis sera en route.</p>`,
    },
    {
      subject: 'Votre commande Panini FIFA World Cup 2026 a ete transmise a la logistique',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Votre commande a ete transmise a notre equipe logistique et est en cours de preparation pour l'expedition.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Nous nous occupons de tout avec soin pour que votre collection arrive en parfait etat.</p>`,
    },
    {
      subject: 'Votre expedition Panini FIFA World Cup 2026 est preparee',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Votre colis est maintenant emballe et pret a etre remis au transporteur.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Vos stickers officiels FIFA World Cup 2026™ sont sur le point de prendre la route vers chez vous !</p>`,
    },
    {
      subject: 'Votre commande Panini FIFA World Cup 2026 a ete remise au transporteur',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Votre colis a ete remis au transporteur et est officiellement en route !</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Vous recevrez bientot un email avec les informations de suivi pour suivre votre livraison en temps reel.</p>`,
    },
    {
      subject: 'Votre commande Panini est en transit - FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Votre colis est actuellement en transit et avance vers sa destination finale.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Statut :</strong> En transit – En route vers votre pays.</p>`,
    },
    {
      subject: 'Votre commande est en dedouanement - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Votre colis est actuellement en cours de dedouanement. C'est une etape normale du processus de livraison internationale.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Ne vous inquietez pas, nous surveillons constamment votre colis et vous informerons des que le dedouanement sera complete.</p>`,
    },
    {
      subject: 'Votre commande est en cours de livraison - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Excellente nouvelle ! Votre colis est en cours de livraison dans votre pays.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Vos stickers officiels FIFA World Cup 2026™ vont bientot atterrir dans votre boite aux lettres. Plus qu'un peu de patience !</p>`,
    },
    {
      subject: 'Votre commande est pres de chez vous - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Votre colis a ete transfere au centre de distribution pres de chez vous.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Assurez-vous que quelqu'un sera present a l'adresse de livraison pour recevoir le colis. Sinon, le livreur laissera un avis de passage.</p>`,
    },
    {
      subject: 'Livraison prevue aujourd\'hui - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Votre commande est en cours de livraison et devrait arriver a l'adresse indiquee avant la fin de la journee.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Assurez-vous que quelqu'un soit present a l'adresse de livraison.</p>`,
    },
    {
      subject: 'Mise a jour de livraison - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Nous verifions le statut de votre commande. Il arrive parfois qu'il y ait de petits retards de la part du transporteur. Ne vous inquietez pas, votre colis est constamment surveille.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Statut :</strong> Surveille par le transporteur.</p>`,
    },
    {
      subject: 'Votre collection Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Nous esperons que vous profitez deja de votre collection de stickers du Mondial !</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Partagez votre collection avec vos amis et votre famille. La Coupe du Monde est encore plus amusante quand tout le monde collectionne ensemble !</p>`,
    },
    {
      subject: 'Conseil pour completer votre album - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Saviez-vous qu'un album FIFA World Cup 2026 complet contient <strong>980 stickers differents</strong> ?</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Conseil de collectionneur : Organisez vos stickers en double pour les echanger avec vos amis et votre famille. C'est la facon la plus rapide et la plus amusante de completer l'album !</p>`,
    },
    {
      subject: 'Plus que quelques jours avant le Mondial - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Le compte a rebours avant la FIFA World Cup 2026 est lance ! Tandis que le tournoi approche, votre collection Panini capture chaque moment historique.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Avec <strong>48 equipes nationales</strong> et des joueurs du monde entier, votre album est le compagnon ultime pour la Coupe du Monde.</p>`,
    },
    {
      subject: 'Merci de faire partie de la collection - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Un mois s'est ecoule depuis votre commande et nous souhaitons vous remercier de faire confiance a Panini pour votre collection FIFA World Cup 2026.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Nous esperons que vous profitez de chaque sticker et que vous partagez votre passion pour le football avec vos proches.</p>`,
    },
  ],
  it: [
    {
      subject: 'Il tuo ordine Panini FIFA World Cup 2026 e in elaborazione',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Buone notizie! Il tuo ordine e stato ricevuto ed e ora in elaborazione nel nostro magazzino.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Riceverai una conferma di spedizione con le informazioni di tracciamento non appena il tuo pacco sara in viaggio.</p>`,
    },
    {
      subject: 'Il tuo ordine Panini FIFA World Cup 2026 e stato trasmesso alla logistica',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Il tuo ordine e stato trasmesso al nostro team logistico ed e in fase di preparazione per la spedizione.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Ci prendiamo cura di tutto con attenzione per garantire che la tua collezione arrivi in perfette condizioni.</p>`,
    },
    {
      subject: 'La tua spedizione Panini FIFA World Cup 2026 e pronta',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Il tuo pacco e ora imballato e pronto per essere consegnato al corriere.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Le tue figurine ufficiali FIFA World Cup 2026™ stanno per mettersi in viaggio verso di te!</p>`,
    },
    {
      subject: 'Il tuo ordine Panini FIFA World Cup 2026 e stato consegnato al corriere',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Il tuo pacco e stato consegnato al corriere ed e ufficialmente in viaggio!</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Riceverai presto un'email con le informazioni di tracciamento per seguire la tua consegna in tempo reale.</p>`,
    },
    {
      subject: 'Il tuo ordine Panini e in transito - FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Il tuo pacco e attualmente in transito e sta avanzando verso la sua destinazione finale.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Stato:</strong> In transito – In viaggio verso il tuo paese.</p>`,
    },
    {
      subject: 'Il tuo ordine e in sdoganamento - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Il tuo pacco e attualmente in fase di sdoganamento. E una fase normale del processo di consegna internazionale.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Non preoccuparti, stiamo monitorando costantemente il tuo pacco e ti aggiorneremo non appena lo sdoganamento sara completato.</p>`,
    },
    {
      subject: 'Il tuo ordine e in consegna - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Notizia fantastica! Il tuo pacco e in consegna nel tuo paese.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Le tue figurine ufficiali FIFA World Cup 2026™ stanno per arrivare nella tua cassetta delle lettere. Ancora un po' di pazienza!</p>`,
    },
    {
      subject: 'Il tuo ordine e vicino a te - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Il tuo pacco e stato trasferito al centro di distribuzione vicino a te.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Assicurati che qualcuno sia presente all'indirizzo di consegna per ricevere il pacco. In caso contrario, il corriere lascera un avviso.</p>`,
    },
    {
      subject: 'Consegna prevista oggi - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Il tuo ordine e in consegna e dovrebbe arrivare all'indirizzo indicato entro la fine della giornata.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Assicurati che qualcuno sia presente all'indirizzo di consegna.</p>`,
    },
    {
      subject: 'Aggiornamento sulla consegna - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Stiamo verificando lo stato del tuo ordine. A volte ci sono piccoli ritardi da parte del corriere. Non preoccuparti, il tuo pacco e costantemente monitorato.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Stato:</strong> Monitorato dal corriere.</p>`,
    },
    {
      subject: 'La tua collezione Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Speriamo che tu stia gia godendo della tua collezione di figurine del Mondiale!</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Condividi la tua collezione con amici e famiglia. Il Mondiale e ancora piu divertente quando tutti collezionano insieme!</p>`,
    },
    {
      subject: 'Consiglio per completare il tuo album - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Lo sapevi che un album FIFA World Cup 2026 completo ha <strong>980 figurine diverse</strong>?</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Consiglio da collezionista: Organizza le tue figurine doppie per scambiarle con amici e famiglia. E il modo piu veloce e divertente per completare l'album!</p>`,
    },
    {
      subject: 'Mancano pochi giorni al Mondiale - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Il conto alla rovescia per la FIFA World Cup 2026 e iniziato! Mentre il torneo si avvicina, la tua collezione Panini cattura ogni momento storico.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Con <strong>48 nazionali</strong> e giocatori da tutto il mondo, il tuo album e il compagno definitivo per la Coppa del Mondo.</p>`,
    },
    {
      subject: 'Grazie per far parte della collezione - Panini FIFA World Cup 2026',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">E passato un mese dal tuo ordine e vogliamo ringraziarti per aver scelto Panini per la tua collezione FIFA World Cup 2026.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Speriamo che tu stia godendo di ogni figurina e che tu stia condividendo la tua passione per il calcio con le persone care.</p>`,
    },
  ],
};

export function buildLogisticsEmail(order: OrderInfo, step: number, logoUrl: string): { subject: string; html: string } {
  const locale = resolveLocale(order.locale);
  const templates = LOGISTICS_COPY[locale];
  const idx = Math.min(step - 1, templates.length - 1);
  const tpl = templates[idx];
  return {
    subject: tpl.subject,
    html: buildEmailHtml(tpl.subject, tpl.body, order, logoUrl),
  };
}
