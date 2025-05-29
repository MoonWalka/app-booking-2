import React, { useState, useEffect } from 'react';
import { db } from '@/services/firebase-service';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import Card from '@/components/ui/Card';
import Button from '@ui/Button';
import FormField from '@/components/ui/FormField';
import styles from './FormGenerator.module.css';

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
      <Card
        title="Formulaire pour le programmateur"
        className="mb-4"
      >
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} role="status">
            <span className={styles.visuallyHidden}>Chargement...</span>
          </div>
          <p className={styles.loadingText}>Vérification des liens existants...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Formulaire pour le programmateur"
      className="mb-4"
    >
      {!formLink ? (
        <div>
          <p>
            Générez un lien de formulaire à envoyer au programmateur pour qu'il puisse remplir ses informations.
          </p>
          <Button
            variant="primary"
            onClick={generateForm}
            disabled={loading}
          >
            {loading ? 'Génération en cours...' : 'Générer un formulaire'}
          </Button>
        </div>
      ) : (
        <div>
          <div className={styles.alertSuccess}>
            <i className="bi bi-check-circle-fill"></i>
            <strong>Un lien de formulaire est actif</strong> - Valable jusqu'au {formatExpiryDate(expiryDate)}
          </div>
          
          <p>
            Voici le lien du formulaire à envoyer au programmateur :
          </p>
          
          <div className={styles.inputGroup}>
            <FormField
              type="text"
              value={formLink}
              readOnly
              onChange={() => {}}
              className={styles.linkInput}
            />
            <Button
              variant="outline-secondary"
              onClick={copyToClipboard}
              className={styles.copyButton}
            >
              {copied ? 'Copié !' : 'Copier'}
            </Button>
          </div>
          
          <div className={styles.alertInfo}>
            <i className="bi bi-info-circle"></i>
            <span>Ce lien permet au programmateur de remplir ses informations pour ce concert sans avoir accès au reste de l'application.</span>
          </div>
          
          <div className={styles.footerActions}>
            <p className={styles.expiryText}>
              Ce lien est valable jusqu'au {formatExpiryDate(expiryDate)}.
            </p>
            <Button
              variant="outline-primary"
              onClick={generateForm}
              disabled={loading}
            >
              {loading ? 'Génération en cours...' : 'Générer un nouveau lien'}
            </Button>
          </div>
          
          {existingLink && existingLink.completed && (
            <div className={styles.alertWarning}>
              <i className="bi bi-exclamation-triangle-fill"></i>
              <strong>Attention :</strong> Le formulaire a déjà été complété par le programmateur. Générer un nouveau lien si vous souhaitez qu'il puisse soumettre de nouvelles informations.
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default FormGenerator;
