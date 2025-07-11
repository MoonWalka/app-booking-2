import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import TabNavigation from '../components/common/TabNavigation';
import ArtisteCreationModal from '../components/artistes/modal/ArtisteCreationModal';
import ProjetCreationModal from '../components/projets/modal/ProjetCreationModal';
import useGenericEntityList from '../hooks/generics/lists/useGenericEntityList';
import '@styles/index.css';

import TypesEvenementContent from '../components/parametrage/TypesEvenementContent';
import TypesSalleContent from '../components/parametrage/TypesSalleContent';

const BookingParametragePage = () => {
  const [activeTab, setActiveTab] = useState('artistes');
  const [selectedArtisteId, setSelectedArtisteId] = useState(null);
  const [showArtisteModal, setShowArtisteModal] = useState(false);
  const [editArtisteData, setEditArtisteData] = useState(null);
  const [showProjetModal, setShowProjetModal] = useState(false);
  const [editProjetData, setEditProjetData] = useState(null);
  
  // Configuration stable pour éviter les re-renders
  const artistesConfig = React.useMemo(() => ({
    sort: { field: 'nom', direction: 'asc' }
    // Retirer refreshKey de la config pour éviter la boucle
  }), []); // Dépendances vides = stable
  
  const projetsConfig = React.useMemo(() => ({
    sort: { field: 'intitule', direction: 'asc' }
  }), []);
  
  // Récupérer la liste des artistes pour le menu
  const { items: artistes, loading: artistesLoading, refetch: refetchArtistes } = useGenericEntityList('artistes', artistesConfig);
  
  // Récupérer la liste des projets pour trouver ceux associés à l'artiste
  const { items: projets, refetch: refetchProjets } = useGenericEntityList('projets', projetsConfig);
  
  // Fonction pour trouver les projets associés à un artiste
  const getProjetsForArtiste = useCallback((artisteId) => {
    if (!artisteId || !projets) return [];
    return projets.filter(projet => 
      projet.artistesSelectionnes && 
      projet.artistesSelectionnes.includes(artisteId)
    );
  }, [projets]);

  
  // Sélectionner le premier artiste si aucun n'est sélectionné
  // Mais sans useEffect pour éviter les boucles infinies
  const effectiveSelectedArtisteId = selectedArtisteId || (artistes.length > 0 ? artistes[0].id : null);

  
  // Gestionnaire pour la sélection d'un artiste
  const handleArtisteSelect = useCallback((artisteId) => {
    setSelectedArtisteId(artisteId);
    // Ne pas changer l'URL pour rester dans le système d'onglets
  }, []);
  
  
  // Gestionnaire pour la création/modification d'un artiste
  const handleArtisteCreated = useCallback((artisteData) => {
    console.log('Artiste créé/modifié:', artisteData);
    // Utiliser setTimeout pour éviter la boucle infinie
    setTimeout(() => {
      refetchArtistes(); // Rafraîchir la liste après un court délai
    }, 100);
    setEditArtisteData(null); // Réinitialiser le mode édition
  }, [refetchArtistes]);
  
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
    // Utiliser setTimeout pour éviter la boucle infinie
    setTimeout(() => {
      refetchProjets(); // Rafraîchir la liste après un court délai
    }, 100);
    setEditProjetData(null); // Réinitialiser le mode édition
  }, [refetchProjets]);
  
  // Mémoriser les données initiales pour éviter les re-créations d'objet
  const initialProjetData = React.useMemo(() => {
    if (effectiveSelectedArtisteId) {
      return {
        artistesSelectionnes: [effectiveSelectedArtisteId]
      };
    }
    return null;
  }, [effectiveSelectedArtisteId]);

  const handleCreateProjet = useCallback(() => {
    // Utiliser les données mémorisées
    setEditProjetData(initialProjetData);
    setShowProjetModal(true);
  }, [initialProjetData]);
  
  const handleCloseProjetModal = useCallback(() => {
    setShowProjetModal(false);
    setEditProjetData(null);
  }, []);

  
  // Rendu du menu latéral selon le contexte
  const renderSidebarMenu = () => {
    const tabs = [
      { label: 'Artistes', value: 'artistes' },
      { label: 'Types d\'événement', value: 'types-evenement' },
      { label: 'Types de salle', value: 'types-salle' }
    ];
    
    const activeIndex = tabs.findIndex(tab => tab.value === activeTab);
    
    return (
      <TabNavigation
        tabs={tabs.map(tab => ({ label: tab.label, content: null }))}
        activeTab={activeIndex >= 0 ? activeIndex : 0}
        onTabChange={(index) => {
          const selectedTab = tabs[index];
          setActiveTab(selectedTab.value);
          // Ne pas changer l'URL pour rester dans le système d'onglets
        }}
        vertical={true}
      />
    );
  };

  // Rendu du menu latéral de droite pour les artistes
  const renderArtistSidebar = () => {
    return (
      <div>
        <div className="d-grid mb-3">
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleCreateArtiste}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Créer un artiste
          </button>
        </div>
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
                  effectiveSelectedArtisteId === artiste.id ? 'active' : ''
                }`}
                onClick={() => handleArtisteSelect(artiste.id)}
              >
                <div className="text-start">
                  <h6 className="mb-0 small">{artiste.nom}</h6>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMainContent = () => {
    if (effectiveSelectedArtisteId) {
      // Vue détail d'un artiste spécifique
      const artiste = artistes.find(a => a.id === effectiveSelectedArtisteId);
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
                        <strong>Code :</strong> 
                        <span className="ms-2">{artiste.code || 'Non renseigné'}</span>
                      </div>
                      <div className="mb-2">
                        <strong>Code analytique :</strong> 
                        <span className="ms-2">{artiste.codeAnalytique || 'Non renseigné'}</span>
                      </div>
                      <div className="mb-2">
                        <strong>Libellé analytique :</strong> 
                        <span className="ms-2">{artiste.libelleAnalytique || 'Non renseigné'}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="border-bottom pb-2 mb-3">Statut</h6>
                      <div className="mb-2">
                        <strong>Actif :</strong> 
                        <span className={`ms-2 badge ${artiste.actif !== false ? 'bg-success' : 'bg-secondary'}`}>
                          {artiste.actif !== false ? 'Oui' : 'Non'}
                        </span>
                      </div>
                      <div className="mb-2">
                        <strong>Au catalogue :</strong> 
                        <span className={`ms-2 badge ${artiste.auCatalogue !== false ? 'bg-success' : 'bg-secondary'}`}>
                          {artiste.auCatalogue !== false ? 'Oui' : 'Non'}
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
                      Projets associés
                    </h6>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={handleCreateProjet}
                    >
                      <i className="bi bi-plus me-1"></i>
                      Nouveau projet
                    </button>
                  </div>
                  
                  {(() => {
                    const projetsArtiste = getProjetsForArtiste(effectiveSelectedArtisteId);
                    
                    if (projetsArtiste.length === 0 && !artiste.projet?.nom) {
                      return (
                        <div className="text-center py-3">
                          <p className="text-muted mb-0">Aucun projet associé</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div>
                        {/* Afficher les projets de la nouvelle collection */}
                        {projetsArtiste.length > 0 && (
                          <div className="mb-3">
                            {projetsArtiste.map((projet, index) => (
                              <div key={projet.id} className={index > 0 ? "mt-3 pt-3 border-top" : ""}>
                                <div className="row">
                                  <div className="col-md-6">
                                    <div className="mb-2">
                                      <strong>Projet :</strong> 
                                      <span className="ms-2">{projet.intitule || 'Sans nom'}</span>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="mb-2">
                                      <strong>Type :</strong> 
                                      <span className="ms-2">{projet.typeContrat || 'Non défini'}</span>
                                    </div>
                                  </div>
                                  {projet.montantHT && (
                                    <div className="col-md-6">
                                      <div className="mb-2">
                                        <strong>Montant HT :</strong> 
                                        <span className="ms-2">{projet.montantHT}€</span>
                                      </div>
                                    </div>
                                  )}
                                  {projet.prixPlaces && (
                                    <div className="col-md-6">
                                      <div className="mb-2">
                                        <strong>Prix des places :</strong> 
                                        <span className="ms-2">{projet.prixPlaces}€</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Afficher l'ancien format si présent (pour compatibilité) */}
                        {artiste.projet?.nom && (
                          <div className={projetsArtiste.length > 0 ? "mt-3 pt-3 border-top" : ""}>
                            <div className="row">
                              <div className="col-md-6">
                                <div className="mb-2">
                                  <strong>Projet (ancien) :</strong> 
                                  <span className="ms-2">{artiste.projet.nom}</span>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="mb-2">
                                  <strong>Code :</strong> 
                                  <span className="ms-2">{artiste.projet.code || 'Non renseigné'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
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
    if (!effectiveSelectedArtisteId && artistes.length > 0) {
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
        {activeTab === 'artistes' && (
          <>
            <Col md={2}>
              {renderArtistSidebar()}
            </Col>
            <Col md={8}>
              {renderMainContent()}
            </Col>
          </>
        )}
        {activeTab === 'types-evenement' && (
          <Col md={10}>
            <div className="alert alert-warning">
              Types d'événement - Temporairement désactivé (boucle infinie)
            </div>
            {/* <TypesEvenementContent /> */}
          </Col>
        )}
        {activeTab === 'types-salle' && (
          <Col md={10}>
            <div className="alert alert-warning">
              Types de salle - Temporairement désactivé (boucle infinie)
            </div>
            {/* <TypesSalleContent /> */}
          </Col>
        )}
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