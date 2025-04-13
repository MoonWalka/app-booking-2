import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Badge from 'react-bootstrap/Badge';
import './LieuxList.css'; // Nouveau fichier CSS pour les styles personnalisés

const LieuxList = () => {
  const [lieux, setLieux] = useState([]);
  const [filteredLieux, setFilteredLieux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('tous');

  useEffect(() => {
    const fetchLieux = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'lieux'), orderBy('nom'));
        const querySnapshot = await getDocs(q);
        const lieuxData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Si le lieu n'a pas de statut, on lui attribue "en cours de prog" par défaut
          status: doc.data().status || 'en cours de prog'
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

  // Effet pour filtrer les lieux lorsque le filtre de statut change
  useEffect(() => {
    if (statusFilter === 'tous') {
      setFilteredLieux(lieux);
    } else {
      setFilteredLieux(lieux.filter(lieu => lieu.status === statusFilter));
    }
  }, [statusFilter, lieux]);

  const handleDelete = async (id) => {
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
        <Link to={to} className={`btn btn-${variant} btn-icon modern-btn`}>
          {icon}
        </Link>
      ) : (
        <button onClick={onClick} className={`btn btn-${variant} btn-icon modern-btn`}>
          {icon}
        </button>
      )}
    </OverlayTrigger>
  );

  // Composant pour afficher un badge de statut
  const StatusBadge = ({ status }) => {
    let variant = 'secondary';
    let text = status;
    
    switch (status) {
      case 'confirmé':
        variant = 'success';
        break;
      case 'passé':
        variant = 'secondary';
        break;
      case 'en cours de prog':
        variant = 'warning';
        break;
      default:
        variant = 'info';
    }
    
    return <Badge bg={variant} className="status-badge">{text}</Badge>;
  };

  if (loading) {
    return <div className="text-center my-5 loading-spinner">Chargement des lieux...</div>;
  }

  return (
    <div className="lieux-container">
      <div className="d-flex justify-content-between align-items-center mb-4 header-container">
        <h2 className="modern-title">Liste des lieux</h2>
        <Link to="/lieux/nouveau" className="btn btn-primary modern-add-btn">
          + Ajouter un lieu
        </Link>
      </div>

      <div className="filters-bar mb-4">
        <div className="d-flex align-items-center">
          <label htmlFor="statusFilter" className="me-2 filter-label">Filtrer par statut:</label>
          <select 
            id="statusFilter" 
            className="form-select status-select" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="tous">Tous les statuts</option>
            <option value="confirmé">Confirmé</option>
            <option value="passé">Passé</option>
            <option value="en cours de prog">En cours de programmation</option>
          </select>
        </div>
      </div>

      {filteredLieux.length === 0 ? (
        <div className="alert alert-info modern-alert">
          {statusFilter === 'tous' ? (
            <p className="mb-0">Aucun lieu n'a été ajouté. Cliquez sur "Ajouter un lieu" pour commencer.</p>
          ) : (
            <p className="mb-0">Aucun lieu avec le statut "{statusFilter}" n'a été trouvé.</p>
          )}
        </div>
      ) : (
        <div className="table-responsive modern-table-container">
          <table className="table table-striped modern-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Adresse</th>
                <th>Ville</th>
                <th>Capacité</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLieux.map(lieu => (
                <tr key={lieu.id} className="table-row-animate">
                  <td className="fw-medium">{lieu.nom}</td>
                  <td>{lieu.adresse}</td>
                  <td>{lieu.ville}</td>
                  <td>{lieu.capacite || '-'}</td>
                  <td>
                    <StatusBadge status={lieu.status} />
                  </td>
                  <td>
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
                        onClick={() => handleDelete(lieu.id)}
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