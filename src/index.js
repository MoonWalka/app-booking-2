// Dans index.js
// Import des styles dans l'ordre correct: bootstrap → styles globaux
import 'bootstrap/dist/css/bootstrap.min.css';  // Bootstrap en premier
import '@styles/index.css'; // Ensuite nos styles (qui incluent déjà reset, variables, etc.)
import './App.css'; // Styles spécifiques à l'app

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import du service de diagnostic de performance
import './diagnostic';

// Import des polyfills pour la compatibilité
import 'core-js/stable';
import 'regenerator-runtime/runtime';

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
