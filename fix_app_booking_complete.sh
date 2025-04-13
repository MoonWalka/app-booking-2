#!/bin/bash

# Script d'implémentation du parcours utilisateur complet pour App Booking
# Ce script implémente l'option A : création d'un concert, envoi du formulaire et validation

# Création des répertoires nécessaires
mkdir -p src/components/concerts
mkdir -p src/components/forms
mkdir -p src/pages

# Mise à jour du fichier firebase.js
cat > src/firebase.js << 'EOL'
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDqoNt9vPZ5LvRxhZr8WBzaRlrT9ZmCv3A",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "app-booking-demo.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "app-booking-demo",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "app-booking-demo.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789012:web:1234567890abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Forcer le mode bypass en développement
const BYPASS_AUTH = process.env.NODE_ENV === 'development' ? true : (process.env.REACT_APP_BYPASS_AUTH === 'true');

export { db, auth, BYPASS_AUTH };
EOL

# Mise à jour du contexte d'authentification
cat > src/context/AuthContext.js << 'EOL'
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, BYPASS_AUTH } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (BYPASS_AUTH) {
      console.log("Mode bypass d'authentification activé");
      setCurrentUser({ 
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Utilisateur Test',
        emailVerified: true
      });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
EOL

# Création du composant Layout
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
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Label Musical</h2>
          <p>Gestion des concerts et artistes</p>
        </div>
        
        {!isFormPage && currentUser && (
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
        
        {isFormPage && (
          <nav className="sidebar-nav">
            <Link to="/">
              <span role="img" aria-label="dashboard">📊</span> Tableau de bord
            </Link>
            <Link to="/concerts">
              <span role="img" aria-label="concerts">🎵</span> Concerts
            </Link>
            <Link to="/programmateurs">
              <span role="img" aria-label="programmers">👥</span> Programmateurs
            </Link>
            <Link to="/lieux">
              <span role="img" aria-label="venues">📍</span> Lieux
            </Link>
            <Link to="/contrats">
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
    </div>
  );
}

export default Layout;
EOL

# Création du composant ConcertForm
cat > src/components/concerts/ConcertForm.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

function ConcertForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: '',
    montant: '',
    statut: 'option',
    lieuId: '',
    lieuNom: '',
    programmateurId: '',
    programmateurNom: ''
  });
  const [errors, setErrors] = useState({});
  const [lieux, setLieux] = useState([]);
  const [programmateurs, setProgrammateurs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les lieux et programmateurs existants
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les lieux
        const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
        const lieuxData = lieuxSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLieux([
          { id: 'new', nom: '+ Créer un nouveau lieu' },
          ...lieuxData
        ]);

        // Charger les programmateurs
        const programmateursSnapshot = await getDocs(collection(db, 'programmateurs'));
        const programmateursData = programmateursSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProgrammateurs([
          { id: 'new', nom: '+ Créer un nouveau programmateur' },
          ...programmateursData
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    fetchData();
  }, []);

  // Surveiller les changements dans formData pour mettre à jour les erreurs
  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validation étape 1
    if (step === 1) {
      if (!formData.date) newErrors.date = "La date est requise";
      if (!formData.montant) newErrors.montant = "Le montant est requis";
      if (!formData.statut) newErrors.statut = "Le statut est requis";
    }
    
    // Validation étape 2
    if (step === 2) {
      if (!formData.lieuId) newErrors.lieuId = "Le lieu est requis";
    }
    
    // Validation étape 3
    if (step === 3) {
      if (!formData.programmateurId) newErrors.programmateurId = "Le programmateur est requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'lieuId') {
      const selectedLieu = lieux.find(lieu => lieu.id === value);
      setFormData({
        ...formData,
        lieuId: value,
        lieuNom: selectedLieu ? selectedLieu.nom : ''
      });
    } else if (name === 'programmateurId') {
      const selectedProgrammateur = programmateurs.find(prog => prog.id === value);
      setFormData({
        ...formData,
        programmateurId: value,
        programmateurNom: selectedProgrammateur ? selectedProgrammateur.nom : ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const nextStep = () => {
    if (validateForm()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Ajouter le concert à Firestore
      const concertRef = await addDoc(collection(db, 'concerts'), {
        date: formData.date,
        montant: parseFloat(formData.montant),
        statut: formData.statut,
        lieuId: formData.lieuId,
        lieuNom: formData.lieuNom,
        programmateurId: formData.programmateurId,
        programmateurNom: formData.programmateurNom,
        createdAt: new Date(),
        formulaireEnvoye: false
      });
      
      // Rediriger vers la page de détails du concert
      navigate(`/concerts/${concertRef.id}`);
    } catch (error) {
      console.error("Erreur lors de la création du concert:", error);
      setErrors({ submit: "Erreur lors de la création du concert. Veuillez réessayer." });
    } finally {
      setLoading(false);
    }
  };

  // Rendu de l'étape 1 : Informations de base
  const renderStep1 = () => (
    <div className="form-step">
      <h3>Informations de base</h3>
      
      <div className="form-group">
        <label htmlFor="date">Date du concert *</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={errors.date ? 'error' : ''}
        />
        {errors.date && <div className="error-message">{errors.date}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="montant">Montant (€) *</label>
        <input
          type="number"
          id="montant"
          name="montant"
          value={formData.montant}
          onChange={handleChange}
          className={errors.montant ? 'error' : ''}
        />
        {errors.montant && <div className="error-message">{errors.montant}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="statut">Statut *</label>
        <select
          id="statut"
          name="statut"
          value={formData.statut}
          onChange={handleChange}
          className={errors.statut ? 'error' : ''}
        >
          <option value="option">Option</option>
          <option value="confirme">Confirmé</option>
          <option value="annule">Annulé</option>
        </select>
        {errors.statut && <div className="error-message">{errors.statut}</div>}
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={nextStep} className="btn-primary">
          Suivant
        </button>
      </div>
    </div>
  );

  // Rendu de l'étape 2 : Choix du lieu
  const renderStep2 = () => (
    <div className="form-step">
      <h3>Lieu du concert</h3>
      
      <div className="form-group">
        <label htmlFor="lieuId">Sélectionner un lieu *</label>
        <select
          id="lieuId"
          name="lieuId"
          value={formData.lieuId}
          onChange={handleChange}
          className={errors.lieuId ? 'error' : ''}
        >
          <option value="">Sélectionner</option>
          {lieux.map(lieu => (
            <option key={lieu.id} value={lieu.id}>
              {lieu.nom}
            </option>
          ))}
        </select>
        {errors.lieuId && <div className="error-message">{errors.lieuId}</div>}
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

  // Rendu de l'étape 3 : Choix du programmateur
  const renderStep3 = () => (
    <div className="form-step">
      <h3>Programmateur</h3>
      
      <div className="form-group">
        <label htmlFor="programmateurId">Sélectionner un programmateur *</label>
        <select
          id="programmateurId"
          name="programmateurId"
          value={formData.programmateurId}
          onChange={handleChange}
          className={errors.programmateurId ? 'error' : ''}
        >
          <option value="">Sélectionner</option>
          {programmateurs.map(programmateur => (
            <option key={programmateur.id} value={programmateur.id}>
              {programmateur.nom}
            </option>
          ))}
        </select>
        {errors.programmateurId && <div className="error-message">{errors.programmateurId}</div>}
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={prevStep} className="btn-secondary">
          Précédent
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Création en cours...' : 'Créer le concert'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="concert-form-container">
      <h2>Création d'un nouveau concert</h2>
      
      <div className="form-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1. Informations</div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2. Lieu</div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3. Programmateur</div>
      </div>
      
      {errors.submit && <div className="error-message global">{errors.submit}</div>}
      
      <form onSubmit={handleSubmit}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </form>
    </div>
  );
}

export default ConcertForm;
EOL

# Création du composant ConcertsList
cat > src/components/concerts/ConcertsList.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

function ConcertsList() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        const q = query(collection(db, 'concerts'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const concertsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date // Garder la date au format ISO pour le tri
        }));
        
        setConcerts(concertsData);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des concerts:", err);
        setError("Impossible de charger les concerts. Veuillez réessayer plus tard.");
        setLoading(false);
      }
    };

    fetchConcerts();
  }, []);

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Formater le statut pour l'affichage
  const getStatusLabel = (status) => {
    switch (status) {
      case 'option':
        return 'Option';
      case 'confirme':
        return 'Confirmé';
      case 'annule':
        return 'Annulé';
      default:
        return status;
    }
  };

  // Obtenir la classe CSS pour le statut
  const getStatusClass = (status) => {
    switch (status) {
      case 'option':
        return 'status-option';
      case 'confirme':
        return 'status-confirmed';
      case 'annule':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading">Chargement des concerts...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="concerts-list">
      <div className="list-header">
        <h2>Liste des concerts</h2>
        <Link to="/concerts/nouveau" className="btn-primary">
          <span>+</span> Nouveau concert
        </Link>
      </div>

      {concerts.length === 0 ? (
        <div className="empty-list">
          <p>Aucun concert n'a été créé pour le moment.</p>
          <Link to="/concerts/nouveau" className="btn-primary">
            Créer votre premier concert
          </Link>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Lieu</th>
              <th>Programmateur</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {concerts.map(concert => (
              <tr key={concert.id}>
                <td>{formatDate(concert.date)}</td>
                <td>{concert.lieuNom || 'Non spécifié'}</td>
                <td>{concert.programmateurNom || 'Non spécifié'}</td>
                <td>{concert.montant} €</td>
                <td>
                  <span className={`status-badge ${getStatusClass(concert.statut)}`}>
                    {getStatusLabel(concert.statut)}
                  </span>
                </td>
                <td>
                  <Link to={`/concerts/${concert.id}`} className="btn-action">
                    Détails
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ConcertsList;
EOL

# Création du composant ConcertDetails
cat > src/components/concerts/ConcertDetails.js << 'EOL'
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
EOL

# Création du composant FormValidationInterface
cat > src/components/forms/FormValidationInterface.js << 'EOL'
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
EOL

# Création du composant ProgrammateurForm
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
          setError("Ce lien de formulaire n'est pas valide.");
          setLoading(false);
          return;
        }
        
        // Récupérer le document du formulaire
        const formDoc = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        };
        
        setFormDoc(formDoc);
        
        // Vérifier si le formulaire a déjà été soumis
        if (formDoc.statut === 'soumis' || formDoc.statut === 'valide') {
          setSuccess(true);
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
      if (!formData.email) newErrors.email = "L'email est requis";
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
      if (!formData.siret) newErrors.siret = "Le SIRET est requis";
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
        if (!formData.iban) newErrors.iban = "L'IBAN est requis";
        if (!formData.bic) newErrors.bic = "Le BIC est requis";
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
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Mettre à jour le document du formulaire avec les réponses
      await updateDoc(doc(db, 'formulaires', formDoc.id), {
        reponses: formData,
        statut: 'soumis',
        dateSoumission: new Date()
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
    return <div className="error-message">{error}</div>;
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
    </div>
  );
}

export default ProgrammateurForm;
EOL

# Création de la page Dashboard
cat > src/pages/Dashboard.js << 'EOL'
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="dashboard">
      <h2>Tableau de bord</h2>
      
      <div className="welcome-message">
        <h3>Bienvenue, {currentUser?.displayName || 'Utilisateur'} !</h3>
        <p>Gérez vos concerts, programmateurs et contrats depuis cette interface.</p>
      </div>
      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-icon">🎵</div>
          <h3>Concerts</h3>
          <p>Créez et gérez vos concerts</p>
          <Link to="/concerts" className="card-link">
            Accéder aux concerts
          </Link>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">👥</div>
          <h3>Programmateurs</h3>
          <p>Gérez vos contacts programmateurs</p>
          <Link to="/programmateurs" className="card-link">
            Accéder aux programmateurs
          </Link>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">📍</div>
          <h3>Lieux</h3>
          <p>Gérez les lieux de vos concerts</p>
          <Link to="/lieux" className="card-link">
            Accéder aux lieux
          </Link>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">📄</div>
          <h3>Contrats</h3>
          <p>Gérez vos contrats et factures</p>
          <Link to="/contrats" className="card-link">
            Accéder aux contrats
          </Link>
        </div>
      </div>
      
      <div className="quick-actions">
        <h3>Actions rapides</h3>
        <div className="action-buttons">
          <Link to="/concerts/nouveau" className="btn-primary">
            <span>+</span> Nouveau concert
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
EOL

# Création de la page ConcertsPage
cat > src/pages/ConcertsPage.js << 'EOL'
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ConcertsList from '../components/concerts/ConcertsList';
import ConcertForm from '../components/concerts/ConcertForm';
import ConcertDetails from '../components/concerts/ConcertDetails';

function ConcertsPage() {
  const navigate = useNavigate();
  
  return (
    <div className="concerts-page">
      <Routes>
        <Route path="/" element={<ConcertsList />} />
        <Route path="/nouveau" element={<ConcertForm />} />
        <Route path="/:id" element={<ConcertDetails />} />
      </Routes>
    </div>
  );
}

export default ConcertsPage;
EOL

# Création de la page ProgrammateursPage
cat > src/pages/ProgrammateursPage.js << 'EOL'
import React from 'react';

function ProgrammateursPage() {
  return (
    <div className="programmateurs-page">
      <h2>Programmateurs</h2>
      <div className="page-under-construction">
        <div className="construction-icon">🚧</div>
        <h3>Page en construction</h3>
        <p>Cette fonctionnalité sera disponible prochainement.</p>
      </div>
    </div>
  );
}

export default ProgrammateursPage;
EOL

# Création de la page LieuxPage
cat > src/pages/LieuxPage.js << 'EOL'
import React from 'react';

function LieuxPage() {
  return (
    <div className="lieux-page">
      <h2>Lieux</h2>
      <div className="page-under-construction">
        <div className="construction-icon">🚧</div>
        <h3>Page en construction</h3>
        <p>Cette fonctionnalité sera disponible prochainement.</p>
      </div>
    </div>
  );
}

export default LieuxPage;
EOL

# Création de la page ContratsPage
cat > src/pages/ContratsPage.js << 'EOL'
import React from 'react';

function ContratsPage() {
  return (
    <div className="contrats-page">
      <h2>Contrats</h2>
      <div className="page-under-construction">
        <div className="construction-icon">🚧</div>
        <h3>Page en construction</h3>
        <p>Cette fonctionnalité sera disponible prochainement.</p>
      </div>
    </div>
  );
}

export default ContratsPage;
EOL

# Création de la page FormResponsePage
cat > src/pages/FormResponsePage.js << 'EOL'
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProgrammateurForm from '../components/forms/ProgrammateurForm';
import FormValidationInterface from '../components/forms/FormValidationInterface';

function FormResponsePage() {
  return (
    <div className="form-response-page">
      <Routes>
        <Route path="/:concertId/:token" element={<ProgrammateurForm />} />
        <Route path="/validation/:id" element={<FormValidationInterface />} />
      </Routes>
    </div>
  );
}

export default FormResponsePage;
EOL

# Mise à jour du fichier App.js
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Routes publiques */}
            <Route path="/formulaire/*" element={<FormResponsePage />} />
            
            {/* Routes privées */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/concerts/*" element={<PrivateRoute><ConcertsPage /></PrivateRoute>} />
            <Route path="/programmateurs/*" element={<PrivateRoute><ProgrammateursPage /></PrivateRoute>} />
            <Route path="/lieux/*" element={<PrivateRoute><LieuxPage /></PrivateRoute>} />
            <Route path="/contrats/*" element={<PrivateRoute><ContratsPage /></PrivateRoute>} />
            
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

# Mise à jour du fichier index.js
cat > src/index.js << 'EOL'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
EOL

# Mise à jour du fichier App.css
cat > src/App.css << 'EOL'
/* Variables globales */
:root {
  --primary-color: #3498db;
  --primary-dark: #2980b9;
  --secondary-color: #2c3e50;
  --success-color: #2ecc71;
  --warning-color: #f39c12;
  --danger-color: #e74c3c;
  --light-color: #ecf0f1;
  --dark-color: #2c3e50;
  --text-color: #333;
  --border-color: #ddd;
  --shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  --border-radius: 4px;
  --transition: all 0.3s ease;
}

/* Reset et styles de base */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: #f5f7fa;
}

a {
  text-decoration: none;
  color: var(--primary-color);
  transition: var(--transition);
}

a:hover {
  color: var(--primary-dark);
}

button {
  cursor: pointer;
  border: none;
  border-radius: var(--border-radius);
  padding: 8px 16px;
  font-size: 14px;
  transition: var(--transition);
}

input, select, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 14px;
  transition: var(--transition);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* Layout */
.app-container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: var(--secondary-color);
  color: white;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 0 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  margin-bottom: 5px;
}

.sidebar-header p {
  font-size: 12px;
  opacity: 0.7;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.sidebar-nav a {
  color: white;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  transition: var(--transition);
}

.sidebar-nav a:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-nav a.active {
  background-color: var(--primary-color);
}

.sidebar-nav a span {
  margin-right: 10px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-header {
  background-color: white;
  padding: 15px 30px;
  box-shadow: var(--shadow);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

main {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

/* Boutons */
.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}

.btn-secondary {
  background-color: var(--light-color);
  color: var(--text-color);
}

.btn-secondary:hover {
  background-color: #dfe6e9;
}

.btn-action {
  background-color: var(--primary-color);
  color: white;
  padding: 6px 12px;
  border-radius: var(--border-radius);
  font-size: 12px;
}

.btn-action:hover {
  background-color: var(--primary-dark);
  color: white;
}

/* Tableaux */
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: white;
  box-shadow: var(--shadow);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.data-table th, .data-table td {
  padding: 12px 15px;
  text-align: left;
}

.data-table th {
  background-color: var(--secondary-color);
  color: white;
  font-weight: 500;
}

.data-table tr {
  border-bottom: 1px solid var(--border-color);
}

.data-table tr:last-child {
  border-bottom: none;
}

.data-table tr:nth-child(even) {
  background-color: #f8f9fa;
}

/* Cartes */
.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.dashboard-card {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow);
  transition: var(--transition);
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 32px;
  margin-bottom: 15px;
}

.card-link {
  display: inline-block;
  margin-top: 15px;
  font-weight: 500;
}

/* Formulaires */
.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-group.half {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.error {
  border-color: var(--danger-color);
}

.error-message {
  color: var(--danger-color);
  font-size: 12px;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

/* Formulaire multi-étapes */
.form-progress {
  display: flex;
  margin-bottom: 30px;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.progress-step {
  flex: 1;
  padding: 10px;
  text-align: center;
  background-color: var(--light-color);
  color: var(--text-color);
  position: relative;
}

.progress-step.active {
  background-color: var(--primary-color);
  color: white;
}

.progress-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-left: 10px solid var(--light-color);
  z-index: 1;
}

.progress-step.active:not(:last-child)::after {
  border-left-color: var(--primary-color);
}

/* Statut */
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-option {
  background-color: #f39c12;
  color: white;
}

.status-confirmed {
  background-color: #2ecc71;
  color: white;
}

.status-cancelled {
  background-color: #e74c3c;
  color: white;
}

/* Détails */
.details-card {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow);
  margin-top: 20px;
}

.details-section {
  margin-bottom: 30px;
}

.details-section:last-child {
  margin-bottom: 0;
}

.details-section h3 {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.detail-value {
  font-weight: 500;
}

/* Formulaire de programmateur */
.programmateur-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-intro {
  margin-bottom: 30px;
}

.concert-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: var(--border-radius);
  margin-top: 15px;
}

/* Succès */
.form-success {
  text-align: center;
  padding: 50px 20px;
}

.success-icon {
  font-size: 64px;
  color: var(--success-color);
  margin-bottom: 20px;
}

/* Validation */
.form-validation {
  max-width: 800px;
  margin: 0 auto;
}

.validation-card {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow);
  margin-top: 20px;
}

.validation-success {
  text-align: center;
  padding: 50px 20px;
}

/* Lien de formulaire */
.form-link-container {
  margin-top: 20px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: var(--border-radius);
}

.form-link {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.form-link input {
  flex: 1;
  background-color: white;
}

/* Page en construction */
.page-under-construction {
  text-align: center;
  padding: 50px 20px;
}

.construction-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

/* Chargement */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: var(--primary-color);
}

/* Liste vide */
.empty-list {
  text-align: center;
  padding: 50px 20px;
}

/* En-têtes de liste */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* En-têtes de détails */
.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* Actions rapides */
.quick-actions {
  margin-top: 40px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

/* Responsive */
@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    padding: 10px 0;
  }
  
  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding: 10px 0;
  }
  
  .sidebar-nav a {
    padding: 8px 15px;
    white-space: nowrap;
  }
  
  .main-header {
    padding: 10px 15px;
  }
  
  main {
    padding: 15px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
}
EOL

# Création du fichier .env
cat > .env << 'EOL'
REACT_APP_BYPASS_AUTH=true
EOL

echo "Script d'implémentation terminé avec succès !"
echo "L'application est prête à être utilisée."
echo ""
echo "Pour démarrer l'application en mode développement :"
echo "npm start"
echo ""
echo "Pour créer un build de production :"
echo "npm run build"
