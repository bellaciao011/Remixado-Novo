export type SupportedLocale = 'pt-BR' | 'en' | 'es' | 'de';

export interface OrderInfo {
  customerEmail: string;
  customerName?: string;
  orderId: string;
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
  return 'pt-BR';
}

function formatCurrency(amount: number, currency: string, locale: SupportedLocale): string {
  const numLocale = locale === 'pt-BR' ? 'pt-BR' : locale === 'de' ? 'de-DE' : locale === 'es' ? 'es-ES' : 'en-US';
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
}

const LABELS: Record<SupportedLocale, LabelSet> = {
  'pt-BR': {
    greeting: (n) => n ? `Olá, ${n}!` : 'Olá!',
    orderLabel: 'Pedido Nº',
    deliveryLabel: 'Endereço de entrega',
    totalLabel: 'Total',
    productCol: 'Produto',
    qtyCol: 'Qtd.',
    priceCol: 'Valor',
    copyright: '© 2026 Panini. Todos os direitos reservados.',
    autoEmail: 'Este é um e-mail automático. Por favor, não responda diretamente.',
    htmlLang: 'pt-BR',
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
  },
  es: {
    greeting: (n) => n ? `¡Hola, ${n}!` : '¡Hola!',
    orderLabel: 'Pedido Nº',
    deliveryLabel: 'Dirección de entrega',
    totalLabel: 'Total',
    productCol: 'Producto',
    qtyCol: 'Cant.',
    priceCol: 'Precio',
    copyright: '© 2026 Panini. Todos los derechos reservados.',
    autoEmail: 'Este es un correo electrónico automático. Por favor, no responda directamente.',
    htmlLang: 'es',
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
        <!-- HEADER -->
        <tr>
          <td style="background:#FFD600;padding:28px 32px;text-align:center;">
            <img src="${logoUrl}" alt="Panini" width="140" height="auto" style="display:block;margin:0 auto;max-width:140px;" />
            <p style="margin:10px 0 0;font-size:13px;color:#1a1a1a;font-weight:600;letter-spacing:1px;text-transform:uppercase;">FIFA WORLD CUP 2026™</p>
          </td>
        </tr>
        <!-- BODY -->
        <tr>
          <td style="padding:32px 36px;">
            <p style="margin:0 0 20px;font-size:17px;font-weight:700;color:#1a1a1a;">${lbl.greeting(order.customerName)}</p>
            ${bodyHtml}
            <div style="margin-top:28px;padding:20px;background:#fffbe6;border-left:4px solid #FFD600;border-radius:4px;">
              <p style="margin:0;font-size:13px;color:#555;"><strong>${lbl.orderLabel}:</strong> ${order.orderId}</p>
              ${order.shippingAddress ? `<p style="margin:6px 0 0;font-size:13px;color:#555;"><strong>${lbl.deliveryLabel}:</strong> ${order.shippingAddress}</p>` : ''}
              <p style="margin:6px 0 0;font-size:13px;color:#555;"><strong>${lbl.totalLabel}:</strong> ${formatCurrency(order.totalAmount, order.currency, locale)}</p>
            </div>
          </td>
        </tr>
        <!-- FOOTER -->
        <tr>
          <td style="background:#1a1a1a;padding:24px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;color:#FFD600;font-weight:700;">Panini FIFA World Cup 2026™</p>
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
    subject: '✅ Pedido Confirmado – Panini FIFA World Cup 2026™',
    body: `
      <p style="font-size:15px;color:#333;line-height:1.6;">Seu pedido foi confirmado com sucesso! 🎉 Estamos preparando sua coleção oficial Panini FIFA World Cup 2026™ com muito cuidado.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Em breve você receberá atualizações sobre o envio. Fique de olho nos próximos e-mails!</p>
    `,
  },
  en: {
    subject: '✅ Order Confirmed – Panini FIFA World Cup 2026™',
    body: `
      <p style="font-size:15px;color:#333;line-height:1.6;">Your order has been confirmed! 🎉 We are carefully preparing your official Panini FIFA World Cup 2026™ collection.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">You will soon receive shipping updates. Keep an eye on the next emails!</p>
    `,
  },
  es: {
    subject: '✅ Pedido Confirmado – Panini FIFA World Cup 2026™',
    body: `
      <p style="font-size:15px;color:#333;line-height:1.6;">¡Tu pedido ha sido confirmado con éxito! 🎉 Estamos preparando tu colección oficial Panini FIFA World Cup 2026™ con mucho cuidado.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Pronto recibirás actualizaciones sobre el envío. ¡Estate atento a los próximos correos!</p>
    `,
  },
  de: {
    subject: '✅ Bestellung bestätigt – Panini FIFA World Cup 2026™',
    body: `
      <p style="font-size:15px;color:#333;line-height:1.6;">Deine Bestellung wurde erfolgreich bestätigt! 🎉 Wir bereiten deine offizielle Panini FIFA World Cup 2026™ Kollektion mit großer Sorgfalt vor.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Du wirst bald Versandaktualisierungen erhalten. Achte auf die nächsten E-Mails!</p>
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
    subject: '🌟 Compra Adicional Confirmada – Panini FIFA World Cup 2026™',
    body: (productName, amount) => `
      <p style="font-size:15px;color:#333;line-height:1.6;">Ótima escolha! Sua compra adicional de <strong>${productName}</strong> foi processada com sucesso por ${amount}.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Este item será enviado junto com seu pedido principal para otimizar a entrega.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Aproveite cada figurinha exclusiva da Copa do Mundo! ⚽</p>
    `,
  },
  en: {
    subject: '🌟 Additional Purchase Confirmed – Panini FIFA World Cup 2026™',
    body: (productName, amount) => `
      <p style="font-size:15px;color:#333;line-height:1.6;">Great choice! Your additional purchase of <strong>${productName}</strong> has been successfully processed for ${amount}.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">This item will be shipped together with your main order to optimize delivery.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Enjoy every exclusive World Cup sticker! ⚽</p>
    `,
  },
  es: {
    subject: '🌟 Compra Adicional Confirmada – Panini FIFA World Cup 2026™',
    body: (productName, amount) => `
      <p style="font-size:15px;color:#333;line-height:1.6;">¡Excelente elección! Tu compra adicional de <strong>${productName}</strong> ha sido procesada con éxito por ${amount}.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Este artículo se enviará junto con tu pedido principal para optimizar la entrega.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">¡Disfruta cada estampa exclusiva de la Copa del Mundo! ⚽</p>
    `,
  },
  de: {
    subject: '🌟 Zusätzlicher Kauf bestätigt – Panini FIFA World Cup 2026™',
    body: (productName, amount) => `
      <p style="font-size:15px;color:#333;line-height:1.6;">Tolle Wahl! Dein zusätzlicher Kauf von <strong>${productName}</strong> wurde erfolgreich für ${amount} verarbeitet.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Dieser Artikel wird zusammen mit deiner Hauptbestellung versandt, um die Lieferung zu optimieren.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Genieße jedes exklusive WM-Sticker! ⚽</p>
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
      subject: '📦 Seu pedido está sendo preparado – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pedido está sendo separado e conferido com muito cuidado pelo nosso time. Garantimos que cada item será embalado com segurança para chegar perfeito até você.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Status atual:</strong> Em preparação no armazém Panini.</p>`,
    },
    {
      subject: '🏭 Pedido em processamento – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pedido passou pela conferência de qualidade e está sendo embalado. Cada produto é inspecionado individualmente para garantir que chegue em perfeito estado.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Tempo estimado para envio:</strong> 1–2 dias úteis.</p>`,
    },
    {
      subject: '🚚 Seu pedido foi despachado! – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Boa notícia! Seu pedido acabou de sair do nosso armazém e está a caminho da transportadora. Em breve você receberá o código de rastreamento.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Status atual:</strong> Despachado ✓</p>`,
    },
    {
      subject: '📬 Código de rastreamento disponível – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pacote está com a transportadora e em trânsito. Você pode acompanhar a entrega pelo site da transportadora com o número do pedido.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Status:</strong> Em trânsito</p>`,
    },
    {
      subject: '🌍 Em trânsito internacional – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pedido está em trânsito internacional e já passou pelo processo de exportação. O pacote está a caminho e deve chegar em breve.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Estamos monitorando cada etapa da entrega para garantir que tudo chegue certinho.</p>`,
    },
    {
      subject: '✈️ Pedido chegou ao país destino – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Ótimas notícias! Seu pacote já chegou ao país de destino e está passando pelo processo de desembaraço aduaneiro.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Próxima etapa:</strong> Distribuição nacional para entrega final.</p>`,
    },
    {
      subject: '🏠 Pedido em distribuição local – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pedido está na etapa final de distribuição! O pacote foi entregue ao serviço postal local e em breve estará na sua porta.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Previsão:</strong> Entrega nos próximos 2–4 dias úteis.</p>`,
    },
    {
      subject: '📍 Seu pedido está próximo de você – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pacote está muito perto! Ele foi encaminhado para a unidade de distribuição mais próxima da sua região.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Certifique-se de que haverá alguém no endereço indicado para receber o pacote. Caso contrário, o entregador deixará um aviso.</p>`,
    },
    {
      subject: '🛵 Saiu para entrega hoje! – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">🎉 Hoje é o grande dia! Seu pedido saiu para entrega e deve chegar até o final do dia.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Certifique-se de estar disponível no endereço para receber seu pacote.</p>`,
    },
    {
      subject: '📦 Atualização de entrega – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Estamos verificando o status do seu pedido. Às vezes há pequenos atrasos por parte da transportadora — fique tranquilo, seu pacote está em monitoramento constante.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Status:</strong> Em acompanhamento pela transportadora.</p>`,
    },
    {
      subject: '⭐ Como está sua experiência Panini? – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Esperamos que você já esteja aproveitando sua coleção de figurinhas da Copa do Mundo! 🌟</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Compartilhe sua coleção com amigos e família — a Copa do Mundo é mais divertida quando todo mundo coleciona junto! ⚽</p>`,
    },
    {
      subject: '🎁 Dica especial para completar seu álbum – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Você sabia que um álbum completo da Copa do Mundo FIFA 2026™ tem <strong>980 figurinhas diferentes</strong>?</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Dica de colecionador: organize suas figurinhas repetidas para trocar com amigos e família. É a maneira mais rápida e divertida de completar o álbum! 🏆</p>`,
    },
    {
      subject: '🏆 Faltam poucos dias para a Copa – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">A contagem regressiva para a FIFA World Cup 2026™ continua! Enquanto o torneio se aproxima, sua coleção Panini registra cada momento histórico.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Com <strong>48 seleções</strong> e jogadores de todo o mundo, seu álbum é o guia definitivo para acompanhar a Copa. Aproveite cada figurinha! ⚽🌍</p>`,
    },
    {
      subject: '💛 Obrigado por fazer parte da coleção! – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Já se passou um mês desde o seu pedido e queremos agradecer por confiar na Panini para a sua coleção da Copa do Mundo FIFA 2026™.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Esperamos que você esteja aproveitando cada figurinha e compartilhando a paixão pelo futebol com quem você ama. Boa sorte em completar o álbum! 🏆</p>`,
    },
  ],
  en: [
    {
      subject: '📦 Your order is being prepared – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Your order is being carefully picked and verified by our team. We guarantee that every item will be securely packaged to arrive in perfect condition.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Current status:</strong> Being prepared in the Panini warehouse.</p>`,
    },
    {
      subject: '🏭 Order in processing – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Your order has passed quality inspection and is being packed. Each product is individually checked to ensure it arrives in perfect condition.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Estimated time to shipment:</strong> 1–2 business days.</p>`,
    },
    {
      subject: '🚚 Your order has been dispatched! – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Great news! Your order has just left our warehouse and is on its way to the carrier. You will receive a tracking code soon.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Current status:</strong> Dispatched ✓</p>`,
    },
    {
      subject: '📬 Tracking code available – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Your package is with the carrier and in transit. You can track your delivery on the carrier's website using your order number.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Status:</strong> In transit</p>`,
    },
    {
      subject: '🌍 In international transit – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Your order is in international transit and has already gone through the export process. The package is on its way and should arrive soon.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">We are monitoring every step of the delivery to ensure everything arrives correctly.</p>`,
    },
    {
      subject: '✈️ Order arrived in destination country – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Great news! Your package has arrived in the destination country and is going through customs clearance.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Next step:</strong> National distribution for final delivery.</p>`,
    },
    {
      subject: '🏠 Order in local distribution – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Your order is in the final distribution stage! The package has been handed over to the local postal service and will be at your door soon.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Estimated delivery:</strong> Within 2–4 business days.</p>`,
    },
    {
      subject: '📍 Your order is near you – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Your package is very close! It has been forwarded to the distribution center nearest to your area.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Please ensure someone is available at the address to receive the package. Otherwise the courier will leave a notice.</p>`,
    },
    {
      subject: '🛵 Out for delivery today! – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">🎉 Today is the big day! Your order is out for delivery and should arrive by end of day.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Please make sure someone is available at the delivery address.</p>`,
    },
    {
      subject: '📦 Delivery update – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">We are checking the status of your order. Sometimes there are small delays on the carrier's side — rest assured, your package is being constantly monitored.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Status:</strong> Being monitored by the carrier.</p>`,
    },
    {
      subject: '⭐ How is your Panini experience? – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">We hope you are already enjoying your World Cup sticker collection! 🌟</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Share your collection with friends and family — the World Cup is more fun when everyone collects together! ⚽</p>`,
    },
    {
      subject: '🎁 Special tip to complete your album – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Did you know that a complete FIFA World Cup 2026™ album has <strong>980 different stickers</strong>?</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Collector's tip: organize your duplicate stickers to trade with friends and family. It's the fastest and most fun way to complete your album! 🏆</p>`,
    },
    {
      subject: '🏆 Just days until the World Cup – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">The countdown to FIFA World Cup 2026™ continues! As the tournament approaches, your Panini collection captures every historic moment.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">With <strong>48 national teams</strong> and players from around the world, your album is the ultimate guide to following the Cup. Enjoy every sticker! ⚽🌍</p>`,
    },
    {
      subject: '💛 Thank you for being part of the collection! – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">A month has passed since your order and we want to thank you for trusting Panini for your FIFA World Cup 2026™ collection.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">We hope you are enjoying every sticker and sharing the love of football with those you care about. Good luck completing the album! 🏆</p>`,
    },
  ],
  es: [
    {
      subject: '📦 Tu pedido está siendo preparado – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Tu pedido está siendo seleccionado y verificado cuidadosamente por nuestro equipo. Garantizamos que cada artículo será empaquetado de forma segura para llegar en perfecto estado.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Estado actual:</strong> En preparación en el almacén Panini.</p>`,
    },
    {
      subject: '🏭 Pedido en procesamiento – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Tu pedido ha pasado la inspección de calidad y está siendo empaquetado. Cada producto es inspeccionado individualmente para garantizar que llegue en perfecto estado.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Tiempo estimado de envío:</strong> 1–2 días hábiles.</p>`,
    },
    {
      subject: '🚚 ¡Tu pedido ha sido despachado! – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">¡Buenas noticias! Tu pedido acaba de salir de nuestro almacén y está de camino a la empresa de transporte. Pronto recibirás el código de seguimiento.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Estado actual:</strong> Despachado ✓</p>`,
    },
    {
      subject: '📬 Código de seguimiento disponible – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Tu paquete está con la empresa de transporte y en tránsito. Puedes hacer seguimiento de la entrega en el sitio web de la empresa con el número de pedido.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Estado:</strong> En tránsito</p>`,
    },
    {
      subject: '🌍 En tránsito internacional – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Tu pedido está en tránsito internacional y ya pasó por el proceso de exportación. El paquete está en camino y debería llegar pronto.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Estamos monitoreando cada etapa de la entrega para garantizar que todo llegue correctamente.</p>`,
    },
    {
      subject: '✈️ Pedido llegó al país de destino – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">¡Excelentes noticias! Tu paquete ya llegó al país de destino y está pasando por el proceso de aduana.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Próxima etapa:</strong> Distribución nacional para la entrega final.</p>`,
    },
    {
      subject: '🏠 Pedido en distribución local – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">¡Tu pedido está en la etapa final de distribución! El paquete fue entregado al servicio postal local y pronto estará en tu puerta.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Estimación:</strong> Entrega en los próximos 2–4 días hábiles.</p>`,
    },
    {
      subject: '📍 Tu pedido está cerca de ti – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">¡Tu paquete está muy cerca! Ha sido enviado al centro de distribución más cercano a tu área.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Asegúrate de que haya alguien en la dirección indicada para recibir el paquete. De lo contrario, el mensajero dejará un aviso.</p>`,
    },
    {
      subject: '🛵 ¡Salió para entrega hoy! – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">🎉 ¡Hoy es el gran día! Tu pedido salió para entrega y debería llegar antes del final del día.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Asegúrate de estar disponible en la dirección de entrega.</p>`,
    },
    {
      subject: '📦 Actualización de entrega – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Estamos verificando el estado de tu pedido. A veces hay pequeños retrasos por parte de la empresa de transporte — queda tranquilo, tu paquete está en monitoreo constante.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Estado:</strong> En seguimiento por la empresa de transporte.</p>`,
    },
    {
      subject: '⭐ ¿Cómo va tu experiencia Panini? – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">¡Esperamos que ya estés disfrutando tu colección de estampas de la Copa del Mundo! 🌟</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">¡Comparte tu colección con amigos y familia — la Copa del Mundo es más divertida cuando todos coleccionan juntos! ⚽</p>`,
    },
    {
      subject: '🎁 Consejo especial para completar tu álbum – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">¿Sabías que un álbum completo de la Copa del Mundo FIFA 2026™ tiene <strong>980 estampas diferentes</strong>?</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Consejo de coleccionista: organiza tus estampas repetidas para intercambiar con amigos y familia. ¡Es la manera más rápida y divertida de completar el álbum! 🏆</p>`,
    },
    {
      subject: '🏆 Faltan pocos días para la Copa – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">¡La cuenta regresiva para la FIFA World Cup 2026™ continúa! Mientras el torneo se acerca, tu colección Panini registra cada momento histórico.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Con <strong>48 selecciones</strong> y jugadores de todo el mundo, tu álbum es la guía definitiva para seguir la Copa. ¡Disfruta cada estampa! ⚽🌍</p>`,
    },
    {
      subject: '💛 ¡Gracias por ser parte de la colección! – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Ya pasó un mes desde tu pedido y queremos agradecerte por confiar en Panini para tu colección de la Copa del Mundo FIFA 2026™.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Esperamos que estés disfrutando cada estampa y compartiendo la pasión por el fútbol con quienes amas. ¡Buena suerte completando el álbum! 🏆</p>`,
    },
  ],
  de: [
    {
      subject: '📦 Deine Bestellung wird vorbereitet – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Deine Bestellung wird von unserem Team sorgfältig zusammengestellt und geprüft. Wir garantieren, dass jeder Artikel sicher verpackt wird, damit er einwandfrei bei dir ankommt.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Aktueller Status:</strong> Wird im Panini-Lager vorbereitet.</p>`,
    },
    {
      subject: '🏭 Bestellung in Bearbeitung – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Deine Bestellung hat die Qualitätsprüfung bestanden und wird gerade verpackt. Jedes Produkt wird einzeln geprüft, um sicherzustellen, dass es in einwandfreiem Zustand ankommt.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Voraussichtliche Versandzeit:</strong> 1–2 Werktage.</p>`,
    },
    {
      subject: '🚚 Deine Bestellung wurde versandt! – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Gute Neuigkeiten! Deine Bestellung hat gerade unser Lager verlassen und ist auf dem Weg zum Carrier. Du erhältst bald eine Tracking-Nummer.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Aktueller Status:</strong> Versandt ✓</p>`,
    },
    {
      subject: '📬 Tracking-Code verfügbar – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Dein Paket befindet sich beim Carrier und ist unterwegs. Du kannst die Lieferung auf der Website des Carriers mit deiner Bestellnummer verfolgen.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Status:</strong> Unterwegs</p>`,
    },
    {
      subject: '🌍 Im internationalen Transit – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Deine Bestellung befindet sich im internationalen Transit und hat bereits den Exportprozess durchlaufen. Das Paket ist unterwegs und sollte bald ankommen.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Wir überwachen jeden Schritt der Lieferung, um sicherzustellen, dass alles korrekt ankommt.</p>`,
    },
    {
      subject: '✈️ Bestellung im Zielland angekommen – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Tolle Nachrichten! Dein Paket ist im Zielland angekommen und durchläuft gerade die Zollabfertigung.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Nächster Schritt:</strong> Nationale Verteilung für die abschließende Lieferung.</p>`,
    },
    {
      subject: '🏠 Bestellung in lokaler Verteilung – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Deine Bestellung befindet sich in der letzten Verteilungsphase! Das Paket wurde an den lokalen Postdienst übergeben und ist bald bei dir.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Voraussichtliche Lieferung:</strong> Innerhalb von 2–4 Werktagen.</p>`,
    },
    {
      subject: '📍 Deine Bestellung ist in deiner Nähe – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Dein Paket ist ganz nah! Es wurde an das Verteilzentrum in deiner Nähe weitergeleitet.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Bitte stelle sicher, dass jemand an der Lieferadresse ist, um das Paket entgegenzunehmen. Andernfalls hinterlässt der Zusteller eine Benachrichtigung.</p>`,
    },
    {
      subject: '🛵 Heute zur Auslieferung! – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">🎉 Heute ist der große Tag! Deine Bestellung ist zur Auslieferung unterwegs und sollte bis Ende des Tages ankommen.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Bitte stelle sicher, dass jemand an der Lieferadresse anwesend ist.</p>`,
    },
    {
      subject: '📦 Lieferaktualisierung – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Wir überprüfen den Status deiner Bestellung. Manchmal gibt es kleine Verzögerungen seitens des Carriers — keine Sorge, dein Paket wird ständig überwacht.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Status:</strong> Wird vom Carrier überwacht.</p>`,
    },
    {
      subject: '⭐ Wie gefällt dir deine Panini-Erfahrung? – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Wir hoffen, dass du deine WM-Stickersammlung bereits genießt! 🌟</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Teile deine Sammlung mit Freunden und Familie — die Weltmeisterschaft macht mehr Spaß, wenn alle zusammen sammeln! ⚽</p>`,
    },
    {
      subject: '🎁 Spezieller Tipp zum Vervollständigen deines Albums – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Wusstest du, dass ein vollständiges FIFA World Cup 2026™-Album <strong>980 verschiedene Sticker</strong> hat?</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Sammlertipp: Organisiere deine doppelten Sticker, um sie mit Freunden und Familie zu tauschen. Das ist der schnellste und spaßigste Weg, das Album zu vervollständigen! 🏆</p>`,
    },
    {
      subject: '🏆 Nur noch wenige Tage bis zur WM – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Der Countdown zur FIFA World Cup 2026™ läuft! Während das Turnier näher rückt, hält deine Panini-Sammlung jeden historischen Moment fest.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Mit <strong>48 Nationalmannschaften</strong> und Spielern aus aller Welt ist dein Album der ultimative Begleiter für die WM. Genieße jeden Sticker! ⚽🌍</p>`,
    },
    {
      subject: '💛 Danke, dass du Teil der Sammlung bist! – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Ein Monat ist seit deiner Bestellung vergangen und wir möchten dir danken, dass du Panini für deine FIFA World Cup 2026™-Sammlung vertraust.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Wir hoffen, dass du jeden Sticker genießt und die Leidenschaft für Fußball mit deinen Liebsten teilst. Viel Erfolg beim Vervollständigen des Albums! 🏆</p>`,
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
