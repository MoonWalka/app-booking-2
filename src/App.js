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
