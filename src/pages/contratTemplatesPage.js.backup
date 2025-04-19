import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc, query, where, orderBy } from './firebase/firestore';
import { db } from '../firebase.js.m1fix.bak';
import '../style/contratTemplates.css';

const ContratTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      } catch (error) {
        console.error('Erreur lors de la suppression du modèle:', error);
        alert('Une erreur est survenue lors de la suppression du modèle.');
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      // Mettre à jour tous les templates pour enlever isDefault
      const batch = db.batch();
      
      templates.forEach(template => {
        if (template.id !== id && template.isDefault) {
          const templateRef = doc(db, 'contratTemplates', template.id);
          batch.update(templateRef, { isDefault: false });
        }
      });
      
      // Définir le nouveau template par défaut
      const newDefaultRef = doc(db, 'contratTemplates', id);
      batch.update(newDefaultRef, { isDefault: true });
      
      await batch.commit();
      
      // Mettre à jour l'état local
      setTemplates(templates.map(template => ({
        ...template,
        isDefault: template.id === id
      })));
      
    } catch (error) {
      console.error('Erreur lors de la définition du modèle par défaut:', error);
      alert('Une erreur est survenue lors de la mise à jour du modèle par défaut.');
    }
  };

  return (
    <div className="contrat-templates-container">
      <div className="templates-header">
        <h2>Modèles de contrats</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/parametres/contrats/nouveau')}
        >
          <i className="bi bi-plus-circle me-2"></i>Créer un modèle
        </button>
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
          <button 
            className="btn btn-outline-primary" 
            onClick={() => navigate('/parametres/contrats/nouveau')}
          >
            Créer votre premier modèle
          </button>
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
                <button 
                  className="btn btn-sm btn-outline-primary" 
                  onClick={() => navigate(`/parametres/contrats/${template.id}`)}
                >
                  <i className="bi bi-pencil"></i> Modifier
                </button>
                {!template.isDefault && (
                  <button 
                    className="btn btn-sm btn-outline-success" 
                    onClick={() => handleSetDefault(template.id)}
                  >
                    <i className="bi bi-star"></i> Définir par défaut
                  </button>
                )}
                <button 
                  className="btn btn-sm btn-outline-danger" 
                  onClick={() => handleDelete(template.id)}
                  disabled={template.isDefault}
                >
                  <i className="bi bi-trash"></i> {template.isDefault ? 'Non supprimable' : 'Supprimer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContratTemplatesPage;