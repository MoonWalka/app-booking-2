import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import '../../style/programmateursList.css'; // Nouveau fichier CSS pour les styles

const ProgrammateursList = () => {
  const [programmateurs, setProgrammateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProgrammateurs, setFilteredProgrammateurs] = useState([]);

  useEffect(() => {
    const fetchProgrammateurs = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'programmateurs'), orderBy('nom'));
        const querySnapshot = await getDocs(q);
        const programmateursData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProgrammateurs(programmateursData);
        setFilteredProgrammateurs(programmateursData);
      } catch (error) {
        console.error('Erreur lors de la récupération des programmateurs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgrammateurs();
  }, []);

  // Effet pour filtrer les programmateurs lorsque le terme de recherche change
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProgrammateurs(programmateurs);
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = programmateurs.filter(prog => 
        prog.nom?.toLowerCase().includes(searchTermLower) || 
        prog.structure?.toLowerCase().includes(searchTermLower) ||
        prog.email?.toLowerCase().includes(searchTermLower)
      );
      setFilteredProgrammateurs(filtered);
    }
  }, [searchTerm, programmateurs]);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce programmateur ?')) {
      try {
        await deleteDoc(doc(db, 'programmateurs', id));
        setProgrammateurs(programmateurs.filter(prog => prog.id !== id));
        setFilteredProgrammateurs(filteredProgrammateurs.filter(prog => prog.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression du programmateur:', error);
        alert('Une erreur est survenue lors de la suppression du programmateur');
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

  if (loading) {
    return <div className="text-center my-5 loading-spinner">Chargement des programmateurs...</div>;
  }

  return (
    <div className="programmateurs-container">
      <div className="d-flex justify-content-between align-items-center mb-4 header-container">
        <h2 className="modern-title">Liste des programmateurs</h2>
        <Link to="/programmateurs/nouveau" className="btn btn-primary modern-add-btn">
          <i className="bi bi-plus-lg me-2"></i>
          Ajouter un programmateur
        </Link>
      </div>

      <div className="search-filter-container mb-4">
        <div className="search-bar">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control search-input"
              placeholder="Rechercher un programmateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              {filteredProgrammateurs.length} résultat{filteredProgrammateurs.length !== 1 ? 's' : ''} trouvé{filteredProgrammateurs.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {filteredProgrammateurs.length === 0 ? (
        <div className="alert alert-info modern-alert">
          {searchTerm ? (
            <div className="d-flex align-items-center">
              <i className="bi bi-info-circle me-3"></i>
              <p className="mb-0">Aucun programmateur ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="d-flex align-items-center">
              <i className="bi bi-info-circle me-3"></i>
              <p className="mb-0">Aucun programmateur n'a été ajouté. Cliquez sur "Ajouter un programmateur" pour commencer.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="table-responsive modern-table-container">
          <table className="table table-striped modern-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Structure</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProgrammateurs.map(prog => (
                <tr key={prog.id} className="table-row-animate">
                  <td className="fw-medium">{prog.nom}</td>
                  <td>
                    {prog.structure ? (
                      <span className="structure-badge">{prog.structure}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {prog.email ? (
                      <a href={`mailto:${prog.email}`} className="email-link">
                        <i className="bi bi-envelope-fill me-1"></i>
                        {prog.email}
                      </a>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {prog.telephone ? (
                      <a href={`tel:${prog.telephone}`} className="phone-link">
                        <i className="bi bi-telephone-fill me-1"></i>
                        {prog.telephone}
                      </a>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group action-buttons">
                      <ActionButton 
                        to={`/programmateurs/${prog.id}`} 
                        tooltip="Voir les détails" 
                        icon={<i className="bi bi-eye"></i>} 
                        variant="light"
                      />
                      <ActionButton 
                        to={`/programmateurs/edit/${prog.id}`} 
                        tooltip="Modifier le programmateur" 
                        icon={<i className="bi bi-pencil"></i>} 
                        variant="light"
                      />
                      <ActionButton 
                        tooltip="Supprimer le programmateur" 
                        icon={<i className="bi bi-trash"></i>} 
                        variant="light" 
                        onClick={() => handleDelete(prog.id)}
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

export default ProgrammateursList;
