import { Link } from 'react-router-dom';
import { formatCurrency } from '../../lib/cart';
import { useCart } from '../../context/CartContext';

export default function StickyCartBar() {
  const { itemCount, total } = useCart();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-3 shadow-[0_-10px_25px_rgba(0,0,0,0.08)] md:hidden">
      <Link to="/cart" className="flex items-center justify-between rounded-full bg-brand-primary px-4 py-3 text-white">
        <span className="font-medium">View cart ({itemCount})</span>
        <span className="font-bold">{formatCurrency(total)}</span>
      </Link>
    </div>
  );
}
