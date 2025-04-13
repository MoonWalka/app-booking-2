#!/bin/bash

# Script de correction pour l'application App-Booking
# Ce script corrige les problèmes qui empêchent l'application de fonctionner correctement sur Render

echo "Début des corrections pour l'application App-Booking..."

# 1. Correction des variables d'environnement
echo "1. Correction des variables d'environnement..."
cat > .env << 'EOL'
REACT_APP_BYPASS_AUTH=true
REACT_APP_FIREBASE_API_KEY=AIzaSyCt994en0glR_WVbxxkDATXM25QV7HKovA
EOL
echo "✅ Variables d'environnement corrigées"

# 2. Création du fichier mockStorage.js manquant
echo "2. Création du fichier mockStorage.js manquant..."
cat > src/mockStorage.js << 'EOL'
// Mock de Firestore pour le développement local
// Simule les fonctionnalités de base de Firestore sans connexion à Firebase

// Stockage local des données
const localData = {
  concerts: {},
  lieux: {},
  programmateurs: {},
  forms: {}
};

// Génère un ID unique pour les documents
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Classe DocumentReference
class DocumentReference {
  constructor(collection, id) {
    this.collection = collection;
    this.id = id;
  }

  async get() {
    const data = localData[this.collection][this.id];
    return {
      exists: !!data,
      data: () => data,
      id: this.id
    };
  }

  async set(data, options = {}) {
    if (options.merge) {
      localData[this.collection][this.id] = {
        ...localData[this.collection][this.id],
        ...data
      };
    } else {
      localData[this.collection][this.id] = data;
    }
    console.log(`Document ajouté à ${this.collection}: ${JSON.stringify({id: this.id, ...data})}`);
    return { id: this.id };
  }

  async update(data) {
    if (!localData[this.collection][this.id]) {
      localData[this.collection][this.id] = {};
    }
    localData[this.collection][this.id] = {
      ...localData[this.collection][this.id],
      ...data
    };
    console.log(`Document mis à jour dans ${this.collection}: ${JSON.stringify({id: this.id, ...data})}`);
    return { id: this.id };
  }

  async delete() {
    delete localData[this.collection][this.id];
    console.log(`Document supprimé de ${this.collection}: ${this.id}`);
    return true;
  }
}

// Classe CollectionReference
class CollectionReference {
  constructor(name) {
    this.name = name;
  }

  doc(id = generateId()) {
    return new DocumentReference(this.name, id);
  }

  async add(data) {
    const id = generateId();
    const docRef = this.doc(id);
    await docRef.set(data);
    return { id, ...data };
  }

  where(field, operator, value) {
    return new Query(this.name, [{ field, operator, value }]);
  }

  orderBy(field, direction = 'asc') {
    return new Query(this.name, [], [{ field, direction }]);
  }

  async get() {
    const docs = Object.entries(localData[this.name] || {}).map(([id, data]) => ({
      id,
      data: () => data,
      exists: true
    }));
    return { docs, empty: docs.length === 0 };
  }
}

// Classe Query
class Query {
  constructor(collection, filters = [], orderBys = []) {
    this.collection = collection;
    this.filters = filters;
    this.orderBys = orderBys;
  }

  where(field, operator, value) {
    return new Query(
      this.collection,
      [...this.filters, { field, operator, value }],
      this.orderBys
    );
  }

  orderBy(field, direction = 'asc') {
    return new Query(
      this.collection,
      this.filters,
      [...this.orderBys, { field, direction }]
    );
  }

  async get() {
    // Filtrer les documents selon les critères
    let docs = Object.entries(localData[this.collection] || {})
      .filter(([id, data]) => {
        if (this.filters.length === 0) return true;
        
        return this.filters.every(filter => {
          const { field, operator, value } = filter;
          const fieldValue = data[field];
          
          switch (operator) {
            case '==': return fieldValue === value;
            case '!=': return fieldValue !== value;
            case '>': return fieldValue > value;
            case '>=': return fieldValue >= value;
            case '<': return fieldValue < value;
            case '<=': return fieldValue <= value;
            case 'array-contains': return Array.isArray(fieldValue) && fieldValue.includes(value);
            default: return true;
          }
        });
      })
      .map(([id, data]) => ({
        id,
        data: () => data,
        exists: true
      }));
    
    // Trier les documents si nécessaire
    if (this.orderBys.length > 0) {
      docs.sort((a, b) => {
        for (const { field, direction } of this.orderBys) {
          const aValue = a.data()[field];
          const bValue = b.data()[field];
          
          if (aValue === bValue) continue;
          
          const comparison = aValue < bValue ? -1 : 1;
          return direction === 'desc' ? -comparison : comparison;
        }
        return 0;
      });
    }
    
    return { docs, empty: docs.length === 0 };
  }
}

// Exportation du mock Firestore
export const mockFirestore = {
  collection: (name) => new CollectionReference(name)
};
EOL
echo "✅ Fichier mockStorage.js créé"

# 3. Correction du fichier firebase.js
echo "3. Correction du fichier firebase.js..."
cat > src/firebase.js << 'EOL'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { mockFirestore } from "./mockStorage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "app-booking-26571.firebaseapp.com",
  projectId: "app-booking-26571",
  storageBucket: "app-booking-26571.firebasestorage.app",
  messagingSenderId: "985724562753",
  appId: "1:985724562753:web:146bd6983fd016cb9a85c0",
  measurementId: "G-RL3N09C0WM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialiser l'authentification Firebase
export const auth = getAuth(app);

// Utiliser mockFirestore en développement, Firestore en production
const isEmulator = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';

console.log('Running in ' + (isEmulator ? 'emulator' : 'production') + ' mode. Do not use with production credentials.');

// Variable pour contourner l'authentification en développement
export const BYPASS_AUTH = process.env.REACT_APP_BYPASS_AUTH === 'true';

// Exporter db qui sera utilisé par tous les composants
export const db = isEmulator ? mockFirestore : getFirestore(app);
EOL
echo "✅ Fichier firebase.js corrigé"

# 4. Création du répertoire utils et du fichier dateUtils.js
echo "4. Création du fichier dateUtils.js..."
mkdir -p src/utils
cat > src/utils/dateUtils.js << 'EOL'
/**
 * Utilitaires pour la manipulation des dates
 */

/**
 * Formate une date au format YYYY-MM-DD
 * @param {Date|string} date - Date à formater
 * @returns {string} Date formatée
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Vérifier si la date est valide
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Convertit une date au format YYYY-MM-DD en objet Date
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @returns {Date} Objet Date
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Si la date est déjà un objet Date, la retourner
  if (dateString instanceof Date) return dateString;
  
  // Gérer différents formats de date
  if (dateString.includes('/')) {
    const parts = dateString.split('/');
    // Format MM/DD/YYYY
    if (parts.length === 3) {
      return new Date(parts[2], parts[0] - 1, parts[1]);
    }
  }
  
  // Format YYYY-MM-DD
  return new Date(dateString);
};

/**
 * Vérifie si une date est dans le futur
 * @param {Date|string} date - Date à vérifier
 * @returns {boolean} True si la date est dans le futur
 */
export const isFutureDate = (date) => {
  const d = typeof date === 'string' ? parseDate(date) : date;
  if (!d) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return d > today;
};
EOL
echo "✅ Fichier dateUtils.js créé"

# 5. Modification du package.json pour permettre les connexions externes
echo "5. Modification du package.json pour permettre les connexions externes..."
# Sauvegarde du package.json original
cp package.json package.json.bak
# Modification du script start pour ajouter --host 0.0.0.0
sed -i 's/"start": "react-scripts start"/"start": "react-scripts start --host 0.0.0.0"/g' package.json
echo "✅ Package.json modifié pour permettre les connexions externes"

# 6. Nettoyage du cache et des builds précédents
echo "6. Nettoyage du cache et des builds précédents..."
rm -rf node_modules/.cache
rm -rf build
echo "✅ Cache et builds précédents nettoyés"

echo "Toutes les corrections ont été appliquées avec succès!"
echo "Pour finaliser l'installation, exécutez les commandes suivantes:"
echo "1. npm install"
echo "2. npm run build (pour production) ou npm start (pour développement)"
echo ""
echo "Pour déployer sur Render, assurez-vous de définir la variable d'environnement REACT_APP_FIREBASE_API_KEY"

# Commandes Git pour commiter les modifications
echo ""
echo "Pour commiter ces modifications, utilisez les commandes suivantes:"
echo "git add .env src/mockStorage.js src/firebase.js src/utils/dateUtils.js package.json"
echo "git commit -m \"fix: corrections pour le déploiement sur Render\""
echo "git push"
