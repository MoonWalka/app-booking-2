import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '@/services/firebase-service';
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  query, 
  collection, 
  getDocs, 
  limit,
  where
} from 'firebase/firestore';
import { Spinner } from 'react-bootstrap';
import Button from '@ui/Button';
import Card from '@/components/ui/Card';
import styles from './LieuStructuresSection.module.css';

/**
 * Component to display and manage structures associated with a venue
 */
export const LieuStructuresSection = ({ lieu, isEditing = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [structures, setStructures] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const dropdownRef = useRef(null);

  // Charger les structures associées au lieu
  useEffect(() => {
    const fetchAssociatedStructures = async () => {
      if (!lieu || !lieu.id) return;
      
      setLoading(true);
      try {
        // Requête pour trouver les structures qui ont ce lieu dans leur tableau lieuxAssocies
        const q = query(
          collection(db, 'structures'),
          where('lieuxAssocies', 'array-contains', lieu.id)
        );
        
        const querySnapshot = await getDocs(q);
        const structuresData = [];
        
        querySnapshot.forEach((doc) => {
          structuresData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setStructures(structuresData);
      } catch (error) {
        console.error('Erreur lors de la récupération des structures:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssociatedStructures();
  }, [lieu]);

  // Recherche de structures
  useEffect(() => {
    const searchStructures = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const searchTermLower = searchTerm.toLowerCase();
        
        // Créer une requête pour rechercher des structures par nom
        const q = query(
          collection(db, 'structures'),
          limit(10)
        );

        const querySnapshot = await getDocs(q);
        const results = [];
        
        querySnapshot.forEach((doc) => {
          const structure = {
            id: doc.id,
            ...doc.data()
          };
          
          // Filtre côté client pour plus de flexibilité
          if (structure.nom && structure.nom.toLowerCase().includes(searchTermLower)) {
            results.push(structure);
          }
        });
        
        // Filtrer les structures déjà associées
        const filteredResults = results.filter(result => 
          !structures.some(s => s.id === result.id)
        );
        
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Erreur lors de la recherche de structures:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchStructures();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, structures]);

  // Gestionnaire de clic extérieur pour fermer la liste déroulante
  useEffect(() => {
    if (!isEditing) return;
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  // Sélectionner une structure
  const handleSelectStructure = async (structure) => {
    try {
      // Mettre à jour le document de la structure pour ajouter ce lieu
      const structureRef = doc(db, 'structures', structure.id);
      await updateDoc(structureRef, {
        lieuxAssocies: arrayUnion(lieu.id)
      });
      
      // Mettre à jour l'UI
      setStructures(prev => [...prev, structure]);
      setSearchResults([]);
      setSearchTerm('');
    } catch (error) {
      console.error('Erreur lors de l\'association de la structure:', error);
    }
  };

  // Supprimer l'association avec une structure
  const handleRemoveStructure = async (structureId) => {
    try {
      // Mettre à jour le document de la structure pour retirer ce lieu
      const structureRef = doc(db, 'structures', structureId);
      await updateDoc(structureRef, {
        lieuxAssocies: arrayRemove(lieu.id)
      });
      
      // Mettre à jour l'UI
      setStructures(prev => prev.filter(s => s.id !== structureId));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'association:', error);
    }
  };

  // Naviguer vers la création d'une nouvelle structure
  const handleCreateStructure = () => {
    navigate('/structures/nouveau', { 
      state: { 
        returnTo: `/lieux/${lieu.id}`,
        preselectedLieu: {
          id: lieu.id,
          nom: lieu.nom
        }
      }
    });
  };

  return (
    <Card
      title="Structures associées"
      icon={<i className="bi bi-diagram-3"></i>}
      isEditing={isEditing}
      isHoverable={!isEditing}
      headerActions={
        isEditing ? (
          <div className={styles.headerActions}>
            <Button
              size="sm"
              variant="outline-primary"
              onClick={handleCreateStructure}
              title="Associer une structure à ce lieu"
            >
              <i className="bi bi-plus-lg"></i>
              <span className="d-none d-sm-inline ms-1">Associer une structure</span>
            </Button>
          </div>
        ) : null
      }
    >
      {loading ? (
        <Spinner animation="border" size="sm" />
      ) : (
        <div className={styles.structuresListContainer}>
          {/* Interface de recherche pour ajouter des structures (en mode édition) */}
          {isEditing && (
            <div className={styles.searchSection} ref={dropdownRef}>
              <div className={styles.searchInputGroup}>
                <label className={styles.searchLabel}>Rechercher et associer une structure</label>
                <div className={styles.inputWithDropdown}>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Tapez le nom d'une structure..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className={styles.clearSearchButton}
                      onClick={() => {
                        setSearchTerm('');
                        setSearchResults([]);
                      }}
                      aria-label="Effacer la recherche"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </div>
                
                {/* Dropdown des résultats de recherche */}
                {searchTerm.length >= 2 && (
                  <div className={styles.searchDropdown}>
                    {/* Header avec compteur */}
                    <div className={styles.dropdownHeader}>
                      <span className={styles.dropdownTitle}>
                        {isSearching ? 'Recherche en cours...' : `${searchResults.length} structure(s) trouvée(s)`}
                      </span>
                      <button
                        type="button"
                        className={styles.closeDropdownButton}
                        onClick={() => {
                          setSearchResults([]);
                          setSearchTerm('');
                        }}
                        aria-label="Fermer les résultats"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                    
                    {/* État de chargement */}
                    {isSearching && (
                      <div className={styles.loadingContainer}>
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Recherche en cours...</span>
                        </div>
                        <span className={styles.loadingText}>Recherche de structures...</span>
                      </div>
                    )}
                    
                    {/* Résultats avec sélection temporaire */}
                    {!isSearching && searchResults.length > 0 && (
                      <div className={styles.resultsList}>
                        {searchResults.map(structure => (
                          <div 
                            key={structure.id} 
                            className={`${styles.resultItem} ${selectedStructure?.id === structure.id ? styles.resultItemSelected : ''}`}
                            onClick={() => {
                              // Sélection temporaire pour prévisualisation
                              setSelectedStructure(selectedStructure?.id === structure.id ? null : structure);
                            }}
                          >
                            <div className={styles.structureName}>
                              {structure.nom}
                              {selectedStructure?.id === structure.id && (
                                <i className="bi bi-check-circle-fill ms-2 text-success"></i>
                              )}
                            </div>
                            {structure.type && (
                              <div className={styles.structureDetail}>Type: {structure.type}</div>
                            )}
                            {structure.adresse && (
                              <div className={styles.structureDetail}>
                                <i className="bi bi-geo-alt me-1"></i>
                                {structure.adresse}
                              </div>
                            )}
                            {(structure.contact || structure.programmateur) && (
                              <div className={styles.structureDetail}>
                                <i className="bi bi-person me-1"></i>
                                Contact: {structure.contact || structure.programmateur}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Bouton d'association pour la structure sélectionnée */}
                    {selectedStructure && (
                      <div className={styles.selectionActions}>
                        <div className={styles.selectedInfo}>
                          <i className="bi bi-info-circle me-2"></i>
                          Structure sélectionnée : <strong>{selectedStructure.nom}</strong>
                        </div>
                        <div className={styles.actionButtons}>
                          <Button
                            type="button"
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setSelectedStructure(null)}
                          >
                            <i className="bi bi-x me-1"></i>
                            Annuler
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              handleSelectStructure(selectedStructure);
                              setSelectedStructure(null);
                            }}
                          >
                            <i className="bi bi-plus-circle me-1"></i>
                            Associer cette structure
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Pas de résultats */}
                    {!isSearching && searchResults.length === 0 && searchTerm.length >= 2 && (
                      <div className={styles.noResultsContainer}>
                        <div className={styles.noResultsMessage}>
                          Aucune structure trouvée pour "{searchTerm}"
                        </div>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={handleCreateStructure}
                        >
                          <i className="bi bi-plus-circle me-1"></i>
                          Créer une nouvelle structure
                        </Button>
                      </div>
                    )}
                    
                    {/* Aide pour la recherche */}
                    {searchTerm.length < 2 && (
                      <div className={styles.searchTip}>
                        <i className="bi bi-info-circle me-1"></i>
                        Tapez au moins 2 caractères pour rechercher
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Liste des structures associées */}
          <div className={styles.associatedStructures}>
            <h4 className={styles.associatedTitle}>
              Structures associées ({structures.length})
            </h4>
            {structures.length > 0 ? (
              structures.map(structure => (
                <div key={structure.id} className={styles.structureItem}>
                  <Link to={`/structures/${structure.id}`} className={styles.structureLink}>
                    {structure.nom}
                  </Link>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      className="ms-2"
                      onClick={() => handleRemoveStructure(structure.id)}
                      title="Retirer cette structure du lieu"
                    >
                      <i className="bi bi-x-lg"></i>
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.textEmpty}>Aucune structure associée.</div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default LieuStructuresSection;
