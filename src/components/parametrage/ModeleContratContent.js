import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db, collection, getDocs, getDoc, doc, deleteDoc, query, orderBy, addDoc, updateDoc, serverTimestamp } from '@/services/firebase-service';
import { Button, Badge, Alert } from 'react-bootstrap';
import Table from '@/components/ui/Table';
import Card from '@components/ui/Card';
import FlexContainer from '@/components/ui/FlexContainer';
import ContratTemplateEditorModal from '@/components/contrats/ContratTemplateEditorModal';

const ModeleContratContent = () => {
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
      setTemplates(prev => prev.map(template => ({
        ...template,
        isDefault: template.id === id
      })));
      
      setTemplates(prev => {
        const defaultTemplates = prev.filter(t => t.isDefault && t.id !== id);
        
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
        
        return prev;
      });
      
      if (window.DISABLE_AUTO_SAVE !== true) {
        setSuccess('Modèle défini comme défaut avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la définition du modèle par défaut:', error);
      alert('Une erreur est survenue lors de la mise à jour du modèle par défaut.');
    }
  }, []);

  const handleEditTemplate = useCallback(async (template) => {
    setCurrentTemplate(null);
    
    try {
      const templateDoc = await getDoc(doc(db, 'contratTemplates', template.id));
      if (templateDoc.exists()) {
        const freshTemplate = { id: templateDoc.id, ...templateDoc.data() };
        setCurrentTemplate(freshTemplate);
      } else {
        setCurrentTemplate(template);
      }
    } catch (error) {
      console.error('Erreur récupération template:', error);
      setCurrentTemplate(template);
    }
    
    setIsNewTemplate(false);
    setShowEditorModal(true);
  }, []);
  
  const handleCreateTemplate = useCallback(() => {
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
      titleTemplate: 'Contrat - {date_titre}',
      signatureTemplate: `<div style="display: flex; justify-content: space-between; margin-top: 30px;">
        <div style="width: 45%;">
          <div style="margin-bottom: 50px;"><strong>Pour l'Organisateur:</strong></div>
          <div>{contact_nom}</div>
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
  
  const refreshTemplatesList = useCallback(async () => {
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
      console.error('Erreur rafraîchissement templates:', error);
    }
  }, []);

  const handleCloseEditor = useCallback(async () => {
    setShowEditorModal(false);
    await refreshTemplatesList();
    setTimeout(() => {
      setCurrentTemplate(null);
    }, 300);
  }, [refreshTemplatesList]);
  
  const handleSaveTemplate = useCallback(async (templateData) => {
    if (window.DISABLE_AUTO_SAVE === true) {
      return;
    }
    
    try {
      if (isNewTemplate) {
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
        if (window.DISABLE_AUTO_SAVE !== true) {
          setTemplates(prev => [newTemplate, ...prev]);
        }
      } else {
        await updateDoc(doc(db, 'contratTemplates', currentTemplate.id), {
          ...templateData,
          updatedAt: serverTimestamp()
        });
        if (window.DISABLE_AUTO_SAVE !== true) {
          setTemplates(prev => prev.map(template => 
            template.id === currentTemplate.id 
              ? { 
                  ...template, 
                  ...templateData,
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
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du modèle:', error);
      alert('Une erreur est survenue lors de la sauvegarde du modèle.');
    }
  }, [isNewTemplate, currentTemplate]);
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
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
      {/* Header élégant avec titre et bouton */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div className="d-flex align-items-center">
          <i className="bi bi-file-earmark-text me-3 text-primary" style={{ fontSize: '1.5rem' }}></i>
          <div>
            <h4 className="mb-1">Modèles de contrats</h4>
            <p className="text-muted mb-0 small">Gérez et personnalisez vos modèles de contrats</p>
          </div>
        </div>
        <Button
          className="tc-btn tc-btn-primary d-flex align-items-center"
          onClick={handleCreateTemplate}
          style={{ 
            minWidth: '160px',
            boxShadow: '0 2px 4px rgba(13, 110, 253, 0.15)'
          }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Créer un modèle
        </Button>
      </div>

      {success && <Alert variant="success" className="mb-3">{success}</Alert>}
      
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="text-muted mt-3">Chargement des modèles...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-file-earmark-text text-muted" style={{ fontSize: '4rem' }}></i>
          <h5 className="mt-3 text-muted">Aucun modèle de contrat</h5>
          <p className="text-muted">Commencez par créer votre premier modèle de contrat.</p>
          <Button 
            className="tc-btn tc-btn-outline-primary mt-3"
            onClick={handleCreateTemplate}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Créer mon premier modèle
          </Button>
        </div>
      ) : (
        <Table 
          columns={columns}
          data={templates}
          renderActions={renderActions}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          className="mb-0"
        />
      )}
      
      <ContratTemplateEditorModal
        isOpen={showEditorModal}
        onClose={handleCloseEditor}
        template={currentTemplate}
        onSave={handleSaveTemplate}
      />
    </Card>
  );
};

export default ModeleContratContent;