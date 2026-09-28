import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderWithRouter = (component: React.ReactNode) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('deve renderizar o título de login', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });

  it('deve renderizar campos de email e senha', () => {
    renderWithRouter(<LoginPage />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBe(1);
    const passwordInput = screen.getByRole('textbox', { type: 'password' });
    expect(passwordInput).toBeInTheDocument();
  });

  it('deve renderizar botão de submit', () => {
    renderWithRouter(<LoginPage />);
    const submitButton = screen.getByRole('button', { type: 'submit' });
    expect(submitButton).toBeInTheDocument();
  });

  it('deve ter link para registro', () => {
    renderWithRouter(<LoginPage />);
    const registerLink = screen.getByText(/registre-se/i);
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });
});
