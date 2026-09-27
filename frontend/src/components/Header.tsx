import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{ padding: '20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1 style={{ margin: 0, fontSize: '24px' }}>Loja Personalizada</h1>
      <nav>
        <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: '20px' }}>
          <li><a href="/" style={{ textDecoration: 'none', color: '#333' }}>Home</a></li>
          <li><a href="/products" style={{ textDecoration: 'none', color: '#333' }}>Produtos</a></li>
          <li><a href="/cart" style={{ textDecoration: 'none', color: '#333' }}>Carrinho</a></li>
          <li><a href="/orders" style={{ textDecoration: 'none', color: '#333' }}>Pedidos</a></li>
        </ul>
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span>Olá, {user?.name || 'Usuário'}</span>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
