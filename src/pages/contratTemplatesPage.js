// src/pages/contratTemplatesPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, getDocs, doc, deleteDoc, query, where, orderBy, addDoc, updateDoc, serverTimestamp } from '@/firebase';
import '@styles/index.css';

// Imports supplémentaires de la branche refacto-structure-scriptshell
import { Button, Card, Table, Badge, Form } from 'react-bootstrap';
import ContratTemplateEditor from '@components/contrats/ContratTemplateEditor';
import Modal from '@components/common/Modal';

const ContratTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // États pour la modale
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [isNewTemplate, setIsNewTemplate] = useState(false);
  
  // État pour basculer entre la modale de test et la vraie modale
  const [useTestModal, setUseTestModal] = useState(true); // true = modale de test, false = vraie modale

  // Ajouter useEffect pour déboguer les changements d'état de la modale
  useEffect(() => {
    console.log("État de showEditorModal a changé:", showEditorModal);
    console.log("Template actuel:", currentTemplate);
    console.log("isNewTemplate:", isNewTemplate);
    console.log("useTestModal:", useTestModal);
  }, [showEditorModal, currentTemplate, isNewTemplate, useTestModal]);

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
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Bouton pour basculer entre les modales */}
          <Button 
            variant={useTestModal ? "outline-secondary" : "outline-primary"} 
            onClick={() => setUseTestModal(!useTestModal)}
            size="sm"
          >
            {useTestModal ? "Utiliser vraie modale" : "Utiliser modale de test"}
          </Button>
          
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
      
      {/* OPTION 1: Test avec une modale simple sans ContratTemplateEditor */}
      {showEditorModal && useTestModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1050
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '1000px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3>{isNewTemplate ? 'Créer un nouveau modèle de contrat' : 'Modifier le modèle de contrat'}</h3>
              <button 
                className="btn btn-sm btn-outline-secondary" 
                onClick={handleCloseEditor}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div>
              <p style={{ fontSize: '18px', textAlign: 'center', padding: '50px' }}>
                Si vous voyez ce message, la modale fonctionne correctement.
                Le problème vient du composant Modal ou ContratTemplateEditor.
              </p>
              <div style={{ textAlign: 'center' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleCloseEditor}
                >
                  Fermer la modale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/*} OPTION 2: Utilisation du composant Modal avec ContratTemplateEditor */}
      {showEditorModal && !useTestModal && (
        <Modal 
        isOpen={showEditorModal} 
        onClose={handleCloseEditor}
        title={isNewTemplate ? 'Créer un nouveau modèle de contrat' : 'Modifier le modèle de contrat'}
        size="large"
      >
        {/* Wrapper de débogage autour du ContratTemplateEditor */}
        <div style={{ border: '1px dashed #ccc', padding: '10px', marginBottom: '10px' }}>
          <div style={{ backgroundColor: '#f8f9fa', padding: '8px', marginBottom: '10px', fontSize: '12px' }}>
            Wrapper de débogage: ContratTemplateEditor va apparaître ci-dessous
          </div>
          
          <ContratTemplateEditor
            template={currentTemplate}
            onSave={handleSaveTemplate}
            isModal={true}
          />
        </div>
      </Modal>
      )}
    </div>
  );
};

export default ContratTemplatesPage;
