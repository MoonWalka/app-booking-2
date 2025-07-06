import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert, Modal, Spinner } from 'react-bootstrap';
import { collection, query, where, getDocs } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { useTabs } from '@/context/TabsContext';
import RepresentationsSection from '@/components/common/RepresentationsSection';
import preContratService from '@/services/preContratService';
import devisService from '@/services/devisService';
import styles from './PreContratGenerator.module.css';
import '@styles/index.css';

const PreContratGenerator = ({ concert, contact, artiste, lieu, structure }) => {
  console.log('[WORKFLOW_TEST] 4. Chargement des données de structure dans le pré-contrat - PreContratGenerator reçoit:', {
    structure: structure?.id || 'aucune',
    structureData: structure
  });
  
  const { currentOrg } = useOrganization();
  const { openTab } = useTabs();
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
  const [existingPreContrat, setExistingPreContrat] = useState(null);
  const [hasUnvalidatedPublicData, setHasUnvalidatedPublicData] = useState(false);
  const [devisData, setDevisData] = useState(null);

  // Charger le pré-contrat existant pour ce concert
  useEffect(() => {
    const loadExistingPreContrat = async () => {
      if (!concert?.id || !currentOrg?.id) return;

      try {
        console.log('[PreContratGenerator] Recherche pré-contrat existant pour concert:', date.id);
        
        // Rechercher un pré-contrat existant pour ce concert
        const q = query(
          collection(db, 'preContrats'),
          where('dateId', '==', date.id),
          where('organizationId', '==', currentOrg.id)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Prendre le plus récent
          const preContratDoc = querySnapshot.docs[0];
          const preContratData = { id: preContratDoc.id, ...preContratDoc.data() };
          
          console.log('[PreContratGenerator] Pré-contrat existant trouvé:', preContratData);
          
          setExistingPreContrat(preContratData);
          setPreContratId(preContratData.id);
          setPreContratToken(preContratData.token);
          
          // Si on a des données du formulaire public ET qu'elles sont validées, les afficher
          if (preContratData.publicFormData && preContratData.confirmationValidee) {
            console.log('[PreContratGenerator] Données du formulaire public VALIDÉES trouvées:', preContratData.publicFormData);
            console.log('[PreContratGenerator] Adresse dans publicFormData:', preContratData.publicFormData.adresse);
            console.log('[PreContratGenerator] Code postal dans publicFormData:', preContratData.publicFormData.cp);
            console.log('[PreContratGenerator] Adresse dans preContratData:', preContratData.adresse);
            
            // Mettre à jour formData avec les données du formulaire public validées
            setFormData(prev => ({
              ...prev,
              // Données organisateur du formulaire public
              raisonSociale: preContratData.publicFormData.raisonSociale || prev.raisonSociale,
              adresse: preContratData.publicFormData.adresse || preContratData.adresse || prev.adresse,
              suiteAdresse: preContratData.publicFormData.suiteAdresse || preContratData.suiteAdresse || prev.suiteAdresse,
              ville: preContratData.publicFormData.ville || preContratData.ville || prev.ville,
              cp: preContratData.publicFormData.cp || preContratData.cp || prev.cp,
              pays: preContratData.publicFormData.pays || preContratData.pays || prev.pays,
              tel: preContratData.publicFormData.tel || preContratData.tel || prev.tel,
              fax: preContratData.publicFormData.fax || preContratData.fax || prev.fax,
              email: preContratData.publicFormData.email || preContratData.email || prev.email,
              site: preContratData.publicFormData.site || preContratData.site || prev.site,
              siret: preContratData.publicFormData.siret || preContratData.siret || prev.siret,
              codeActivite: preContratData.publicFormData.codeActivite || prev.codeActivite,
              numeroTvaIntracommunautaire: preContratData.publicFormData.numeroTvaIntracommunautaire || prev.numeroTvaIntracommunautaire,
              numeroLicence: preContratData.publicFormData.numeroLicence || prev.numeroLicence,
              nomSignataire: preContratData.publicFormData.nomSignataire || prev.nomSignataire,
              qualiteSignataire: preContratData.publicFormData.qualiteSignataire || prev.qualiteSignataire,
              
              // Données concert
              horaireDebut: preContratData.publicFormData.horaireDebut || prev.horaireDebut,
              horaireFin: preContratData.publicFormData.horaireFin || prev.horaireFin,
              payant: preContratData.publicFormData.payant || prev.payant,
              nbRepresentations: preContratData.publicFormData.nbRepresentations || prev.nbRepresentations,
              salle: preContratData.publicFormData.salle || prev.salle,
              capacite: preContratData.publicFormData.capacite || prev.capacite,
              nbAdmins: preContratData.publicFormData.nbAdmins || prev.nbAdmins,
              invitations: preContratData.publicFormData.invitations || prev.invitations,
              festival: preContratData.publicFormData.festival || prev.festival,
              
              // Données négociation
              contratPropose: preContratData.publicFormData.contratPropose || prev.contratPropose,
              montantHT: preContratData.publicFormData.montantHT || prev.montantHT || (devisData?.montantHT ? devisData.montantHT.toString() : ''),
              moyenPaiement: preContratData.publicFormData.moyenPaiement || prev.moyenPaiement,
              devise: preContratData.publicFormData.devise || prev.devise,
              acompte: preContratData.publicFormData.acompte || prev.acompte,
              frais: preContratData.publicFormData.frais || prev.frais,
              precisionsNegoc: preContratData.publicFormData.precisionsNegoc || prev.precisionsNegoc,
              
              // Données régie
              responsableRegie: preContratData.publicFormData.responsableRegie || prev.responsableRegie,
              emailProRegie: preContratData.publicFormData.emailProRegie || prev.emailProRegie,
              telProRegie: preContratData.publicFormData.telProRegie || prev.telProRegie,
              mobileProRegie: preContratData.publicFormData.mobileProRegie || prev.mobileProRegie,
              horaires: preContratData.publicFormData.horaires || prev.horaires,
              
              // Données promo
              responsablePromo: preContratData.publicFormData.responsablePromo || prev.responsablePromo,
              emailProPromo: preContratData.publicFormData.emailProPromo || prev.emailProPromo,
              telProPromo: preContratData.publicFormData.telProPromo || prev.telProPromo,
              mobileProPromo: preContratData.publicFormData.mobileProPromo || prev.mobileProPromo,
              demandePromo: preContratData.publicFormData.demandePromo || prev.demandePromo,
              
              // Autres
              prixPlaces: preContratData.publicFormData.prixPlaces || prev.prixPlaces,
              divers: preContratData.publicFormData.divers || prev.divers
            }));
          } else if (preContratData.publicFormData && !preContratData.confirmationValidee) {
            // Si on a des données publiques non validées, on les signale mais on ne les charge pas
            console.log('[PreContratGenerator] Données du formulaire public NON VALIDÉES trouvées');
            setHasUnvalidatedPublicData(true);
            // Charger uniquement les données sauvegardées normalement (sans les données publiques)
            setFormData(prev => ({
              ...prev,
              ...preContratData,
              destinataires: preContratData.destinataires || [],
              artistes: Array.isArray(preContratData.artistes) ? preContratData.artistes : [],
              // Exclure explicitement publicFormData
              publicFormData: undefined
            }));
          } else if (preContratData) {
            // Si pas de publicFormData, charger les données sauvegardées normalement
            setFormData(prev => ({
              ...prev,
              ...preContratData,
              destinataires: preContratData.destinataires || [],
              artistes: Array.isArray(preContratData.artistes) ? preContratData.artistes : []
            }));
          }
        }
      } catch (error) {
        console.error('[PreContratGenerator] Erreur chargement pré-contrat existant:', error);
      }
    };
    
    loadExistingPreContrat();
  }, [concert?.id, currentOrg?.id, devisData]);

  // Charger le devis associé au concert
  useEffect(() => {
    const loadDevisDuDate = async () => {
      if (!concert?.id) return;

      try {
        console.log('[PreContratGenerator] Recherche devis pour concert:', date.id);
        
        // Chercher les devis pour ce concert
        const devisList = await devisService.getDevisByDate(date.id);
        
        if (devisList && devisList.length > 0) {
          // Prendre le devis le plus récent
          const latestDevis = devisList[0];
          console.log('[PreContratGenerator] Devis trouvé:', latestDevis);
          setDevisData(latestDevis);
          
          // Attendre un peu pour laisser le pré-contrat se charger d'abord
          setTimeout(() => {
            setFormData(prev => {
              console.log('[PreContratGenerator] Application des données du devis au pré-contrat');
              
              // Récupérer toutes les données pertinentes du devis
              const updatedData = { ...prev };
              
              // Montant et devise
              if (!prev.montantHT && latestDevis.montantHT) {
                updatedData.montantHT = latestDevis.montantHT.toString();
              }
              if (!prev.devise && latestDevis.devise) {
                updatedData.devise = latestDevis.devise;
              }
              
              // Infos du projet/spectacle
              if (!prev.nomSpectacle && latestDevis.titre) {
                updatedData.nomSpectacle = latestDevis.titre;
              }
              
              // Dates
              if (!prev.debut && latestDevis.dateDebut) {
                updatedData.debut = latestDevis.dateDebut;
              }
              if (!prev.fin && latestDevis.dateFin) {
                updatedData.fin = latestDevis.dateFin;
              }
              
              // Responsable admin (si présent dans le devis)
              if (!prev.nomResponsableAdmin && latestDevis.destinataireNom) {
                updatedData.nomResponsableAdmin = latestDevis.destinataireNom;
              }
              if (!prev.emailPro && latestDevis.destinataireEmail) {
                updatedData.emailPro = latestDevis.destinataireEmail;
              }
              if (!prev.telPro && latestDevis.destinataireTel) {
                updatedData.telPro = latestDevis.destinataireTel;
              }
              
              // TVA et conditions de paiement
              if (latestDevis.totalTVA !== undefined) {
                updatedData.montantTVA = latestDevis.totalTVA.toString();
              }
              if (latestDevis.montantTTC !== undefined) {
                updatedData.montantTTC = latestDevis.montantTTC.toString();
              }
              
              // Moyens de paiement et acompte si définis dans le devis
              if (!prev.moyenPaiement && latestDevis.conditionsPaiement) {
                updatedData.moyenPaiement = latestDevis.conditionsPaiement;
              }
              if (!prev.acompte && latestDevis.acompte) {
                updatedData.acompte = latestDevis.acompte;
              }
              
              console.log('[PreContratGenerator] Données mises à jour depuis le devis:', updatedData);
              return updatedData;
            });
          }, 500);
        }
      } catch (error) {
        console.error('[PreContratGenerator] Erreur chargement devis:', error);
      }
    };
    
    loadDevisDuDate();
  }, [concert?.id]);

  // Initialiser les données depuis les props (exécuté une seule fois au chargement)
  useEffect(() => {
    console.log('[WORKFLOW_TEST] 4. Chargement des données de structure dans le pré-contrat - initialisation des données');
    console.log('[PreContratGenerator] Initialisation des données depuis les props');
    
    // Ne pas écraser les données si on a déjà des données du formulaire public REMPLIES
    if (existingPreContrat?.publicFormData) {
      console.log('[PreContratGenerator] Données du formulaire public présentes, vérification si vides');
      
      // Vérifier si les données essentielles sont vides
      const hasEmptyAddress = !existingPreContrat.adresse && 
                            !existingPreContrat.ville && 
                            !existingPreContrat.cp;
      
      if (hasEmptyAddress && structure) {
        console.log('[PreContratGenerator] Adresse vide dans le pré-contrat, chargement depuis la structure');
        // Charger uniquement les données d'adresse depuis la structure
        setFormData(prev => ({
          ...prev,
          adresse: prev.adresse || structure.adresse || '',
          suiteAdresse: prev.suiteAdresse || structure.suiteAdresse || '',
          ville: prev.ville || structure.ville || '',
          cp: prev.cp || structure.codePostal || '',
          pays: prev.pays || structure.pays || 'France',
          region: prev.region || structure.region || '',
          departement: prev.departement || structure.departement || ''
        }));
      } else {
        console.log('[PreContratGenerator] Données non vides ou pas de structure, pas de mise à jour');
        return;
      }
    }
    
    if (structure) {
      console.log('[WORKFLOW_TEST] 4. Chargement des données de structure dans le pré-contrat - structure trouvée, application des données');
      console.log('[PreContratGenerator] Structure reçue:', structure);
      
      setFormData(prev => ({
        ...prev,
        raisonSociale: prev.raisonSociale || structure.raisonSociale || '',
        adresse: prev.adresse || structure.adresse || '',
        suiteAdresse: prev.suiteAdresse || structure.suiteAdresse || '',
        ville: prev.ville || structure.ville || '',
        cp: prev.cp || structure.codePostal || '',
        pays: prev.pays || structure.pays || 'France',
        region: prev.region || structure.region || '',
        departement: prev.departement || structure.departement || '',
        tel: prev.tel || structure.telephone || structure.telephone1 || '',
        fax: prev.fax || structure.fax || '',
        mobilePro: prev.mobilePro || structure.mobile || '',
        email: prev.email || structure.email || '',
        siret: prev.siret || structure.siret || '',
        site: prev.site || structure.siteWeb || ''
      }));
      
      console.log('[WORKFLOW_TEST] 4. Chargement des données de structure dans le pré-contrat - données appliquées');
    }

    if (artiste) {
      setFormData(prev => ({
        ...prev,
        artistes: prev.artistes?.length > 0 ? prev.artistes : [artiste.nom || '']
      }));
    }

    if (concert) {
      setFormData(prev => ({
        ...prev,
        projet: prev.projet || concert.projetNom || concert.propositionArtistique || '',
        debut: prev.debut || concert.date || concert.dateDebut || '',
        fin: prev.fin || concert.dateFin || concert.date || '',
        montantHT: prev.montantHT || concert.montant || '',
        salle: prev.salle || lieu?.nom || concert.lieuNom || ''
      }));
    }
  }, [structure, artiste, concert, lieu, existingPreContrat]);

  // Charger les responsables d'administration liés à la structure
  useEffect(() => {
    const loadResponsablesAdmin = async () => {
      if (!structure?.id || !currentOrg?.id) return;

      try {
        setLoadingResponsables(true);
        console.log('[PreContrat] Chargement responsables admin pour structure:', structure.id);
        
        // Rechercher les liaisons actives pour cette structure
        const liaisonsRef = collection(db, 'liaisons');
        const q = query(
          liaisonsRef,
          where('structureId', '==', structure.id),
          where('organizationId', '==', currentOrg.id),
          where('actif', '==', true)
        );
        
        const liaisonsSnapshot = await getDocs(q);
        const personneIds = [];
        const liaisonsMap = {};
        
        // Collecter les IDs des personnes et mapper les liaisons
        liaisonsSnapshot.forEach((doc) => {
          const liaison = doc.data();
          personneIds.push(liaison.personneId);
          liaisonsMap[liaison.personneId] = liaison;
        });
        
        const responsables = [];
        
        // Charger les personnes si on a des liaisons
        if (personneIds.length > 0) {
          // Charger les personnes par batch (Firestore limite à 10 par requête 'in')
          for (let i = 0; i < personneIds.length; i += 10) {
            const batch = personneIds.slice(i, i + 10);
            const personnesQuery = query(
              collection(db, 'personnes'),
              where('__name__', 'in', batch)
            );
            
            const personnesSnapshot = await getDocs(personnesQuery);
            
            personnesSnapshot.forEach((doc) => {
              const personne = doc.data();
              const liaison = liaisonsMap[doc.id];
              
              responsables.push({
                id: doc.id,
                nom: `${personne.prenom || ''} ${personne.nom || ''}`.trim(),
                fonction: liaison.fonction || '',
                email: personne.email || '',
                telephone: personne.telephone || '',
                structureId: structure.id,
                prioritaire: liaison.prioritaire || false
              });
            });
          }
        }
        
        // Ne plus chercher les personnes libres - on affiche uniquement les personnes liées à la structure
        
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
          date.id,
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
          date.id,
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

      {hasUnvalidatedPublicData && (
        <Alert variant="warning" className="mb-3">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Données en attente de validation</strong>
          <p className="mb-2 mt-2">
            L'organisateur a soumis des informations via le formulaire public qui n'ont pas encore été validées.
          </p>
          <Button 
            variant="warning" 
            size="sm"
            onClick={() => {
              openTab({
                id: `confirmation-${date.id}`,
                title: `Confirmation - ${concert.artisteNom || 'Date'}`,
                path: `/confirmation?dateId=${date.id}`,
                component: 'ConfirmationPage',
                params: { dateId: date.id },
                icon: 'bi-check-circle'
              });
            }}
          >
            <i className="bi bi-check-circle me-2"></i>
            Aller valider les données
          </Button>
        </Alert>
      )}
      
      {existingPreContrat?.confirmationValidee && (
        <Alert variant="success" className="mb-3">
          <i className="bi bi-check-circle me-2"></i>
          Les données du formulaire public ont été validées et intégrées.
          {existingPreContrat.confirmationDate && (
            <span className="ms-2">
              (Validé le {new Date(existingPreContrat.confirmationDate.toDate ? existingPreContrat.confirmationDate.toDate() : existingPreContrat.confirmationDate).toLocaleDateString('fr-FR')})
            </span>
          )}
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
                    value={Array.isArray(formData.artistes) ? formData.artistes.join(', ') : ''}
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
                  <div className={styles.labelItem}>
                    Montant HT :
                    {devisData && devisData.montantHT && (
                      <small className="text-muted d-block">(depuis devis)</small>
                    )}
                  </div>
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
                    placeholder={devisData?.montantHT ? `Montant du devis: ${devisData.montantHT} €` : ''}
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
                  <Form.Select
                    value={formData.acompte}
                    onChange={(e) => handleInputChange('acompte', e.target.value)}
                  >
                    <option value="">Sélectionner un acompte...</option>
                    {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(percentage => {
                      const montantHT = parseFloat(formData.montantHT) || 0;
                      const montantAcompte = (montantHT * percentage / 100).toFixed(2);
                      return (
                        <option key={percentage} value={percentage}>
                          {percentage}% - {montantAcompte} {formData.devise}
                        </option>
                      );
                    })}
                  </Form.Select>
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
                  {devisData ? (
                    <>
                      <Alert variant="info" className="small">
                        <i className="bi bi-file-earmark-text me-2"></i>
                        Devis associé : {devisData.numero || 'Sans numéro'}
                      </Alert>
                      
                      <div className="mb-3">
                        <h6>Informations du devis</h6>
                        <p className="small mb-1"><strong>Statut:</strong> <span className="text-capitalize">{devisData.statut || 'Brouillon'}</span></p>
                        <p className="small mb-1"><strong>Artiste(s):</strong> {devisData.artisteNom || '-'}</p>
                        <p className="small mb-1"><strong>Projet:</strong> {devisData.projetNom || '-'}</p>
                        <p className="small mb-1"><strong>Structure:</strong> {devisData.structureNom || '-'}</p>
                      </div>
                      
                      <div className="mb-3">
                        <h6>Montants</h6>
                        <p className="small mb-1"><strong>Montant HT:</strong> {devisData.montantHT ? `${devisData.montantHT.toLocaleString('fr-FR')} €` : '-'}</p>
                        <p className="small mb-1"><strong>TVA:</strong> {devisData.totalTVA ? `${devisData.totalTVA.toLocaleString('fr-FR')} €` : '-'}</p>
                        <p className="small mb-1"><strong>Montant TTC:</strong> {devisData.montantTTC ? `${devisData.montantTTC.toLocaleString('fr-FR')} €` : '-'}</p>
                      </div>
                      
                      {devisData.lignesObjet && devisData.lignesObjet.length > 0 && (
                        <div className="mb-3">
                          <h6>Détail des prestations</h6>
                          {devisData.lignesObjet.map((ligne, index) => (
                            <p key={index} className="small mb-1">
                              • {ligne.objet} - {ligne.quantite} {ligne.unite} - {ligne.montantHT ? `${ligne.montantHT.toLocaleString('fr-FR')} € HT` : ''}
                            </p>
                          ))}
                        </div>
                      )}
                      
                      <div className="d-grid">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => openTab({
                            id: `devis-${devisData.id}`,
                            title: `${devisData.numero || 'Devis'} - ${devisData.structureNom || ''}`,
                            path: `/devis/${devisData.id}`,
                            component: 'DevisPage',
                            params: { devisId: devisData.id },
                            icon: 'bi-file-earmark-text'
                          })}
                        >
                          <i className="bi bi-eye me-2"></i>
                          Voir le devis complet
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Alert variant="warning" className="small">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Aucun devis associé à ce concert
                    </Alert>
                  )}
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
            <strong>Date :</strong> {concert?.titre || concert?.nom || 'Sans titre'}
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