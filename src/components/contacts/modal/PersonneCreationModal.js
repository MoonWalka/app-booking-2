// src/components/contacts/modal/PersonneCreationModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Nav, Tab } from 'react-bootstrap';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import AddressInput from '@/components/ui/AddressInput';
import styles from './StructureCreationModal.module.css'; // Réutiliser les styles

/**
 * Modal de création d'une nouvelle personne
 * Avec système d'onglets : Adresse, Email/Tél
 */
function PersonneCreationModal({ show, onHide, onCreated, editMode = false, initialData = null }) {
  const { currentOrganization } = useOrganization();
  const [activeTab, setActiveTab] = useState('adresse');
  const [loading, setLoading] = useState(false);
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
    mailDirect: '',
    mailPerso: '',
    telDirect: '',
    telPerso: '',
    mobile: '',
    fonction: ''
  });

  // Effet pour initialiser les données en mode édition
  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        prenom: initialData.prenom || '',
        nom: initialData.nom || '',
        source: initialData.source || '',
        adresse: initialData.adresse || '',
        suiteAdresse: initialData.suiteAdresse || '',
        codePostal: initialData.codePostal || '',
        ville: initialData.ville || '',
        departement: initialData.departement || '',
        region: initialData.region || '',
        pays: initialData.pays || 'France',
        mailDirect: initialData.email || initialData.mailDirect || '',
        mailPerso: initialData.mailPerso || '',
        telDirect: initialData.telephone || initialData.telDirect || '',
        telPerso: initialData.telPerso || '',
        mobile: initialData.mobile || '',
        fonction: initialData.fonction || ''
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
        mailDirect: '',
        mailPerso: '',
        telDirect: '',
        telPerso: '',
        mobile: '',
        fonction: ''
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
      adresse: addressData.display_name || addressData.road || '',
      codePostal: addressData.postcode || '',
      ville: addressData.city || addressData.town || addressData.village || '',
      departement: addressData.state_district || addressData.county || '',
      region: addressData.state || '',
      pays: addressData.country || 'France'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.prenom.trim() || !formData.nom.trim()) {
      alert('Le prénom et le nom sont obligatoires');
      return;
    }

    if (!currentOrganization?.id) {
      alert('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);

    try {
      if (editMode && initialData) {
        // Mode édition - mettre à jour la personne existante
        console.log('Mode édition - mise à jour de la personne:', initialData.id);
        
        // Pour les personnes dans une structure unifiée, on ne peut pas modifier directement
        // car elles font partie du document structure. On doit passer par le callback
        const updatedPersonneData = {
          ...formData,
          id: initialData.id, // Garder l'ID original
          updatedAt: new Date() // Date pour l'état local
        };
        
        // Callback pour notifier la mise à jour
        if (onCreated) {
          onCreated(updatedPersonneData);
        }
        
        console.log('Personne mise à jour:', updatedPersonneData);
      } else {
        // Mode création - créer une nouvelle personne
        const personneData = {
          ...formData,
          organizationId: currentOrganization.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          type: 'personne'
        };

        const docRef = await addDoc(collection(db, 'contacts'), personneData);
        
        console.log('Personne créée avec ID:', docRef.id);
        
        // Callback pour notifier la création
        if (onCreated) {
          onCreated({
            id: docRef.id,
            ...personneData
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
        mailDirect: '',
        mailPerso: '',
        telDirect: '',
        telPerso: '',
        mobile: '',
        fonction: ''
      });

      // Fermer la modal
      onHide();

    } catch (error) {
      console.error('Erreur lors de la création de la personne:', error);
      alert('Erreur lors de la création de la personne');
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
          <Form.Control
            type="text"
            placeholder="Fonction ou poste"
            value={formData.fonction}
            onChange={(e) => handleInputChange('fonction', e.target.value)}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>Email direct</Form.Label>
          <Form.Control
            type="email"
            placeholder="email.direct@entreprise.com"
            value={formData.mailDirect}
            onChange={(e) => handleInputChange('mailDirect', e.target.value)}
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
          <Form.Label>Téléphone direct</Form.Label>
          <Form.Control
            type="tel"
            placeholder="01 23 45 67 89"
            value={formData.telDirect}
            onChange={(e) => handleInputChange('telDirect', e.target.value)}
          />
        </div>
        
        <div className="col-md-4 mb-3">
          <Form.Label>Téléphone personnel</Form.Label>
          <Form.Control
            type="tel"
            placeholder="01 23 45 67 89"
            value={formData.telPerso}
            onChange={(e) => handleInputChange('telPerso', e.target.value)}
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
              <Form.Label>Nom *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nom de famille"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                required
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