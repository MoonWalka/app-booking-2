// src/components/contacts/modal/StructureCreationModal.js
import React, { useState } from 'react';
import { Modal, Button, Form, Nav, Tab } from 'react-bootstrap';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import AddressInput from '@/components/ui/AddressInput';
import styles from './StructureCreationModal.module.css';

/**
 * Modal de création d'une nouvelle structure
 * Avec système d'onglets : Adresse, Email/Tél, Administratif, Réseaux sociaux
 */
function StructureCreationModal({ show, onHide, onCreated }) {
  const { currentOrganization } = useOrganization();
  const [activeTab, setActiveTab] = useState('adresse');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Champs principaux
    structureRaisonSociale: '',
    structureSource: '',
    
    // Onglet Adresse
    structureAdresse: '',
    structureSuiteAdresse1: '',
    structureCodePostal: '',
    structureVille: '',
    structureDepartement: '',
    structureRegion: '',
    structurePays: 'France',
    
    // Onglet Email/Téléphone
    structureEmail: '',
    structureEmail2: '',
    structureTelephone1: '',
    structureTelephone2: '',
    structureFax: '',
    
    // Onglet Administratif
    structureCodeClient: '',
    structureRaisonSocialeAdmin: '',
    structureAdresseAdmin: '',
    structureSuiteAdresseAdmin: '',
    structureCodePostalAdmin: '',
    structureVilleAdmin: '',
    structurePaysAdmin: '',
    structureRegionAdmin: '',
    structureDepartementAdmin: '',
    structureTelAdmin: '',
    structureFaxAdmin: '',
    structureEmailAdmin: '',
    structureSignataire: '',
    structureQualite: '',
    structureSiret: '',
    structureCodeApe: '',
    structureLicence: '',
    structureTvaIntracom: '',
    
    // Onglet Réseaux sociaux
    structureSiteWeb: '',
    structureFacebook: '',
    structureInstagram: '',
    structureTwitter: '',
    structureLinkedin: '',
    structureYoutube: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler pour l'autocomplétion d'adresse
  const handleAddressSelected = (addressData) => {
    console.log('Adresse sélectionnée:', addressData);
    
    // Mettre à jour les champs d'adresse avec les données de l'autocomplétion
    setFormData(prev => ({
      ...prev,
      structureAdresse: addressData.display_name || addressData.road || '',
      structureCodePostal: addressData.postcode || '',
      structureVille: addressData.city || addressData.town || addressData.village || '',
      structureDepartement: addressData.state_district || addressData.county || '',
      structureRegion: addressData.state || '',
      structurePays: addressData.country || 'France'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.structureRaisonSociale.trim()) {
      alert('Le nom de la structure est obligatoire');
      return;
    }

    if (!currentOrganization?.id) {
      alert('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);

    try {
      // Créer le document structure dans la collection contacts
      const structureData = {
        ...formData,
        organizationId: currentOrganization.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        type: 'structure'
      };

      const docRef = await addDoc(collection(db, 'contacts'), structureData);
      
      console.log('Structure créée avec ID:', docRef.id);
      
      // Callback pour notifier la création
      if (onCreated) {
        onCreated({
          id: docRef.id,
          ...structureData
        });
      }

      // Réinitialiser le formulaire
      setFormData({
        structureRaisonSociale: '',
        structureSource: '',
        structureAdresse: '',
        structureSuiteAdresse1: '',
        structureCodePostal: '',
        structureVille: '',
        structureDepartement: '',
        structureRegion: '',
        structurePays: 'France',
        structureEmail: '',
        structureEmail2: '',
        structureTelephone1: '',
        structureTelephone2: '',
        structureFax: '',
        structureCodeClient: '',
        structureRaisonSocialeAdmin: '',
        structureAdresseAdmin: '',
        structureSuiteAdresseAdmin: '',
        structureCodePostalAdmin: '',
        structureVilleAdmin: '',
        structurePaysAdmin: '',
        structureRegionAdmin: '',
        structureDepartementAdmin: '',
        structureTelAdmin: '',
        structureFaxAdmin: '',
        structureEmailAdmin: '',
        structureSignataire: '',
        structureQualite: '',
        structureSiret: '',
        structureCodeApe: '',
        structureLicence: '',
        structureTvaIntracom: '',
        structureSiteWeb: '',
        structureFacebook: '',
        structureInstagram: '',
        structureTwitter: '',
        structureLinkedin: '',
        structureYoutube: ''
      });

      // Fermer la modal
      onHide();

    } catch (error) {
      console.error('Erreur lors de la création de la structure:', error);
      alert('Erreur lors de la création de la structure');
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
            value={formData.structureAdresse}
            onChange={(e) => handleInputChange('structureAdresse', e.target.value)}
            onAddressSelected={handleAddressSelected}
            placeholder="Commencez à taper pour rechercher une adresse..."
          />
        </div>
        
        <div className="col-12 mb-3">
          <Form.Label>Complément d'adresse</Form.Label>
          <Form.Control
            type="text"
            placeholder="Complément d'adresse"
            value={formData.structureSuiteAdresse1}
            onChange={(e) => handleInputChange('structureSuiteAdresse1', e.target.value)}
          />
        </div>
        
        <div className="col-md-4 mb-3">
          <Form.Label>Code postal</Form.Label>
          <Form.Control
            type="text"
            placeholder="Code postal"
            value={formData.structureCodePostal}
            onChange={(e) => handleInputChange('structureCodePostal', e.target.value)}
          />
        </div>
        
        <div className="col-md-8 mb-3">
          <Form.Label>Ville</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ville"
            value={formData.structureVille}
            onChange={(e) => handleInputChange('structureVille', e.target.value)}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>Département</Form.Label>
          <Form.Control
            type="text"
            placeholder="Département"
            value={formData.structureDepartement}
            onChange={(e) => handleInputChange('structureDepartement', e.target.value)}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>Région</Form.Label>
          <Form.Control
            type="text"
            placeholder="Région"
            value={formData.structureRegion}
            onChange={(e) => handleInputChange('structureRegion', e.target.value)}
          />
        </div>
        
        <div className="col-12 mb-3">
          <Form.Label>Pays</Form.Label>
          <Form.Control
            type="text"
            placeholder="Pays"
            value={formData.structurePays}
            onChange={(e) => handleInputChange('structurePays', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderEmailTelTab = () => (
    <div className={styles.tabContent}>
      <div className="row">
        <div className="col-md-6 mb-3">
          <Form.Label>Email principal</Form.Label>
          <Form.Control
            type="email"
            placeholder="email@structure.com"
            value={formData.structureEmail}
            onChange={(e) => handleInputChange('structureEmail', e.target.value)}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>Email secondaire</Form.Label>
          <Form.Control
            type="email"
            placeholder="email2@structure.com"
            value={formData.structureEmail2}
            onChange={(e) => handleInputChange('structureEmail2', e.target.value)}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>Téléphone principal</Form.Label>
          <Form.Control
            type="tel"
            placeholder="01 23 45 67 89"
            value={formData.structureTelephone1}
            onChange={(e) => handleInputChange('structureTelephone1', e.target.value)}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>Téléphone secondaire</Form.Label>
          <Form.Control
            type="tel"
            placeholder="01 23 45 67 89"
            value={formData.structureTelephone2}
            onChange={(e) => handleInputChange('structureTelephone2', e.target.value)}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>Fax</Form.Label>
          <Form.Control
            type="tel"
            placeholder="01 23 45 67 89"
            value={formData.structureFax}
            onChange={(e) => handleInputChange('structureFax', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderAdministratifTab = () => (
    <div className={styles.tabContent}>
      <div className="row">
        <div className="col-md-6 mb-3">
          <Form.Label>Code client</Form.Label>
          <Form.Control
            type="text"
            placeholder="Code client"
            value={formData.structureCodeClient}
            onChange={(e) => handleInputChange('structureCodeClient', e.target.value)}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>Raison sociale</Form.Label>
          <Form.Control
            type="text"
            placeholder="Raison sociale administrative"
            value={formData.structureRaisonSocialeAdmin}
            onChange={(e) => handleInputChange('structureRaisonSocialeAdmin', e.target.value)}
          />
        </div>
        
        <div className="col-12 mb-3">
          <Form.Label>Adresse</Form.Label>
          <Form.Control
            type="text"
            placeholder="Adresse administrative"
            value={formData.structureAdresseAdmin}
            onChange={(e) => handleInputChange('structureAdresseAdmin', e.target.value)}
          />
        </div>
        
        <div className="col-12 mb-3">
          <Form.Label>Suite adresse</Form.Label>
          <Form.Control
            type="text"
            placeholder="Complément d'adresse administrative"
            value={formData.structureSuiteAdresseAdmin}
            onChange={(e) => handleInputChange('structureSuiteAdresseAdmin', e.target.value)}
          />
        </div>
        
        <div className="col-md-4 mb-3">
          <Form.Label>Code postal</Form.Label>
          <Form.Control
            type="text"
            placeholder="Code postal"
            value={formData.structureCodePostalAdmin}
            onChange={(e) => handleInputChange('structureCodePostalAdmin', e.target.value)}
          />
        </div>
        
        <div className="col-md-8 mb-3">
          <Form.Label>Ville</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ville"
            value={formData.structureVilleAdmin}
            onChange={(e) => handleInputChange('structureVilleAdmin', e.target.value)}
          />
        </div>
        
        <div className="col-md-4 mb-3">
          <Form.Label>Pays</Form.Label>
          <Form.Control
            type="text"
            placeholder="Pays"
            value={formData.structurePaysAdmin}
            onChange={(e) => handleInputChange('structurePaysAdmin', e.target.value)}
          />
        </div>
        
        <div className="col-md-4 mb-3">
          <Form.Label>Région</Form.Label>
          <Form.Control
            type="text"
            placeholder="Région"
            value={formData.structureRegionAdmin}
            onChange={(e) => handleInputChange('structureRegionAdmin', e.target.value)}
          />
        </div>
        
        <div className="col-md-4 mb-3">
          <Form.Label>Département</Form.Label>
          <Form.Control
            type="text"
            placeholder="Département"
            value={formData.structureDepartementAdmin}
            onChange={(e) => handleInputChange('structureDepartementAdmin', e.target.value)}
          />
        </div>
        
        <div className="col-md-4 mb-3">
          <Form.Label>Tél</Form.Label>
          <Form.Control
            type="tel"
            placeholder="01 23 45 67 89"
            value={formData.structureTelAdmin}
            onChange={(e) => handleInputChange('structureTelAdmin', e.target.value)}
          />
        </div>
        
        <div className="col-md-4 mb-3">
          <Form.Label>Fax</Form.Label>
          <Form.Control
            type="tel"
            placeholder="01 23 45 67 89"
            value={formData.structureFaxAdmin}
            onChange={(e) => handleInputChange('structureFaxAdmin', e.target.value)}
          />
        </div>
        
        <div className="col-md-4 mb-3">
          <Form.Label>E-mail</Form.Label>
          <Form.Control
            type="email"
            placeholder="email@structure.com"
            value={formData.structureEmailAdmin}
            onChange={(e) => handleInputChange('structureEmailAdmin', e.target.value)}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>Signataire</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nom du signataire"
            value={formData.structureSignataire}
            onChange={(e) => handleInputChange('structureSignataire', e.target.value)}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>Qualité</Form.Label>
          <Form.Control
            type="text"
            placeholder="Qualité du signataire"
            value={formData.structureQualite}
            onChange={(e) => handleInputChange('structureQualite', e.target.value)}
          />
        </div>
        
        <div className="col-md-4 mb-3">
          <Form.Label>Siret</Form.Label>
          <Form.Control
            type="text"
            placeholder="12345678901234"
            value={formData.structureSiret}
            onChange={(e) => handleInputChange('structureSiret', e.target.value)}
          />
        </div>
        
        <div className="col-md-4 mb-3">
          <Form.Label>APE</Form.Label>
          <Form.Control
            type="text"
            placeholder="Code APE/NAF"
            value={formData.structureCodeApe}
            onChange={(e) => handleInputChange('structureCodeApe', e.target.value)}
          />
        </div>
        
        <div className="col-md-4 mb-3">
          <Form.Label>Licence</Form.Label>
          <Form.Control
            type="text"
            placeholder="Numéro de licence"
            value={formData.structureLicence}
            onChange={(e) => handleInputChange('structureLicence', e.target.value)}
          />
        </div>
        
        <div className="col-12 mb-3">
          <Form.Label>TVA intracom.</Form.Label>
          <Form.Control
            type="text"
            placeholder="Numéro de TVA intracommunautaire"
            value={formData.structureTvaIntracom}
            onChange={(e) => handleInputChange('structureTvaIntracom', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderReseauxSociauxTab = () => (
    <div className={styles.tabContent}>
      <div className="row">
        <div className="col-12 mb-3">
          <Form.Label>Site web</Form.Label>
          <Form.Control
            type="url"
            placeholder="https://www.structure.com"
            value={formData.structureSiteWeb}
            onChange={(e) => handleInputChange('structureSiteWeb', e.target.value)}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>Facebook</Form.Label>
          <Form.Control
            type="url"
            placeholder="https://facebook.com/structure"
            value={formData.structureFacebook}
            onChange={(e) => handleInputChange('structureFacebook', e.target.value)}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>Instagram</Form.Label>
          <Form.Control
            type="url"
            placeholder="https://instagram.com/structure"
            value={formData.structureInstagram}
            onChange={(e) => handleInputChange('structureInstagram', e.target.value)}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>Twitter</Form.Label>
          <Form.Control
            type="url"
            placeholder="https://twitter.com/structure"
            value={formData.structureTwitter}
            onChange={(e) => handleInputChange('structureTwitter', e.target.value)}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>LinkedIn</Form.Label>
          <Form.Control
            type="url"
            placeholder="https://linkedin.com/company/structure"
            value={formData.structureLinkedin}
            onChange={(e) => handleInputChange('structureLinkedin', e.target.value)}
          />
        </div>
        
        <div className="col-12 mb-3">
          <Form.Label>YouTube</Form.Label>
          <Form.Control
            type="url"
            placeholder="https://youtube.com/structure"
            value={formData.structureYoutube}
            onChange={(e) => handleInputChange('structureYoutube', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-building-add me-2"></i>
          Nouvelle Structure
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Champs principaux */}
          <div className="row mb-4">
            <div className="col-md-8 mb-3">
              <Form.Label>Nom de la structure *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Raison sociale de la structure"
                value={formData.structureRaisonSociale}
                onChange={(e) => handleInputChange('structureRaisonSociale', e.target.value)}
                required
              />
            </div>
            
            <div className="col-md-4 mb-3">
              <Form.Label>Source</Form.Label>
              <Form.Select
                value={formData.structureSource}
                onChange={(e) => handleInputChange('structureSource', e.target.value)}
              >
                <option value="">Sélectionner...</option>
                <option value="Prospection">Prospection</option>
                <option value="Recommandation">Recommandation</option>
                <option value="Site web">Site web</option>
                <option value="Salon">Salon</option>
                <option value="Partenaire">Partenaire</option>
                <option value="Autre">Autre</option>
              </Form.Select>
            </div>
          </div>

          {/* Système d'onglets */}
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="adresse">
                  <i className="bi bi-geo-alt me-1"></i>
                  Adresse
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="email-tel">
                  <i className="bi bi-envelope me-1"></i>
                  Email / Tél
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="administratif">
                  <i className="bi bi-building-gear me-1"></i>
                  Administratif
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="reseaux">
                  <i className="bi bi-share me-1"></i>
                  Réseaux sociaux
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
              <Tab.Pane eventKey="administratif">
                {renderAdministratifTab()}
              </Tab.Pane>
              <Tab.Pane eventKey="reseaux">
                {renderReseauxSociauxTab()}
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
                Création...
              </>
            ) : (
              <>
                <i className="bi bi-plus-lg me-1"></i>
                Créer la structure
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default StructureCreationModal;