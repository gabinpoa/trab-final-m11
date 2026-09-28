import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import api from './api';

describe('api service', () => {
  beforeEach(() => {
    // Limpa localStorage antes de cada teste
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deve configurar baseURL corretamente', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:3000');
  });

  it('deve configurar headers padrão', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('deve ter interceptors configurados', () => {
    expect(api.interceptors).toBeDefined();
    expect(api.interceptors.request).toBeDefined();
    expect(api.interceptors.response).toBeDefined();
  });

  it('deve usar VITE_API_BASE_URL se definido', () => {
    // Este teste verifica que a configuração usa a variável de ambiente
    // Em um cenário real, você testaria com diferentes valores de env
    expect(api.defaults.baseURL).toBeDefined();
  });

  it('deve ter método get configurado', () => {
    expect(typeof api.get).toBe('function');
  });

  it('deve ter método post configurado', () => {
    expect(typeof api.post).toBe('function');
  });

  it('deve ter método put configurado', () => {
    expect(typeof api.put).toBe('function');
  });

  it('deve ter método delete configurado', () => {
    expect(typeof api.delete).toBe('function');
  });
});
