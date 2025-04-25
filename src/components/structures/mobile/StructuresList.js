// src/components/structures/mobile/StructuresList.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  startAfter,
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { Form, Button, InputGroup } from 'react-bootstrap';
import '../../../style/structuresListMobile.css';

const StructuresList = () => {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('tous');
  const [sortBy, setSortBy] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const pageSize = 10; // Taille plus petite pour mobile

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

  // Fonction pour filtrer les structures
  const getFilteredStructures = useCallback(() => {
    if (!structures.length) return [];
    
    return structures.filter(structure => {
      // Filtre de recherche
      const matchesSearch = searchTerm === '' || 
        (structure.nom && structure.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (structure.raisonSociale && structure.raisonSociale.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (structure.ville && structure.ville.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (structure.siret && structure.siret.includes(searchTerm));
      
      // Filtre par type
      const matchesType = typeFilter === 'tous' || structure.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [structures, searchTerm, typeFilter]);

  const filteredStructures = getFilteredStructures();

  // Fonction pour charger plus de structures
  const loadMore = () => {
    if (hasMore && !loading) {
      fetchStructures(false);
    }
  };

  // Fonction pour gérer la suppression d'une structure
  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Empêcher la navigation
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette structure ?')) {
      try {
        await deleteDoc(doc(db, 'structures', id));
        setStructures(structures.filter(structure => structure.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression de la structure:', error);
        alert('Une erreur est survenue lors de la suppression de la structure');
      }
    }
  };

  // Fonction pour naviguer vers la fiche de la structure
  const handleStructureClick = (id) => {
    navigate(`/structures/${id}`);
  };

  // Rendu des icônes selon le type de structure
  const renderTypeIcon = (type) => {
    switch (type) {
      case 'association':
        return <i className="bi bi-people"></i>;
      case 'entreprise':
        return <i className="bi bi-building"></i>;
      case 'administration':
        return <i className="bi bi-bank"></i>;
      case 'collectivite':
        return <i className="bi bi-house"></i>;
      default:
        return <i className="bi bi-building"></i>;
    }
  };

  return (
    <div className="structures-list-mobile">
      <div className="structures-header-mobile">
        <div className="structures-title-mobile">
          <h1>Structures</h1>
          <Button 
            variant="primary" 
            size="sm" 
            as={Link} 
            to="/structures/nouveau"
          >
            <i className="bi bi-plus-lg"></i>
          </Button>
        </div>
        
        <div className="structures-filters-mobile">
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button 
                variant="outline-secondary" 
                onClick={() => setSearchTerm('')}
              >
                <i className="bi bi-x-lg"></i>
              </Button>
            )}
          </InputGroup>
          
          <Form.Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="mt-2"
          >
            <option value="tous">Tous les types</option>
            <option value="association">Association</option>
            <option value="entreprise">Entreprise</option>
            <option value="administration">Administration</option>
            <option value="collectivite">Collectivité</option>
            <option value="autre">Autre</option>
          </Form.Select>
        </div>
      </div>

      {loading && structures.length === 0 ? (
        <div className="text-center p-3">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : filteredStructures.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-building"></i>
          <p>Aucune structure trouvée</p>
          <Button 
            variant="primary"
            onClick={() => navigate('/structures/nouveau')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Ajouter une structure
          </Button>
        </div>
      ) : (
        <div className="px-3">
          {filteredStructures.map(structure => (
            <div 
              key={structure.id}
              className="structures-card"
              onClick={() => handleStructureClick(structure.id)}
            >
              <div className="structure-info">
                <h3 className="structure-name">{structure.nom || structure.raisonSociale}</h3>
                {structure.type && (
                  <div className="structure-type">
                    {renderTypeIcon(structure.type)} {getTypeLabel(structure.type)}
                  </div>
                )}
                {structure.ville && (
                  <div className="structure-contact">
                    <i className="bi bi-geo-alt"></i>
                    <span>{structure.ville}</span>
                  </div>
                )}
                {structure.telephone && (
                  <div className="structure-contact">
                    <i className="bi bi-telephone"></i>
                    <span>{structure.telephone}</span>
                  </div>
                )}
                {structure.programmateursAssocies?.length > 0 && (
                  <span className="badge-mobile badge-programmateurs">
                    {structure.programmateursAssocies.length}
                  </span>
                )}
              </div>
              <div className="structure-actions">
                <Link 
                  to={`/structures/${structure.id}/edit`}
                  className="btn btn-sm btn-outline-secondary structure-action-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <i className="bi bi-pencil"></i>
                </Link>
                <button
                  className="btn btn-sm btn-outline-danger structure-action-btn"
                  onClick={(e) => handleDelete(structure.id, e)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="mobile-load-more">
              <Button 
                variant="outline-primary" 
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
                    <i className="bi bi-plus-circle me-2"></i>
                    Afficher plus
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
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