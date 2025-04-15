#!/bin/bash

# Script de correction des erreurs d'importation et de routes dans app-booking-2
# Ce script corrige l'erreur "Module not found: Error: Can't resolve './pages/Dashboard'"

echo "🔍 Début de la correction des erreurs d'importation et de routes..."

# Vérifier que nous sommes dans le bon répertoire (à la racine du projet)
if [ ! -d "src" ] || [ ! -f "package.json" ]; then
  echo "❌ Erreur: Ce script doit être exécuté à la racine du projet app-booking-2."
  echo "Veuillez vous assurer que vous êtes dans le répertoire qui contient src/ et package.json."
  exit 1
fi

# Vérifier que nous sommes sur la bonne branche
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "refacto-structure-scriptShell" ]; then
  echo "⚠️ Attention: Vous n'êtes pas sur la branche refacto-structure-scriptShell."
  echo "Passage à la branche refacto-structure-scriptShell..."
  git checkout refacto-structure-scriptShell || {
    echo "❌ Erreur: Impossible de passer à la branche refacto-structure-scriptShell."
    exit 1
  }
fi

echo "📂 Sauvegarde des fichiers importants..."
mkdir -p .backup
cp -r src .backup/
cp package.json .backup/

echo "🔧 Correction de l'erreur d'importation de Dashboard dans App.js..."

# Créer un fichier temporaire avec les corrections
cat > src/App.js.new << 'EOL'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import DashboardPage from './pages/DashboardPage';
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
        <Routes>
          {/* Routes publiques pour les formulaires */}
          <Route path="/formulaire/:concertId/:token" element={<FormResponsePage />} />
          
          {/* Routes protégées avec Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/concerts/*" element={<PrivateRoute><ConcertsPage /></PrivateRoute>} />
            <Route path="/programmateurs/*" element={<PrivateRoute><ProgrammateursPage /></PrivateRoute>} />
            <Route path="/lieux/*" element={<PrivateRoute><LieuxPage /></PrivateRoute>} />
            <Route path="/contrats/*" element={<PrivateRoute><ContratsPage /></PrivateRoute>} />
            <Route path="/formulaire/validation/:id" element={<PrivateRoute><FormResponsePage /></PrivateRoute>} />
            
            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
EOL

# Remplacer le fichier original par le fichier corrigé
mv src/App.js.new src/App.js

echo "✅ Correction terminée avec succès !"
echo "📋 Résumé des corrections effectuées :"
echo "  - Remplacé l'import de Dashboard par DashboardPage dans App.js"
echo "  - Mis à jour les références à Dashboard par DashboardPage dans le rendu"
echo ""
echo "🚀 Vous pouvez maintenant reconstruire l'application pour vérifier que l'erreur est résolue."
