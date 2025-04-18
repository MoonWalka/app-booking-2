import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import '../../style/lieuxList.css';

const LieuxList = () => {
  const navigate = useNavigate();
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLieux, setFilteredLieux] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    avecConcerts: 0,
    sansConcerts: 0
  });
  
  // Référence pour le focus de la recherche
  const searchInputRef = React.useRef(null);

  useEffect(() => {
    const fetchLieux = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'lieux'), orderBy('nom'));
        const querySnapshot = await getDocs(q);
        const lieuxData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Calculer les statistiques
        let avecConcerts = 0;
        let sansConcerts = 0;
        
        lieuxData.forEach(lieu => {
          if (lieu.concertsAssocies && lieu.concertsAssocies.length > 0) {
            avecConcerts++;
          } else {
            sansConcerts++;
          }
        });
        
        setStats({
          total: lieuxData.length,
          avecConcerts,
          sansConcerts
        });
        
        setLieux(lieuxData);
        setFilteredLieux(lieuxData);
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

  // Effet pour filtrer les lieux avec un léger délai
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setFilteredLieux(lieux);
      } else {
        const searchTermLower = searchTerm.toLowerCase();
        const filtered = lieux.filter(lieu => 
          lieu.nom?.toLowerCase().includes(searchTermLower) || 
          lieu.ville?.toLowerCase().includes(searchTermLower) ||
          lieu.adresse?.toLowerCase().includes(searchTermLower) ||
          lieu.codePostal?.toLowerCase().includes(searchTermLower)
        );
        setFilteredLieux(filtered);
      }
    }, 300); // Délai de 300ms pour éviter trop de rafraîchissements

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, lieux]);

  const handleDelete = async (id, e) => {
    // Empêcher la propagation pour que le clic ne navigue pas vers la fiche
    e.stopPropagation();
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      try {
        await deleteDoc(doc(db, 'lieux', id));
        setLieux(lieux.filter(lieu => lieu.id !== id));
        setFilteredLieux(filteredLieux.filter(lieu => lieu.id !== id));
        
        // Mettre à jour les statistiques
        setStats(prev => ({
          ...prev,
          total: prev.total - 1
        }));
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

  // Composant pour les boutons d'action avec tooltip
  const ActionButton = ({ id, to, tooltip, icon, variant, onClick }) => (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{tooltip}</Tooltip>}
    >
      {to ? (
        <Link 
          to={to} 
          className={`btn btn-${variant} btn-icon modern-btn`}
          onClick={handleActionClick}
        >
          {icon}
        </Link>
      ) : (
        <button 
          onClick={(e) => { onClick(e); handleActionClick(e); }} 
          className={`btn btn-${variant} btn-icon modern-btn`}
        >
          {icon}
        </button>
      )}
    </OverlayTrigger>
  );

  if (loading) {
    return <div className="text-center my-5 loading-spinner">Chargement des lieux...</div>;
  }

  return (
    <div className="lieux-container">
      <div className="d-flex justify-content-between align-items-center mb-4 header-container">
        <div>
          <h2 className="modern-title">Liste des lieux</h2>
          <div className="d-flex mt-2 gap-3">
            <span className="stats-badge">
              <span className="stats-number">{stats.total}</span> Total
            </span>
            <span className="stats-badge success">
              <span className="stats-number">{stats.avecConcerts}</span> Avec concerts
            </span>
            <span className="stats-badge warning">
              <span className="stats-number">{stats.sansConcerts}</span> Sans concerts
            </span>
          </div>
        </div>
        <Link to="/lieux/nouveau" className="btn btn-primary modern-add-btn">
          <i className="bi bi-plus-lg me-2"></i>
          Ajouter un lieu
        </Link>
      </div>

      <div className="search-filter-container mb-4">
        <div className="search-bar">
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
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </div>
        <div className="search-results">
          {searchTerm && (
            <p className="results-count">
              {filteredLieux.length} résultat{filteredLieux.length !== 1 ? 's' : ''} trouvé{filteredLieux.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {filteredLieux.length === 0 ? (
        <div className="alert alert-info modern-alert">
          {searchTerm ? (
            <div className="d-flex align-items-center">
              <i className="bi bi-info-circle me-3"></i>
              <p className="mb-0">Aucun lieu ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="d-flex align-items-center">
              <i className="bi bi-info-circle me-3"></i>
              <p className="mb-0">Aucun lieu n'a été ajouté. Cliquez sur "Ajouter un lieu" pour commencer.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="table-responsive modern-table-container">
          <table className="table table-hover modern-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Ville / Code postal</th>
                <th>Adresse</th>
                <th>Jauge</th>
                <th>Concerts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLieux.map(lieu => (
                <tr 
                  key={lieu.id} 
                  className="table-row-animate clickable-row"
                  onClick={() => handleRowClick(lieu.id)}
                >
                  <td className="fw-medium">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-geo-alt me-2 text-primary"></i>
                      {lieu.nom || <span className="text-muted">Sans nom</span>}
                    </div>
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
                    {lieu.adresse ? (
                      <span className="address-text">
                        {lieu.adresse}
                      </span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {lieu.jauge ? (
                      <span className={`jauge-badge bg-${getJaugeColor(lieu.jauge)}`}>
                        {lieu.jauge} places
                        <span className="jauge-type ms-1">({getJaugeLabel(lieu.jauge)})</span>
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
                  <td>
                    <div className="btn-group action-buttons">
                      <ActionButton 
                        to={`/lieux/${lieu.id}`} 
                        tooltip="Voir le lieu" 
                        icon={<i className="bi bi-eye"></i>} 
                        variant="light"
                      />
                      <ActionButton 
                        to={`/lieux/${lieu.id}/modifier`} 
                        tooltip="Modifier le lieu" 
                        icon={<i className="bi bi-pencil"></i>} 
                        variant="light"
                      />
                      <ActionButton 
                        tooltip="Supprimer le lieu" 
                        icon={<i className="bi bi-trash"></i>} 
                        variant="light" 
                        onClick={(e) => handleDelete(lieu.id, e)}
                      />
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