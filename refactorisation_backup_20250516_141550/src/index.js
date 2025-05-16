// Dans index.js
// Import des styles dans l'ordre correct: bootstrap → styles globaux
import 'bootstrap/dist/css/bootstrap.min.css';  // Bootstrap en premier
import '@styles/index.css'; // Ensuite nos styles (qui incluent déjà reset, variables, etc.)
import './App.css'; // Styles spécifiques à l'app

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import { initNetworkStabilizer } from './utils/networkStabilizer';

// Désactivation provisoire du stabilisateur réseau
// initNetworkStabilizer();

// Vérification des variables d'environnement
console.log("--- Vérification des variables d'environnement ---");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("REACT_APP_FIREBASE_API_KEY existe:", !!process.env.REACT_APP_FIREBASE_API_KEY);
console.log("REACT_APP_ variables:", Object.keys(process.env)
  .filter(key => key.startsWith('REACT_APP_'))
  .join(", "));
console.log("--- Fin de la vérification ---");

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
