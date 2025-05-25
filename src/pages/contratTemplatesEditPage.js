import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, getDoc, doc, collection, setDoc, serverTimestamp } from '@/services/firebase-service';
// SUPPRIMÉ: import ContratTemplateEditor non utilisé
import ContratTemplateEditorModal from '@/components/contrats/ContratTemplateEditorModal';
import '@styles/index.css';;

const ContratTemplatesEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      console.log("Fetching template with ID:", id, "type:", typeof id);
      
      // Vérifier si l'ID est défini
      if (!id) {
        console.error("ID invalide:", id);
        setError("Identifiant de modèle manquant");
        setLoading(false);
        // Rediriger après un court délai
        setTimeout(() => navigate('/parametres/contrats'), 2000);
        return;
      }

      if (id === 'nouveau') {
        // Nouveau modèle avec bodyContent directement
        setTemplate({
          name: 'Nouveau modèle de contrat',
          isDefault: false,
          bodyContent: `
            <h3>Parties contractantes</h3>
            <p>Entre les soussignés:</p>
            <p><strong>L'Organisateur:</strong> {programmateur_nom}, {programmateur_structure}</p>
            <p><strong>L'Artiste:</strong> {artiste_nom}</p>
            
            <h3>Objet du contrat</h3>
            <p>Le présent contrat a pour objet de définir les conditions dans lesquelles l'Artiste se produira lors du concert intitulé "{concert_titre}" qui se déroulera le {concert_date} à {lieu_nom}, {lieu_adresse}, {lieu_code_postal} {lieu_ville}.</p>
            
            <h3>Rémunération</h3>
            <p>L'Organisateur s'engage à verser à l'Artiste la somme de {concert_montant} euros pour sa prestation.</p>
          `,
          headerContent: '',
          footerContent: '',
          headerHeight: 20,
          headerBottomMargin: 10,
          footerHeight: 15,
          footerTopMargin: 10
        });
        setLoading(false);
      } else {
        // Modèle existant
        try {
          console.log("Attempting to fetch template document with ID:", id);
          const templateRef = doc(db, 'contratTemplates', id);
          console.log("Template reference created:", templateRef);
          const templateDoc = await getDoc(templateRef);
          console.log("Template document fetched, exists:", templateDoc.exists());
          if (templateDoc.exists()) {
            const templateData = templateDoc.data();
            console.log("🧾 Données du contrat Firestore :", { id: templateDoc.id, ...templateData });
            setTemplate({
              id: templateDoc.id,
              ...templateData
            });
          } else {
            console.error('Modèle de contrat non trouvé');
            setError("Le modèle demandé n'existe pas");
            setTimeout(() => navigate('/parametres/contrats'), 2000);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du modèle:', error);
          setError(`Erreur lors de la récupération du modèle: ${error.message}`);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTemplate();
  }, [id, navigate]);

  useEffect(() => {
    if (template) {
      console.log("🧾 Contenu complet du template Firestore :", JSON.stringify(template, null, 2));
    }
  }, [template]);

  const handleSave = async (updatedTemplate) => {
    try {
      let templateId;
      
      if (id === 'nouveau') {
        // Créer un nouvel ID pour le document
        const templateRef = doc(collection(db, 'contratTemplates'));
        templateId = templateRef.id;
        console.log("Nouveau template ID généré:", templateId);
      } else {
        templateId = id;
      }
      
      console.log("Saving template with ID:", templateId);
      
      const templateData = {
        ...updatedTemplate,
        updatedAt: serverTimestamp(),
        ...(id === 'nouveau' && { createdAt: serverTimestamp() })
      };
      
      console.log("Template data to save:", templateData);
      
      await setDoc(doc(db, 'contratTemplates', templateId), templateData, { merge: true });
      console.log("Template saved successfully");
      
      // Redirection avec délai pour permettre à Firestore de finaliser l'opération
      setTimeout(() => navigate('/parametres/contrats'), 500);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du modèle:', error);
      setError(`Erreur lors de l'enregistrement: ${error.message}`);
    }
  };

  if (error) {
    return (
      <div className="alert alert-danger my-4">
        <h4>Erreur</h4>
        <p>{error}</p>
        <div className="mt-3">
          <button 
            className="tc-btn-outline-primary"
            onClick={() => navigate('/parametres/contrats')}
          >
            Retour à la liste des modèles
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2">Chargement du modèle...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="alert alert-warning my-4">
        <h4>Modèle non disponible</h4>
        <p>Le modèle demandé n'a pas pu être chargé.</p>
        <div className="mt-3">
          <button 
            className="tc-btn-outline-primary"
            onClick={() => navigate('/parametres/contrats')}
          >
            Retour à la liste des modèles
          </button>
        </div>
      </div>
    );
  }

  console.log('showModal:', showModal, 'template:', template);

  return (
    <div className="template-edit-container">
      <div className="mb-4">
        <button 
          className="tc-btn-outline-secondary"
          onClick={() => navigate('/parametres/contrats')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour à la liste
        </button>
      </div>
      
      <h2 className="mb-4">
        {id === 'nouveau' ? 'Créer un nouveau modèle' : 'Modifier le modèle'}
      </h2>
      {console.log('template avant bouton:', template)}
      <button
        className="tc-btn tc-btn-primary mb-3"
        onClick={() => {
          console.log('Bouton Éditer cliqué');
          setShowModal(true);
        }}
        disabled={!template}
      >
        Éditer le modèle
      </button>
      <ContratTemplateEditorModal
        isOpen={showModal && !!template}
        onClose={() => setShowModal(false)}
        template={template}
        onSave={handleSave}
      />
    </div>
  );
};

export default ContratTemplatesEditPage;
