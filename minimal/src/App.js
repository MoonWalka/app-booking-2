import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Concerts from './pages/Concerts';
import Contacts from './pages/Contacts';

function Sidebar() {
  const location = useLocation();
  
  return (
    <div className="sidebar">
      <h2>TourCraft</h2>
      <ul className="sidebar-nav">
        <li>
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link 
            to="/concerts" 
            className={location.pathname === '/concerts' ? 'active' : ''}
          >
            Concerts
          </Link>
        </li>
        <li>
          <Link 
            to="/contacts" 
            className={location.pathname === '/contacts' ? 'active' : ''}
          >
            Contacts
          </Link>
        </li>
      </ul>
    </div>
  );
}

function Layout({ children }) {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/concerts/*" element={<Concerts />} />
          <Route path="/contacts" element={<Contacts />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;