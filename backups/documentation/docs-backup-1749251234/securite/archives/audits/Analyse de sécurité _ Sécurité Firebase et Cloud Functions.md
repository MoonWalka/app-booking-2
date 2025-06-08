# Analyse de sécurité : Sécurité Firebase et Cloud Functions

## Configuration et utilisation des services Firebase

L'application utilise Firebase comme backend principal, avec potentiellement des Cloud Functions. Voici les observations concernant la sécurité de ces services.

### Points positifs

- Séparation des environnements de développement et de production
- Utilisation d'un service émulateur pour le développement local

### Points à améliorer

1. **Absence de règles de sécurité Firebase explicites**

Aucun fichier de règles de sécurité Firebase n'a été identifié dans le code examiné. Ces règles sont essentielles pour contrôler l'accès aux données Firestore, au stockage et aux autres services Firebase.

2. **Potentielle exposition des fonctions Cloud**

```javascript
// Dans functions/package.json
{
  "name": "functions",
  "description": "Cloud Functions for Firebase",
  "dependencies": {
    "cors": "^2.8.5",
    "firebase-admin": "^13.3.0",
    "firebase-functions": "^6.3.2",
    "puppeteer-core": "^10.4.0",
    "puppeteer": "^10.4.0"
  }
}
```

L'utilisation de CORS sans configuration stricte pourrait exposer les fonctions Cloud à des appels non autorisés.

3. **Absence de validation côté serveur**

Aucun code de validation côté serveur n'a été identifié pour les opérations critiques, ce qui pourrait permettre des manipulations de données non autorisées si la validation côté client est contournée.

4. **Gestion des accès aux services cloud**

```javascript
// Dans firebase-service.js
// Initialisation normale de Firebase pour la production
app = initializeApp(firebaseConfig);
db = initializeFirestore(app, {
  experimentalForceLongPolling: false,
  useFetchStreams: true
});
auth = getAuth(app);
storage = getStorage(app);
remoteConfig = getRemoteConfig(app);
```

Aucune configuration explicite des droits d'accès aux différents services n'a été identifiée.

## Recommandations

1. **Implémenter des règles de sécurité Firebase** strictes pour tous les services utilisés :
```javascript
// Exemple de règles Firestore recommandées
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authentification requise pour toutes les opérations
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Règles spécifiques par collection
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /concerts/{concertId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                    (resource.data.createdBy == request.auth.uid || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

2. **Configurer CORS de manière stricte** pour les fonctions Cloud :
```javascript
// Configuration CORS recommandée
const corsOptions = {
  origin: ['https://votre-domaine-de-production.com', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true,
  maxAge: 86400 // 24 heures
};

const corsMiddleware = cors(corsOptions);

exports.secureFunction = functions.https.onRequest((req, res) => {
  return corsMiddleware(req, res, () => {
    // Vérification d'authentification
    if (!req.headers.authorization) {
      return res.status(403).send('Non autorisé');
    }
    
    // Logique de la fonction
    // ...
  });
});
```

3. **Implémenter une validation côté serveur** pour toutes les opérations critiques :
```javascript
// Exemple de validation côté serveur
exports.createConcert = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    try {
      // Vérification d'authentification
      const authToken = req.headers.authorization?.split('Bearer ')[1];
      if (!authToken) {
        return res.status(403).send('Non autorisé');
      }
      
      const decodedToken = await admin.auth().verifyIdToken(authToken);
      const uid = decodedToken.uid;
      
      // Validation des données
      const concertData = req.body;
      if (!concertData.title || !concertData.date) {
        return res.status(400).send('Données invalides');
      }
      
      // Ajout de métadonnées de sécurité
      concertData.createdBy = uid;
      concertData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      
      // Création du document
      const result = await admin.firestore().collection('concerts').add(concertData);
      
      return res.status(200).json({ id: result.id });
    } catch (error) {
      console.error('Erreur:', error);
      return res.status(500).send('Erreur serveur');
    }
  });
});
```

4. **Mettre en place une gestion fine des accès** aux services cloud avec des rôles personnalisés :
```javascript
// Exemple de vérification de rôle
const checkUserRole = async (uid, requiredRole) => {
  const userDoc = await admin.firestore().collection('users').doc(uid).get();
  if (!userDoc.exists) {
    return false;
  }
  
  const userData = userDoc.data();
  return userData.role === requiredRole || userData.role === 'admin';
};
```

5. **Activer la journalisation de sécurité** pour tous les services Firebase afin de détecter les tentatives d'accès non autorisées.
