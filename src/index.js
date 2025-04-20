// Dans index.js
import 'bootstrap/dist/css/bootstrap.min.css';  // Notez qu'il n'y a pas de './' au début
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initNetworkStabilizer } from './utils/networkStabilizer';

// Initialisation du stabilisateur réseau pour prévenir les rechargements intempestifs
initNetworkStabilizer();

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
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
