describe('Customization Flow', () => {
  beforeEach(() => {
    cy.visit('/customization');
  });

  it('deve renderizar página de personalização', () => {
    cy.contains('Upload de Personalização').should('be.visible');
    cy.contains('ID do Pedido').should('be.visible');
    cy.contains('Arquivo').should('be.visible');
    cy.contains('Comentário').should('be.visible');
  });

  it('deve mostrar erro ao tentar enviar sem arquivo', () => {
    cy.get('input[placeholder*="ID" i]').type('123');
    cy.get('button[type="submit"]').click();
    
    cy.contains('arquivo', { matchCase: false }).should('be.visible');
  });

  it('deve mostrar erro ao tentar enviar sem ID do pedido', () => {
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.jpg');
    cy.get('button[type="submit"]').click();
    
    cy.contains('ID', { matchCase: false }).should('be.visible');
  });

  it('deve permitir upload de arquivo', () => {
    cy.get('input[placeholder*="ID" i]').type('123');
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.jpg');
    
    cy.contains('Selecionado').should('be.visible');
  });

  it('deve enviar personalização com sucesso', () => {
    // Mock de API response
    cy.intercept('POST', '/api/customizations/upload', {
      statusCode: 200,
      body: { message: 'Personalização enviada com sucesso' }
    }).as('uploadRequest');

    cy.get('input[placeholder*="ID" i]').type('123');
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.jpg');
    cy.get('textarea').type('Personalização especial');
    cy.get('button[type="submit"]').click();

    cy.wait('@uploadRequest');
    cy.contains('sucesso', { matchCase: false }).should('be.visible');
  });

  it('deve mostrar instruções de upload', () => {
    cy.contains('Instruções').should('be.visible');
    cy.contains('Formatos aceitos').should('be.visible');
    cy.contains('Tamanho máximo').should('be.visible');
    cy.contains('Resolução mínima').should('be.visible');
  });
});
