import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseInit';
import { v4 as uuidv4 } from 'uuid';

const FormGenerator = ({ concertId, programmateurId, onFormGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [formLink, setFormLink] = useState('');
  const [existingLink, setExistingLink] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [copied, setCopied] = useState(false);

  // Charger un lien existant au démarrage
  useEffect(() => {
    const fetchExistingLink = async () => {
      try {
        setLoadingExisting(true);
        // Vérifier si le concert a déjà un formLinkId
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        if (concertDoc.exists() && concertDoc.data().formLinkId) {
          const formLinkId = concertDoc.data().formLinkId;
          const formLinkDoc = await getDoc(doc(db, 'formLinks', formLinkId));
          
          if (formLinkDoc.exists()) {
            const linkData = formLinkDoc.data();
            
            // Vérifier si le lien n'est pas expiré
            const now = new Date();
            const expiryDate = linkData.expiryDate?.toDate();
            
            if (expiryDate && expiryDate > now) {
              // Reconstruire l'URL du formulaire
              const baseUrl = window.location.origin;
              const useHash = window.location.href.includes('#');
              let formUrl;
              
              if (useHash) {
                formUrl = `${baseUrl}/#/formulaire/${concertId}/${linkData.token}`;
              } else {
                formUrl = `${baseUrl}/formulaire/${concertId}/${linkData.token}`;
              }
              
              setFormLink(formUrl);
              setExistingLink(linkData);
              setExpiryDate(expiryDate);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du lien existant:', error);
      } finally {
        setLoadingExisting(false);
      }
    };
    
    fetchExistingLink();
  }, [concertId]);

  const generateForm = async () => {
    setLoading(true);
    try {
      // Générer un token unique
      const token = uuidv4();
      
      // Calculer la date d'expiration (30 jours à partir de maintenant)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      setExpiryDate(expiryDate);
      
      // Créer un document dans la collection formLinks
      const formRef = await addDoc(collection(db, 'formLinks'), {
        concertId,
        programmateurId: programmateurId || null,
        token,
        createdAt: serverTimestamp(),
        expiryDate,
        completed: false
      });
      
      // Mettre à jour le concert avec l'ID du formulaire
      await updateDoc(doc(db, 'concerts', concertId), {
        formLinkId: formRef.id,
        updatedAt: serverTimestamp()
      });
      
      // Générer le lien du formulaire avec le format approprié
      const baseUrl = window.location.origin;
      const useHash = window.location.href.includes('#');
      let formUrl;
      
      if (useHash) {
        formUrl = `${baseUrl}/#/formulaire/${concertId}/${token}`;
      } else {
        formUrl = `${baseUrl}/formulaire/${concertId}/${token}`;
      }
      
      // Stocker l'URL dans le document formLinks
      await updateDoc(doc(db, 'formLinks', formRef.id), {
        formUrl: formUrl
      });
      
      setFormLink(formUrl);
      setExistingLink({
        id: formRef.id,
        token,
        expiryDate,
        formUrl
      });
      
      // Appeler le callback si fourni
      if (onFormGenerated) {
        onFormGenerated(formRef.id, formUrl);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du formulaire:', error);
      alert('Une erreur est survenue lors de la génération du formulaire');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Erreur lors de la copie dans le presse-papiers:', err);
      });
  };

  // Formater la date d'expiration
  const formatExpiryDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric'
    });
  };

  if (loadingExisting) {
    return (
      <div className="card mb-4">
        <div className="card-header">
          <h3>Formulaire pour le programmateur</h3>
        </div>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Vérification des liens existants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h3>Formulaire pour le programmateur</h3>
      </div>
      <div className="card-body">
        {!formLink ? (
          <div>
            <p>
              Générez un lien de formulaire à envoyer au programmateur pour qu'il puisse remplir ses informations.
            </p>
            <button
              className="btn btn-primary"
              onClick={generateForm}
              disabled={loading}
            >
              {loading ? 'Génération en cours...' : 'Générer un formulaire'}
            </button>
          </div>
        ) : (
          <div>
            <div className="alert alert-success mb-4">
              <i className="bi bi-check-circle-fill me-2"></i>
              <strong>Un lien de formulaire est actif</strong> - Valable jusqu'au {formatExpiryDate(expiryDate)}
            </div>
            
            <p>
              Voici le lien du formulaire à envoyer au programmateur :
            </p>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                value={formLink}
                readOnly
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={copyToClipboard}
              >
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <div className="alert alert-info mb-3">
              <i className="bi bi-info-circle me-2"></i>
              <span>Ce lien permet au programmateur de remplir ses informations pour ce concert sans avoir accès au reste de l'application.</span>
            </div>
            
            <div className="d-flex justify-content-between">
              <p className="text-muted">
                Ce lien est valable jusqu'au {formatExpiryDate(expiryDate)}.
              </p>
              <button
                className="btn btn-outline-primary"
                onClick={generateForm}
                disabled={loading}
              >
                {loading ? 'Génération en cours...' : 'Générer un nouveau lien'}
              </button>
            </div>
            
            {existingLink && existingLink.completed && (
              <div className="alert alert-warning mt-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Attention :</strong> Le formulaire a déjà été complété par le programmateur. Générer un nouveau lien si vous souhaitez qu'il puisse soumettre de nouvelles informations.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormGenerator;
