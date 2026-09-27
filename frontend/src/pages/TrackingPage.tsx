import { useState } from 'react';
import api from '../services/api';

export default function TrackingPage() {
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTrackingInfo(null);

    if (!trackingCode) {
      setError('Por favor, informe o código de rastreamento');
      return;
    }

    setLoading(true);

    try {
      const response = await api.get(`/qrcode/rastreamento/${trackingCode}`);
      setTrackingInfo(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao buscar informações de rastreamento');
    } finally {
      setLoading(false);
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

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Rastreamento de Pedido</h1>
      
      <form onSubmit={handleSearch} style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Digite o código de rastreamento"
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
          style={{ flex: 1, padding: '12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          {loading ? 'Buscando...' : 'Rastrear'}
        </button>
      </form>

      {error && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {trackingInfo && (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <h2 style={{ marginTop: '0' }}>Informações do Pedido</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <p><strong>ID do Pedido:</strong> {trackingInfo.orderId}</p>
            <p><strong>Status:</strong> <span style={{ backgroundColor: getStatusColor(trackingInfo.status), color: 'white', padding: '4px 8px', borderRadius: '4px' }}>{trackingInfo.status}</span></p>
            <p><strong>Total:</strong> R$ {parseFloat(trackingInfo.total).toFixed(2)}</p>
            {trackingInfo.freight && <p><strong>Frete:</strong> R$ {parseFloat(trackingInfo.freight).toFixed(2)}</p>}
            {trackingInfo.deliveryDate && <p><strong>Data de Entrega:</strong> {new Date(trackingInfo.deliveryDate).toLocaleDateString()}</p>}
            <p><strong>Data do Pedido:</strong> {new Date(trackingInfo.createdAt).toLocaleString()}</p>
          </div>

          <h3>Itens do Pedido</h3>
          <ul style={{ marginBottom: '20px' }}>
            {trackingInfo.items.map((item: any, index: number) => (
              <li key={index}>
                {item.productName} - {item.quantity}x - R$ {parseFloat(item.price).toFixed(2)}
              </li>
            ))}
          </ul>

          {trackingInfo.customizations && trackingInfo.customizations.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3>Personalizações</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                {trackingInfo.customizations.map((customization: any, index: number) => (
                  <div key={index}>
                    <img 
                      src={`http://localhost:3000${customization.thumbnailUrl}`} 
                      alt={customization.filename}
                      style={{ width: '100%', borderRadius: '4px' }}
                    />
                    <p style={{ fontSize: '12px', marginTop: '5px' }}>{customization.filename}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trackingInfo.productionStage && (
            <div style={{ marginBottom: '20px' }}>
              <h3>Etapa de Produção</h3>
              <p><strong>Etapa Atual:</strong> {trackingInfo.productionStage}</p>
            </div>
          )}

          {trackingInfo.history && trackingInfo.history.length > 0 && (
            <div>
              <h3>Histórico de Alterações</h3>
              <ul>
                {trackingInfo.history.map((h: any, index: number) => (
                  <li key={index}>
                    {h.status} - {new Date(h.changedAt).toLocaleString()} {h.changedBy && `(por ${h.changedBy})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
