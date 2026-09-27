import Header from '../components/Header';
import { useCartStore } from '../stores/cartStore';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotal = useCartStore((state) => state.getTotal);

  const handleCheckout = () => {
    alert('Funcionalidade de checkout em desenvolvimento');
  };

  if (items.length === 0) {
    return (
      <div>
        <Header />
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Carrinho</h1>
          <p>Seu carrinho está vazio.</p>
          <a href="/products" style={{ color: '#007bff' }}>Ver produtos</a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Carrinho</h1>
        
        {/* Lista de itens */}
        <div style={{ marginBottom: '20px' }}>
          {items.map((item) => (
            <div key={item.productId} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              {item.imageUrl && (
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{item.name}</h3>
                <p style={{ margin: '0', color: '#666' }}>R$ {item.price.toFixed(2)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                  style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
              <div style={{ textAlign: 'right', minWidth: '100px' }}>
                <p style={{ margin: '0', fontWeight: 'bold', fontSize: '18px' }}>
                  R$ {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => removeItem(item.productId)}
                style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Remover
              </button>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Subtotal:</span>
            <span>R$ {getTotal().toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Frete:</span>
            <span>A calcular</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '20px', marginBottom: '20px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
            <span>Total:</span>
            <span>R$ {getTotal().toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleCheckout}
              style={{ flex: 1, padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
            >
              Finalizar Pedido
            </button>
            <button
              onClick={clearCart}
              style={{ padding: '12px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Limpar Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
