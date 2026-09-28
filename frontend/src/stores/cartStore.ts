import { create } from 'zustand';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

// Carregar carrinho do localStorage ao inicializar
const cartFromStorage = localStorage.getItem('cart');
const initialItems = cartFromStorage ? JSON.parse(cartFromStorage) : [];

export const useCartStore = create<CartState>((set, get) => ({
  items: initialItems,
  addItem: (item) => set((state) => {
    const existingItem = state.items.find((i) => i.productId === item.productId);
    let newItems;
    if (existingItem) {
      newItems = state.items.map((i) =>
        i.productId === item.productId
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      newItems = [...state.items, item];
    }
    localStorage.setItem('cart', JSON.stringify(newItems));
    return { items: newItems };
  }),
  removeItem: (productId) => set((state) => {
    const newItems = state.items.filter((i) => i.productId !== productId);
    localStorage.setItem('cart', JSON.stringify(newItems));
    return { items: newItems };
  }),
  updateQuantity: (productId, quantity) => set((state) => {
    const newItems = state.items.map((i) =>
      i.productId === productId ? { ...i, quantity } : i
    );
    localStorage.setItem('cart', JSON.stringify(newItems));
    return { items: newItems };
  }),
  clearCart: () => {
    localStorage.removeItem('cart');
    return set({ items: [] });
  },
  getTotal: () => {
    const state = get();
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
