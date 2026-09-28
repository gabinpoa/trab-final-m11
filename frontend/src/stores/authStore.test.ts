import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Limpa o localStorage antes de cada teste
    localStorage.clear();
    // Reseta o store
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deve inicializar com estado vazio', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('deve atualizar usuário e isAuthenticated com setUser', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    };

    useAuthStore.getState().setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('deve armazenar token no localStorage com setToken', () => {
    const mockToken = 'mock-jwt-token';

    useAuthStore.getState().setToken(mockToken);

    const state = useAuthStore.getState();
    expect(state.token).toBe(mockToken);
    expect(localStorage.getItem('token')).toBe(mockToken);
  });

  it('deve limpar estado e localStorage com logout', () => {
    // Primeiro configura um estado
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    };
    const mockToken = 'mock-jwt-token';

    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setToken(mockToken);

    // Verifica que foi configurado
    let state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
    expect(localStorage.getItem('token')).toBe(mockToken);

    // Faz logout
    useAuthStore.getState().logout();

    // Verifica que foi limpo
    state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('deve permitir múltiplas chamadas de setUser', () => {
    const user1 = {
      id: '1',
      email: 'user1@example.com',
      name: 'User 1',
      role: 'user',
    };

    const user2 = {
      id: '2',
      email: 'user2@example.com',
      name: 'User 2',
      role: 'admin',
    };

    useAuthStore.getState().setUser(user1);
    let state = useAuthStore.getState();
    expect(state.user).toEqual(user1);

    useAuthStore.getState().setUser(user2);
    state = useAuthStore.getState();
    expect(state.user).toEqual(user2);
  });

  it('deve permitir múltiplas chamadas de setToken', () => {
    const token1 = 'token-1';
    const token2 = 'token-2';

    useAuthStore.getState().setToken(token1);
    let state = useAuthStore.getState();
    expect(state.token).toBe(token1);
    expect(localStorage.getItem('token')).toBe(token1);

    useAuthStore.getState().setToken(token2);
    state = useAuthStore.getState();
    expect(state.token).toBe(token2);
    expect(localStorage.getItem('token')).toBe(token2);
  });
});
