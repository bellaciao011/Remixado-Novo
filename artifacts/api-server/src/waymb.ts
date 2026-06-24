const WAYMB_BASE_URL = 'https://api.waymb.com';

export interface WayMBReferenceData {
  entity: string;
  reference: string;
  expiresAt: string;
}

export interface WayMBTransactionResponse {
  transactionID: string;
  id: string;
  amount: number;
  method: string;
  referenceData?: WayMBReferenceData;
  generatedMBWay?: boolean;
}

export async function createWayMBTransaction(params: {
  amount: number;
  method: 'multibanco' | 'mbway';
  payerEmail: string;
  payerName: string;
  payerDocument?: string;
  payerPhone?: string;
  paymentDescription: string;
}): Promise<WayMBTransactionResponse> {
  const clientId = process.env.WAYMB_CLIENT_ID;
  const clientSecret = process.env.WAYMB_CLIENT_SECRET;
  const accountEmail = process.env.WAYMB_ACCOUNT_EMAIL;

  if (!clientId || !clientSecret || !accountEmail) {
    throw new Error('Credenciais WayMB não configuradas (WAYMB_CLIENT_ID, WAYMB_CLIENT_SECRET, WAYMB_ACCOUNT_EMAIL)');
  }

  const res = await fetch(`${WAYMB_BASE_URL}/transactions/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      account_email: accountEmail,
      amount: params.amount,
      method: params.method,
      payer: {
        email: params.payerEmail,
        name: params.payerName,
        document: params.payerDocument || null,
        phone: params.payerPhone || null,
      },
      paymentDescription: params.paymentDescription.slice(0, 50),
      currency: 'EUR',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WayMB API erro ${res.status}: ${text}`);
  }

  return res.json() as Promise<WayMBTransactionResponse>;
}

export async function getWayMBTransactionInfo(id: string): Promise<any> {
  const res = await fetch(`${WAYMB_BASE_URL}/transactions/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WayMB info erro ${res.status}: ${text}`);
  }

  return res.json();
}
