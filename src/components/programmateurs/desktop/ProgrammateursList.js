import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import firebase from '@/firebase';
import '@styles/index.css';
import '@styles/components/lists.css';
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

  if (loading) {
    return <Spinner message="Chargement des programmateurs..." contentOnly={true} />;
  }

  return (
    <div className="container-fluid p-4">
      <div className="section-header">
        <h2><i className="bi bi-people-gear text-primary me-2"></i>Liste des programmateurs</h2>
        <Link to="/programmateurs/nouveau" className="btn-add">
          <i className="bi bi-plus"></i>
          Ajouter un programmateur
        </Link>
      </div>

      <form className="search-bar" autoComplete="off">
        <div className="input-group shadow-sm">
          <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
          <input
            ref={searchInputRef}
            type="text"
            className="form-control"
            placeholder="Rechercher un programmateur... (Ctrl+F)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="btn" 
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
              tabIndex="-1"
            >
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
      </form>

      {searchTerm && (
        <p className="small text-muted mb-3">
          {filteredProgrammateurs.length} résultat{filteredProgrammateurs.length !== 1 ? 's' : ''} trouvé{filteredProgrammateurs.length !== 1 ? 's' : ''}
        </p>
      )}

      {filteredProgrammateurs.length === 0 ? (
        <div className="alert alert-info">
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
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Nom</th>
                <th scope="col">Structure</th>
                <th scope="col">Email</th>
                <th scope="col">Téléphone</th>
                <th scope="col" style={{minWidth: "90px"}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProgrammateurs.map(prog => (
                <tr 
                  key={prog.id} 
                  className="cursor-pointer"
                  onClick={() => handleRowClick(prog.id)}
                >
                  <td title={prog.nom} style={{fontSize: "1.09em", fontWeight: "500"}}>
                    <i className="bi bi-person-circle me-2 text-primary"></i>
                    {prog.nom}
                  </td>
                  <td>
                    {prog.structure ? (
                      <span className="structure-badge">{prog.structure}</span>
                    ) : (
                      <span className="field-empty"><i className="bi bi-dash-circle"></i> non spécifié</span>
                    )}
                  </td>
                  <td>
                    {prog.email ? (
                      <a 
                        href={`mailto:${prog.email}`} 
                        className="text-decoration-none"
                        onClick={handleActionClick}
                      >
                        <i className="bi bi-envelope me-1"></i>
                        {prog.email}
                      </a>
                    ) : (
                      <span className="field-empty"><i className="bi bi-dash-circle"></i> non spécifié</span>
                    )}
                  </td>
                  <td>
                    {prog.telephone ? (
                      <a 
                        href={`tel:${prog.telephone}`} 
                        className="text-decoration-none"
                        onClick={handleActionClick}
                      >
                        <i className="bi bi-telephone me-1"></i>
                        {prog.telephone}
                      </a>
                    ) : (
                      <span className="field-empty"><i className="bi bi-dash-circle"></i> non spécifié</span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions d-flex">
                      <Link 
                        to={`/programmateurs/edit/${prog.id}`} 
                        className="btn btn-light me-2"
                        onClick={handleActionClick}
                        title="Modifier le programmateur"
                      >
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <button 
                        onClick={(e) => handleDelete(prog.id, e)}
                        className="btn btn-light"
                        title="Supprimer le programmateur"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
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
