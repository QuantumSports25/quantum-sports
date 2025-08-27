import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem, Product } from '../types';

interface CartStore extends Cart {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (couponCode: string) => void;
  removeCoupon: () => void;
  calculateTotals: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalAmount: 0,
      discount: 0,
      shippingCharges: 0,
      couponCode: undefined,

      addItem: (product: Product, quantity = 1) => {
        const state = get();
        const existingItem = state.items.find(item => item.product.id === product.id);

        if (existingItem) {
          set({
            items: state.items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            product,
            quantity,
          };
          set({
            items: [...state.items, newItem],
          });
        }
        get().calculateTotals();
      },

      removeItem: (productId: string) => {
        const state = get();
        set({
          items: state.items.filter(item => item.product.id !== productId),
        });
        get().calculateTotals();
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const state = get();
        set({
          items: state.items.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          ),
        });
        get().calculateTotals();
      },

      clearCart: () => {
        set({
          items: [],
          totalAmount: 0,
          discount: 0,
          shippingCharges: 0,
          couponCode: undefined,
        });
      },

      applyCoupon: (couponCode: string) => {
        // This would typically make an API call to validate the coupon
        // For now, we'll apply a dummy discount
        set({ couponCode, discount: 100 });
        get().calculateTotals();
      },

      removeCoupon: () => {
        set({ couponCode: undefined, discount: 0 });
        get().calculateTotals();
      },

      calculateTotals: () => {
        const state = get();
        const subtotal = state.items.reduce(
          (total, item) => total + (item.product.discountPrice * item.quantity),
          0
        );

        const totalAmount = subtotal;

        set({
          totalAmount: Math.max(0, totalAmount)
        });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
); 