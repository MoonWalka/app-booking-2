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
import Alert from '@/components/ui/Alert';
import brevoTemplateService from '@/services/brevoTemplateService';
import styles from './FormGenerator.module.css';

const FormGenerator = ({ dateId, contactId, onFormGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [formLink, setFormLink] = useState('');
  const [existingLink, setExistingLink] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [dateData, setDateData] = useState(null);
  const [contactData, setContactData] = useState(null);

  // Charger un lien existant au démarrage
  useEffect(() => {
    const fetchExistingLink = async () => {
      try {
        setLoadingExisting(true);
        // Récupérer les données du concert
        const dateDoc = await getDoc(doc(db, 'dates', dateId));
        if (dateDoc.exists()) {
          setDateData({ id: dateDoc.id, ...dateDoc.data() });
          
          // Récupérer les données du contact si disponible
          if (contactId) {
            const contactDoc = await getDoc(doc(db, 'contacts', contactId));
            if (contactDoc.exists()) {
              setContactData({ id: contactDoc.id, ...contactDoc.data() });
            }
          }
          
          // Vérifier si le date a déjà un formLinkId
          if (dateDoc.data().formLinkId) {
            const formLinkId = dateDoc.data().formLinkId;
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
                  formUrl = `${baseUrl}/#/formulaire/${dateId}/${linkData.token}`;
                } else {
                  formUrl = `${baseUrl}/formulaire/${dateId}/${linkData.token}`;
                }
                
                setFormLink(formUrl);
                setExistingLink(linkData);
                setExpiryDate(expiryDate);
              }
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
  }, [dateId, contactId]);

  const generateForm = async () => {
    setLoading(true);
    try {
      // Récupérer l'email du contact si disponible
      let emailToStore = '';
      if (contactId) {
        try {
          const progDoc = await getDoc(doc(db, 'contacts', contactId));
          if (progDoc.exists()) {
            const progData = progDoc.data();
            emailToStore = progData.email || progData.contact?.email || '';
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du contact:', error);
        }
      }
      
      // Générer un token unique
      const token = uuidv4();
      
      // Calculer la date d'expiration (30 jours à partir de maintenant)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      setExpiryDate(expiryDate);
      
      // Créer un document dans la collection formLinks
      const formRef = await addDoc(collection(db, 'formLinks'), {
        dateId,
        contactId: contactId || null,
        contactEmail: emailToStore, // Stocker l'email du contact
        token,
        createdAt: serverTimestamp(),
        expiryDate,
        completed: false
      });
      
      // Mettre à jour le date avec l'ID du formulaire
      await updateDoc(doc(db, 'dates', dateId), {
        formLinkId: formRef.id,
        updatedAt: serverTimestamp()
      });
      
      // Générer le lien du formulaire avec le format approprié
      const baseUrl = window.location.origin;
      const useHash = window.location.href.includes('#');
      let formUrl;
      
      if (useHash) {
        formUrl = `${baseUrl}/#/formulaire/${dateId}/${token}`;
      } else {
        formUrl = `${baseUrl}/formulaire/${dateId}/${token}`;
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

  const sendFormByEmail = async () => {
    if (!contactData || !contactData.email) {
      setEmailError('Le contact n\'a pas d\'adresse email');
      return;
    }

    if (!dateData) {
      setEmailError('Les données du date ne sont pas encore chargées. Veuillez patienter...');
      return;
    }

    if (!formLink) {
      setEmailError('Le lien du formulaire n\'est pas encore généré. Veuillez d\'abord générer le lien.');
      return;
    }

    try {
      setSendingEmail(true);
      setEmailError('');
      setEmailSent(false);

      console.log('Envoi email formulaire avec:', {
        dateData: dateData ? { 
          id: dateData.id, 
          nom: dateData.nom,
          titre: dateData.titre,
          title: dateData.title,
          keys: Object.keys(dateData)
        } : 'null',
        contactData: contactData ? { id: contactData.id, email: contactData.email } : 'null',
        formLink: formLink
      });

      await brevoTemplateService.sendFormulaireEmail(
        dateData,
        contactData,
        formLink
      );

      setEmailSent(true);
      // Réinitialiser le message de succès après 5 secondes
      setTimeout(() => setEmailSent(false), 5000);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      setEmailError(error.message || 'Une erreur est survenue lors de l\'envoi de l\'email');
    } finally {
      setSendingEmail(false);
    }
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
        title="Formulaire pour le contact"
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
      title="Formulaire pour le contact"
      className="mb-4"
    >
      {!formLink ? (
        <div>
          <p>
            Générez un lien de formulaire à envoyer au contact pour qu'il puisse remplir ses informations.
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
            Voici le lien du formulaire à envoyer au contact :
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
            {contactData && contactData.email && (
              <Button
                variant="primary"
                onClick={sendFormByEmail}
                disabled={sendingEmail || !dateData || !formLink || loadingExisting}
                className={styles.sendButton}
              >
                {sendingEmail ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Envoi...
                  </>
                ) : (
                  <>
                    <i className="bi bi-envelope me-2"></i>
                    Envoyer
                  </>
                )}
              </Button>
            )}
          </div>

          {emailSent && (
            <Alert variant="success" className="mt-3">
              <i className="bi bi-check-circle-fill me-2"></i>
              Email envoyé avec succès à {contactData.email}
            </Alert>
          )}

          {emailError && (
            <Alert variant="danger" className="mt-3">
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              {emailError}
            </Alert>
          )}
          
          <div className={styles.alertInfo}>
            <i className="bi bi-info-circle"></i>
            <span>Ce lien permet au contact de remplir ses informations pour ce date sans avoir accès au reste de l'application.</span>
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
              <strong>Attention :</strong> Le formulaire a déjà été complété par le contact. Générer un nouveau lien si vous souhaitez qu'il puisse soumettre de nouvelles informations.
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default FormGenerator;
