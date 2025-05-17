import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import { Spinner } from 'react-bootstrap';
import { db } from '@/firebaseInit';
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
        // Si le lieu a des structures associées
        if (lieu.structuresIds && lieu.structuresIds.length > 0) {
          // Query pour récupérer toutes les structures associées
          const structuresPromises = lieu.structuresIds.map(structureId => 
            doc(db, 'structures', structureId).get()
          );
          
          const structureDocs = await Promise.all(structuresPromises);
          const structuresData = structureDocs
            .filter(doc => doc.exists())
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          
          setStructures(structuresData);
        } else {
          setStructures([]);
        }
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
          !lieu.structuresIds || !lieu.structuresIds.includes(result.id)
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
  }, [searchTerm, lieu]);

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
      // Mettre à jour le document du lieu avec la nouvelle structure
      const lieuRef = doc(db, 'lieux', lieu.id);
      await updateDoc(lieuRef, {
        structuresIds: arrayUnion(structure.id)
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
      // Mettre à jour le document du lieu en supprimant la structure
      const lieuRef = doc(db, 'lieux', lieu.id);
      await updateDoc(lieuRef, {
        structuresIds: arrayRemove(structureId)
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
      icon={<i className="bi bi-building"></i>}
      isEditing={isEditing}
      isHoverable={!isEditing}
      headerActions={
        !isEditing ? (
          <div className={styles.headerActions}>
            <button 
              onClick={() => navigate('/structures', { state: { filterLieuId: lieu.id } })}
              className="btn btn-sm btn-outline-secondary"
              title="Voir toutes les structures"
            >
              <i className="bi bi-list"></i>
              <span className="d-none d-sm-inline ms-1">Tout voir</span>
            </button>
            <button 
              onClick={handleCreateStructure}
              className="btn btn-sm btn-outline-primary"
              title="Ajouter une structure à ce lieu"
            >
              <i className="bi bi-plus-lg"></i>
              <span className="d-none d-sm-inline ms-1">Ajouter</span>
            </button>
          </div>
        ) : null
      }
    >
      {isEditing ? (
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Associer des structures</label>
          
          <div className={styles.structureSearchContainer} ref={dropdownRef}>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher une structure par nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleCreateStructure}
              >
                Créer une structure
              </button>
            </div>
            
            {isSearching && (
              <div className={`dropdown-menu show w-100 ${styles.dropdownMenu}`}>
                <div className="dropdown-item text-center">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Recherche en cours...</span>
                  </div>
                </div>
              </div>
            )}
            
            {searchResults.length > 0 && (
              <div className={`dropdown-menu show w-100 ${styles.dropdownMenu}`}>
                {searchResults.map(structure => (
                  <div 
                    key={structure.id} 
                    className={`dropdown-item ${styles.structureItem}`}
                    onClick={() => handleSelectStructure(structure)}
                  >
                    <div className={styles.structureName}>{structure.nom}</div>
                    <div className={styles.structureDetails}>
                      {structure.type && <span className={styles.typeBadge}>{structure.type}</span>}
                      {structure.ville && <span className={styles.structureLocation}>{structure.ville}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
              <div className={`dropdown-menu show w-100 ${styles.dropdownMenu}`}>
                <div className="dropdown-item text-center text-muted">
                  Aucune structure trouvée
                </div>
              </div>
            )}
          </div>
          
          <small className="form-text text-muted">
            Tapez au moins 2 caractères pour rechercher une structure par nom.
          </small>
          
          {/* Liste des structures déjà associées */}
          {structures.length > 0 && (
            <div className={styles.associatedStructures}>
              <label className={styles.formLabel}>Structures associées</label>
              {structures.map(structure => (
                <div key={structure.id} className={styles.associatedStructureItem}>
                  <div className={styles.structureInfo}>
                    <span className={styles.structureName}>{structure.nom}</span>
                    {structure.type && <span className={styles.typeBadge}>{structure.type}</span>}
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemoveStructure(structure.id)}
                    aria-label="Retirer cette structure"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {loading ? (
            <div className={styles.loadingContainer}>
              <Spinner animation="border" variant="primary" size="sm" />
              <span>Chargement des structures associées...</span>
            </div>
          ) : structures.length > 0 ? (
            <div className={styles.structuresList}>
              {structures.map(structure => (
                <div key={structure.id} className={styles.structureItem}>
                  <div className={styles.structureInfo}>
                    <Link to={`/structures/${structure.id}`} className={styles.structureName}>
                      {structure.nom}
                    </Link>
                    <div className={styles.structureDetails}>
                      {structure.type && (
                        <span className={styles.typeBadge}>{structure.type}</span>
                      )}
                      {structure.ville && (
                        <span className={styles.structureLocation}>
                          <i className="bi bi-geo-alt me-1"></i>
                          {structure.ville}
                        </span>
                      )}
                      {structure.programmateurs && structure.programmateurs.length > 0 && (
                        <span className={styles.structureProgrammateurs}>
                          <i className="bi bi-people me-1"></i>
                          {structure.programmateurs.length} programmateur{structure.programmateurs.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.structureActions}>
                    <Link to={`/structures/${structure.id}`} className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-eye me-1"></i>
                      Voir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <i className="bi bi-exclamation-circle"></i>
              <p>Aucune structure associée à ce lieu</p>
              <button 
                className="btn btn-sm btn-outline-primary mt-2"
                onClick={handleCreateStructure}
              >
                <i className="bi bi-plus-lg me-1"></i>
                Associer une structure
              </button>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default LieuStructuresSection;
