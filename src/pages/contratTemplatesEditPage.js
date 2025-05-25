import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import ContratTemplateEditor from '@/components/contrats/ContratTemplateEditor';
import '@styles/index.css';

const ContratTemplatesEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        if (id === 'nouveau') {
          // Nouveau template
          setTemplate({
            nom: '',
            contenu: '',
            variables: [],
            isDefault: false
          });
          setLoading(false);
          return;
        }

        // Template existant
        const templateRef = doc(db, 'contratTemplates', id);
        const templateDoc = await getDoc(templateRef);

        if (templateDoc.exists()) {
          const templateData = templateDoc.data();
          setTemplate({ id: templateDoc.id, ...templateData });
        } else {
          setError('Template non trouvé');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du template:', error);
        setError('Erreur lors de la récupération du template');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  const handleSave = async (templateData) => {
    try {
      if (id === 'nouveau') {
        // Créer un nouveau template
        const templateId = `template_${Date.now()}`;
        const templateRef = doc(db, 'contratTemplates', templateId);
        
        await setDoc(templateRef, {
          ...templateData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        navigate(`/contrats/templates/${templateId}`);
      } else {
        // Mettre à jour le template existant
        const templateRef = doc(db, 'contratTemplates', id);
        await updateDoc(templateRef, {
          ...templateData,
          updatedAt: new Date()
        });
        
        setTemplate({ id, ...templateData });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError('Erreur lors de la sauvegarde du template');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">
            {id === 'nouveau' ? 'Nouveau modèle de contrat' : 'Éditer le modèle de contrat'}
          </h1>
          
          {template && (
            <ContratTemplateEditor
              template={template}
              onSave={handleSave}
              onCancel={() => navigate('/contrats/templates')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ContratTemplatesEditPage;
