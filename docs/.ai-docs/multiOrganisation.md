Parfait ! Maintenant que j'ai analysé votre application, je peux vous donner un plan détaillé pour la rendre multi-organisation. Voici les modifications nécessaires :

## 🏢 **Plan de Migration Multi-Organisation**

### **1. Architecture Actuelle (Problèmes identifiés)**

D'après mon analyse, votre app a actuellement :
- Un seul espace de données partagé
- Pas de séparation organisationnelle
- Données dupliquées entre collections (contacts, concerts, lieux, etc.)
- Authentification simple sans notion d'organisation

### **2. Modifications Nécessaires**

#### **A. Structure de Données Firebase**

**Nouveau modèle de collections :**

```typescript name=firebase-schema-multi-org.ts
// 1. Collection principale des organisations
organizations: {
  [orgId]: {
    name: string;
    slug: string; // nom-organisation (URL-friendly)
    ownerId: string; // uid du créateur
    members: {
      [userId]: {
        role: 'owner' | 'admin' | 'member';
        joinedAt: Timestamp;
        permissions: string[];
      }
    };
    settings: {
      timezone: string;
      currency: string;
      logo?: string;
    };
    createdAt: Timestamp;
    isActive: boolean;
  }
}

// 2. Collections spécifiques par organisation
programmateurs_org_{orgId}: {
  // vos données programmateurs actuelles
}

concerts_org_{orgId}: {
  // vos données concerts actuelles
}

lieux_org_{orgId}: {
  // vos données lieux actuelles
}

// 3. Index global des utilisateurs
user_organizations: {
  [userId]: {
    organizations: {
      [orgId]: {
        role: string;
        joinedAt: Timestamp;
      }
    };
    defaultOrganization?: string;
  }
}
```

#### **B. Modifications du Service Firebase**

```javascript name=firebase-service-multi-org.js
// Ajout du contexte organisationnel
let currentOrganizationId = null;

export const setCurrentOrganization = (orgId) => {
  currentOrganizationId = orgId;
  localStorage.setItem('currentOrganizationId', orgId);
};

export const getCurrentOrganization = () => {
  if (!currentOrganizationId) {
    currentOrganizationId = localStorage.getItem('currentOrganizationId');
  }
  return currentOrganizationId;
};

// Wrapper pour les collections avec contexte org
export const getOrgCollection = (collectionName) => {
  const orgId = getCurrentOrganization();
  if (!orgId) throw new Error('Aucune organisation sélectionnée');
  
  return collection(db, `${collectionName}_org_${orgId}`);
};

// Nouvelles fonctions pour la gestion des organisations
export const createOrganization = async (orgData, userId) => {
  const orgRef = doc(collection(db, 'organizations'));
  const orgId = orgRef.id;
  
  const batch = writeBatch(db);
  
  // Créer l'organisation
  batch.set(orgRef, {
    ...orgData,
    ownerId: userId,
    members: {
      [userId]: {
        role: 'owner',
        joinedAt: serverTimestamp(),
        permissions: ['all']
      }
    },
    createdAt: serverTimestamp(),
    isActive: true
  });
  
  // Ajouter l'utilisateur aux index
  const userOrgRef = doc(db, 'user_organizations', userId);
  batch.set(userOrgRef, {
    organizations: {
      [orgId]: {
        role: 'owner',
        joinedAt: serverTimestamp()
      }
    },
    defaultOrganization: orgId
  }, { merge: true });
  
  await batch.commit();
  return orgId;
};
```

#### **C. Nouveau Context Organisationnel**

```javascript name=OrganizationContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCurrentOrganization, setCurrentOrganization } from '@/services/firebase-service';

const OrganizationContext = createContext();

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization doit être utilisé dans OrganizationProvider');
  }
  return context;
};

export const OrganizationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [currentOrg, setCurrentOrg] = useState(null);
  const [userOrgs, setUserOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadUserOrganizations();
    }
  }, [currentUser]);

  const loadUserOrganizations = async () => {
    try {
      // Charger les organisations de l'utilisateur
      const userOrgDoc = await getDoc(doc(db, 'user_organizations', currentUser.uid));
      
      if (userOrgDoc.exists()) {
        const userData = userOrgDoc.data();
        const orgIds = Object.keys(userData.organizations || {});
        
        // Charger les détails de chaque organisation
        const orgsPromises = orgIds.map(orgId => 
          getDoc(doc(db, 'organizations', orgId))
        );
        
        const orgDocs = await Promise.all(orgsPromises);
        const organizations = orgDocs
          .filter(doc => doc.exists())
          .map(doc => ({ id: doc.id, ...doc.data() }));
        
        setUserOrgs(organizations);
        
        // Définir l'organisation courante
        const savedOrgId = getCurrentOrganization();
        const defaultOrg = organizations.find(org => 
          org.id === savedOrgId || org.id === userData.defaultOrganization
        ) || organizations[0];
        
        if (defaultOrg) {
          switchOrganization(defaultOrg.id);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des organisations:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchOrganization = (orgId) => {
    setCurrentOrganization(orgId);
    setCurrentOrg(userOrgs.find(org => org.id === orgId));
  };

  return (
    <OrganizationContext.Provider value={{
      currentOrg,
      userOrgs,
      loading,
      switchOrganization,
      loadUserOrganizations
    }}>
      {children}
    </OrganizationContext.Provider>
  );
};
```

#### **D. Composant de Sélection d'Organisation**

```javascript name=OrganizationSelector.js
import React from 'react';
import { useOrganization } from '@/context/OrganizationContext';

const OrganizationSelector = () => {
  const { currentOrg, userOrgs, switchOrganization } = useOrganization();

  if (userOrgs.length <= 1) return null;

  return (
    <div className="organization-selector">
      <select 
        value={currentOrg?.id || ''} 
        onChange={(e) => switchOrganization(e.target.value)}
        className="form-select"
      >
        {userOrgs.map(org => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OrganizationSelector;
```

#### **E. Processus d'Inscription Multi-Organisation**

```javascript name=OnboardingFlow.js
import React, { useState } from 'react';
import { createOrganization } from '@/services/firebase-service';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';

const OnboardingFlow = () => {
  const { currentUser } = useAuth();
  const { loadUserOrganizations } = useOrganization();
  const [step, setStep] = useState('choice'); // 'choice', 'create', 'join'
  const [orgData, setOrgData] = useState({
    name: '',
    slug: '',
    type: 'venue' // venue, festival, booking_agency
  });

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    
    try {
      const orgId = await createOrganization(orgData, currentUser.uid);
      await loadUserOrganizations();
      // Redirection vers l'app
    } catch (error) {
      console.error('Erreur création organisation:', error);
    }
  };

  return (
    <div className="onboarding-flow">
      {step === 'choice' && (
        <div className="choice-step">
          <h2>Bienvenue ! Comment souhaitez-vous utiliser l'application ?</h2>
          
          <div className="choice-buttons">
            <button 
              onClick={() => setStep('create')}
              className="btn-primary"
            >
              Créer une nouvelle organisation
            </button>
            
            <button 
              onClick={() => setStep('join')}
              className="btn-secondary"
            >
              Rejoindre une organisation existante
            </button>
          </div>
        </div>
      )}

      {step === 'create' && (
        <form onSubmit={handleCreateOrganization} className="create-org-form">
          <h2>Créer votre organisation</h2>
          
          <div className="form-group">
            <label>Nom de l'organisation</label>
            <input
              type="text"
              value={orgData.name}
              onChange={(e) => setOrgData({...orgData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Type d'organisation</label>
            <select
              value={orgData.type}
              onChange={(e) => setOrgData({...orgData, type: e.target.value})}
            >
              <option value="venue">Salle de spectacle</option>
              <option value="festival">Festival</option>
              <option value="booking_agency">Agence de booking</option>
              <option value="artist_management">Management d'artistes</option>
            </select>
          </div>

          <button type="submit" className="btn-primary">
            Créer l'organisation
          </button>
        </form>
      )}
    </div>
  );
};

export default OnboardingFlow;
```

### **3. Migration des Données Existantes**

```javascript name=migration-script.js
// Script de migration pour les données existantes
const migrateToMultiOrg = async () => {
  // 1. Créer une organisation par défaut pour les données existantes
  const defaultOrgId = await createOrganization({
    name: "Organisation par défaut",
    slug: "default",
    type: "venue"
  }, "admin-user-id");

  // 2. Migrer chaque collection
  const collections = ['programmateurs', 'concerts', 'lieux', 'artistes'];
  
  for (const collectionName of collections) {
    const oldCollection = collection(db, collectionName);
    const newCollection = collection(db, `${collectionName}_org_${defaultOrgId}`);
    
    const snapshot = await getDocs(oldCollection);
    const batch = writeBatch(db);
    
    snapshot.forEach(doc => {
      const newDocRef = doc(newCollection, doc.id);
      batch.set(newDocRef, doc.data());
    });
    
    await batch.commit();
  }
};
```

### **4. Règles de Sécurité Firebase**

```javascript name=firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les organisations
    match /organizations/{orgId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.members;
    }
    
    // Règles pour les collections organisationnelles
    match /{collection}_org_{orgId}/{docId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/organizations/$(orgId)) &&
        request.auth.uid in get(/databases/$(database)/documents/organizations/$(orgId)).data.members;
    }
    
    // Index utilisateur-organisations
    match /user_organizations/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

### **5. Hooks Modifiés**

```javascript name=useMultiOrgQuery.js
// Nouveau hook qui prend en compte le contexte organisationnel
export const useMultiOrgQuery = (collectionName, queryOptions = {}) => {
  const { currentOrg } = useOrganization();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentOrg) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const orgCollection = getOrgCollection(collectionName);
        let q = query(orgCollection);
        
        // Appliquer les filtres...
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setData(results);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentOrg, collectionName, queryOptions]);

  return { data, loading, error };
};
```

## 🚀 **Plan de Déploiement**

1. **Phase 1** : Implémenter le système d'organisations
2. **Phase 2** : Migrer les données existantes
3. **Phase 3** : Mettre à jour les composants existants
4. **Phase 4** : Déployer les nouvelles règles de sécurité
5. **Phase 5** : Tests et validation
