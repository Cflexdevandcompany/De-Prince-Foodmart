import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { buildWhatsAppMessage, calculateCartTotals, formatCurrency } from '../lib/cart';
import { useCart } from '../context/CartContext';

const API_BASE = 'http://localhost:4000/api';

type Settings = {
  whatsappNumber?: string;
  checkoutGreeting?: string;
};

export default function CartPage() {
  const { items, validationWarnings, validateCart, clearCart, updateQuantity, removeItem } = useCart();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', note: '' });

  useEffect(() => {
    validateCart();

    async function loadSettings() {
      const response = await fetch(`${API_BASE}/settings`);
      const json = await response.json();
      if (json.success) setSettings(json.data);
    }

    loadSettings();
  }, []);

  const totals = calculateCartTotals(items);
  const hasUnavailable = items.some((item) => !item.inStock);

  const handleCheckout = () => {
    if (!customer.name.trim()) return;
    if (items.length === 0 || hasUnavailable) return;

    const message = buildWhatsAppMessage(items, settings, {
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      note: customer.note,
    });
    const target = `https://wa.me/${settings?.whatsappNumber || '2348072206245'}?text=${encodeURIComponent(message)}`;
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  if (items.length === 0) {
    return (
      <Card className="p-10 text-center">
        <h1 className="text-3xl font-black text-brand-green">Your cart is empty</h1>
        <p className="mt-3 text-slate-600">Add a few pantry staples and essentials before checking out.</p>
        <Link to="/shop" className="mt-6 inline-flex rounded-full bg-brand-primary px-5 py-3 text-sm font-medium text-white">
          Continue shopping
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="p-5">
        <h1 className="text-3xl font-black text-brand-green">Cart</h1>

        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-3 rounded-2xl border border-slate-200 p-3">
              <img src={item.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80'} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-brand-green">{item.name}</h2>
                    <p className="text-xs text-slate-500">{item.unit || 'per pack'}</p>
                  </div>
                  <button type="button" className="text-xs text-red-500" onClick={() => removeItem(item.productId)}>
                    Remove
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center overflow-hidden rounded-full border border-slate-200 bg-white">
                    <button type="button" className="px-2.5 py-1 text-brand-green" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                    <span className="min-w-[38px] text-center text-sm">{item.quantity}</span>
                    <button type="button" className="px-2.5 py-1 text-brand-green" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                  </div>
                  <span className="font-semibold text-brand-primary">{formatCurrency(item.price * item.quantity)}</span>
                </div>

                {!item.inStock ? <p className="mt-2 text-xs text-red-600">This item is currently unavailable.</p> : null}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-2xl font-bold text-brand-green">Checkout</h2>

        <div className="mt-5 space-y-4">
          <input
            value={customer.name}
            onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
            placeholder="Customer name *"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
          />
          <input
            value={customer.phone}
            onChange={(event) => setCustomer({ ...customer, phone: event.target.value })}
            placeholder="Phone (optional)"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
          />
          <input
            value={customer.address}
            onChange={(event) => setCustomer({ ...customer, address: event.target.value })}
            placeholder="Delivery area / address (optional)"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
          />
          <textarea
            value={customer.note}
            onChange={(event) => setCustomer({ ...customer, note: event.target.value })}
            placeholder="Note (optional)"
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
          />
        </div>

        {validationWarnings.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {validationWarnings.map((warning) => (
              <div key={warning}>{warning}</div>
            ))}
          </div>
        ) : null}

        <div className="mt-6 space-y-3 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Items</span>
            <span>{totals.itemCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Total</span>
            <span className="text-xl font-bold text-brand-green">{formatCurrency(totals.total)}</span>
          </div>
          <Button type="button" onClick={handleCheckout} className="w-full" disabled={!customer.name.trim() || hasUnavailable}>
            Checkout via WhatsApp
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={clearCart}>
            Clear cart
          </Button>
        </div>
      </Card>
    </div>
  );
}
