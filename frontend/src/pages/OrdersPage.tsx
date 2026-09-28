import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { orderService } from '../services/orderService';
import type { Order } from '../types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll();
      setOrders(data);
    } catch (err: any) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId: string) => {
    try {
      const order = await orderService.getById(orderId);
      setSelectedOrder(order);
    } catch (err: any) {
      setError('Failed to load order details');
    }
  };

  const handleGenerateQRCode = async (orderId: string) => {
    try {
      const qrData = await orderService.getQRCode(orderId);
      window.open(`http://localhost:3000${qrData.qrCodeUrl}`, '_blank');
    } catch (err: any) {
      setError('Failed to generate QR code');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'approved': return '#28a745';
      case 'in_production': return '#17a2b8';
      case 'shipped': return '#007bff';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ padding: '20px' }}>Carregando...</div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div style={{ padding: '20px' }}>
        <h1>Meus Pedidos</h1>
        
        {error && <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>}

        {selectedOrder ? (
          <div>
            <button 
              onClick={() => setSelectedOrder(null)}
              style={{ marginBottom: '20px', padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              ← Voltar
            </button>
            
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
              <h2>Detalhes do Pedido</h2>
              <p><strong>ID:</strong> {selectedOrder.id}</p>
              <p><strong>Status:</strong> <span style={{ backgroundColor: getStatusColor(selectedOrder.status), color: 'white', padding: '4px 8px', borderRadius: '4px' }}>{selectedOrder.status}</span></p>
              <p><strong>Total:</strong> R$ {selectedOrder.total.toFixed(2)}</p>
              {selectedOrder.freight && <p><strong>Frete:</strong> R$ {selectedOrder.freight.toFixed(2)}</p>}
              {selectedOrder.deliveryDate && <p><strong>Data de Entrega:</strong> {new Date(selectedOrder.deliveryDate).toLocaleDateString()}</p>}
              {selectedOrder.trackingCode && <p><strong>Código de Rastreamento:</strong> {selectedOrder.trackingCode}</p>}
              <p><strong>Data do Pedido:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              
              <h3 style={{ marginTop: '20px' }}>Itens</h3>
              <ul>
                {selectedOrder.items.map((item, index) => (
                  <li key={index}>
                    {item.productName} - {item.quantity}x - R$ {item.price.toFixed(2)}
                  </li>
                ))}
              </ul>

              {selectedOrder.trackingCode && (
                <button
                  onClick={() => handleGenerateQRCode(selectedOrder.id)}
                  style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Gerar QR Code
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {orders.length === 0 ? (
              <p>Nenhum pedido encontrado.</p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {orders.map((order) => (
                  <div key={order.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0' }}>Pedido #{order.id.substring(0, 8)}</h3>
                      <p style={{ margin: '0', color: '#666' }}>
                        Status: <span style={{ backgroundColor: getStatusColor(order.status), color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{order.status}</span>
                      </p>
                      <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>R$ {order.total.toFixed(2)}</p>
                      <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleViewDetails(order.id)}
                        style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Ver Detalhes
                      </button>
                      {order.trackingCode && (
                        <button
                          onClick={() => handleGenerateQRCode(order.id)}
                          style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          QR Code
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
