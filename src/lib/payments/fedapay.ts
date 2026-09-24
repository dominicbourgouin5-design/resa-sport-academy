/**
 * Client FedaPay — API REST
 * Docs : https://docs.fedapay.com/api-reference
 */

const SECRET_KEY = process.env.FEDAPAY_SECRET_KEY ?? '';
const ENV = process.env.FEDAPAY_ENV ?? 'sandbox';

const API_BASE =
  ENV === 'live'
    ? 'https://api.fedapay.com/v1'
    : 'https://sandbox-api.fedapay.com/v1';

const CHECKOUT_BASE =
  ENV === 'live'
    ? 'https://process.fedapay.com'
    : 'https://sandbox-process.fedapay.com';

// ─── Types ──────────────────────────────────────────────────
export type FedaPayTransaction = {
  id: number;
  reference: string;
  amount: number;
  status: string;
  currency: { iso: string };
  created_at: string;
  customer?: { firstname?: string; lastname?: string; email?: string };
  mode?: string;
};

// ─── Nettoyage du numéro de téléphone ───────────────────────
/**
 * FedaPay attend :
 *   { number: "97000000", country: "bj" }  // 2 lettres ISO
 *
 * On retire les espaces, tirets, parenthèses, et le préfixe +225/00225.
 * On déduit le pays du préfixe (fallback : ci).
 */
function parsePhone(rawPhone?: string): { number: string; country: string } | null {
  if (!rawPhone) return null;

  const cleaned = rawPhone.replace(/[\s\-().]/g, '');
  let country = 'ci'; // Côte d'Ivoire par défaut

  // Détection pays par préfixe
  if (cleaned.startsWith('+225') || cleaned.startsWith('00225')) {
    country = 'ci';
  } else if (cleaned.startsWith('+229') || cleaned.startsWith('00229')) {
    country = 'bj';
  } else if (cleaned.startsWith('+228') || cleaned.startsWith('00228')) {
    country = 'tg';
  } else if (cleaned.startsWith('+221') || cleaned.startsWith('00221')) {
    country = 'sn';
  } else if (cleaned.startsWith('+226') || cleaned.startsWith('00226')) {
    country = 'bf';
  } else if (cleaned.startsWith('+223') || cleaned.startsWith('00223')) {
    country = 'ml';
  } else if (cleaned.startsWith('+1')) {
    country = 'us';
  }

  // Retirer l'indicatif (+225, 00225, 225, etc.)
  let number = cleaned.replace(/^(\+225|00225|225|\+229|00229|229|\+228|00228|228|\+221|00221|221|\+226|00226|226|\+223|00223|223|\+1|001)/, '');
  number = number.replace(/\D/g, '');

  if (number.length < 6) return null;

  return { number, country };
}

// ─── Helper : requête API FedaPay ───────────────────────────
async function fedapayFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  if (!SECRET_KEY) {
    throw new Error('FEDAPAY_SECRET_KEY manquante dans .env.local');
  }

  const url = `${API_BASE}${endpoint}`;
  console.log('[FedaPay] ⏩ Request:', {
    method: options.method ?? 'GET',
    url,
    body: options.body ? JSON.parse(String(options.body)) : null
  });

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SECRET_KEY}`,
      ...(options.headers ?? {})
    }
  });

  const data = await res.json();

  console.log('[FedaPay] ⏪ Response:', {
    status: res.status,
    ok: res.ok,
    body: data
  });

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.errors?.[0]?.message ||
      `FedaPay API error (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

// ─── Créer une transaction ──────────────────────────────────
export async function createFedaPayTransaction(params: {
  amount: number;
  description: string;
  callbackUrl: string;
  customer: {
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
  };
  currency?: string;
  metadata?: Record<string, any>;
}): Promise<FedaPayTransaction> {
  const phone = parsePhone(params.customer.phone);

  const body = {
    description: params.description,
    amount: params.amount,
    currency: { iso: params.currency ?? 'XOF' },
    callback_url: params.callbackUrl,
    customer: {
      firstname: params.customer.firstname,
      lastname: params.customer.lastname,
      email: params.customer.email,
      // ─── Fix : phone_number = { number, country } ───
      ...(phone
        ? { phone_number: { number: phone.number, country: phone.country } }
        : {})
    },
    ...(params.metadata ? { metadata: params.metadata } : {})
  };

  const data = await fedapayFetch('/transactions', {
    method: 'POST',
    body: JSON.stringify(body)
  });

  return data['v1/transaction'] ?? data.transaction ?? data;
}

// ─── Générer le token de paiement ───────────────────────────
export async function generatePaymentToken(transactionId: number): Promise<string> {
  const data = await fedapayFetch(`/transactions/${transactionId}/token`, {
    method: 'POST'
  });
  const token = data.token;
  if (!token) throw new Error('Token FedaPay introuvable dans la réponse');
  return token;
}

// ─── Récupérer une transaction ──────────────────────────────
export async function getFedaPayTransaction(transactionId: number): Promise<FedaPayTransaction> {
  const data = await fedapayFetch(`/transactions/${transactionId}`);
  return data['v1/transaction'] ?? data.transaction ?? data;
}

// ─── Construire l'URL de paiement ───────────────────────────
export function buildPaymentUrl(token: string): string {
  return `${CHECKOUT_BASE}/${token}`;
}

// ─── Helpers statuts ────────────────────────────────────────
export function isPaidStatus(status: string): boolean {
  return status === 'approved' || status === 'transferred';
}

export function isFailedStatus(status: string): boolean {
  return status === 'declined' || status === 'canceled';
}