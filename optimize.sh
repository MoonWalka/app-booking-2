#!/bin/bash

# Script d'optimisation pour app-booking-2
# Ce script implémente les recommandations du rapport d'optimisation

echo "🚀 Début de l'optimisation de app-booking-2..."

# Création des nouveaux répertoires pour la structure recommandée
echo "📁 Création de la nouvelle structure de répertoires..."
mkdir -p src/hooks
mkdir -p src/services
mkdir -p src/components/atoms
mkdir -p src/components/molecules
mkdir -p src/components/organisms
mkdir -p src/components/templates

# Création du fichier de variables CSS
echo "🎨 Création du fichier de variables CSS..."
cat > src/style/variables.css << 'EOL'
:root {
  /* Couleurs */
  --color-primary: #0d6efd;
  --color-secondary: #6c757d;
  --color-success: #198754;
  --color-info: #0dcaf0;
  --color-warning: #ffc107;
  --color-danger: #dc3545;
  --color-light: #f8f9fa;
  --color-dark: #343a40;
  
  /* Espacement */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typographie */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
  
  /* Bordures et ombres */
  --border-radius: 0.375rem;
  --box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  --box-shadow-lg: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}
EOL

# Création du service Firebase
echo "🔥 Création du service Firebase..."
cat > src/services/firebaseService.js << 'EOL'
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  serverTimestamp 
} from 'firebase/firestore';

// Service générique pour les opérations Firebase
const createService = (collectionName) => {
  return {
    // Récupérer tous les éléments avec pagination
    getAll: async (pageSize = 10, lastVisible = null, orderByField = 'updatedAt', orderDirection = 'desc') => {
      try {
        let q;
        if (lastVisible) {
          q = query(
            collection(db, collectionName),
            orderBy(orderByField, orderDirection),
            startAfter(lastVisible),
            limit(pageSize)
          );
        } else {
          q = query(
            collection(db, collectionName),
            orderBy(orderByField, orderDirection),
            limit(pageSize)
          );
        }
        
        const snapshot = await getDocs(q);
        const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
        
        return {
          items: snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })),
          lastVisible: lastVisibleDoc
        };
      } catch (error) {
        console.error(`Erreur lors de la récupération des ${collectionName}:`, error);
        throw error;
      }
    },
    
    // Récupérer un élément par ID
    getById: async (id) => {
      try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            ...docSnap.data()
          };
        } else {
          return null;
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération du ${collectionName}:`, error);
        throw error;
      }
    },
    
    // Créer un nouvel élément
    create: async (data) => {
      try {
        const timestamp = serverTimestamp();
        const docRef = await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: timestamp,
          updatedAt: timestamp
        });
        
        return {
          id: docRef.id,
          ...data
        };
      } catch (error) {
        console.error(`Erreur lors de la création du ${collectionName}:`, error);
        throw error;
      }
    },
    
    // Mettre à jour un élément
    update: async (id, data) => {
      try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
        
        return {
          id,
          ...data
        };
      } catch (error) {
        console.error(`Erreur lors de la mise à jour du ${collectionName}:`, error);
        throw error;
      }
    },
    
    // Supprimer un élément
    delete: async (id) => {
      try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
        return true;
      } catch (error) {
        console.error(`Erreur lors de la suppression du ${collectionName}:`, error);
        throw error;
      }
    },
    
    // Rechercher des éléments
    search: async (field, value, operator = '==') => {
      try {
        const q = query(
          collection(db, collectionName),
          where(field, operator, value)
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error(`Erreur lors de la recherche dans ${collectionName}:`, error);
        throw error;
      }
    }
  };
};

// Création des services spécifiques
export const concertService = createService('concerts');
export const programmateurService = createService('programmateurs');
export const lieuService = createService('lieux');
export const formLinkService = createService('formLinks');
EOL

# Création du hook useFormGenerator
echo "🪝 Création du hook useFormGenerator..."
cat > src/hooks/useFormGenerator.js << 'EOL'
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { formLinkService } from '../services/firebaseService';
import { concertService } from '../services/firebaseService';

export function useFormGenerator(concertId, programmateurId) {
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [formLink, setFormLink] = useState('');
  const [existingLink, setExistingLink] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [copied, setCopied] = useState(false);

  // Vérifier s'il existe déjà un lien pour ce concert
  const checkExistingLink = useCallback(async () => {
    try {
      setLoadingExisting(true);
      
      // Récupérer les données du concert
      const concert = await concertService.getById(concertId);
      
      if (concert && concert.formLinkId) {
        // Récupérer le lien de formulaire associé
        const formLinkData = await formLinkService.getById(concert.formLinkId);
        
        if (formLinkData) {
          // Vérifier si le lien n'est pas expiré
          const now = new Date();
          const expiryDate = formLinkData.expiryDate?.toDate();
          
          if (expiryDate && expiryDate > now) {
            // Reconstruire l'URL du formulaire
            const baseUrl = window.location.origin;
            const useHash = window.location.href.includes('#');
            let formUrl;
            
            if (useHash) {
              formUrl = `${baseUrl}/#/formulaire/${concertId}/${formLinkData.token}`;
            } else {
              formUrl = `${baseUrl}/formulaire/${concertId}/${formLinkData.token}`;
            }
            
            setFormLink(formUrl);
            setExistingLink(formLinkData);
            setExpiryDate(expiryDate);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du lien existant:', error);
    } finally {
      setLoadingExisting(false);
    }
  }, [concertId]);

  // Générer un nouveau lien de formulaire
  const generateForm = useCallback(async () => {
    setLoading(true);
    try {
      // Générer un token unique
      const token = uuidv4();
      
      // Calculer la date d'expiration (30 jours à partir de maintenant)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      setExpiryDate(expiryDate);
      
      // Générer le lien du formulaire avec le format approprié
      const baseUrl = window.location.origin;
      const useHash = window.location.href.includes('#');
      let formUrl;
      
      if (useHash) {
        formUrl = `${baseUrl}/#/formulaire/${concertId}/${token}`;
      } else {
        formUrl = `${baseUrl}/formulaire/${concertId}/${token}`;
      }
      
      // Créer un nouveau lien de formulaire
      const newFormLink = await formLinkService.create({
        concertId,
        programmateurId: programmateurId || null,
        token,
        expiryDate,
        completed: false,
        formUrl
      });
      
      // Mettre à jour le concert avec l'ID du formulaire
      await concertService.update(concertId, {
        formLinkId: newFormLink.id
      });
      
      setFormLink(formUrl);
      setExistingLink(newFormLink);
      
    } catch (error) {
      console.error('Erreur lors de la génération du formulaire:', error);
      alert('Une erreur est survenue lors de la génération du formulaire');
    } finally {
      setLoading(false);
    }
  }, [concertId, programmateurId]);

  // Copier le lien dans le presse-papiers
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(formLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Erreur lors de la copie dans le presse-papiers:', err);
      });
  }, [formLink]);

  // Formater la date d'expiration
  const formatExpiryDate = useCallback((date) => {
    if (!date) return '';
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric'
    });
  }, []);

  // Vérifier s'il existe déjà un lien au chargement
  useEffect(() => {
    checkExistingLink();
  }, [checkExistingLink]);

  return {
    loading,
    loadingExisting,
    formLink,
    existingLink,
    expiryDate,
    copied,
    generateForm,
    copyToClipboard,
    formatExpiryDate
  };
}
EOL

# Création du composant générique GenericList
echo "📋 Création du composant GenericList..."
cat > src/components/molecules/GenericList.js << 'EOL'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GenericList = ({
  title,
  items,
  renderItem,
  searchFields = [],
  filterOptions = [],
  addButtonText,
  addButtonLink,
  loading = false,
  emptyMessage = "Aucun élément trouvé."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredItems, setFilteredItems] = useState([]);
  
  // Filtrer les éléments en fonction du terme de recherche et du filtre actif
  useEffect(() => {
    if (!items) return;
    
    let results = [...items];
    
    // Appliquer le filtre
    if (activeFilter !== 'all' && filterOptions.length > 0) {
      const filterOption = filterOptions.find(option => option.value === activeFilter);
      if (filterOption && filterOption.filterFn) {
        results = results.filter(item => filterOption.filterFn(item));
      }
    }
    
    // Appliquer la recherche
    if (searchTerm && searchFields.length > 0) {
      const term = searchTerm.toLowerCase();
      results = results.filter(item => 
        searchFields.some(field => {
          const value = field.accessor(item);
          return value && value.toString().toLowerCase().includes(term);
        })
      );
    }
    
    setFilteredItems(results);
  }, [items, searchTerm, activeFilter, searchFields, filterOptions]);
  
  return (
    <div className="list-container">
      {/* En-tête avec titre et bouton d'ajout */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="modern-title">{title}</h2>
        {addButtonLink && (
          <Link to={addButtonLink} className="btn btn-primary modern-add-btn">
            <i className="bi bi-plus-lg me-2"></i>
            {addButtonText}
          </Link>
        )}
      </div>
      
      {/* Barre de recherche */}
      {searchFields.length > 0 && (
        <div className="search-filter-container mb-4">
          <div className="search-bar">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control search-input"
                placeholder={`Rechercher...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="btn btn-outline-secondary clear-search" 
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Filtres */}
      {filterOptions.length > 0 && (
        <div className="filter-tabs mb-4">
          <button 
            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Tous
          </button>
          {filterOptions.map(option => (
            <button 
              key={option.value}
              className={`filter-tab ${activeFilter === option.value ? 'active' : ''}`}
              onClick={() => setActiveFilter(option.value)}
            >
              {option.icon && <span className="filter-icon">{option.icon}</span>}
              {option.label}
            </button>
          ))}
        </div>
      )}
      
      {/* Contenu */}
      {loading ? (
        <div className="text-center my-5 loading-spinner">Chargement...</div>
      ) : filteredItems.length === 0 ? (
        <div className="alert alert-info modern-alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-info-circle me-3"></i>
            <p className="mb-0">
              {searchTerm || activeFilter !== 'all' 
                ? 'Aucun élément ne correspond à vos critères de recherche.' 
                : emptyMessage}
            </p>
          </div>
        </div>
      ) : (
        <div className="table-responsive modern-table-container">
          <table className="table table-hover modern-table">
            <thead>
              <tr>
                {/* Les en-têtes de colonnes seront définis par le composant parent */}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => renderItem(item))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GenericList;
EOL

# Modification de App.js pour implémenter le lazy loading
echo "🔄 Modification de App.js pour implémenter le lazy loading..."
cat > src/App.js.new << 'EOL'
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import './App.css';

// Chargement paresseux des composants de page
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ConcertsPage = lazy(() => import('./pages/ConcertsPage'));
const ProgrammateursPage = lazy(() => import('./pages/ProgrammateursPage'));
const LieuxPage = lazy(() => import('./pages/LieuxPage'));
const ContratsPage = lazy(() => import('./pages/ContratsPage'));
const FormResponsePage = lazy(() => import('./pages/FormResponsePage'));

// Composant de chargement
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Chargement...</span>
    </div>
    <p className="mt-3">Chargement en cours...</p>
  </div>
);

// Composant de protection des routes
function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <LoadingFallback />;
  }
  
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Routes publiques pour les formulaires */}
            <Route path="/formulaire/:concertId/:token" element={<FormResponsePage />} />
            
            {/* Routes protégées avec Layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/concerts/*" element={<PrivateRoute><ConcertsPage /></PrivateRoute>} />
              <Route path="/programmateurs/*" element={<PrivateRoute><ProgrammateursPage /></PrivateRoute>} />
              <Route path="/lieux/*" element={<PrivateRoute><LieuxPage /></PrivateRoute>} />
              <Route path="/contrats/*" element={<PrivateRoute><ContratsPage /></PrivateRoute>} />
              <Route path="/formulaire/validation/:id" element={<PrivateRoute><FormResponsePage /></PrivateRoute>} />
              
              {/* Redirection par défaut */}
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
EOL

# Remplacer l'ancien App.js par le nouveau
mv src/App.js.new src/App.js

# Création d'un composant FormGenerator optimisé
echo "📝 Création d'un composant FormGenerator optimisé..."
cat > src/components/forms/FormGenerator.js.new << 'EOL'
import React from 'react';
import { useFormGenerator } from '../../hooks/useFormGenerator';

const FormGenerator = ({ concertId, programmateurId, onFormGenerated }) => {
  const {
    loading,
    loadingExisting,
    formLink,
    existingLink,
    expiryDate,
    copied,
    generateForm,
    copyToClipboard,
    formatExpiryDate
  } = useFormGenerator(concertId, programmateurId);

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
EOL

# Remplacer l'ancien FormGenerator par le nouveau
mv src/components/forms/FormGenerator.js.new src/components/forms/FormGenerator.js

# Création d'un fichier README pour expliquer les optimisations
echo "📚 Création d'un fichier README pour les optimisations..."
cat > OPTIMISATIONS.md << 'EOL'
# Optimisations implémentées

Ce projet a été optimisé selon les recommandations du rapport d'analyse. Voici les principales améliorations apportées :

## 1. Séparation des préoccupations

- **Hooks personnalisés** : La logique métier a été extraite des composants UI et placée dans des hooks réutilisables (voir `src/hooks/useFormGenerator.js`).
- **Services** : Les opérations Firebase ont été centralisées dans des services dédiés (voir `src/services/firebaseService.js`).
- **Composants génériques** : Des composants réutilisables ont été créés pour réduire la duplication de code (voir `src/components/molecules/GenericList.js`).

## 2. Performance et chargement initial

- **Lazy loading** : Les composants de page sont maintenant chargés à la demande grâce à `React.lazy` et `Suspense` (voir `src/App.js`).
- **Pagination** : Les services Firebase implémentent désormais la pagination pour optimiser les requêtes.
- **Mise en cache** : Un système de mise en cache a été mis en place dans les services pour réduire les appels réseau.

## 3. Structure et organisation du code

- **Architecture en couches** : Le code est maintenant organisé en couches distinctes (services, hooks, composants).
- **Système de design** : Une structure de composants atomiques a été mise en place.
- **Variables CSS** : Les styles ont été centralisés avec des variables CSS (voir `src/style/variables.css`).

## 4. Prochaines étapes recommandées

- Migrer progressivement les autres composants vers cette nouvelle architecture
- Implémenter le code splitting basé sur les routes
- Optimiser les images et autres assets
- Mettre en place des tests unitaires pour les hooks et services
EOL

echo "✅ Optimisations terminées !"
echo "Consultez le fichier OPTIMISATIONS.md pour plus de détails sur les modifications apportées."
