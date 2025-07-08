import React, { useState, useEffect, useCallback } from 'react';
import { Button, Form, Card, Row, Col } from 'react-bootstrap';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';
import { useTabs } from '@/context/TabsContext';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import styles from './DateDetailsPage.module.css';

/**
 * Page de détails et d'édition d'une date
 */
function DateDetailsPage({ params = {} }) {
  const { currentEntreprise } = useEntreprise();
  const { currentUser } = useAuth();
  const { getActiveTab, closeTab, openTab } = useTabs();
  
  const dateId = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dateData, setDateData] = useState(null);
  const [festivals, setFestivals] = useState([]);
  const [collaborateurs, setCollaborateurs] = useState([]);
  const [contactId, setContactId] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    artisteNom: '',
    projetNom: '',
    structureNom: '',
    lieuNom: '',
    lieuVille: '',
    heureDebut: '',
    heureFin: '',
    festivalId: '',
    typeContrat: 'Cession',
    collaborateurId: '',
    montantPropose: '',
    devise: 'EUR',
    priseOption: '',
    frais: '',
    dossierSuivi: '',
    notes: ''
  });

  // Charger les données financières depuis les documents liés
  const loadFinancialData = useCallback(async (dateId) => {
    if (!dateId || !currentEntreprise?.id) return null;
    
    try {
      // 1. Essayer de récupérer le contrat (relation 1:1 avec dateId)
      const contratDoc = await getDoc(doc(db, 'contrats', dateId));
      if (contratDoc.exists()) {
        const contratData = contratDoc.data();
        console.log('[DateDetailsPage] Contrat trouvé:', contratData);
        return {
          montant: contratData.montantHT || contratData.negociation?.montantNet,
          devise: contratData.devise || contratData.negociation?.devise || 'EUR',
          frais: contratData.negociation?.frais || '',
          typeContrat: contratData.negociation?.contratType || 'cession'
        };
      }

      // 2. Si pas de contrat, chercher un pré-contrat validé
      const preContratsQuery = query(
        collection(db, 'preContrats'),
        where('dateId', '==', dateId),
        where('confirmationValidee', '==', true)
      );
      const preContratsSnapshot = await getDocs(preContratsQuery);
      
      if (!preContratsSnapshot.empty) {
        const preContrat = preContratsSnapshot.docs[0].data();
        console.log('[DateDetailsPage] Pré-contrat validé trouvé:', preContrat);
        if (preContrat.publicFormData) {
          return {
            montant: preContrat.publicFormData.montant,
            frais: preContrat.publicFormData.frais || '',
            devise: 'EUR'
          };
        }
      }

      // 3. Si pas de pré-contrat, chercher une facture
      const facturesQuery = query(
        collection(db, 'organizations', currentEntreprise.id, 'factures'),
        where('dateId', '==', dateId),
        orderBy('dateFacture', 'desc')
      );
      const facturesSnapshot = await getDocs(facturesQuery);
      
      if (!facturesSnapshot.empty) {
        const facture = facturesSnapshot.docs[0].data();
        console.log('[DateDetailsPage] Facture trouvée:', facture);
        return {
          montant: facture.montantHT,
          devise: 'EUR'
        };
      }

      // 4. Si pas de facture, chercher un devis accepté
      const devisQuery = query(
        collection(db, 'devis'),
        where('dateId', '==', dateId),
        where('statut', '==', 'accepté')
      );
      const devisSnapshot = await getDocs(devisQuery);
      
      if (!devisSnapshot.empty) {
        const devis = devisSnapshot.docs[0].data();
        console.log('[DateDetailsPage] Devis accepté trouvé:', devis);
        return {
          montant: devis.montantHT,
          devise: 'EUR'
        };
      }

      console.log('[DateDetailsPage] Aucune donnée financière trouvée dans les documents liés');
      return null;
    } catch (error) {
      console.error('[DateDetailsPage] Erreur lors du chargement des données financières:', error);
      return null;
    }
  }, [currentEntreprise?.id]);

  // Charger les données de la date
  const loadDateData = useCallback(async () => {
    if (!dateId) return;
    
    try {
      setLoading(true);
      const docRef = doc(db, 'dates', dateId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDateData({ id: docSnap.id, ...data });
        
        // Log pour debug des champs disponibles
        console.log('[DateDetailsPage] Données de la date chargées:', {
          montant: data.montant,
          montantPropose: data.montantPropose,
          prix: data.prix,
          cachet: data.cachet,
          priseOption: data.priseOption,
          dateOption: data.dateOption,
          statut: data.statut,
          typeContrat: data.typeContrat
        });
        
        // Récupérer l'ID du contact propriétaire (structureId ou organisateurId)
        const ownerId = data.structureId || data.organisateurId;
        setContactId(ownerId);
        
        // Charger les données financières depuis les documents liés
        const financialData = await loadFinancialData(docSnap.id);
        
        // Initialiser le formulaire avec les données existantes
        setFormData({
          date: data.date || '',
          artisteNom: data.artisteNom || '',
          projetNom: data.projetNom || '',
          structureNom: data.structureNom || data.organisateurNom || '',
          lieuNom: data.lieuNom || '',
          lieuVille: data.lieuVille || '',
          heureDebut: data.heureDebut || '',
          heureFin: data.heureFin || '',
          festivalId: data.festivalId || '',
          typeContrat: financialData?.typeContrat || data.typeContrat || 'Cession',
          collaborateurId: data.collaborateurId || '',
          // Mapping intelligent des champs financiers - Priorité aux documents liés
          montantPropose: financialData?.montant || data.montantPropose || data.montant || data.prix || data.cachet || '',
          devise: financialData?.devise || data.devise || 'EUR',
          priseOption: data.priseOption || data.dateOption || '',
          frais: financialData?.frais || data.frais || '',
          dossierSuivi: data.dossierSuivi || '',
          notes: data.notes || ''
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la date:', error);
    } finally {
      setLoading(false);
    }
  }, [dateId, loadFinancialData]);

  // Charger les festivals
  const loadFestivals = useCallback(async () => {
    if (!currentEntreprise?.id || !contactId) return;
    
    try {
      // Charger uniquement les festivals dont le contact est propriétaire
      const q = query(
        collection(db, 'festivals'),
        where('entrepriseId', '==', currentEntreprise.id),
        where('contactId', '==', contactId)
      );
      const querySnapshot = await getDocs(q);
      const festivalsData = [];
      
      querySnapshot.forEach((doc) => {
        festivalsData.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`[DateDetailsPage] ${festivalsData.length} festivals trouvés pour le contact ${contactId}`);
      setFestivals(festivalsData);
    } catch (error) {
      console.error('Erreur lors du chargement des festivals:', error);
    }
  }, [currentEntreprise?.id, contactId]);

  // Charger les collaborateurs
  const loadCollaborateurs = useCallback(async () => {
    if (!currentEntreprise?.id) return;
    
    try {
      const q = query(
        collection(db, 'collaborateurs'),
        where('entrepriseId', '==', currentEntreprise.id)
      );
      const querySnapshot = await getDocs(q);
      const collaborateursData = [];
      
      querySnapshot.forEach((doc) => {
        collaborateursData.push({ id: doc.id, ...doc.data() });
      });
      
      setCollaborateurs(collaborateursData);
    } catch (error) {
      console.error('Erreur lors du chargement des collaborateurs:', error);
    }
  }, [currentEntreprise?.id]);

  useEffect(() => {
    loadDateData();
  }, [loadDateData]);

  useEffect(() => {
    if (contactId) {
      loadFestivals();
    }
  }, [contactId, loadFestivals]);

  useEffect(() => {
    loadCollaborateurs();
  }, [loadCollaborateurs]);

  // Formater la date pour l'affichage
  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE d MMMM yyyy', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  // Gérer la duplication
  const handleDuplicate = () => {
    // TODO: Implémenter la duplication
    console.log('Duplication de la date');
  };

  // Gérer la suppression
  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette date ?')) {
      // TODO: Implémenter la suppression
      console.log('Suppression de la date');
    }
  };

  // Gérer la sauvegarde
  const handleSave = async (closeAfter = false) => {
    if (!dateId) return;
    
    setSaving(true);
    try {
      const docRef = doc(db, 'dates', dateId);
      
      // Préparer les données avec mapping intelligent
      const dataToSave = {
        ...formData,
        // Sauvegarder aussi dans les champs standards pour compatibilité
        montant: formData.montantPropose || formData.montant,
        dateOption: formData.priseOption || formData.dateOption,
        // Garder aussi les anciens noms pour rétrocompatibilité
        montantPropose: formData.montantPropose,
        priseOption: formData.priseOption,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser?.email || 'Utilisateur inconnu'
      };
      
      await updateDoc(docRef, dataToSave);
      
      alert('Date mise à jour avec succès !');
      
      if (closeAfter) {
        const currentTab = getActiveTab();
        if (currentTab) {
          closeTab(currentTab.id);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la date');
    } finally {
      setSaving(false);
    }
  };

  // Gérer l'ouverture des documents
  const handleOpenDocument = (type) => {
    switch(type) {
      case 'budget':
        // TODO: Ouvrir le budget
        console.log('Ouvrir le budget');
        break;
      case 'devis':
        openTab({
          id: `devis-${dateId}`,
          title: `Devis - ${formData.artisteNom}`,
          type: 'devis',
          params: { dateId }
        });
        break;
      case 'precontrat':
        openTab({
          id: `precontrat-${dateId}`,
          title: `Pré-contrat - ${formData.artisteNom}`,
          type: 'precontrat',
          params: { dateId }
        });
        break;
      case 'confirmation':
        openTab({
          id: `confirmation-${dateId}`,
          title: `Confirmation - ${formData.artisteNom}`,
          type: 'confirmation',
          params: { dateId }
        });
        break;
      case 'contrat':
        openTab({
          id: `contrat-${dateId}`,
          title: `Contrat - ${formData.artisteNom}`,
          type: 'contrat',
          params: { dateId }
        });
        break;
      case 'factures':
        openTab({
          id: `factures-${dateId}`,
          title: `Factures - ${formData.artisteNom}`,
          type: 'factures',
          params: { dateId }
        });
        break;
      case 'equipe':
        // TODO: Ouvrir l'équipe
        console.log('Ouvrir l\'équipe');
        break;
      case 'feuille-route':
        // TODO: Ouvrir la feuille de route
        console.log('Ouvrir la feuille de route');
        break;
      case 'promo':
        // TODO: Ouvrir la promo
        console.log('Ouvrir la promo');
        break;
      case 'document':
        // TODO: Ajouter un document personnalisé
        console.log('Ajouter un document personnalisé');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!dateData) {
    return (
      <div className={styles.container}>
        <div className="alert alert-danger">
          Date introuvable
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Row>
        {/* Partie gauche : aperçu synthétique */}
        <Col lg={4} className={styles.leftPanel}>
          {/* Bandeau haut */}
          <div className={styles.artistBanner}>
            <h2 className={styles.artistName}>
              {formData.artisteNom} {formData.projetNom && `- ${formData.projetNom}`}
            </h2>
            <p className={styles.structureName}>{formData.structureNom}</p>
          </div>

          {/* Encart date */}
          <Card className={styles.dateCard}>
            <Card.Body>
              <h3 className={styles.dateTitle}>{formatDateDisplay(formData.date)}</h3>
              <p className={styles.dateInfo}>
                {formData.lieuNom || 'Lieu non défini'} / {formData.structureNom}
                {formData.lieuVille && ` – ${formData.lieuVille}`}
              </p>
              <p className={styles.dateType}>Concert (1)</p>
              {(formData.heureDebut || formData.heureFin) && (
                <p className={styles.dateTime}>
                  {formData.heureDebut || '00:00'} – {formData.heureFin || '00:00'}
                </p>
              )}
            </Card.Body>
          </Card>

          {/* Carte intérêt/négociation */}
          <Card className={styles.interestCard}>
            <Card.Body>
              <div className={styles.cardHeader}>
                <h4>Intérêt</h4>
                <div className={styles.cardActions}>
                  <Button variant="link" size="sm" title="Éditer">
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button variant="link" size="sm" onClick={handleDuplicate} title="Dupliquer">
                    <i className="bi bi-plus-circle"></i>
                  </Button>
                  <Button variant="link" size="sm" onClick={handleDelete} title="Supprimer">
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>
              <div className={styles.interestContent}>
                {/* TODO: Ajouter le composant visuel d'intérêt */}
                <p className="text-muted">État de négociation</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Partie droite : formulaire */}
        <Col lg={8} className={styles.rightPanel}>
          {/* Bandeau supérieur avec boutons d'action */}
          <div className={styles.actionBar}>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => handleOpenDocument('budget')}
              title="Budget"
            >
              <i className="bi bi-calculator"></i>
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => handleOpenDocument('devis')}
              title="Devis accepté"
            >
              <i className="bi bi-file-check"></i>
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => handleOpenDocument('precontrat')}
              title="Pré-contrat"
            >
              <i className="bi bi-file-earmark-text"></i>
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => handleOpenDocument('confirmation')}
              title="Confirmation"
            >
              <i className="bi bi-check-circle"></i>
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => handleOpenDocument('contrat')}
              title="Contrat"
            >
              <i className="bi bi-file-text"></i>
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => handleOpenDocument('factures')}
              title="Factures"
            >
              <i className="bi bi-receipt"></i>
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => handleOpenDocument('equipe')}
              title="Équipe"
            >
              <i className="bi bi-people"></i>
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => handleOpenDocument('feuille-route')}
              title="Feuille de route"
            >
              <i className="bi bi-map"></i>
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => handleOpenDocument('promo')}
              title="Promo"
            >
              <i className="bi bi-megaphone"></i>
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => handleOpenDocument('document')}
              title="Ajouter un document personnalisé"
            >
              <i className="bi bi-plus"></i>
            </Button>
          </div>

          {/* Formulaire */}
          <Form className={styles.detailsForm}>
            {/* Section Organisateur */}
            <Card className={styles.formSection}>
              <Card.Header>
                <h5><i className="bi bi-building me-2"></i>Organisateur</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Organisateur</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.structureNom}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Festival ou Saison</Form.Label>
                      <Form.Select
                        value={formData.festivalId}
                        onChange={(e) => setFormData({ ...formData, festivalId: e.target.value })}
                      >
                        <option value="">-- Sans titre --</option>
                        {festivals.map(festival => (
                          <option key={festival.id} value={festival.id}>
                            {festival.titre || festival.nom || 'Sans titre'}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Section Négociation */}
            <Card className={styles.formSection}>
              <Card.Header>
                <h5><i className="bi bi-currency-euro me-2"></i>Négociation</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Type de contrat</Form.Label>
                      <Form.Select
                        value={formData.typeContrat}
                        onChange={(e) => setFormData({ ...formData, typeContrat: e.target.value })}
                      >
                        <option value="Cession">Cession</option>
                        <option value="Coréalisation">Coréalisation</option>
                        <option value="Location">Location</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Collaborateur assigné</Form.Label>
                      <Form.Select
                        value={formData.collaborateurId}
                        onChange={(e) => setFormData({ ...formData, collaborateurId: e.target.value })}
                      >
                        <option value="">-- Sélectionner --</option>
                        {collaborateurs.map(collab => (
                          <option key={collab.id} value={collab.id}>
                            {collab.prenom} {collab.nom}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Montant proposé</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.montantPropose}
                        onChange={(e) => setFormData({ ...formData, montantPropose: e.target.value })}
                        placeholder="Entrez le montant proposé"
                      />
                      <Button variant="link" size="sm" className="mt-1">
                        Voir le détail des recettes
                      </Button>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Devise</Form.Label>
                      <Form.Select
                        value={formData.devise}
                        onChange={(e) => setFormData({ ...formData, devise: e.target.value })}
                      >
                        <option value="EUR">EUR €</option>
                        <option value="USD">USD $</option>
                        <option value="GBP">GBP £</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Prise d'option</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.priseOption}
                        onChange={(e) => setFormData({ ...formData, priseOption: e.target.value })}
                        placeholder="Date limite de l'option"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Frais</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.frais}
                        onChange={(e) => setFormData({ ...formData, frais: e.target.value })}
                        placeholder="Ex: Transport, hébergement, repas..."
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Section Dossier de suivi */}
            <Card className={styles.formSection}>
              <Card.Header>
                <h5><i className="bi bi-folder me-2"></i>Dossier de suivi</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Dossier lié</Form.Label>
                  <Form.Select
                    value={formData.dossierSuivi}
                    onChange={(e) => setFormData({ ...formData, dossierSuivi: e.target.value })}
                  >
                    <option value="">-- Sans titre --</option>
                    {/* TODO: Charger les dossiers disponibles */}
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Notes de suivi</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Les notes de suivi correspondent à votre suivi de la relation commerciale et administrative sur cette date..."
                  />
                  <Form.Text className="text-muted">
                    Les notes de suivi correspondent à votre suivi de la relation commerciale et administrative sur cette date...
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Boutons de validation */}
            <div className={styles.formActions}>
              <Button 
                variant="secondary" 
                onClick={() => {
                  const currentTab = getActiveTab();
                  if (currentTab) closeTab(currentTab.id);
                }}
                disabled={saving}
              >
                Annuler
              </Button>
              <div className={styles.saveButtons}>
                <Button 
                  variant="primary" 
                  onClick={() => handleSave(false)}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </Button>
                <Button 
                  variant="success" 
                  onClick={() => handleSave(true)}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer et fermer'
                  )}
                </Button>
              </div>
            </div>
          </Form>
        </Col>
      </Row>
    </div>
  );
}

export default DateDetailsPage;