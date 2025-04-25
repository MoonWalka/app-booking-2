import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Button, Form, InputGroup } from 'react-bootstrap';
// Mise à jour des importations pour utiliser le fichier lieux.css unifié au lieu de lieuxListMobile.css
import '@styles/pages/lieux.css';
import '@styles/components/spinner.css'; // Import du style du spinner unifié

const LieuxListMobile = () => {
  const navigate = useNavigate();
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLieux, setFilteredLieux] = useState([]);

  // Charger les lieux
  useEffect(() => {
    const fetchLieux = async () => {
      try {
        setLoading(true);
        const lieuxRef = collection(db, 'lieux');
        const q = query(lieuxRef, orderBy('nom', 'asc'));
        const querySnapshot = await getDocs(q);

        const lieuxData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setLieux(lieuxData);
        setFilteredLieux(lieuxData);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des lieux:', error);
        setLoading(false);
      }
    };

    fetchLieux();
  }, []);

  // Filtrer les lieux en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm) {
      const filtered = lieux.filter(lieu => 
        lieu.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lieu.ville?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lieu.codePostal?.includes(searchTerm)
      );
      setFilteredLieux(filtered);
    } else {
      setFilteredLieux(lieux);
    }
  }, [searchTerm, lieux]);

  // Supprimer un lieu
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      try {
        await deleteDoc(doc(db, 'lieux', id));
        setLieux(lieux.filter(lieu => lieu.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression du lieu:', error);
        alert('Une erreur est survenue lors de la suppression du lieu.');
      }
    }
  };

  return (
    <div className="lieux-mobile-container">
      {/* En-tête avec titre et bouton d'ajout */}
      <div className="lieux-header">
        <h1>Lieux</h1>
        <Button 
          variant="primary"
          className="lieux-add-btn"
          onClick={() => navigate('/lieux/nouveau')}
        >
          <i className="bi bi-plus-lg"></i>
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="lieux-search-container">
        <InputGroup>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Rechercher un lieu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button 
              variant="outline-secondary"
              onClick={() => setSearchTerm('')}
            >
              <i className="bi bi-x"></i>
            </Button>
          )}
        </InputGroup>
      </div>

      {/* Liste de lieux */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner-overlay">
            <div className="spinner"></div>
            <p className="spinner-text">Chargement des lieux...</p>
          </div>
        </div>
      ) : filteredLieux.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-geo-alt"></i>
          <p>Aucun lieu trouvé</p>
          <Button 
            variant="primary"
            onClick={() => navigate('/lieux/nouveau')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Ajouter un lieu
          </Button>
        </div>
      ) : (
        <div className="lieux-list-mobile">
          {filteredLieux.map(lieu => (
            <div 
              key={lieu.id}
              className="lieu-card"
              onClick={() => navigate(`/lieux/${lieu.id}`)}
            >
              <div className="lieu-card-header">
                <h3 className="lieu-card-title">{lieu.nom}</h3>
              </div>
              <div className="lieu-card-body">
                {lieu.adresse && (
                  <div className="lieu-info-item">
                    <div className="lieu-info-icon">
                      <i className="bi bi-geo-alt"></i>
                    </div>
                    <div className="lieu-info-text">
                      {lieu.adresse}<br />
                      {lieu.codePostal} {lieu.ville}
                    </div>
                  </div>
                )}
                {lieu.capacite && (
                  <div className="lieu-info-item">
                    <div className="lieu-info-icon">
                      <i className="bi bi-people"></i>
                    </div>
                    <div className="lieu-info-text">
                      Capacité: {lieu.capacite} personnes
                    </div>
                  </div>
                )}
                
{lieu.email && (
    <div className="lieu-info-item">
      <div className="lieu-info-icon">
        <i className="bi bi-envelope"></i>
      </div>
      <div className="lieu-info-text">
        {lieu.email}
      </div>
    </div>
  )}
  {lieu.telephone && (
    <div className="lieu-info-item">
      <div className="lieu-info-icon">
        <i className="bi bi-telephone"></i>
      </div>
      <div className="lieu-info-text">
        {lieu.telephone}
      </div>
    </div>
  )}
</div>
<div className="lieu-card-actions">
  <Link 
    to={`/lieux/edit/${lieu.id}`}
    className="btn btn-sm btn-outline-secondary lieu-action-btn"
    onClick={(e) => e.stopPropagation()}
  >
    <i className="bi bi-pencil"></i>
  </Link>
  <button
    className="btn btn-sm btn-outline-danger lieu-action-btn"
    onClick={(e) => handleDelete(lieu.id, e)}
  >
    <i className="bi bi-trash"></i>
  </button>
</div>
</div>
))}
</div>
)}
</div>
);
};

export default LieuxListMobile;
