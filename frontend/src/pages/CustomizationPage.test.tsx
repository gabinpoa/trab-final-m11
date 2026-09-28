import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CustomizationPage from './CustomizationPage';
import { customizationService } from '../services/customizationService';

// Mock do customizationService
vi.mock('../services/customizationService');

describe('CustomizationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (component: React.ReactNode) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('deve renderizar título da página', () => {
    renderWithRouter(<CustomizationPage />);
    expect(screen.getByText('Upload de Personalização')).toBeInTheDocument();
  });

  it('deve renderizar campo de ID do pedido', () => {
    renderWithRouter(<CustomizationPage />);
    expect(screen.getByText('ID do Pedido:')).toBeInTheDocument();
  });

  it('deve renderizar campo de comentário', () => {
    renderWithRouter(<CustomizationPage />);
    expect(screen.getByText(/Comentário/i)).toBeInTheDocument();
  });

  it('deve renderizar botão de envio', () => {
    renderWithRouter(<CustomizationPage />);
    const submitButton = screen.getByRole('button', { name: /Enviar Personalização/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('deve renderizar instruções', () => {
    renderWithRouter(<CustomizationPage />);
    expect(screen.getByText('Instruções:')).toBeInTheDocument();
    expect(screen.getByText(/Formatos aceitos/i)).toBeInTheDocument();
    expect(screen.getByText(/Tamanho máximo/i)).toBeInTheDocument();
  });
});
