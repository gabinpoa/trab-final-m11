describe('Catalog and Cart Flow', () => {
  beforeEach(() => {
    // Mock de API para produtos
    cy.intercept('GET', '/api/products', {
      statusCode: 200,
      body: [
        {
          id: '1',
          name: 'Camiseta Personalizada',
          description: 'Camiseta de algodão com personalização',
          price: 49.90,
          complexity: 1,
          category: 'camisetas',
          imageUrl: 'http://localhost:3000/uploads/products/1/foto.jpg',
          stock: 10
        },
        {
          id: '2',
          name: 'Caneca Personalizada',
          description: 'Caneca de cerâmica com personalização',
          price: 29.90,
          complexity: 1,
          category: 'canecas',
          imageUrl: 'http://localhost:3000/uploads/products/2/foto.jpg',
          stock: 15
        }
      ]
    }).as('getProducts');
  });

  it('deve renderizar página de catálogo', () => {
    cy.visit('/products');
    cy.wait('@getProducts');
    cy.contains('Catálogo de Produtos').should('be.visible');
  });

  it('deve mostrar lista de produtos', () => {
    cy.visit('/products');
    cy.wait('@getProducts');
    cy.contains('Camiseta Personalizada').should('be.visible');
    cy.contains('Caneca Personalizada').should('be.visible');
  });

  it('deve permitir buscar produtos', () => {
    cy.visit('/products');
    cy.wait('@getProducts');
    
    cy.get('input[placeholder*="buscar" i]').type('Camiseta');
    cy.get('button').contains('Buscar').click();
    
    cy.contains('Camiseta Personalizada').should('be.visible');
    cy.contains('Caneca Personalizada').should('not.be.visible');
  });

  it('deve adicionar produto ao carrinho', () => {
    cy.visit('/products');
    cy.wait('@getProducts');
    
    cy.contains('Camiseta Personalizada')
      .parent()
      .find('button')
      .contains('Adicionar')
      .click();
    
    // Verifica se o carrinho foi atualizado (ajustar conforme implementação)
    cy.contains('Carrinho').click();
    cy.contains('Camiseta Personalizada').should('be.visible');
  });

  it('deve filtrar por categoria', () => {
    cy.visit('/products');
    cy.wait('@getProducts');
    
    cy.get('select').select('camisetas');
    
    cy.contains('Camiseta Personalizada').should('be.visible');
    cy.contains('Caneca Personalizada').should('not.be.visible');
  });
});
