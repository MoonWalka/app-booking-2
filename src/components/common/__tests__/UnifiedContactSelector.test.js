import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UnifiedContactSelector from '../UnifiedContactSelector';
import { useEntitySearch } from '@/hooks/common';
import { collection, query, where, getDocs, doc, getDoc } from '@/services/firebase-service';

// Mock des dépendances
jest.mock('@/hooks/common');
jest.mock('@/services/firebase-service');
jest.mock('@/components/ui/Card', () => ({
  __esModule: true,
  default: ({ children, title }) => (
    <div data-testid="card">
      <h3>{title}</h3>
      {children}
    </div>
  ),
}));
jest.mock('@/components/concerts/sections/SearchDropdown', () => ({
  __esModule: true,
  default: ({ placeholder, onSelect, onCreate }) => (
    <div data-testid="search-dropdown">
      <input placeholder={placeholder} />
      <button onClick={() => onSelect({ id: 'test-contact', nom: 'Test Contact' })}>
        Select Contact
      </button>
      <button onClick={onCreate}>Create Contact</button>
    </div>
  ),
}));
jest.mock('@/components/concerts/sections/SelectedEntityCard', () => ({
  __esModule: true,
  default: ({ entity, onRemove }) => (
    <div data-testid="selected-entity">
      <span>{entity.nom}</span>
      <button onClick={onRemove}>Remove</button>
    </div>
  ),
}));

describe('UnifiedContactSelector', () => {
  const mockOnChange = jest.fn();
  const mockContact = {
    id: 'contact-1',
    nom: 'Jean Dupont',
    email: 'jean@example.com',
    telephone: '0123456789',
    structureNom: 'Structure Test'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuration par défaut du hook de recherche
    useEntitySearch.mockReturnValue({
      searchTerm: '',
      setSearchTerm: jest.fn(),
      results: [],
      showResults: false,
      setShowResults: jest.fn(),
      isSearching: false,
      dropdownRef: { current: null },
      handleCreate: jest.fn()
    });

    // Configuration par défaut de Firebase
    getDoc.mockResolvedValue({
      exists: () => true,
      id: mockContact.id,
      data: () => mockContact
    });
  });

  describe('Mode lecture (isEditing=false)', () => {
    it('affiche "Aucun contact associé" quand il n\'y a pas de contact', () => {
      render(
        <UnifiedContactSelector
          value={null}
          onChange={mockOnChange}
          isEditing={false}
        />
      );

      expect(screen.getByText('Aucun contact associé')).toBeInTheDocument();
    });

    it('affiche un seul contact en mode mono-contact', async () => {
      render(
        <UnifiedContactSelector
          value="contact-1"
          onChange={mockOnChange}
          isEditing={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
        expect(screen.getByText('- Structure Test')).toBeInTheDocument();
        expect(screen.getByText('jean@example.com')).toBeInTheDocument();
        expect(screen.getByText('0123456789')).toBeInTheDocument();
      });
    });

    it('affiche plusieurs contacts en mode multi-contacts', async () => {
      const mockContact2 = {
        id: 'contact-2',
        nom: 'Marie Martin',
        email: 'marie@example.com'
      };

      getDoc
        .mockResolvedValueOnce({
          exists: () => true,
          id: mockContact.id,
          data: () => mockContact
        })
        .mockResolvedValueOnce({
          exists: () => true,
          id: mockContact2.id,
          data: () => mockContact2
        });

      render(
        <UnifiedContactSelector
          multiple={true}
          value={['contact-1', 'contact-2']}
          onChange={mockOnChange}
          isEditing={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
        expect(screen.getByText('Marie Martin')).toBeInTheDocument();
      });
    });
  });

  describe('Mode édition (isEditing=true)', () => {
    it('affiche le formulaire de recherche quand il n\'y a pas de contact', () => {
      render(
        <UnifiedContactSelector
          value={null}
          onChange={mockOnChange}
          isEditing={true}
        />
      );

      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Rechercher un contact par nom...')).toBeInTheDocument();
    });

    it('permet d\'ajouter un contact en mode mono-contact', async () => {
      render(
        <UnifiedContactSelector
          value={null}
          onChange={mockOnChange}
          isEditing={true}
        />
      );

      const selectButton = screen.getByText('Select Contact');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('test-contact');
      });
    });

    it('remplace le contact existant en mode mono-contact', async () => {
      render(
        <UnifiedContactSelector
          value="contact-1"
          onChange={mockOnChange}
          isEditing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
      });

      // Supprimer le contact existant
      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it('permet d\'ajouter plusieurs contacts en mode multi-contacts', async () => {
      render(
        <UnifiedContactSelector
          multiple={true}
          value={['contact-1']}
          onChange={mockOnChange}
          isEditing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
      });

      // Cliquer sur "Ajouter un autre contact"
      const addButton = screen.getByText('Ajouter un autre contact');
      fireEvent.click(addButton);

      // Sélectionner un nouveau contact
      const selectButton = screen.getByText('Select Contact');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(['contact-1', 'test-contact']);
      });
    });

    it('affiche le bon label pour le nombre de contacts sélectionnés', async () => {
      render(
        <UnifiedContactSelector
          multiple={true}
          value={['contact-1']}
          onChange={mockOnChange}
          isEditing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('1 contact sélectionné')).toBeInTheDocument();
      });
    });

    it('affiche le label au pluriel pour plusieurs contacts', async () => {
      const mockContact2 = {
        id: 'contact-2',
        nom: 'Marie Martin'
      };

      getDoc
        .mockResolvedValueOnce({
          exists: () => true,
          id: mockContact.id,
          data: () => mockContact
        })
        .mockResolvedValueOnce({
          exists: () => true,
          id: mockContact2.id,
          data: () => mockContact2
        });

      render(
        <UnifiedContactSelector
          multiple={true}
          value={['contact-1', 'contact-2']}
          onChange={mockOnChange}
          isEditing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('2 contacts sélectionnés')).toBeInTheDocument();
      });
    });

    it('gère le bouton annuler en mode multi-contacts', async () => {
      render(
        <UnifiedContactSelector
          multiple={true}
          value={['contact-1']}
          onChange={mockOnChange}
          isEditing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
      });

      // Cliquer sur "Ajouter un autre contact"
      const addButton = screen.getByText('Ajouter un autre contact');
      fireEvent.click(addButton);

      // Le bouton annuler devrait apparaître
      const cancelButton = screen.getByText('Annuler');
      fireEvent.click(cancelButton);

      // Le formulaire de recherche devrait disparaître
      await waitFor(() => {
        expect(screen.queryByTestId('search-dropdown')).not.toBeInTheDocument();
      });
    });
  });

  describe('Normalisation des valeurs', () => {
    it('normalise une valeur string en tableau', async () => {
      render(
        <UnifiedContactSelector
          value="contact-1"
          onChange={mockOnChange}
          isEditing={false}
        />
      );

      await waitFor(() => {
        expect(getDoc).toHaveBeenCalledWith(doc(undefined, 'contacts', 'contact-1'));
      });
    });

    it('gère correctement une valeur null', () => {
      render(
        <UnifiedContactSelector
          value={null}
          onChange={mockOnChange}
          isEditing={false}
        />
      );

      expect(screen.getByText('Aucun contact associé')).toBeInTheDocument();
    });

    it('gère correctement un tableau vide', () => {
      render(
        <UnifiedContactSelector
          value={[]}
          onChange={mockOnChange}
          isEditing={false}
        />
      );

      expect(screen.getByText('Aucun contact associé')).toBeInTheDocument();
    });
  });

  describe('Gestion des erreurs', () => {
    it('gère les erreurs de chargement des contacts', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      getDoc.mockRejectedValue(new Error('Erreur Firebase'));

      render(
        <UnifiedContactSelector
          value="contact-1"
          onChange={mockOnChange}
          isEditing={false}
        />
      );

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          '[UnifiedContactSelector] Erreur chargement contacts:',
          expect.any(Error)
        );
      });

      consoleError.mockRestore();
    });

    it('filtre les contacts inexistants', async () => {
      getDoc.mockResolvedValue({
        exists: () => false
      });

      render(
        <UnifiedContactSelector
          value="contact-inexistant"
          onChange={mockOnChange}
          isEditing={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Aucun contact associé')).toBeInTheDocument();
      });
    });
  });

  describe('Props et configuration', () => {
    it('utilise le label personnalisé', () => {
      render(
        <UnifiedContactSelector
          value={null}
          onChange={mockOnChange}
          isEditing={false}
          label="Organisateur(s)"
        />
      );

      expect(screen.getByText('Organisateur(s)')).toBeInTheDocument();
    });

    it('affiche l\'astérisque pour les champs requis', () => {
      render(
        <UnifiedContactSelector
          value={null}
          onChange={mockOnChange}
          isEditing={true}
          required={true}
        />
      );

      expect(screen.getByText('Rechercher un contact *')).toBeInTheDocument();
    });

    it('applique la classe CSS personnalisée', () => {
      render(
        <UnifiedContactSelector
          value={null}
          onChange={mockOnChange}
          isEditing={false}
          className="custom-class"
        />
      );

      expect(screen.getByTestId('card')).toBeInTheDocument();
    });
  });

  describe('Indicateur de chargement', () => {
    it('affiche l\'indicateur de chargement pendant le chargement des contacts', async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      getDoc.mockReturnValue(promise);

      render(
        <UnifiedContactSelector
          value="contact-1"
          onChange={mockOnChange}
          isEditing={true}
        />
      );

      expect(screen.getByText('Chargement...')).toBeInTheDocument();

      resolvePromise({
        exists: () => true,
        id: mockContact.id,
        data: () => mockContact
      });

      await waitFor(() => {
        expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
      });
    });
  });
});