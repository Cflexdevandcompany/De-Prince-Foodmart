import { describe, expect, it } from 'vitest';
import { buildWhatsAppMessage, calculateCartTotals, type CartItem } from './cart';

describe('cart totals', () => {
  it('sums line items and count correctly', () => {
    const items: CartItem[] = [
      { productId: '1', slug: 'rice', name: 'Rice', price: 9500, quantity: 2 },
      { productId: '2', slug: 'oil', name: 'Oil', price: 12500, quantity: 1 },
    ];

    expect(calculateCartTotals(items)).toEqual({
      itemCount: 3,
      subtotal: 31500,
      total: 31500,
      hasUnavailable: false,
    });
  });
});

describe('whatsapp message builder', () => {
  it('formats a plain-text order message with totals and customer details', () => {
    const items: CartItem[] = [
      { productId: '1', slug: 'rice', name: 'Premium Parboiled Rice', unit: 'per bag', price: 95000, quantity: 2 },
      { productId: '2', slug: 'oil', name: 'Vegetable Oil 5L', unit: 'per gallon', price: 12500, quantity: 1 },
      { productId: '3', slug: 'garri', name: 'Garri White', unit: 'per paint bucket', price: 2800, quantity: 3 },
    ];

    const message = buildWhatsAppMessage(items, { checkoutGreeting: 'Hello Deprince Foodmart, I would like to order the items below:' }, {
      name: 'Ada Obi',
      phone: '080XXXXXXXX',
      address: 'Ajah',
      note: 'Please call before delivery.',
    });

    expect(message).toContain('Hello Deprince Foodmart, I would like to order the items below:');
    expect(message).toContain('1. Premium Parboiled Rice (per bag) — 2 x ₦95,000 = ₦190,000');
    expect(message).toContain('3. Garri White (per paint bucket) — 3 x ₦2,800 = ₦8,400');
    expect(message).toContain('TOTAL: ₦210,900');
    expect(message).toContain('Name: Ada Obi');
    expect(message).toContain('Phone: 080XXXXXXXX');
    expect(message).toContain('Delivery area: Ajah');
    expect(message).toContain('Note: Please call before delivery.');
  });
});
