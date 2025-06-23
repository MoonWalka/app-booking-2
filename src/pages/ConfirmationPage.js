import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Container, Row, Col, Form, Button, Accordion, Alert, Spinner } from 'react-bootstrap';
import { getPreContratsByConcert, updatePreContrat } from '@/services/preContratService';
import styles from './ConfirmationPage.module.css';

/**
 * Page de confirmation de pré-contrat
 * Deux colonnes : Mes informations (éditable) | Informations organisateur (lecture seule)
 */
function ConfirmationPage({ concertId: propConcertId }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const concertId = propConcertId || searchParams.get('concertId');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preContrat, setPreContrat] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // État pour les données
  const [mesInfos, setMesInfos] = useState({
    // Structure
    raisonSociale: '',
    adresse: '',
    suiteAdresse: '',
    codePostal: '',
    ville: '',
    pays: 'France',
    tel: '',
    fax: '',
    email: '',
    site: '',
    nomResponsableAdmin: '',
    mobilePro: '',
    telPro: '',
    emailResponsable: '',
    nomSignataire: '',
    qualiteSignataire: '',
    siret: '',
    codeActivite: '',
    numeroLicence: '',
    numeroTvaInternational: '',
    codeTps: '',
    codeTvq: '',
    
    // Projet
    artistes: '',
    projet: '',
    festival: '',
    prixPlaces: '',
    
    // Représentations
    type: 'concert',
    nbRepresentations: 1,
    horaireDebut: '',
    horaireFin: '',
    capacite: '',
    nbAdmin: '',
    invitationsPayant: false,
    salle: '',
    adresseSalle: '',
    suiteAdresseSalle: '',
    codePostalSalle: '',
    villeSalle: '',
    paysSalle: 'France',
    
    // Négociation
    cachetHT: '',
    acompte: '',
    frais: '',
    contratPropose: 'cession',
    devise: 'EUR',
    moyenPaiement: 'virement',
    precisionsNego: '',
    
    // Régie
    nomResponsableRegie: '',
    telephoneRegie: '',
    mobileRegie: '',
    emailRegie: '',
    autresArtistes: '',
    horaires: '',
    
    // Promo
    nomResponsablePromo: '',
    telephonePromo: '',
    mobilePromo: '',
    emailPromo: '',
    demandePromo: '',
    adresseEnvoiPromo: '',
    
    // Autres infos
    receptif: '',
    divers: ''
  });
  
  const [infosOrganisateur, setInfosOrganisateur] = useState({});

  // Charger les données du pré-contrat
  useEffect(() => {
    const loadPreContratData = async () => {
      if (!concertId) {
        setError('Aucun concert spécifié');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Récupérer les pré-contrats du concert
        const preContrats = await getPreContratsByConcert(concertId);
        
        // Prendre le plus récent avec des données du formulaire public
        const preContratAvecDonnees = preContrats
          .filter(pc => pc.publicFormData)
          .sort((a, b) => {
            const dateA = a.lastPublicFormSave?.toDate() || new Date(0);
            const dateB = b.lastPublicFormSave?.toDate() || new Date(0);
            return dateB - dateA;
          })[0];

        if (!preContratAvecDonnees) {
          setError('Aucun pré-contrat avec données publiques trouvé');
          setLoading(false);
          return;
        }

        setPreContrat(preContratAvecDonnees);
        
        // Charger les données dans les deux colonnes
        if (preContratAvecDonnees.publicFormData) {
          // Données de l'organisateur (colonne droite)
          setInfosOrganisateur(preContratAvecDonnees.publicFormData);
        }
        
        // Données existantes (colonne gauche)
        setMesInfos(prev => ({
          ...prev,
          // Structure
          raisonSociale: preContratAvecDonnees.raisonSociale || '',
          adresse: preContratAvecDonnees.adresse || '',
          suiteAdresse: preContratAvecDonnees.suiteAdresse || '',
          codePostal: preContratAvecDonnees.cp || '',
          ville: preContratAvecDonnees.ville || '',
          pays: preContratAvecDonnees.pays || 'France',
          tel: preContratAvecDonnees.tel || '',
          fax: preContratAvecDonnees.fax || '',
          email: preContratAvecDonnees.email || '',
          site: preContratAvecDonnees.site || '',
          siret: preContratAvecDonnees.siret || '',
          // Négociation
          cachetHT: preContratAvecDonnees.montantHT || '',
          acompte: preContratAvecDonnees.acompte || '',
          frais: preContratAvecDonnees.frais || '',
          contratPropose: preContratAvecDonnees.contratPropose || 'cession',
          devise: preContratAvecDonnees.devise || 'EUR',
          moyenPaiement: preContratAvecDonnees.moyenPaiement || 'virement',
          // Ajouter les autres champs selon le mapping
        }));

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setError('Erreur lors du chargement des données');
        setLoading(false);
      }
    };

    loadPreContratData();
  }, [concertId]);

  // Fonction pour copier une valeur de droite à gauche
  const copierValeur = (champ) => {
    setMesInfos(prev => ({
      ...prev,
      [champ]: infosOrganisateur[champ] || ''
    }));
  };

  // Fonction pour copier tous les champs d'une section
  const copierSection = (champs) => {
    const nouveauxChamps = {};
    champs.forEach(champ => {
      nouveauxChamps[champ] = infosOrganisateur[champ] || '';
    });
    setMesInfos(prev => ({
      ...prev,
      ...nouveauxChamps
    }));
  };

  // Fonction pour valider et sauvegarder
  const validerConfirmation = async () => {
    if (!preContrat) return;
    
    try {
      setIsSaving(true);
      
      // Fusionner les données validées avec les données existantes
      const donneesValidees = {
        // Conserver toutes les données existantes
        ...preContrat,
        // Remplacer par les données validées dans "Mes infos"
        ...mesInfos,
        // Marquer comme confirmé
        confirmationValidee: true,
        confirmationDate: new Date(),
        // Supprimer les données du formulaire public après validation
        publicFormData: null
      };
      
      await updatePreContrat(preContrat.id, donneesValidees);
      
      alert('Confirmation validée avec succès !');
      navigate(-1); // Retour à la page précédente
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('Erreur lors de la validation');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Container fluid className={styles.container}>
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-3">Chargement des données du pré-contrat...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className={styles.container}>
        <Alert variant="danger" className="m-3">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className={styles.container}>
      <div className={styles.pageHeader}>
        <h2 className={styles.title}>
          <i className="bi bi-check-circle me-2"></i>
          Confirmation Pré-contrat
        </h2>
        <p className={styles.subtitle}>
          Deux colonnes : Mes informations (éditable) à gauche, Informations de l'organisateur (lecture seule) à droite
        </p>
      </div>

      <Card className={styles.mainCard}>
        <Card.Body>
          <Accordion defaultActiveKey="0" alwaysOpen>
            {/* Section 1: Structure */}
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <h5 className="mb-0">
                  <i className="bi bi-building me-2"></i>
                  1. Structure
                </h5>
              </Accordion.Header>
              <Accordion.Body>
                <div className={styles.sectionHeader}>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => copierSection(['raisonSociale', 'adresse', 'suiteAdresse', 'codePostal', 'ville', 'pays', 'tel', 'fax', 'email', 'site', 'siret', 'codeActivite', 'numeroLicence', 'numeroTvaInternational', 'codeTps', 'codeTvq'])}
                  >
                    <i className="bi bi-arrow-left-circle me-1"></i>
                    Tout copier
                  </Button>
                </div>
                
                <Row className={styles.fieldsRow}>
                  <Col md={2} className={styles.labelCol}>
                    <h6 className={styles.columnTitle}>Champs</h6>
                  </Col>
                  <Col md={4} className={styles.mesInfosCol}>
                    <h6 className={styles.columnTitle}>Mes informations</h6>
                  </Col>
                  <Col md={1} className={styles.arrowCol}></Col>
                  <Col md={5} className={styles.organisateurCol}>
                    <h6 className={styles.columnTitle}>Informations organisateur</h6>
                  </Col>
                </Row>

                {/* Raison sociale */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Raison sociale</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.raisonSociale}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, raisonSociale: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('raisonSociale')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.raisonSociale || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Adresse */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Adresse</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.adresse}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, adresse: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('adresse')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.adresse || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Suite adresse */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Suite adresse</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.suiteAdresse}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, suiteAdresse: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('suiteAdresse')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.suiteAdresse || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Code postal */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Code postal</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.codePostal}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, codePostal: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('codePostal')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.codePostal || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Ville */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Ville</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.ville}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, ville: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('ville')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.ville || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Pays */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Pays</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.pays}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, pays: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('pays')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.pays || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Téléphone */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Téléphone</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.tel}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, tel: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('tel')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.tel || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Fax */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Fax</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.fax}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, fax: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('fax')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.fax || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* E-mail */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>E-mail</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="email"
                        value={mesInfos.email}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('email')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="email"
                        value={infosOrganisateur.email || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Site */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Site</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.site}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, site: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('site')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.site || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Nom responsable administration (avec dropdown) */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label className="fw-bold">Nom responsable administration</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <div className="d-flex gap-2">
                        <Form.Select
                          value={mesInfos.nomResponsableAdmin}
                          onChange={(e) => setMesInfos(prev => ({ ...prev, nomResponsableAdmin: e.target.value }))}
                        >
                          <option value="">Sélectionner...</option>
                          <option value="contact1">Contact 1</option>
                          <option value="contact2">Contact 2</option>
                        </Form.Select>
                        <Button variant="outline-primary" size="sm" title="Créer un nouveau contact">
                          <i className="bi bi-plus-lg"></i>
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('nomResponsableAdmin')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.nomResponsableAdmin || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Mobile pro */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Mobile pro</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.mobilePro}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, mobilePro: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('mobilePro')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.mobilePro || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Téléphone pro */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Téléphone pro</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.telPro}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, telPro: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('telPro')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.telPro || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* E-mail responsable */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>E-mail responsable</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="email"
                        value={mesInfos.emailResponsable}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, emailResponsable: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('emailResponsable')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="email"
                        value={infosOrganisateur.emailResponsable || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Nom du signataire */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Nom du signataire</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.nomSignataire}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, nomSignataire: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('nomSignataire')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.nomSignataire || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Qualité du signataire */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Qualité du signataire</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.qualiteSignataire}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, qualiteSignataire: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('qualiteSignataire')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.qualiteSignataire || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Siret */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Siret</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.siret}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, siret: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('siret')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.siret || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Code d'activité */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Code d'activité</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.codeActivite}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, codeActivite: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('codeActivite')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.codeActivite || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* N° de licence */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>N° de licence</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.numeroLicence}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, numeroLicence: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('numeroLicence')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.numeroLicence || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* N° de TVA international */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>N° de TVA international</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.numeroTvaInternational}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, numeroTvaInternational: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('numeroTvaInternational')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.numeroTvaInternational || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Code TPS (Canada) */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Code TPS (Canada)</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.codeTps}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, codeTps: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('codeTps')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.codeTps || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Code TVQ (Canada) */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Code TVQ (Canada)</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.codeTvq}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, codeTvq: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('codeTvq')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.codeTvq || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>

            {/* Section 2: Projet */}
            <Accordion.Item eventKey="1">
              <Accordion.Header>
                <h5 className="mb-0">
                  <i className="bi bi-music-note-list me-2"></i>
                  2. Projet
                </h5>
              </Accordion.Header>
              <Accordion.Body>
                <div className={styles.sectionHeader}>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => copierSection(['artistes', 'projet', 'festival', 'prixPlaces'])}
                  >
                    <i className="bi bi-arrow-left-circle me-1"></i>
                    Tout copier
                  </Button>
                </div>

                <Row className={styles.fieldsRow}>
                  <Col md={2} className={styles.labelCol}>
                    <h6 className={styles.columnTitle}>Champs</h6>
                  </Col>
                  <Col md={4} className={styles.mesInfosCol}>
                    <h6 className={styles.columnTitle}>Mes informations</h6>
                  </Col>
                  <Col md={1} className={styles.arrowCol}></Col>
                  <Col md={5} className={styles.organisateurCol}>
                    <h6 className={styles.columnTitle}>Informations organisateur</h6>
                  </Col>
                </Row>

                {/* Artiste(s) */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Artiste(s)</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Artiste(s)"
                        value={mesInfos.artistes}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, artistes: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('artistes')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Artiste(s)"
                        value={infosOrganisateur.artistes || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Projet */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Projet</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Projet"
                        value={mesInfos.projet}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, projet: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('projet')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Projet"
                        value={infosOrganisateur.projet || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Festival / Événement */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Festival / Événement</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Festival / Événement"
                        value={mesInfos.festival}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, festival: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('festival')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Festival / Événement"
                        value={infosOrganisateur.festival || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Prix des places */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Prix des places</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Prix des places"
                        value={mesInfos.prixPlaces}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, prixPlaces: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('prixPlaces')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Prix des places"
                        value={infosOrganisateur.prixPlaces || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>

            {/* Section 3: Représentations */}
            <Accordion.Item eventKey="2">
              <Accordion.Header>
                <h5 className="mb-0">
                  <i className="bi bi-calendar-event me-2"></i>
                  3. Représentations
                </h5>
              </Accordion.Header>
              <Accordion.Body>
                <div className={styles.sectionHeader}>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => copierSection(['type', 'nbRepresentations', 'horaireDebut', 'horaireFin', 'capacite', 'nbAdmin', 'invitationsPayant', 'salle', 'adresseSalle', 'suiteAdresseSalle', 'codePostalSalle', 'villeSalle', 'paysSalle'])}
                  >
                    <i className="bi bi-arrow-left-circle me-1"></i>
                    Tout copier
                  </Button>
                </div>

                <Row className={styles.fieldsRow}>
                  <Col md={2} className={styles.labelCol}>
                    <h6 className={styles.columnTitle}>Champs</h6>
                  </Col>
                  <Col md={4} className={styles.mesInfosCol}>
                    <h6 className={styles.columnTitle}>Mes informations</h6>
                  </Col>
                  <Col md={1} className={styles.arrowCol}></Col>
                  <Col md={5} className={styles.organisateurCol}>
                    <h6 className={styles.columnTitle}>Informations organisateur</h6>
                  </Col>
                </Row>

                {/* Type */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Type</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Select
                        value={mesInfos.type}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="concert">Concert</option>
                        <option value="showcase">Showcase</option>
                        <option value="festival">Festival</option>
                        <option value="representation">Représentation</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('type')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.type || 'concert'}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Nb. représentations */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Nb. représentations</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="number"
                        value={mesInfos.nbRepresentations}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, nbRepresentations: parseInt(e.target.value) || 0 }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('nbRepresentations')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="number"
                        value={infosOrganisateur.nbRepresentations || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Capacité */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Capacité</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="number"
                        value={mesInfos.capacite}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, capacite: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('capacite')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="number"
                        value={infosOrganisateur.capacite || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Horaire début */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Horaire début</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="time"
                        value={mesInfos.horaireDebut}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, horaireDebut: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('horaireDebut')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="time"
                        value={infosOrganisateur.horaireDebut || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Horaire fin */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Horaire fin</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="time"
                        value={mesInfos.horaireFin}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, horaireFin: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('horaireFin')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="time"
                        value={infosOrganisateur.horaireFin || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Nb. admin */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Nb. admin</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="number"
                        value={mesInfos.nbAdmin}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, nbAdmin: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('nbAdmin')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="number"
                        value={infosOrganisateur.nbAdmin || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Invitations payantes */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Invitations payantes</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Check
                        type="checkbox"
                        label="Payant"
                        checked={mesInfos.invitationsPayant}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, invitationsPayant: e.target.checked }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('invitationsPayant')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Check
                        type="checkbox"
                        label="Payant"
                        checked={infosOrganisateur.invitationsPayant || false}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Salle (avec dropdown) */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label className="fw-bold">Salle</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <div className="d-flex gap-2">
                        <Form.Select
                          value={mesInfos.salle}
                          onChange={(e) => setMesInfos(prev => ({ ...prev, salle: e.target.value }))}
                        >
                          <option value="">Sélectionner...</option>
                          <option value="salle1">Salle 1</option>
                          <option value="salle2">Salle 2</option>
                        </Form.Select>
                        <Button variant="outline-primary" size="sm" title="Créer une nouvelle salle">
                          <i className="bi bi-plus-lg"></i>
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('salle')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.salle || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Adresse de la salle */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Adresse</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Adresse"
                        value={mesInfos.adresseSalle}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, adresseSalle: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('adresseSalle')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Adresse"
                        value={infosOrganisateur.adresseSalle || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Suite adresse salle */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Suite adresse</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Suite adresse"
                        value={mesInfos.suiteAdresseSalle}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, suiteAdresseSalle: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('suiteAdresseSalle')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Suite adresse"
                        value={infosOrganisateur.suiteAdresseSalle || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Code postal et Ville salle */}
                {/* Code postal salle */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Code postal</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.codePostalSalle}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, codePostalSalle: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('codePostalSalle')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.codePostalSalle || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Ville salle */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Ville</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={mesInfos.villeSalle}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, villeSalle: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('villeSalle')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.villeSalle || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Pays salle */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Pays</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Pays"
                        value={mesInfos.paysSalle}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, paysSalle: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('paysSalle')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Pays"
                        value={infosOrganisateur.paysSalle || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>

            {/* Section 4: Négociation */}
            <Accordion.Item eventKey="3">
              <Accordion.Header>
                <h5 className="mb-0">
                  <i className="bi bi-currency-euro me-2"></i>
                  4. Négociation
                </h5>
              </Accordion.Header>
              <Accordion.Body>
                <div className={styles.sectionHeader}>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => copierSection(['cachetHT', 'acompte', 'frais', 'contratPropose', 'devise', 'moyenPaiement', 'precisionsNego'])}
                  >
                    <i className="bi bi-arrow-left-circle me-1"></i>
                    Tout copier
                  </Button>
                </div>

                <Row className={styles.fieldsRow}>
                  <Col md={2} className={styles.labelCol}>
                    <h6 className={styles.columnTitle}>Champs</h6>
                  </Col>
                  <Col md={4} className={styles.mesInfosCol}>
                    <h6 className={styles.columnTitle}>Mes informations</h6>
                  </Col>
                  <Col md={1} className={styles.arrowCol}></Col>
                  <Col md={5} className={styles.organisateurCol}>
                    <h6 className={styles.columnTitle}>Informations organisateur</h6>
                  </Col>
                </Row>

                {/* Cachet HT */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Cachet HT</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="number"
                        step="0.01"
                        placeholder="Cachet HT"
                        value={mesInfos.cachetHT}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, cachetHT: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('cachetHT')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="number"
                        step="0.01"
                        placeholder="Cachet HT"
                        value={infosOrganisateur.cachetHT || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Acompte */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Acompte</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="number"
                        step="0.01"
                        placeholder="Acompte"
                        value={mesInfos.acompte}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, acompte: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('acompte')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="number"
                        step="0.01"
                        placeholder="Acompte"
                        value={infosOrganisateur.acompte || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Frais */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Frais</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="number"
                        step="0.01"
                        placeholder="Frais"
                        value={mesInfos.frais}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, frais: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('frais')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="number"
                        step="0.01"
                        placeholder="Frais"
                        value={infosOrganisateur.frais || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Contrat proposé */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Contrat proposé</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Select
                        value={mesInfos.contratPropose}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, contratPropose: e.target.value }))}
                      >
                        <option value="cession">Cession</option>
                        <option value="coorganisation">Co-organisation</option>
                        <option value="recette">Recette</option>
                        <option value="forfait">Forfait</option>
                        <option value="residency">Résidence</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('contratPropose')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.contratPropose || 'cession'}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Devise */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Devise</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Select
                        value={mesInfos.devise}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, devise: e.target.value }))}
                      >
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                        <option value="CAD">CAD</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('devise')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.devise || 'EUR'}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Moyen de paiement */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Moyen de paiement</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Select
                        value={mesInfos.moyenPaiement}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, moyenPaiement: e.target.value }))}
                      >
                        <option value="virement">Virement</option>
                        <option value="cheque">Chèque</option>
                        <option value="especes">Espèces</option>
                        <option value="carte">Carte bancaire</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('moyenPaiement')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.moyenPaiement || 'virement'}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Précisions négociation */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Précisions négo</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Précisions négo"
                        value={mesInfos.precisionsNego}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, precisionsNego: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('precisionsNego')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Précisions négo"
                        value={infosOrganisateur.precisionsNego || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>

            {/* Section 5: Régie */}
            <Accordion.Item eventKey="4">
              <Accordion.Header>
                <h5 className="mb-0">
                  <i className="bi bi-gear me-2"></i>
                  5. Régie
                </h5>
              </Accordion.Header>
              <Accordion.Body>
                <div className={styles.sectionHeader}>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => copierSection(['nomResponsableRegie', 'telephoneRegie', 'mobileRegie', 'emailRegie', 'autresArtistes', 'horaires'])}
                  >
                    <i className="bi bi-arrow-left-circle me-1"></i>
                    Tout copier
                  </Button>
                </div>

                <Row className={styles.fieldsRow}>
                  <Col md={2} className={styles.labelCol}>
                    <h6 className={styles.columnTitle}>Champs</h6>
                  </Col>
                  <Col md={4} className={styles.mesInfosCol}>
                    <h6 className={styles.columnTitle}>Mes informations</h6>
                  </Col>
                  <Col md={1} className={styles.arrowCol}></Col>
                  <Col md={5} className={styles.organisateurCol}>
                    <h6 className={styles.columnTitle}>Informations organisateur</h6>
                  </Col>
                </Row>

                {/* Nom du responsable régie (avec dropdown) */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label className="fw-bold">Nom du responsable</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <div className="d-flex gap-2">
                        <Form.Select
                          value={mesInfos.nomResponsableRegie}
                          onChange={(e) => setMesInfos(prev => ({ ...prev, nomResponsableRegie: e.target.value }))}
                        >
                          <option value="">Sélectionner...</option>
                          <option value="responsable1">Responsable 1</option>
                          <option value="responsable2">Responsable 2</option>
                        </Form.Select>
                        <Button variant="outline-primary" size="sm" title="Créer un nouveau contact">
                          <i className="bi bi-plus-lg"></i>
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('nomResponsableRegie')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.nomResponsableRegie || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Téléphone régie */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Téléphone</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Téléphone"
                        value={mesInfos.telephoneRegie}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, telephoneRegie: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('telephoneRegie')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Téléphone"
                        value={infosOrganisateur.telephoneRegie || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Mobile régie */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Mobile</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Mobile"
                        value={mesInfos.mobileRegie}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, mobileRegie: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('mobileRegie')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Mobile"
                        value={infosOrganisateur.mobileRegie || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* E-mail régie */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>E-mail</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="email"
                        placeholder="E-mail"
                        value={mesInfos.emailRegie}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, emailRegie: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('emailRegie')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="email"
                        placeholder="E-mail"
                        value={infosOrganisateur.emailRegie || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Autres artistes */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Autres artistes</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Autres artistes"
                        value={mesInfos.autresArtistes}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, autresArtistes: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('autresArtistes')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Autres artistes"
                        value={infosOrganisateur.autresArtistes || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Horaires */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Horaires</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Horaires"
                        value={mesInfos.horaires}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, horaires: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('horaires')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Horaires"
                        value={infosOrganisateur.horaires || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>

            {/* Section 6: Promo */}
            <Accordion.Item eventKey="5">
              <Accordion.Header>
                <h5 className="mb-0">
                  <i className="bi bi-megaphone me-2"></i>
                  6. Promo
                </h5>
              </Accordion.Header>
              <Accordion.Body>
                <div className={styles.sectionHeader}>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => copierSection(['nomResponsablePromo', 'telephonePromo', 'mobilePromo', 'emailPromo', 'demandePromo', 'adresseEnvoiPromo'])}
                  >
                    <i className="bi bi-arrow-left-circle me-1"></i>
                    Tout copier
                  </Button>
                </div>

                <Row className={styles.fieldsRow}>
                  <Col md={2} className={styles.labelCol}>
                    <h6 className={styles.columnTitle}>Champs</h6>
                  </Col>
                  <Col md={4} className={styles.mesInfosCol}>
                    <h6 className={styles.columnTitle}>Mes informations</h6>
                  </Col>
                  <Col md={1} className={styles.arrowCol}></Col>
                  <Col md={5} className={styles.organisateurCol}>
                    <h6 className={styles.columnTitle}>Informations organisateur</h6>
                  </Col>
                </Row>

                {/* Nom du responsable promo (avec dropdown) */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label className="fw-bold">Nom du responsable</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <div className="d-flex gap-2">
                        <Form.Select
                          value={mesInfos.nomResponsablePromo}
                          onChange={(e) => setMesInfos(prev => ({ ...prev, nomResponsablePromo: e.target.value }))}
                        >
                          <option value="">Sélectionner...</option>
                          <option value="responsable1">Responsable 1</option>
                          <option value="responsable2">Responsable 2</option>
                        </Form.Select>
                        <Button variant="outline-primary" size="sm" title="Créer un nouveau contact">
                          <i className="bi bi-plus-lg"></i>
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('nomResponsablePromo')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        value={infosOrganisateur.nomResponsablePromo || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Téléphone promo */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Téléphone</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Téléphone"
                        value={mesInfos.telephonePromo}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, telephonePromo: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('telephonePromo')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Téléphone"
                        value={infosOrganisateur.telephonePromo || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Mobile promo */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Mobile</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Mobile"
                        value={mesInfos.mobilePromo}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, mobilePromo: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('mobilePromo')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder="Mobile"
                        value={infosOrganisateur.mobilePromo || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* E-mail promo */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>E-mail</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        type="email"
                        placeholder="E-mail"
                        value={mesInfos.emailPromo}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, emailPromo: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('emailPromo')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        type="email"
                        placeholder="E-mail"
                        value={infosOrganisateur.emailPromo || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Demande promo */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Demande promo</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Demande promo"
                        value={mesInfos.demandePromo}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, demandePromo: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('demandePromo')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Demande promo"
                        value={infosOrganisateur.demandePromo || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Adresse envoi promo */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Adresse envoi promo</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Adresse envoi promo"
                        value={mesInfos.adresseEnvoiPromo}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, adresseEnvoiPromo: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('adresseEnvoiPromo')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Adresse envoi promo"
                        value={infosOrganisateur.adresseEnvoiPromo || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>

            {/* Section 7: Autres infos */}
            <Accordion.Item eventKey="6">
              <Accordion.Header>
                <h5 className="mb-0">
                  <i className="bi bi-info-square me-2"></i>
                  7. Autres infos
                </h5>
              </Accordion.Header>
              <Accordion.Body>
                <div className={styles.sectionHeader}>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => copierSection(['receptif', 'divers'])}
                  >
                    <i className="bi bi-arrow-left-circle me-1"></i>
                    Tout copier
                  </Button>
                </div>

                <Row className={styles.fieldsRow}>
                  <Col md={2} className={styles.labelCol}>
                    <h6 className={styles.columnTitle}>Champs</h6>
                  </Col>
                  <Col md={4} className={styles.mesInfosCol}>
                    <h6 className={styles.columnTitle}>Mes informations</h6>
                  </Col>
                  <Col md={1} className={styles.arrowCol}></Col>
                  <Col md={5} className={styles.organisateurCol}>
                    <h6 className={styles.columnTitle}>Informations organisateur</h6>
                  </Col>
                </Row>

                {/* Réceptif */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Réceptif</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Réceptif"
                        value={mesInfos.receptif}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, receptif: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('receptif')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Réceptif"
                        value={infosOrganisateur.receptif || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Divers */}
                <Row className={styles.fieldRow}>
                  <Col md={2} className={styles.labelCol}>
                    <Form.Label>Divers</Form.Label>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Divers"
                        value={mesInfos.divers}
                        onChange={(e) => setMesInfos(prev => ({ ...prev, divers: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={1} className={styles.arrowCol}>
                    <Button 
                      variant="link" 
                      onClick={() => copierValeur('divers')}
                      className={styles.copyButton}
                      title="Copier la valeur"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Divers"
                        value={infosOrganisateur.divers || ''}
                        readOnly
                        className={styles.readOnlyField}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* Boutons d'action */}
          <div className={styles.actionButtons}>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => navigate(-1)}
              disabled={isSaving}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Annuler
            </Button>
            <Button 
              variant="primary" 
              size="lg"
              onClick={validerConfirmation}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Validation en cours...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  Valider la confirmation
                </>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ConfirmationPage;