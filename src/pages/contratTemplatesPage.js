// src/pages/contratTemplatesPage.js - MODIFIÉ
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, getDocs, doc, deleteDoc, query, where, orderBy, addDoc, updateDoc, serverTimestamp } from '@/firebaseInit';
import '@styles/index.css';
import { Button, Table, Badge } from 'react-bootstrap';
import ContratTemplateEditorModal from '@/components/contrats/ContratTemplateEditorModal';

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
    console.log("🟢 Template passé à la modale :", template);
    setCurrentTemplate(template);
    setIsNewTemplate(false);
    setShowEditorModal(true);
  };
  
  const handleCreateTemplate = () => {
    console.log("handleCreateTemplate appelé");
    // Créer un objet template vide pour un nouveau modèle
    // Ceci garantit que la modale s'ouvre toujours avec un nouvel objet vide
    // et non avec le dernier template édité
    const emptyTemplate = {
      name: 'Nouveau modèle',
      type: 'session',
      isDefault: false,
      bodyContent: '',
      headerContent: '',
      footerContent: '',
      headerHeight: 20,
      headerBottomMargin: 10,
      footerHeight: 15,
      footerTopMargin: 10,
      logoUrl: '',
      titleTemplate: 'Contrat - {concert_titre}',
      signatureTemplate: `<div style="display: flex; justify-content: space-between; margin-top: 30px;">
        <div style="width: 45%;">
          <div style="margin-bottom: 50px;"><strong>Pour l'Organisateur:</strong></div>
          <div>{programmateur_nom}</div>
          <div style="border-top: 1px solid #000; margin-top: 5px;"></div>
        </div>
        <div style="width: 45%;">
          <div style="margin-bottom: 50px;"><strong>Pour l'Artiste:</strong></div>
          <div>{artiste_nom}</div>
          <div style="border-top: 1px solid #000; margin-top: 5px;"></div>
        </div>
      </div>`
    };
    setCurrentTemplate(emptyTemplate);
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
    console.warn('⚡️ [Firestore] Début de la sauvegarde Firestore (modal)', templateData);
    try {
      if (isNewTemplate) {
        // Création d'un nouveau modèle
        const docRef = await addDoc(collection(db, 'contratTemplates'), {
          ...templateData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.warn('✅ [Firestore] Nouveau modèle créé avec addDoc, id:', docRef.id);
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
        console.warn('✅ [Firestore] Modèle mis à jour avec updateDoc, id:', currentTemplate.id);
        // Mettre à jour l'état local
        setTemplates(templates.map(template => 
          template.id === currentTemplate.id 
            ? { 
                ...template, 
                ...templateData,
                // Harmonisation des clés pour la liste locale
                bodyContent: templateData.bodyContent,
                headerContent: templateData.headerContent,
                footerContent: templateData.footerContent,
                signatureTemplate: templateData.signatureTemplate,
                updatedAt: { seconds: Date.now() / 1000 } 
              } 
            : template
        ));
      }
      // Ne plus fermer la modale automatiquement ici
      // handleCloseEditor();
    } catch (error) {
      console.error('❌ [Firestore] Erreur lors de la sauvegarde du modèle:', error);
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
        // Nouveau design en liste
        <div className="templates-list-container">
          <Table hover responsive className="templates-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Nom du modèle</th>
                <th style={{ width: '15%' }}>Statut</th>
                <th style={{ width: '20%' }}>Dernière mise à jour</th>
                <th style={{ width: '10%' }}>Sections</th>
                <th style={{ width: '25%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className={template.isDefault ? 'default-template-row' : ''}>
                  <td className="template-name-cell">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-file-earmark-text me-2 text-primary"></i>
                      <span className="fw-medium">{template.name}</span>
                    </div>
                  </td>
                  <td>
                    {template.isDefault ? (
                      <Badge bg="success" className="d-flex align-items-center" style={{ width: 'fit-content' }}>
                        <i className="bi bi-star-fill me-1"></i> Par défaut
                      </Badge>
                    ) : (
                      <Badge bg="secondary" style={{ width: 'fit-content' }}>Standard</Badge>
                    )}
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-calendar3 me-2 text-muted"></i>
                      {new Date(template.updatedAt.seconds * 1000).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-list-ul me-2 text-muted"></i>
                      {template.sections ? template.sections.length : 0}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center justify-content-start gap-2 flex-wrap">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="action-button mb-1"
                        style={{ minWidth: '85px', marginRight: '8px' }}
                        onClick={() => {
                          console.log("Bouton Modifier cliqué pour template:", template.id);
                          handleEditTemplate(template);
                        }}
                      >
                        <i className="bi bi-pencil me-1"></i> Modifier
                      </Button>
                      
                      {!template.isDefault && (
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          className="action-button mb-1"
                          style={{ minWidth: '85px', marginRight: '8px' }}
                          onClick={() => handleSetDefault(template.id)}
                        >
                          <i className="bi bi-star me-1"></i> Par défaut
                        </Button>
                      )}
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        className="action-button mb-1"
                        style={{ minWidth: '85px' }}
                        onClick={() => handleDelete(template.id)}
                        disabled={template.isDefault}
                      >
                        <i className="bi bi-trash me-1"></i>
                        {template.isDefault ? '' : 'Supprimer'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
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
