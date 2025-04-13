import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Pages
import Dashboard from './pages/Dashboard';
import ConcertsPage from './pages/ConcertsPage';
import ProgrammateursPage from './pages/ProgrammateursPage';
import LieuxPage from './pages/LieuxPage';
import ContratsPage from './pages/ContratsPage';

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <h1>Label Musical</h1>
            <p>Gestion des concerts et artistes</p>
          </div>
          <ul className="sidebar-menu">
            <li>
              <Link to="/">📊 Tableau de bord</Link>
            </li>
            <li>
              <Link to="/concerts">🎵 Concerts</Link>
            </li>
            <li>
              <Link to="/programmateurs">👥 Programmateurs</Link>
            </li>
            <li>
              <Link to="/lieux">📍 Lieux</Link>
            </li>
            <li>
              <Link to="/contrats">📄 Contrats</Link>
            </li>
          </ul>
        </div>
        
        <div className="main-content">
          <div className="header">
            <h2>Gestion des concerts</h2>
            <div className="user-info">
              Utilisateur Test
            </div>
          </div>
          
          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/concerts" element={<ConcertsPage />} />
              <Route path="/programmateurs" element={<ProgrammateursPage />} />
              <Route path="/lieux" element={<LieuxPage />} />
              <Route path="/contrats" element={<ContratsPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
