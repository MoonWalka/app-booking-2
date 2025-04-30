// src/components/contrats/ContratGenerator.js
import React, { useState, useEffect } from 'react';

import { Button, Form, Alert, Card, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/firebaseInit';

// import { 
//   collection, 
//   doc, 
//   getDoc, 
//   getDocs, 
//   query, 
//   where, 
//   orderBy,
//   addDoc,
//   updateDoc,
//   serverTimestamp
// } from 'firebase/firestore';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  addDoc,
  updateDoc,
  serverTimestamp
} from '@/firebaseInit';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ContratPDFWrapper from '@/components/pdf/ContratPDFWrapper.js';
import '@/styles/index.css';

const ContratGenerator = ({ concert, programmateur, artiste, lieu }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [entrepriseInfo, setEntrepriseInfo] = useState(null);
  const [contratId, setContratId] = useState(null);
  
  // Nouveaux états pour la gestion d'erreur et le débogage
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Valider les données avant génération du PDF
  const validateDataBeforeGeneration = () => {
    // Vérifier si les données essentielles sont présentes
    if (!concert || !concert.id) {
      console.error("Données de concert manquantes ou invalides:", concert);
      return false;
    }
    
    if (!selectedTemplate) {
      console.error("Aucun modèle de contrat sélectionné");
      return false;
    }
    
    // Vérifier si le modèle a le bon format
    if (!selectedTemplate.bodyContent) {
      console.error("Le modèle sélectionné n'a pas de contenu body:", selectedTemplate);
      return false;
    }
    
    return true;
  };
  
  // Charger les modèles de contrat disponibles et les infos d'entreprise
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage('');
      setShowErrorAlert(false);
      
      try {
        console.log("Début du chargement des données pour la génération de contrat");
        // Récupérer les modèles de contrat
        const templatesQuery = query(
          collection(db, 'contratTemplates'), 
          orderBy('name')
        );
        const templatesSnapshot = await getDocs(templatesQuery);
        
        // Convertir les documents en objets
        const templatesList = templatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`${templatesList.length} modèles de contrat chargés`);
        setTemplates(templatesList);
        
        // Sélectionner le modèle par défaut s'il existe
        const defaultTemplate = templatesList.find(t => t.isDefault);
        if (defaultTemplate) {
          console.log("Modèle par défaut trouvé:", defaultTemplate.id);
          setSelectedTemplateId(defaultTemplate.id);
          setSelectedTemplate(defaultTemplate);
        } else if (templatesList.length > 0) {
          // Sinon, sélectionner le premier modèle
          console.log("Pas de modèle par défaut, sélection du premier:", templatesList[0].id);
          setSelectedTemplateId(templatesList[0].id);
          setSelectedTemplate(templatesList[0]);
        }
        
        // Charger les informations de l'entreprise
        const entrepriseDoc = await getDoc(doc(db, 'parametres', 'entreprise'));
        if (entrepriseDoc.exists()) {
          console.log("Informations d'entreprise chargées");
          setEntrepriseInfo(entrepriseDoc.data());
        } else {
          console.warn("Informations d'entreprise non trouvées");
        }
        
        // Vérifier si un contrat existe déjà pour ce concert
        if (concert?.id) {
          console.log("Recherche d'un contrat existant pour le concert:", concert.id);
          const contratsQuery = query(
            collection(db, 'contrats'),
            where('concertId', '==', concert.id)
          );
          const contratsSnapshot = await getDocs(contratsQuery);
          
          if (!contratsSnapshot.empty) {
            const contratData = contratsSnapshot.docs[0].data();
            const contratDocId = contratsSnapshot.docs[0].id;
            console.log("Contrat existant trouvé:", contratDocId);
            setContratId(contratDocId);
            setPdfUrl(contratData.pdfUrl);
            
            // Si le contrat existe, utiliser son template
            if (contratData.templateId) {
              console.log("Utilisation du template du contrat existant:", contratData.templateId);
              setSelectedTemplateId(contratData.templateId);
              const templateDoc = templatesSnapshot.docs.find(doc => doc.id === contratData.templateId);
              if (templateDoc) {
                setSelectedTemplate({
                  id: templateDoc.id,
                  ...templateDoc.data()
                });
              } else {
                console.warn("Le template du contrat existant n'a pas été trouvé");
              }
            }
          } else {
            console.log("Aucun contrat existant pour ce concert");
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setErrorMessage(`Erreur lors du chargement des données: ${error.message}`);
        setShowErrorAlert(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [concert?.id]);
  
  // Mettre à jour le modèle sélectionné quand l'ID change
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      setSelectedTemplate(template);
    }
  }, [selectedTemplateId, templates]);
  
  // Fonction pour gérer le changement de modèle
  const handleTemplateChange = (e) => {
    setSelectedTemplateId(e.target.value);
  };
  
  // Fonction pour préparer les variables du contrat
  const prepareContractVariables = () => {
    console.log("Préparation des variables du contrat");
    return {
      nomProgrammateur: programmateur?.nom || 'Non spécifié',
      prenomProgrammateur: programmateur?.prenom || '',
      adresseProgrammateur: programmateur?.adresse || 'Non spécifiée',
      emailProgrammateur: programmateur?.email || 'Non spécifié',
      telephoneProgrammateur: programmateur?.telephone || 'Non spécifié',
      structureProgrammateur: programmateur?.structure || 'Non spécifiée',
      
      nomLieu: lieu?.nom || 'Non spécifié',
      adresseLieu: lieu?.adresse || 'Non spécifiée',
      capaciteLieu: lieu?.capacite || 'Non spécifiée',
      villeLieu: lieu?.ville || 'Non spécifiée',
      codePostalLieu: lieu?.codePostal || 'Non spécifié',
      
      nomArtiste: artiste?.nom || 'Non spécifié',
      genreArtiste: artiste?.genre || 'Non spécifié',
      contactArtiste: artiste?.contact || 'Non spécifié',
      
      titreConcert: concert?.titre || 'Non spécifié',
      dateConcert: concert?.date ? new Date(concert.date.seconds * 1000).toLocaleDateString('fr-FR') : 'Non spécifiée',
      heureConcert: concert?.heure || 'Non spécifiée',
      montantConcert: concert?.montant 
        ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(concert.montant)
        : 'Non spécifié',
    };
  };
  
  // Fonction pour sauvegarder le contrat généré
  const saveGeneratedContract = async (url) => {
    try {
      console.log("Début de saveGeneratedContract avec URL:", url);
      setGeneratingPdf(true);
      
      const variables = prepareContractVariables();
      console.log("Variables préparées:", variables);
      
      // NOUVEAU: Créer une "snapshot" complète du template utilisé
      // au lieu de simplement stocker son ID
      const templateSnapshot = {
        id: selectedTemplate.id,
        name: selectedTemplate.name,
        version: Date.now(), // Ajouter un timestamp comme version
        // Copier toutes les propriétés pertinentes du template
        bodyContent: selectedTemplate.bodyContent,
        headerContent: selectedTemplate.headerContent,
        footerContent: selectedTemplate.footerContent,
        titleTemplate: selectedTemplate.titleTemplate,
        // IMPORTANT: Garantir que dateTemplate est bien défini ou null (pas une chaîne vide)
        dateTemplate: selectedTemplate.dateTemplate && selectedTemplate.dateTemplate.trim() !== '' 
          ? selectedTemplate.dateTemplate 
          : null,
        signatureTemplate: selectedTemplate.signatureTemplate,
        // Autres propriétés importantes
        headerHeight: selectedTemplate.headerHeight,
        footerHeight: selectedTemplate.footerHeight,
        headerBottomMargin: selectedTemplate.headerBottomMargin,
        footerTopMargin: selectedTemplate.footerTopMargin,
        logoUrl: selectedTemplate.logoUrl,
        type: selectedTemplate.type
      };
      
      console.log("Snapshot du template créée:", templateSnapshot);
      
      // Vérifier si un contrat existe déjà
      if (contratId) {
        console.log("Mise à jour du contrat existant:", contratId);
        const contratRef = doc(db, 'contrats', contratId);
        await updateDoc(contratRef, {
          pdfUrl: url,
          templateId: selectedTemplateId,
          templateSnapshot, // NOUVEAU: Stocker la snapshot du template
          dateGeneration: serverTimestamp(),
          variables
        });
        console.log("Contrat mis à jour avec succès");
        
        return contratId;
      } else {
        console.log("Création d'un nouveau contrat pour le concert:", concert.id);
        const contratData = {
          concertId: concert.id,
          templateId: selectedTemplateId,
          templateSnapshot, // NOUVEAU: Stocker la snapshot du template
          dateGeneration: serverTimestamp(),
          dateEnvoi: null,
          status: 'generated',
          pdfUrl: url,
          variables
        };
        
        console.log("Données du contrat à enregistrer:", contratData);
        
        try {
          const docRef = await addDoc(collection(db, 'contrats'), contratData);
          console.log("Nouveau contrat créé avec ID:", docRef.id);
          setContratId(docRef.id);
          return docRef.id;
        } catch (innerError) {
          console.error("Erreur lors de l'ajout du document:", innerError);
          console.error("Code:", innerError.code);
          console.error("Message:", innerError.message);
          throw innerError;
        }
      }
    } catch (error) {
      console.error('Erreur détaillée lors de la sauvegarde du contrat:', error);
      console.error('Type d\'erreur:', error.constructor.name);
      console.error('Message d\'erreur:', error.message);
      console.error('Code d\'erreur:', error.code);
      console.error('Stack trace:', error.stack);
      
      setErrorMessage(`Erreur lors de la sauvegarde du contrat: ${error.message}`);
      setShowErrorAlert(true);
      throw error;
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2">Chargement des modèles de contrat...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Génération de contrat</Card.Title>
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Aucun modèle de contrat n'est disponible. Veuillez créer un modèle dans les paramètres.
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Génération de contrat</Card.Title>
        
        {/* Affichage des alertes d'erreur/succès */}
        {showErrorAlert && (
          <Alert variant="danger" onClose={() => setShowErrorAlert(false)} dismissible>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {errorMessage}
          </Alert>
        )}
        
        {showSuccessAlert && (
          <Alert variant="success" onClose={() => setShowSuccessAlert(false)} dismissible>
            <i className="bi bi-check-circle-fill me-2"></i>
            Contrat généré et sauvegardé avec succès !
          </Alert>
        )}
        
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Sélectionnez un modèle de contrat:</Form.Label>
            <Form.Select
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              disabled={generatingPdf}
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} {template.isDefault ? '(par défaut)' : ''}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
        
        {selectedTemplate && (
          <>
            <div className="template-preview mt-3">
              <h6>Aperçu du modèle</h6>
              {selectedTemplate.bodyContent ? (
                <div className="template-body-preview">
                  <p className="text-muted small">Ce modèle utilise le format avec en-tête, corps et pied de page.</p>
                </div>
              ) : (
                <p className="text-danger">Attention: Ce modèle ne contient pas de contenu principal.</p>
              )}
            </div>
            
            <div className="mt-4">
              {contratId && (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Un contrat a déjà été généré pour ce concert. Vous pouvez le régénérer avec un nouveau modèle.
                </div>
              )}
              
              {validateDataBeforeGeneration() ? (
                <PDFDownloadLink
                  document={
                    <ContratPDFWrapper 
                      template={selectedTemplate}
                      contratData={contratId ? { templateSnapshot: selectedTemplate } : null} // NOUVEAU: Passage de templateSnapshot
                      concertData={concert}
                      programmateurData={programmateur}
                      artisteData={artiste}
                      lieuData={lieu}
                      entrepriseInfo={entrepriseInfo}
                    />
                  }
                  fileName={`Contrat_${concert.titre || 'Concert'}.pdf`}
                  className="btn btn-primary"
                >
                  {({ blob, url, loading, error }) => {
                    if (error) {
                      console.error("Erreur lors de la génération du PDF:", error);
                      return (
                        <button className="btn btn-danger" disabled>
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          Erreur de génération
                        </button>
                      );
                    }
                    
                    if (loading) {
                      return (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Préparation du PDF...
                        </>
                      );
                    }
                    
                    // Une fois que le PDF est prêt, sauvegarder l'URL
                    if (url && url !== pdfUrl) {
                      setPdfUrl(url);
                      saveGeneratedContract(url)
                        .then(id => {
                          console.log(`Contrat sauvegardé avec l'ID: ${id}`);
                          // Afficher une notification de succès
                          setShowSuccessAlert(true);
                          setTimeout(() => setShowSuccessAlert(false), 3000);
                        })
                        .catch(err => {
                          console.error('Erreur de sauvegarde:', err);
                          // Afficher une notification d'erreur
                          setErrorMessage("Erreur lors de la sauvegarde du contrat: " + err.message);
                          setShowErrorAlert(true);
                        });
                    }
                    
                    return (
                      <>
                        <i className="bi bi-file-pdf me-2"></i>
                        {contratId ? "Régénérer et télécharger" : "Générer et télécharger"}
                      </>
                    );
                  }}
                </PDFDownloadLink>
              ) : (
                <button className="btn btn-warning" disabled>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Données insuffisantes pour générer le contrat
                </button>
              )}
              
              {contratId && (
                <Button 
                  variant="outline-info" 
                  className="ms-2"
                  onClick={() => window.location.href = `/contrats/${contratId}`}
                >
                  <i className="bi bi-eye me-2"></i>
                  Voir le contrat généré
                </Button>
              )}
            </div>
          </>
        )}
        
        {/* Bouton de débogage */}
        <div className="mt-4">
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => setShowDebugInfo(!showDebugInfo)}
          >
            <i className={`bi bi-${showDebugInfo ? 'eye-slash' : 'bug'} me-2`}></i>
            {showDebugInfo ? "Masquer les infos de débogage" : "Afficher les infos de débogage"}
          </Button>
        </div>
        
        {/* Section de débogage */}
        {showDebugInfo && (
          <div className="card mt-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Informations de débogage</h5>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowDebugInfo(false)}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="card-body">
              <h6>Modèle sélectionné</h6>
              <pre className="bg-light p-2" style={{maxHeight: '200px', overflow: 'auto'}}>
                {JSON.stringify(selectedTemplate, null, 2)}
              </pre>
              
              <h6>Données du concert</h6>
              <pre className="bg-light p-2" style={{maxHeight: '200px', overflow: 'auto'}}>
                {JSON.stringify(concert, null, 2)}
              </pre>
              
              <h6>Données du programmateur</h6>
              <pre className="bg-light p-2" style={{maxHeight: '200px', overflow: 'auto'}}>
                {JSON.stringify(programmateur, null, 2)}
              </pre>
              
              <h6>Données de l'artiste</h6>
              <pre className="bg-light p-2" style={{maxHeight: '200px', overflow: 'auto'}}>
                {JSON.stringify(artiste, null, 2)}
              </pre>
              
              <h6>Données du lieu</h6>
              <pre className="bg-light p-2" style={{maxHeight: '200px', overflow: 'auto'}}>
                {JSON.stringify(lieu, null, 2)}
              </pre>
              
              <h6>Informations d'entreprise</h6>
              <pre className="bg-light p-2" style={{maxHeight: '200px', overflow: 'auto'}}>
                {JSON.stringify(entrepriseInfo, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ContratGenerator;
