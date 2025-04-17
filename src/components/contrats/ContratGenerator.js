import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { collection, query, where, orderBy, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import ContratPDF from './ContratPDF';
import '../../style/contratGenerator.css';

const ContratGenerator = ({ concert, programmateur, artiste, lieu }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  
  // Charger les modèles de contrat disponibles
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
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
      } catch (error) {
        console.error('Erreur lors de la récupération des modèles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);
  
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
  
  // Fonction pour sauvegarder le contrat généré
  const saveGeneratedContract = async (pdfUrl) => {
    try {
      const contratData = {
        concertId: concert.id,
        templateId: selectedTemplateId,
        createdAt: new Date(),
        status: 'draft',
        pdfUrl: pdfUrl,
      };
      
      const docRef = await addDoc(collection(db, 'generatedContrats'), contratData);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du contrat:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="contrat-generator-loading">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <span className="ms-2">Chargement des modèles de contrat...</span>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="contrat-generator-empty">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Aucun modèle de contrat n'est disponible. Veuillez créer un modèle dans les paramètres.
        </div>
      </div>
    );
  }

  return (
    <div className="contrat-generator">
      <div className="contrat-generator-header">
        <h4>Générer un contrat</h4>
      </div>
      
      <div className="contrat-generator-form">
        <div className="form-group">
          <label htmlFor="templateSelect">Sélectionnez un modèle de contrat:</label>
          <select
            id="templateSelect"
            className="form-select"
            value={selectedTemplateId}
            onChange={handleTemplateChange}
          >
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} {template.isDefault ? '(par défaut)' : ''}
              </option>
            ))}
          </select>
        </div>
        
        {selectedTemplate && (
          <div className="template-preview mt-3">
            <div className="template-preview-header">
              <h5>Aperçu des sections</h5>
            </div>
            <div className="template-sections-list">
              {selectedTemplate.sections.map((section, index) => (
                <div key={index} className="template-section-item">
                  <span className="section-number">{index + 1}</span>
                  <span className="section-title">{section.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="contrat-actions mt-4">
          {selectedTemplate && (
            <PDFDownloadLink
              document={
                <ContratPDF 
                  template={selectedTemplate}
                  concertData={concert}
                  programmateurData={programmateur}
                  artisteData={artiste}
                  lieuData={lieu}
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
                if (url && !pdfUrl) {
                  setPdfUrl(url);
                  saveGeneratedContract(url)
                    .then(id => console.log(`Contrat sauvegardé avec l'ID: ${id}`))
                    .catch(err => console.error('Erreur de sauvegarde:', err));
                }
                
                return (
                  <>
                    <i className="bi bi-file-pdf me-2"></i>
                    Télécharger le contrat PDF
                  </>
                );
              }}
            </PDFDownloadLink>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContratGenerator;
