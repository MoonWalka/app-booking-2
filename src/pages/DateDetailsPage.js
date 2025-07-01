import React, { useState, useEffect, useCallback } from 'react';
import { Button, Form, Card, Row, Col } from 'react-bootstrap';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { useTabs } from '@/context/TabsContext';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import styles from './DateDetailsPage.module.css';

/**
 * Page de détails et d'édition d'une date de concert
 */
function DateDetailsPage({ params = {} }) {
  const { currentOrganization } = useOrganization();
  const { currentUser } = useAuth();
  const { getActiveTab, closeTab, openTab } = useTabs();
  
  const concertId = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [concertData, setConcertData] = useState(null);
  const [festivals, setFestivals] = useState([]);
  const [collaborateurs, setCollaborateurs] = useState([]);
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

  // Charger les données du concert
  const loadConcertData = useCallback(async () => {
    if (!concertId) return;
    
    try {
      setLoading(true);
      const docRef = doc(db, 'concerts', concertId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConcertData({ id: docSnap.id, ...data });
        
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
          typeContrat: data.typeContrat || 'Cession',
          collaborateurId: data.collaborateurId || '',
          montantPropose: data.montantPropose || '',
          devise: data.devise || 'EUR',
          priseOption: data.priseOption || '',
          frais: data.frais || '',
          dossierSuivi: data.dossierSuivi || '',
          notes: data.notes || ''
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du concert:', error);
    } finally {
      setLoading(false);
    }
  }, [concertId]);

  // Charger les festivals
  const loadFestivals = useCallback(async () => {
    if (!currentOrganization?.id) return;
    
    try {
      const q = query(
        collection(db, 'festivals'),
        where('organizationId', '==', currentOrganization.id)
      );
      const querySnapshot = await getDocs(q);
      const festivalsData = [];
      
      querySnapshot.forEach((doc) => {
        festivalsData.push({ id: doc.id, ...doc.data() });
      });
      
      setFestivals(festivalsData);
    } catch (error) {
      console.error('Erreur lors du chargement des festivals:', error);
    }
  }, [currentOrganization?.id]);

  // Charger les collaborateurs
  const loadCollaborateurs = useCallback(async () => {
    if (!currentOrganization?.id) return;
    
    try {
      const q = query(
        collection(db, 'collaborateurs'),
        where('organizationId', '==', currentOrganization.id)
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
  }, [currentOrganization?.id]);

  useEffect(() => {
    loadConcertData();
    loadFestivals();
    loadCollaborateurs();
  }, [loadConcertData, loadFestivals, loadCollaborateurs]);

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
    if (!concertId) return;
    
    setSaving(true);
    try {
      const docRef = doc(db, 'concerts', concertId);
      await updateDoc(docRef, {
        ...formData,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser?.email || 'Utilisateur inconnu'
      });
      
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
          id: `devis-${concertId}`,
          title: `Devis - ${formData.artisteNom}`,
          type: 'devis',
          params: { concertId }
        });
        break;
      case 'precontrat':
        openTab({
          id: `precontrat-${concertId}`,
          title: `Pré-contrat - ${formData.artisteNom}`,
          type: 'precontrat',
          params: { concertId }
        });
        break;
      case 'confirmation':
        openTab({
          id: `confirmation-${concertId}`,
          title: `Confirmation - ${formData.artisteNom}`,
          type: 'confirmation',
          params: { concertId }
        });
        break;
      case 'contrat':
        openTab({
          id: `contrat-${concertId}`,
          title: `Contrat - ${formData.artisteNom}`,
          type: 'contrat',
          params: { concertId }
        });
        break;
      case 'factures':
        openTab({
          id: `factures-${concertId}`,
          title: `Factures - ${formData.artisteNom}`,
          type: 'factures',
          params: { concertId }
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

  if (!concertData) {
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
                            {festival.nom}
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
                        placeholder="0"
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
                        placeholder="Frais supplémentaires"
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