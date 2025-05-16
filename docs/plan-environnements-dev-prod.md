# Plan de mise en place des environnements de développement et production - TourCraft

## 1. Contexte et objectifs

L'application TourCraft est actuellement déployée en production sans séparation claire des environnements. Ce document détaille un plan pour mettre en place un environnement de développement distinct sans perturber l'environnement de production existant.

### Objectifs principaux :
- Permettre aux développeurs de travailler dans un environnement **totalement hors ligne**
- Maintenir l'intégrité et la stabilité de l'environnement de production
- Faciliter la collaboration entre les développeurs
- Établir un pipeline clair pour la promotion du code du développement vers la production

## 2. État actuel de l'application

### 2.1 Technologies utilisées
- Frontend: React 18 avec Create React App (CRA) et Craco
- Backend: Firebase (Firestore, Authentication, Storage, Remote Config)
- Déploiement: Probablement via Firebase Hosting (à confirmer)
- Gestion de dépendances: npm

### 2.2 Limitations actuelles
- Configuration Firebase unique pour tous les environnements
- Variables d'environnement non séparées entre développement et production
- Absence de mécanisme de promotion de code (dev → prod)
- Risque de modification accidentelle des données de production lors du développement
- **Dépendance constante à une connexion internet** pour le développement
- **Impossibilité de travailler hors ligne** ou dans des environnements à faible connectivité

## 3. Architecture proposée

### 3.1 Principe général
Au lieu de créer deux environnements Firebase distincts, nous allons créer trois modes de fonctionnement :
1. **Mode local (hors ligne)** : Utilisant IndexedDB et localStorage, sans aucune dépendance à Firebase
2. **Mode développement** : Utilisant un projet Firebase de développement
3. **Mode production** : Utilisant le projet Firebase de production existant

### 3.2 Structure de l'architecture

```
TourCraft
├── Base de code unique
│   ├── Configuration pour l'environnement local (hors ligne)
│   ├── Configuration pour l'environnement de développement
│   └── Configuration pour l'environnement de production
├── Storage Local
│   ├── IndexedDB pour les données
│   ├── LocalStorage pour la configuration
│   └── Système d'authentification simulé
├── Environnement de développement
│   ├── Projet Firebase "tourcraft-dev"
│   ├── Base de données Firestore de développement
│   ├── Stockage Firebase de développement
│   └── Système d'authentification de développement
└── Environnement de production
    ├── Projet Firebase "tourcraft-prod" (existant)
    ├── Base de données Firestore de production (existante)
    ├── Stockage Firebase de production (existant)
    └── Système d'authentification de production (existant)
```

## 4. Plan de mise en œuvre

### 4.1 Finalisation du système de stockage local

1. **Compléter l'implémentation du mockStorage.js existant**
   - Étendre la classe d'adaptation pour exposer la même API que Firestore
   - Implémenter toutes les méthodes nécessaires pour simuler Firestore
   - Stocker les données dans IndexedDB pour la persistance
   - Ajouter un mécanisme de sauvegarde/restauration des données locales

2. **Création de données de test locales**
   - Générer des données de démo pour chaque collection
   - Permettre l'initialisation de l'environnement local avec ces données
   - Ajouter un mécanisme pour réinitialiser les données à tout moment

### 4.2 Création d'un projet Firebase de développement (pour le mode en ligne)

1. Créer un nouveau projet Firebase "tourcraft-dev"
2. Configurer Firestore, Authentication et Storage avec des paramètres similaires à la production
3. Exporter un échantillon des données de production et les importer dans l'environnement de développement (données anonymisées si nécessaire)

### 4.3 Configuration des variables d'environnement

#### 4.3.1 Création des fichiers d'environnement
Créer trois fichiers de configuration :
- `.env.local` - Configuration de développement hors ligne
- `.env.development` - Configuration de développement en ligne
- `.env.production` - Configuration de production (existante)

#### 4.3.2 Structure des fichiers d'environnement

```
# .env.local
REACT_APP_MODE=local
REACT_APP_BYPASS_AUTH=true
REACT_APP_USE_EMULATOR=false
REACT_APP_USE_MOCK_DATA=true
REACT_APP_DEMO_DATA=true
```

```
# .env.development
REACT_APP_MODE=development
REACT_APP_FIREBASE_API_KEY=<dev-api-key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<dev-auth-domain>
REACT_APP_FIREBASE_PROJECT_ID=<dev-project-id>
REACT_APP_FIREBASE_STORAGE_BUCKET=<dev-storage-bucket>
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<dev-messaging-sender-id>
REACT_APP_FIREBASE_APP_ID=<dev-app-id>
REACT_APP_FIREBASE_MEASUREMENT_ID=<dev-measurement-id>
REACT_APP_BYPASS_AUTH=false
```

```
# .env.production
REACT_APP_MODE=production
REACT_APP_FIREBASE_API_KEY=<prod-api-key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<prod-auth-domain>
REACT_APP_FIREBASE_PROJECT_ID=<prod-project-id>
REACT_APP_FIREBASE_STORAGE_BUCKET=<prod-storage-bucket>
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<prod-messaging-sender-id>
REACT_APP_FIREBASE_APP_ID=<prod-app-id>
REACT_APP_FIREBASE_MEASUREMENT_ID=<prod-measurement-id>
REACT_APP_BYPASS_AUTH=false
```

### 4.4 Création d'un Factory Pattern pour les services Firebase

Créer un système qui permet de basculer facilement entre les implémentations locales et Firebase :

```javascript
// src/services/firebase/index.js
import { getMode } from '../config';
import * as firebaseService from './firebase-service';
import * as mockService from './mock-service';

export function getServiceImplementation() {
  const mode = getMode();
  
  switch (mode) {
    case 'local':
      console.log('Mode local activé - Utilisation de la base de données locale');
      return mockService;
    case 'development':
      console.log('Mode développement activé - Utilisation de Firebase Dev');
      return firebaseService;
    case 'production':
      return firebaseService;
    default:
      console.warn('Mode inconnu, utilisation du mode local par défaut');
      return mockService;
  }
}

// Exporter toutes les méthodes nécessaires
const service = getServiceImplementation();
export const { 
  db, 
  auth, 
  storage, 
  collection,
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  // ... autres méthodes
} = service;
```

### 4.5 Adaptation du code pour prendre en compte les environnements

#### 4.5.1 Modification de firebaseInit.js

```javascript
// src/firebaseInit.js
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, initializeFirestore, collection, doc, getDoc, getDocs,
  // ... autres imports
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, /* ... */ } from 'firebase/auth';
import { getStorage, ref as storageRef, /* ... */ } from 'firebase/storage';
import { getRemoteConfig } from 'firebase/remote-config';
import { localDB } from './mockStorage';

// Vérifier le mode d'exécution
const MODE = process.env.REACT_APP_MODE || 'local';
const IS_LOCAL_MODE = MODE === 'local';

// Configuration Firebase selon le mode
const getFirebaseConfig = () => {
  if (IS_LOCAL_MODE) {
    return null; // Pas besoin de config en mode local
  }
  
  return {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
  };
};

let app, db, auth, storage, remoteConfig;

// N'initialiser Firebase que si on n'est pas en mode local
if (!IS_LOCAL_MODE) {
  const config = getFirebaseConfig();
  app = initializeApp(config);
  db = initializeFirestore(app, {
    experimentalForceLongPolling: false,
    useFetchStreams: true
  });
  auth = getAuth(app);
  storage = getStorage(app);
  remoteConfig = getRemoteConfig(app);
} else {
  // En mode local, utiliser notre mock
  db = localDB;
  auth = {
    currentUser: { uid: 'local-user', email: 'local@example.com' },
    // Implémenter d'autres méthodes au besoin
  };
  // Implémenter des mocks pour storage et remoteConfig si nécessaire
}

// Exporter les bons objets selon le mode
export {
  db,
  auth,
  storage,
  // Autres exports...
};

// Adapter les fonctions en fonction du mode
export const getDoc = IS_LOCAL_MODE ? localDB.getDoc : enhancedGetDoc;
export const getDocs = IS_LOCAL_MODE ? localDB.getDocs : enhancedGetDocs;
// etc. pour les autres fonctions...

// Indicateur du mode courant
export const IS_OFFLINE_MODE = IS_LOCAL_MODE;
export const CURRENT_MODE = MODE;
```

#### 4.5.2 Ajout d'indicateurs visuels pour l'environnement

Créer un composant `EnvironmentBanner.js` pour afficher l'environnement actuel :

```javascript
// src/components/common/EnvironmentBanner.js
import React from 'react';
import { CURRENT_MODE } from '../../firebaseInit';
import './EnvironmentBanner.css';

const EnvironmentBanner = () => {
  if (CURRENT_MODE === 'production') return null;
  
  const bannerText = CURRENT_MODE === 'local' ? 
    '🔌 MODE HORS LIGNE' : 
    '🧪 ENVIRONNEMENT DE DÉVELOPPEMENT';
    
  return (
    <div className={`environment-banner environment-${CURRENT_MODE}`}>
      {bannerText}
    </div>
  );
};

export default EnvironmentBanner;
```

### 4.6 Mise à jour des scripts npm

Modifier `package.json` pour inclure des scripts adaptés à chaque environnement :

```json
"scripts": {
  "start": "craco start",
  "start:local": "env-cmd -f .env.local craco start",
  "start:dev": "env-cmd -f .env.development craco start",
  "start:prod": "env-cmd -f .env.production craco start",
  "build": "craco build",
  "build:local": "env-cmd -f .env.local craco build",
  "build:dev": "env-cmd -f .env.development craco build",
  "build:prod": "env-cmd -f .env.production craco build",
  "test": "craco test"
}
```

### 4.7 Création d'un service de synchronisation pour la migration des données

```javascript
// src/services/syncService.js
import { db as firebaseDB } from '../firebaseInit';
import { localDB } from '../mockStorage';

export async function exportLocalDataToFirebase(collections = ['concerts', 'lieux', 'programmateurs']) {
  if (!confirm('Cette action va exporter vos données locales vers Firebase. Continuer?')) {
    return false;
  }
  
  try {
    const localData = JSON.parse(localStorage.getItem('localDB'));
    
    for (const collName of collections) {
      const localCollection = localData[collName] || {};
      
      for (const [docId, data] of Object.entries(localCollection)) {
        const docRef = firebaseDB.collection(collName).doc(docId);
        await docRef.set(data);
      }
      
      console.log(`Collection ${collName} synchronisée avec Firebase`);
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    return false;
  }
}

export async function importFirebaseDataToLocal(collections = ['concerts', 'lieux', 'programmateurs']) {
  if (!confirm('Cette action va importer des données de Firebase vers votre stockage local. Continuer?')) {
    return false;
  }
  
  try {
    const localData = JSON.parse(localStorage.getItem('localDB'));
    
    for (const collName of collections) {
      const snapshot = await firebaseDB.collection(collName).get();
      localData[collName] = {};
      
      snapshot.forEach(doc => {
        localData[collName][doc.id] = doc.data();
      });
      
      console.log(`Collection ${collName} importée de Firebase`);
    }
    
    localStorage.setItem('localDB', JSON.stringify(localData));
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'importation:', error);
    return false;
  }
}
```

### 4.8 Processus de déploiement

1. Configuration de Firebase Hosting avec plusieurs cibles:
```bash
firebase target:apply hosting dev tourcraft-dev
firebase target:apply hosting prod tourcraft-prod
```

2. Mise à jour de `firebase.json` pour prendre en charge les différentes cibles:
```json
{
  "hosting": [
    {
      "target": "dev",
      "public": "build",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    },
    {
      "target": "prod",
      "public": "build",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  ]
}
```

3. Scripts de déploiement dans `package.json`:
```json
"deploy:dev": "npm run build:dev && firebase deploy --only hosting:dev",
"deploy:prod": "npm run build:prod && firebase deploy --only hosting:prod"
```

## 5. Stratégie de gestion du code source

### 5.1 Structure des branches Git

```
main (production)
└── develop (développement)
    ├── feature/feature-name-1
    ├── feature/feature-name-2
    └── ...
```

### 5.2 Processus de développement

1. Les développeurs créent des branches de fonctionnalités à partir de `develop`
2. Le développement initial peut être fait en mode local (hors ligne)
3. Les pull requests sont créées pour fusionner dans `develop`
4. Les tests sont effectués sur l'environnement de développement
5. Une fois stable, `develop` est fusionné dans `main` pour la mise en production

## 6. Considérations de sécurité

1. Ajouter les fichiers `.env.*` à `.gitignore`
2. S'assurer que les clés API de production ne sont jamais partagées en dehors de l'équipe principale
3. Limiter les autorisations Firebase pour l'environnement de développement
4. Anonymiser les données sensibles lors de la migration de production vers développement
5. Avertir clairement les utilisateurs qu'ils sont en mode hors ligne et que les données sont stockées localement
6. Ne pas stocker d'informations sensibles dans IndexedDB/LocalStorage en mode local

## 7. Tests et validation

1. Mettre en place des tests automatisés qui peuvent s'exécuter contre différents environnements
2. Créer des tests spécifiques pour le mode hors ligne
3. Créer des tests d'intégration pour valider la configuration multi-environnements
4. Tester les processus de déploiement avant la mise en place complète
5. Vérifier la synchronisation des données entre les environnements

## 8. Documentation

1. Documenter le processus de configuration des environnements
2. Créer un guide pour les nouveaux développeurs sur l'utilisation de l'environnement local
3. Documenter le processus de synchronisation des données locales vers l'environnement en ligne
4. Documenter le processus de promotion du code de développement vers production

## 9. Calendrier d'implémentation et checklist

### Phase 1: Mise en place du mode local (2 semaines)
- [ ] Compléter l'implémentation du mockStorage.js
- [ ] Créer les adapters pour simuler toutes les API Firebase nécessaires
- [ ] Créer un générateur de données de test
- [ ] Tester l'application en mode 100% local

### Phase 2: Environnements multiples (1 semaine)
- [ ] Créer le projet Firebase de développement
- [ ] Configurer le système de sélection d'environnements
- [ ] Mettre à jour les fichiers de configuration
- [ ] Configurer les variables d'environnement
- [ ] Ajouter les indicateurs visuels

### Phase 3: Synchronisation des données (1 semaine)
- [ ] Implémenter le service de synchronisation
- [ ] Tester la migration des données entre les environnements
- [ ] Configurer les règles de sécurité pour chaque environnement

### Phase 4: Documentation et formation (1 semaine)
- [ ] Documenter le fonctionnement du mode hors ligne
- [ ] Créer un guide pour les développeurs
- [ ] Former l'équipe au nouveau workflow

## 10. Avantages du nouveau plan

- **Développement hors ligne** : Les développeurs peuvent travailler sans connexion Internet
- **Performance accrue** : Les opérations sur les données locales sont instantanées
- **Facilité de test** : Possibilité de tester avec des données simulées
- **Isolation complète** : Aucun risque d'affecter les données de production
- **Mode hybride possible** : Possibilité de travailler en partie en ligne, en partie hors ligne
- **Flexibilité de développement** : Permet de développer dans différents contextes (voyage, faible connectivité)
- **Réduction des coûts** : Moins d'opérations Firebase facturables pendant le développement

## 11. Risques et mitigations

### Risques identifiés
1. **Risque**: Modification accidentelle des données de production pendant le développement
   **Mitigation**: Séparation stricte des projets Firebase et indicateurs visuels clairs

2. **Risque**: Complexité accrue dans le cycle de développement
   **Mitigation**: Documentation claire et formation de l'équipe

3. **Risque**: Divergence entre les environnements
   **Mitigation**: Processus régulier de synchronisation des schémas

4. **Risque**: Comportement différent entre les modes hors ligne et en ligne
   **Mitigation**: Tests approfondis dans les deux modes et implémentation soignée des adaptateurs

5. **Risque**: Coûts supplémentaires liés à un projet Firebase additionnel
   **Mitigation**: Surveiller l'utilisation et optimiser les ressources, réduire les coûts grâce au développement local

## 12. Conclusion

La mise en place d'un mode de développement local hors ligne, combiné à des environnements de développement et production Firebase séparés, permettra une collaboration plus efficace entre les développeurs tout en préservant la stabilité de l'application en production. Ce plan propose une approche progressive et sécurisée pour établir cette séparation sans perturber les utilisateurs actuels de TourCraft, tout en offrant une flexibilité accrue aux développeurs qui pourront travailler efficacement même sans connexion internet.