// src/components/contacts/modal/PersonneCreationModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Nav, Tab } from 'react-bootstrap';
import { useEntreprise } from '@/context/EntrepriseContext';
import { useAuth } from '@/context/AuthContext';
import { personnesService } from '@/services/contacts/personnesService';
import liaisonsService from '@/services/contacts/liaisonsService';
import { fonctionsService } from '@/services/fonctionsService';
import AddressInput from '@/components/ui/AddressInputUnified';
import styles from './StructureCreationModal.module.css'; // Réutiliser les styles

/**
 * Modal de création d'une nouvelle personne - MODÈLE RELATIONNEL
 * Utilise personnesService pour créer dans la collection 'personnes'
 * Avec système d'onglets : Adresse, Email/Tél
 */
function PersonneCreationModal({ show, onHide, onCreated, editMode = false, initialData = null, structureId = null }) {
  const { currentEntreprise } = useEntreprise();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('adresse');
  const [loading, setLoading] = useState(false);
  const [fonctions, setFonctions] = useState([]);
  const [formData, setFormData] = useState({
    // Champs principaux
    prenom: '',
    nom: '',
    source: '',
    
    // Onglet Adresse
    adresse: '',
    suiteAdresse: '',
    codePostal: '',
    ville: '',
    departement: '',
    region: '',
    pays: 'France',
    
    // Onglet Email/Téléphone
    email: '', // Email principal dans le modèle relationnel
    mailPerso: '',
    telephone: '', // Téléphone principal
    telephone2: '', // Téléphone secondaire
    mobile: '',
    fonction: '',
    notes: '',
    actif: true // Ajout du champ actif avec valeur par défaut à true
  });

  // Charger les fonctions au montage
  useEffect(() => {
    const loadFonctions = async () => {
      if (currentEntreprise?.id) {
        try {
          const fonctionsList = await fonctionsService.getActiveFonctions(currentEntreprise.id);
          setFonctions(fonctionsList);
        } catch (error) {
          console.error('Erreur lors du chargement des fonctions:', error);
        }
      }
    };
    loadFonctions();
  }, [currentEntreprise?.id]);

  // Effet pour initialiser les données en mode édition
  useEffect(() => {
    console.log('👤 [PersonneCreationModal] Props reçues:', { show, editMode, initialData });
    
    if (editMode && initialData) {
      // Les données peuvent être dans initialData.personne (nouveau format) ou directement dans initialData (ancien format)
      const personneData = initialData.personne || initialData;
      console.log('👤 [PersonneCreationModal] Données pour édition:', personneData);
      
      setFormData({
        prenom: personneData.prenom || '',
        nom: personneData.nom || '',
        source: personneData.source || '',
        adresse: personneData.adresse || '',
        suiteAdresse: personneData.suiteAdresse || '',
        codePostal: personneData.codePostal || '',
        ville: personneData.ville || '',
        departement: personneData.departement || '',
        region: personneData.region || '',
        pays: personneData.pays || 'France',
        email: personneData.email || personneData.mailDirect || '',
        mailPerso: personneData.mailPerso || '',
        telephone: personneData.telephone || personneData.telDirect || '',
        telephone2: personneData.telephone2 || personneData.telPerso || '',
        mobile: personneData.mobile || '',
        fonction: personneData.fonction || '',
        notes: personneData.notes || '',
        actif: personneData.actif !== undefined ? personneData.actif : true
      });
    } else if (!editMode) {
      // Réinitialiser en mode création
      setFormData({
        prenom: '',
        nom: '',
        source: '',
        adresse: '',
        suiteAdresse: '',
        codePostal: '',
        ville: '',
        departement: '',
        region: '',
        pays: 'France',
        email: '',
        mailPerso: '',
        telephone: '',
        telephone2: '',
        mobile: '',
        fonction: '',
        notes: '',
        actif: true
      });
    }
  }, [editMode, initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler pour l'autocomplétion d'adresse
  const handleAddressSelected = (addressData) => {
    console.log('Adresse personne sélectionnée:', addressData);
    
    // Mettre à jour les champs d'adresse avec les données de l'autocomplétion
    setFormData(prev => ({
      ...prev,
      adresse: addressData.adresse || '',
      codePostal: addressData.codePostal || '',
      ville: addressData.ville || '',
      departement: addressData.departement || '',
      region: addressData.region || '',
      pays: addressData.pays || 'France'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.prenom.trim()) {
      alert('Le prénom est obligatoire');
      return;
    }

    if (!currentEntreprise?.id) {
      alert('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);

    try {
      if (editMode && initialData) {
        // Mode édition - mettre à jour la personne existante
        console.log('🔄 [PersonneCreationModal] Mode édition - mise à jour de la personne:', initialData.id);
        
        const updatedData = {
          prenom: formData.prenom,
          nom: formData.nom,
          fonction: formData.fonction || undefined,
          email: formData.email || undefined,
          telephone: formData.telephone || undefined,
          telephone2: formData.telephone2 || undefined,
          mobile: formData.mobile || undefined,
          adresse: formData.adresse || undefined,
          suiteAdresse: formData.suiteAdresse || undefined,
          codePostal: formData.codePostal || undefined,
          ville: formData.ville || undefined,
          departement: formData.departement || undefined,
          region: formData.region || undefined,
          pays: formData.pays || 'France',
          notes: formData.notes || undefined,
          actif: formData.actif
        };
        
        // Mettre à jour via le service relationnel
        const updateResult = await personnesService.updatePersonne(initialData.id, updatedData, currentUser?.uid);
        
        if (!updateResult.success) {
          throw new Error(updateResult.error || 'Erreur lors de la mise à jour');
        }
        
        console.log('✅ [PersonneCreationModal] Personne mise à jour avec succès');
        
        // Callback pour notifier la mise à jour
        if (onCreated) {
          onCreated({
            id: initialData.id,
            ...updatedData
          });
        }
      } else {
        // Mode création - créer une nouvelle personne dans la collection 'personnes'
        const personneData = {
          prenom: formData.prenom,
          nom: formData.nom,
          fonction: formData.fonction || undefined,
          email: formData.email || undefined,
          telephone: formData.telephone || undefined,
          telephone2: formData.telephone2 || undefined,
          mobile: formData.mobile || undefined,
          adresse: formData.adresse || undefined,
          suiteAdresse: formData.suiteAdresse || undefined,
          codePostal: formData.codePostal || undefined,
          ville: formData.ville || undefined,
          departement: formData.departement || undefined,
          region: formData.region || undefined,
          pays: formData.pays || 'France',
          tags: [],
          source: formData.source || 'Prospection',
          notes: formData.notes || undefined,
          commentaires: [],
          actif: formData.actif
        };

        console.log('🆕 [PersonneCreationModal] Création nouvelle personne:', personneData);
        console.log('📎 [PersonneCreationModal] Structure ID fourni:', structureId);
        
        const result = await personnesService.createPersonne(personneData, currentEntreprise.id, currentUser?.uid);
        
        if (!result.success) {
          throw new Error(result.error || 'Erreur lors de la création');
        }
        
        console.log('✅ [PersonneCreationModal] Personne créée avec ID:', result.id);
        
        // Si un structureId est fourni, créer automatiquement la liaison
        if (structureId && result.id) {
          console.log('🔗 [PersonneCreationModal] Création de la liaison avec la structure:', structureId);
          
          const liaisonData = {
            entrepriseId: currentEntreprise.id,
            structureId: structureId,
            personneId: result.id,
            fonction: formData.fonction || null,
            actif: true,
            prioritaire: false,
            interesse: false,
            dateDebut: new Date(),
            dateFin: null,
            notes: null
          };
          
          const liaisonResult = await liaisonsService.createLiaison(liaisonData, currentUser?.uid);
          
          if (!liaisonResult.success) {
            console.error('❌ [PersonneCreationModal] Erreur lors de la création de la liaison:', liaisonResult.error);
            // Ne pas bloquer la création de la personne si la liaison échoue
            alert(`La personne a été créée mais n'a pas pu être associée à la structure: ${liaisonResult.error}`);
          } else {
            console.log('✅ [PersonneCreationModal] Liaison créée avec succès');
          }
        }
        
        // Callback pour notifier la création
        if (onCreated) {
          onCreated({
            id: result.id,
            ...personneData,
            structureId: structureId // Inclure le structureId pour que le parent sache qu'il y a une liaison
          });
        }
      }

      // Réinitialiser le formulaire
      setFormData({
        prenom: '',
        nom: '',
        source: '',
        adresse: '',
        suiteAdresse: '',
        codePostal: '',
        ville: '',
        departement: '',
        region: '',
        pays: 'France',
        email: '',
        mailPerso: '',
        telephone: '',
        telephone2: '',
        mobile: '',
        fonction: '',
        notes: ''
      });

      // Fermer la modal
      onHide();

    } catch (error) {
      console.error('❌ [PersonneCreationModal] Erreur lors de l\'opération:', error);
      alert(`Erreur lors de ${editMode ? 'la mise à jour' : 'la création'} de la personne: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderAdresseTab = () => (
    <div className={styles.tabContent}>
      <div className="row">
        <div className="col-12 mb-3">
          <AddressInput
            label="Adresse avec autocomplétion"
            value={formData.adresse}
            onChange={(e) => handleInputChange('adresse', e.target.value)}
            onAddressSelected={handleAddressSelected}
            placeholder="Commencez à taper pour rechercher une adresse..."
          />
        </div>
        
        <div className="col-12 mb-3">
          <Form.Label>Complément d'adresse</Form.Label>
          <Form.Control
            type="text"
            placeholder="Complément d'adresse"
            value={formData.suiteAdresse}
            onChange={(e) => handleInputChange('suiteAdresse', e.target.value)}
          />
        </div>
        
        <div className="col-md-4 mb-3">
          <Form.Label>Code postal</Form.Label>
          <Form.Control
            type="text"
            placeholder="Code postal"
            value={formData.codePostal}
            onChange={(e) => handleInputChange('codePostal', e.target.value)}
          />
        </div>
        
        <div className="col-md-8 mb-3">
          <Form.Label>Ville</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ville"
            value={formData.ville}
            onChange={(e) => handleInputChange('ville', e.target.value)}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>Département</Form.Label>
          <Form.Control
            type="text"
            placeholder="Département"
            value={formData.departement}
            onChange={(e) => handleInputChange('departement', e.target.value)}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>Région</Form.Label>
          <Form.Control
            type="text"
            placeholder="Région"
            value={formData.region}
            onChange={(e) => handleInputChange('region', e.target.value)}
          />
        </div>
        
        <div className="col-12 mb-3">
          <Form.Label>Pays</Form.Label>
          <Form.Control
            type="text"
            placeholder="Pays"
            value={formData.pays}
            onChange={(e) => handleInputChange('pays', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderEmailTelTab = () => (
    <div className={styles.tabContent}>
      <div className="row">
        <div className="col-12 mb-3">
          <Form.Label>Fonction</Form.Label>
          <div className="d-flex gap-2">
            <Form.Select
              value={formData.fonction}
              onChange={(e) => handleInputChange('fonction', e.target.value)}
              className="flex-grow-1"
            >
              <option value="">Sélectionner une fonction</option>
              {fonctions.filter(f => f.actif).map(fonction => (
                <option key={fonction.id} value={fonction.nom}>
                  {fonction.nom}
                </option>
              ))}
              <option value="_autre">Autre...</option>
            </Form.Select>
            {formData.fonction === '_autre' && (
              <Form.Control
                type="text"
                placeholder="Nouvelle fonction"
                onChange={(e) => handleInputChange('fonction', e.target.value)}
                autoFocus
              />
            )}
          </div>
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>Email principal</Form.Label>
          <Form.Control
            type="email"
            placeholder="email@entreprise.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>Email personnel</Form.Label>
          <Form.Control
            type="email"
            placeholder="email.perso@gmail.com"
            value={formData.mailPerso}
            onChange={(e) => handleInputChange('mailPerso', e.target.value)}
          />
        </div>
        
        <div className="col-md-4 mb-3">
          <Form.Label>Téléphone principal</Form.Label>
          <Form.Control
            type="tel"
            placeholder="01 23 45 67 89"
            value={formData.telephone}
            onChange={(e) => handleInputChange('telephone', e.target.value)}
          />
        </div>
        
        <div className="col-md-4 mb-3">
          <Form.Label>Téléphone secondaire</Form.Label>
          <Form.Control
            type="tel"
            placeholder="01 23 45 67 89"
            value={formData.telephone2}
            onChange={(e) => handleInputChange('telephone2', e.target.value)}
          />
        </div>
        
        <div className="col-md-4 mb-3">
          <Form.Label>Mobile</Form.Label>
          <Form.Control
            type="tel"
            placeholder="06 12 34 56 78"
            value={formData.mobile}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
          />
        </div>
        
        <div className="col-12 mb-3">
          <Form.Label>Notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Notes sur cette personne..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className={`bi ${editMode ? 'bi-person-gear' : 'bi-person-plus'} me-2`}></i>
          {editMode ? 'Modifier la Personne' : 'Nouvelle Personne'}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Champs principaux */}
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <Form.Label>Prénom *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Prénom"
                value={formData.prenom}
                onChange={(e) => handleInputChange('prenom', e.target.value)}
                required
              />
            </div>
            
            <div className="col-md-4 mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nom de famille"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
              />
            </div>
            
            <div className="col-md-4 mb-3">
              <Form.Label>Source</Form.Label>
              <Form.Select
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
              >
                <option value="">Sélectionner...</option>
                <option value="Prospection">Prospection</option>
                <option value="Recommandation">Recommandation</option>
                <option value="Site web">Site web</option>
                <option value="Salon">Salon</option>
                <option value="Partenaire">Partenaire</option>
                <option value="Réseau social">Réseau social</option>
                <option value="Autre">Autre</option>
              </Form.Select>
            </div>
          </div>

          {/* Checkbox Actif */}
          <div className="row mb-4">
            <div className="col-12">
              <Form.Check
                type="checkbox"
                id="actif-checkbox"
                label="Contact actif"
                checked={formData.actif}
                onChange={(e) => handleInputChange('actif', e.target.checked)}
              />
              <Form.Text className="text-muted">
                Décochez cette case si vous ne travaillez plus avec ce contact
              </Form.Text>
            </div>
          </div>

          {/* Système d'onglets */}
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="adresse">
                  <i className="bi bi-house me-1"></i>
                  Adresse
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="email-tel">
                  <i className="bi bi-envelope me-1"></i>
                  Email / Tél
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="adresse">
                {renderAdresseTab()}
              </Tab.Pane>
              <Tab.Pane eventKey="email-tel">
                {renderEmailTelTab()}
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
                {editMode ? 'Mise à jour...' : 'Création...'}
              </>
            ) : (
              <>
                <i className={`bi ${editMode ? 'bi-check-lg' : 'bi-plus-lg'} me-1`}></i>
                {editMode ? 'Mettre à jour' : 'Créer la personne'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default PersonneCreationModal;