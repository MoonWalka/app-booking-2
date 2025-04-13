#!/bin/bash

# Script pour implémenter les fonctionnalités de sécurité dans l'application App Booking
# Ce script modifie les composants nécessaires pour garantir l'isolation et la sécurité du formulaire

echo "Implémentation des fonctionnalités de sécurité pour le formulaire programmateur..."

# Mise à jour du composant Layout.js pour isoler le formulaire
cat > src/components/common/Layout.js << 'EOL'
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Layout({ children }) {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Vérifier si nous sommes sur une page de formulaire externe
  const isFormPage = location.pathname.includes('/formulaire/');
  
  return (
    <div className="app-container">
      {!isFormPage ? (
        // Interface standard pour l'application
        <>
          <div className="sidebar">
            <div className="sidebar-header">
              <h2>Label Musical</h2>
              <p>Gestion des concerts et artistes</p>
            </div>
            
            {currentUser && (
              <nav className="sidebar-nav">
                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                  <span role="img" aria-label="dashboard">📊</span> Tableau de bord
                </Link>
                <Link to="/concerts" className={location.pathname.includes('/concerts') ? 'active' : ''}>
                  <span role="img" aria-label="concerts">🎵</span> Concerts
                </Link>
                <Link to="/programmateurs" className={location.pathname.includes('/programmateurs') ? 'active' : ''}>
                  <span role="img" aria-label="programmers">👥</span> Programmateurs
                </Link>
                <Link to="/lieux" className={location.pathname.includes('/lieux') ? 'active' : ''}>
                  <span role="img" aria-label="venues">📍</span> Lieux
                </Link>
                <Link to="/contrats" className={location.pathname.includes('/contrats') ? 'active' : ''}>
                  <span role="img" aria-label="contracts">📄</span> Contrats
                </Link>
              </nav>
            )}
          </div>
          
          <div className="main-content">
            <header className="main-header">
              <h1>Gestion des concerts</h1>
              {currentUser && (
                <div className="user-info">
                  Utilisateur Test
                </div>
              )}
            </header>
            
            <main>
              {children}
            </main>
          </div>
        </>
      ) : (
        // Interface isolée pour le formulaire externe
        <div className="form-isolated-container">
          <header className="form-header">
            <div className="form-logo">
              <h2>Label Musical</h2>
            </div>
          </header>
          
          <main className="form-content">
            {children}
          </main>
          
          <footer className="form-footer">
            <p>© {new Date().getFullYear()} Label Musical - Formulaire sécurisé</p>
          </footer>
        </div>
      )}
    </div>
  );
}

export default Layout;
EOL

# Mise à jour du composant ProgrammateurForm.js pour renforcer la sécurité
cat > src/components/forms/ProgrammateurForm.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';

function ProgrammateurForm() {
  const { concertId, token } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Étape 1 : Contact
    nom: '',
    prenom: '',
    fonction: '',
    email: '',
    telephone: '',
    
    // Étape 2 : Structure
    raisonSociale: '',
    typeStructure: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: 'France',
    siret: '',
    tvaIntra: '',
    
    // Étape 3 : Lieu
    nomLieu: '',
    adresseLieu: '',
    codePostalLieu: '',
    villeLieu: '',
    paysLieu: 'France',
    
    // Étape 4 : Paiement
    modePaiement: 'virement',
    iban: '',
    bic: '',
    titulaire: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formDoc, setFormDoc] = useState(null);
  const [concert, setConcert] = useState(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        // Vérifier si le token est valide
        const q = query(
          collection(db, 'formulaires'),
          where('concertId', '==', concertId),
          where('token', '==', token)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError("Ce lien de formulaire n'est pas valide ou a expiré.");
          setTokenValid(false);
          setLoading(false);
          return;
        }
        
        // Récupérer le document du formulaire
        const formDoc = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        };
        
        setFormDoc(formDoc);
        setTokenValid(true);
        
        // Vérifier si le formulaire a déjà été soumis
        if (formDoc.statut === 'soumis' || formDoc.statut === 'valide') {
          setSuccess(true);
          setLoading(false);
          return;
        }
        
        // Vérifier si le token a expiré (7 jours après création)
        const dateCreation = formDoc.dateCreation?.toDate() || new Date();
        const dateExpiration = new Date(dateCreation);
        dateExpiration.setDate(dateExpiration.getDate() + 7);
        
        if (new Date() > dateExpiration) {
          setTokenExpired(true);
          setError("Ce lien de formulaire a expiré. Veuillez contacter l'organisateur pour obtenir un nouveau lien.");
          setLoading(false);
          return;
        }
        
        // Récupérer les données du concert
        const concertDoc = await getDoc(doc(db, 'concerts', concertId));
        
        if (concertDoc.exists()) {
          setConcert({
            id: concertDoc.id,
            ...concertDoc.data()
          });
        } else {
          setError("Ce concert n'existe pas.");
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la validation du token:", err);
        setError("Une erreur est survenue lors du chargement du formulaire.");
        setLoading(false);
      }
    };

    validateToken();
  }, [concertId, token]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validation étape 1 : Contact
    if (step === 1) {
      if (!formData.nom) newErrors.nom = "Le nom est requis";
      if (!formData.prenom) newErrors.prenom = "Le prénom est requis";
      if (!formData.fonction) newErrors.fonction = "La fonction est requise";
      if (!formData.email) {
        newErrors.email = "L'email est requis";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Format d'email invalide";
      }
      if (!formData.telephone) newErrors.telephone = "Le téléphone est requis";
    }
    
    // Validation étape 2 : Structure
    if (step === 2) {
      if (!formData.raisonSociale) newErrors.raisonSociale = "La raison sociale est requise";
      if (!formData.typeStructure) newErrors.typeStructure = "Le type de structure est requis";
      if (!formData.adresse) newErrors.adresse = "L'adresse est requise";
      if (!formData.codePostal) newErrors.codePostal = "Le code postal est requis";
      if (!formData.ville) newErrors.ville = "La ville est requise";
      if (!formData.pays) newErrors.pays = "Le pays est requis";
      if (!formData.siret) {
        newErrors.siret = "Le SIRET est requis";
      } else if (!/^\d{14}$/.test(formData.siret.replace(/\s/g, ''))) {
        newErrors.siret = "Le SIRET doit contenir 14 chiffres";
      }
    }
    
    // Validation étape 3 : Lieu
    if (step === 3) {
      if (!formData.nomLieu) newErrors.nomLieu = "Le nom du lieu est requis";
      if (!formData.adresseLieu) newErrors.adresseLieu = "L'adresse du lieu est requise";
      if (!formData.codePostalLieu) newErrors.codePostalLieu = "Le code postal du lieu est requis";
      if (!formData.villeLieu) newErrors.villeLieu = "La ville du lieu est requise";
      if (!formData.paysLieu) newErrors.paysLieu = "Le pays du lieu est requis";
    }
    
    // Validation étape 4 : Paiement
    if (step === 4) {
      if (formData.modePaiement === 'virement') {
        if (!formData.iban) {
          newErrors.iban = "L'IBAN est requis";
        } else if (!/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(formData.iban.replace(/\s/g, ''))) {
          newErrors.iban = "Format d'IBAN invalide";
        }
        if (!formData.bic) {
          newErrors.bic = "Le BIC est requis";
        } else if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(formData.bic.replace(/\s/g, ''))) {
          newErrors.bic = "Format de BIC invalide";
        }
        if (!formData.titulaire) newErrors.titulaire = "Le titulaire du compte est requis";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const nextStep = () => {
    if (validateForm()) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Vérifier à nouveau la validité du token avant soumission
      const q = query(
        collection(db, 'formulaires'),
        where('concertId', '==', concertId),
        where('token', '==', token)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError("Ce lien de formulaire n'est plus valide. Veuillez contacter l'organisateur.");
        setSubmitting(false);
        return;
      }
      
      // Mettre à jour le document du formulaire avec les réponses
      await updateDoc(doc(db, 'formulaires', formDoc.id), {
        reponses: formData,
        statut: 'soumis',
        dateSoumission: new Date(),
        ipSoumission: 'IP masquée pour la confidentialité'
      });
      
      setSuccess(true);
    } catch (err) {
      console.error("Erreur lors de la soumission du formulaire:", err);
      setError("Une erreur est survenue lors de la soumission du formulaire. Veuillez réessayer plus tard.");
    } finally {
      setSubmitting(false);
    }
  };

  // Rendu de l'étape 1 : Contact
  const renderStep1 = () => (
    <div className="form-step">
      <h3>Informations du contact</h3>
      
      <div className="form-group">
        <label htmlFor="nom">Nom *</label>
        <input
          type="text"
          id="nom"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          className={errors.nom ? 'error' : ''}
          autoComplete="family-name"
        />
        {errors.nom && <div className="error-message">{errors.nom}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="prenom">Prénom *</label>
        <input
          type="text"
          id="prenom"
          name="prenom"
          value={formData.prenom}
          onChange={handleChange}
          className={errors.prenom ? 'error' : ''}
          autoComplete="given-name"
        />
        {errors.prenom && <div className="error-message">{errors.prenom}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="fonction">Fonction *</label>
        <input
          type="text"
          id="fonction"
          name="fonction"
          value={formData.fonction}
          onChange={handleChange}
          className={errors.fonction ? 'error' : ''}
          autoComplete="organization-title"
        />
        {errors.fonction && <div className="error-message">{errors.fonction}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'error' : ''}
          autoComplete="email"
        />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="telephone">Téléphone *</label>
        <input
          type="tel"
          id="telephone"
          name="telephone"
          value={formData.telephone}
          onChange={handleChange}
          className={errors.telephone ? 'error' : ''}
          autoComplete="tel"
        />
        {errors.telephone && <div className="error-message">{errors.telephone}</div>}
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={nextStep} className="btn-primary">
          Suivant
        </button>
      </div>
    </div>
  );

  // Rendu de l'étape 2 : Structure
  const renderStep2 = () => (
    <div className="form-step">
      <h3>Structure juridique</h3>
      
      <div className="form-group">
        <label htmlFor="raisonSociale">Raison sociale *</label>
        <input
          type="text"
          id="raisonSociale"
          name="raisonSociale"
          value={formData.raisonSociale}
          onChange={handleChange}
          className={errors.raisonSociale ? 'error' : ''}
          autoComplete="organization"
        />
        {errors.raisonSociale && <div className="error-message">{errors.raisonSociale}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="typeStructure">Type de structure *</label>
        <select
          id="typeStructure"
          name="typeStructure"
          value={formData.typeStructure}
          onChange={handleChange}
          className={errors.typeStructure ? 'error' : ''}
        >
          <option value="">Sélectionner</option>
          <option value="association">Association</option>
          <option value="mairie">Mairie / Collectivité</option>
          <option value="sarl">SARL</option>
          <option value="sas">SAS</option>
          <option value="eurl">EURL</option>
          <option value="autre">Autre</option>
        </select>
        {errors.typeStructure && <div className="error-message">{errors.typeStructure}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="adresse">Adresse *</label>
        <input
          type="text"
          id="adresse"
          name="adresse"
          value={formData.adresse}
          onChange={handleChange}
          className={errors.adresse ? 'error' : ''}
          autoComplete="street-address"
        />
        {errors.adresse && <div className="error-message">{errors.adresse}</div>}
      </div>
      
      <div className="form-row">
        <div className="form-group half">
          <label htmlFor="codePostal">Code postal *</label>
          <input
            type="text"
            id="codePostal"
            name="codePostal"
            value={formData.codePostal}
            onChange={handleChange}
            className={errors.codePostal ? 'error' : ''}
            autoComplete="postal-code"
          />
          {errors.codePostal && <div className="error-message">{errors.codePostal}</div>}
        </div>
        
        <div className="form-group half">
          <label htmlFor="ville">Ville *</label>
          <input
            type="text"
            id="ville"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            className={errors.ville ? 'error' : ''}
            autoComplete="address-level2"
          />
          {errors.ville && <div className="error-message">{errors.ville}</div>}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="pays">Pays *</label>
        <input
          type="text"
          id="pays"
          name="pays"
          value={formData.pays}
          onChange={handleChange}
          className={errors.pays ? 'error' : ''}
          autoComplete="country-name"
        />
        {errors.pays && <div className="error-message">{errors.pays}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="siret">SIRET *</label>
        <input
          type="text"
          id="siret"
          name="siret"
          value={formData.siret}
          onChange={handleChange}
          className={errors.siret ? 'error' : ''}
        />
        {errors.siret && <div className="error-message">{errors.siret}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="tvaIntra">N° TVA intracommunautaire (facultatif)</label>
        <input
          type="text"
          id="tvaIntra"
          name="tvaIntra"
          value={formData.tvaIntra}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={prevStep} className="btn-secondary">
          Précédent
        </button>
        <button type="button" onClick={nextStep} className="btn-primary">
          Suivant
        </button>
      </div>
    </div>
  );

  // Rendu de l'étape 3 : Lieu
  const renderStep3 = () => (
    <div className="form-step">
      <h3>Lieu du concert</h3>
      
      <div className="form-group">
        <label htmlFor="nomLieu">Nom du lieu *</label>
        <input
          type="text"
          id="nomLieu"
          name="nomLieu"
          value={formData.nomLieu}
          onChange={handleChange}
          className={errors.nomLieu ? 'error' : ''}
        />
        {errors.nomLieu && <div className="error-message">{errors.nomLieu}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="adresseLieu">Adresse *</label>
        <input
          type="text"
          id="adresseLieu"
          name="adresseLieu"
          value={formData.adresseLieu}
          onChange={handleChange}
          className={errors.adresseLieu ? 'error' : ''}
        />
        {errors.adresseLieu && <div className="error-message">{errors.adresseLieu}</div>}
      </div>
      
      <div className="form-row">
        <div className="form-group half">
          <label htmlFor="codePostalLieu">Code postal *</label>
          <input
            type="text"
            id="codePostalLieu"
            name="codePostalLieu"
            value={formData.codePostalLieu}
            onChange={handleChange}
            className={errors.codePostalLieu ? 'error' : ''}
          />
          {errors.codePostalLieu && <div className="error-message">{errors.codePostalLieu}</div>}
        </div>
        
        <div className="form-group half">
          <label htmlFor="villeLieu">Ville *</label>
          <input
            type="text"
            id="villeLieu"
            name="villeLieu"
            value={formData.villeLieu}
            onChange={handleChange}
            className={errors.villeLieu ? 'error' : ''}
          />
          {errors.villeLieu && <div className="error-message">{errors.villeLieu}</div>}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="paysLieu">Pays *</label>
        <input
          type="text"
          id="paysLieu"
          name="paysLieu"
          value={formData.paysLieu}
          onChange={handleChange}
          className={errors.paysLieu ? 'error' : ''}
        />
        {errors.paysLieu && <div className="error-message">{errors.paysLieu}</div>}
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={prevStep} className="btn-secondary">
          Précédent
        </button>
        <button type="button" onClick={nextStep} className="btn-primary">
          Suivant
        </button>
      </div>
    </div>
  );

  // Rendu de l'étape 4 : Paiement
  const renderStep4 = () => (
    <div className="form-step">
      <h3>Informations de paiement</h3>
      
      <div className="form-group">
        <label htmlFor="modePaiement">Mode de paiement *</label>
        <select
          id="modePaiement"
          name="modePaiement"
          value={formData.modePaiement}
          onChange={handleChange}
        >
          <option value="virement">Virement bancaire</option>
          <option value="cheque">Chèque</option>
        </select>
      </div>
      
      {formData.modePaiement === 'virement' && (
        <>
          <div className="form-group">
            <label htmlFor="iban">IBAN *</label>
            <input
              type="text"
              id="iban"
              name="iban"
              value={formData.iban}
              onChange={handleChange}
              className={errors.iban ? 'error' : ''}
            />
            {errors.iban && <div className="error-message">{errors.iban}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="bic">BIC *</label>
            <input
              type="text"
              id="bic"
              name="bic"
              value={formData.bic}
              onChange={handleChange}
              className={errors.bic ? 'error' : ''}
            />
            {errors.bic && <div className="error-message">{errors.bic}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="titulaire">Titulaire du compte *</label>
            <input
              type="text"
              id="titulaire"
              name="titulaire"
              value={formData.titulaire}
              onChange={handleChange}
              className={errors.titulaire ? 'error' : ''}
            />
            {errors.titulaire && <div className="error-message">{errors.titulaire}</div>}
          </div>
        </>
      )}
      
      <div className="form-actions">
        <button type="button" onClick={prevStep} className="btn-secondary">
          Précédent
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Envoi en cours...' : 'Envoyer le formulaire'}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading">Chargement du formulaire...</div>;
  }

  if (error) {
    return (
      <div className="form-error">
        <div className="error-icon">⚠️</div>
        <h2>Erreur</h2>
        <p>{error}</p>
        {tokenExpired && (
          <p className="error-help">
            Ce lien a expiré. Veuillez contacter l'organisateur pour obtenir un nouveau lien.
          </p>
        )}
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="form-error">
        <div className="error-icon">⚠️</div>
        <h2>Accès non autorisé</h2>
        <p>Ce lien de formulaire n'est pas valide ou a expiré.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="form-success">
        <div className="success-icon">✓</div>
        <h2>Formulaire envoyé avec succès</h2>
        <p>Merci d'avoir complété ce formulaire. Vos informations ont été enregistrées.</p>
        <p>Vous recevrez prochainement un contrat basé sur ces informations.</p>
      </div>
    );
  }

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="programmateur-form">
      <h2>Formulaire Programmateur</h2>
      
      <div className="form-intro">
        <p>Merci de compléter ce formulaire pour finaliser les informations nécessaires à la contractualisation.</p>
        
        {concert && (
          <div className="concert-info">
            <p><strong>Concert du {formatDate(concert.date)}</strong></p>
            <p>Montant : {concert.montant} €</p>
          </div>
        )}
      </div>
      
      <div className="form-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1. Contact</div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2. Structure</div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3. Lieu</div>
        <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>4. Paiement</div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </form>
      
      <div className="form-security-notice">
        <p>
          <span role="img" aria-label="security">🔒</span> Ce formulaire est sécurisé et accessible uniquement via ce lien unique.
        </p>
      </div>
    </div>
  );
}

export default ProgrammateurForm;
EOL

# Mise à jour du fichier App.css pour ajouter les styles de l'interface isolée
cat >> src/App.css << 'EOL'
/* Styles pour l'interface isolée du formulaire */
.form-isolated-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.form-header {
  background-color: var(--secondary-color);
  color: white;
  padding: 15px 30px;
  text-align: center;
}

.form-logo h2 {
  margin: 0;
}

.form-content {
  flex: 1;
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.form-footer {
  background-color: var(--secondary-color);
  color: white;
  padding: 15px;
  text-align: center;
  font-size: 12px;
}

.form-security-notice {
  margin-top: 30px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: var(--border-radius);
  text-align: center;
  font-size: 12px;
  color: #7f8c8d;
}

.form-error {
  text-align: center;
  padding: 50px 20px;
}

.error-icon {
  font-size: 64px;
  color: var(--danger-color);
  margin-bottom: 20px;
}

.error-help {
  margin-top: 20px;
  font-style: italic;
}
EOL

# Mise à jour du fichier App.js pour renforcer la sécurité des routes
cat > src/App.js << 'EOL'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import ConcertsPage from './pages/ConcertsPage';
import ProgrammateursPage from './pages/ProgrammateursPage';
import LieuxPage from './pages/LieuxPage';
import ContratsPage from './pages/ContratsPage';
import FormResponsePage from './pages/FormResponsePage';
import './App.css';

// Composant de protection des routes
function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Chargement...</div>;
  }
  
  return currentUser ? children : <Navigate to="/login" />;
}

// Composant pour les routes de formulaire (publiques mais isolées)
function FormRoute({ children }) {
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Routes publiques isolées pour les formulaires */}
            <Route 
              path="/formulaire/:concertId/:token" 
              element={
                <FormRoute>
                  <FormResponsePage />
                </FormRoute>
              } 
            />
            
            {/* Routes privées */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/concerts/*" element={<PrivateRoute><ConcertsPage /></PrivateRoute>} />
            <Route path="/programmateurs/*" element={<PrivateRoute><ProgrammateursPage /></PrivateRoute>} />
            <Route path="/lieux/*" element={<PrivateRoute><LieuxPage /></PrivateRoute>} />
            <Route path="/contrats/*" element={<PrivateRoute><ContratsPage /></PrivateRoute>} />
            <Route path="/formulaire/validation/:id" element={<PrivateRoute><FormResponsePage /></PrivateRoute>} />
            
            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
EOL

# Mise à jour du composant ConcertDetails.js pour améliorer la sécurité du lien
cat > src/components/concerts/ConcertDetails.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

function ConcertDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formLink, setFormLink] = useState('');
  const [sending, setSending] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState(null);

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
          
          // Si le formulaire a déjà été envoyé, récupérer le lien
          if (concertData.formulaireEnvoye) {
            const q = query(
              collection(db, 'formulaires'),
              where('concertId', '==', id)
            );
            
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const formDoc = querySnapshot.docs[0];
              const formData = {
                id: formDoc.id,
                ...formDoc.data()
              };
              
              setFormData(formData);
              
              // Recréer le lien du formulaire
              const formUrl = `${window.location.origin}/formulaire/${id}/${formData.token}`;
              setFormLink(formUrl);
            }
          }
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
      const formRef = await addDoc(collection(db, 'formulaires'), {
        concertId: id,
        token: token,
        dateCreation: new Date(),
        dateExpiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expire dans 7 jours
        statut: 'envoye',
        reponses: {}
      });
      
      // Mettre à jour le concert pour indiquer que le formulaire a été envoyé
      await updateDoc(doc(db, 'concerts', id), {
        formulaireEnvoye: true,
        formulaireId: formRef.id
      });
      
      // Mettre à jour l'état local
      setFormSent(true);
      setFormData({
        id: formRef.id,
        token: token,
        dateCreation: new Date(),
        statut: 'envoye'
      });
      
      // Générer le lien du formulaire
      const formUrl = `${window.location.origin}/formulaire/${id}/${token}`;
      setFormLink(formUrl);
      
      // Mettre à jour l'objet concert local
      setConcert({
        ...concert,
        formulaireEnvoye: true,
        formulaireId: formRef.id
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

  // Régénérer un nouveau lien (en cas d'expiration)
  const regenerateLink = async () => {
    if (!concert) return;
    
    setSending(true);
    
    try {
      // Générer un nouveau token
      const newToken = generateToken();
      
      // Mettre à jour le document du formulaire existant ou en créer un nouveau
      let formRef;
      
      if (formData) {
        // Mettre à jour le formulaire existant
        await updateDoc(doc(db, 'formulaires', formData.id), {
          token: newToken,
          dateCreation: new Date(),
          dateExpiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expire dans 7 jours
          statut: 'envoye'
        });
        
        formRef = { id: formData.id };
      } else {
        // Créer un nouveau document de formulaire
        formRef = await addDoc(collection(db, 'formulaires'), {
          concertId: id,
          token: newToken,
          dateCreation: new Date(),
          dateExpiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expire dans 7 jours
          statut: 'envoye',
          reponses: {}
        });
        
        // Mettre à jour le concert
        await updateDoc(doc(db, 'concerts', id), {
          formulaireEnvoye: true,
          formulaireId: formRef.id
        });
      }
      
      // Mettre à jour l'état local
      setFormSent(true);
      setFormData({
        id: formRef.id,
        token: newToken,
        dateCreation: new Date(),
        statut: 'envoye'
      });
      
      // Générer le nouveau lien du formulaire
      const formUrl = `${window.location.origin}/formulaire/${id}/${newToken}`;
      setFormLink(formUrl);
      
      // Mettre à jour l'objet concert local si nécessaire
      if (!concert.formulaireEnvoye) {
        setConcert({
          ...concert,
          formulaireEnvoye: true,
          formulaireId: formRef.id
        });
      }
    } catch (err) {
      console.error("Erreur lors de la régénération du lien:", err);
      setError("Impossible de régénérer le lien. Veuillez réessayer plus tard.");
    } finally {
      setSending(false);
    }
  };

  // Vérifier si le formulaire a expiré
  const isFormExpired = () => {
    if (!formData || !formData.dateCreation) return false;
    
    const dateCreation = formData.dateCreation.toDate ? formData.dateCreation.toDate() : new Date(formData.dateCreation);
    const dateExpiration = new Date(dateCreation);
    dateExpiration.setDate(dateExpiration.getDate() + 7); // 7 jours d'expiration
    
    return new Date() > dateExpiration;
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
                  
                  {isFormExpired() && (
                    <div className="form-expired-warning">
                      <p>⚠️ Ce lien a expiré (valable 7 jours). Veuillez le régénérer.</p>
                      <button 
                        onClick={regenerateLink} 
                        className="btn-warning"
                        disabled={sending}
                      >
                        {sending ? 'Régénération...' : 'Régénérer le lien'}
                      </button>
                    </div>
                  )}
                  
                  <div className="form-actions">
                    <button onClick={() => window.open(`mailto:?subject=Formulaire pour le concert du ${formatDate(concert.date)}&body=Bonjour,%0A%0AVeuillez compléter le formulaire suivant pour finaliser les informations du concert :%0A%0A${formLink}%0A%0ACe lien est valable pendant 7 jours.%0A%0AMerci.`)} className="btn-secondary">
                      Envoyer par email
                    </button>
                  </div>
                </div>
              )}
              
              {formData && formData.statut === 'soumis' && (
                <div className="form-submitted-info">
                  <p>✓ Le programmateur a complété le formulaire.</p>
                  <button 
                    onClick={() => navigate(`/formulaire/validation/${formData.id}`)} 
                    className="btn-primary"
                  >
                    Voir les informations soumises
                  </button>
                </div>
              )}
              
              {formData && formData.statut === 'valide' && (
                <div className="form-validated-info">
                  <p>✓ Le formulaire a été validé et le contrat peut être généré.</p>
                  <button 
                    onClick={() => navigate(`/contrats/nouveau/${id}`)} 
                    className="btn-primary"
                    disabled={true} // Fonctionnalité à implémenter
                  >
                    Générer le contrat
                  </button>
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
EOL

# Ajout de styles supplémentaires pour les nouvelles fonctionnalités
cat >> src/App.css << 'EOL'
/* Styles pour les avertissements d'expiration */
.form-expired-warning {
  margin-top: 15px;
  padding: 10px;
  background-color: #fff3cd;
  border-radius: var(--border-radius);
  color: #856404;
}

.btn-warning {
  background-color: #f39c12;
  color: white;
}

.btn-warning:hover {
  background-color: #e67e22;
}

/* Styles pour les informations de soumission */
.form-submitted-info, .form-validated-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #d4edda;
  border-radius: var(--border-radius);
  color: #155724;
}

/* Styles pour les liens de formulaire */
.form-link-container {
  margin-top: 20px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: var(--border-radius);
}
EOL

echo "Implémentation des fonctionnalités de sécurité terminée avec succès !"
echo ""
echo "Les modifications suivantes ont été apportées :"
echo "1. Interface isolée pour le formulaire programmateur"
echo "2. Validation de token avec expiration après 7 jours"
echo "3. Possibilité de régénérer un lien expiré"
echo "4. Protection contre les accès non autorisés"
echo "5. Amélioration de la validation des données"
echo ""
echo "Pour appliquer ces modifications, exécutez ce script à la racine de votre projet :"
echo "chmod +x implement_security_features.sh && ./implement_security_features.sh"
