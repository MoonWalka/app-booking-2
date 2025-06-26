import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Form, Table, Alert } from 'react-bootstrap';
import RepresentationsSection from '@/components/common/RepresentationsSection';
import { useTabs } from '@/context/TabsContext';
import { useOrganization } from '@/context/OrganizationContext';
import { doc, getDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import styles from './ContratGeneratorNew.module.css';

/**
 * Générateur de contrat - Nouveau composant
 */
const ContratGeneratorNew = ({ 
  concertId, 
  concert, 
  contact, 
  artiste, 
  lieu, 
  structure,
  preContratData 
}) => {
  const navigate = useNavigate();
  const { openTab } = useTabs();
  const { currentOrg } = useOrganization();
  
  // État pour l'onglet actif du panneau latéral
  const [activeTab, setActiveTab] = useState('dossier');
  
  // État pour les données de l'entreprise du label
  const [entrepriseData, setEntrepriseData] = useState(null);
  
  // État pour les paramètres de facturation (incluant TVA)
  const [factureParams, setFactureParams] = useState(null);
  
  // État pour les données du contrat
  const [contratData, setContratData] = useState({
    // Contractants - Partie A (Organisateur)
    organisateur: {
      raisonSociale: '',
      adresse: '',
      suiteAdresse2: '',
      codePostal: '',
      pays: 'France',
      departement: '',
      email: '',
      fax: '',
      signataire: '',
      siret: '',
      numeroLicence: '',
      suiteAdresse: '',
      suiteAdresse3: '',
      ville: '',
      region: '',
      telephone: '',
      site: '',
      qualite: '',
      numeroTva: '',
      codeApe: ''
    },
    // Contractants - Partie B (Producteur/Artiste)
    producteur: {
      raisonSociale: '',
      adresse: '',
      suiteAdresse2: '',
      codePostal: '',
      pays: 'France',
      departement: '',
      email: '',
      fax: '',
      signataire: '',
      siret: '',
      numeroLicence: '',
      suiteAdresse: '',
      suiteAdresse3: '',
      ville: '',
      region: '',
      telephone: '',
      site: '',
      qualite: '',
      numeroTva: '',
      codeApe: ''
    },
    // Représentations
    representations: {
      debut: '',
      fin: '',
      representation: '',
      invitations: false,
      nbAdmins: '',
      salle: '',
      horaireDebut: '',
      horaireFin: '',
      payant: false,
      nbRepresentations: '1',
      capacite: '',
      type: 'Concert'
    },
    // Négociation
    negociation: {
      montantNet: 0,
      montantBrut: 0,
      tauxTva: 20, // Taux par défaut
      montantTva: 0,
      montantTTC: 0,
      contratType: 'cession',
      devise: 'EUR',
      moyenPaiement: 'virement',
      acompte: '',
      frais: ''
    },
    // Réceptif
    hebergements: [],
    restaurations: [],
    // Facturation
    devise: 'EUR',
    prestations: [],
    // Règlement
    langue: 'Français',
    emetteur: '',
    destinataire: '',
    dateValidite: '',
    echeances: []
  });

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  // Charger les données de l'entreprise du label
  useEffect(() => {
    const loadEntrepriseData = async () => {
      if (!currentOrg?.id) return;
      
      try {
        console.log('[ContratGeneratorNew] Chargement des données de l\'entreprise pour org:', currentOrg.id);
        
        // Essayer d'abord le chemin principal: organizations/{id}/settings/entreprise
        const entrepriseRef = doc(db, 'organizations', currentOrg.id, 'settings', 'entreprise');
        const entrepriseDoc = await getDoc(entrepriseRef);
        
        if (entrepriseDoc.exists()) {
          const entrepriseData = entrepriseDoc.data();
          console.log('[ContratGeneratorNew] Données entreprise trouvées dans settings/entreprise:', entrepriseData);
          setEntrepriseData(entrepriseData);
          return;
        }
        
        // Fallback sur organizations/{id}/parametres/settings
        const parametresRef = doc(db, 'organizations', currentOrg.id, 'parametres', 'settings');
        const parametresDoc = await getDoc(parametresRef);
        
        if (parametresDoc.exists()) {
          const parametres = parametresDoc.data();
          if (parametres.entreprise) {
            console.log('[ContratGeneratorNew] Données entreprise trouvées dans parametres/settings:', parametres.entreprise);
            setEntrepriseData(parametres.entreprise);
            return;
          }
        }
        
        // Dernier fallback sur l'ancien chemin (pour compatibilité)
        const oldParametresDoc = await getDoc(doc(db, 'parametres', currentOrg.id));
        
        if (oldParametresDoc.exists()) {
          const parametres = oldParametresDoc.data();
          if (parametres.entreprise) {
            console.log('[ContratGeneratorNew] Données entreprise trouvées dans l\'ancien chemin parametres:', parametres.entreprise);
            setEntrepriseData(parametres.entreprise);
          }
        } else {
          console.warn('[ContratGeneratorNew] Aucune donnée entreprise trouvée pour l\'organisation');
        }
      } catch (error) {
        console.error('[ContratGeneratorNew] Erreur lors du chargement des données entreprise:', error);
      }
    };
    
    loadEntrepriseData();
  }, [currentOrg]);

  // Charger les paramètres de facturation (incluant TVA)
  useEffect(() => {
    const loadFactureParams = async () => {
      if (!currentOrg?.id) return;
      
      try {
        console.log('[ContratGeneratorNew] Chargement des paramètres de facturation');
        
        // Charger les paramètres de facturation
        const factureParamsRef = doc(db, 'organizations', currentOrg.id, 'settings', 'factureParameters');
        const factureParamsDoc = await getDoc(factureParamsRef);
        
        if (factureParamsDoc.exists()) {
          const params = factureParamsDoc.data();
          console.log('[ContratGeneratorNew] Paramètres de facturation trouvés:', params);
          if (params.parameters) {
            setFactureParams(params.parameters);
          }
        } else {
          console.log('[ContratGeneratorNew] Aucun paramètre de facturation trouvé, utilisation des valeurs par défaut');
        }
      } catch (error) {
        console.error('[ContratGeneratorNew] Erreur lors du chargement des paramètres de facturation:', error);
      }
    };
    
    loadFactureParams();
  }, [currentOrg]);

  // Initialiser les données depuis les props
  useEffect(() => {
    // Si on a un pré-contrat confirmé, utiliser ses données en priorité
    if (preContratData && preContratData.confirmationValidee) {
      console.log('[ContratGeneratorNew] Utilisation des données du pré-contrat confirmé');
      
      setContratData(prev => ({
        ...prev,
        organisateur: {
          ...prev.organisateur,
          raisonSociale: preContratData.raisonSociale || structure?.nom || '',
          adresse: preContratData.adresse || structure?.adresse || '',
          suiteAdresse: preContratData.suiteAdresse || '',
          ville: preContratData.ville || structure?.ville || '',
          codePostal: preContratData.cp || structure?.codePostal || '',
          pays: preContratData.pays || structure?.pays || 'France',
          telephone: preContratData.tel || structure?.telephone || '',
          fax: preContratData.fax || '',
          email: preContratData.email || structure?.email || '',
          siret: preContratData.siret || structure?.siret || '',
          site: preContratData.site || structure?.siteWeb || '',
          signataire: preContratData.nomSignataire || '',
          qualite: preContratData.qualiteSignataire || '',
          numeroTva: preContratData.numeroTvaIntracommunautaire || '',
          codeApe: preContratData.codeActivite || '',
          numeroLicence: preContratData.numeroLicence || ''
        },
        negociation: {
          ...prev.negociation,
          montantNet: preContratData.montantHT || concert?.montant || 0,
          montantBrut: preContratData.montantHT || concert?.montant || 0,
          tauxTva: factureParams?.tauxTva || 20,
          montantTva: 0, // Sera calculé après
          montantTTC: 0, // Sera calculé après
          contratType: preContratData.contratPropose || 'cession',
          devise: preContratData.devise || 'EUR',
          moyenPaiement: preContratData.moyenPaiement || 'virement',
          acompte: preContratData.acompte || '',
          frais: preContratData.frais || ''
        }
      }));
    } else if (structure) {
      // Sinon, utiliser les données de base
      setContratData(prev => ({
        ...prev,
        organisateur: {
          ...prev.organisateur,
          raisonSociale: structure.nom || structure.structureRaisonSociale || '',
          adresse: structure.adresse || '',
          ville: structure.ville || '',
          codePostal: structure.codePostal || '',
          pays: structure.pays || 'France',
          telephone: structure.telephone || '',
          email: structure.email || '',
          siret: structure.siret || '',
          site: structure.siteWeb || ''
        }
      }));
    }

    if (concert) {
      setContratData(prev => ({
        ...prev,
        representations: {
          ...prev.representations,
          debut: concert.dateDebut || '',
          fin: concert.dateFin || '',
          salle: lieu?.nom || concert.lieuNom || ''
        }
      }));
    }

    // Mapper les données de l'entreprise du label dans producteur (Partie B)
    if (entrepriseData) {
      console.log('[ContratGeneratorNew] Mapping des données entreprise dans producteur:', entrepriseData);
      console.log('[ContratGeneratorNew] Nom entreprise:', entrepriseData.nom);
      setContratData(prev => ({
        ...prev,
        producteur: {
          ...prev.producteur,
          raisonSociale: entrepriseData.nom || '',
          adresse: entrepriseData.adresse || '',
          suiteAdresse: entrepriseData.adresseComplement || '',
          ville: entrepriseData.ville || '',
          codePostal: entrepriseData.codePostal || '',
          pays: entrepriseData.pays || 'France',
          telephone: entrepriseData.telephone || '',
          fax: entrepriseData.fax || '',
          email: entrepriseData.email || '',
          siret: entrepriseData.siret || '',
          site: entrepriseData.siteWeb || '',
          signataire: entrepriseData.representantLegal || '',
          qualite: entrepriseData.qualiteRepresentant || '',
          numeroTva: entrepriseData.numeroTVAIntracommunautaire || '',
          codeApe: entrepriseData.codeAPE || '',
          numeroLicence: entrepriseData.licenceSpectacle || ''
        }
      }));
    } else {
      console.log('[ContratGeneratorNew] Aucune donnée entreprise disponible pour le producteur');
    }
  }, [structure, concert, artiste, lieu, preContratData, entrepriseData, factureParams]);

  // Initialiser les champs émetteur et destinataire
  useEffect(() => {
    if (entrepriseData?.nom) {
      // L'émetteur est l'entreprise de l'utilisateur (le producteur)
      setContratData(prev => ({
        ...prev,
        emetteur: entrepriseData.nom
      }));
    }
    
    // Le destinataire est l'organisateur (le contractant)
    const destinataireNom = contratData.organisateur.raisonSociale || 
                           structure?.nom || 
                           structure?.structureRaisonSociale || 
                           '';
    if (destinataireNom) {
      setContratData(prev => ({
        ...prev,
        destinataire: destinataireNom
      }));
    }
  }, [entrepriseData, structure, contratData.organisateur.raisonSociale]);

  // Calculer automatiquement les montants TVA
  useEffect(() => {
    if (contratData.negociation) {
      const montantHT = parseFloat(contratData.negociation.montantNet) || 0;
      const tauxTva = parseFloat(contratData.negociation.tauxTva) || 0;
      
      const montantTva = montantHT * (tauxTva / 100);
      const montantTTC = montantHT + montantTva;
      
      setContratData(prev => ({
        ...prev,
        negociation: {
          ...prev.negociation,
          montantTva: montantTva.toFixed(2),
          montantTTC: montantTTC.toFixed(2)
        }
      }));
    }
  }, [contratData.negociation?.montantNet, contratData.negociation?.tauxTva]);

  // Calcul des totaux (déplacé ici pour être utilisable dans les useEffect)
  const calculerTotaux = () => {
    const totalHT = contratData.prestations.reduce((sum, p) => sum + (parseFloat(p.montantHT) || 0), 0);
    const totalTVA = contratData.prestations.reduce((sum, p) => {
      const montantHT = parseFloat(p.montantHT) || 0;
      const tauxTva = parseFloat(p.tauxTva) || 0;
      return sum + (montantHT * tauxTva / 100);
    }, 0);
    const totalTTC = totalHT + totalTVA;

    return { totalHT, totalTVA, totalTTC };
  };

  // Gérer automatiquement les montants des échéances
  useEffect(() => {
    const { totalTTC } = calculerTotaux();
    
    // Vérifier s'il y a des échéances de type Solde
    const echeancesSolde = contratData.echeances.filter(e => e.nature === 'Solde');
    const echeancesAcompte = contratData.echeances.filter(e => e.nature === 'Acompte');
    
    if (echeancesSolde.length > 0) {
      // Calculer le total des acomptes
      const totalAcomptes = echeancesAcompte.reduce((sum, e) => sum + (parseFloat(e.montantTTC) || 0), 0);
      
      // Le solde doit être égal au totalTTC moins les acomptes
      const montantSolde = (totalTTC - totalAcomptes).toFixed(2);
      
      // Mettre à jour le montant du premier solde trouvé
      const updatedEcheances = contratData.echeances.map(ech => {
        if (ech.id === echeancesSolde[0].id) {
          return { ...ech, montantTTC: montantSolde };
        }
        return ech;
      });
      
      // Si le montant a changé, mettre à jour
      if (echeancesSolde[0].montantTTC !== montantSolde) {
        setContratData(prev => ({ ...prev, echeances: updatedEcheances }));
      }
    }
  }, [contratData.prestations, contratData.echeances.filter(e => e.nature === 'Acompte').map(e => e.montantTTC).join(','), contratData.echeances.length]);

  const handleInputChange = (section, field, value) => {
    setContratData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      // Logique de sauvegarde
      setAlertType('success');
      setAlertMessage('Contrat enregistré avec succès');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      setAlertType('danger');
      setAlertMessage('Erreur lors de l\'enregistrement');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleGenerate = async () => {
    try {
      // Générer un ID temporaire pour le contrat (ou utiliser concertId)
      const contratId = concertId || `nouveau-${Date.now()}`;
      
      console.log('handleGenerate called with contratId:', contratId);
      console.log('openTab available:', !!openTab);
      
      // Ouvrir la page de rédaction dans un nouvel onglet
      if (openTab) {
        console.log('Opening tab with openTab...');
        openTab({
          id: `contrat-redaction-${contratId}`,
          title: `Rédaction contrat`,
          path: `/contrats/${contratId}/redaction`,
          component: 'ContratRedactionPage',
          params: { 
            originalConcertId: concertId || null,
            contratId: contratId
          }
        });
      } else {
        // Fallback si pas de système d'onglets
        console.log('Fallback to navigate...');
        navigate(`/contrats/${contratId}/redaction`);
      }
    } catch (error) {
      console.error('Error in handleGenerate:', error);
      setAlertType('danger');
      setAlertMessage('Erreur lors de l\'ouverture de la page de rédaction');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  // Fonctions pour gérer les tableaux dynamiques
  const addHebergement = () => {
    setContratData(prev => ({
      ...prev,
      hebergements: [...prev.hebergements, {
        id: Date.now(),
        date: '',
        nombre: '',
        jourNuit: 'Nuit',
        singles: '',
        twins: '',
        doubles: '',
        suites: ''
      }]
    }));
  };

  const removeHebergement = (id) => {
    setContratData(prev => ({
      ...prev,
      hebergements: prev.hebergements.filter(h => h.id !== id)
    }));
  };

  const addRestauration = () => {
    setContratData(prev => ({
      ...prev,
      restaurations: [...prev.restaurations, {
        id: Date.now(),
        date: '',
        repas: '',
        nombre: '',
        sansPorc: '',
        vegetariens: ''
      }]
    }));
  };

  const removeRestauration = (id) => {
    setContratData(prev => ({
      ...prev,
      restaurations: prev.restaurations.filter(r => r.id !== id)
    }));
  };

  const addPrestation = () => {
    setContratData(prev => ({
      ...prev,
      prestations: [...prev.prestations, {
        id: Date.now(),
        objet: '',
        montantHT: '',
        tauxTva: factureParams?.tauxTva?.toString() || '20'
      }]
    }));
  };

  const removePrestation = (id) => {
    setContratData(prev => ({
      ...prev,
      prestations: prev.prestations.filter(p => p.id !== id)
    }));
  };

  const addEcheance = () => {
    setContratData(prev => ({
      ...prev,
      echeances: [...prev.echeances, {
        id: Date.now(),
        nature: '',
        montantTTC: '',
        dateFacturation: '',
        dateEcheance: '',
        dateEnvoi: '',
        modePaiement: ''
      }]
    }));
  };

  const removeEcheance = (id) => {
    setContratData(prev => ({
      ...prev,
      echeances: prev.echeances.filter(e => e.id !== id)
    }));
  };

  const { totalHT, totalTVA, totalTTC } = calculerTotaux();

  return (
    <div className={styles.contratContainer}>
      {showAlert && (
        <Alert variant={alertType} className="mb-3">
          {alertMessage}
        </Alert>
      )}

      {/* Boutons d'action en haut */}
      <div className={styles.actionButtons}>
        <Button 
          variant="success" 
          onClick={handleSave}
          className="me-3"
        >
          <i className="bi bi-save me-2"></i>
          Enregistrer
        </Button>
        <Button 
          variant="primary" 
          onClick={handleGenerate}
        >
          <i className="bi bi-file-text me-2"></i>
          Rédiger
        </Button>
      </div>

      <div className={styles.contentWrapper}>
        {/* Contenu principal */}
        <div className={styles.mainContent}>
          {/* Section 1: Contractants */}
          <Card className="mb-4">
          <Card.Header>
            <h4>1. Infos contrat ▸ Contractants</h4>
          </Card.Header>
          <Card.Body>
            {/* Partie A - Organisateur */}
            <div className={styles.contractantSection}>
              <div className={styles.contractantHeader}>
                <h5>{contratData.organisateur.raisonSociale || 'Organisateur'}</h5>
              </div>
              
              <Row>
                <Col md={1} className={styles.labelColumn}>
                  <div className={styles.labelItem}>Raison sociale :</div>
                  <div className={styles.labelItem}>Adresse :</div>
                  <div className={styles.labelItem}>Suite adresse 2 :</div>
                  <div className={styles.labelItem}>Code postal :</div>
                  <div className={styles.labelItem}>Pays :</div>
                  <div className={styles.labelItem}>Département :</div>
                  <div className={styles.labelItem}>Email :</div>
                  <div className={styles.labelItem}>Fax :</div>
                  <div className={styles.labelItem}>Signataire :</div>
                  <div className={styles.labelItem}>SIRET :</div>
                  <div className={styles.labelItem}>Numéro de licence :</div>
                </Col>
                <Col md={5} className={styles.fieldColumn}>
                  <Form.Control
                    type="text"
                    value={contratData.organisateur.raisonSociale}
                    onChange={(e) => handleInputChange('organisateur', 'raisonSociale', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.organisateur.adresse}
                    onChange={(e) => handleInputChange('organisateur', 'adresse', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.organisateur.suiteAdresse2}
                    onChange={(e) => handleInputChange('organisateur', 'suiteAdresse2', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.organisateur.codePostal}
                    onChange={(e) => handleInputChange('organisateur', 'codePostal', e.target.value)}
                  />
                  <Form.Select
                    value={contratData.organisateur.pays}
                    onChange={(e) => handleInputChange('organisateur', 'pays', e.target.value)}
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Autre">Autre</option>
                  </Form.Select>
                  <Form.Control
                    type="text"
                    value={contratData.organisateur.departement}
                    onChange={(e) => handleInputChange('organisateur', 'departement', e.target.value)}
                  />
                  <Form.Control
                    type="email"
                    value={contratData.organisateur.email}
                    onChange={(e) => handleInputChange('organisateur', 'email', e.target.value)}
                  />
                  <Form.Control
                    type="tel"
                    value={contratData.organisateur.fax}
                    onChange={(e) => handleInputChange('organisateur', 'fax', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.organisateur.signataire}
                    onChange={(e) => handleInputChange('organisateur', 'signataire', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.organisateur.siret}
                    onChange={(e) => handleInputChange('organisateur', 'siret', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.organisateur.numeroLicence}
                    onChange={(e) => handleInputChange('organisateur', 'numeroLicence', e.target.value)}
                  />
                </Col>
                <Col md={1} className={styles.labelColumn}>
                  <div className={styles.labelItem}>Suite adresse :</div>
                  <div className={styles.labelItem}>Suite adresse 3 :</div>
                  <div className={styles.labelItem}>Ville :</div>
                  <div className={styles.labelItem}>Région :</div>
                  <div className={styles.labelItem}>Téléphone :</div>
                  <div className={styles.labelItem}>Site :</div>
                  <div className={styles.labelItem}>Qualité :</div>
                  <div className={styles.labelItem}>Numéro TVA :</div>
                  <div className={styles.labelItem}>Code APE :</div>
                </Col>
                <Col md={5} className={styles.fieldColumn}>
                  <Form.Control
                    type="text"
                    value={contratData.organisateur.suiteAdresse}
                    onChange={(e) => handleInputChange('organisateur', 'suiteAdresse', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.organisateur.suiteAdresse3}
                    onChange={(e) => handleInputChange('organisateur', 'suiteAdresse3', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.organisateur.ville}
                    onChange={(e) => handleInputChange('organisateur', 'ville', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.organisateur.region}
                    onChange={(e) => handleInputChange('organisateur', 'region', e.target.value)}
                  />
                  <Form.Control
                    type="tel"
                    value={contratData.organisateur.telephone}
                    onChange={(e) => handleInputChange('organisateur', 'telephone', e.target.value)}
                  />
                  <Form.Control
                    type="url"
                    value={contratData.organisateur.site}
                    onChange={(e) => handleInputChange('organisateur', 'site', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.organisateur.qualite}
                    onChange={(e) => handleInputChange('organisateur', 'qualite', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.organisateur.numeroTva}
                    onChange={(e) => handleInputChange('organisateur', 'numeroTva', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.organisateur.codeApe}
                    onChange={(e) => handleInputChange('organisateur', 'codeApe', e.target.value)}
                  />
                </Col>
              </Row>
            </div>

            {/* Partie B - Producteur/Artiste */}
            <div className={styles.contractantSection}>
              <div className={styles.contractantHeader}>
                <h5>{contratData.producteur.raisonSociale || 'Producteur/Artiste'}</h5>
              </div>
              
              <Row>
                <Col md={1} className={styles.labelColumn}>
                  <div className={styles.labelItem}>Raison sociale :</div>
                  <div className={styles.labelItem}>Adresse :</div>
                  <div className={styles.labelItem}>Suite adresse 2 :</div>
                  <div className={styles.labelItem}>Code postal :</div>
                  <div className={styles.labelItem}>Pays :</div>
                  <div className={styles.labelItem}>Département :</div>
                  <div className={styles.labelItem}>Email :</div>
                  <div className={styles.labelItem}>Fax :</div>
                  <div className={styles.labelItem}>Signataire :</div>
                  <div className={styles.labelItem}>SIRET :</div>
                  <div className={styles.labelItem}>Numéro de licence :</div>
                </Col>
                <Col md={5} className={styles.fieldColumn}>
                  <Form.Control
                    type="text"
                    value={contratData.producteur.raisonSociale}
                    onChange={(e) => handleInputChange('producteur', 'raisonSociale', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.producteur.adresse}
                    onChange={(e) => handleInputChange('producteur', 'adresse', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.producteur.suiteAdresse2}
                    onChange={(e) => handleInputChange('producteur', 'suiteAdresse2', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.producteur.codePostal}
                    onChange={(e) => handleInputChange('producteur', 'codePostal', e.target.value)}
                  />
                  <Form.Select
                    value={contratData.producteur.pays}
                    onChange={(e) => handleInputChange('producteur', 'pays', e.target.value)}
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Autre">Autre</option>
                  </Form.Select>
                  <Form.Control
                    type="text"
                    value={contratData.producteur.departement}
                    onChange={(e) => handleInputChange('producteur', 'departement', e.target.value)}
                  />
                  <Form.Control
                    type="email"
                    value={contratData.producteur.email}
                    onChange={(e) => handleInputChange('producteur', 'email', e.target.value)}
                  />
                  <Form.Control
                    type="tel"
                    value={contratData.producteur.fax}
                    onChange={(e) => handleInputChange('producteur', 'fax', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.producteur.signataire}
                    onChange={(e) => handleInputChange('producteur', 'signataire', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.producteur.siret}
                    onChange={(e) => handleInputChange('producteur', 'siret', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.producteur.numeroLicence}
                    onChange={(e) => handleInputChange('producteur', 'numeroLicence', e.target.value)}
                  />
                </Col>
                <Col md={1} className={styles.labelColumn}>
                  <div className={styles.labelItem}>Suite adresse :</div>
                  <div className={styles.labelItem}>Suite adresse 3 :</div>
                  <div className={styles.labelItem}>Ville :</div>
                  <div className={styles.labelItem}>Région :</div>
                  <div className={styles.labelItem}>Téléphone :</div>
                  <div className={styles.labelItem}>Site :</div>
                  <div className={styles.labelItem}>Qualité :</div>
                  <div className={styles.labelItem}>Numéro TVA :</div>
                  <div className={styles.labelItem}>Code APE :</div>
                </Col>
                <Col md={5} className={styles.fieldColumn}>
                  <Form.Control
                    type="text"
                    value={contratData.producteur.suiteAdresse}
                    onChange={(e) => handleInputChange('producteur', 'suiteAdresse', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.producteur.suiteAdresse3}
                    onChange={(e) => handleInputChange('producteur', 'suiteAdresse3', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.producteur.ville}
                    onChange={(e) => handleInputChange('producteur', 'ville', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.producteur.region}
                    onChange={(e) => handleInputChange('producteur', 'region', e.target.value)}
                  />
                  <Form.Control
                    type="tel"
                    value={contratData.producteur.telephone}
                    onChange={(e) => handleInputChange('producteur', 'telephone', e.target.value)}
                  />
                  <Form.Control
                    type="url"
                    value={contratData.producteur.site}
                    onChange={(e) => handleInputChange('producteur', 'site', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.producteur.qualite}
                    onChange={(e) => handleInputChange('producteur', 'qualite', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.producteur.numeroTva}
                    onChange={(e) => handleInputChange('producteur', 'numeroTva', e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    value={contratData.producteur.codeApe}
                    onChange={(e) => handleInputChange('producteur', 'codeApe', e.target.value)}
                  />
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>

        {/* Section 2: Représentations */}
        <Card className="mb-4">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h4>2. Représentations</h4>
              <Button variant="outline-primary" size="sm">
                + Gérer les salles utilisées par l'organisateur
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <RepresentationsSection
              data={contratData.representations}
              onChange={(field, value) => {
                setContratData(prev => ({
                  ...prev,
                  representations: {
                    ...prev.representations,
                    [field]: value
                  }
                }));
              }}
              readOnly={false}
            />
          </Card.Body>
        </Card>

        {/* Section 3: Réceptif */}
        <Card className="mb-4">
          <Card.Header>
            <h4>3. Réceptif</h4>
          </Card.Header>
          <Card.Body>
            {/* Hébergement */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Hébergement</h6>
                <Button variant="success" size="sm" onClick={addHebergement}>
                  <i className="bi bi-plus"></i>
                </Button>
              </div>
              
              <Table responsive className={styles.dynamicTable}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Nombre</th>
                    <th>Jour/Nuit</th>
                    <th>Single(s)</th>
                    <th>Twin(s)</th>
                    <th>Double(s)</th>
                    <th>Suite(s)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contratData.hebergements.map((hebergement) => (
                    <tr key={hebergement.id}>
                      <td>
                        <Form.Control
                          type="date"
                          value={hebergement.date}
                          onChange={(e) => {
                            const updatedHebergements = contratData.hebergements.map(h =>
                              h.id === hebergement.id ? { ...h, date: e.target.value } : h
                            );
                            setContratData(prev => ({ ...prev, hebergements: updatedHebergements }));
                          }}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={hebergement.nombre}
                          onChange={(e) => {
                            const updatedHebergements = contratData.hebergements.map(h =>
                              h.id === hebergement.id ? { ...h, nombre: e.target.value } : h
                            );
                            setContratData(prev => ({ ...prev, hebergements: updatedHebergements }));
                          }}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Form.Select
                          value={hebergement.jourNuit}
                          onChange={(e) => {
                            const updatedHebergements = contratData.hebergements.map(h =>
                              h.id === hebergement.id ? { ...h, jourNuit: e.target.value } : h
                            );
                            setContratData(prev => ({ ...prev, hebergements: updatedHebergements }));
                          }}
                          size="sm"
                        >
                          <option value="Jour">Jour</option>
                          <option value="Nuit">Nuit</option>
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={hebergement.singles}
                          onChange={(e) => {
                            const updatedHebergements = contratData.hebergements.map(h =>
                              h.id === hebergement.id ? { ...h, singles: e.target.value } : h
                            );
                            setContratData(prev => ({ ...prev, hebergements: updatedHebergements }));
                          }}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={hebergement.twins}
                          onChange={(e) => {
                            const updatedHebergements = contratData.hebergements.map(h =>
                              h.id === hebergement.id ? { ...h, twins: e.target.value } : h
                            );
                            setContratData(prev => ({ ...prev, hebergements: updatedHebergements }));
                          }}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={hebergement.doubles}
                          onChange={(e) => {
                            const updatedHebergements = contratData.hebergements.map(h =>
                              h.id === hebergement.id ? { ...h, doubles: e.target.value } : h
                            );
                            setContratData(prev => ({ ...prev, hebergements: updatedHebergements }));
                          }}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={hebergement.suites}
                          onChange={(e) => {
                            const updatedHebergements = contratData.hebergements.map(h =>
                              h.id === hebergement.id ? { ...h, suites: e.target.value } : h
                            );
                            setContratData(prev => ({ ...prev, hebergements: updatedHebergements }));
                          }}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeHebergement(hebergement.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Restauration */}
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Restauration</h6>
                <Button variant="success" size="sm" onClick={addRestauration}>
                  <i className="bi bi-plus"></i>
                </Button>
              </div>
              
              <Table responsive className={styles.dynamicTable}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Repas</th>
                    <th>Nombre</th>
                    <th>Dont sans porc</th>
                    <th>Dont végétariens</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contratData.restaurations.map((restauration) => (
                    <tr key={restauration.id}>
                      <td>
                        <Form.Control
                          type="date"
                          value={restauration.date}
                          onChange={(e) => {
                            const updatedRestaurations = contratData.restaurations.map(r =>
                              r.id === restauration.id ? { ...r, date: e.target.value } : r
                            );
                            setContratData(prev => ({ ...prev, restaurations: updatedRestaurations }));
                          }}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          value={restauration.repas}
                          onChange={(e) => {
                            const updatedRestaurations = contratData.restaurations.map(r =>
                              r.id === restauration.id ? { ...r, repas: e.target.value } : r
                            );
                            setContratData(prev => ({ ...prev, restaurations: updatedRestaurations }));
                          }}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={restauration.nombre}
                          onChange={(e) => {
                            const updatedRestaurations = contratData.restaurations.map(r =>
                              r.id === restauration.id ? { ...r, nombre: e.target.value } : r
                            );
                            setContratData(prev => ({ ...prev, restaurations: updatedRestaurations }));
                          }}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={restauration.sansPorc}
                          onChange={(e) => {
                            const updatedRestaurations = contratData.restaurations.map(r =>
                              r.id === restauration.id ? { ...r, sansPorc: e.target.value } : r
                            );
                            setContratData(prev => ({ ...prev, restaurations: updatedRestaurations }));
                          }}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={restauration.vegetariens}
                          onChange={(e) => {
                            const updatedRestaurations = contratData.restaurations.map(r =>
                              r.id === restauration.id ? { ...r, vegetariens: e.target.value } : r
                            );
                            setContratData(prev => ({ ...prev, restaurations: updatedRestaurations }));
                          }}
                          size="sm"
                        />
                      </td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeRestauration(restauration.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Section 4: Facturation */}
        <Card className="mb-4">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h4>4. Facturation</h4>
              <div>
                <Form.Label className="me-2">Devise :</Form.Label>
                <Form.Select
                  value={contratData.devise}
                  onChange={(e) => setContratData(prev => ({ ...prev, devise: e.target.value }))}
                  style={{ width: 'auto', display: 'inline-block' }}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </Form.Select>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Prestations</h6>
              <Button variant="success" size="sm" onClick={addPrestation}>
                <i className="bi bi-plus"></i>
              </Button>
            </div>
            
            <Row>
              <Col md={8}>
                <Table responsive className={styles.dynamicTable}>
                  <thead>
                    <tr>
                      <th>Objet</th>
                      <th>Montant HT</th>
                      <th>Tx. TVA (%)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contratData.prestations.map((prestation) => (
                      <tr key={prestation.id}>
                        <td>
                          <Form.Control
                            type="text"
                            value={prestation.objet}
                            onChange={(e) => {
                              const updatedPrestations = contratData.prestations.map(p =>
                                p.id === prestation.id ? { ...p, objet: e.target.value } : p
                              );
                              setContratData(prev => ({ ...prev, prestations: updatedPrestations }));
                            }}
                            size="sm"
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            step="0.01"
                            value={prestation.montantHT}
                            onChange={(e) => {
                              const updatedPrestations = contratData.prestations.map(p =>
                                p.id === prestation.id ? { ...p, montantHT: e.target.value } : p
                              );
                              setContratData(prev => ({ ...prev, prestations: updatedPrestations }));
                            }}
                            size="sm"
                          />
                        </td>
                        <td>
                          <Form.Select
                            value={prestation.tauxTva}
                            onChange={(e) => {
                              const updatedPrestations = contratData.prestations.map(p =>
                                p.id === prestation.id ? { ...p, tauxTva: e.target.value } : p
                              );
                              setContratData(prev => ({ ...prev, prestations: updatedPrestations }));
                            }}
                            size="sm"
                          >
                            <option value="0">0% (Exonéré)</option>
                            <option value="2.1">2.1% (Taux super réduit)</option>
                            <option value="5.5">5.5% (Taux réduit)</option>
                            <option value="10">10% (Taux intermédiaire)</option>
                            <option value="20">20% (Taux normal)</option>
                            {/* Si un taux personnalisé existe dans les paramètres et n'est pas dans la liste */}
                            {factureParams?.tauxTva && 
                             ![0, 2.1, 5.5, 10, 20].includes(parseFloat(factureParams.tauxTva)) && (
                              <option value={factureParams.tauxTva}>
                                {factureParams.tauxTva}% (Personnalisé)
                              </option>
                            )}
                          </Form.Select>
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removePrestation(prestation.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
              <Col md={4}>
                {/* Bloc totaux */}
                <div className={styles.totalsBlock}>
                  <div className={styles.totalLine}>
                    <span>Total HT :</span>
                    <span>{totalHT.toFixed(2)} {contratData.devise}</span>
                  </div>
                  <div className={styles.totalLine}>
                    <span>Total TVA :</span>
                    <span>{totalTVA.toFixed(2)} {contratData.devise}</span>
                  </div>
                  <div className={`${styles.totalLine} ${styles.totalFinal}`}>
                    <span>Total TTC :</span>
                    <span>{totalTTC.toFixed(2)} {contratData.devise}</span>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Section 5: Règlement */}
        <Card className="mb-4">
          <Card.Header>
            <h4>5. Règlement</h4>
          </Card.Header>
          <Card.Body>
            <Row className="mb-3">
              <Col md={1} className={styles.labelColumn}>
                <div className={styles.labelItem}>Langue :</div>
                <div className={styles.labelItem}>Date de validité :</div>
              </Col>
              <Col md={5} className={styles.fieldColumn}>
                <Form.Select
                  value={contratData.langue}
                  onChange={(e) => setContratData(prev => ({ ...prev, langue: e.target.value }))}
                >
                  <option value="Français">Français</option>
                  <option value="English">English</option>
                  <option value="Español">Español</option>
                </Form.Select>
                <Form.Control
                  type="date"
                  value={contratData.dateValidite}
                  onChange={(e) => setContratData(prev => ({ ...prev, dateValidite: e.target.value }))}
                />
              </Col>
              <Col md={1} className={styles.labelColumn}>
                <div className={styles.labelItem}>Émetteur :</div>
                <div className={styles.labelItem}>Destinataire :</div>
              </Col>
              <Col md={5} className={styles.fieldColumn}>
                <Form.Control
                  type="text"
                  value={contratData.emetteur}
                  onChange={(e) => setContratData(prev => ({ ...prev, emetteur: e.target.value }))}
                  placeholder="Émetteur de la facture"
                />
                <Form.Control
                  type="text"
                  value={contratData.destinataire}
                  onChange={(e) => setContratData(prev => ({ ...prev, destinataire: e.target.value }))}
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Button
                  variant="primary"
                  onClick={() => {
                    const soldeEcheance = {
                      id: Date.now(),
                      nature: 'Solde',
                      montantTTC: totalTTC.toFixed(2),
                      dateFacturation: '',
                      dateEcheance: '',
                      dateEnvoi: '',
                      modePaiement: ''
                    };
                    setContratData(prev => ({
                      ...prev,
                      echeances: [...prev.echeances, soldeEcheance]
                    }));
                  }}
                  style={{ marginTop: '32px' }}
                >
                  Solde
                </Button>
              </Col>
            </Row>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Tableau des échéances</h5>
              <Button variant="success" size="sm" onClick={addEcheance}>
                <i className="bi bi-plus"></i>
              </Button>
            </div>

            <Table responsive className={styles.dynamicTable}>
              <thead>
                <tr>
                  <th>Nature</th>
                  <th>Montant TTC</th>
                  <th>Date de facturation</th>
                  <th>Date d'échéance</th>
                  <th>Date d'envoi</th>
                  <th>Mode de paiement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contratData.echeances.map((echeance) => (
                  <tr key={echeance.id}>
                    <td>
                      <Form.Select
                        value={echeance.nature}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          
                          // Vérifier s'il y a déjà un Solde et si on essaie d'en ajouter un autre
                          if (newValue === 'Solde') {
                            const existingSolde = contratData.echeances.find(ech => 
                              ech.nature === 'Solde' && ech.id !== echeance.id
                            );
                            
                            if (existingSolde) {
                              alert('Il ne peut y avoir qu\'une seule ligne de type Solde');
                              return;
                            }
                          }
                          
                          let updatedEcheances = contratData.echeances.map(ech => {
                            if (ech.id === echeance.id) {
                              // Si on sélectionne "Acompte", calculer le montant basé sur le pourcentage négocié
                              if (newValue === 'Acompte') {
                                const pourcentageAcompte = parseFloat(contratData.negociation?.acompte) || 0;
                                const { totalTTC } = calculerTotaux();
                                const montantAcompte = pourcentageAcompte > 0 ? (totalTTC * pourcentageAcompte / 100).toFixed(2) : '';
                                return { ...ech, nature: newValue, montantTTC: montantAcompte };
                              }
                              // Si on sélectionne "Solde", calculer automatiquement le montant
                              if (newValue === 'Solde') {
                                const { totalTTC } = calculerTotaux();
                                const totalAcomptes = contratData.echeances
                                  .filter(e => e.nature === 'Acompte' && e.id !== echeance.id)
                                  .reduce((sum, e) => sum + (parseFloat(e.montantTTC) || 0), 0);
                                const montantSolde = (totalTTC - totalAcomptes).toFixed(2);
                                return { ...ech, nature: newValue, montantTTC: montantSolde };
                              }
                              return { ...ech, nature: newValue };
                            }
                            return ech;
                          });
                          
                          setContratData(prev => ({ ...prev, echeances: updatedEcheances }));
                        }}
                        size="sm"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="Acompte">Acompte</option>
                        <option value="Solde">Solde</option>
                        <option value="Facture">Facture</option>
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={echeance.montantTTC}
                        readOnly={echeance.nature === 'Solde'}
                        onChange={(e) => {
                          // Ne pas permettre la modification si c'est un Solde
                          if (echeance.nature === 'Solde') return;
                          
                          const updatedEcheances = contratData.echeances.map(ech =>
                            ech.id === echeance.id ? { ...ech, montantTTC: e.target.value } : ech
                          );
                          setContratData(prev => ({ ...prev, echeances: updatedEcheances }));
                        }}
                        size="sm"
                        style={echeance.nature === 'Solde' ? { backgroundColor: '#f5f5f5' } : {}}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="date"
                        value={echeance.dateFacturation}
                        onChange={(e) => {
                          const updatedEcheances = contratData.echeances.map(ech =>
                            ech.id === echeance.id ? { ...ech, dateFacturation: e.target.value } : ech
                          );
                          setContratData(prev => ({ ...prev, echeances: updatedEcheances }));
                        }}
                        size="sm"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="date"
                        value={echeance.dateEcheance}
                        onChange={(e) => {
                          const updatedEcheances = contratData.echeances.map(ech =>
                            ech.id === echeance.id ? { ...ech, dateEcheance: e.target.value } : ech
                          );
                          setContratData(prev => ({ ...prev, echeances: updatedEcheances }));
                        }}
                        size="sm"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="date"
                        value={echeance.dateEnvoi}
                        onChange={(e) => {
                          const updatedEcheances = contratData.echeances.map(ech =>
                            ech.id === echeance.id ? { ...ech, dateEnvoi: e.target.value } : ech
                          );
                          setContratData(prev => ({ ...prev, echeances: updatedEcheances }));
                        }}
                        size="sm"
                      />
                    </td>
                    <td>
                      <Form.Select
                        value={echeance.modePaiement}
                        onChange={(e) => {
                          const updatedEcheances = contratData.echeances.map(ech =>
                            ech.id === echeance.id ? { ...ech, modePaiement: e.target.value } : ech
                          );
                          setContratData(prev => ({ ...prev, echeances: updatedEcheances }));
                        }}
                        size="sm"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="Virement">Virement</option>
                        <option value="Chèque">Chèque</option>
                        <option value="Espèces">Espèces</option>
                        <option value="Carte bancaire">Carte bancaire</option>
                      </Form.Select>
                    </td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeEcheance(echeance.id)}
                        disabled={echeance.nature === 'Solde' && contratData.echeances.filter(e => e.nature === 'Solde').length === 1}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
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
              <button
                className={`${styles.sidePanelTab} ${activeTab === 'precontrat' ? styles.active : ''}`}
                onClick={() => setActiveTab('precontrat')}
              >
                Pré-contrat
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
                  {concert?.devisId ? (
                    <>
                      <div className="mb-3">
                        <h6>Informations devis</h6>
                        <p className="small mb-1"><strong>Statut:</strong> <span className="text-success">Créé</span></p>
                        <p className="small mb-1"><strong>Date:</strong> {concert?.devisDate ? new Date(concert.devisDate).toLocaleDateString('fr-FR') : 'Non daté'}</p>
                        <p className="small mb-1"><strong>Référence:</strong> {concert?.devisRef || `DEV-${concert?.devisId?.slice(-6)}`}</p>
                      </div>
                      <div className="mb-3">
                        <h6>Prestations</h6>
                        <p className="small mb-1"><strong>Nombre:</strong> {concert?.devisNbPrestations || '0'}</p>
                        <p className="small mb-1"><strong>Détail:</strong> {concert?.devisDescription || 'Prestation artistique'}</p>
                      </div>
                      <div className="mb-3">
                        <h6>Montants</h6>
                        <p className="small mb-1"><strong>Total HT:</strong> {concert?.devisMontantHT || '0.00'} €</p>
                        <p className="small mb-1"><strong>TVA:</strong> {concert?.devisTVA || '0.00'} €</p>
                        <p className="small mb-1"><strong>Total TTC:</strong> {concert?.devisMontantTTC || '0.00'} €</p>
                      </div>
                      <div className="mb-3">
                        <h6>Conditions</h6>
                        <p className="small mb-1"><strong>Validité:</strong> {concert?.devisValidite || '30 jours'}</p>
                        <p className="small mb-1"><strong>Conditions:</strong> {concert?.devisConditions || 'Standard'}</p>
                      </div>
                      <Button variant="outline-primary" size="sm" className="w-100">
                        <i className="bi bi-eye me-2"></i>
                        Voir le devis
                      </Button>
                    </>
                  ) : (
                    <p className="text-muted small text-center">
                      Aucun devis créé pour ce dossier
                    </p>
                  )}
                </>
              )}

              {/* Section Pré-contrat */}
              {activeTab === 'precontrat' && (
                <>
                  {concert?.preContratId ? (
                    <>
                      <div className="mb-3">
                        <h6>Informations pré-contrat</h6>
                        <p className="small mb-1"><strong>Statut:</strong> <span className="text-warning">En attente</span></p>
                        <p className="small mb-1"><strong>Date d'envoi:</strong> {concert?.preContratDateEnvoi ? new Date(concert.preContratDateEnvoi).toLocaleDateString('fr-FR') : 'Non envoyé'}</p>
                        <p className="small mb-1"><strong>Date de création:</strong> {concert?.preContratDateCreation ? new Date(concert.preContratDateCreation).toLocaleDateString('fr-FR') : 'Non défini'}</p>
                      </div>
                      <div className="mb-3">
                        <h6>Structure organisatrice</h6>
                        <p className="small mb-1"><strong>Nom:</strong> {concert?.preContratStructureNom || 'Non défini'}</p>
                        <p className="small mb-1"><strong>Signataire:</strong> {concert?.preContratSignataire || 'Non défini'}</p>
                      </div>
                      <div className="mb-3">
                        <h6>Négociation</h6>
                        <p className="small mb-1"><strong>Montant HT:</strong> {concert?.preContratMontantHT || concert?.montant || '0.00'} €</p>
                        <p className="small mb-1"><strong>Devise:</strong> {concert?.preContratDevise || 'EUR'}</p>
                        <p className="small mb-1"><strong>Conditions:</strong> {concert?.preContratConditions || 'Standard'}</p>
                        <p className="small mb-1"><strong>Mode de paiement:</strong> {concert?.preContratModePaiement || 'Virement'}</p>
                      </div>
                      <div className="mb-3">
                        <h6>Communication</h6>
                        <p className="small mb-1"><strong>Destinataires:</strong> {concert?.preContratDestinataires?.length || 0} personne(s)</p>
                        <p className="small mb-1"><strong>Statut envoi:</strong> {concert?.preContratEnvoye ? 'Envoyé' : 'Brouillon'}</p>
                      </div>
                      <Button variant="outline-primary" size="sm" className="w-100">
                        <i className="bi bi-eye me-2"></i>
                        Voir le pré-contrat
                      </Button>
                    </>
                  ) : (
                    <p className="text-muted small text-center">
                      Aucun pré-contrat créé pour ce dossier
                    </p>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContratGeneratorNew;