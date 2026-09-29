describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('deve renderizar a página de login', () => {
    cy.contains('Login').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('deve mostrar erro ao tentar login com credenciais inválidas', () => {
    cy.get('input[type="email"]').type('invalid@test.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Verifica se há mensagem de erro (ajustar seletor conforme implementação)
    cy.contains('erro', { matchCase: false }).should('be.visible');
  });

  it('deve redirecionar para home após login bem-sucedido', () => {
    // Mock de API response para login bem-sucedido
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        user: { id: 1, email: 'test@test.com', name: 'Test User' }
      }
    }).as('loginRequest');

    cy.get('input[type="email"]').type('test@test.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.url().should('not.include', '/login');
  });

  it('deve ter link para página de registro', () => {
    cy.contains('Registrar').should('be.visible');
    cy.contains('Registrar').click();
    cy.url().should('include', '/register');
  });
});
