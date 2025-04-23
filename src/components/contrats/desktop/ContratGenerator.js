// src/components/contrats/ContratGenerator.js
import React, { useState, useEffect } from 'react';

import { Button, Form, Alert, Card, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/firebase';

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
} from '@/firebase';
import { PDFDownloadLink } from '@react-pdf/renderer';
// import ContratPDF from '@/components/contrats/ContratPDF.js';
import ContratPDF from '@components/contrats/ContratPDF.js';
// import '../../../style/contratGenerator.css';
import '@styles/index.css';

const ContratGenerator = ({ concert, programmateur, artiste, lieu }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [entrepriseInfo, setEntrepriseInfo] = useState(null);
  const [contratId, setContratId] = useState(null);
  
  // Charger les modèles de contrat disponibles et les infos d'entreprise
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Récupérer les modèles de contrat
        const templatesQuery = query(
          collection(db, 'contratTemplates'), 
          orderBy('name')
        );
        const templatesSnapshot = await getDocs(templatesQuery);
        const templatesList = templatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setTemplates(templatesList);
        
        // Sélectionner le modèle par défaut s'il existe
        const defaultTemplate = templatesList.find(t => t.isDefault);
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id);
          setSelectedTemplate(defaultTemplate);
        } else if (templatesList.length > 0) {
          // Sinon, sélectionner le premier modèle
          setSelectedTemplateId(templatesList[0].id);
          setSelectedTemplate(templatesList[0]);
        }
        
        // Charger les informations de l'entreprise
        const entrepriseDoc = await getDoc(doc(db, 'parametres', 'entreprise'));
        if (entrepriseDoc.exists()) {
          setEntrepriseInfo(entrepriseDoc.data());
        }
        
        // Vérifier si un contrat existe déjà pour ce concert
        if (concert?.id) {
          const contratsQuery = query(
            collection(db, 'contrats'),
            where('concertId', '==', concert.id)
          );
          const contratsSnapshot = await getDocs(contratsQuery);
          
          if (!contratsSnapshot.empty) {
            const contratData = contratsSnapshot.docs[0].data();
            setContratId(contratsSnapshot.docs[0].id);
            setPdfUrl(contratData.pdfUrl);
            
            // Si le contrat existe, utiliser son template
            if (contratData.templateId) {
              setSelectedTemplateId(contratData.templateId);
              const templateDoc = templatesSnapshot.docs.find(doc => doc.id === contratData.templateId);
              if (templateDoc) {
                setSelectedTemplate({
                  id: templateDoc.id,
                  ...templateDoc.data()
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
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
      setGeneratingPdf(true);
      
      const variables = prepareContractVariables();
      
      // Vérifier si un contrat existe déjà
      if (contratId) {
        // Mettre à jour le contrat existant
        const contratRef = doc(db, 'contrats', contratId);
        await updateDoc(contratRef, {
          pdfUrl: url,
          templateId: selectedTemplateId,
          dateGeneration: serverTimestamp(),
          variables
        });
        
        return contratId;
      } else {
        // Créer un nouveau contrat
        const contratData = {
          concertId: concert.id,
          templateId: selectedTemplateId,
          dateGeneration: serverTimestamp(),
          dateEnvoi: null,
          status: 'generated',
          pdfUrl: url,
          variables
        };
        
        const docRef = await addDoc(collection(db, 'contrats'), contratData);
        setContratId(docRef.id);
        return docRef.id;
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du contrat:', error);
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
              <h6>Aperçu des sections du modèle</h6>
              <div className="template-sections-list">
                {selectedTemplate.sections?.map((section, index) => (
                  <div key={index} className="template-section-item">
                    <span className="section-number">{index + 1}</span>
                    <span className="section-title">{section.title}</span>
                  </div>
                )) || <p>Aucune section définie</p>}
              </div>
            </div>
            
            <div className="mt-4">
              {contratId && (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Un contrat a déjà été généré pour ce concert. Vous pouvez le régénérer avec un nouveau modèle.
                </div>
              )}
              
              <PDFDownloadLink
                document={
                  <ContratPDF 
                    template={selectedTemplate}
                    concertData={concert}
                    programmateurData={programmateur}
                    artisteData={artiste}
                    lieuData={lieu}
                    entrepriseInfo={entrepriseInfo}
                  />
                }
                fileName={`Contrat_${concert.titre || 'Concert'}_${new Date().toISOString().slice(0, 10)}.pdf`}
                className="btn btn-primary"
              >
                {({ blob, url, loading, error }) => {
                  if (loading) {
                    return (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Préparation du PDF...
                      </>
                    );
                  }
                  
                  if (error) {
                    return 'Erreur lors de la génération du PDF';
                  }
                  
                  // Une fois que le PDF est prêt, sauvegarder l'URL
                  if (url && url !== pdfUrl) {
                    setPdfUrl(url);
                    saveGeneratedContract(url)
                      .then(id => console.log(`Contrat sauvegardé avec l'ID: ${id}`))
                      .catch(err => console.error('Erreur de sauvegarde:', err));
                  }
                  
                  return (
                    <>
                      <i className="bi bi-file-pdf me-2"></i>
                      {contratId ? "Régénérer et télécharger" : "Générer et télécharger"}
                    </>
                  );
                }}
              </PDFDownloadLink>
              
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
      </Card.Body>
    </Card>
  );
};

export default ContratGenerator;
