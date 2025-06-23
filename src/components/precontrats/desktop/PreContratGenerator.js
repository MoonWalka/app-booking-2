import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert, Modal, Spinner } from 'react-bootstrap';
import { collection, query, where, getDocs } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import RepresentationsSection from '@/components/common/RepresentationsSection';
import preContratService from '@/services/preContratService';
import styles from './PreContratGenerator.module.css';
import '@styles/index.css';

const PreContratGenerator = ({ concert, contact, artiste, lieu, structure }) => {
  const { currentOrg } = useOrganization();
  // État pour l'onglet actif du panneau latéral
  const [activeTab, setActiveTab] = useState('dossier');
  
  const [formData, setFormData] = useState({
    // Structure
    raisonSociale: '',
    suiteAdresse: '',
    adresse: '',
    ville: '',
    cp: '',
    pays: 'France',
    region: '',
    departement: '',
    tel: '',
    fax: '',
    mobilePro: '',
    email: '',
    nomSignataire: '',
    qualiteSignataire: '',
    nomResponsableAdmin: '',
    nomResponsableAdminId: '', // ID du responsable sélectionné
    emailPro: '',
    telPro: '',
    siret: '',
    numeroLicence: '',
    codeActivite: '',
    numeroTvaIntracommunautaire: '',
    numeroTvaInternational: '',
    site: '',
    
    // Projet
    artistes: [],
    projet: '',
    festival: '',
    prixPlaces: '',
    
    // Représentations
    debut: '',
    fin: '',
    representation: '',
    invitations: '',
    nbAdmins: '',
    salle: '',
    horaireDebut: '',
    horaireFin: '',
    payant: false,
    nbRepresentations: '',
    capacite: '',
    type: '',
    
    // Négociation
    montantHT: '',
    frais: '',
    devise: 'EUR',
    precisionsNegoc: '',
    acompte: '',
    contratPropose: '',
    moyenPaiement: '',
    
    // Régie
    responsableRegie: '',
    mobileProRegie: '',
    telProRegie: '',
    emailProRegie: '',
    horaires: '',
    autresArtistes: '',
    
    // Promo
    responsablePromo: '',
    mobileProPromo: '',
    telProPromo: '',
    emailProPromo: '',
    adresseEnvoiPromo: '',
    demandePromo: '',
    
    // Autres infos
    receptif: '',
    divers: '',
    
    // Destinataires
    destinataires: []
  });

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [responsablesAdmin, setResponsablesAdmin] = useState([]);
  const [loadingResponsables, setLoadingResponsables] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [preContratId, setPreContratId] = useState(null);
  const [preContratToken, setPreContratToken] = useState(null);

  // Charger le token si on a déjà un preContratId
  useEffect(() => {
    const loadPreContratToken = async () => {
      if (preContratId && !preContratToken) {
        try {
          const preContrat = await preContratService.getPreContratById(preContratId);
          if (preContrat && preContrat.token) {
            setPreContratToken(preContrat.token);
          }
        } catch (error) {
          console.error('[PreContratGenerator] Erreur chargement token:', error);
        }
      }
    };
    
    loadPreContratToken();
  }, [preContratId, preContratToken]);

  // Initialiser les données depuis les props
  useEffect(() => {
    console.log('[PreContratGenerator] Structure reçue:', structure);
    
    if (structure) {
      console.log('[PreContratGenerator] Champs structure:', {
        raisonSociale: structure.raisonSociale,
        nom: structure.nom,
        structureRaisonSociale: structure.structureRaisonSociale
      });
      
      setFormData(prev => ({
        ...prev,
        raisonSociale: structure.raisonSociale || '',
        adresse: structure.adresse || '',
        suiteAdresse: structure.suiteAdresse || '',
        ville: structure.ville || '',
        cp: structure.codePostal || '',
        pays: structure.pays || 'France',
        region: structure.region || '',
        departement: structure.departement || '',
        tel: structure.telephone || structure.telephone1 || '',
        fax: structure.fax || '',
        mobilePro: structure.mobile || '',
        email: structure.email || '',
        siret: structure.siret || '',
        site: structure.siteWeb || ''
      }));
    }

    if (artiste) {
      setFormData(prev => ({
        ...prev,
        artistes: [artiste.nom || '']
      }));
    }

    if (concert) {
      setFormData(prev => ({
        ...prev,
        projet: concert.propositionArtistique || '',
        debut: concert.dateDebut || '',
        fin: concert.dateFin || '',
        montantHT: concert.montant || '',
        salle: lieu?.nom || concert.lieuNom || ''
      }));
    }
  }, [structure, artiste, concert, lieu]);

  // Charger les responsables d'administration liés à la structure
  useEffect(() => {
    const loadResponsablesAdmin = async () => {
      if (!structure?.id || !currentOrg?.id) return;

      try {
        setLoadingResponsables(true);
        console.log('[PreContrat] Chargement responsables admin pour structure:', structure.id);
        
        // Rechercher dans contacts_unified pour cette structure
        const contactsRef = collection(db, 'contacts_unified');
        const q = query(
          contactsRef,
          where('organizationId', '==', currentOrg.id)
        );
        
        const querySnapshot = await getDocs(q);
        const responsables = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Si c'est une structure avec des personnes
          if (data.entityType === 'structure' && data.personnes && Array.isArray(data.personnes)) {
            // Vérifier si c'est la bonne structure
            if (doc.id === structure.id || data.structure?.id === structure.id || 
                data.structure?.raisonSociale === structure.nom ||
                data.structure?.raisonSociale === structure.structureRaisonSociale) {
              
              data.personnes.forEach((personne, index) => {
                responsables.push({
                  id: `${doc.id}_${index}`,
                  nom: `${personne.prenom || ''} ${personne.nom || ''}`.trim(),
                  fonction: personne.fonction || '',
                  email: personne.email || personne.mailDirect || '',
                  telephone: personne.telephone || personne.telDirect || '',
                  structureId: doc.id,
                  personneIndex: index
                });
              });
            }
          }
          
          // Si c'est une personne libre liée à cette structure
          if (data.entityType === 'personne_libre' && data.structureId === structure.id) {
            const personne = data.personne;
            responsables.push({
              id: doc.id,
              nom: `${personne.prenom || ''} ${personne.nom || ''}`.trim(),
              fonction: personne.fonction || '',
              email: personne.email || '',
              telephone: personne.telephone || '',
              structureId: structure.id,
              isPersonneLibre: true
            });
          }
        });
        
        console.log('[PreContrat] Responsables trouvés:', responsables);
        setResponsablesAdmin(responsables);
        
      } catch (error) {
        console.error('[PreContrat] Erreur lors du chargement des responsables:', error);
      } finally {
        setLoadingResponsables(false);
      }
    };

    loadResponsablesAdmin();
  }, [structure, currentOrg]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (!currentOrg?.id) {
        throw new Error('Organisation non définie');
      }

      // Créer ou mettre à jour le pré-contrat
      if (preContratId) {
        // Mise à jour
        await preContratService.updatePreContrat(preContratId, formData);
        setAlertType('success');
        setAlertMessage('Pré-contrat mis à jour avec succès');
      } else {
        // Création
        const result = await preContratService.createPreContrat(
          formData,
          concert.id,
          currentOrg.id
        );
        setPreContratId(result.id);
        setPreContratToken(result.token);
        setAlertType('success');
        setAlertMessage('Pré-contrat enregistré avec succès');
      }
      
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('[PreContratGenerator] Erreur sauvegarde:', error);
      setAlertType('danger');
      setAlertMessage('Erreur lors de l\'enregistrement: ' + error.message);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  const handleSend = async () => {
    // Vérifier qu'on a des destinataires
    if (!formData.destinataires || formData.destinataires.length === 0) {
      setAlertType('warning');
      setAlertMessage('Veuillez ajouter au moins un destinataire');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    // Afficher la modale de confirmation
    setShowConfirmModal(true);
  };

  const confirmSend = async () => {
    setShowConfirmModal(false);
    setIsSending(true);
    
    try {
      if (!currentOrg?.id) {
        throw new Error('Organisation non définie');
      }

      // Sauvegarder d'abord si pas encore fait
      let currentPreContratId = preContratId;
      if (!currentPreContratId) {
        const result = await preContratService.createPreContrat(
          formData,
          concert.id,
          currentOrg.id
        );
        currentPreContratId = result.id;
        setPreContratId(result.id);
        setPreContratToken(result.token);
      }

      // Envoyer le pré-contrat
      const sendResult = await preContratService.sendPreContrat(
        currentPreContratId,
        formData.destinataires
      );

      if (sendResult.success) {
        setAlertType('success');
        setAlertMessage(
          `Pré-contrat envoyé avec succès à ${sendResult.successCount} destinataire(s)`
        );
        
        // Afficher les erreurs s'il y en a
        if (sendResult.errorCount > 0) {
          const failedEmails = sendResult.results
            .filter(r => !r.success)
            .map(r => r.email)
            .join(', ');
          setAlertMessage(prev => 
            `${prev}\nÉchec pour: ${failedEmails}`
          );
        }
      } else {
        throw new Error('Aucun email envoyé avec succès');
      }

      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);

    } catch (error) {
      console.error('[PreContratGenerator] Erreur envoi:', error);
      setAlertType('danger');
      setAlertMessage('Erreur lors de l\'envoi: ' + error.message);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={styles.preContratContainer}>
      {showAlert && (
        <Alert variant={alertType} className="mb-3">
          {alertMessage}
        </Alert>
      )}

      <div className={styles.contentWrapper}>
        {/* Contenu principal */}
        <div className={styles.mainContent}>
          <div className={styles.headerSection}>
            <h2 className="mb-4">Génération de pré-contrat</h2>
            {preContratId && preContratToken && (
              <div className={styles.publicLinkContainer}>
                <i className="bi bi-link-45deg"></i>
                <a 
                  href={`${window.location.origin}/pre-contrat/${concert?.id}/${preContratToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.publicLink}
                >
                  Lien du formulaire public
                </a>
                <button
                  type="button"
                  className={styles.copyButton}
                  onClick={() => {
                    const link = `${window.location.origin}/pre-contrat/${concert?.id}/${preContratToken}`;
                    navigator.clipboard.writeText(link);
                    setAlertType('success');
                    setAlertMessage('Lien copié dans le presse-papier');
                    setShowAlert(true);
                    setTimeout(() => setShowAlert(false), 3000);
                  }}
                  title="Copier le lien"
                >
                  <i className="bi bi-clipboard"></i>
                </button>
              </div>
            )}
          </div>

          {/* Section Structure */}
          <Card className="mb-4">
            <Card.Header>
              <h4>Structure</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={1} className={styles.labelColumn}>
                  <div className={styles.labelItem}>Raison sociale :</div>
                  <div className={styles.labelItem}>Suite adresse :</div>
                  <div className={styles.labelItem}>Ville :</div>
                  <div className={styles.labelItem}>Région :</div>
                  <div className={styles.labelItem}>Tél :</div>
                  <div className={styles.labelItem}>Email :</div>
                  <div className={styles.labelItem}>Qualité du signataire :</div>
                  <div className={styles.labelItem}>Nom responsable admin :</div>
                  <div className={styles.labelItem}>Email pro :</div>
                  <div className={styles.labelItem}>Code d'activité :</div>
                  <div className={styles.labelItem}>N° TVA international :</div>
                </Col>
                <Col md={5} className={styles.fieldColumn}>
                  <Form.Control
                    type="text"
                    value={formData.raisonSociale}
                    onChange={(e) => handleInputChange('raisonSociale', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={formData.suiteAdresse}
                    onChange={(e) => handleInputChange('suiteAdresse', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={formData.ville}
                    onChange={(e) => handleInputChange('ville', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                  />
                  <Form.Control
                    type="tel"
                    value={formData.tel}
                    onChange={(e) => handleInputChange('tel', e.target.value)}
                  />
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                  <Form.Select
                    value={formData.qualiteSignataire}
                    onChange={(e) => handleInputChange('qualiteSignataire', e.target.value)}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Directeur">Directeur</option>
                    <option value="Gérant">Gérant</option>
                    <option value="Président">Président</option>
                    <option value="Autre">Autre</option>
                  </Form.Select>
                  <Form.Select
                    value={formData.nomResponsableAdminId}
                    disabled={loadingResponsables}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selectedResponsable = responsablesAdmin.find(r => r.id === selectedId);
                      
                      if (selectedResponsable) {
                        handleInputChange('nomResponsableAdminId', selectedId);
                        handleInputChange('nomResponsableAdmin', selectedResponsable.nom);
                        handleInputChange('emailPro', selectedResponsable.email);
                        handleInputChange('telPro', selectedResponsable.telephone);
                      } else {
                        handleInputChange('nomResponsableAdminId', '');
                        handleInputChange('nomResponsableAdmin', '');
                        handleInputChange('emailPro', '');
                        handleInputChange('telPro', '');
                      }
                    }}
                  >
                    <option value="">
                      {loadingResponsables ? 'Chargement...' : 
                       responsablesAdmin.length === 0 ? 'Aucun responsable trouvé' : 
                       'Sélectionner un responsable...'}
                    </option>
                    {responsablesAdmin.map((responsable) => (
                      <option key={responsable.id} value={responsable.id}>
                        {responsable.nom} {responsable.fonction && `(${responsable.fonction})`}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control
                    type="email"
                    value={formData.emailPro}
                    onChange={(e) => handleInputChange('emailPro', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={formData.codeActivite}
                    onChange={(e) => handleInputChange('codeActivite', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={formData.numeroTvaInternational}
                    onChange={(e) => handleInputChange('numeroTvaInternational', e.target.value)}
                  />
                </Col>
                <Col md={1} className={styles.labelColumn}>
                  <div className={styles.labelItem}>Adresse :</div>
                  <div className={styles.labelItem}>CP :</div>
                  <div className={styles.labelItem}>Pays :</div>
                  <div className={styles.labelItem}>Département :</div>
                  <div className={styles.labelItem}>Fax :</div>
                  <div className={styles.labelItem}>Nom du signataire :</div>
                  <div className={styles.labelItem}>Tel pro :</div>
                  <div className={styles.labelItem}>Mobile pro :</div>
                  <div className={styles.labelItem}>Siret :</div>
                  <div className={styles.labelItem}>N° de licence :</div>
                  <div className={styles.labelItem}>N° TVA intracommunautaire :</div>
                  <div className={styles.labelItem}>Site :</div>
                </Col>
                <Col md={5} className={styles.fieldColumn}>
                  <Form.Control
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => handleInputChange('adresse', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={formData.cp}
                    onChange={(e) => handleInputChange('cp', e.target.value)}
                  />
                  <Form.Select
                    value={formData.pays}
                    onChange={(e) => handleInputChange('pays', e.target.value)}
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Autre">Autre</option>
                  </Form.Select>
                  <Form.Control
                    type="text"
                    value={formData.departement}
                    onChange={(e) => handleInputChange('departement', e.target.value)}
                  />
                  <Form.Control
                    type="tel"
                    value={formData.fax}
                    onChange={(e) => handleInputChange('fax', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={formData.nomSignataire}
                    onChange={(e) => handleInputChange('nomSignataire', e.target.value)}
                  />
                  <Form.Control
                    type="tel"
                    value={formData.telPro}
                    onChange={(e) => handleInputChange('telPro', e.target.value)}
                  />
                  <Form.Control
                    type="tel"
                    value={formData.mobilePro}
                    onChange={(e) => handleInputChange('mobilePro', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={formData.siret}
                    onChange={(e) => handleInputChange('siret', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={formData.numeroLicence}
                    onChange={(e) => handleInputChange('numeroLicence', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={formData.numeroTvaIntracommunautaire}
                    onChange={(e) => handleInputChange('numeroTvaIntracommunautaire', e.target.value)}
                  />
                  <Form.Control
                    type="url"
                    value={formData.site}
                    onChange={(e) => handleInputChange('site', e.target.value)}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Section Projet */}
          <Card className="mb-4">
            <Card.Header>
              <h4>Projet</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={1} className={styles.labelColumn}>
                  <div className={styles.labelItem}>Artiste(s) :</div>
                  <div className={styles.labelItem}>Festival / Evénement :</div>
                  <div className={styles.labelItem}>Prix des places :</div>
                </Col>
                <Col md={5} className={styles.fieldColumn}>
                  <Form.Control
                    type="text"
                    value={formData.artistes.join(', ')}
                    onChange={(e) => handleInputChange('artistes', e.target.value.split(', '))}
                    placeholder="Séparer par des virgules"
                  />
                  <Form.Control
                    type="text"
                    value={formData.festival}
                    onChange={(e) => handleInputChange('festival', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={formData.prixPlaces}
                    onChange={(e) => handleInputChange('prixPlaces', e.target.value)}
                  />
                </Col>
                <Col md={1} className={styles.labelColumn}>
                  <div className={styles.labelItem}>Projet :</div>
                </Col>
                <Col md={5} className={styles.fieldColumn}>
                  <Form.Control
                    type="text"
                    value={formData.projet}
                    onChange={(e) => handleInputChange('projet', e.target.value)}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Section Représentations */}
          <Card className="mb-4">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h4>Représentations</h4>
                <Button variant="outline-primary" size="sm">
                  Gérer les salles utilisées par l'organisateur
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <RepresentationsSection
                data={{
                  debut: formData.debut,
                  fin: formData.fin,
                  representation: formData.representation,
                  invitations: formData.invitations,
                  nbAdmins: formData.nbAdmins,
                  salle: formData.salle,
                  horaireDebut: formData.horaireDebut,
                  horaireFin: formData.horaireFin,
                  payant: formData.payant,
                  nbRepresentations: formData.nbRepresentations,
                  capacite: formData.capacite,
                  type: formData.type
                }}
                onChange={(field, value) => {
                  handleInputChange(field, value);
                }}
                readOnly={false}
              />
            </Card.Body>
          </Card>

          {/* Section Négociation */}
          <Card className="mb-4">
            <Card.Header>
              <h4>Négociation</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={1} className={styles.labelColumn}>
                  <div className={styles.labelItem}>Montant HT :</div>
                  <div className={styles.labelItem}>Frais :</div>
                  <div className={styles.labelItem}>Devise :</div>
                  <div className={styles.labelItem}>Précisions négoc :</div>
                </Col>
                <Col md={5} className={styles.fieldColumn}>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.montantHT}
                    onChange={(e) => handleInputChange('montantHT', e.target.value)}
                  />
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.frais}
                    onChange={(e) => handleInputChange('frais', e.target.value)}
                  />
                  <Form.Select
                    value={formData.devise}
                    onChange={(e) => handleInputChange('devise', e.target.value)}
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </Form.Select>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.precisionsNegoc}
                    onChange={(e) => handleInputChange('precisionsNegoc', e.target.value)}
                  />
                </Col>
                <Col md={1} className={styles.labelColumn}>
                  <div className={styles.labelItem}>Acompte :</div>
                  <div className={styles.labelItem}>Contrat proposé :</div>
                  <div className={styles.labelItem}>Moyen de paiement :</div>
                </Col>
                <Col md={5} className={styles.fieldColumn}>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.acompte}
                    onChange={(e) => handleInputChange('acompte', e.target.value)}
                  />
                  <Form.Select
                    value={formData.contratPropose}
                    onChange={(e) => handleInputChange('contratPropose', e.target.value)}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Personnalisé">Personnalisé</option>
                  </Form.Select>
                  <Form.Select
                    value={formData.moyenPaiement}
                    onChange={(e) => handleInputChange('moyenPaiement', e.target.value)}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Virement">Virement</option>
                    <option value="Chèque">Chèque</option>
                    <option value="Espèces">Espèces</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Section Régie */}
          <Card className="mb-4">
            <Card.Header>
              <h4>Régie</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={1} className={styles.labelColumn}>
                  <div className={styles.labelItem}>Responsable :</div>
                  <div className={styles.labelItem}>Mobile pro :</div>
                  <div className={styles.labelItem}>Autres artistes :</div>
                </Col>
                <Col md={5} className={styles.fieldColumn}>
                  <Form.Control
                    type="text"
                    value={formData.responsableRegie}
                    onChange={(e) => handleInputChange('responsableRegie', e.target.value)}
                  />
                  <Form.Control
                    type="tel"
                    value={formData.mobileProRegie}
                    onChange={(e) => handleInputChange('mobileProRegie', e.target.value)}
                  />
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.autresArtistes}
                    onChange={(e) => handleInputChange('autresArtistes', e.target.value)}
                  />
                </Col>
                <Col md={1} className={styles.labelColumn}>
                  <div className={styles.labelItem}>Tel pro :</div>
                  <div className={styles.labelItem}>Email pro :</div>
                  <div className={styles.labelItem}>Horaires :</div>
                </Col>
                <Col md={5} className={styles.fieldColumn}>
                  <Form.Control
                    type="tel"
                    value={formData.telProRegie}
                    onChange={(e) => handleInputChange('telProRegie', e.target.value)}
                  />
                  <Form.Control
                    type="email"
                    value={formData.emailProRegie}
                    onChange={(e) => handleInputChange('emailProRegie', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={formData.horaires}
                    onChange={(e) => handleInputChange('horaires', e.target.value)}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Section Promo */}
          <Card className="mb-4">
            <Card.Header>
              <h4>Promo</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={1} className={styles.labelColumn}>
                  <div className={styles.labelItem}>Responsable :</div>
                  <div className={styles.labelItem}>Mobile pro :</div>
                  <div className={styles.labelItem}>Demande promo :</div>
                </Col>
                <Col md={5} className={styles.fieldColumn}>
                  <Form.Control
                    type="text"
                    value={formData.responsablePromo}
                    onChange={(e) => handleInputChange('responsablePromo', e.target.value)}
                  />
                  <Form.Control
                    type="tel"
                    value={formData.mobileProPromo}
                    onChange={(e) => handleInputChange('mobileProPromo', e.target.value)}
                  />
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.demandePromo}
                    onChange={(e) => handleInputChange('demandePromo', e.target.value)}
                  />
                </Col>
                <Col md={1} className={styles.labelColumn}>
                  <div className={styles.labelItem}>Tel pro :</div>
                  <div className={styles.labelItem}>Email pro :</div>
                  <div className={styles.labelItem}>Adresse envoi promo :</div>
                </Col>
                <Col md={5} className={styles.fieldColumn}>
                  <Form.Control
                    type="tel"
                    value={formData.telProPromo}
                    onChange={(e) => handleInputChange('telProPromo', e.target.value)}
                  />
                  <Form.Control
                    type="email"
                    value={formData.emailProPromo}
                    onChange={(e) => handleInputChange('emailProPromo', e.target.value)}
                  />
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.adresseEnvoiPromo}
                    onChange={(e) => handleInputChange('adresseEnvoiPromo', e.target.value)}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Section Autres infos */}
          <Card className="mb-4">
            <Card.Header>
              <h4>Autres infos</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={1} className={styles.labelColumn}>
                  <div className={styles.labelItem}>Réceptif :</div>
                </Col>
                <Col md={5} className={styles.fieldColumn}>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={formData.receptif}
                    onChange={(e) => handleInputChange('receptif', e.target.value)}
                  />
                </Col>
                <Col md={1} className={styles.labelColumn}>
                  <div className={styles.labelItem}>Divers :</div>
                </Col>
                <Col md={5} className={styles.fieldColumn}>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={formData.divers}
                    onChange={(e) => handleInputChange('divers', e.target.value)}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Section Destinataires */}
          <Card className="mb-4">
            <Card.Header>
              <h4>Destinataires pour la confirmation</h4>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-3">
                Sélectionnez les personnes qui recevront le pré-contrat pour validation.
              </p>
              <Row>
                <Col md={1} className={styles.labelColumn}>
                  <div className={styles.labelItem}>Adresses email :</div>
                </Col>
                <Col md={11} className={styles.fieldColumn}>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Séparer les adresses par des virgules"
                    value={formData.destinataires.join(', ')}
                    onChange={(e) => handleInputChange('destinataires', e.target.value.split(', '))}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>

        {/* Panneau latéral droit */}
        <div className={styles.sidePanel}>
          <Card>
            {/* Onglets */}
            <div className={styles.sidePanelTabs}>
              <button
                className={`${styles.sidePanelTab} ${activeTab === 'dossier' ? styles.active : ''}`}
                onClick={() => setActiveTab('dossier')}
              >
                Dossier
              </button>
              <button
                className={`${styles.sidePanelTab} ${activeTab === 'devis' ? styles.active : ''}`}
                onClick={() => setActiveTab('devis')}
              >
                Devis
              </button>
            </div>
            
            {/* Contenu des onglets */}
            <Card.Body>
              {/* Section Dossier */}
              {activeTab === 'dossier' && (
                <>
                  <h6>{concert?.titre || 'Sans titre'}</h6>
                  <Form.Control
                    type="text"
                    placeholder="Recherche"
                    className="mb-3"
                    size="sm"
                  />
                  <p className="text-muted small">Notifications</p>
                  <Button variant="outline-primary" size="sm" className="mb-3">
                    + Ajouter un commentaire
                  </Button>
                  <p className="text-muted small">
                    Cliquez sur le bouton + pour créer votre 1er commentaire
                  </p>
                </>
              )}

              {/* Section Devis */}
              {activeTab === 'devis' && (
                <>
                  <div className="mb-3">
                    <h6>Général</h6>
                    <p className="small mb-1"><strong>Artiste(s):</strong> {formData.artistes.join(', ')}</p>
                    <p className="small mb-1"><strong>Projet:</strong> {formData.projet}</p>
                    <p className="small mb-1"><strong>Début:</strong> {formData.debut}</p>
                    <p className="small mb-1"><strong>Fin:</strong> {formData.fin}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h6>Structure</h6>
                    <p className="small mb-1"><strong>Nom:</strong> {formData.raisonSociale}</p>
                    <p className="small mb-1"><strong>Destinataire:</strong> {formData.nomSignataire}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h6>Entreprise</h6>
                    <p className="small mb-1"><strong>Nom:</strong> {formData.raisonSociale}</p>
                    <p className="small mb-1"><strong>Collaborateur:</strong> {formData.nomResponsableAdmin}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h6>Négociation</h6>
                    <p className="small mb-1"><strong>Montant:</strong> {formData.montantHT} {formData.devise}</p>
                    <p className="small mb-1"><strong>Conditions de paiement:</strong> {formData.precisionsNegoc}</p>
                    <p className="small mb-1"><strong>Modalités de paiement:</strong> {formData.moyenPaiement}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h6>Conditions financières</h6>
                    <p className="small mb-1"><strong>Presta:</strong> {formData.montantHT} {formData.devise}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h6>Règlement devis</h6>
                    <p className="small mb-1"><strong>Solde et mode de règlement:</strong> {formData.moyenPaiement}</p>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Boutons d'action fixes en bas */}
      <div className={styles.fixedActions}>
        <Button 
          variant="success" 
          size="lg"
          onClick={handleSend}
          className="me-3"
          disabled={isSending}
        >
          {isSending ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Envoi en cours...
            </>
          ) : (
            'Envoyer le pré-contrat'
          )}
        </Button>
        <Button 
          variant="primary" 
          size="lg"
          onClick={handleSave}
          disabled={isSending}
        >
          {preContratId ? 'Mettre à jour' : 'Enregistrer'} le pré-contrat
        </Button>
      </div>

      {/* Modal de confirmation d'envoi */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer l'envoi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Vous êtes sur le point d'envoyer le pré-contrat aux destinataires suivants :</p>
          <ul>
            {formData.destinataires.map((email, index) => (
              <li key={index}>{email}</li>
            ))}
          </ul>
          <p className="mb-0">
            <strong>Concert :</strong> {concert?.titre || concert?.nom || 'Sans titre'}
          </p>
          <p className="mb-0">
            <strong>Structure :</strong> {formData.raisonSociale || 'Non renseignée'}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={confirmSend}>
            Confirmer l'envoi
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PreContratGenerator;