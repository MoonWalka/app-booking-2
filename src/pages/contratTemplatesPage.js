// src/pages/contratTemplatesPage.js - MODIFIÉ
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db, collection, getDocs, getDoc, doc, deleteDoc, query, orderBy, addDoc, updateDoc, serverTimestamp } from '@/services/firebase-service';
import '@styles/index.css';
import { Button, Badge, Alert } from 'react-bootstrap';
import Table from '@/components/ui/Table';
import Card from '@components/ui/Card';
import FlexContainer from '@/components/ui/FlexContainer';
import ContratTemplateEditorModal from '@/components/contrats/ContratTemplateEditorModal';




const ContratTemplatesPage = () => {

  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // États pour la modale
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [isNewTemplate, setIsNewTemplate] = useState(false);
  const [success, setSuccess] = useState(null);

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

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle de contrat ?')) {
      try {
        await deleteDoc(doc(db, 'contratTemplates', id));
        setTemplates(prev => prev.filter(template => template.id !== id));
        
        if (window.DISABLE_AUTO_SAVE !== true) {
          setSuccess('Modèle supprimé avec succès');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du modèle:', error);
        alert('Une erreur est survenue lors de la suppression du modèle.');
      }
    }
  }, []);

  const handleSetDefault = useCallback(async (id) => {
    try {
      // Optimisation : Mettre à jour l'état immédiatement
      setTemplates(prev => prev.map(template => ({
        ...template,
        isDefault: template.id === id
      })));
      
      // Effectuer les updates DB en arrière-plan
      setTemplates(prev => {
        const defaultTemplates = prev.filter(t => t.isDefault && t.id !== id);
        
        // Updates DB async
        (async () => {
          for (const template of defaultTemplates) {
            await updateDoc(doc(db, 'contratTemplates', template.id), { 
              isDefault: false 
            });
          }
          
          await updateDoc(doc(db, 'contratTemplates', id), { 
            isDefault: true 
          });
        })();
        
        return prev; // Garder l'état actuel
      });
      
      if (window.DISABLE_AUTO_SAVE !== true) {
        setSuccess('Modèle défini comme défaut avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la définition du modèle par défaut:', error);
      alert('Une erreur est survenue lors de la mise à jour du modèle par défaut.');
    }
  }, []); // 🔧 CORRECTION: Pas de dépendance templates

  // 🔧 SOLUTION: Mémoriser les fonctions pour éviter les re-créations
  const handleEditTemplate = useCallback(async (template) => {
    console.log('🔄 Edition template - Récupération depuis la DB:', template.id);
    setCurrentTemplate(null); // Clear d'abord pour forcer le reload
    
    try {
      // Récupérer les données fraîches depuis la base de données
      const templateDoc = await getDoc(doc(db, 'contratTemplates', template.id));
      if (templateDoc.exists()) {
        const freshTemplate = { id: templateDoc.id, ...templateDoc.data() };
        console.log('✅ Template frais récupéré:', {
          id: freshTemplate.id,
          name: freshTemplate.name,
          bodyContentLength: freshTemplate.bodyContent?.length
        });
        setCurrentTemplate(freshTemplate);
      } else {
        console.warn('⚠️ Template non trouvé en DB, utilisation cache local');
        setCurrentTemplate(template);
      }
    } catch (error) {
      console.error('❌ Erreur récupération template:', error);
      setCurrentTemplate(template); // Fallback vers les données locales
    }
    
    setIsNewTemplate(false);
    setShowEditorModal(true);
  }, []);
  
  const handleCreateTemplate = useCallback(() => {
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
  }, []);
  
  // Fonction pour rafraîchir la liste des templates depuis la DB
  const refreshTemplatesList = useCallback(async () => {
    console.log('🔄 Rafraîchissement liste templates depuis DB');
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
      console.log('✅ Liste templates rafraîchie:', templatesList.length, 'templates');
    } catch (error) {
      console.error('❌ Erreur rafraîchissement templates:', error);
    }
  }, []);

  const handleCloseEditor = useCallback(async () => {
    setShowEditorModal(false);
    
    // Rafraîchir la liste des templates depuis la DB après fermeture
    await refreshTemplatesList();
    
    // Attendre que la transition de fermeture soit terminée avant de réinitialiser
    setTimeout(() => {
      setCurrentTemplate(null);
    }, 300);
  }, [refreshTemplatesList]);
  
  const handleSaveTemplate = useCallback(async (templateData) => {
    // CORRECTION: Vérifier le flag de désactivation de la sauvegarde automatique
    if (window.DISABLE_AUTO_SAVE === true) {
      return;
    }
    
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
        // CORRECTION: Éviter les changements d'état qui provoquent des re-rendus
        if (window.DISABLE_AUTO_SAVE !== true) {
          setTemplates(prev => [newTemplate, ...prev]);
        }
      } else {
        // Mise à jour d'un modèle existant
        await updateDoc(doc(db, 'contratTemplates', currentTemplate.id), {
          ...templateData,
          updatedAt: serverTimestamp()
        });
        // Mettre à jour l'état local
        // CORRECTION: Éviter les changements d'état qui provoquent des re-rendus
        if (window.DISABLE_AUTO_SAVE !== true) {
          setTemplates(prev => prev.map(template => 
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
      }
      // Ne plus fermer la modale automatiquement ici
      // handleCloseEditor();
    } catch (error) {
      console.error('❌ [Firestore] Erreur lors de la sauvegarde du modèle:', error);
      alert('Une erreur est survenue lors de la sauvegarde du modèle.');
    }
  }, [isNewTemplate, currentTemplate]); // 🔧 CORRECTION: Plus de dépendance templates
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // 🔧 SOLUTION: Mémoriser les colonnes pour éviter les re-créations
  const columns = useMemo(() => [
    {
      key: 'name',
      label: 'Nom du modèle',
      sortable: true,
      render: (row) => (
        <FlexContainer align="center">
          <i className="bi bi-file-earmark-text me-2 text-primary"></i>
          <span className="fw-medium">{row.name}</span>
        </FlexContainer>
      )
    },
    {
      key: 'isDefault',
      label: 'Statut',
      sortable: true,
      render: (row) => (
        row.isDefault ? (
          <Badge bg="success" style={{ width: 'fit-content' }}>
            <FlexContainer align="center" inline>
              <i className="bi bi-star-fill me-1"></i> Par défaut
            </FlexContainer>
          </Badge>
        ) : (
          <Badge bg="secondary" style={{ width: 'fit-content' }}>Standard</Badge>
        )
      )
    },
    {
      key: 'updatedAt',
      label: 'Dernière mise à jour',
      sortable: true,
      render: (row) => (
        <FlexContainer align="center">
          <i className="bi bi-calendar3 me-2 text-muted"></i>
          {new Date(row.updatedAt.seconds * 1000).toLocaleDateString()}
        </FlexContainer>
      )
    },
    {
      key: 'sections',
      label: 'Sections',
      sortable: false,
      render: (row) => (
        <FlexContainer align="center">
          <i className="bi bi-list-ul me-2 text-muted"></i>
          {row.sections ? row.sections.length : 0}
        </FlexContainer>
      )
    }
  ], []);
  
  // 🔧 SOLUTION CRITIQUE: Mémoriser renderActions (cause principale des re-renders)
  const renderActions = useCallback((row) => (
    <FlexContainer align="center" justify="flex-start" gap="sm" className="action-buttons-row">
      <Button 
        className="tc-btn tc-btn-outline-primary tc-btn-sm"
        style={{ minWidth: '85px' }}
        onClick={() => {
          handleEditTemplate(row);
        }}
      >
        <i className="bi bi-pencil me-1"></i> Modifier
      </Button>
      
      {!row.isDefault && (
        <Button 
          className="tc-btn tc-btn-outline-success tc-btn-sm"
          style={{ minWidth: '85px' }}
          onClick={() => handleSetDefault(row.id)}
        >
          <i className="bi bi-star me-1"></i> Par défaut
        </Button>
      )}
      <Button 
        className="tc-btn tc-btn-outline-danger tc-btn-sm"
        style={{ minWidth: '85px' }}
        onClick={() => handleDelete(row.id)}
        disabled={row.isDefault}
      >
        <i className="bi bi-trash me-1"></i>
        {row.isDefault ? '' : 'Supprimer'}
      </Button>
    </FlexContainer>
  ), [handleEditTemplate, handleSetDefault, handleDelete]);

  return (
    <Card>
      <h3 className="mb-3">Modèles de contrats</h3>
      {success && <Alert variant="success" className="mb-3">{success}</Alert>}
      {loading ? (
        <div className="text-center my-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : templates.length === 0 ? (
        <div className="no-templates-message mb-4">
          <i className="bi bi-file-earmark-text mb-2"></i>
          <p>Aucun modèle de contrat n'a été créé.</p>
        </div>
      ) : (
        <Table 
          columns={columns}
          data={templates}
          renderActions={renderActions}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          className="mb-4"
        />
      )}
      <div className="parametre-actions">
        <button
          type="button"
          className="tc-btn tc-btn-primary tc-font-medium text-white"
          onClick={() => {
            handleCreateTemplate();
          }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Créer un modèle
        </button>
      </div>
      <ContratTemplateEditorModal
        isOpen={showEditorModal}
        onClose={handleCloseEditor}
        template={currentTemplate}
        onSave={handleSaveTemplate}
      />

    </Card>
  );
};

export default ContratTemplatesPage;
