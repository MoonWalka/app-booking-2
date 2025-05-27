/**
 * Test de la version robuste des paramètres d'entreprise
 * Objectif : Vérifier que la version robuste fonctionne sans erreurs JavaScript
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ParametresEntrepriseRobuste from './src/components/parametres/ParametresEntrepriseRobuste';

// Mock des hooks externes
jest.mock('@/hooks/common', () => ({
  useCompanySearch: () => ({
    searchType: 'siret',
    setSearchType: jest.fn(),
    searchTerm: '',
    setSearchTerm: jest.fn(),
    searchResults: [],
    isSearching: false,
    searchResultsRef: { current: null }
  }),
  useAddressSearch: () => ({
    suggestions: [],
    isLoading: false,
    handleAddressSelect: jest.fn()
  })
}));

jest.mock('@/hooks/parametres/useEntrepriseFormRobuste', () => ({
  useEntrepriseFormRobuste: () => ({
    formData: {
      nom: '',
      siret: '',
      adresse: '',
      ville: '',
      codePostal: '',
      telephone: '',
      email: ''
    },
    loading: false,
    success: false,
    updateFormData: jest.fn(),
    handleChange: jest.fn(),
    handleSelectCompany: jest.fn(),
    handleSubmit: jest.fn()
  })
}));

describe('ParametresEntrepriseRobuste', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ParametresEntrepriseRobuste />
      </BrowserRouter>
    );
  };

  test('devrait se rendre sans erreur JavaScript', () => {
    expect(() => renderComponent()).not.toThrow();
  });

  test('devrait afficher les champs du formulaire', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Paramètres de l'entreprise/i)).toBeInTheDocument();
    });
  });

  test('devrait gérer les changements de champs sans erreur', async () => {
    renderComponent();
    
    const nomField = screen.getByLabelText(/Nom de l'entreprise/i);
    
    expect(() => {
      fireEvent.change(nomField, { target: { value: 'Test Entreprise' } });
    }).not.toThrow();
  });

  test('devrait gérer la soumission du formulaire sans erreur', async () => {
    renderComponent();
    
    const submitButton = screen.getByRole('button', { name: /Enregistrer/i });
    
    expect(() => {
      fireEvent.click(submitButton);
    }).not.toThrow();
  });
});

console.log('✅ Test de la version robuste créé - Prêt pour l'exécution'); 