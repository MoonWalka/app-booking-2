import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import DashboardPage from './pages/DashboardPage';
import ConcertsPage from './pages/ConcertsPage';
import ProgrammateursPage from './pages/ProgrammateursPage';
import LieuxPage from './pages/LieuxPage';
import ContratsPage from './pages/ContratsPage';
import ArtistesPage from './pages/ArtistesPage';
import ParametresPage from './pages/ParametresPage'; // Nouvel import
import FormResponsePage from './pages/FormResponsePage';
import ContratGenerationPage from './pages/ContratGenerationPage'; // Nouvel import
import ContratDetailsPage from './pages/ContratDetailsPage'; // Nouvel import
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
            
            {/* Routes pour les concerts */}
            <Route path="/concerts/*" element={<PrivateRoute><ConcertsPage /></PrivateRoute>} />
            
            {/* Routes pour les programmateurs */}
            <Route path="/programmateurs/*" element={<PrivateRoute><ProgrammateursPage /></PrivateRoute>} />
            
            {/* Routes pour les lieux */}
            <Route path="/lieux/*" element={<PrivateRoute><LieuxPage /></PrivateRoute>} />
            
            {/* Routes pour les contrats */}
            <Route path="/contrats" element={<PrivateRoute><ContratsPage /></PrivateRoute>} />
            <Route path="/contrats/generate/:concertId" element={<PrivateRoute><ContratGenerationPage /></PrivateRoute>} />
            <Route path="/contrats/:contratId" element={<PrivateRoute><ContratDetailsPage /></PrivateRoute>} />
            
            {/* Routes pour les artistes */}
            <Route path="/artistes/*" element={<PrivateRoute><ArtistesPage /></PrivateRoute>} />
            
            {/* Routes pour les paramètres */}
            <Route path="/parametres/*" element={<PrivateRoute><ParametresPage /></PrivateRoute>} />
            
            {/* Route pour la validation des formulaires */}
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
