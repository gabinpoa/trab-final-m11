import { useState } from 'react';
import Header from '../components/Header';
import { useCartStore } from '../stores/cartStore';
import { orderService } from '../services/orderService';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotal = useCartStore((state) => state.getTotal);
  const navigate = useNavigate();
  
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [freight, setFreight] = useState<number | null>(null);

  const handleCheckout = async () => {
    if (!cep) {
      setError('Por favor, informe o CEP para calcular o frete');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        cep: cep
      };

      const order = await orderService.create(orderData);
      
      clearCart();
      alert('Pedido criado com sucesso! ID: ' + order.id);
      navigate('/orders');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  const calculateFreight = async () => {
    if (!cep || cep.length !== 9) {
      setError('CEP inválido. Use o formato 00000-000');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Calcular frete baseado na UF (mesma tabela do backend)
      const cleanCep = cep.replace(/\D/g, '');
      const uf = await getUFFromCEP(cleanCep);
      const freightValue = calculateFreightByUF(uf);
      setFreight(freightValue);
    } catch (err: any) {
      setError('Erro ao calcular frete');
    } finally {
      setLoading(false);
    }
  };

  const getUFFromCEP = async (cep: string): Promise<string> => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json`);
      const data = await response.json();
      if (data.erro) {
        throw new Error('CEP não encontrado');
      }
      return data.uf;
    } catch (error) {
      // Se falhar, retorna valor padrão
      return 'SP';
    }
  };

  const calculateFreightByUF = (uf: string): number => {
    const freightTable: Record<string, number> = {
      'SP': 15.00,
      'RJ': 20.00,
      'MG': 18.00,
      'RS': 25.00,
      'PR': 22.00,
      'SC': 23.00,
      'BA': 28.00,
      'PE': 30.00,
      'CE': 32.00,
      'MA': 35.00,
      'PI': 38.00,
      'RN': 40.00,
      'PB': 42.00,
      'AL': 45.00,
      'SE': 48.00,
      'TO': 50.00,
      'GO': 35.00,
      'DF': 20.00,
      'ES': 25.00,
      'MT': 40.00,
      'MS': 45.00,
      'AM': 60.00,
      'RR': 70.00,
      'AP': 80.00,
      'AC': 90.00,
      'RO': 85.00,
    };

    return freightTable[uf.toUpperCase()] || 30.00; // Valor padrão
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) {
      value = value.substring(0, 8);
    }
    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5);
    }
    setCep(value);
    setFreight(null);
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
                <p style={{ margin: '0', color: '#666' }}>R$ {Number(item.price).toFixed(2)}</p>
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
                  R$ {Number(item.price * item.quantity).toFixed(2)}
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
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>CEP para cálculo de frete:</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={cep}
                onChange={handleCepChange}
                placeholder="00000-000"
                maxLength={9}
                style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <button
                onClick={calculateFreight}
                disabled={loading}
                style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Calcular Frete
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Subtotal:</span>
            <span>R$ {Number(getTotal()).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Frete:</span>
            <span>{freight !== null ? `R$ ${Number(freight).toFixed(2)}` : 'A calcular'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '20px', marginBottom: '20px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
            <span>Total:</span>
            <span>R$ {Number(getTotal() + (freight || 0)).toFixed(2)}</span>
          </div>
          
          {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleCheckout}
              disabled={loading || items.length === 0}
              style={{ flex: 1, padding: '12px', backgroundColor: loading ? '#6c757d' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px' }}
            >
              {loading ? 'Processando...' : 'Finalizar Pedido'}
            </button>
            <button
              onClick={clearCart}
              style={{ padding: '12px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Limpar Carrinho
            </button>
          </div>
          
          <p style={{ fontSize: '12px', color: '#999', marginTop: '10px', textAlign: 'center' }}>
            ⚠️ Checkout em desenvolvimento - Pagamento não processado
          </p>
        </div>
      </div>
    </div>
  );
}
