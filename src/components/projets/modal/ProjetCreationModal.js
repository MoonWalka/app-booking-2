// src/components/projets/modal/ProjetCreationModal.js
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Nav, Tab } from 'react-bootstrap';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';
import useGenericEntityList from '@/hooks/generics/lists/useGenericEntityList';

/**
 * Modal de création/édition d'un projet
 * Avec les paramètres demandés pour les projets
 */
function ProjetCreationModal({ show, onHide, onCreated, editProjet = null }) {
  const { currentEntreprise } = useEntreprise();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('informations');
  
  // Configuration stable pour éviter les re-renders
  const artistesConfig = useMemo(() => ({
    sort: { field: 'nom', direction: 'asc' }
  }), []);
  
  // Récupérer la liste des artistes
  const { items: artistes, loading: artistesLoading } = useGenericEntityList('artistes', artistesConfig);
  
  const [formData, setFormData] = useState({
    intitule: '',
    codeAdmin: '',
    codeAnalytique: '',
    libelleAnalytique: '',
    numeroObjet: '',
    typeContrat: '',
    montantHT: '',
    devise: 'EUR',
    prixPlaces: '',
    commentaires: '',
    artistesSelectionnes: [] // Array des IDs des artistes sélectionnés
  });

  // Charger les données du projet en mode édition
  useEffect(() => {
    // Ne réinitialiser que quand le modal s'ouvre
    if (!show) return;
    
    if (editProjet) {
      setFormData({
        intitule: editProjet.intitule || '',
        codeAdmin: editProjet.codeAdmin || '',
        codeAnalytique: editProjet.codeAnalytique || '',
        libelleAnalytique: editProjet.libelleAnalytique || '',
        numeroObjet: editProjet.numeroObjet || '',
        typeContrat: editProjet.typeContrat || '',
        montantHT: editProjet.montantHT || '',
        devise: editProjet.devise || 'EUR',
        prixPlaces: editProjet.prixPlaces || '',
        commentaires: editProjet.commentaires || '',
        artistesSelectionnes: editProjet.artistesSelectionnes || []
      });
    } else {
      // Réinitialiser en mode création
      // Si on a des artistes pré-sélectionnés (passés via editProjet même en mode création),
      // les conserver
      setFormData({
        intitule: editProjet?.intitule || '',
        codeAdmin: editProjet?.codeAdmin || '',
        codeAnalytique: editProjet?.codeAnalytique || '',
        libelleAnalytique: editProjet?.libelleAnalytique || '',
        numeroObjet: editProjet?.numeroObjet || '',
        typeContrat: editProjet?.typeContrat || '',
        montantHT: editProjet?.montantHT || '',
        devise: editProjet?.devise || 'EUR',
        prixPlaces: editProjet?.prixPlaces || '',
        commentaires: editProjet?.commentaires || '',
        artistesSelectionnes: editProjet?.artistesSelectionnes || []
      });
    }
  }, [editProjet, show]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gestionnaire pour la sélection/désélection d'artistes
  const handleArtisteToggle = (artisteId) => {
    setFormData(prev => {
      const isSelected = prev.artistesSelectionnes.includes(artisteId);
      const newSelection = isSelected
        ? prev.artistesSelectionnes.filter(id => id !== artisteId)
        : [...prev.artistesSelectionnes, artisteId];
      
      return {
        ...prev,
        artistesSelectionnes: newSelection
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.intitule.trim()) {
      alert('L\'intitulé est obligatoire');
      return;
    }

    if (!currentEntreprise?.id) {
      alert('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);

    try {
      // Nettoyer les données pour éviter les valeurs undefined
      const cleanedFormData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const projetData = {
        ...cleanedFormData,
        entrepriseId: currentEntreprise.id,
        updatedAt: serverTimestamp(),
        // Convertir les montants en nombres si renseignés
        montantHT: formData.montantHT ? parseFloat(formData.montantHT) : null,
        prixPlaces: formData.prixPlaces ? parseFloat(formData.prixPlaces) : null
      };

      if (editProjet && editProjet.id) {
        // Mode édition - mettre à jour le projet existant (vérifier que l'ID existe)
        const projetRef = doc(db, 'projets', editProjet.id);
        await updateDoc(projetRef, projetData);
        
        console.log('Projet mis à jour avec ID:', editProjet.id);
        
        // Callback pour notifier la modification
        if (onCreated) {
          onCreated({
            id: editProjet.id,
            ...projetData
          });
        }
      } else {
        // Mode création - créer un nouveau projet
        projetData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, 'projets'), projetData);
        
        console.log('Projet créé avec ID:', docRef.id);
        
        // Callback pour notifier la création
        if (onCreated) {
          onCreated({
            id: docRef.id,
            ...projetData
          });
        }
      }

      // Fermer la modal
      onHide();

    } catch (error) {
      console.error(`Erreur lors de ${editProjet ? 'la modification' : 'la création'} du projet:`, error);
      alert(`Erreur lors de ${editProjet ? 'la modification' : 'la création'} du projet`);
    } finally {
      setLoading(false);
    }
  };

  // Rendu de l'onglet Informations
  const renderInformationsTab = () => (
    <div className="row">
      <div className="col-12 mb-3">
        <Form.Label>Intitulé *</Form.Label>
        <Form.Control
          type="text"
          placeholder="Intitulé du projet"
          value={formData.intitule}
          onChange={(e) => handleInputChange('intitule', e.target.value)}
          required
        />
      </div>
      
      <div className="col-md-6 mb-3">
        <Form.Label>Code admin</Form.Label>
        <Form.Control
          type="text"
          placeholder="Code administratif"
          value={formData.codeAdmin}
          onChange={(e) => handleInputChange('codeAdmin', e.target.value)}
        />
      </div>
      
      <div className="col-md-6 mb-3">
        <Form.Label>Code analytique</Form.Label>
        <Form.Control
          type="text"
          placeholder="Code analytique"
          value={formData.codeAnalytique}
          onChange={(e) => handleInputChange('codeAnalytique', e.target.value)}
        />
      </div>
      
      <div className="col-12 mb-3">
        <Form.Label>Libellé analytique</Form.Label>
        <Form.Control
          type="text"
          placeholder="Libellé analytique"
          value={formData.libelleAnalytique}
          onChange={(e) => handleInputChange('libelleAnalytique', e.target.value)}
        />
      </div>
      
      <div className="col-md-6 mb-3">
        <Form.Label>N° d'objet</Form.Label>
        <Form.Control
          type="text"
          placeholder="Numéro d'objet"
          value={formData.numeroObjet}
          onChange={(e) => handleInputChange('numeroObjet', e.target.value)}
        />
      </div>
      
      <div className="col-md-6 mb-3">
        <Form.Label>Type de contrat</Form.Label>
        <Form.Select
          value={formData.typeContrat}
          onChange={(e) => handleInputChange('typeContrat', e.target.value)}
        >
          <option value="">Sélectionner un type...</option>
          <option value="production">Production</option>
          <option value="coproduction">Coproduction</option>
          <option value="accueil">Accueil</option>
          <option value="residence">Résidence</option>
          <option value="autre">Autre</option>
        </Form.Select>
      </div>
      
      <div className="col-md-4 mb-3">
        <Form.Label>Montant HT</Form.Label>
        <Form.Control
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.montantHT}
          onChange={(e) => handleInputChange('montantHT', e.target.value)}
        />
      </div>
      
      <div className="col-md-4 mb-3">
        <Form.Label>Devise</Form.Label>
        <Form.Select
          value={formData.devise}
          onChange={(e) => handleInputChange('devise', e.target.value)}
        >
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
          <option value="GBP">GBP (£)</option>
          <option value="CHF">CHF</option>
        </Form.Select>
      </div>
      
      <div className="col-md-4 mb-3">
        <Form.Label>Prix des places</Form.Label>
        <Form.Control
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.prixPlaces}
          onChange={(e) => handleInputChange('prixPlaces', e.target.value)}
        />
      </div>
    </div>
  );

  // Rendu de l'onglet Artistes
  const renderArtistesTab = () => (
    <div>
      <div className="mb-3">
        <h6>Sélectionner des artistes ({formData.artistesSelectionnes.length} sélectionné{formData.artistesSelectionnes.length !== 1 ? 's' : ''})</h6>
        <small className="text-muted">Cliquez sur un artiste pour l'ajouter ou le retirer du projet</small>
      </div>
      
      {artistesLoading ? (
        <div className="text-center p-3">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="small text-muted mt-2">Chargement des artistes...</p>
        </div>
      ) : artistes.length === 0 ? (
        <div className="text-center p-3">
          <i className="bi bi-music-note-beamed" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
          <p className="small text-muted mt-2">Aucun artiste disponible</p>
        </div>
      ) : (
        <div className="list-group" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {artistes.map(artiste => {
            const isSelected = formData.artistesSelectionnes.includes(artiste.id);
            return (
              <div 
                key={artiste.id} 
                className={`list-group-item list-group-item-action ${isSelected ? 'active' : ''}`}
                onClick={() => handleArtisteToggle(artiste.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex w-100 justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="form-check me-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Géré par le onClick du parent
                        style={{ pointerEvents: 'none' }}
                      />
                    </div>
                    <div>
                      <h6 className={`mb-1 ${isSelected ? 'text-white' : ''}`}>
                        {artiste.prenom} {artiste.nom}
                      </h6>
                      <small className={isSelected ? 'text-white-50' : 'text-muted'}>
                        {artiste.email || 'Pas d\'email'}
                      </small>
                    </div>
                  </div>
                  <span className={`badge ${
                    isSelected 
                      ? (artiste.status === 'active' ? 'bg-light text-dark' : 'bg-secondary') 
                      : (artiste.status === 'active' ? 'bg-success' : 'bg-secondary')
                  }`}>
                    {artiste.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Résumé des artistes sélectionnés */}
      {formData.artistesSelectionnes.length > 0 && (
        <div className="mt-3 p-2 bg-light rounded">
          <small className="text-muted">
            <strong>Artistes sélectionnés :</strong> {
              formData.artistesSelectionnes.map(id => {
                const artiste = artistes.find(a => a.id === id);
                return artiste ? `${artiste.prenom} ${artiste.nom}` : '';
              }).filter(Boolean).join(', ')
            }
          </small>
        </div>
      )}
    </div>
  );

  // Rendu de l'onglet Commentaires
  const renderCommentairesTab = () => (
    <div>
      <div className="mb-3">
        <Form.Label>Commentaires</Form.Label>
        <Form.Control
          as="textarea"
          rows={8}
          placeholder="Ajoutez vos commentaires sur le projet..."
          value={formData.commentaires}
          onChange={(e) => handleInputChange('commentaires', e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-folder-plus me-2"></i>
          {editProjet ? 'Modifier le Projet' : 'Nouveau Projet'}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Système d'onglets */}
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="informations">
                  <i className="bi bi-info-circle me-1"></i>
                  Informations
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="artistes">
                  <i className="bi bi-music-note-beamed me-1"></i>
                  Artistes
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="commentaires">
                  <i className="bi bi-chat-text me-1"></i>
                  Commentaires
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="informations">
                {renderInformationsTab()}
              </Tab.Pane>
              <Tab.Pane eventKey="artistes">
                {renderArtistesTab()}
              </Tab.Pane>
              <Tab.Pane eventKey="commentaires">
                {renderCommentairesTab()}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Annuler
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                {editProjet ? 'Modification...' : 'Création...'}
              </>
            ) : (
              <>
                <i className={`bi ${editProjet ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>
                {editProjet ? 'Modifier le projet' : 'Créer le projet'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ProjetCreationModal;