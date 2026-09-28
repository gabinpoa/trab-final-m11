import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { adminService } from '../services/adminService';
import { orderService } from '../services/orderService';
import type { Order } from '../types';

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productionQueue, setProductionQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'production'>('orders');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'orders') {
        const data = await orderService.getAll();
        setOrders(data);
      } else {
        const data = await adminService.getProductionQueue();
        setProductionQueue(data);
      }
    } catch (err: any) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId: string) => {
    try {
      await adminService.approveOrder(orderId);
      alert('Pedido aprovado com sucesso!');
      loadData();
    } catch (err: any) {
      setError('Failed to approve order');
    }
  };

  const handleReject = async (orderId: string) => {
    const reason = prompt('Motivo da rejeição:');
    if (reason) {
      try {
        await adminService.rejectOrder(orderId, reason);
        alert('Pedido rejeitado com sucesso!');
        loadData();
      } catch (err: any) {
        setError('Failed to reject order');
      }
    }
  };

  const handleUpdateStage = async (queueId: string, currentStage: string) => {
    const stages = ['pending', 'printing', 'cutting', 'assembly', 'quality_check', 'packaging', 'shipped'];
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      try {
        await adminService.updateProductionStage(queueId, nextStage);
        alert(`Etapa atualizada para ${nextStage}!`);
        loadData();
      } catch (err: any) {
        setError('Failed to update stage');
      }
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
        <h1>Painel Admin</h1>
        
        {error && <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>}

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'orders' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            Pedidos
          </button>
          <button
            onClick={() => setActiveTab('production')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'production' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Fila de Produção
          </button>
        </div>

        {activeTab === 'orders' ? (
          <div>
            <h2>Pedidos Pendentes de Aprovação</h2>
            {orders.filter(o => o.status === 'pending').length === 0 ? (
              <p>Nenhum pedido pendente.</p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {orders.filter(o => o.status === 'pending').map((order) => (
                  <div key={order.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
                    <h3>Pedido #{order.id.substring(0, 8)}</h3>
                    <p><strong>Total:</strong> R$ {order.total.toFixed(2)}</p>
                    <p><strong>Data:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleApprove(order.id)}
                        style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleReject(order.id)}
                        style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Rejeitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2>Fila de Produção</h2>
            {productionQueue.length === 0 ? (
              <p>Nenhum item na fila de produção.</p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {productionQueue.map((item) => (
                  <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
                    <h3>Pedido #{item.orderId.substring(0, 8)}</h3>
                    <p><strong>Etapa:</strong> <span style={{ backgroundColor: getStatusColor(item.stage), color: 'white', padding: '4px 8px', borderRadius: '4px' }}>{item.stage}</span></p>
                    {item.startedAt && <p><strong>Iniciado:</strong> {new Date(item.startedAt).toLocaleString()}</p>}
                    {item.completedAt && <p><strong>Concluído:</strong> {new Date(item.completedAt).toLocaleString()}</p>}
                    <div style={{ marginTop: '10px' }}>
                      <button
                        onClick={() => handleUpdateStage(item.id, item.stage)}
                        style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Avançar Etapa
                      </button>
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
