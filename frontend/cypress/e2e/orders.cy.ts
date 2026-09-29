describe('Orders Flow', () => {
  beforeEach(() => {
    // Mock de API para pedidos
    cy.intercept('GET', '/api/orders', {
      statusCode: 200,
      body: [
        {
          id: '1',
          status: 'PENDING',
          total: 49.90,
          createdAt: '2024-01-15T10:00:00Z',
          items: [
            {
              productId: '1',
              productName: 'Camiseta Personalizada',
              quantity: 1,
              price: 49.90
            }
          ]
        },
        {
          id: '2',
          status: 'APPROVED',
          total: 79.80,
          createdAt: '2024-01-14T15:30:00Z',
          items: [
            {
              productId: '1',
              productName: 'Camiseta Personalizada',
              quantity: 2,
              price: 49.90
            }
          ]
        }
      ]
    }).as('getOrders');
  });

  it('deve renderizar página de pedidos', () => {
    cy.visit('/orders');
    cy.wait('@getOrders');
    cy.contains('Meus Pedidos').should('be.visible');
  });

  it('deve mostrar lista de pedidos', () => {
    cy.visit('/orders');
    cy.wait('@getOrders');
    
    cy.contains('PENDING').should('be.visible');
    cy.contains('APPROVED').should('be.visible');
  });

  it('deve mostrar detalhes do pedido ao clicar', () => {
    cy.visit('/orders');
    cy.wait('@getOrders');
    
    cy.contains('PENDING').click();
    cy.contains('Camiseta Personalizada').should('be.visible');
    cy.contains('49.90').should('be.visible');
  });

  it('deve mostrar QR Code para rastreamento', () => {
    // Mock de API para QR Code
    cy.intercept('GET', '/api/orders/1/qrcode', {
      statusCode: 200,
      body: {
        qrCodeUrl: 'http://localhost:3000/uploads/qrcodes/1.png',
        trackingCode: 'ABC123'
      }
    }).as('getQRCode');

    cy.visit('/orders');
    cy.wait('@getOrders');
    
    cy.contains('Rastrear').click();
    cy.wait('@getQRCode');
    
    cy.contains('ABC123').should('be.visible');
  });
});
