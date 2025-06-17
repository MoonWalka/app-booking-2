import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import TabNavigation from '../components/common/TabNavigation';
import ArtisteCreationModal from '../components/artistes/modal/ArtisteCreationModal';
import ProjetCreationModal from '../components/projets/modal/ProjetCreationModal';
import useGenericEntityList from '../hooks/generics/lists/useGenericEntityList';
import '@styles/index.css';

const BookingParametragePage = () => {
  const [activeTab, setActiveTab] = useState('artistes');
  const [selectedArtisteId, setSelectedArtisteId] = useState(null);
  const [showArtisteModal, setShowArtisteModal] = useState(false);
  const [editArtisteData, setEditArtisteData] = useState(null);
  const [showProjetModal, setShowProjetModal] = useState(false);
  const [editProjetData, setEditProjetData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupérer la liste des artistes pour le menu
  const { items: artistes, loading: artistesLoading } = useGenericEntityList('artistes', {
    sort: { field: 'nom', direction: 'asc' },
    refreshKey
  });

  // Déterminer l'onglet actif et l'artiste sélectionné en fonction de l'URL
  useEffect(() => {
    const path = location.pathname;
    let newActiveTab = 'artistes';
    let newSelectedArtisteId = null;
    
    if (path.includes('/booking/parametrage/artistes') || path === '/booking/parametrage') {
      newActiveTab = 'artistes';
    } else if (path.includes('/booking/parametrage/projets')) {
      newActiveTab = 'projets';
    } else if (path.match(/\/booking\/parametrage\/artiste\/(.+)/)) {
      const artisteMatch = path.match(/\/booking\/parametrage\/artiste\/(.+)/);
      if (artisteMatch) {
        newSelectedArtisteId = artisteMatch[1];
        newActiveTab = 'artistes';
      }
    }
    
    if (newActiveTab !== activeTab) {
      setActiveTab(newActiveTab);
    }
    if (newSelectedArtisteId !== selectedArtisteId) {
      setSelectedArtisteId(newSelectedArtisteId);
    }
  }, [location.pathname]);
  
  // Effet séparé pour sélectionner automatiquement le premier artiste
  useEffect(() => {
    if (activeTab === 'artistes' && !selectedArtisteId && artistes.length > 0 && !artistesLoading) {
      const firstArtisteId = artistes[0].id;
      setSelectedArtisteId(firstArtisteId);
      navigate(`/booking/parametrage/artiste/${firstArtisteId}`, { replace: true });
    }
  }, [activeTab, selectedArtisteId, artistes, artistesLoading, navigate]);

  
  // Gestionnaire pour la sélection d'un artiste
  const handleArtisteSelect = useCallback((artisteId) => {
    setSelectedArtisteId(artisteId);
    navigate(`/booking/parametrage/artiste/${artisteId}`);
  }, [navigate]);
  
  
  // Gestionnaire pour la création/modification d'un artiste
  const handleArtisteCreated = useCallback((artisteData) => {
    console.log('Artiste créé/modifié:', artisteData);
    setRefreshKey(prev => prev + 1); // Rafraîchir la liste
    setEditArtisteData(null); // Réinitialiser le mode édition
  }, []);
  
  // Gestionnaire pour ouvrir la modal en mode édition
  const handleEditArtiste = useCallback((artiste) => {
    setEditArtisteData(artiste);
    setShowArtisteModal(true);
  }, []);
  
  // Gestionnaire pour ouvrir la modal en mode création
  const handleCreateArtiste = useCallback(() => {
    setEditArtisteData(null);
    setShowArtisteModal(true);
  }, []);
  
  // Gestionnaire pour fermer la modal artiste
  const handleCloseModal = useCallback(() => {
    setShowArtisteModal(false);
    setEditArtisteData(null);
  }, []);

  // Gestionnaires pour les projets
  const handleProjetCreated = useCallback((projetData) => {
    console.log('Projet créé/modifié:', projetData);
    setRefreshKey(prev => prev + 1); // Rafraîchir la liste
    setEditProjetData(null); // Réinitialiser le mode édition
  }, []);
  
  const handleCreateProjet = useCallback(() => {
    setEditProjetData(null);
    setShowProjetModal(true);
  }, []);
  
  const handleCloseProjetModal = useCallback(() => {
    setShowProjetModal(false);
    setEditProjetData(null);
  }, []);

  
  // Rendu du menu latéral selon le contexte
  const renderSidebarMenu = () => {
    return (
      <TabNavigation
        tabs={[
          { label: 'Artistes', content: null }
        ]}
        activeTab={0}
        onTabChange={() => {}}
        vertical={true}
      />
    );
  };

  // Rendu du menu latéral de droite pour les artistes
  const renderArtistSidebar = () => {
    return (
      <div>
        {artistesLoading ? (
          <div className="text-center p-2">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : artistes.length === 0 ? (
          <div className="text-center p-3">
            <i className="bi bi-music-note-beamed" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
            <p className="small text-muted mt-2">Aucun artiste</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {artistes.map(artiste => (
              <button
                key={artiste.id}
                className={`list-group-item list-group-item-action border-0 ${
                  selectedArtisteId === artiste.id ? 'active' : ''
                }`}
                onClick={() => handleArtisteSelect(artiste.id)}
              >
                <div className="text-start">
                  <h6 className="mb-0 small">{artiste.prenom} {artiste.nom}</h6>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMainContent = () => {
    if (selectedArtisteId) {
      // Vue détail d'un artiste spécifique
      const artiste = artistes.find(a => a.id === selectedArtisteId);
      return (
        <div>
          {artiste ? (
            <div>
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="border-bottom pb-2 mb-3">Informations générales</h6>
                      <div className="mb-2">
                        <strong>Nom :</strong> 
                        <span className="ms-2">{artiste.nom || 'Non renseigné'}</span>
                      </div>
                      <div className="mb-2">
                        <strong>Prénom :</strong> 
                        <span className="ms-2">{artiste.prenom || 'Non renseigné'}</span>
                      </div>
                      <div className="mb-2">
                        <strong>Email :</strong> 
                        <span className="ms-2">{artiste.email || 'Non renseigné'}</span>
                      </div>
                      <div className="mb-2">
                        <strong>Téléphone :</strong> 
                        <span className="ms-2">{artiste.telephone || 'Non renseigné'}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="border-bottom pb-2 mb-3">Informations professionnelles</h6>
                      <div className="mb-2">
                        <strong>Genre musical :</strong> 
                        <span className="ms-2">{artiste.genre || 'Non renseigné'}</span>
                      </div>
                      <div className="mb-2">
                        <strong>Ville :</strong> 
                        <span className="ms-2">{artiste.ville || 'Non renseigné'}</span>
                      </div>
                      <div className="mb-2">
                        <strong>Statut :</strong> 
                        <span className={`ms-2 badge ${artiste.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {artiste.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-top">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleEditArtiste(artiste)}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Fiche Projet */}
              <div className="card mt-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                    <h6 className="mb-0">
                      <i className="bi bi-folder me-2"></i>
                      Projet associé
                    </h6>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={handleCreateProjet}
                    >
                      <i className="bi bi-plus me-1"></i>
                      Nouveau projet
                    </button>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-2">
                        <strong>Nom du projet :</strong> 
                        <span className="ms-2">{artiste.projet?.nom || 'Non renseigné'}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <strong>Code du projet :</strong> 
                        <span className="ms-2">{artiste.projet?.code || 'Non renseigné'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Artiste non trouvé
            </div>
          )}
        </div>
      );
    }
    
    // Vue des artistes uniquement
    // Si aucun artiste n'est sélectionné et qu'il y en a dans la liste, afficher un message
    if (!selectedArtisteId && artistes.length > 0) {
      return (
        <div className="text-center p-5">
          <i className="bi bi-music-note-beamed" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
          <h4 className="mt-3">Sélectionnez un artiste</h4>
          <p className="text-muted">Choisissez un artiste dans le menu de gauche pour voir ses détails.</p>
        </div>
      );
    }
    // Si aucun artiste n'existe, proposer d'en créer un
    if (artistes.length === 0) {
      return (
        <div className="text-center p-5">
          <i className="bi bi-music-note-beamed" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
          <h4 className="mt-3">Aucun artiste</h4>
          <p className="text-muted">Commencez par créer votre premier artiste.</p>
          <button 
            className="btn btn-primary"
            onClick={handleCreateArtiste}
          >
            <i className="bi bi-plus me-1"></i>
            Créer un artiste
          </button>
        </div>
      );
    }
    return null;
  };


  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Paramétrage Booking</h2>
      </div>
      
      
      <Row>
        <Col md={2}>
          {renderSidebarMenu()}
        </Col>
        <Col md={2}>
          {renderArtistSidebar()}
        </Col>
        <Col md={8}>
          {renderMainContent()}
        </Col>
      </Row>
      
      {/* Modal de création/édition d'artiste */}
      <ArtisteCreationModal
        show={showArtisteModal}
        onHide={handleCloseModal}
        onCreated={handleArtisteCreated}
        editArtiste={editArtisteData}
      />
      
      {/* Modal de création/édition de projet */}
      <ProjetCreationModal
        show={showProjetModal}
        onHide={handleCloseProjetModal}
        onCreated={handleProjetCreated}
        editProjet={editProjetData}
      />
    </Container>
  );
};

export default BookingParametragePage;