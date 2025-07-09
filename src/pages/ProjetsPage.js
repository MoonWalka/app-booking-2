import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useTabs } from '@/context/TabsContext';
import { useEntreprise } from '@/context/EntrepriseContext';
import ProjetCreationModal from '../components/projets/modal/ProjetCreationModal';
import '@styles/index.css';

const ProjetsPage = () => {
  console.log('📂 ProjetsPage - Composant chargé');
  const [showProjetModal, setShowProjetModal] = useState(false);
  const [editProjetData, setEditProjetData] = useState(null);
  const [projets, setProjets] = useState([]);
  const [artistes, setArtistes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { openDateCreationTab } = useTabs();
  const { currentEntreprise } = useEntreprise();
  
  // Récupérer les projets et artistes avec un simple useEffect
  useEffect(() => {
    if (!currentEntreprise?.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // NOTE: Les orderBy sont temporairement désactivés car ils nécessitent des index Firestore
    // Pour créer les index nécessaires :
    // 1. Collection 'projets' : entrepriseId (ASC) + nom (ASC)
    // 2. Collection 'artistes' : entrepriseId (ASC) + nom (ASC)
    // Le tri est fait côté client en attendant
    
    // Listener pour les projets
    const projetsQuery = query(
      collection(db, 'projets'),
      where('entrepriseId', '==', currentEntreprise.id)
      // orderBy('nom', 'asc') // Temporairement désactivé - nécessite un index
    );
    
    const unsubscribeProjets = onSnapshot(projetsQuery, 
      (snapshot) => {
        const projetsData = [];
        snapshot.forEach((doc) => {
          projetsData.push({ id: doc.id, ...doc.data() });
        });
        // Tri côté client temporairement
        projetsData.sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
        setProjets(projetsData);
        setLoading(false);
      },
      (err) => {
        console.error('Erreur lors de la récupération des projets:', err);
        setError(err);
        setLoading(false);
      }
    );
    
    // Listener pour les artistes
    const artistesQuery = query(
      collection(db, 'artistes'),
      where('entrepriseId', '==', currentEntreprise.id)
      // orderBy('nom', 'asc') // Temporairement désactivé - nécessite un index
    );
    
    const unsubscribeArtistes = onSnapshot(artistesQuery, 
      (snapshot) => {
        const artistesData = [];
        snapshot.forEach((doc) => {
          artistesData.push({ id: doc.id, ...doc.data() });
        });
        // Tri côté client temporairement
        artistesData.sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
        setArtistes(artistesData);
      }
    );
    
    // Cleanup
    return () => {
      unsubscribeProjets();
      unsubscribeArtistes();
    };
  }, [currentEntreprise?.id]);
  
  // Fonction pour obtenir les noms des artistes à partir de leurs IDs
  const getArtistesNames = useCallback((artisteIds) => {
    if (!artisteIds || !Array.isArray(artisteIds) || artisteIds.length === 0) {
      return null;
    }
    
    return artisteIds.map(id => {
      const artiste = artistes.find(a => a.id === id);
      return artiste ? artiste.nom : id;
    }).filter(Boolean).join(', ');
  }, [artistes]);

  const handleCreateDate = useCallback((projet) => {
    // Ouvrir l'onglet de création de date avec les données du projet pré-remplies
    const prefilledData = {
      artisteId: projet.artistesSelectionnes?.[0] || '',
      artisteNom: projet.intitule || '',
      projetNom: projet.intitule || ''
    };
    
    openDateCreationTab(prefilledData);
  }, [openDateCreationTab]);

  const handleEdit = useCallback((projet) => {
    // Ouvrir la modal en mode édition
    setEditProjetData(projet);
    setShowProjetModal(true);
  }, []);

  const handleDelete = useCallback(async (projetId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await deleteDoc(doc(db, 'projets', projetId));
        console.log('Projet supprimé avec succès');
        // La liste se rafraîchira automatiquement grâce au listener Firebase
      } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
        alert('Erreur lors de la suppression du projet');
      }
    }
  }, []);

  const handleCreateProjet = useCallback(() => {
    // Ouvrir la modal en mode création
    setEditProjetData(null);
    setShowProjetModal(true);
  }, []);

  const handleProjetCreated = useCallback(() => {
    // Le listener Firebase mettra automatiquement à jour la liste
    setEditProjetData(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowProjetModal(false);
    setEditProjetData(null);
  }, []);

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2">Chargement des projets...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="p-4">
        <div className="alert alert-danger">
          <h4>Erreur</h4>
          <p>Impossible de charger les projets : {error.message}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-folder me-2"></i>
          Projets
        </h2>
        <Button 
          variant="primary"
          onClick={handleCreateProjet}
        >
          <i className="bi bi-plus me-1"></i>
          Nouveau projet
        </Button>
      </div>
      
      <Row>
        <Col>
          {projets.length === 0 ? (
            <div className="text-center p-5">
              <i className="bi bi-folder" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
              <h4 className="mt-3">Aucun projet</h4>
              <p className="text-muted">Commencez par créer votre premier projet.</p>
              <Button 
                variant="primary"
                onClick={handleCreateProjet}
              >
                <i className="bi bi-plus me-1"></i>
                Créer un projet
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded shadow-sm">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Projet</th>
                    <th>Artiste(s)</th>
                    <th>Type de contrat</th>
                    <th>Prix/Montant</th>
                    <th style={{ width: '200px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projets.map((projet) => (
                    <tr key={projet.id}>
                      <td>
                        <div>
                          <strong>{projet.intitule || projet.nom || 'Sans nom'}</strong>
                          {projet.description && (
                            <div className="text-muted small">{projet.description}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        {getArtistesNames(projet.artistesSelectionnes) || (
                          projet.artiste ? (
                            <span>{projet.artiste.prenom} {projet.artiste.nom}</span>
                          ) : (
                            <span className="text-muted">Non assigné</span>
                          )
                        )}
                      </td>
                      <td>
                        {projet.typeContrat || projet.genre || <span className="text-muted">Non défini</span>}
                      </td>
                      <td>
                        {projet.prixPlaces || projet.montantHT ? (
                          <span className="fw-bold">{projet.prixPlaces || projet.montantHT}€</span>
                        ) : projet.prixVente ? (
                          <span className="fw-bold">{projet.prixVente}€</span>
                        ) : (
                          <span className="text-muted">Non défini</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleCreateDate(projet)}
                            title="Créer une date"
                          >
                            <i className="bi bi-calendar-plus"></i>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEdit(projet)}
                            title="Modifier"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(projet.id)}
                            title="Supprimer"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              {projets.length > 0 && (
                <div className="p-3 border-top bg-light">
                  <small className="text-muted">
                    {projets.length} projet{projets.length > 1 ? 's' : ''} trouvé{projets.length > 1 ? 's' : ''}
                  </small>
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>
      
      {/* Modal de création/édition de projet */}
      {showProjetModal && (
        <ProjetCreationModal
          show={showProjetModal}
          onHide={handleCloseModal}
          onCreated={handleProjetCreated}
          editProjet={editProjetData}
        />
      )}
    </Container>
  );
};

export default ProjetsPage; 