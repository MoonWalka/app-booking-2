import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import firebase from '@/firebase';
import '@styles/index.css';
import { collection, query, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import Spinner from '@/components/common/Spinner';

const ProgrammateursList = () => {
  const navigate = useNavigate();
  const [programmateurs, setProgrammateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProgrammateurs, setFilteredProgrammateurs] = useState([]);
  
  // Référence pour le focus de la recherche
  const searchInputRef = React.useRef(null);

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

  // Effet pour filtrer les programmateurs avec un léger délai
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
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
    }, 300); // Délai de 300ms pour éviter trop de rafraîchissements

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, programmateurs]);

  const handleDelete = async (id, e) => {
    // Empêcher la propagation pour que le clic ne navigue pas vers la fiche
    e.stopPropagation();
    
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

  // Fonction pour naviguer vers la fiche du programmateur
  const handleRowClick = (progId) => {
    navigate(`/programmateurs/${progId}`);
  };

  // Gestionnaire pour empêcher la propagation des clics sur les liens et boutons dans les lignes
  const handleActionClick = (e) => {
    e.stopPropagation();
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
          className={`btn btn-${variant} btn-sm`}
          onClick={handleActionClick}
        >
          {icon}
        </Link>
      ) : (
        <button 
          onClick={(e) => { onClick(e); handleActionClick(e); }} 
          className={`btn btn-${variant} btn-sm`}
        >
          {icon}
        </button>
      )}
    </OverlayTrigger>
  );

  if (loading) {
    return <Spinner message="Chargement des programmateurs..." contentOnly={true} />;
  }

  return (
    <div className="container-fluid p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="fas fa-users-cog text-primary me-2"></i>Liste des programmateurs</h2>
        <Link to="/programmateurs/nouveau" className="btn-add">
          <i className="fas fa-plus me-2"></i>
          Ajouter un programmateur
        </Link>
      </div>

      <div className="mb-4">
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              ref={searchInputRef}
              type="text"
              className="form-control"
              placeholder="Rechercher un programmateur... (Ctrl+F)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
            {searchTerm && (
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
        <div>
          {searchTerm && (
            <p className="small text-muted">
              {filteredProgrammateurs.length} résultat{filteredProgrammateurs.length !== 1 ? 's' : ''} trouvé{filteredProgrammateurs.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {filteredProgrammateurs.length === 0 ? (
        <div className="alert alert-info">
          {searchTerm ? (
            <div className="d-flex align-items-center">
              <i className="fas fa-info-circle me-3"></i>
              <p className="mb-0">Aucun programmateur ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="d-flex align-items-center">
              <i className="fas fa-info-circle me-3"></i>
              <p className="mb-0">Aucun programmateur n'a été ajouté. Cliquez sur "Ajouter un programmateur" pour commencer.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover mb-0">
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
                <tr 
                  key={prog.id} 
                  className="cursor-pointer"
                  onClick={() => handleRowClick(prog.id)}
                >
                  <td className="fw-medium">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-user-circle me-2 text-primary"></i>
                      {prog.nom}
                    </div>
                  </td>
                  <td>
                    {prog.structure ? (
                      <span className="structure-badge">{prog.structure}</span>
                    ) : (
                      <span className="field-empty"><i className="fa fa-minus-circle"></i> non spécifié</span>
                    )}
                  </td>
                  <td>
                    {prog.email ? (
                      <a 
                        href={`mailto:${prog.email}`} 
                        className="text-decoration-none"
                        onClick={handleActionClick}
                      >
                        <i className="fas fa-envelope me-1"></i>
                        {prog.email}
                      </a>
                    ) : (
                      <span className="field-empty"><i className="fa fa-minus-circle"></i> non spécifié</span>
                    )}
                  </td>
                  <td>
                    {prog.telephone ? (
                      <a 
                        href={`tel:${prog.telephone}`} 
                        className="text-decoration-none"
                        onClick={handleActionClick}
                      >
                        <i className="fas fa-phone me-1"></i>
                        {prog.telephone}
                      </a>
                    ) : (
                      <span className="field-empty"><i className="fa fa-minus-circle"></i> non spécifié</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group">
                      <ActionButton 
                        to={`/programmateurs/edit/${prog.id}`} 
                        tooltip="Modifier le programmateur" 
                        icon={<i className="fas fa-pencil-alt"></i>} 
                        variant="light"
                      />
                      <ActionButton 
                        tooltip="Supprimer le programmateur" 
                        icon={<i className="fas fa-trash"></i>} 
                        variant="light" 
                        onClick={(e) => handleDelete(prog.id, e)}
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
