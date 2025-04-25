// src/components/structures/desktop/StructuresList.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  startAfter,
  where, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { Button, Form, InputGroup } from 'react-bootstrap';
import '../../../style/structuresList.css';

const StructuresList = () => {
  const [structures, setStructures] = useState([]);
  const [filteredStructures, setFilteredStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('tous');
  const [sortBy, setSortBy] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');
  const [stats, setStats] = useState({
    total: 0,
    avecLiaisonProg: 0,
    sansProg: 0
  });
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const pageSize = 20;

  // Fonction pour charger les structures
  const fetchStructures = async (reset = true) => {
    if (reset) {
      setLoading(true);
      setLastVisible(null);
    }
    
    try {
      let q;
      if (reset || !lastVisible) {
        // Première charge ou réinitialisation
        q = query(collection(db, 'structures'), orderBy(sortBy, sortDirection), limit(pageSize));
      } else {
        // Chargement de la page suivante
        q = query(
          collection(db, 'structures'),
          orderBy(sortBy, sortDirection),
          startAfter(lastVisible),
          limit(pageSize)
        );
      }
      
      const structuresSnapshot = await getDocs(q);
      
      if (structuresSnapshot.empty && reset) {
        setStructures([]);
        setFilteredStructures([]);
        setHasMore(false);
        setLoading(false);
        return;
      }
      
      const structuresData = structuresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Mise à jour de l'état
      if (reset) {
        setStructures(structuresData);
      } else {
        setStructures(prev => [...prev, ...structuresData]);
      }
      
      // Mise à jour du dernier document visible pour la pagination
      const lastDoc = structuresSnapshot.docs[structuresSnapshot.docs.length - 1];
      setLastVisible(lastDoc);
      setHasMore(structuresSnapshot.docs.length === pageSize);
      
      // Calculer les statistiques
      if (reset) {
        const statsSnapshot = await getDocs(collection(db, 'structures'));
        const allStructures = statsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setStats({
          total: allStructures.length,
          avecLiaisonProg: allStructures.filter(s => s.programmateursAssocies?.length > 0).length,
          sansProg: allStructures.filter(s => !s.programmateursAssocies || s.programmateursAssocies.length === 0).length
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des structures:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchStructures();
  }, [sortBy, sortDirection]);

  // Appliquer les filtres quand les structures ou les filtres changent
  useEffect(() => {
    filterStructures();
  }, [structures, searchTerm, typeFilter]);

  // Fonction pour filtrer les structures
  const filterStructures = () => {
    let result = [...structures];
    
    // Filtre de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(structure => 
        structure.nom?.toLowerCase().includes(term) ||
        structure.raisonSociale?.toLowerCase().includes(term) ||
        structure.ville?.toLowerCase().includes(term) ||
        structure.siret?.includes(term)
      );
    }
    
    // Filtre par type
    if (typeFilter !== 'tous') {
      result = result.filter(structure => structure.type === typeFilter);
    }
    
    setFilteredStructures(result);
  };

  // Fonction pour charger plus de structures
  const loadMore = () => {
    if (hasMore && !loading) {
      fetchStructures(false);
    }
  };

  // Fonction pour gérer la suppression d'une structure
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette structure ?')) {
      try {
        await deleteDoc(doc(db, 'structures', id));
        setStructures(structures.filter(structure => structure.id !== id));
        setFilteredStructures(filteredStructures.filter(structure => structure.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression de la structure:', error);
        alert('Une erreur est survenue lors de la suppression de la structure');
      }
    }
  };

  // Fonction pour naviguer vers la fiche de la structure
  const handleRowClick = (structureId) => {
    navigate(`/structures/${structureId}`);
  };

  // Gestionnaire pour empêcher la propagation des clics sur les liens et boutons dans les lignes
  const handleActionClick = (e) => {
    e.stopPropagation();
  };

  // Fonction pour trier les données
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Rendu des flèches de tri
  const renderSortArrow = (column) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className="structures-container">
      <div className="structures-header">
        <h2 className="structures-title">Structures</h2>
        <div className="structures-actions">
          <Link to="/structures/nouveau" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Ajouter une structure
          </Link>
        </div>
      </div>

      <div className="structures-filters">
        <InputGroup className="structures-search">
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            ref={searchInputRef}
            type="text"
            placeholder="Rechercher par nom, raison sociale, ville ou SIRET..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button 
              variant="outline-secondary" 
              onClick={() => {
                setSearchTerm('');
                searchInputRef.current.focus();
              }}
            >
              <i className="bi bi-x-lg"></i>
            </Button>
          )}
        </InputGroup>

        <Form.Select
          className="structures-type-filter"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="tous">Tous les types</option>
          <option value="association">Association</option>
          <option value="entreprise">Entreprise</option>
          <option value="administration">Administration</option>
          <option value="collectivite">Collectivité</option>
          <option value="autre">Autre</option>
        </Form.Select>
      </div>

      {searchTerm && (
        <p className="results-count">
          {filteredStructures.length} résultat{filteredStructures.length !== 1 ? 's' : ''} trouvé{filteredStructures.length !== 1 ? 's' : ''}
        </p>
      )}

      {filteredStructures.length === 0 ? (
        <div className="alert alert-info modern-alert">
          {searchTerm || typeFilter !== 'tous' ? (
            <div className="d-flex align-items-center">
              <i className="bi bi-info-circle me-3"></i>
              <p className="mb-0">Aucune structure ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="d-flex align-items-center">
              <i className="bi bi-info-circle me-3"></i>
              <p className="mb-0">Aucune structure n'a été ajoutée. Cliquez sur "Ajouter une structure" pour commencer.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="structures-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('nom')} style={{ cursor: 'pointer' }}>
                  Nom {renderSortArrow('nom')}
                </th>
                <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
                  Type {renderSortArrow('type')}
                </th>
                <th onClick={() => handleSort('ville')} style={{ cursor: 'pointer' }}>
                  Ville {renderSortArrow('ville')}
                </th>
                <th>SIRET</th>
                <th>Programmateurs</th>
                <th className="structures-actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStructures.map(structure => (
                <tr key={structure.id} onClick={() => handleRowClick(structure.id)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-building me-2 text-muted"></i>
                      <span>{structure.nom || structure.raisonSociale}</span>
                    </div>
                  </td>
                  <td>
                    {structure.type ? (
                      <span className={`badge bg-${getTypeColor(structure.type)}`}>
                        {getTypeLabel(structure.type)}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {structure.ville ? (
                      <div className="d-flex align-items-center">
                        <i className="bi bi-geo-alt text-muted me-2"></i>
                        {structure.ville}
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {structure.siret || <span className="text-muted">-</span>}
                  </td>
                  <td>
                    {structure.programmateursAssocies?.length > 0 ? (
                      <div className="d-flex align-items-center">
                        <i className="bi bi-person-badge text-muted me-2"></i>
                        {structure.programmateursAssocies.length}
                      </div>
                    ) : (
                      <span className="text-muted">0</span>
                    )}
                  </td>
                  <td className="structures-actions-cell">
                    <Link 
                      to={`/structures/${structure.id}`} 
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={handleActionClick}
                    >
                      <i className="bi bi-eye"></i>
                    </Link>
                    <Link 
                      to={`/structures/${structure.id}/edit`} 
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={handleActionClick}
                    >
                      <i className="bi bi-pencil"></i>
                    </Link>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(structure.id);
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasMore && !loading && filteredStructures.length > 0 && (
        <div className="text-center mt-3">
          <button 
            className="btn btn-outline-primary" 
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Chargement...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-down-circle me-2"></i>
                Afficher plus
              </>
            )}
          </button>
        </div>
      )}

      {loading && !hasMore && (
        <div className="text-center mt-3">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Fonction pour obtenir la couleur du badge selon le type de structure
const getTypeColor = (type) => {
  switch (type) {
    case 'association':
      return 'success';
    case 'entreprise':
      return 'primary';
    case 'administration':
      return 'info';
    case 'collectivite':
      return 'warning';
    default:
      return 'secondary';
  }
};

// Fonction pour obtenir le libellé correspondant au type de structure
const getTypeLabel = (type) => {
  switch (type) {
    case 'association':
      return 'Association';
    case 'entreprise':
      return 'Entreprise';
    case 'administration':
      return 'Administration';
    case 'collectivite':
      return 'Collectivité';
    default:
      return 'Autre';
  }
};

export default StructuresList;