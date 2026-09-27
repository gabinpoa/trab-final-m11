export default function HomePage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Bem-vindo à Loja de Produtos Personalizados</h1>
      <p>Selecione uma opção no menu acima:</p>
      <ul>
        <li><a href="/products">Ver Catálogo de Produtos</a></li>
        <li><a href="/cart">Carrinho</a></li>
        <li><a href="/orders">Meus Pedidos</a></li>
      </ul>
    </div>
  );
}
