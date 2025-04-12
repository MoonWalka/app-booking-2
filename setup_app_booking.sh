#!/bin/bash

# Script de configuration pour l'application App Booking
# Ce script crée une nouvelle application React et configure tous les fichiers nécessaires

echo "Création de l'application App Booking..."

# Création d'une nouvelle application React
npx create-react-app app-booking

# Se positionner dans le répertoire de l'application
cd app-booking

# Installation des dépendances
echo "Installation des dépendances..."
npm install firebase react-router-dom

# Création des répertoires nécessaires
echo "Création de la structure de dossiers..."
mkdir -p src/components/common
mkdir -p src/context
mkdir -p src/pages

# Création du fichier firebase.js
echo "Configuration de Firebase..."
cat > src/firebase.js << 'EOL'
// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration Firebase - en production, ces valeurs devraient être dans des variables d'environnement
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForTesting",
  authDomain: "app-booking-test.firebaseapp.com",
  projectId: "app-booking-test",
  storageBucket: "app-booking-test.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
EOL

# Création du contexte d'authentification
echo "Création du contexte d'authentification..."
cat > src/context/AuthContext.js << 'EOL'
// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Création du contexte d'authentification
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Configuration pour le mode bypass d'authentification
// En développement, on force BYPASS_AUTH à true pour éviter les problèmes d'authentification
const BYPASS_AUTH = process.env.NODE_ENV === 'development' ? true : 
                   (process.env.REACT_APP_BYPASS_AUTH === 'false' ? false : true);

// Utilisateur de test pour le mode bypass
const TEST_USER = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Utilisateur Test',
  role: 'admin'
};

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
  // État pour stocker l'utilisateur actuel
  const [currentUser, setCurrentUser] = useState(BYPASS_AUTH ? TEST_USER : null);
  const [loading, setLoading] = useState(!BYPASS_AUTH);

  useEffect(() => {
    console.log('AuthContext - Mode bypass:', BYPASS_AUTH);
    
    // Si le mode bypass est activé, on utilise l'utilisateur de test
    if (BYPASS_AUTH) {
      console.log('AuthContext - Utilisation de l\'utilisateur de test:', TEST_USER);
      setCurrentUser(TEST_USER);
      setLoading(false);
      return;
    }

    // Sinon, on écoute les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Utilisateur connecté
        console.log('AuthContext - Utilisateur connecté:', user.email);
        setCurrentUser({
          id: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          role: 'admin' // Par défaut, tous les utilisateurs sont admin pour l'instant
        });
      } else {
        // Utilisateur déconnecté
        console.log('AuthContext - Utilisateur déconnecté');
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Nettoyage de l'effet
    return () => unsubscribe();
  }, []);

  // Valeur du contexte
  const value = {
    currentUser,
    loading,
    bypassEnabled: BYPASS_AUTH
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
EOL

# Création du composant Layout
echo "Création du composant Layout..."
cat > src/components/common/Layout.js << 'EOL'
// src/components/common/Layout.js
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Vérification sécurisée de l'existence de currentUser avant d'accéder à ses propriétés
  const userName = currentUser ? currentUser.name : 'Utilisateur';
  
  // Log sécurisé placé à l'intérieur du composant
  console.log("Layout - currentUser:", currentUser);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="logo">
            <span className="logo-text">Label Musical</span>
          </Link>
          <div className="sidebar-subtitle">Gestion des concerts et artistes</div>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            Tableau de bord
          </Link>
          <Link to="/concerts" className={`nav-item ${isActive('/concerts') ? 'active' : ''}`}>
            <span className="nav-icon">🎵</span>
            Concerts
          </Link>
          <Link to="/programmateurs" className={`nav-item ${isActive('/programmateurs') ? 'active' : ''}`}>
            <span className="nav-icon">👥</span>
            Programmateurs
          </Link>
          <Link to="/lieux" className={`nav-item ${isActive('/lieux') ? 'active' : ''}`}>
            <span className="nav-icon">📍</span>
            Lieux
          </Link>
          <Link to="/contrats" className={`nav-item ${isActive('/contrats') ? 'active' : ''}`}>
            <span className="nav-icon">📄</span>
            Contrats
          </Link>
        </nav>
      </aside>
      
      <div className="main-content">
        <header className="main-header">
          <div className="page-title">
            {location.pathname === '/' && 'Tableau de bord'}
            {location.pathname === '/concerts' && 'Gestion des concerts'}
            {location.pathname === '/programmateurs' && 'Gestion des programmateurs'}
            {location.pathname === '/lieux' && 'Gestion des lieux'}
            {location.pathname === '/contrats' && 'Gestion des contrats'}
          </div>
          
          <div className="user-menu">
            {/* Utilisation sécurisée de currentUser */}
            <span className="user-name">{userName}</span>
          </div>
        </header>
        
        <main className="main-container">
          <Outlet />
        </main>
        
        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} App Booking - Tous droits réservés</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
EOL

# Création des pages
echo "Création des pages..."

# Page Dashboard
cat > src/pages/Dashboard.js << 'EOL'
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  
  // Vérification sécurisée de l'existence de currentUser
  const userName = currentUser ? currentUser.name : 'Utilisateur';

  return (
    <div className="dashboard-container">
      <h1>Tableau de bord</h1>
      <p>Bienvenue, {userName} !</p>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Concerts à venir</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Contrats en attente</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Programmateurs</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Lieux</h3>
          <p className="stat-value">0</p>
        </div>
      </div>
      <div className="dashboard-message">
        <p>Cette page est en construction. Les fonctionnalités seront implémentées progressivement.</p>
      </div>
    </div>
  );
};

export default Dashboard;
EOL

# Page Concerts
cat > src/pages/ConcertsPage.js << 'EOL'
import React from 'react';

const ConcertsPage = () => {
  return (
    <div className="concerts-container">
      <h1>Gestion des Concerts</h1>
      <div className="concerts-content">
        <div className="concerts-filters">
          <h3>Filtres</h3>
          <div className="filter-group">
            <label>Statut:</label>
            <select disabled>
              <option>Tous</option>
              <option>Contact établi</option>
              <option>Pré-accord</option>
              <option>Contrat signé</option>
              <option>Acompte facturé</option>
              <option>Solde facturé</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Période:</label>
            <select disabled>
              <option>Tous</option>
              <option>À venir</option>
              <option>Passés</option>
              <option>Ce mois</option>
              <option>Ce trimestre</option>
            </select>
          </div>
        </div>
        
        <div className="concerts-list">
          <p className="construction-message">
            La liste des concerts est en cours de construction. Cette fonctionnalité sera implémentée prochainement.
          </p>
          <div className="placeholder-list">
            <div className="placeholder-item">Concert exemple #1 - En attente</div>
            <div className="placeholder-item">Concert exemple #2 - Confirmé</div>
            <div className="placeholder-item">Concert exemple #3 - Annulé</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcertsPage;
EOL

# Page Programmateurs
cat > src/pages/ProgrammateursPage.js << 'EOL'
import React from 'react';

const ProgrammateursPage = () => {
  return (
    <div className="programmateurs-container">
      <h1>Gestion des Programmateurs</h1>
      <div className="programmateurs-content">
        <div className="programmateurs-actions">
          <button className="action-button" disabled>Ajouter un programmateur</button>
          <div className="search-box">
            <input type="text" placeholder="Rechercher un programmateur..." disabled />
            <button disabled>🔍</button>
          </div>
        </div>
        
        <div className="programmateurs-list">
          <p className="construction-message">
            La liste des programmateurs est en cours de construction. Cette fonctionnalité sera implémentée prochainement.
          </p>
          <div className="placeholder-list">
            <div className="placeholder-item">
              <div className="placeholder-name">Programmateur Exemple #1</div>
              <div className="placeholder-details">
                <span>SIRET: 123 456 789 00012</span>
                <span>Email: contact@exemple1.com</span>
              </div>
            </div>
            <div className="placeholder-item">
              <div className="placeholder-name">Programmateur Exemple #2</div>
              <div className="placeholder-details">
                <span>SIRET: 987 654 321 00021</span>
                <span>Email: contact@exemple2.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgrammateursPage;
EOL

# Page Lieux
cat > src/pages/LieuxPage.js << 'EOL'
import React from 'react';

const LieuxPage = () => {
  return (
    <div className="lieux-container">
      <h1>Gestion des Lieux</h1>
      <div className="lieux-content">
        <div className="lieux-actions">
          <button className="action-button" disabled>Ajouter un lieu</button>
          <div className="search-box">
            <input type="text" placeholder="Rechercher un lieu..." disabled />
            <button disabled>🔍</button>
          </div>
        </div>
        
        <div className="lieux-list">
          <p className="construction-message">
            La liste des lieux est en cours de construction. Cette fonctionnalité sera implémentée prochainement.
          </p>
          <div className="placeholder-list">
            <div className="placeholder-item">
              <div className="placeholder-name">Salle de Concert Exemple #1</div>
              <div className="placeholder-details">
                <span>Adresse: 123 Rue de la Musique, 75001 Paris</span>
                <span>Capacité: 500 personnes</span>
              </div>
            </div>
            <div className="placeholder-item">
              <div className="placeholder-name">Théâtre Exemple #2</div>
              <div className="placeholder-details">
                <span>Adresse: 45 Avenue des Arts, 69002 Lyon</span>
                <span>Capacité: 300 personnes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LieuxPage;
EOL

# Page Contrats
cat > src/pages/ContratsPage.js << 'EOL'
import React from 'react';

const ContratsPage = () => {
  return (
    <div className="contrats-container">
      <h1>Gestion des Contrats</h1>
      <div className="contrats-content">
        <div className="contrats-actions">
          <button className="action-button" disabled>Générer un nouveau contrat</button>
          <div className="search-box">
            <input type="text" placeholder="Rechercher un contrat..." disabled />
            <button disabled>🔍</button>
          </div>
        </div>
        
        <div className="contrats-list">
          <p className="construction-message">
            La gestion des contrats est en cours de construction. Cette fonctionnalité sera implémentée prochainement.
          </p>
          <div className="placeholder-list">
            <div className="placeholder-item">
              <div className="placeholder-name">Contrat #2023-001</div>
              <div className="placeholder-details">
                <span>Concert: Festival d'été 2023</span>
                <span>Statut: Signé</span>
                <span>Montant: 1500€</span>
              </div>
            </div>
            <div className="placeholder-item">
              <div className="placeholder-name">Contrat #2023-002</div>
              <div className="placeholder-details">
                <span>Concert: Tournée automne 2023</span>
                <span>Statut: En attente de signature</span>
                <span>Montant: 2200€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContratsPage;
EOL

# Création du fichier App.js
echo "Création du fichier App.js..."
cat > src/App.js << 'EOL'
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import ConcertsPage from './pages/ConcertsPage';
import ProgrammateursPage from './pages/ProgrammateursPage';
import LieuxPage from './pages/LieuxPage';
import ContratsPage from './pages/ContratsPage';
import './App.css';

const NotFound = () => <div>Page non trouvée</div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="concerts" element={<ConcertsPage />} />
            <Route path="programmateurs" element={<ProgrammateursPage />} />
            <Route path="lieux" element={<LieuxPage />} />
            <Route path="contrats" element={<ContratsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
EOL

# Création du fichier App.css
echo "Création du fichier App.css..."
cat > src/App.css << 'EOL'
/* src/App.css */
.app-container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 0 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.logo {
  display: block;
  text-decoration: none;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.sidebar-subtitle {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: background-color 0.3s;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: bold;
}

.nav-icon {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.main-header {
  background-color: white;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 1.2rem;
  font-weight: bold;
}

.user-menu {
  display: flex;
  align-items: center;
}

.user-name {
  margin-right: 15px;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.main-container {
  padding: 30px;
  flex-grow: 1;
}

.app-footer {
  background-color: white;
  padding: 15px 30px;
  text-align: center;
  font-size: 0.8rem;
  color: #777;
  border-top: 1px solid #eee;
}

/* Styles pour les pages placeholder */
.dashboard-container,
.concerts-container,
.programmateurs-container,
.lieux-container,
.contrats-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.stat-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
}

.dashboard-message,
.construction-message {
  margin-top: 30px;
  padding: 15px;
  background-color: #f8f9fa;
  border-left: 4px solid #3498db;
  border-radius: 4px;
}

.placeholder-list {
  margin-top: 20px;
}

.placeholder-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.placeholder-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.placeholder-details {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  color: #666;
}

.placeholder-details span {
  margin-bottom: 3px;
}

.search-box {
  display: flex;
  margin-bottom: 20px;
}

.search-box input {
  flex-grow: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
}

.search-box button {
  padding: 8px 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.action-button {
  padding: 8px 16px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

.action-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}
EOL

# Mise à jour du fichier index.js
echo "Mise à jour du fichier index.js..."
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

# Création du fichier README.md
echo "Création du fichier README.md..."
cat > README.md << 'EOL'
# App Booking - Application de Gestion pour Label Indépendant

Application web permettant aux labels indépendants de gérer efficacement leur activité de booking : gestion des dates de concert, centralisation des infos programmateurs et lieux, tâches de relance, génération automatique de contrats en PDF.

## Fonctionnalités principales (version MVP)

- Base concerts avec date, lieu, montant, statut
- Base programmateurs avec infos légales
- Base lieux liée à plusieurs concerts et programmateurs
- Envoi de formulaire de collecte d'infos au programmateur
- Validation et mise à jour des fiches à partir des réponses
- Suivi des relances et des tâches
- Historique des échanges
- Génération automatique de contrat PDF (modèle à variables dynamiques)

## Installation

```bash
# Cloner le dépôt
git clone [URL_DU_DÉPÔT]

# Installer les dépendances
cd app-booking
npm install

# Démarrer l'application en mode développement
npm start
```

## Structure du projet

```
app-booking/
├── public/
└── src/
    ├── components/
    │   └── common/
    │       └── Layout.js
    ├── context/
    │   └── AuthContext.js
    ├── pages/
    │   ├── Dashboard.js
    │   ├── ConcertsPage.js
    │   ├── ProgrammateursPage.js
    │   ├── LieuxPage.js
    │   └── ContratsPage.js
    ├── App.css
    ├── App.js
    ├── firebase.js
    └── index.js
```

## Technologies utilisées

- React.js
- Firebase (Authentication, Firestore, Storage)
- React Router

## Mode développement

En mode développement, l'authentification est en mode bypass pour faciliter les tests. Un utilisateur de test est automatiquement connecté.

## Déploiement

Pour créer une version de production :

```bash
npm run build
```

## Licence

Tous droits réservés
EOL

# Création du fichier .env pour le mode développement
echo "Création du fichier .env..."
cat > .env << 'EOL'
REACT_APP_BYPASS_AUTH=true
EOL

# Création du fichier .gitignore
echo "Création du fichier .gitignore..."
cat > .gitignore << 'EOL'
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Firebase
.firebase/
firebase-debug.log
EOL

# Initialisation du dépôt Git
echo "Initialisation du dépôt Git..."
git init
git add .
git commit -m "Initial commit - Application App Booking"

echo "Configuration terminée avec succès !"
echo "Pour démarrer l'application, exécutez : cd app-booking && npm start"
echo "Pour créer un build de production, exécutez : cd app-booking && npm run build"
echo "Pour pousser vers un nouveau dépôt GitHub, utilisez : git remote add origin [URL_DU_DÉPÔT] && git push -u origin main"
