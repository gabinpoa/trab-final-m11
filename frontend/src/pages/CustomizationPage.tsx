import { useState } from 'react';
import Header from '../components/Header';
import { customizationService } from '../services/customizationService';

export default function CustomizationPage() {
  const [orderId, setOrderId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!file) {
      setError('Por favor, selecione um arquivo');
      return;
    }

    if (!orderId) {
      setError('Por favor, informe o ID do pedido');
      return;
    }

    setLoading(true);

    try {
      await customizationService.upload(orderId, file, comment);
      setSuccess(true);
      setFile(null);
      setComment('');
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao fazer upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Upload de Personalização</h1>
        
        {success && (
          <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
            Personalização enviada com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              ID do Pedido:
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Arquivo (JPG, PNG, WEBP, PDF - máx 10MB):
            </label>
            <input
              id="file-input"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handleFileChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              required
            />
            {file && (
              <p style={{ marginTop: '5px', fontSize: '14px', color: '#666' }}>
                Selecionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Comentário (opcional):
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '100px' }}
              placeholder="Descreva sua personalização..."
            />
          </div>

          {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
            }}
          >
            {loading ? 'Enviando...' : 'Enviar Personalização'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h3 style={{ marginTop: '0' }}>Instruções:</h3>
          <ul>
            <li>Formatos aceitos: JPG, PNG, WEBP, PDF</li>
            <li>Tamanho máximo: 10MB</li>
            <li>Resolução mínima: 300dpi</li>
            <li>O arquivo será validado automaticamente</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
