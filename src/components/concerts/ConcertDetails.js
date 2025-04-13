import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { collection, addDoc } from 'firebase/firestore';

function ConcertDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formLink, setFormLink] = useState('');
  const [sending, setSending] = useState(false);
  const [formSent, setFormSent] = useState(false);

  useEffect(() => {
    const fetchConcert = async () => {
      try {
        const concertDoc = await getDoc(doc(db, 'concerts', id));
        
        if (concertDoc.exists()) {
          const concertData = {
            id: concertDoc.id,
            ...concertDoc.data()
          };
          
          setConcert(concertData);
          setFormSent(concertData.formulaireEnvoye || false);
        } else {
          setError("Ce concert n'existe pas.");
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement du concert:", err);
        setError("Impossible de charger les détails du concert.");
        setLoading(false);
      }
    };

    fetchConcert();
  }, [id]);

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Générer un token de sécurité aléatoire
  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Envoyer le formulaire au programmateur
  const sendForm = async () => {
    if (!concert) return;
    
    setSending(true);
    
    try {
      // Générer un token unique pour le formulaire
      const token = generateToken();
      
      // Créer un document de formulaire dans Firestore
      await addDoc(collection(db, 'formulaires'), {
        concertId: id,
        token: token,
        dateCreation: new Date(),
        statut: 'envoye',
        reponses: {}
      });
      
      // Mettre à jour le concert pour indiquer que le formulaire a été envoyé
      await updateDoc(doc(db, 'concerts', id), {
        formulaireEnvoye: true
      });
      
      // Mettre à jour l'état local
      setFormSent(true);
      
      // Générer le lien du formulaire
      const formUrl = `${window.location.origin}/formulaire/${id}/${token}`;
      setFormLink(formUrl);
      
      // Mettre à jour l'objet concert local
      setConcert({
        ...concert,
        formulaireEnvoye: true
      });
    } catch (err) {
      console.error("Erreur lors de l'envoi du formulaire:", err);
      setError("Impossible d'envoyer le formulaire. Veuillez réessayer plus tard.");
    } finally {
      setSending(false);
    }
  };

  // Copier le lien dans le presse-papier
  const copyLink = () => {
    navigator.clipboard.writeText(formLink)
      .then(() => {
        alert("Lien copié dans le presse-papier !");
      })
      .catch(err => {
        console.error("Erreur lors de la copie du lien:", err);
      });
  };

  if (loading) {
    return <div className="loading">Chargement des détails du concert...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!concert) {
    return <div className="not-found">Concert non trouvé.</div>;
  }

  return (
    <div className="concert-details">
      <div className="details-header">
        <h2>Détails du concert</h2>
        <button onClick={() => navigate('/concerts')} className="btn-secondary">
          Retour à la liste
        </button>
      </div>

      <div className="details-card">
        <div className="details-section">
          <h3>Informations générales</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Date :</span>
              <span className="detail-value">{formatDate(concert.date)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Montant :</span>
              <span className="detail-value">{concert.montant} €</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Statut :</span>
              <span className={`detail-value status-badge status-${concert.statut}`}>
                {concert.statut === 'option' ? 'Option' : 
                 concert.statut === 'confirme' ? 'Confirmé' : 'Annulé'}
              </span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h3>Lieu</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Nom :</span>
              <span className="detail-value">{concert.lieuNom || 'Non spécifié'}</span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h3>Programmateur</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Nom :</span>
              <span className="detail-value">{concert.programmateurNom || 'Non spécifié'}</span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h3>Formulaire</h3>
          {formSent ? (
            <div className="form-sent-info">
              <p>Le formulaire a été envoyé au programmateur.</p>
              
              {formLink && (
                <div className="form-link-container">
                  <p>Lien du formulaire :</p>
                  <div className="form-link">
                    <input type="text" value={formLink} readOnly />
                    <button onClick={copyLink} className="btn-secondary">
                      Copier
                    </button>
                  </div>
                  <div className="form-actions">
                    <button onClick={() => window.open(`mailto:?subject=Formulaire pour le concert du ${formatDate(concert.date)}&body=Bonjour,%0A%0AVeuillez compléter le formulaire suivant pour finaliser les informations du concert :%0A%0A${formLink}%0A%0AMerci.`)} className="btn-secondary">
                      Envoyer par email
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="form-actions">
              <p>Envoyez un formulaire au programmateur pour recueillir les informations nécessaires à la contractualisation.</p>
              <button 
                onClick={sendForm} 
                className="btn-primary"
                disabled={sending}
              >
                {sending ? 'Envoi en cours...' : 'Envoyer formulaire au programmateur'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConcertDetails;
