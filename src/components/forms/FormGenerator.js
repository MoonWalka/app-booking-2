import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { v4 as uuidv4 } from 'uuid';

const FormGenerator = ({ concertId, programmateurId, onFormGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [formLink, setFormLink] = useState('');
  const [copied, setCopied] = useState(false);

  const generateForm = async () => {
    setLoading(true);
    try {
      // Générer un token unique
      const token = uuidv4();
      
      // Calculer la date d'expiration (30 jours à partir de maintenant)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      // Créer un document dans la collection formLinks au lieu de forms
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
        formLinkId: formRef.id, // Utiliser formLinkId pour distinguer des soumissions
        updatedAt: serverTimestamp()
      });
      
      // Générer le lien du formulaire avec le bon format
      const baseUrl = window.location.origin;
      
      // Si votre application utilise HashRouter
      const formUrl = `${baseUrl}/#/formulaire/${concertId}/${token}`;
      
      // Si votre application utilise BrowserRouter (sans #)
      // const formUrl = `${baseUrl}/formulaire/${concertId}/${token}`;
      
      setFormLink(formUrl);
      
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
            <p className="text-muted">
              Ce lien est valable pendant 30 jours. Vous pouvez générer un nouveau lien à tout moment.
            </p>
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Information :</strong> Ce lien mène à un formulaire isolé que le programmateur peut remplir sans avoir accès au reste de l'application. Une fois qu'il aura soumis le formulaire, vous serez notifié et pourrez valider les informations.
            </div>
            <button
              className="btn btn-outline-primary"
              onClick={generateForm}
              disabled={loading}
            >
              {loading ? 'Génération en cours...' : 'Générer un nouveau lien'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormGenerator;
