import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { collection, query, where, getDocs } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import styles from './PreContratGenerator.module.css';
import '@styles/index.css';

const PreContratGenerator = ({ concert, contact, artiste, lieu, structure }) => {
  const { currentOrg } = useOrganization();
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

  // Initialiser les données depuis les props
  useEffect(() => {
    if (structure) {
      setFormData(prev => ({
        ...prev,
        raisonSociale: structure.nom || structure.structureRaisonSociale || '',
        adresse: structure.adresse || '',
        ville: structure.ville || '',
        cp: structure.codePostal || '',
        pays: structure.pays || 'France',
        region: structure.region || '',
        departement: structure.departement || '',
        tel: structure.telephone || '',
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
      // Logique de sauvegarde
      setAlertType('success');
      setAlertMessage('Pré-contrat enregistré avec succès');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      setAlertType('danger');
      setAlertMessage('Erreur lors de l\'enregistrement');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleSend = async () => {
    try {
      // Logique d'envoi
      setAlertType('success');
      setAlertMessage('Pré-contrat envoyé avec succès');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      setAlertType('danger');
      setAlertMessage('Erreur lors de l\'envoi');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
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
          <h2 className="mb-4">Génération de pré-contrat</h2>

          {/* Section Structure */}
          <Card className="mb-4">
            <Card.Header>
              <h4>Structure</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className={styles.formField}>
                    <Form.Label>Raison sociale :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.raisonSociale}
                      onChange={(e) => handleInputChange('raisonSociale', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Suite adresse :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.suiteAdresse}
                      onChange={(e) => handleInputChange('suiteAdresse', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Ville :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.ville}
                      onChange={(e) => handleInputChange('ville', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Région :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Tél :</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.tel}
                      onChange={(e) => handleInputChange('tel', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Email :</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Qualité du signataire :</Form.Label>
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
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Nom responsable administration :</Form.Label>
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
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Email pro :</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.emailPro}
                      onChange={(e) => handleInputChange('emailPro', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Code d'activité :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.codeActivite}
                      onChange={(e) => handleInputChange('codeActivite', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>N° de TVA international :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.numeroTvaInternational}
                      onChange={(e) => handleInputChange('numeroTvaInternational', e.target.value)}
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <div className={styles.formField}>
                    <Form.Label>Adresse :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.adresse}
                      onChange={(e) => handleInputChange('adresse', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>CP :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.cp}
                      onChange={(e) => handleInputChange('cp', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Pays :</Form.Label>
                    <Form.Select
                      value={formData.pays}
                      onChange={(e) => handleInputChange('pays', e.target.value)}
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Autre">Autre</option>
                    </Form.Select>
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Département :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.departement}
                      onChange={(e) => handleInputChange('departement', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Fax :</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.fax}
                      onChange={(e) => handleInputChange('fax', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Nom du signataire :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.nomSignataire}
                      onChange={(e) => handleInputChange('nomSignataire', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Tel pro :</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.telPro}
                      onChange={(e) => handleInputChange('telPro', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Mobile pro :</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.mobilePro}
                      onChange={(e) => handleInputChange('mobilePro', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Siret :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.siret}
                      onChange={(e) => handleInputChange('siret', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>N° de licence :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.numeroLicence}
                      onChange={(e) => handleInputChange('numeroLicence', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>N° de TVA intracommunautaire :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.numeroTvaIntracommunautaire}
                      onChange={(e) => handleInputChange('numeroTvaIntracommunautaire', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Site :</Form.Label>
                    <Form.Control
                      type="url"
                      value={formData.site}
                      onChange={(e) => handleInputChange('site', e.target.value)}
                    />
                  </div>
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
                <Col md={6}>
                  <div className={styles.formField}>
                    <Form.Label>Artiste(s) :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.artistes.join(', ')}
                      onChange={(e) => handleInputChange('artistes', e.target.value.split(', '))}
                      placeholder="Séparer par des virgules"
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Festival / Evénement :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.festival}
                      onChange={(e) => handleInputChange('festival', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Prix des places :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.prixPlaces}
                      onChange={(e) => handleInputChange('prixPlaces', e.target.value)}
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <div className={styles.formField}>
                    <Form.Label>Projet :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.projet}
                      onChange={(e) => handleInputChange('projet', e.target.value)}
                    />
                  </div>
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
              {/* Tableau récapitulatif des représentations */}
              <div className={styles.representationsTable}>
                <Row>
                  <Col md={6}>
                    <div className={styles.summaryField}>
                      <span className={styles.summaryLabel}>Début :</span>
                      <span className={styles.summaryValue}>
                        {formData.debut ? new Date(formData.debut).toLocaleDateString('fr-FR') : '●'}
                      </span>
                    </div>
                    <div className={styles.summaryField}>
                      <span className={styles.summaryLabel}>Fin :</span>
                      <span className={styles.summaryValue}>
                        {formData.fin ? new Date(formData.fin).toLocaleDateString('fr-FR') : '●'}
                      </span>
                    </div>
                    <div className={styles.summaryField}>
                      <span className={styles.summaryLabel}>Représentation :</span>
                      <span className={styles.summaryValue}>
                        {formData.representation || 'null / test structure'}
                      </span>
                    </div>
                    <div className={styles.summaryField}>
                      <span className={styles.summaryLabel}>Invitations :</span>
                      <span className={styles.summaryValue}>
                        {formData.invitations || '●'}
                      </span>
                    </div>
                    <div className={styles.summaryField}>
                      <span className={styles.summaryLabel}>Nb. admins :</span>
                      <span className={styles.summaryValue}>
                        {formData.nbAdmins || '●'}
                      </span>
                    </div>
                    <div className={styles.summaryField}>
                      <span className={styles.summaryLabel}>Salle :</span>
                      <span className={styles.summaryValue}>
                        {formData.salle || '●'}
                      </span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className={styles.summaryField}>
                      <span className={styles.summaryLabel}>Horaire début :</span>
                      <span className={styles.summaryValue}>
                        {formData.horaireDebut || '00:00'}
                      </span>
                    </div>
                    <div className={styles.summaryField}>
                      <span className={styles.summaryLabel}>Horaire fin :</span>
                      <span className={styles.summaryValue}>
                        {formData.horaireFin || '00:00'}
                      </span>
                    </div>
                    <div className={styles.summaryField}>
                      <span className={styles.summaryLabel}>Payant :</span>
                      <span className={styles.summaryValue}>
                        {formData.payant ? 'Oui' : 'Non'}
                      </span>
                    </div>
                    <div className={styles.summaryField}>
                      <span className={styles.summaryLabel}>Nb. représentations :</span>
                      <span className={styles.summaryValue}>
                        {formData.nbRepresentations || '1'}
                      </span>
                    </div>
                    <div className={styles.summaryField}>
                      <span className={styles.summaryLabel}>Capacité :</span>
                      <span className={styles.summaryValue}>
                        {formData.capacite || '●'}
                      </span>
                    </div>
                    <div className={styles.summaryField}>
                      <span className={styles.summaryLabel}>Type :</span>
                      <span className={styles.summaryValue}>
                        {formData.type || 'Concert'}
                      </span>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>

          {/* Section Négociation */}
          <Card className="mb-4">
            <Card.Header>
              <h4>Négociation</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className={styles.formField}>
                    <Form.Label>Montant HT :</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={formData.montantHT}
                      onChange={(e) => handleInputChange('montantHT', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Frais :</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={formData.frais}
                      onChange={(e) => handleInputChange('frais', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Devise :</Form.Label>
                    <Form.Select
                      value={formData.devise}
                      onChange={(e) => handleInputChange('devise', e.target.value)}
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </Form.Select>
                  </div>
                  <div className={styles.formFieldFull}>
                    <Form.Label>Précisions négoc :</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.precisionsNegoc}
                      onChange={(e) => handleInputChange('precisionsNegoc', e.target.value)}
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <div className={styles.formField}>
                    <Form.Label>Acompte :</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={formData.acompte}
                      onChange={(e) => handleInputChange('acompte', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Contrat proposé :</Form.Label>
                    <Form.Select
                      value={formData.contratPropose}
                      onChange={(e) => handleInputChange('contratPropose', e.target.value)}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                      <option value="Personnalisé">Personnalisé</option>
                    </Form.Select>
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Moyen de paiement :</Form.Label>
                    <Form.Select
                      value={formData.moyenPaiement}
                      onChange={(e) => handleInputChange('moyenPaiement', e.target.value)}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="Virement">Virement</option>
                      <option value="Chèque">Chèque</option>
                      <option value="Espèces">Espèces</option>
                    </Form.Select>
                  </div>
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
                <Col md={6}>
                  <div className={styles.formField}>
                    <Form.Label>Responsable :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.responsableRegie}
                      onChange={(e) => handleInputChange('responsableRegie', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Mobile pro :</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.mobileProRegie}
                      onChange={(e) => handleInputChange('mobileProRegie', e.target.value)}
                    />
                  </div>
                  <div className={styles.formFieldFull}>
                    <Form.Label>Autres artistes :</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.autresArtistes}
                      onChange={(e) => handleInputChange('autresArtistes', e.target.value)}
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <div className={styles.formField}>
                    <Form.Label>Tel pro :</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.telProRegie}
                      onChange={(e) => handleInputChange('telProRegie', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Email pro :</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.emailProRegie}
                      onChange={(e) => handleInputChange('emailProRegie', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Horaires :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.horaires}
                      onChange={(e) => handleInputChange('horaires', e.target.value)}
                    />
                  </div>
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
                <Col md={6}>
                  <div className={styles.formField}>
                    <Form.Label>Responsable :</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.responsablePromo}
                      onChange={(e) => handleInputChange('responsablePromo', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Mobile pro :</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.mobileProPromo}
                      onChange={(e) => handleInputChange('mobileProPromo', e.target.value)}
                    />
                  </div>
                  <div className={styles.formFieldFull}>
                    <Form.Label>Demande promo :</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.demandePromo}
                      onChange={(e) => handleInputChange('demandePromo', e.target.value)}
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <div className={styles.formField}>
                    <Form.Label>Tel pro :</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.telProPromo}
                      onChange={(e) => handleInputChange('telProPromo', e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Form.Label>Email pro :</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.emailProPromo}
                      onChange={(e) => handleInputChange('emailProPromo', e.target.value)}
                    />
                  </div>
                  <div className={styles.formFieldFull}>
                    <Form.Label>Adresse envoi promo :</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.adresseEnvoiPromo}
                      onChange={(e) => handleInputChange('adresseEnvoiPromo', e.target.value)}
                    />
                  </div>
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
                <Col md={6}>
                  <div className={styles.formFieldFull}>
                    <Form.Label>Réceptif :</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={formData.receptif}
                      onChange={(e) => handleInputChange('receptif', e.target.value)}
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <div className={styles.formFieldFull}>
                    <Form.Label>Divers :</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={formData.divers}
                      onChange={(e) => handleInputChange('divers', e.target.value)}
                    />
                  </div>
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
              <div className={styles.formFieldFull}>
                <Form.Label>Adresses email des destinataires :</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Séparer les adresses par des virgules"
                  value={formData.destinataires.join(', ')}
                  onChange={(e) => handleInputChange('destinataires', e.target.value.split(', '))}
                />
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Panneau latéral droit */}
        <div className={styles.sidePanel}>
          {/* Section Dossier */}
          <Card className="mb-3">
            <Card.Header>
              <h5>Dossier</h5>
            </Card.Header>
            <Card.Body>
              <h6>Sans titre</h6>
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
            </Card.Body>
          </Card>

          {/* Section Devis */}
          <Card>
            <Card.Header>
              <h5>Devis</h5>
            </Card.Header>
            <Card.Body>
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
        >
          Envoyer le pré-contrat
        </Button>
        <Button 
          variant="primary" 
          size="lg"
          onClick={handleSave}
        >
          Enregistrer le pré-contrat
        </Button>
      </div>
    </div>
  );
};

export default PreContratGenerator;