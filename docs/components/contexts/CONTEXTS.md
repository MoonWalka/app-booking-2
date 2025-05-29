# Contextes React

## Introduction

Les contextes React dans TourCraft servent à gérer l'état global de l'application et à partager des données entre des composants sans passer explicitement par les props. Ce document présente les différents contextes utilisés, leur rôle et leurs fonctionnalités.

## AuthContext

**But :** Gérer l'authentification et les informations de l'utilisateur connecté.

**État et fonctions exposés :**
- `currentUser`: Objet contenant les informations de l'utilisateur connecté
- `userRole`: Rôle de l'utilisateur connecté ('admin', 'manager', 'user', etc.)
- `isAuthenticated`: Boolean indiquant si un utilisateur est connecté
- `loading`: Boolean indiquant si l'authentification est en cours de vérification
- `login(email, password)`: Fonction pour se connecter
- `logout()`: Fonction pour se déconnecter
- `resetPassword(email)`: Fonction pour demander une réinitialisation de mot de passe
- `updateProfile(data)`: Fonction pour mettre à jour les informations de profil
- `changePassword(oldPassword, newPassword)`: Fonction pour changer de mot de passe

**Implémentation :** 
```jsx
// context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, firestore } from '../firebaseInit';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updatePassword
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effet d'écoute des changements d'authentification
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Récupération du rôle utilisateur depuis Firestore
        try {
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'user');
          } else {
            setUserRole('user');
          }
        } catch (err) {
          console.error("Erreur lors de la récupération du rôle:", err);
          setUserRole('user');
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Fonction de réinitialisation de mot de passe
  const resetPassword = async (email) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (data) => {
    // Implémentation...
  };

  // Fonction de changement de mot de passe
  const changePassword = async (oldPassword, newPassword) => {
    // Implémentation...
  };

  const value = {
    currentUser,
    userRole,
    isAuthenticated: !!currentUser,
    loading,
    error,
    login,
    logout,
    resetPassword,
    updateProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
```

**Exemple d'utilisation :**
```jsx
import { useAuth } from '../context/AuthContext';

function Header() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  
  return (
    <header className="app-header">
      <div className="logo">TourCraft</div>
      <div className="user-section">
        {isAuthenticated ? (
          <>
            <span className="username">{currentUser.displayName || currentUser.email}</span>
            <button onClick={logout} className="logout-btn">Déconnexion</button>
          </>
        ) : (
          <Link to="/login" className="login-btn">Connexion</Link>
        )}
      </div>
    </header>
  );
}
```

## ParametresContext

**But :** Fournir un accès aux paramètres globaux de l'application et aux informations de l'entreprise.

**État et fonctions exposés :**
- `entreprise`: Objet contenant les informations de l'entreprise (nom, adresse, etc.)
- `parametres`: Objet contenant les paramètres de l'application (devises, statuts possibles, etc.)
- `references`: Objet contenant les paramètres de génération des références
- `loading`: Boolean indiquant si les paramètres sont en cours de chargement
- `updateEntreprise(data)`: Fonction pour mettre à jour les informations de l'entreprise
- `updateParametres(param, value)`: Fonction pour mettre à jour un paramètre spécifique
- `updateReferences(type, pattern)`: Fonction pour mettre à jour un modèle de référence

**Implémentation :** 
```jsx
// context/ParametresContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { firestore } from '../firebaseInit';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const ParametresContext = createContext();

export function useParametres() {
  return useContext(ParametresContext);
}

export function ParametresProvider({ children }) {
  const [entreprise, setEntreprise] = useState({});
  const [parametres, setParametres] = useState({});
  const [references, setReferences] = useState({});
  const [loading, setLoading] = useState(true);

  // Chargement initial des paramètres
  useEffect(() => {
    const fetchParametres = async () => {
      try {
        // Récupération des informations entreprise
        const entrepriseDoc = await getDoc(doc(firestore, "parametres", "entreprise"));
        if (entrepriseDoc.exists()) {
          setEntreprise(entrepriseDoc.data());
        }
        
        // Récupération des paramètres généraux
        const parametresDoc = await getDoc(doc(firestore, "parametres", "general"));
        if (parametresDoc.exists()) {
          setParametres(parametresDoc.data());
        }
        
        // Récupération des modèles de référence
        const referencesDoc = await getDoc(doc(firestore, "parametres", "references"));
        if (referencesDoc.exists()) {
          setReferences(referencesDoc.data());
        }
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchParametres();
  }, []);

  // Mise à jour des informations entreprise
  const updateEntreprise = async (data) => {
    try {
      await updateDoc(doc(firestore, "parametres", "entreprise"), data);
      setEntreprise(prev => ({ ...prev, ...data }));
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour des informations entreprise:", error);
      throw error;
    }
  };

  // Mise à jour d'un paramètre spécifique
  const updateParametres = async (param, value) => {
    try {
      await updateDoc(doc(firestore, "parametres", "general"), { [param]: value });
      setParametres(prev => ({ ...prev, [param]: value }));
      return true;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du paramètre ${param}:`, error);
      throw error;
    }
  };

  // Mise à jour d'un modèle de référence
  const updateReferences = async (type, pattern) => {
    try {
      await updateDoc(doc(firestore, "parametres", "references"), { [type]: pattern });
      setReferences(prev => ({ ...prev, [type]: pattern }));
      return true;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du modèle de référence ${type}:`, error);
      throw error;
    }
  };

  const value = {
    entreprise,
    parametres,
    references,
    loading,
    updateEntreprise,
    updateParametres,
    updateReferences
  };

  return (
    <ParametresContext.Provider value={value}>
      {children}
    </ParametresContext.Provider>
  );
}
```

**Exemple d'utilisation :**
```jsx
import { useParametres } from '../context/ParametresContext';

function EntrepriseInfos() {
  const { entreprise, loading, updateEntreprise } = useParametres();
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
      await updateEntreprise({
        nom: formData.get('nom'),
        adresse: formData.get('adresse'),
        telephone: formData.get('telephone'),
        email: formData.get('email'),
        siret: formData.get('siret')
      });
      
      alert('Informations mises à jour avec succès !');
    } catch (error) {
      alert(`Erreur lors de la mise à jour: ${error.message}`);
    }
  };
  
  if (loading) {
    return <div>Chargement des informations...</div>;
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Informations de l'entreprise</h2>
      
      <div className="form-group">
        <label htmlFor="nom">Nom de l'entreprise</label>
        <input 
          type="text"
          id="nom"
          name="nom"
          defaultValue={entreprise.nom}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="adresse">Adresse</label>
        <textarea
          id="adresse"
          name="adresse"
          defaultValue={entreprise.adresse}
          required
        />
      </div>
      
      {/* Autres champs... */}
      
      <button type="submit" className="btn-submit">
        Enregistrer les modifications
      </button>
    </form>
  );
}
```

## NotificationContext

**But :** Gérer les notifications et alertes à travers l'application.

**État et fonctions exposés :**
- `notifications`: Tableau des notifications actuelles
- `addNotification(message, type, duration)`: Ajouter une notification
- `removeNotification(id)`: Supprimer une notification spécifique
- `clearNotifications()`: Supprimer toutes les notifications
- `success(message, options)`: Raccourci pour ajouter une notification de succès
- `error(message, options)`: Raccourci pour ajouter une notification d'erreur
- `info(message, options)`: Raccourci pour ajouter une notification informative
- `warning(message, options)`: Raccourci pour ajouter une notification d'avertissement

**Implémentation :** 
```jsx
// context/NotificationContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Ajouter une notification
  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = uuidv4();
    
    const newNotification = {
      id,
      message,
      type,
      duration
    };
    
    setNotifications(prevNotifications => [...prevNotifications, newNotification]);
    
    // Auto-suppression après la durée spécifiée
    if (duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  }, []);
  
  // Supprimer une notification
  const removeNotification = useCallback((id) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  }, []);
  
  // Supprimer toutes les notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // Raccourcis par type de notification
  const success = useCallback((message, options = {}) => {
    return addNotification(message, 'success', options.duration);
  }, [addNotification]);
  
  const error = useCallback((message, options = {}) => {
    return addNotification(message, 'error', options.duration);
  }, [addNotification]);
  
  const info = useCallback((message, options = {}) => {
    return addNotification(message, 'info', options.duration);
  }, [addNotification]);
  
  const warning = useCallback((message, options = {}) => {
    return addNotification(message, 'warning', options.duration);
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    info,
    warning
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
```

**Exemple d'utilisation :**
```jsx
import { useNotification } from '../context/NotificationContext';

function SaveButton({ onSave }) {
  const { success, error } = useNotification();
  const [saving, setSaving] = useState(false);
  
  const handleSave = async () => {
    setSaving(true);
    
    try {
      await onSave();
      success("Les modifications ont été enregistrées avec succès.");
    } catch (err) {
      error(`Erreur lors de l'enregistrement: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <button 
      onClick={handleSave}
      disabled={saving}
      className="save-btn"
    >
      {saving ? "Enregistrement..." : "Enregistrer"}
    </button>
  );
}

// Composant de notification qui affiche les notifications
function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();
  
  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`notification notification-${notification.type}`}
        >
          <span className="notification-message">{notification.message}</span>
          <button 
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
```

## ThemeContext

**But :** Gérer le thème de l'application et les préférences d'affichage.

**État et fonctions exposés :**
- `theme`: Thème actuel ('light', 'dark', 'system')
- `isDarkMode`: Boolean indiquant si le mode sombre est actif
- `toggleTheme()`: Fonction pour basculer entre les modes clair et sombre
- `setTheme(theme)`: Fonction pour définir un thème spécifique
- `systemPrefersDark`: Boolean indiquant si le système préfère le mode sombre
- `fontSize`: Taille de police actuelle
- `setFontSize(size)`: Fonction pour définir la taille de police
- `colorMode`: Mode de couleur actuel
- `setColorMode(mode)`: Fonction pour définir le mode de couleur

**Implémentation :** 
```jsx
// context/ThemeContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'system';
  });
  
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [fontSize, setFontSize] = useState(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    return savedFontSize || 'medium';
  });
  
  const [colorMode, setColorMode] = useState(() => {
    const savedColorMode = localStorage.getItem('colorMode');
    return savedColorMode || 'default';
  });
  
  const isDarkMode = theme === 'dark' || (theme === 'system' && systemPrefersDark);

  // Écouter les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemPrefersDark(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  // Appliquer le thème au document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-font-size', fontSize);
    document.documentElement.setAttribute('data-color-mode', colorMode);
  }, [isDarkMode, fontSize, colorMode]);
  
  // Sauvegarder les préférences
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);
  
  useEffect(() => {
    localStorage.setItem('colorMode', colorMode);
  }, [colorMode]);
  
  // Basculer le thème
  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);
  
  // Définir la taille de police
  const handleSetFontSize = useCallback((size) => {
    setFontSize(size);
  }, []);
  
  // Définir le mode de couleur
  const handleSetColorMode = useCallback((mode) => {
    setColorMode(mode);
  }, []);
  
  const value = {
    theme,
    isDarkMode,
    toggleTheme,
    setTheme,
    systemPrefersDark,
    fontSize,
    setFontSize: handleSetFontSize,
    colorMode,
    setColorMode: handleSetColorMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

**Exemple d'utilisation :**
```jsx
import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
  const { theme, isDarkMode, toggleTheme, setTheme } = useTheme();
  
  return (
    <div className="theme-controls">
      <div className="theme-toggle">
        <span>Mode sombre</span>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={isDarkMode} 
            onChange={toggleTheme}
          />
          <span className="slider round"></span>
        </label>
      </div>
      
      <div className="theme-select">
        <span>Thème</span>
        <select 
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="light">Clair</option>
          <option value="dark">Sombre</option>
          <option value="system">Système</option>
        </select>
      </div>
    </div>
  );
}
```

## WorkflowContext

**But :** Gérer les flux de travail complexes multi-étapes dans l'application.

**État et fonctions exposés :**
- `currentWorkflow`: Nom du workflow actif
- `currentStep`: Étape actuelle du workflow
- `steps`: Liste des étapes du workflow actif
- `data`: Données accumulées pendant le workflow
- `startWorkflow(name, initialData)`: Démarrer un nouveau workflow
- `goToStep(step)`: Aller à une étape spécifique
- `nextStep()`: Passer à l'étape suivante
- `previousStep()`: Revenir à l'étape précédente
- `updateData(newData)`: Mettre à jour les données du workflow
- `completeWorkflow()`: Terminer le workflow et exécuter l'action finale
- `cancelWorkflow()`: Annuler le workflow en cours

**Implémentation :** 
```jsx
// context/WorkflowContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';

// Définition des workflows disponibles
const WORKFLOWS = {
  'nouveauConcert': {
    steps: ['artisteEtLieu', 'detailsConcert', 'tarifEtBilletterie', 'recapitulatif'],
    finalAction: async (data) => {
      // Logique pour enregistrer un nouveau concert
    }
  },
  'nouvelleFacture': {
    steps: ['client', 'prestations', 'paiement', 'recapitulatif'],
    finalAction: async (data) => {
      // Logique pour générer une nouvelle facture
    }
  }
  // Autres workflows...
};

const WorkflowContext = createContext();

export function useWorkflow() {
  return useContext(WorkflowContext);
}

export function WorkflowProvider({ children }) {
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [steps, setSteps] = useState([]);
  const [data, setData] = useState({});
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Démarrer un nouveau workflow
  const startWorkflow = useCallback((name, initialData = {}) => {
    if (!WORKFLOWS[name]) {
      throw new Error(`Workflow inconnu: ${name}`);
    }
    
    setCurrentWorkflow(name);
    setSteps(WORKFLOWS[name].steps);
    setCurrentStep(WORKFLOWS[name].steps[0]);
    setData(initialData);
    setIsCompleting(false);
  }, []);
  
  // Aller à une étape spécifique
  const goToStep = useCallback((step) => {
    if (!steps.includes(step)) {
      throw new Error(`Étape inconnue: ${step}`);
    }
    
    setCurrentStep(step);
  }, [steps]);
  
  // Passer à l'étape suivante
  const nextStep = useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
      return true;
    }
    return false;
  }, [currentStep, steps]);
  
  // Revenir à l'étape précédente
  const previousStep = useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
      return true;
    }
    return false;
  }, [currentStep, steps]);
  
  // Mettre à jour les données du workflow
  const updateData = useCallback((newData) => {
    setData(prevData => ({
      ...prevData,
      ...newData
    }));
  }, []);
  
  // Terminer le workflow et exécuter l'action finale
  const completeWorkflow = useCallback(async () => {
    if (!currentWorkflow || !WORKFLOWS[currentWorkflow]) {
      throw new Error("Aucun workflow actif à compléter");
    }
    
    setIsCompleting(true);
    
    try {
      const result = await WORKFLOWS[currentWorkflow].finalAction(data);
      
      // Réinitialiser le workflow
      setCurrentWorkflow(null);
      setCurrentStep(null);
      setSteps([]);
      setData({});
      setIsCompleting(false);
      
      return result;
    } catch (error) {
      setIsCompleting(false);
      throw error;
    }
  }, [currentWorkflow, data]);
  
  // Annuler le workflow en cours
  const cancelWorkflow = useCallback(() => {
    setCurrentWorkflow(null);
    setCurrentStep(null);
    setSteps([]);
    setData({});
    setIsCompleting(false);
  }, []);

  const value = {
    currentWorkflow,
    currentStep,
    steps,
    data,
    isCompleting,
    startWorkflow,
    goToStep,
    nextStep,
    previousStep,
    updateData,
    completeWorkflow,
    cancelWorkflow
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}
```

**Exemple d'utilisation :**
```jsx
import { useWorkflow } from '../context/WorkflowContext';

function NouveauConcertWizard() {
  const {
    currentStep,
    data,
    nextStep,
    previousStep,
    updateData,
    completeWorkflow,
    cancelWorkflow,
    isCompleting
  } = useWorkflow();
  
  // Gérer la soumission d'une étape
  const handleSubmitStep = async (stepData) => {
    updateData(stepData);
    
    // Si c'est la dernière étape, compléter le workflow
    if (currentStep === 'recapitulatif') {
      try {
        const concertId = await completeWorkflow();
        navigate(`/concerts/${concertId}`);
      } catch (error) {
        console.error("Erreur lors de la création du concert:", error);
        // Afficher une erreur...
      }
    } else {
      nextStep();
    }
  };
  
  return (
    <div className="wizard-container">
      <h1>Nouveau Concert</h1>
      
      <WizardStepIndicator 
        steps={[
          { id: 'artisteEtLieu', label: 'Artiste & Lieu' },
          { id: 'detailsConcert', label: 'Détails' },
          { id: 'tarifEtBilletterie', label: 'Tarifs' },
          { id: 'recapitulatif', label: 'Récapitulatif' }
        ]}
        currentStep={currentStep}
      />
      
      {currentStep === 'artisteEtLieu' && (
        <ArtisteEtLieuForm
          initialData={data}
          onSubmit={handleSubmitStep}
        />
      )}
      
      {currentStep === 'detailsConcert' && (
        <DetailsConcertForm
          initialData={data}
          onSubmit={handleSubmitStep}
          onBack={previousStep}
        />
      )}
      
      {currentStep === 'tarifEtBilletterie' && (
        <TarifForm
          initialData={data}
          onSubmit={handleSubmitStep}
          onBack={previousStep}
        />
      )}
      
      {currentStep === 'recapitulatif' && (
        <RecapitulatifConcert
          data={data}
          onSubmit={handleSubmitStep}
          onBack={previousStep}
          isSubmitting={isCompleting}
        />
      )}
      
      <div className="wizard-actions">
        <button
          type="button"
          className="btn-cancel"
          onClick={() => {
            if (window.confirm("Êtes-vous sûr de vouloir annuler? Les données saisies seront perdues.")) {
              cancelWorkflow();
              navigate('/concerts');
            }
          }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

// Composant pour initier le workflow
function NouveauConcertButton() {
  const { startWorkflow } = useWorkflow();
  
  const handleClick = () => {
    startWorkflow('nouveauConcert', {
      date: new Date()
    });
    navigate('/concerts/nouveau');
  };
  
  return (
    <button onClick={handleClick} className="btn-primary">
      Nouveau concert
    </button>
  );
}
```

## Navigation
- [Retour à la documentation principale](../README.md)
- [Documentation des hooks](../hooks/HOOKS.md)
- [Documentation des services](../services/SERVICES.md)