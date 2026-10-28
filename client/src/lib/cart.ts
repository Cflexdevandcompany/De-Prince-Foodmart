export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  unit?: string | null;
  imageUrl?: string | null;
  price: number;
  oldPrice?: number | null;
  quantity: number;
  inStock?: boolean;
};

export type CheckoutDetails = {
  name: string;
  phone?: string;
  address?: string;
  note?: string;
};

export type SettingsPayload = {
  checkoutGreeting?: string;
  whatsappNumber?: string;
};

const STORAGE_KEY = 'deprince_cart';

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value);
}

export function readCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch (_error) {
    return [];
  }
}

export function saveCartToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function calculateCartTotals(items: CartItem[]) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    itemCount,
    subtotal,
    total: subtotal,
    hasUnavailable: items.some((item) => item.inStock === false),
  };
}

export function buildWhatsAppMessage(items: CartItem[], settings: SettingsPayload | null, details: CheckoutDetails) {
  const greeting = settings?.checkoutGreeting || 'Hello Deprince Foodmart, I would like to order the items below:';
  const lines: string[] = [greeting, ''];

  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name} (${item.unit || 'item'}) — ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)}`);
  });

  const totals = calculateCartTotals(items);
  lines.push('', `TOTAL: ${formatCurrency(totals.total)}`);

  const optionalLines: string[] = [];
  if (details.name) optionalLines.push(`Name: ${details.name}`);
  if (details.phone) optionalLines.push(`Phone: ${details.phone}`);
  if (details.address) optionalLines.push(`Delivery area: ${details.address}`);
  if (details.note) optionalLines.push(`Note: ${details.note}`);

  if (optionalLines.length > 0) {
    lines.push('', ...optionalLines);
  }

  let message = lines.join('\n');
  if (message.length > 3500) {
    const truncatedLines = [greeting, '', ...items.map((item, index) => `${index + 1}. ${item.name} (${item.unit || 'item'}) — ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)}`), '', `TOTAL: ${formatCurrency(totals.total)}`];
    const optional = [
      details.name ? `Name: ${details.name}` : null,
      details.phone ? `Phone: ${details.phone}` : null,
      details.address ? `Delivery area: ${details.address}` : null,
      details.note ? `Note: ${details.note}` : null,
    ].filter(Boolean) as string[];

    let candidate = [...truncatedLines, '', ...optional].join('\n');
    let idx = optional.length;
    while (candidate.length > 3500 && idx > 0) {
      idx -= 1;
      candidate = [...truncatedLines, '', ...optional.slice(0, idx)].join('\n');
    }
    if (idx === 0 && candidate.length > 3500) {
      candidate = [...truncatedLines].join('\n');
    }
    message = candidate;
  }

  return message;
}
