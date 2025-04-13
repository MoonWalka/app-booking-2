import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function FormValidationInterface() {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les données du formulaire
        const formDoc = await getDoc(doc(db, 'formulaires', id));
        
        if (formDoc.exists()) {
          const formData = {
            id: formDoc.id,
            ...formDoc.data()
          };
          
          setFormData(formData);
          
          // Récupérer les données du concert associé
          if (formData.concertId) {
            const concertDoc = await getDoc(doc(db, 'concerts', formData.concertId));
            
            if (concertDoc.exists()) {
              setConcert({
                id: concertDoc.id,
                ...concertDoc.data()
              });
            }
          }
        } else {
          setError("Ce formulaire n'existe pas.");
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données du formulaire.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Valider le formulaire
  const validateForm = async () => {
    try {
      // Mettre à jour le statut du formulaire
      await updateDoc(doc(db, 'formulaires', id), {
        statut: 'valide',
        dateValidation: new Date()
      });
      
      setValidated(true);
    } catch (err) {
      console.error("Erreur lors de la validation du formulaire:", err);
      setError("Impossible de valider le formulaire. Veuillez réessayer plus tard.");
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return <div className="loading">Chargement des données du formulaire...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!formData || !concert) {
    return <div className="not-found">Formulaire non trouvé.</div>;
  }

  // Vérifier si le formulaire a déjà été validé
  const isAlreadyValidated = formData.statut === 'valide';

  return (
    <div className="form-validation">
      <h2>Validation du formulaire</h2>

      {(isAlreadyValidated || validated) ? (
        <div className="validation-success">
          <div className="success-icon">✓</div>
          <h3>Formulaire validé avec succès</h3>
          <p>Le formulaire a été validé et le contrat sera généré prochainement.</p>
        </div>
      ) : (
        <>
          <div className="validation-info">
            <p>Veuillez vérifier les informations ci-dessous avant de valider le formulaire.</p>
          </div>

          <div className="validation-card">
            <div className="validation-section">
              <h3>Informations du concert</h3>
              <div className="validation-grid">
                <div className="validation-item">
                  <span className="validation-label">Date :</span>
                  <span className="validation-value">{formatDate(concert.date)}</span>
                </div>
                <div className="validation-item">
                  <span className="validation-label">Montant :</span>
                  <span className="validation-value">{concert.montant} €</span>
                </div>
                <div className="validation-item">
                  <span className="validation-label">Lieu :</span>
                  <span className="validation-value">{concert.lieuNom || 'Non spécifié'}</span>
                </div>
              </div>
            </div>

            <div className="validation-section">
              <h3>Informations du programmateur</h3>
              <div className="validation-grid">
                {formData.reponses && (
                  <>
                    <div className="validation-item">
                      <span className="validation-label">Nom :</span>
                      <span className="validation-value">{formData.reponses.nom || 'Non spécifié'}</span>
                    </div>
                    <div className="validation-item">
                      <span className="validation-label">Prénom :</span>
                      <span className="validation-value">{formData.reponses.prenom || 'Non spécifié'}</span>
                    </div>
                    <div className="validation-item">
                      <span className="validation-label">Fonction :</span>
                      <span className="validation-value">{formData.reponses.fonction || 'Non spécifiée'}</span>
                    </div>
                    <div className="validation-item">
                      <span className="validation-label">Email :</span>
                      <span className="validation-value">{formData.reponses.email || 'Non spécifié'}</span>
                    </div>
                    <div className="validation-item">
                      <span className="validation-label">Téléphone :</span>
                      <span className="validation-value">{formData.reponses.telephone || 'Non spécifié'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="validation-section">
              <h3>Structure juridique</h3>
              <div className="validation-grid">
                {formData.reponses && (
                  <>
                    <div className="validation-item">
                      <span className="validation-label">Raison sociale :</span>
                      <span className="validation-value">{formData.reponses.raisonSociale || 'Non spécifiée'}</span>
                    </div>
                    <div className="validation-item">
                      <span className="validation-label">Type de structure :</span>
                      <span className="validation-value">{formData.reponses.typeStructure || 'Non spécifié'}</span>
                    </div>
                    <div className="validation-item">
                      <span className="validation-label">Adresse :</span>
                      <span className="validation-value">{formData.reponses.adresse || 'Non spécifiée'}</span>
                    </div>
                    <div className="validation-item">
                      <span className="validation-label">Code postal :</span>
                      <span className="validation-value">{formData.reponses.codePostal || 'Non spécifié'}</span>
                    </div>
                    <div className="validation-item">
                      <span className="validation-label">Ville :</span>
                      <span className="validation-value">{formData.reponses.ville || 'Non spécifiée'}</span>
                    </div>
                    <div className="validation-item">
                      <span className="validation-label">SIRET :</span>
                      <span className="validation-value">{formData.reponses.siret || 'Non spécifié'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="validation-actions">
              <button onClick={validateForm} className="btn-primary">
                Valider le formulaire
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FormValidationInterface;
