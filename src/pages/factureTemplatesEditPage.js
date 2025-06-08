import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import FactureTemplateEditor from '@/components/factures/FactureTemplateEditor';
import Spinner from '@/components/common/Spinner';

const FactureTemplatesEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const [template, setTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger le modèle de facture
  useEffect(() => {
    const loadTemplate = async () => {
      if (!user || !currentOrganization?.id || !id) return;
      
      try {
        setIsLoading(true);
        const templateRef = doc(db, 'organizations', currentOrganization.id, 'factureTemplates', id);
        const templateSnap = await getDoc(templateRef);
        
        if (templateSnap.exists()) {
          setTemplate({
            id: templateSnap.id,
            ...templateSnap.data()
          });
        } else {
          setError('Modèle de facture introuvable');
        }
      } catch (err) {
        console.error('Erreur lors du chargement du modèle:', err);
        setError('Erreur lors du chargement du modèle de facture');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [id, user, currentOrganization]);

  // Sauvegarder les modifications
  const handleSave = async (templateData) => {
    if (!currentOrganization?.id || !id) return;
    
    try {
      const templateRef = doc(db, 'organizations', currentOrganization.id, 'factureTemplates', id);
      await updateDoc(templateRef, {
        ...templateData,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid
      });
      
      // Retourner à la liste des modèles
      navigate('/parametres/factures');
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      alert('Erreur lors de la sauvegarde du modèle');
    }
  };

  // Retourner à la liste
  const handleClose = () => {
    navigate('/parametres/factures');
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <br />
        <button className="btn btn-link p-0 mt-2" onClick={() => navigate('/parametres/factures')}>
          Retour à la liste des modèles
        </button>
      </div>
    );
  }

  return (
    <FactureTemplateEditor
      template={template}
      onSave={handleSave}
      onClose={handleClose}
      isModalContext={false}
    />
  );
};

export default FactureTemplatesEditPage;