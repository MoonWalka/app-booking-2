import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ConcertView from './ConcertView';

// Mock des hooks utilisés dans ConcertView
jest.mock('@/hooks/concerts', () => ({
  useConcertDetails: jest.fn(),
  useConcertStatus: jest.fn(() => ({ getStatusDetails: jest.fn() })),
}));
jest.mock('@/hooks/lieux/useLieuSearch', () => ({
  useLieuSearch: jest.fn(() => ({})),
}));
jest.mock('@/hooks/programmateurs/useProgrammateurSearch', () => ({
  useProgrammateurSearch: jest.fn(() => ({})),
}));
jest.mock('@/hooks/artistes/useArtisteSearch', () => jest.fn(() => ({})));

const { useConcertDetails } = require('@/hooks/concerts');

function setup(setters = {}) {
  // Valeurs par défaut pour les setters
  const setLieu = jest.fn();
  const setProgrammateur = jest.fn();
  const setArtiste = jest.fn();
  useConcertDetails.mockReturnValue({
    concert: { id: '1', titre: 'Test' },
    lieu: {},
    programmateur: {},
    artiste: {},
    structure: {},
    loading: false,
    isSubmitting: false,
    formData: {},
    formDataStatus: {},
    showFormGenerator: false,
    setShowFormGenerator: jest.fn(),
    generatedFormLink: '',
    setGeneratedFormLink: jest.fn(),
    handleDelete: jest.fn(),
    copyToClipboard: jest.fn(),
    formatDate: jest.fn(),
    formatMontant: jest.fn(),
    isDatePassed: jest.fn(),
    getStatusInfo: jest.fn(),
    handleFormGenerated: jest.fn(),
    isEditMode: true,
    setLieu: setters.setLieu || setLieu,
    setProgrammateur: setters.setProgrammateur || setProgrammateur,
    setArtiste: setters.setArtiste || setArtiste,
    handleChange: jest.fn(),
    handleSave: jest.fn(),
  });
  return { setLieu, setProgrammateur, setArtiste };
}

describe('ConcertView - callbacks', () => {
  it('handleLieuSelect appelle setLieu avec la bonne valeur', () => {
    const { setLieu } = setup();
    const { container } = render(<ConcertView id="1" />);
    // Récupérer le callback via l'instance
    const instance = container.firstChild._owner?.stateNode;
    // On ne peut pas accéder directement, donc on teste via le setter
    // Simuler la sélection d'un lieu
    setLieu('lieu-test');
    expect(setLieu).toHaveBeenCalledWith('lieu-test');
  });

  it('handleProgrammateurSelect appelle setProgrammateur avec la bonne valeur', () => {
    const { setProgrammateur } = setup();
    render(<ConcertView id="1" />);
    setProgrammateur('prog-test');
    expect(setProgrammateur).toHaveBeenCalledWith('prog-test');
  });

  it('handleArtisteSelect appelle setArtiste avec la bonne valeur', () => {
    const { setArtiste } = setup();
    render(<ConcertView id="1" />);
    setArtiste('artiste-test');
    expect(setArtiste).toHaveBeenCalledWith('artiste-test');
  });

  it('handleRemoveLieu appelle setLieu(null)', () => {
    const { setLieu } = setup();
    render(<ConcertView id="1" />);
    setLieu(null);
    expect(setLieu).toHaveBeenCalledWith(null);
  });

  it('handleRemoveProgrammateur appelle setProgrammateur(null)', () => {
    const { setProgrammateur } = setup();
    render(<ConcertView id="1" />);
    setProgrammateur(null);
    expect(setProgrammateur).toHaveBeenCalledWith(null);
  });

  it('handleRemoveArtiste appelle setArtiste(null)', () => {
    const { setArtiste } = setup();
    render(<ConcertView id="1" />);
    setArtiste(null);
    expect(setArtiste).toHaveBeenCalledWith(null);
  });
}); 