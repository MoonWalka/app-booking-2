// src/components/devis/DevisEditor.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, Modal, Button } from 'react-bootstrap';
import { useEntreprise } from '@/context/EntrepriseContext';
import { useAuth } from '@/context/AuthContext';
import { useTabs } from '@/context/TabsContext';
import { doc, getDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import devisService from '@/services/devisService';
import DevisForm from './DevisForm';
import DevisPreview from './DevisPreview';
import styles from './DevisEditor.module.css';

/**
 * Éditeur de devis avec layout split
 * Gauche: Formulaire d'édition
 * Droite: Preview PDF temps réel
 */
function DevisEditor({ dateId, structureId, devisId }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentEntreprise } = useEntreprise();
  const { currentUser } = useAuth();
  
  // Variable devis retirée car non utilisée
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const { closeTab, getActiveTab, openDevisTab } = useTabs();

  // Récupérer les paramètres depuis les props ou l'URL
  const finalDateId = dateId || searchParams.get('dateId');
  const finalStructureId = structureId || searchParams.get('structureId');
  const finalDevisId = devisId || id;
  
  console.log('🎯 DevisEditor - Paramètres reçus:');
  console.log('  - dateId (prop):', dateId);
  console.log('  - structureId (prop):', structureId);
  console.log('  - devisId (prop):', devisId);
  console.log('  - id (URL param):', id);
  console.log('  - finalDateId:', finalDateId);
  console.log('  - finalStructureId:', finalStructureId);
  console.log('  - finalDevisId:', finalDevisId);

  // État du devis
  const [devisData, setDevisData] = useState({
    // Informations générales
    numero: '',
    statut: 'brouillon',
    emetteur: currentUser?.displayName || currentUser?.email || '',
    entreprise: '',
    collaborateurId: '',
    collaborateurNom: '',
    
    // Destinataire
    structureId: finalStructureId || '',
    structureNom: '',
    contactId: '',
    contactNom: '',
    adresseAdministrative: '',
    
    // Événement
    dateId: finalDateId || '',
    artisteNom: '',
    projetNom: '',
    dateDebut: '',
    dateFin: '',
    titreEvenement: '',
    
    // Conditions financières
    lignesObjet: [
      {
        id: 1,
        objet: '',
        quantite: 1,
        unite: 'forfait',
        prixUnitaire: 0,
        montantHT: 0,
        tauxTVA: 20
      }
    ],
    
    // Règlement
    lignesReglement: [],
    dateValidite: '',
    
    // Conditions
    conditionsParticulieres: '',
    modalitesPaiement: '',
    
    // Totaux
    montantHT: 0,
    totalTVA: 0,
    montantTTC: 0,
    
    // Métadonnées
    organizationId: currentEntreprise?.id,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const [originalDevisData, setOriginalDevisData] = useState(null);

  // Charger le devis existant si ID fourni
  useEffect(() => {
    const loadDevis = async () => {
      if (!finalDevisId || finalDevisId === 'nouveau' || finalDevisId === 'new') {
        // Pour un nouveau devis, initialiser originalDevisData avec les données initiales
        setOriginalDevisData(devisData);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const loadedDevis = await devisService.getDevisById(finalDevisId);
        
        if (loadedDevis) {
          console.log('=== DEVIS CHARGÉ DEPUIS FIREBASE ===');
          console.log('ID:', loadedDevis.id);
          console.log('Numéro:', loadedDevis.numero);
          console.log('Artiste:', loadedDevis.artisteNom);
          console.log('Structure:', loadedDevis.structureNom);
          console.log('Lignes objet:', loadedDevis.lignesObjet);
          console.log('Données complètes:', loadedDevis);
          console.log('===================================');
          
          // Migration des anciens devis qui utilisent totalHT/totalTTC
          if (loadedDevis.totalHT !== undefined && loadedDevis.montantHT === undefined) {
            loadedDevis.montantHT = loadedDevis.totalHT;
          }
          if (loadedDevis.totalTTC !== undefined && loadedDevis.montantTTC === undefined) {
            loadedDevis.montantTTC = loadedDevis.totalTTC;
          }
          
          setDevisData(loadedDevis);
          setOriginalDevisData(loadedDevis);
        } else {
          setError('Devis non trouvé');
        }
        
      } catch (err) {
        console.error('Erreur lors du chargement du devis:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDevis();
  }, [finalDevisId, devisData, currentEntreprise?.id, currentUser]);

  // Charger les données du date si dateId fourni
  useEffect(() => {
    const loadDateData = async () => {
      // Ne charger les données du date que pour un nouveau devis
      if (!finalDateId || (finalDevisId && finalDevisId !== 'nouveau' && finalDevisId !== 'new')) {
        return;
      }
      
      try {
        console.log('=== Début du chargement du date pour nouveau devis ===');
        console.log('Date ID:', finalDateId);
        console.log('Structure ID depuis URL:', finalStructureId);
        
        // Charger les données du date depuis Firebase
        const dateDoc = await getDoc(doc(db, 'dates', finalDateId));
        
        if (!dateDoc.exists()) {
          console.error('❌ Date non trouvé:', finalDateId);
          setError('Date non trouvé');
          return;
        }
        
        const dateData = { id: finalDateId, ...dateDoc.data() };
        console.log('✅ Données COMPLÈTES du date récupérées:', dateData);
        console.log('🔍 Vérification des champs projet:');
        console.log('  - projetNom:', dateData.projetNom);
        console.log('  - projet:', dateData.projet);
        console.log('  - projetId:', dateData.projetId);
        console.log('🎨 Artiste du concert:', dateData.artisteNom || 'Aucun artiste');
        
        // Mettre à jour les données du devis avec les infos du concert
        const updatedDevisData = {
          dateId: finalDateId,
          artisteId: dateData.artisteId || '',
          artisteNom: dateData.artisteNom || '',
          projetNom: dateData.projetNom || '', // Récupérer le projet depuis le concert
          dateDebut: dateData.date || '', // Date de début = date du concert
          dateFin: dateData.dateFin || dateData.date || '', // Si pas de date de fin, utiliser la date de début
          titreEvenement: dateData.libelle || dateData.titre || '',
          lieuNom: dateData.lieuNom || '',
          lieuVille: dateData.lieuVille || '',
          structureId: dateData.organisateurId || finalStructureId || '',
          structureNom: dateData.organisateurNom || ''
        };
        
        console.log('📦 Données du devis à mettre à jour:', updatedDevisData);
        console.log('🎯 Projet transféré au devis:', updatedDevisData.projetNom || 'AUCUN');
        
        setDevisData(prev => {
          const newData = {
            ...prev,
            ...updatedDevisData
          };
          console.log('🔄 État du devis après mise à jour:', newData);
          return newData;
        });
        
        console.log('=== Fin du chargement du date ===');
        
      } catch (err) {
        console.error('Erreur lors du chargement du concert:', err);
      }
    };

    loadDateData();
  }, [finalDateId, finalDevisId, finalStructureId]);

  // Surveiller les changements
  useEffect(() => {
    // Ne pas marquer comme modifié lors du chargement initial
    if (!loading && originalDevisData) {
      // Comparer les données actuelles avec les données originales
      const hasChanges = JSON.stringify(devisData) !== JSON.stringify(originalDevisData);
      setHasUnsavedChanges(hasChanges);
      if (hasChanges) {
        setSavedSuccessfully(false);
      }
    }
  }, [devisData, originalDevisData, loading]);

  // Sauvegarder le devis
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      let savedDevis;
      if (!finalDevisId || finalDevisId === 'nouveau' || finalDevisId === 'new') {
        // Créer un nouveau devis
        savedDevis = await devisService.createDevis(devisData);
        console.log('Nouveau devis créé:', savedDevis);
        
        // Mettre à jour l'état local avec l'ID et le numéro
        const updatedDevisData = {
          ...devisData,
          id: savedDevis.id,
          numero: savedDevis.numero
        };
        setDevisData(updatedDevisData);
        setOriginalDevisData(updatedDevisData);
        
        // Mettre à jour l'URL sans recharger la page
        window.history.replaceState(null, '', `/devis/${savedDevis.id}`);
        
        // Ouvrir un nouvel onglet avec le devis sauvegardé et fermer l'ancien
        const activeTab = getActiveTab && getActiveTab();
        if (openDevisTab && activeTab && activeTab.id.startsWith('nouveau-devis')) {
          openDevisTab(savedDevis.id, `${savedDevis.numero} - ${savedDevis.structureNom || ''}`);
          // Fermer l'ancien onglet "nouveau devis" après un court délai
          setTimeout(() => {
            if (closeTab) closeTab(activeTab.id);
          }, 500);
        }
      } else {
        // Mettre à jour le devis existant
        savedDevis = await devisService.updateDevis(finalDevisId, devisData);
        console.log('Devis mis à jour:', savedDevis);
        setOriginalDevisData(devisData);
      }
      
      setHasUnsavedChanges(false);
      setSavedSuccessfully(true);
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => setSavedSuccessfully(false), 3000);
      
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Changer le statut
  const handleStatusChange = async (newStatus) => {
    try {
      setDevisData(prev => ({
        ...prev,
        statut: newStatus,
        updatedAt: new Date()
      }));
      
      await handleSave();
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
    }
  };

  // Fermer l'onglet ou naviguer
  const handleClose = () => {
    const activeTab = getActiveTab && getActiveTab();
    if (closeTab && activeTab) {
      // Nous sommes dans un onglet, le fermer
      closeTab(activeTab.id);
    } else {
      // Pas dans un onglet, naviguer
      navigate('/devis');
    }
  };

  // Calculer les totaux
  const calculateTotals = useCallback((lignes) => {
    const montantHT = lignes.reduce((sum, ligne) => sum + (ligne.montantHT || 0), 0);
    const totalTVA = lignes.reduce((sum, ligne) => {
      const montantTVA = (ligne.montantHT || 0) * (ligne.tauxTVA || 0) / 100;
      return sum + montantTVA;
    }, 0);
    const montantTTC = montantHT + totalTVA;

    setDevisData(prev => ({
      ...prev,
      montantHT,
      totalTVA,
      montantTTC
    }));
  }, []);

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <h4>Erreur</h4>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <div className={styles.devisEditor}>
      {/* Barre d'état */}
      <div className={styles.statusBar}>
        <Container fluid>
          <Row className="align-items-center">
            <Col md={6}>
              <h3 className="mb-0">
                {!finalDevisId || finalDevisId === 'nouveau' || finalDevisId === 'new' ? 'Nouveau devis' : `Devis ${devisData.numero}`}
              </h3>
            </Col>
            <Col md={6} className="text-end">
              <div className="d-flex justify-content-end align-items-center gap-3">
                {/* Dropdown statut */}
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={devisData.statut}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="brouillon">Brouillon</option>
                  <option value="envoye">Envoyé</option>
                  <option value="accepte">Accepté</option>
                  <option value="termine">Terminé</option>
                  <option value="refuse">Refusé</option>
                  <option value="annule">Annulé</option>
                </select>
                
                {/* Boutons d'action */}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    if (hasUnsavedChanges) {
                      setShowCloseConfirmModal(true);
                    } else {
                      handleClose();
                    }
                  }}
                >
                  Fermer
                </button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Layout principal */}
      <Container fluid className={styles.mainLayout}>
        <Row className="h-100">
          {/* Éditeur (gauche) */}
          <Col lg={6} className={styles.editorPanel}>
            <Card className="h-100">
              <Card.Body>
                <DevisForm
                  devisData={devisData}
                  setDevisData={setDevisData}
                  onCalculateTotals={calculateTotals}
                  readonly={devisData.statut !== 'brouillon'}
                />
              </Card.Body>
            </Card>
          </Col>

          {/* Preview PDF (droite) */}
          <Col lg={6} className={styles.previewPanel}>
            <Card className="h-100">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Aperçu PDF</h5>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-primary">
                      <i className="bi bi-printer"></i> Imprimer
                    </button>
                    <button className="btn btn-outline-primary">
                      <i className="bi bi-download"></i> Télécharger
                    </button>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <DevisPreview devisData={devisData} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      {/* Modal de confirmation de fermeture */}
      <Modal show={showCloseConfirmModal} onHide={() => setShowCloseConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifications non sauvegardées</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Vous avez des modifications non sauvegardées. Voulez-vous vraiment fermer sans sauvegarder ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCloseConfirmModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={async () => {
              await handleSave();
              setShowCloseConfirmModal(false);
              handleClose();
            }}
          >
            Sauvegarder et fermer
          </Button>
          <Button 
            variant="danger" 
            onClick={() => {
              setShowCloseConfirmModal(false);
              handleClose();
            }}
          >
            Fermer sans sauvegarder
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Message de succès */}
      {savedSuccessfully && (
        <div 
          className="position-fixed bottom-0 start-50 translate-middle-x mb-3" 
          style={{ zIndex: 1050 }}
        >
          <Alert variant="success" className="mb-0">
            <i className="bi bi-check-circle me-2"></i>
            Devis sauvegardé avec succès
          </Alert>
        </div>
      )}
    </div>
  );
}

export default DevisEditor;