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
      </Router>
    </AuthProvider>
  );
}

export default App;
