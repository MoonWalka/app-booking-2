import '../../style/lieuList.css';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Badge from 'react-bootstrap/Badge';

const LieuxList = () => {
  const navigate = useNavigate();
  const [lieux, setLieux] = useState([]);
  const [filteredLieux, setFilteredLieux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('tous');

  useEffect(() => {
    const fetchLieux = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'lieux'), orderBy('nom'));
        const querySnapshot = await getDocs(q);
        const lieuxData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Si le lieu n'a pas de type, on lui attribue "non spécifié" par défaut
          type: doc.data().type || 'non spécifié'
        }));
        setLieux(lieuxData);
        setFilteredLieux(lieuxData);
      } catch (error) {
        console.error('Erreur lors de la récupération des lieux:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLieux();
  }, []);

  // Effet pour filtrer les lieux lorsque le filtre de type change
  useEffect(() => {
    if (typeFilter === 'tous') {
      setFilteredLieux(lieux);
    } else {
      setFilteredLieux(lieux.filter(lieu => lieu.type === typeFilter));
    }
  }, [typeFilter, lieux]);

  // Fonction pour calculer le nombre de lieux par type
  const getTypeCount = (type) => {
    if (type === 'tous') {
      return lieux.length;
    }
    return lieux.filter(lieu => lieu.type.toLowerCase() === type.toLowerCase()).length;
  };

  // Fonction pour gérer le clic sur une ligne et naviguer vers la fiche détaillée
  const handleRowClick = (lieuId) => {
    navigate(`/lieux/${lieuId}`);
  };

  const handleDelete = async (id, e) => {
    // Empêcher la propagation pour ne pas déclencher handleRowClick
    e.stopPropagation();
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      try {
        await deleteDoc(doc(db, 'lieux', id));
        setLieux(lieux.filter(lieu => lieu.id !== id));
        setFilteredLieux(filteredLieux.filter(lieu => lieu.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression du lieu:', error);
        alert('Une erreur est survenue lors de la suppression du lieu');
      }
    }
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
          onClick={(e) => e.stopPropagation()} // Empêcher la propagation pour ne pas naviguer via handleRowClick
        >
          {icon}
        </Link>
      ) : (
        <button 
          onClick={onClick} 
          className={`btn btn-${variant} btn-icon modern-btn`}
        >
          {icon}
        </button>
      )}
    </OverlayTrigger>
  );

  // Composant pour afficher un badge de type
  const TypeBadge = ({ type }) => {
    let variant = 'secondary';
    
    switch (type.toLowerCase()) {
      case 'bar':
        variant = 'info';
        break;
      case 'festival':
        variant = 'danger';
        break;
      case 'salle':
        variant = 'success';
        break;
      case 'plateau':
        variant = 'warning';
        break;
      default:
        variant = 'secondary';
    }
    
    return <Badge bg={variant} className="type-badge">{type}</Badge>;
  };

  if (loading) {
    return <div className="text-center my-5 loading-spinner">Chargement des lieux...</div>;
  }

  return (
    <div className="lieux-container">
      <div className="d-flex justify-content-between align-items-center mb-4 header-container">
        <h2 className="modern-title">Liste des lieux</h2>
        <Link to="/lieux/nouveau" className="btn btn-primary modern-add-btn">
          <i className="bi bi-plus-lg me-2"></i>
          Ajouter un lieu
        </Link>
      </div>

      <div className="filters-bar mb-4">
        <div className="d-flex align-items-center">
          <label htmlFor="typeFilter" className="me-2 filter-label">Filtrer par type:</label>
          <select 
            id="typeFilter" 
            className="form-select type-select" 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="tous">Tous les types</option>
            <option value="bar">Bar</option>
            <option value="festival">Festival</option>
            <option value="salle">Salle</option>
            <option value="plateau">Plateau</option>
            <option value="non spécifié">Non spécifié</option>
          </select>
        </div>
      </div>

      {/* Ajout des filtres rapides avec badge de comptage */}
      <div className="filter-tags">
        <span 
          className={`filter-tag filter-tag-tous ${typeFilter === 'tous' ? 'active' : ''}`} 
          onClick={() => setTypeFilter('tous')}
        >
          Tous <Badge bg="light" text="dark" pill>{getTypeCount('tous')}</Badge>
        </span>
        <span 
          className={`filter-tag filter-tag-bar ${typeFilter === 'bar' ? 'active' : ''}`} 
          onClick={() => setTypeFilter('bar')}
        >
          Bar <Badge bg="light" text="dark" pill>{getTypeCount('bar')}</Badge>
        </span>
        <span 
          className={`filter-tag filter-tag-festival ${typeFilter === 'festival' ? 'active' : ''}`} 
          onClick={() => setTypeFilter('festival')}
        >
          Festival <Badge bg="light" text="dark" pill>{getTypeCount('festival')}</Badge>
        </span>
        <span 
          className={`filter-tag filter-tag-salle ${typeFilter === 'salle' ? 'active' : ''}`} 
          onClick={() => setTypeFilter('salle')}
        >
          Salle <Badge bg="light" text="dark" pill>{getTypeCount('salle')}</Badge>
        </span>
        <span 
          className={`filter-tag filter-tag-plateau ${typeFilter === 'plateau' ? 'active' : ''}`} 
          onClick={() => setTypeFilter('plateau')}
        >
          Plateau <Badge bg="light" text="dark" pill>{getTypeCount('plateau')}</Badge>
        </span>
      </div>

      {filteredLieux.length === 0 ? (
        <div className="alert alert-info modern-alert">
          {typeFilter === 'tous' ? (
            <p className="mb-0">Aucun lieu n'a été ajouté. Cliquez sur "Ajouter un lieu" pour commencer.</p>
          ) : (
            <p className="mb-0">Aucun lieu de type "{typeFilter}" n'a été trouvé.</p>
          )}
        </div>
      ) : (
        <div className="table-responsive modern-table-container">
          <table className="table table-hover modern-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Adresse</th>
                <th>Ville</th>
                <th>Capacité</th>
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
                  <td className="fw-medium">{lieu.nom}</td>
                  <td><TypeBadge type={lieu.type} /></td>
                  <td>{lieu.adresse}</td>
                  <td>{lieu.ville}</td>
                  <td>{lieu.capacite || '-'}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="btn-group action-buttons">
                      <ActionButton 
                        to={`/lieux/${lieu.id}`} 
                        tooltip="Voir les détails" 
                        icon={<i className="bi bi-eye" />} 
                        variant="light"
                      />
                      <ActionButton 
                        to={`/lieux/edit/${lieu.id}`} 
                        tooltip="Modifier le lieu" 
                        icon={<i className="bi bi-pencil" />} 
                        variant="light"
                      />
                      <ActionButton 
                        tooltip="Supprimer le lieu" 
                        icon={<i className="bi bi-trash" />} 
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
      
      {/* Ajouter du CSS pour les lignes cliquables */}
      <style jsx>{`
        .clickable-row {
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .clickable-row:hover {
          background-color: rgba(0, 123, 255, 0.05);
        }
        
        .modern-table.table-hover tbody tr:hover {
          background-color: rgba(0, 123, 255, 0.05);
        }
      `}</style>
    </div>
  );
};

export default LieuxList;
