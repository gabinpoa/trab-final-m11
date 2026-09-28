import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cartStore';

describe('cartStore', () => {
  beforeEach(() => {
    // Reseta o store antes de cada teste
    useCartStore.setState({ items: [] });
  });

  it('deve inicializar com array vazio', () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.items.length).toBe(0);
  });

  it('deve adicionar novo item ao carrinho com addItem', () => {
    const mockItem = {
      productId: '1',
      name: 'Product 1',
      price: 100,
      quantity: 1,
      imageUrl: 'http://example.com/image.jpg',
    };

    useCartStore.getState().addItem(mockItem);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual(mockItem);
  });

  it('deve incrementar quantidade se item já existe no carrinho', () => {
    const mockItem = {
      productId: '1',
      name: 'Product 1',
      price: 100,
      quantity: 1,
      imageUrl: 'http://example.com/image.jpg',
    };

    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().addItem(mockItem);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it('deve adicionar itens diferentes ao carrinho', () => {
    const item1 = {
      productId: '1',
      name: 'Product 1',
      price: 100,
      quantity: 1,
      imageUrl: 'http://example.com/image1.jpg',
    };

    const item2 = {
      productId: '2',
      name: 'Product 2',
      price: 200,
      quantity: 1,
      imageUrl: 'http://example.com/image2.jpg',
    };

    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item2);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(2);
    expect(state.items[0]).toEqual(item1);
    expect(state.items[1]).toEqual(item2);
  });

  it('deve remover item do carrinho com removeItem', () => {
    const item1 = {
      productId: '1',
      name: 'Product 1',
      price: 100,
      quantity: 1,
      imageUrl: 'http://example.com/image1.jpg',
    };

    const item2 = {
      productId: '2',
      name: 'Product 2',
      price: 200,
      quantity: 1,
      imageUrl: 'http://example.com/image2.jpg',
    };

    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item2);

    useCartStore.getState().removeItem('1');

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].productId).toBe('2');
  });

  it('deve atualizar quantidade de item com updateQuantity', () => {
    const mockItem = {
      productId: '1',
      name: 'Product 1',
      price: 100,
      quantity: 1,
      imageUrl: 'http://example.com/image.jpg',
    };

    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().updateQuantity('1', 5);

    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(5);
  });

  it('deve limpar todos os itens com clearCart', () => {
    const item1 = {
      productId: '1',
      name: 'Product 1',
      price: 100,
      quantity: 1,
      imageUrl: 'http://example.com/image1.jpg',
    };

    const item2 = {
      productId: '2',
      name: 'Product 2',
      price: 200,
      quantity: 1,
      imageUrl: 'http://example.com/image2.jpg',
    };

    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item2);

    useCartStore.getState().clearCart();

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
  });

  it('deve calcular total corretamente com getTotal', () => {
    const item1 = {
      productId: '1',
      name: 'Product 1',
      price: 100,
      quantity: 2,
      imageUrl: 'http://example.com/image1.jpg',
    };

    const item2 = {
      productId: '2',
      name: 'Product 2',
      price: 200,
      quantity: 1,
      imageUrl: 'http://example.com/image2.jpg',
    };

    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item2);

    const total = useCartStore.getState().getTotal();
    expect(total).toBe(400); // (100 * 2) + (200 * 1)
  });

  it('deve retornar 0 quando carrinho está vazio com getTotal', () => {
    const total = useCartStore.getState().getTotal();
    expect(total).toBe(0);
  });

  it('deve atualizar quantidade para 0 com updateQuantity', () => {
    const mockItem = {
      productId: '1',
      name: 'Product 1',
      price: 100,
      quantity: 5,
      imageUrl: 'http://example.com/image.jpg',
    };

    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().updateQuantity('1', 0);

    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(0);
  });

  it('deve adicionar item sem imageUrl', () => {
    const mockItem = {
      productId: '1',
      name: 'Product 1',
      price: 100,
      quantity: 1,
    };

    useCartStore.getState().addItem(mockItem);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].imageUrl).toBeUndefined();
  });
});
