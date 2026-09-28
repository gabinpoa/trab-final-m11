import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

// Carregar token do localStorage ao inicializar
const tokenFromStorage = localStorage.getItem('token');

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: tokenFromStorage,
  isAuthenticated: !!tokenFromStorage,
  setUser: (user) => set({ user, isAuthenticated: true }),
  setToken: (token) => {
    set({ token, isAuthenticated: true });
    localStorage.setItem('token', token);
  },
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem('token');
  },
}));
