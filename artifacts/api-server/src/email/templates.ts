import { PANINI_LOGO_BASE64 } from './logo';

export interface OrderInfo {
  customerEmail: string;
  customerName?: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  currency: string;
  shippingAddress?: string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

function buildItemsTable(items: OrderInfo['items'], currency: string): string {
  if (!items || items.length === 0) return '';
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:10px 12px;text-align:left;font-size:13px;color:#555;font-weight:600;border-bottom:2px solid #e0e0e0;">Produto</th>
          <th style="padding:10px 12px;text-align:center;font-size:13px;color:#555;font-weight:600;border-bottom:2px solid #e0e0e0;">Qtd.</th>
          <th style="padding:10px 12px;text-align:right;font-size:13px;color:#555;font-weight:600;border-bottom:2px solid #e0e0e0;">Valor</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
        <tr>
          <td style="padding:10px 12px;font-size:14px;color:#333;border-bottom:1px solid #f0f0f0;">${item.name}</td>
          <td style="padding:10px 12px;font-size:14px;color:#333;text-align:center;border-bottom:1px solid #f0f0f0;">${item.quantity}</td>
          <td style="padding:10px 12px;font-size:14px;color:#333;text-align:right;border-bottom:1px solid #f0f0f0;">${formatCurrency(item.price * item.quantity, currency)}</td>
        </tr>`).join('')}
        <tr>
          <td colspan="2" style="padding:12px;font-size:15px;font-weight:700;color:#1a1a1a;text-align:right;">Total:</td>
          <td style="padding:12px;font-size:15px;font-weight:700;color:#1a1a1a;text-align:right;">${formatCurrency(items.reduce((s, i) => s + i.price * i.quantity, 0), currency)}</td>
        </tr>
      </tbody>
    </table>`;
}

export function buildEmailHtml(subject: string, bodyHtml: string, order: OrderInfo): string {
  const greeting = order.customerName ? `Olá, ${order.customerName}!` : 'Olá!';
  return `<!DOCTYPE html>
<html lang="pt-BR">
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
            <img src="${PANINI_LOGO_BASE64}" alt="Panini" width="140" style="display:block;margin:0 auto;max-width:140px;" />
            <p style="margin:10px 0 0;font-size:13px;color:#1a1a1a;font-weight:600;letter-spacing:1px;text-transform:uppercase;">FIFA World Cup 2026™</p>
          </td>
        </tr>
        <!-- BODY -->
        <tr>
          <td style="padding:32px 36px;">
            <p style="margin:0 0 20px;font-size:17px;font-weight:700;color:#1a1a1a;">${greeting}</p>
            ${bodyHtml}
            <div style="margin-top:28px;padding:20px;background:#fffbe6;border-left:4px solid #FFD600;border-radius:4px;">
              <p style="margin:0;font-size:13px;color:#555;"><strong>Pedido Nº:</strong> ${order.orderId}</p>
              ${order.shippingAddress ? `<p style="margin:6px 0 0;font-size:13px;color:#555;"><strong>Endereço de entrega:</strong> ${order.shippingAddress}</p>` : ''}
              <p style="margin:6px 0 0;font-size:13px;color:#555;"><strong>Total:</strong> ${formatCurrency(order.totalAmount, order.currency)}</p>
            </div>
          </td>
        </tr>
        <!-- FOOTER -->
        <tr>
          <td style="background:#1a1a1a;padding:24px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;color:#FFD600;font-weight:700;">Panini FIFA World Cup 2026™</p>
            <p style="margin:0;font-size:12px;color:#999;">© 2026 Panini. Todos os direitos reservados.</p>
            <p style="margin:8px 0 0;font-size:11px;color:#666;">Este é um e-mail automático. Por favor, não responda diretamente.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildOrderConfirmationEmail(order: OrderInfo): { subject: string; html: string } {
  const subject = '✅ Pedido Confirmado – Panini FIFA World Cup 2026™';
  const html = buildEmailHtml(subject, `
    <p style="font-size:15px;color:#333;line-height:1.6;">Seu pedido foi confirmado com sucesso! 🎉 Estamos preparando sua coleção oficial Panini FIFA World Cup 2026™ com muito cuidado.</p>
    <p style="font-size:15px;color:#333;line-height:1.6;">Em breve você receberá atualizações sobre o envio. Fique de olho nos próximos e-mails!</p>
    ${buildItemsTable(order.items, order.currency)}
    <p style="font-size:14px;color:#555;line-height:1.6;">Se tiver qualquer dúvida, entre em contato conosco respondendo este e-mail.</p>
  `, order);
  return { subject, html };
}

export function buildUpsellConfirmationEmail(order: OrderInfo, upsellProductName: string, upsellAmount: number): { subject: string; html: string } {
  const subject = '🌟 Compra Adicional Confirmada – Panini FIFA World Cup 2026™';
  const html = buildEmailHtml(subject, `
    <p style="font-size:15px;color:#333;line-height:1.6;">Ótima escolha! Sua compra adicional de <strong>${upsellProductName}</strong> foi processada com sucesso por ${formatCurrency(upsellAmount, order.currency)}.</p>
    <p style="font-size:15px;color:#333;line-height:1.6;">Este item será enviado junto com seu pedido principal para otimizar a entrega.</p>
    <p style="font-size:14px;color:#555;line-height:1.6;">Aproveite cada figurinha exclusiva da Copa do Mundo!</p>
  `, order);
  return { subject, html };
}

export function buildLogisticsEmail(order: OrderInfo, step: number): { subject: string; html: string } {
  const templates: { subject: string; body: string }[] = [
    {
      subject: '📦 Seu pedido está sendo preparado – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pedido está sendo separado e conferido com muito cuidado pelo nosso time. Garantimos que cada item será embalado com segurança para chegar perfeito até você.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Status atual:</strong> Em preparação no armazém Panini.</p>`,
    },
    {
      subject: '🏭 Pedido em processamento – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pedido passou pela conferência de qualidade e está sendo embalado. Cada produto é inspecionado individualmente para garantir que chegue em perfeito estado.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Tempo estimado para envio:</strong> 1-2 dias úteis.</p>`,
    },
    {
      subject: '🚚 Seu pedido foi despachado! – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Boa notícia! Seu pedido acabou de sair do nosso armazém e está a caminho da transportadora. Em breve você receberá o código de rastreamento.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Status atual:</strong> Despachado ✓</p>`,
    },
    {
      subject: '📬 Código de rastreamento disponível – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pacote está com a transportadora e em trânsito. Você pode acompanhar a entrega pelo site da transportadora com o número do pedido.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Pedido Nº:</strong> ${order.orderId}<br><strong>Status:</strong> Em trânsito</p>`,
    },
    {
      subject: '🌍 Em trânsito internacional – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pedido está em trânsito e já passou pelo processo de exportação. O pacote está a caminho e deve chegar em breve.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Fique tranquilo — estamos monitorando cada etapa da entrega para garantir que tudo chegue certinho.</p>`,
    },
    {
      subject: '✈️ Pedido chegou ao país destino – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Ótimas notícias! Seu pacote já chegou ao país de destino e está passando pelo processo de desembaraço aduaneiro.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Próxima etapa:</strong> Distribuição nacional para entrega final.</p>`,
    },
    {
      subject: '🏠 Pedido em distribuição local – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pedido está na etapa final de distribuição! O pacote foi entregue ao serviço postal local e em breve estará na sua porta.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;"><strong>Previsão:</strong> Entrega nos próximos 2-4 dias úteis.</p>`,
    },
    {
      subject: '📍 Seu pedido está próximo de você – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Seu pacote está muito perto! Ele foi encaminhado para a unidade de distribuição mais próxima da sua região.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Certifique-se de que haverá alguém no endereço indicado para receber o pacote. Caso contrário, o entregador deixará um aviso.</p>`,
    },
    {
      subject: '🛵 Saiu para entrega hoje! – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">🎉 Hoje é o grande dia! Seu pedido saiu para entrega e deve chegar até o final do dia no endereço informado.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Certifique-se de estar disponível no endereço:<br><em>${order.shippingAddress || 'endereço cadastrado no pedido'}</em></p>`,
    },
    {
      subject: '📦 Atualização de entrega – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Estamos verificando o status do seu pedido. Caso não tenha recebido, fique tranquilo — às vezes há pequenos atrasos por parte da transportadora.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Se precisar de ajuda, entre em contato conosco com o número do pedido: <strong>${order.orderId}</strong>.</p>`,
    },
    {
      subject: '⭐ Como está sua experiência Panini? – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Esperamos que você já esteja aproveitando sua coleção de figurinhas da Copa do Mundo! 🌟</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Sua opinião é muito importante para nós. Como está sendo sua experiência com a coleção Panini FIFA World Cup 2026™?</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Compartilhe sua coleção com amigos e família — a Copa do Mundo é mais divertida quando todo mundo coleciona junto! ⚽</p>`,
    },
    {
      subject: '🎁 Dica especial para completar seu álbum – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Você sabia que um álbum completo da Copa do Mundo FIFA 2026™ tem <strong>980 figurinhas diferentes</strong>?</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Dica de colecionador: organize suas figurinhas repetidas para trocar com amigos e família. É a maneira mais rápida e divertida de completar o álbum!</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Precisa de mais envelopes? Visite nossa loja para complementar sua coleção. 🛒</p>`,
    },
    {
      subject: '🏆 Faltam poucos dias para a Copa – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">A contagem regressiva para a FIFA World Cup 2026™ continua! Enquanto o torneio se aproxima, sua coleção Panini registra cada momento histórico.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Com <strong>48 seleções</strong> e jogadores de todo o mundo, seu álbum é o guia definitivo para acompanhar a Copa. Aproveite cada figurinha! ⚽🌍</p>`,
    },
    {
      subject: '💛 Obrigado por fazer parte da coleção! – Panini FIFA World Cup 2026™',
      body: `<p style="font-size:15px;color:#333;line-height:1.6;">Já se passou um mês desde o seu pedido e queremos agradecer por confiar na Panini para a sua coleção da Copa do Mundo FIFA 2026™.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Esperamos que você esteja aproveitando cada figurinha e compartilhando a paixão pelo futebol com quem você ama.</p>
      <p style="font-size:15px;color:#333;line-height:1.6;">Volte sempre que precisar complementar sua coleção. Boa sorte em completar o álbum! 🏆</p>`,
    },
  ];

  const idx = Math.min(step - 1, templates.length - 1);
  const tpl = templates[idx];

  return {
    subject: tpl.subject,
    html: buildEmailHtml(tpl.subject, tpl.body, order),
  };
}
