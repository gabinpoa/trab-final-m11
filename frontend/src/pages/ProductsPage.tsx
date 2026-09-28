import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { productService } from '../services/productService';
import type { Product } from '../types';
import { useCartStore } from '../stores/cartStore';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (err: any) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (search) {
      try {
        const data = await productService.search(search);
        setProducts(data);
      } catch (err: any) {
        setError('Failed to search products');
      }
    } else {
      loadProducts();
    }
  };

  const handleCategory = async (cat: string) => {
    setCategory(cat);
    if (cat) {
      try {
        const data = await productService.getByCategory(cat);
        setProducts(data);
      } catch (err: any) {
        setError('Failed to filter by category');
      }
    } else {
      loadProducts();
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    alert(`${product.name} adicionado ao carrinho!`);
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
        <h1>Catálogo de Produtos</h1>
        
        {/* Filtros */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
          />
          <button 
            onClick={handleSearch}
            style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Buscar
          </button>
          <select
            value={category}
            onChange={(e) => handleCategory(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="">Todas as categorias</option>
            <option value="camisetas">Camisetas</option>
            <option value="canecas">Canecas</option>
            <option value="poster">Posters</option>
            <option value="chaveiros">Chaveiros</option>
          </select>
        </div>

        {error && <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>}

        {/* Lista de produtos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {products.map((product) => (
            <div key={product.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column' }}>
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }}
                />
              )}
              <h3 style={{ margin: '0 0 10px 0' }}>{product.name}</h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px', flex: 1 }}>{product.description}</p>
              <p style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '5px' }}>R$ {Number(product.price).toFixed(2)}</p>
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>Complexidade: {product.complexity}</p>
              <p style={{ fontSize: '12px', color: product.stock > 0 ? 'green' : 'red', marginBottom: '10px' }}>
                Estoque: {product.stock}
              </p>
              <button
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === 0}
                style={{
                  padding: '10px',
                  backgroundColor: product.stock > 0 ? '#28a745' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Sem Estoque'}
              </button>
            </div>
          ))}
        </div>

        {products.length === 0 && !loading && !error && (
          <p style={{ textAlign: 'center', marginTop: '40px' }}>Nenhum produto encontrado.</p>
        )}
      </div>
    </div>
  );
}
