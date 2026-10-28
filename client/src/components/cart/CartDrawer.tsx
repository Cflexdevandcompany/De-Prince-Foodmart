import { Link } from 'react-router-dom';
import { formatCurrency } from '../../lib/cart';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const { items, cartOpen, setCartOpen, removeItem, updateQuantity, total, itemCount } = useCart();

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40">
      <div className="absolute right-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-brand-green">Your cart</h2>
            <p className="text-sm text-slate-500">{itemCount} item{itemCount === 1 ? '' : 's'}</p>
          </div>
          <button type="button" className="text-sm font-medium text-brand-primary" onClick={() => setCartOpen(false)}>
            Close
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-500">
              Your cart is empty.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-3 rounded-2xl border border-slate-200 p-3">
                <img src={item.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80'} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-brand-green">{item.name}</h3>
                      <p className="text-xs text-slate-500">{item.unit || 'per pack'}</p>
                    </div>
                    <button type="button" className="text-xs text-red-500" onClick={() => removeItem(item.productId)}>
                      Remove
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center overflow-hidden rounded-full border border-slate-200 bg-white">
                      <button type="button" className="px-2.5 py-1 text-brand-green" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                      <span className="min-w-[36px] text-center text-sm text-slate-700">{item.quantity}</span>
                      <button type="button" className="px-2.5 py-1 text-brand-green" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                    </div>
                    <span className="font-semibold text-brand-primary">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-200 p-4">
          <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-brand-green">{formatCurrency(total)}</span>
          </div>
          <div className="grid gap-2">
            <Link to="/cart" className="inline-flex items-center justify-center rounded-full bg-brand-primary px-4 py-3 text-sm font-medium text-white" onClick={() => setCartOpen(false)}>
              Checkout
            </Link>
            <Link to="/shop" className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-3 text-sm font-medium text-brand-green" onClick={() => setCartOpen(false)}>
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
