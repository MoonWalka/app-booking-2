import React from 'react';
// src/hooks/__tests__/useGenericEntityList.test.js
import { renderHook, act } from '@testing-library/react';
import { useGenericEntityList } from '@/hooks/common';

// Mock des dépendances Firebase
jest.mock('@/firebaseInit', () => {
  const mockDocuments = {
    concerts: [
      { id: 'concert-1', titre: 'Concert de jazz', date: '2025-05-10', statut: 'confirme', montant: 1000 },
      { id: 'concert-2', titre: 'Festival rock', date: '2025-06-15', statut: 'contact', montant: 2000 },
      { id: 'concert-3', titre: 'Soirée électro', date: '2025-07-20', statut: 'annule', montant: 1500 },
      { id: 'concert-4', titre: 'Concert classique', date: '2025-08-05', statut: 'confirme', montant: 3000 }
    ],
    lieux: [
      { id: 'lieu-1', nom: 'Salle de concert A', ville: 'Paris', type: 'salle' },
      { id: 'lieu-2', nom: 'Festival ground B', ville: 'Lyon', type: 'extérieur' },
      { id: 'lieu-3', nom: 'Club C', ville: 'Marseille', type: 'club' }
    ]
  };
  
  return {
    db: {},
    collection: jest.fn().mockImplementation((collectionName) => {
      return {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        startAfter: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          docs: mockDocuments[collectionName].map(doc => ({
            id: doc.id,
            data: () => doc,
            exists: () => true
          }))
        })
      };
    }),
    query: jest.fn().mockImplementation((baseQuery, ...constraints) => baseQuery),
    orderBy: jest.fn().mockReturnValue({}),
    where: jest.fn().mockReturnValue({}),
    limit: jest.fn().mockReturnValue({}),
    startAfter: jest.fn().mockReturnValue({}),
    getDocs: jest.fn().mockImplementation((query) => {
      // Supposons que query.collectionName nous dit quelle collection est demandée
      const collectionName = query?.collectionName || 'concerts';
      return Promise.resolve({
        docs: mockDocuments[collectionName].map(doc => ({
          id: doc.id,
          data: () => doc,
          exists: () => true
        }))
      });
    }),
    getCountFromServer: jest.fn().mockImplementation((query) => {
      const collectionName = query?.collectionName || 'concerts';
      return Promise.resolve({
        data: () => ({ count: mockDocuments[collectionName].length })
      });
    }),
    onSnapshot: jest.fn().mockImplementation((query, callback, onError) => {
      const collectionName = query?.collectionName || 'concerts';
      callback({
        docs: mockDocuments[collectionName].map(doc => ({
          id: doc.id,
          data: () => doc,
          exists: () => true
        }))
      });
      return jest.fn(); // Cette fonction est le unsubscribe
    })
  };
});

describe('useGenericEntityList', () => {
  // Configuration
  beforeEach(() => {
    // Reset des mocks avant chaque test
    jest.clearAllMocks();
  });

  // Test de base - Chargement d'une collection
  test('devrait charger les éléments de base', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
      collectionName: 'concerts'
    }));

    // Vérification de l'état initial
    expect(result.current.loading).toBe(true);
    expect(result.current.items).toEqual([]);

    await waitForNextUpdate();

    // Vérification après chargement
    expect(result.current.loading).toBe(false);
    expect(result.current.items.length).toBe(4);
    expect(result.current.items[0].id).toBe('concert-1');
  });

  // Test de recherche
  test('devrait filtrer les éléments selon le terme de recherche', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
      collectionName: 'concerts',
      searchFields: ['titre'],
      paginationMode: 'client'
    }));

    await waitForNextUpdate();

    // Appliquer le terme de recherche
    act(() => {
      result.current.setSearchTerm('jazz');
    });

    // Vérification du filtrage
    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].titre).toBe('Concert de jazz');
  });

  // Test de filtrage
  test('devrait appliquer des filtres sur les éléments', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
      collectionName: 'concerts',
      filterConfig: {
        statut: { type: 'equals' }
      },
      paginationMode: 'client'
    }));

    await waitForNextUpdate();

    // Appliquer un filtre
    act(() => {
      result.current.setFilter('statut', 'confirme');
    });

    // Vérification du filtrage
    expect(result.current.items.length).toBe(2); // Concert 1 et 4 sont "confirmés"
    expect(result.current.items[0].statut).toBe('confirme');
    expect(result.current.items[1].statut).toBe('confirme');
  });

  // Test de tri
  test('devrait trier les éléments selon un champ', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
      collectionName: 'concerts',
      paginationMode: 'client'
    }));

    await waitForNextUpdate();

    // Définir le tri par montant, ordre décroissant
    act(() => {
      result.current.setSort('montant', 'desc');
    });

    // Vérification du tri
    expect(result.current.items[0].montant).toBe(3000); // Concert avec le montant le plus élevé en premier
    expect(result.current.items[1].montant).toBe(2000);
  });

  // Test de pagination côté client
  test('devrait paginer les résultats côté client correctement', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
      collectionName: 'concerts',
      paginationMode: 'client',
      pageSize: 2
    }));

    await waitForNextUpdate();

    // Page 1 devrait avoir 2 éléments
    expect(result.current.items.length).toBe(2);
    expect(result.current.pagination.currentPage).toBe(1);
    expect(result.current.pagination.totalPages).toBe(2);

    // Aller à la page 2
    act(() => {
      result.current.goToPage(2);
    });

    // Page 2 devrait avoir les 2 autres éléments
    expect(result.current.items.length).toBe(2);
    expect(result.current.pagination.currentPage).toBe(2);
    expect(result.current.items[0].id).toBe('concert-3');
  });

  // Test des fonctions de gestion des filtres
  test('devrait gérer correctement plusieurs filtres', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
      collectionName: 'concerts',
      filterConfig: {
        statut: { type: 'equals' },
        montant: { type: 'range' }
      },
      paginationMode: 'client'
    }));

    await waitForNextUpdate();

    // Appliquer plusieurs filtres
    act(() => {
      result.current.setFilter('statut', 'confirme');
      result.current.setFilter('montant', { start: 2000 });
    });

    // Vérification du filtrage
    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].id).toBe('concert-4'); // Seul concert confirmé avec montant >= 2000
  });

  // Test de reset des filtres
  test('devrait réinitialiser les filtres correctement', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
      collectionName: 'concerts',
      filterConfig: {
        statut: { type: 'equals' }
      },
      paginationMode: 'client'
    }));

    await waitForNextUpdate();

    // Appliquer un filtre
    act(() => {
      result.current.setFilter('statut', 'confirme');
    });

    expect(result.current.items.length).toBe(2);

    // Réinitialiser les filtres
    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.items.length).toBe(4); // Tous les concerts sont affichés à nouveau
  });

  // Test de rafraîchissement des données
  test('devrait rafraîchir les données correctement', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
      collectionName: 'concerts'
    }));

    await waitForNextUpdate();

    // Mock pour simuler un changement dans les données
    const mockDocs = [
      { id: 'concert-5', titre: 'Nouveau concert', date: '2025-09-15', statut: 'confirme' }
    ];

    require('@/firebaseInit').getDocs.mockImplementationOnce(() => 
      Promise.resolve({
        docs: mockDocs.map(doc => ({
          id: doc.id,
          data: () => doc,
          exists: () => true
        }))
      })
    );

    // Rafraîchir les données
    await act(async () => {
      await result.current.refresh();
    });

    // Vérification des données rafraîchies
    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].id).toBe('concert-5');
  });

  // Test en mode temps réel
  test('devrait fonctionner en mode temps réel', async () => {
    const onItemsChange = jest.fn();
    
    const { result, waitForNextUpdate, unmount } = renderHook(() => useGenericEntityList({
      collectionName: 'concerts',
      realtime: true,
      onItemsChange
    }));

    await waitForNextUpdate();

    expect(result.current.items.length).toBe(4);
    expect(onItemsChange).toHaveBeenCalled();
    
    // Vérifier que le listener est nettoyé lors du démontage
    const unsubscribeMock = require('@/firebaseInit').onSnapshot.mock.results[0].value;
    unmount();
    expect(unsubscribeMock).toHaveBeenCalled();
  });

  // Test de transformation d'éléments
  test('devrait transformer les éléments correctement', async () => {
    const transformItem = jest.fn((item) => ({
      ...item,
      montantFormatted: `${item.montant}€`,
      dateFormatted: `Date: ${item.date}`
    }));

    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
      collectionName: 'concerts',
      transformItem
    }));

    await waitForNextUpdate();

    expect(transformItem).toHaveBeenCalled();
    expect(result.current.items[0].montantFormatted).toBe('1000€');
    expect(result.current.items[0].dateFormatted).toBe('Date: 2025-05-10');
  });

  // Test du requêteur personnalisé
  test('devrait utiliser un constructeur de requête personnalisé', async () => {
    const customQueryBuilder = jest.fn((baseQuery) => baseQuery);

    const { waitForNextUpdate } = renderHook(() => useGenericEntityList({
      collectionName: 'concerts',
      customQueryBuilder
    }));

    await waitForNextUpdate();

    expect(customQueryBuilder).toHaveBeenCalled();
  });

  // Test de mode de filtrage personnalisé côté client
  test('devrait utiliser une fonction de filtrage personnalisée', async () => {
    const customFiltering = jest.fn((items, { filters, searchTerm }) => {
      return items.filter(item => item.montant > 1200);
    });

    const { result, waitForNextUpdate } = renderHook(() => useGenericEntityList({
      collectionName: 'concerts',
      paginationMode: 'client',
      customFiltering
    }));

    await waitForNextUpdate();

    expect(customFiltering).toHaveBeenCalled();
    expect(result.current.items.length).toBe(3); // Concert 2, 3, 4 ont un montant > 1200
  });
});