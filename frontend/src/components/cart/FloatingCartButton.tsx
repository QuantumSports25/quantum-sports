import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

interface FloatingCartButtonProps {
  onClick: () => void;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ onClick }) => {
  const { items } = useCartStore();
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  if (totalItems === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 bg-primary-500 text-white p-4 rounded-full shadow-2xl hover:bg-primary-600 transition-all duration-300 hover:scale-110 group"
    >
      <ShoppingCart className="w-6 h-6" />
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
        {totalItems > 99 ? '99+' : totalItems}
      </span>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        View Cart ({totalItems} items)
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </button>
  );
};

export default FloatingCartButton;
