import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import firebase from '../../../firebase';
import { OverlayTrigger, Tooltip, Badge, Card, Dropdown } from 'react-bootstrap';
import '@styles/index.css';
import '@styles/pages/lieux.css';
import Spinner from '@/components/common/Spinner';

const LieuxList = () => {
  const navigate = useNavigate();
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLieux, setFilteredLieux] = useState([]);
  const [sortOption, setSortOption] = useState('nom-asc');
  const [filterType, setFilterType] = useState('tous');
  const [stats, setStats] = useState({
    total: 0,
    avecConcerts: 0,
    sansConcerts: 0,
    festivals: 0,
    salles: 0,
    bars: 0,
    plateaux: 0
  });
  
  // Référence pour le focus de la recherche
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchLieux = async () => {
      setLoading(true);
      try {
        const q = firebase.query(firebase.collection(firebase.db, 'lieux'), firebase.orderBy('nom'));
        const querySnapshot = await firebase.getDocs(q);
        const lieuxData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Calculer les statistiques
        let avecConcerts = 0;
        let sansConcerts = 0;
        let festivals = 0;
        let salles = 0;
        let bars = 0;
        let plateaux = 0;
        
        lieuxData.forEach(lieu => {
          if (lieu.concertsAssocies && lieu.concertsAssocies.length > 0) {
            avecConcerts++;
          } else {
            sansConcerts++;
          }
          
          // Compter les types de lieux
          if (lieu.type === 'festival') festivals++;
          else if (lieu.type === 'salle') salles++;
          else if (lieu.type === 'bar') bars++;
          else if (lieu.type === 'plateau') plateaux++;
        });
        
        setStats({
          total: lieuxData.length,
          avecConcerts,
          sansConcerts,
          festivals,
          salles,
          bars,
          plateaux
        });
        
        setLieux(lieuxData);
        applyFiltersAndSort(lieuxData, searchTerm, sortOption, filterType);
      } catch (error) {
        console.error('Erreur lors de la récupération des lieux:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLieux();
    
    // Ajouter un raccourci clavier pour la recherche
    const handleKeyDown = (e) => {
      // Ctrl+F ou Cmd+F (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fonction pour appliquer les filtres et le tri
  const applyFiltersAndSort = (lieuxData = lieux, search = searchTerm, sort = sortOption, filter = filterType) => {
    // Étape 1: Filtrer par terme de recherche
    let result = lieuxData;
    
    if (search.trim() !== '') {
      const searchTermLower = search.toLowerCase();
      result = result.filter(lieu => 
        lieu.nom?.toLowerCase().includes(searchTermLower) || 
        lieu.ville?.toLowerCase().includes(searchTermLower) ||
        lieu.adresse?.toLowerCase().includes(searchTermLower) ||
        lieu.codePostal?.toLowerCase().includes(searchTermLower)
      );
    }
    
    // Étape 2: Filtrer par type de lieu
    if (filter !== 'tous') {
      if (filter === 'avec-concerts') {
        result = result.filter(lieu => lieu.concertsAssocies && lieu.concertsAssocies.length > 0);
      } else if (filter === 'sans-concerts') {
        result = result.filter(lieu => !lieu.concertsAssocies || lieu.concertsAssocies.length === 0);
      } else {
        // Filtrer par type de lieu (festival, salle, bar, plateau)
        result = result.filter(lieu => lieu.type === filter);
      }
    }
    
    // Étape 3: Trier les résultats
    const [field, direction] = sort.split('-');
    result = [...result].sort((a, b) => {
      let comparison = 0;
      
      // Gestion du tri par différents champs
      if (field === 'nom') {
        comparison = (a.nom || '').localeCompare(b.nom || '');
      } else if (field === 'ville') {
        comparison = (a.ville || '').localeCompare(b.ville || '');
      } else if (field === 'jauge') {
        const jaugeA = a.jauge || 0;
        const jaugeB = b.jauge || 0;
        comparison = jaugeA - jaugeB;
      } else if (field === 'concerts') {
        const concertsA = (a.concertsAssocies?.length || 0);
        const concertsB = (b.concertsAssocies?.length || 0);
        comparison = concertsA - concertsB;
      }
      
      // Inverser le tri si descendant
      return direction === 'desc' ? -comparison : comparison;
    });
    
    setFilteredLieux(result);
  };

  // Effet pour filtrer les lieux avec un léger délai
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      applyFiltersAndSort(lieux, searchTerm, sortOption, filterType);
    }, 300); // Délai de 300ms pour éviter trop de rafraîchissements

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortOption, filterType, lieux]);

  const handleDeleteLieu = async (id, e) => {
    // Empêcher la propagation pour que le clic ne navigue pas vers la fiche
    e.stopPropagation();
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      try {
        await firebase.deleteDoc(firebase.doc(firebase.db, 'lieux', id));
        
        // Mettre à jour le state et recalculer les statistiques
        const updatedLieux = lieux.filter(lieu => lieu.id !== id);
        setLieux(updatedLieux);
        
        // Recalcul des statistiques
        let avecConcerts = 0;
        let sansConcerts = 0;
        let festivals = 0;
        let salles = 0;
        let bars = 0;
        let plateaux = 0;
        
        updatedLieux.forEach(lieu => {
          if (lieu.concertsAssocies && lieu.concertsAssocies.length > 0) {
            avecConcerts++;
          } else {
            sansConcerts++;
          }
          
          if (lieu.type === 'festival') festivals++;
          else if (lieu.type === 'salle') salles++;
          else if (lieu.type === 'bar') bars++;
          else if (lieu.type === 'plateau') plateaux++;
        });
        
        setStats({
          total: updatedLieux.length,
          avecConcerts,
          sansConcerts,
          festivals,
          salles,
          bars,
          plateaux
        });
        
        // Appliquer les filtres et le tri aux lieux mis à jour
        applyFiltersAndSort(updatedLieux);
      } catch (error) {
        console.error('Erreur lors de la suppression du lieu:', error);
        alert('Une erreur est survenue lors de la suppression du lieu');
      }
    }
  };

  // Fonction pour naviguer vers la fiche du lieu
  const handleRowClick = (lieuId) => {
    navigate(`/lieux/${lieuId}`);
  };

  // Gestionnaire pour empêcher la propagation des clics sur les liens et boutons dans les lignes
  const handleActionClick = (e) => {
    e.stopPropagation();
  };

  // Fonction pour obtenir la couleur de badge selon la jauge
  const getJaugeColor = (jauge) => {
    if (!jauge) return 'secondary';
    if (jauge < 200) return 'info';
    if (jauge < 500) return 'success';
    if (jauge < 1000) return 'warning';
    return 'danger';
  };
  
  // Fonction pour obtenir le label de jauge
  const getJaugeLabel = (jauge) => {
    if (!jauge) return 'Non spécifiée';
    if (jauge < 200) return 'Petite';
    if (jauge < 500) return 'Moyenne';
    if (jauge < 1000) return 'Grande';
    return 'Très grande';
  };
  
  // Fonction pour obtenir la couleur du badge de type
  const getTypeBadgeColor = (type) => {
    switch(type) {
      case 'festival': return 'danger';
      case 'salle': return 'success';
      case 'bar': return 'info';
      case 'plateau': return 'warning';
      default: return 'secondary';
    }
  };
  
  // Fonction pour formater le type
  const formatType = (type) => {
    if (!type) return 'Non spécifié';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) {
    return <Spinner message="Chargement des lieux..." contentOnly={true} />;
  }

  return (
    <div className="lieux-container shadow-sm">
      <div className="header-container mb-3">
        <h2 className="fs-4 fw-bold text-primary mb-0">Liste des lieux</h2>
        <button 
          className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 rounded-3"
          onClick={() => navigate('/lieux/nouveau')}
        >
          <i className="bi bi-plus-lg"></i>
          Ajouter un lieu
        </button>
      </div>
      
      <div className="search-filter-container d-flex flex-wrap gap-3 align-items-center">
        <div className="search-bar flex-grow-1">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              ref={searchInputRef}
              type="text"
              className="form-control search-input"
              placeholder="Rechercher un lieu par nom, ville, adresse... (Ctrl+F)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
            {searchTerm && (
              <button 
                className="btn btn-outline-secondary clear-search" 
                onClick={() => setSearchTerm('')}
                aria-label="Effacer la recherche"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="results-count">
              {filteredLieux.length} résultat{filteredLieux.length !== 1 ? 's' : ''} trouvé{filteredLieux.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        
        <div className="d-flex gap-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="filter-dropdown" className="modern-filter-btn">
              <i className="bi bi-funnel me-2"></i>
              {filterType === 'tous' ? 'Tous les lieux' : 
               filterType === 'avec-concerts' ? 'Avec concerts' :
               filterType === 'sans-concerts' ? 'Sans concerts' :
               filterType === 'festival' ? 'Festivals' :
               filterType === 'salle' ? 'Salles' :
               filterType === 'bar' ? 'Bars' :
               filterType === 'plateau' ? 'Plateaux' : 'Filtrer'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilterType('tous')} active={filterType === 'tous'}>
                Tous les lieux
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => setFilterType('avec-concerts')} active={filterType === 'avec-concerts'}>
                Avec concerts
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterType('sans-concerts')} active={filterType === 'sans-concerts'}>
                Sans concerts
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => setFilterType('festival')} active={filterType === 'festival'}>
                Festivals
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterType('salle')} active={filterType === 'salle'}>
                Salles
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterType('bar')} active={filterType === 'bar'}>
                Bars
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterType('plateau')} active={filterType === 'plateau'}>
                Plateaux
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="sort-dropdown" className="modern-sort-btn">
              <i className="bi bi-sort-alpha-down me-2"></i>
              {sortOption === 'nom-asc' ? 'Nom (A-Z)' :
               sortOption === 'nom-desc' ? 'Nom (Z-A)' :
               sortOption === 'ville-asc' ? 'Ville (A-Z)' :
               sortOption === 'ville-desc' ? 'Ville (Z-A)' :
               sortOption === 'jauge-asc' ? 'Jauge (croissant)' :
               sortOption === 'jauge-desc' ? 'Jauge (décroissant)' :
               sortOption === 'concerts-asc' ? 'Nb. concerts (croissant)' :
               sortOption === 'concerts-desc' ? 'Nb. concerts (décroissant)' : 'Trier par'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setSortOption('nom-asc')} active={sortOption === 'nom-asc'}>
                Nom (A-Z)
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSortOption('nom-desc')} active={sortOption === 'nom-desc'}>
                Nom (Z-A)
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => setSortOption('ville-asc')} active={sortOption === 'ville-asc'}>
                Ville (A-Z)
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSortOption('ville-desc')} active={sortOption === 'ville-desc'}>
                Ville (Z-A)
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => setSortOption('jauge-asc')} active={sortOption === 'jauge-asc'}>
                Jauge (croissant)
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSortOption('jauge-desc')} active={sortOption === 'jauge-desc'}>
                Jauge (décroissant)
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => setSortOption('concerts-asc')} active={sortOption === 'concerts-asc'}>
                Nb. concerts (croissant)
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSortOption('concerts-desc')} active={sortOption === 'concerts-desc'}>
                Nb. concerts (décroissant)
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {filteredLieux.length === 0 ? (
        <div className="modern-alert alert d-flex align-items-center">
          <i className="bi bi-info-circle me-3 fs-4"></i>
          <div>
            {searchTerm || filterType !== 'tous' ? 
              "Aucun lieu ne correspond à votre recherche ou aux filtres sélectionnés." : 
              "Aucun lieu n'a été ajouté. Cliquez sur \"Ajouter un lieu\" pour commencer."}
          </div>
        </div>
      ) : (
        <div className="modern-table-container">
          <table className="table table-hover modern-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Ville / Code postal</th>
                <th>Jauge</th>
                <th>Concerts</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLieux.map(lieu => (
                <tr 
                  key={lieu.id} 
                  className="clickable-row table-row-animate"
                  onClick={() => handleRowClick(lieu.id)}
                >
                  <td className="fw-medium">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-geo-alt me-2 text-primary"></i>
                      {lieu.nom || <span className="text-muted">Sans nom</span>}
                    </div>
                  </td>
                  <td>
                    {lieu.type ? (
                      <span className={`type-badge bg-${getTypeBadgeColor(lieu.type)}`}>
                        {formatType(lieu.type)}
                      </span>
                    ) : (
                      <span className="text-muted">Non spécifié</span>
                    )}
                  </td>
                  <td>
                    {lieu.ville ? (
                      <span className="ville-badge">
                        {lieu.ville}
                        {lieu.codePostal && ` (${lieu.codePostal})`}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {lieu.jauge ? (
                      <span className={`jauge-badge bg-${getJaugeColor(lieu.jauge)}`}>
                        {lieu.jauge} places <span className="jauge-type">({getJaugeLabel(lieu.jauge)})</span>
                      </span>
                    ) : (
                      <span className="text-muted">Non spécifiée</span>
                    )}
                  </td>
                  <td>
                    {lieu.concertsAssocies && lieu.concertsAssocies.length > 0 ? (
                      <span className="concert-count">
                        <i className="bi bi-music-note-beamed me-1"></i>
                        {lieu.concertsAssocies.length} concert{lieu.concertsAssocies.length > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-muted">Aucun concert</span>
                    )}
                  </td>
                  <td className="text-end">
                    <div className="action-buttons">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Voir le lieu</Tooltip>}
                      >
                        <Link 
                          to={`/lieux/${lieu.id}`} 
                          // Harmonisation : ajout classe selon l'action
                          className="btn btn-secondary modern-btn"
                          onClick={handleActionClick}
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Modifier le lieu</Tooltip>}
                      >
                        <Link 
                          to={`/lieux/edit/${lieu.id}`} 
                          className="btn btn-outline-primary modern-btn"
                          onClick={handleActionClick}
                        >
                          <i className="bi bi-pencil"></i>
                        </Link>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Supprimer le lieu</Tooltip>}
                      >
                        <button 
                          onClick={(e) => { handleDeleteLieu(lieu.id, e); handleActionClick(e); }} 
                          // Harmonisation : ajout classe selon l'action
                          className="btn btn-danger modern-btn"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LieuxList;