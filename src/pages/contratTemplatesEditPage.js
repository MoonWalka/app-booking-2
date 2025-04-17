import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import ContratTemplateEditor from '../components/contrats/ContratTemplateEditor';
import '../style/contratTemplateEdit.css';

const ContratTemplatesEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (id === 'nouveau') {
        // Nouveau modèle
        setTemplate({
          name: 'Nouveau modèle de contrat',
          isDefault: false,
          sections: [
            {
              title: 'Parties contractantes',
              content: '<p>Entre les soussignés:</p><p><strong>L\'Organisateur:</strong> {programmateur_nom}, {programmateur_structure}</p><p><strong>L\'Artiste:</strong> {artiste_nom}</p>'
            },
            {
              title: 'Objet du contrat',
              content: '<p>Le présent contrat a pour objet de définir les conditions dans lesquelles l\'Artiste se produira lors du concert intitulé "{concert_titre}" qui se déroulera le {concert_date} à {lieu_nom}, {lieu_adresse}, {lieu_code_postal} {lieu_ville}.</p>'
            },
            {
              title: 'Rémunération',
              content: '<p>L\'Organisateur s\'engage à verser à l\'Artiste la somme de {concert_montant} euros pour sa prestation.</p>'
            }
          ]
        });
        setLoading(false);
      } else {
        // Modèle existant
        try {
          const templateDoc = await getDoc(doc(db, 'contratTemplates', id));
          if (templateDoc.exists()) {
            setTemplate({
              id: templateDoc.id,
              ...templateDoc.data()
            });
          } else {
            console.error('Modèle de contrat non trouvé');
            navigate('/parametres/contrats');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du modèle:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTemplate();
  }, [id, navigate]);

  const handleSave = async (updatedTemplate) => {
    try {
      const templateId = id === 'nouveau' ? doc(collection(db, 'contratTemplates')).id : id;
      
      const templateData = {
        ...updatedTemplate,
        updatedAt: serverTimestamp(),
        ...(id === 'nouveau' && { createdAt: serverTimestamp() })
      };
      
      await setDoc(doc(db, 'contratTemplates', templateId), templateData, { merge: true });
      navigate('/parametres/contrats');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du modèle:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du modèle.');
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="template-edit-container">
      <ContratTemplateEditor template={template} onSave={handleSave} />
    </div>
  );
};

export default ContratTemplatesEditPage;
