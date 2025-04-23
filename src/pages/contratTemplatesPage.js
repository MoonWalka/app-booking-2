// src/pages/contratTemplatesPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, getDocs, doc, deleteDoc, query, where, orderBy, addDoc, updateDoc, serverTimestamp } from '@/firebase';
import '@styles/index.css';

// Imports
import { Button } from 'react-bootstrap';
// Importer uniquement le composant dédié qui fonctionne
import ContratTemplateEditorModal from '@components/contrats/ContratTemplateEditorModal';

const ContratTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // États pour la modale
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [isNewTemplate, setIsNewTemplate] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const templatesQuery = query(
          collection(db, 'contratTemplates'), 
          orderBy('updatedAt', 'desc')
        );
        const templatesSnapshot = await getDocs(templatesQuery);
        const templatesList = templatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTemplates(templatesList);
      } catch (error) {
        console.error('Erreur lors de la récupération des modèles de contrat:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle de contrat ?')) {
      try {
        await deleteDoc(doc(db, 'contratTemplates', id));
        setTemplates(templates.filter(template => template.id !== id));
        
        console.log('Modèle supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression du modèle:', error);
        alert('Une erreur est survenue lors de la suppression du modèle.');
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      // Version sans batch - effectuer les mises à jour individuellement
      const defaultTemplates = templates.filter(t => t.isDefault && t.id !== id);
      for (const template of defaultTemplates) {
        await updateDoc(doc(db, 'contratTemplates', template.id), { 
          isDefault: false 
        });
      }
      
      await updateDoc(doc(db, 'contratTemplates', id), { 
        isDefault: true 
      });
      
      setTemplates(templates.map(template => ({
        ...template,
        isDefault: template.id === id
      })));
      
      console.log('Modèle défini comme défaut avec succès');
    } catch (error) {
      console.error('Erreur lors de la définition du modèle par défaut:', error);
      alert('Une erreur est survenue lors de la mise à jour du modèle par défaut.');
    }
  };

  // Fonctions pour la gestion de la modale
  const handleEditTemplate = (template) => {
    console.log("handleEditTemplate appelé avec template:", template);
    setCurrentTemplate(template);
    setIsNewTemplate(false);
    setShowEditorModal(true);
  };
  
  const handleCreateTemplate = () => {
    console.log("handleCreateTemplate appelé");
    setCurrentTemplate(null);
    setIsNewTemplate(true);
    setShowEditorModal(true);
  };
  
  const handleCloseEditor = () => {
    console.log("handleCloseEditor appelé");
    setShowEditorModal(false);
    // Attendre que la transition de fermeture soit terminée avant de réinitialiser
    setTimeout(() => {
      setCurrentTemplate(null);
    }, 300);
  };
  
  const handleSaveTemplate = async (templateData) => {
    console.log("handleSaveTemplate appelé avec data:", templateData);
    try {
      if (isNewTemplate) {
        // Création d'un nouveau modèle
        const docRef = await addDoc(collection(db, 'contratTemplates'), {
          ...templateData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        const newTemplate = {
          id: docRef.id,
          ...templateData,
          createdAt: { seconds: Date.now() / 1000 },
          updatedAt: { seconds: Date.now() / 1000 }
        };
        
        setTemplates([newTemplate, ...templates]);
      } else {
        // Mise à jour d'un modèle existant
        await updateDoc(doc(db, 'contratTemplates', currentTemplate.id), {
          ...templateData,
          updatedAt: serverTimestamp()
        });
        
        // Mettre à jour l'état local
        setTemplates(templates.map(template => 
          template.id === currentTemplate.id 
            ? { 
                ...template, 
                ...templateData, 
                updatedAt: { seconds: Date.now() / 1000 } 
              } 
            : template
        ));
      }
      
      // Fermer la modale après sauvegarde
      handleCloseEditor();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du modèle:', error);
      alert('Une erreur est survenue lors de la sauvegarde du modèle.');
    }
  };

  return (
    <div className="contrat-templates-container">
      <div className="templates-header">
        <h2>Modèles de contrats</h2>
        <Button 
          variant="primary" 
          onClick={() => {
            console.log("Bouton Créer un modèle cliqué");
            handleCreateTemplate();
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>Créer un modèle
        </Button>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : templates.length === 0 ? (
        <div className="no-templates-message">
          <i className="bi bi-file-earmark-text"></i>
          <p>Aucun modèle de contrat n'a été créé.</p>
          <Button 
            variant="outline-primary" 
            onClick={() => {
              console.log("Bouton Créer votre premier modèle cliqué");
              handleCreateTemplate();
            }}
          >
            Créer votre premier modèle
          </Button>
        </div>
      ) : (
        <div className="templates-grid">
          {templates.map((template) => (
            <div key={template.id} className={`template-card ${template.isDefault ? 'default-template' : ''}`}>
              <div className="template-header">
                <h3>{template.name}</h3>
                {template.isDefault && (
                  <span className="default-badge">
                    <i className="bi bi-star-fill"></i> Par défaut
                  </span>
                )}
              </div>
              <div className="template-info">
                <p>
                  <i className="bi bi-calendar3"></i>
                  Mis à jour le {new Date(template.updatedAt.seconds * 1000).toLocaleDateString()}
                </p>
                <p>
                  <i className="bi bi-list-ul"></i>
                  {template.sections ? template.sections.length : 0} sections
                </p>
              </div>
              <div className="template-actions">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => {
                    console.log("Bouton Modifier cliqué pour template:", template.id);
                    handleEditTemplate(template);
                  }}
                >
                  <i className="bi bi-pencil"></i> Modifier
                </Button>
                
                {!template.isDefault && (
                  <Button 
                    variant="outline-success" 
                    size="sm"
                    onClick={() => handleSetDefault(template.id)}
                  >
                    <i className="bi bi-star"></i> Définir par défaut
                  </Button>
                )}
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                  disabled={template.isDefault}
                >
                  <i className="bi bi-trash"></i> {template.isDefault ? 'Non supprimable' : 'Supprimer'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Utilisation du composant dédié ContratTemplateEditorModal */}
      <ContratTemplateEditorModal
        isOpen={showEditorModal}
        onClose={handleCloseEditor}
        template={currentTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  );
};

export default ContratTemplatesPage;
