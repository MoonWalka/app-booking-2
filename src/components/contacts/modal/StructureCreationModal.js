// src/components/contacts/modal/StructureCreationModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Nav, Tab } from 'react-bootstrap';
import { useOrganization } from '@/context/OrganizationContext';
import { useAuth } from '@/context/AuthContext';
import { structuresService } from '@/services/contacts/structuresService';
import AddressInput from '@/components/ui/AddressInput';
import styles from './StructureCreationModal.module.css';

/**
 * Modal de création d'une nouvelle structure - MODÈLE RELATIONNEL
 * Utilise structuresService pour créer dans la collection 'structures'
 * Avec système d'onglets : Adresse, Email/Tél, Administratif, Réseaux sociaux
 */
function StructureCreationModal({ show, onHide, onCreated, editMode = false, initialData = null }) {
  const { currentOrganization } = useOrganization();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('adresse');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => {
    // En mode édition, pré-remplir avec les données initiales
    if (editMode && initialData) {
      return {
        // Champs principaux
        raisonSociale: initialData.raisonSociale || '',
        type: initialData.type || '',
        source: initialData.source || '',
        
        // Onglet Adresse
        adresse: initialData.adresse || '',
        suiteAdresse: initialData.suiteAdresse || '',
        codePostal: initialData.codePostal || '',
        ville: initialData.ville || '',
        departement: initialData.departement || '',
        region: initialData.region || '',
        pays: initialData.pays || 'France',
        
        // Onglet Email/Téléphone
        email: initialData.email || '',
        telephone1: initialData.telephone1 || '',
        telephone2: initialData.telephone2 || '',
        fax: initialData.fax || '',
        siteWeb: initialData.siteWeb || '',
        notes: initialData.notes || '',
        
        // Onglet Administratif
        structureCodeClient: initialData.codeClient || '',
        structureRaisonSocialeAdmin: initialData.raisonSocialeAdmin || '',
        structureAdresseAdmin: initialData.adresseAdmin || '',
        structureSuiteAdresseAdmin: initialData.suiteAdresseAdmin || '',
        structureCodePostalAdmin: initialData.codePostalAdmin || '',
        structureVilleAdmin: initialData.villeAdmin || '',
        structurePaysAdmin: initialData.paysAdmin || '',
        structureRegionAdmin: initialData.regionAdmin || '',
        structureDepartementAdmin: initialData.departementAdmin || '',
        structureTelAdmin: initialData.telAdmin || '',
        structureFaxAdmin: initialData.faxAdmin || '',
        structureEmailAdmin: initialData.emailAdmin || '',
        structureSignataire: initialData.signataire || '',
        structureQualite: initialData.qualite || '',
        structureSiret: initialData.siret || '',
        structureCodeApe: initialData.codeApe || '',
        structureLicence: initialData.licence || '',
        structureTvaIntracom: initialData.tvaIntracom || '',
        
        // Onglet Réseaux sociaux
        structureSiteWeb: initialData.siteWeb || '',
        structureFacebook: initialData.facebook || '',
        structureInstagram: initialData.instagram || '',
        structureTwitter: initialData.twitter || '',
        structureLinkedin: initialData.linkedin || '',
        structureYoutube: initialData.youtube || ''
      };
    }
    
    // Mode création - valeurs par défaut
    return {
      // Champs principaux
      raisonSociale: '',
      type: '',
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
      email: '',
      telephone1: '',
      telephone2: '',
      fax: '',
      siteWeb: '',
      notes: '',
      
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
    };
  });

  // Mettre à jour le formulaire quand les données initiales changent
  useEffect(() => {
    if (editMode && initialData) {
      // Les données peuvent être dans initialData.structure (nouveau format) ou directement dans initialData (ancien format)
      const structureData = initialData.structure || initialData;
      
      setFormData({
        // Champs principaux
        structureRaisonSociale: structureData.raisonSociale || '',
        structureSource: structureData.source || '',
        
        // Onglet Adresse
        structureAdresse: structureData.adresse || '',
        structureSuiteAdresse1: structureData.suiteAdresse || '',
        structureCodePostal: structureData.codePostal || '',
        structureVille: structureData.ville || '',
        structureDepartement: structureData.departement || '',
        structureRegion: structureData.region || '',
        structurePays: structureData.pays || 'France',
        
        // Onglet Email/Téléphone
        structureEmail: structureData.email || '',
        structureEmail2: structureData.email2 || '',
        structureTelephone1: structureData.telephone1 || '',
        structureTelephone2: structureData.telephone2 || '',
        structureFax: structureData.fax || '',
        
        // Onglet Administratif
        structureCodeClient: structureData.codeClient || '',
        structureRaisonSocialeAdmin: structureData.raisonSocialeAdmin || '',
        structureAdresseAdmin: structureData.adresseAdmin || '',
        structureSuiteAdresseAdmin: structureData.suiteAdresseAdmin || '',
        structureCodePostalAdmin: structureData.codePostalAdmin || '',
        structureVilleAdmin: structureData.villeAdmin || '',
        structurePaysAdmin: structureData.paysAdmin || '',
        structureRegionAdmin: structureData.regionAdmin || '',
        structureDepartementAdmin: structureData.departementAdmin || '',
        structureTelAdmin: structureData.telAdmin || '',
        structureFaxAdmin: structureData.faxAdmin || '',
        structureEmailAdmin: structureData.emailAdmin || '',
        structureSignataire: structureData.signataire || '',
        structureQualite: structureData.qualite || '',
        structureSiret: structureData.siret || '',
        structureCodeApe: structureData.codeApe || '',
        structureLicence: structureData.licence || '',
        structureTvaIntracom: structureData.tvaIntracom || '',
        
        // Onglet Réseaux sociaux
        structureSiteWeb: structureData.siteWeb || '',
        structureFacebook: structureData.facebook || '',
        structureInstagram: structureData.instagram || '',
        structureTwitter: structureData.twitter || '',
        structureLinkedin: structureData.linkedin || '',
        structureYoutube: structureData.youtube || ''
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
    console.log('Adresse sélectionnée:', addressData);
    
    // Mettre à jour les champs d'adresse avec les données de l'autocomplétion
    setFormData(prev => ({
      ...prev,
      structureAdresse: addressData.adresse || '',
      structureCodePostal: addressData.codePostal || '',
      structureVille: addressData.ville || '',
      structureDepartement: addressData.departement || '',
      structureRegion: addressData.region || '',
      structurePays: addressData.pays || 'France'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.raisonSociale.trim()) {
      alert('Le nom de la structure est obligatoire');
      return;
    }

    if (!currentOrganization?.id) {
      alert('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);

    try {
      if (editMode && initialData?.id) {
        // Mode édition - mettre à jour la structure existante
        console.log('🔄 [StructureCreationModal] Mode édition - mise à jour de la structure:', initialData.id);
        
        const updatedData = {
          raisonSociale: formData.raisonSociale,
          type: formData.type || null,
          source: formData.source || null,
          email: formData.email || null,
          telephone1: formData.telephone1 || null,
          telephone2: formData.telephone2 || null,
          fax: formData.fax || null,
          siteWeb: formData.siteWeb || null,
          adresse: formData.adresse || null,
          suiteAdresse: formData.suiteAdresse || null,
          codePostal: formData.codePostal || null,
          ville: formData.ville || null,
          departement: formData.departement || null,
          region: formData.region || null,
          pays: formData.pays || 'France',
          notes: formData.notes || null
        };
        
        // Mettre à jour via le service relationnel
        const updateResult = await structuresService.updateStructure(initialData.id, updatedData, currentUser?.uid);
        
        if (!updateResult.success) {
          throw new Error(updateResult.error || 'Erreur lors de la mise à jour');
        }
        
        console.log('✅ [StructureCreationModal] Structure mise à jour avec succès');
        
        // Callback pour notifier la mise à jour
        if (onCreated) {
          onCreated({
            id: initialData.id,
            ...updatedData
          });
        }
      } else {
        // Mode création - créer une nouvelle structure dans la collection 'structures'
        const structureData = {
          raisonSociale: formData.raisonSociale,
          type: formData.type || null,
          source: formData.source || null,
          email: formData.email || null,
          telephone1: formData.telephone1 || null,
          telephone2: formData.telephone2 || null,
          fax: formData.fax || null,
          siteWeb: formData.siteWeb || null,
          adresse: formData.adresse || null,
          suiteAdresse: formData.suiteAdresse || null,
          codePostal: formData.codePostal || null,
          ville: formData.ville || null,
          departement: formData.departement || null,
          region: formData.region || null,
          pays: formData.pays || 'France',
          tags: [],
          notes: formData.notes || null,
          isClient: false // Par défaut, pas client
        };

        console.log('🆕 [StructureCreationModal] Création nouvelle structure:', structureData);
        
        const result = await structuresService.createStructure(structureData, currentOrganization.id, currentUser?.uid);
        
        if (!result.success) {
          throw new Error(result.error || 'Erreur lors de la création');
        }
        
        console.log('✅ [StructureCreationModal] Structure créée avec ID:', result.id);
        
        // Callback pour notifier la création
        if (onCreated) {
          onCreated({
            id: result.id,
            ...structureData
          });
        }
      }

      // En mode création, réinitialiser le formulaire
      if (!editMode) {
        setFormData({
          raisonSociale: '',
          type: '',
          source: '',
          adresse: '',
          suiteAdresse: '',
          codePostal: '',
          ville: '',
          departement: '',
          region: '',
          pays: 'France',
          email: '',
          telephone1: '',
          telephone2: '',
          fax: '',
          siteWeb: '',
          notes: ''
        });
      }

      // Fermer la modal
      onHide();

    } catch (error) {
      console.error(`❌ [StructureCreationModal] Erreur lors de ${editMode ? 'la mise à jour' : 'la création'} de la structure:`, error);
      alert(`Erreur lors de ${editMode ? 'la mise à jour' : 'la création'} de la structure: ${error.message}`);
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
        <div className="col-md-6 mb-3">
          <Form.Label>Email principal</Form.Label>
          <Form.Control
            type="email"
            placeholder="email@structure.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>
        
        <div className="col-md-6 mb-3">
          <Form.Label>Site web</Form.Label>
          <Form.Control
            type="url"
            placeholder="https://www.structure.com"
            value={formData.siteWeb}
            onChange={(e) => handleInputChange('siteWeb', e.target.value)}
          />
        </div>
        
        <div className="col-md-4 mb-3">
          <Form.Label>Téléphone principal</Form.Label>
          <Form.Control
            type="tel"
            placeholder="01 23 45 67 89"
            value={formData.telephone1}
            onChange={(e) => handleInputChange('telephone1', e.target.value)}
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
          <Form.Label>Fax</Form.Label>
          <Form.Control
            type="tel"
            placeholder="01 23 45 67 89"
            value={formData.fax}
            onChange={(e) => handleInputChange('fax', e.target.value)}
          />
        </div>
        
        <div className="col-12 mb-3">
          <Form.Label>Notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Notes sur cette structure..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  /* const renderAdministratifTab = () => (
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
  ); */

  /* const renderReseauxSociauxTab = () => (
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
  ); */

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className={`bi ${editMode ? 'bi-building-gear' : 'bi-building-add'} me-2`}></i>
          {editMode ? 'Modifier la Structure' : 'Nouvelle Structure'}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Champs principaux */}
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <Form.Label>Nom de la structure *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Raison sociale de la structure"
                value={formData.raisonSociale}
                onChange={(e) => handleInputChange('raisonSociale', e.target.value)}
                required
              />
            </div>
            
            <div className="col-md-3 mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="">Sélectionner...</option>
                <option value="Salle">Salle</option>
                <option value="Festival">Festival</option>
                <option value="Association">Association</option>
                <option value="Théâtre">Théâtre</option>
                <option value="Centre culturel">Centre culturel</option>
                <option value="Producteur">Producteur</option>
                <option value="Label">Label</option>
                <option value="Autre">Autre</option>
              </Form.Select>
            </div>
            
            <div className="col-md-3 mb-3">
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
                  Contact
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
                {editMode ? 'Mettre à jour' : 'Créer la structure'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default StructureCreationModal;