/**
 * Composant de test isolé pour diagnostiquer les boucles de re-renders
 * dans useArtistesList après les corrections appliquées
 */
import React, { memo } from 'react';
import { useArtistesList } from '@/hooks/artistes/useArtistesList';

// ✅ CORRECTION: Mémoïsation du composant pour éviter les re-renders inutiles
const TestArtistesList = memo(() => {
  console.count("🧪 [TEST] TestArtistesList render");
  
  // Utilisation du hook corrigé avec configuration stable
  const {
    artistes,
    loading,
    error,
    stats,
    searchTerm,
    setSearchTerm,
    filterByGenre,
    resetFilters
  } = useArtistesList({
    pageSize: 10, // Petite taille pour les tests
    sortField: 'nom',
    sortDirection: 'asc'
  });

  if (loading) {
    return (
      <div className="test-container">
        <h2>🧪 Test Artistes List (Chargement...)</h2>
        <div className="loading">Chargement des artistes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-container">
        <h2>🧪 Test Artistes List (Erreur)</h2>
        <div className="error">Erreur: {error}</div>
      </div>
    );
  }

  return (
    <div className="test-container">
      <h2>🧪 Test Artistes List</h2>
      
      {/* Statistiques */}
      <div className="stats">
        <h3>Statistiques</h3>
        <p>Total: {stats.total}</p>
        <p>Avec concerts: {stats.avecConcerts}</p>
        <p>Sans concerts: {stats.sansConcerts}</p>
      </div>

      {/* Contrôles de test */}
      <div className="controls">
        <h3>Contrôles</h3>
        <input
          type="text"
          placeholder="Rechercher un artiste..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => filterByGenre('Rock')}>
          Filtrer Rock
        </button>
        <button onClick={() => filterByGenre('Jazz')}>
          Filtrer Jazz
        </button>
        <button onClick={resetFilters}>
          Reset Filtres
        </button>
      </div>

      {/* Liste des artistes */}
      <div className="artistes-list">
        <h3>Artistes ({artistes.length})</h3>
        {artistes.length === 0 ? (
          <p>Aucun artiste trouvé</p>
        ) : (
          <ul>
            {artistes.slice(0, 5).map((artiste) => (
              <li key={artiste.id}>
                <strong>{artiste.nom}</strong>
                {artiste.genre && ` - ${artiste.genre}`}
                {artiste.hasConcerts && ' 🎵'}
              </li>
            ))}
            {artistes.length > 5 && (
              <li>... et {artistes.length - 5} autres</li>
            )}
          </ul>
        )}
      </div>

      <style jsx>{`
        .test-container {
          padding: 20px;
          border: 2px solid #007bff;
          border-radius: 8px;
          margin: 20px;
          background-color: #f8f9fa;
        }
        
        .stats, .controls, .artistes-list {
          margin: 15px 0;
          padding: 10px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          background-color: white;
        }
        
        .controls input {
          margin-right: 10px;
          padding: 5px;
        }
        
        .controls button {
          margin-right: 10px;
          padding: 5px 10px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .controls button:hover {
          background-color: #0056b3;
        }
        
        .loading, .error {
          padding: 20px;
          text-align: center;
          font-weight: bold;
        }
        
        .error {
          color: #dc3545;
        }
        
        ul {
          list-style-type: none;
          padding: 0;
        }
        
        li {
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }
      `}</style>
    </div>
  );
});

TestArtistesList.displayName = 'TestArtistesList';

export default TestArtistesList; 