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
