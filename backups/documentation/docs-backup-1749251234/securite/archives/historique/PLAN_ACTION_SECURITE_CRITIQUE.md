# 🚨 PLAN D'ACTION SÉCURITÉ CRITIQUE - TourCraft

**Date de création :** 29 mai 2025  
**Statut :** 🔴 **URGENT - À TRAITER IMMÉDIATEMENT**  
**Équipe :** Développement + DevOps + Sécurité

---

## 🎯 **OBJECTIF**

Corriger les **4 vulnérabilités CRITIQUES** identifiées dans l'audit de sécurité avant toute mise en production.

---

## 🚨 **VULNÉRABILITÉS CRITIQUES CONFIRMÉES**

### **1. 🔓 AUTHENTIFICATION SIMULÉE**
- **Fichier :** `src/pages/LoginPage.js`
- **Problème :** Identifiants codés en dur `test@example.com/password`
- **Risque :** Accès non autorisé à l'application
- **Impact :** 🔴 **CRITIQUE**

### **2. 🔐 EXPOSITION VARIABLES FIREBASE**
- **Fichier :** `src/services/firebase-service.js`
- **Problème :** Variables d'environnement exposées dans le bundle JS
- **Risque :** Accès non autorisé aux services Firebase
- **Impact :** 🔴 **CRITIQUE**

### **3. 🛡️ RÈGLES FIREBASE MANQUANTES**
- **Fichier :** Aucun `firestore.rules` trouvé
- **Problème :** Aucune protection Firestore configurée
- **Risque :** Accès libre aux données
- **Impact :** 🔴 **CRITIQUE**

### **4. ⚔️ PROTECTION CSRF ABSENTE**
- **Problème :** Aucune protection contre les attaques CSRF
- **Risque :** Exécution d'actions non autorisées
- **Impact :** 🔴 **CRITIQUE**

---

## 🎯 **PLAN DE CORRECTION - PHASE CRITIQUE**

### **📋 CORRECTION 1 : Remplacer l'Authentification Simulée**

#### **🎯 Objectif :**
Intégrer Firebase Authentication complètement et supprimer l'auth simulée.

#### **🔧 Actions Immédiates :**

1. **Modifier `src/pages/LoginPage.js`** :
```javascript
// AVANT (VULNÉRABLE)
if (email === 'test@example.com' && password === 'password') {
  navigate('/');
}

// APRÈS (SÉCURISÉ)
try {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  console.log('Connexion réussie:', user.uid);
  navigate('/');
} catch (error) {
  setError('Identifiants invalides');
}
```

2. **Supprimer complètement** :
   - Texte d'aide avec identifiants de test
   - Mode bypass d'authentification
   - Utilisateurs factices

3. **Créer un composant PrivateRoute** pour protéger les routes

#### **⏰ Délai :** 2 heures  
#### **🔬 Test :** Impossible de se connecter sans compte Firebase valide

---

### **📋 CORRECTION 2 : Sécuriser les Variables Firebase**

#### **🎯 Objectif :**
Déplacer les opérations sensibles vers le backend et sécuriser la configuration.

#### **🔧 Actions Immédiates :**

1. **Créer `firestore.rules`** avec règles strictes
2. **Créer Cloud Functions** pour les opérations critiques
3. **Modifier la configuration frontend** pour être publique-safe
4. **Ajouter validation backend** pour toutes les opérations

#### **Configuration Sécurisée :**
```javascript
// Les clés API Firebase SONT exposées côté client par design Firebase
// MAIS avec des règles de sécurité strictes, c'est sécurisé
const firebaseConfig = {
  // Ces variables PEUVENT être publiques SI les règles sont strictes
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  // ... autres configs publiques
};
```

#### **⏰ Délai :** 4 heures  
#### **🔬 Test :** Impossible d'accéder aux données sans authentification

---

### **📋 CORRECTION 3 : Implémenter Règles Firebase**

#### **🎯 Objectif :**
Créer des règles de sécurité Firestore strictes pour toutes les collections.

#### **🔧 Actions Immédiates :**

1. **Créer `firestore.rules`** :
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // RÈGLE PAR DÉFAUT : TOUT INTERDIT
    match /{document=**} {
      allow read, write: if false;
    }
    
    // CONCERTS : Lecture publique, écriture authentifiée
    match /concerts/{concertId} {
      allow read: if true; // Lecture publique pour l'affichage
      allow write: if request.auth != null && 
                     (resource == null || resource.data.createdBy == request.auth.uid);
    }
    
    // UTILISATEURS : Accès privé uniquement
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // PROGRAMMATEURS : Authentification requise
    match /programmateurs/{progId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     (resource == null || resource.data.createdBy == request.auth.uid);
    }
    
    // ARTISTES : Authentification requise
    match /artistes/{artisteId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // LIEUX : Authentification requise
    match /lieux/{lieuId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

2. **Tester les règles** avec l'émulateur Firebase
3. **Déployer les règles** via `firebase deploy --only firestore:rules`

#### **⏰ Délai :** 3 heures  
#### **🔬 Test :** Tentative d'accès non authentifié échoue

---

### **📋 CORRECTION 4 : Ajouter Protection CSRF**

#### **🎯 Objectif :**
Protéger toutes les requêtes modifiant des données contre les attaques CSRF.

#### **🔧 Actions Immédiates :**

1. **Créer un service CSRF** :
```javascript
// src/services/csrfService.js
class CSRFService {
  constructor() {
    this.token = null;
    this.generateToken();
  }
  
  generateToken() {
    this.token = crypto.randomUUID();
    sessionStorage.setItem('csrf_token', this.token);
    return this.token;
  }
  
  getToken() {
    return this.token || sessionStorage.getItem('csrf_token');
  }
  
  validateToken(token) {
    return token === this.getToken();
  }
}

export default new CSRFService();
```

2. **Ajouter middleware CSRF** aux requêtes axios
3. **Valider tokens côté serveur** dans les Cloud Functions

#### **⏰ Délai :** 2 heures  
#### **🔬 Test :** Requêtes sans token CSRF échouent

---

## 📈 **PLANNING DE CORRECTION**

### **🕐 JOUR 1 - URGENT (11 heures)**
- **Heures 1-2** : Correction 1 - Auth simulée ✅
- **Heures 3-6** : Correction 2 - Variables Firebase ✅
- **Heures 7-9** : Correction 3 - Règles Firestore ✅
- **Heures 10-11** : Correction 4 - Protection CSRF ✅

### **🕐 JOUR 2 - VALIDATION (4 heures)**
- **Heures 1-2** : Tests de sécurité complets
- **Heures 3-4** : Documentation et formation équipe

---

## 🔬 **TESTS DE VALIDATION**

### **Test 1 : Authentification**
```bash
# Tentative de connexion avec identifiants factices
curl -X POST http://localhost:3000/api/login \
  -d '{"email":"test@example.com","password":"password"}'
# RÉSULTAT ATTENDU : 401 Unauthorized
```

### **Test 2 : Règles Firebase**
```javascript
// Tentative d'accès non authentifié
try {
  const docs = await getDocs(collection(db, 'concerts'));
  // RÉSULTAT ATTENDU : Exception permission denied
} catch (error) {
  console.log('Sécurité OK:', error.code === 'permission-denied');
}
```

### **Test 3 : Protection CSRF**
```bash
# Requête sans token CSRF
curl -X POST http://localhost:3000/api/concerts \
  -H "Content-Type: application/json" \
  -d '{"titre":"Concert Test"}'
# RÉSULTAT ATTENDU : 403 Forbidden
```

---

## 📊 **CRITÈRES DE SUCCÈS**

### **✅ Authentification Sécurisée**
- [ ] Aucun identifiant codé en dur
- [ ] Firebase Auth intégré à 100%
- [ ] Routes protégées implémentées
- [ ] Tests de connexion passent

### **✅ Configuration Sécurisée**
- [ ] Règles Firestore déployées
- [ ] Validation backend active
- [ ] Variables sensibles protégées
- [ ] Tests d'accès non autorisé échouent

### **✅ Protection CSRF**
- [ ] Tokens CSRF générés
- [ ] Validation côté serveur
- [ ] Middleware axios configuré
- [ ] Tests CSRF passent

---

## 🎯 **RESPONSABILITÉS**

| Tâche | Responsable | Backup | Deadline |
|-------|-------------|---------|----------|
| Auth Firebase | Dev Lead | Dev Senior | J1 H2 |
| Règles Firestore | DevOps | Dev Lead | J1 H9 |
| Protection CSRF | Dev Senior | Dev Lead | J1 H11 |
| Tests Sécurité | QA Lead | Dev Senior | J2 H2 |

---

## 🚨 **ESCALATION**

### **Si Problème Bloquant :**
1. **Alerte immédiate** : Équipe sécurité + Management
2. **Arrêt déploiement** : Production bloquée jusqu'à résolution
3. **Audit externe** : Si vulnérabilité critique non résolue

---

## 📋 **VALIDATION FINALE**

### **Checklist Sécurité :**
- [ ] Audit de sécurité réussi
- [ ] Tests de pénétration passés
- [ ] Documentation à jour
- [ ] Équipe formée aux nouveaux processus

---

*Plan d'action créé le 29 mai 2025*  
*Priorité : 🔴 CRITIQUE - Exécution immédiate requise* 