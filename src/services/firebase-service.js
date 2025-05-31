/**
 * Services Firebase centralisés
 * Interface unique pour accéder aux services Firebase avec basculement automatique local/production
 */

import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  collection as firestoreCollection, 
  doc as firestoreDoc, 
  getDoc as firestoreGetDoc, 
  getDocs as firestoreGetDocs,
  setDoc as firestoreSetDoc, 
  addDoc as firestoreAddDoc, 
  updateDoc as firestoreUpdateDoc, 
  deleteDoc as firestoreDeleteDoc,
  query as firestoreQuery, 
  where as firestoreWhere, 
  orderBy as firestoreOrderBy, 
  limit as firestoreLimit, 
  startAfter as firestoreStartAfter,
  serverTimestamp as firestoreServerTimestamp, 
  arrayUnion as firestoreArrayUnion, 
  arrayRemove as firestoreArrayRemove,
  onSnapshot as firestoreOnSnapshot, 
  Timestamp as FirebaseTimestamp, 
  getCountFromServer as firestoreGetCountFromServer,
  writeBatch as firestoreWriteBatch
} from 'firebase/firestore';
import { 
  getAuth, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getRemoteConfig } from 'firebase/remote-config';

// Détection directe du mode sans Factory
const IS_LOCAL_MODE = (process.env.REACT_APP_MODE || 'production') === 'local';

// Migration vers Firebase Testing SDK
let emulatorService = null;

if (IS_LOCAL_MODE) {
  try {
    // Import du service émulateur Firebase Testing SDK
    const firebaseEmulator = require('./firebase-emulator-service');
    emulatorService = firebaseEmulator.default;
    
    // Initialisation de l'émulateur
    if (emulatorService && emulatorService.initializeEmulator) {
      emulatorService.initializeEmulator().catch(err => {
        emulatorService = null;
      });
    }
  } catch (err) {
    emulatorService = null;
  }
}

// Configuration Firebase selon le mode
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Variables pour les services Firebase ou leurs mocks
let app, db, auth, storage, remoteConfig;

// Gestion améliorée des erreurs Firestore
const handleFirestoreError = (error) => {
  console.error("Erreur Firestore:", error);
  return Promise.reject(error);
};

// Initialisation conditionnelle selon le mode
if (IS_LOCAL_MODE) {
  console.log('[LOG Firebase Service] Mode local détecté, emulatorService:', emulatorService);
  // Utiliser mockStorage pour db
  db = emulatorService;
  
  // Mock de l'authentification
  auth = {
    currentUser: { uid: 'local-user', email: 'local@example.com', displayName: 'Utilisateur Local' },
    onAuthStateChanged: (callback) => {
      callback({ uid: 'local-user', email: 'local@example.com', displayName: 'Utilisateur Local' });
      return () => {}; // fonction de nettoyage
    },
    signInWithEmailAndPassword: async () => ({ 
      user: { uid: 'local-user', email: 'local@example.com', displayName: 'Utilisateur Local' }
    }),
    signOut: async () => Promise.resolve(),
    createUserWithEmailAndPassword: async () => ({
      user: { uid: 'new-local-user', email: 'new-local@example.com', displayName: 'Nouvel Utilisateur' }
    })
  };
  
  // Mock du stockage
  storage = {
    // Implémenter au besoin pour simuler le stockage
  };
  
  // Mock de remoteConfig
  remoteConfig = {
    // Implémenter au besoin
  };
} else {
  // Initialisation normale de Firebase pour la production
  app = initializeApp(firebaseConfig);
  db = initializeFirestore(app, {
    experimentalForceLongPolling: false,
    useFetchStreams: true
  });
  auth = getAuth(app);
  storage = getStorage(app);
  remoteConfig = getRemoteConfig(app);
}

// Mock pour getCountFromServer si en mode local
const mockGetCountFromServer = async (query) => {
  // Extraction du nom de la collection depuis la requête
  const collectionName = query._path?.segments?.[0] || '';
  
  // Compter manuellement le nombre d'éléments dans la collection mocquée
  let count = 0;
  try {
    if (emulatorService) {
      const mockDocs = await emulatorService.getDocs(emulatorService.collection(collectionName));
      count = mockDocs.docs?.length || 0;
    }
  } catch (e) {
    console.error('Erreur lors du comptage mock:', e);
  }
  
  return {
    data: () => ({ count })
  };
};

// Mock de onSnapshot pour le mode local
const mockOnSnapshot = (docRef, callback) => {
  const path = typeof docRef.path === 'string' ? docRef.path : '';
  const pathParts = path.split('/');
  const collectionName = pathParts.length > 0 ? pathParts[0] : '';
  const docId = pathParts.length > 1 ? pathParts[1] : '';
  
  setTimeout(() => {
    try {
      if (emulatorService && typeof emulatorService.getDoc === 'function') {
        const mockDoc = emulatorService.doc(collectionName, docId);
        emulatorService.getDoc(mockDoc).then(snapshot => {
          callback(snapshot);
        });
      } else {
        callback({
          exists: () => false,
          data: () => null,
          id: docId
        });
      }
    } catch (e) {
      console.error('Erreur dans mock onSnapshot:', e);
      callback({
        exists: () => false,
        data: () => null,
        id: docId
      });
    }
  }, 100);
  
  return () => {};
};

// Surcharge des fonctions Firestore avec gestion d'erreurs
const enhancedGetDoc = async (...args) => {
  try {
    return await firestoreGetDoc(...args);
  } catch (error) {
    return handleFirestoreError(error);
  }
};

const enhancedGetDocs = async (...args) => {
  try {
    return await firestoreGetDocs(...args);
  } catch (error) {
    return handleFirestoreError(error);
  }
};

// Fonctions mock directes avec optional chaining
const getDirectMockFunction = (functionName) => {
  return (...args) => {
    console.log(`[LOG Firebase Service] Appel de ${functionName} avec args:`, args);
    const result = emulatorService?.[functionName]?.(...args) || null;
    console.log(`[LOG Firebase Service] Résultat de ${functionName}:`, result);
    return result;
  };
};

// Export des fonctions appropriées selon le mode
export {
  db,
  auth,
  storage,
  remoteConfig
};

// Exports directs sans proxies intermédiaires
export const collection = IS_LOCAL_MODE ? getDirectMockFunction('collection') : firestoreCollection;
export const doc = IS_LOCAL_MODE ? getDirectMockFunction('doc') : firestoreDoc;
export const getDoc = IS_LOCAL_MODE ? getDirectMockFunction('getDoc') : enhancedGetDoc;
export const getDocs = IS_LOCAL_MODE ? getDirectMockFunction('getDocs') : enhancedGetDocs;
export const setDoc = IS_LOCAL_MODE ? getDirectMockFunction('setDoc') : firestoreSetDoc;
export const addDoc = IS_LOCAL_MODE ? getDirectMockFunction('addDoc') : firestoreAddDoc;
export const updateDoc = IS_LOCAL_MODE ? getDirectMockFunction('updateDoc') : firestoreUpdateDoc;
export const deleteDoc = IS_LOCAL_MODE ? getDirectMockFunction('deleteDoc') : firestoreDeleteDoc;
export const query = IS_LOCAL_MODE ? getDirectMockFunction('query') : firestoreQuery;
export const where = IS_LOCAL_MODE ? getDirectMockFunction('where') : firestoreWhere;
export const orderBy = IS_LOCAL_MODE ? getDirectMockFunction('orderBy') : firestoreOrderBy;
export const limit = IS_LOCAL_MODE ? getDirectMockFunction('limit') : firestoreLimit;
export const startAfter = IS_LOCAL_MODE ? getDirectMockFunction('startAfter') : firestoreStartAfter;
export const serverTimestamp = IS_LOCAL_MODE ? getDirectMockFunction('serverTimestamp') : firestoreServerTimestamp;
export const arrayUnion = IS_LOCAL_MODE ? getDirectMockFunction('arrayUnion') : firestoreArrayUnion;
export const arrayRemove = IS_LOCAL_MODE ? getDirectMockFunction('arrayRemove') : firestoreArrayRemove;
export const Timestamp = IS_LOCAL_MODE ? getDirectMockFunction('Timestamp') : FirebaseTimestamp;
export const onSnapshot = IS_LOCAL_MODE ? mockOnSnapshot : firestoreOnSnapshot;
export const getCountFromServer = IS_LOCAL_MODE ? mockGetCountFromServer : firestoreGetCountFromServer;
export const writeBatch = IS_LOCAL_MODE ? getDirectMockFunction('writeBatch') : firestoreWriteBatch;

// Fonctions Auth
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged };

// Fonctions Storage
export { storageRef as ref, uploadBytes, getDownloadURL };

// Indicateur de mode
export const MODE_LOCAL = IS_LOCAL_MODE;

// Exports supplémentaires pour maintenir la compatibilité
export const CURRENT_MODE = IS_LOCAL_MODE ? 'local' : 'production';
export { IS_LOCAL_MODE };

// =========================
// MULTI-ORGANISATION
// =========================

// Variable pour stocker l'ID de l'organisation courante
let currentOrganizationId = null;

// Définir l'organisation courante
export const setCurrentOrganization = (orgId) => {
  currentOrganizationId = orgId;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('currentOrganizationId', orgId);
  }
  console.log('🏢 Organisation courante définie:', orgId);
};

// Obtenir l'organisation courante
export const getCurrentOrganization = () => {
  if (!currentOrganizationId && typeof localStorage !== 'undefined') {
    currentOrganizationId = localStorage.getItem('currentOrganizationId');
  }
  return currentOrganizationId;
};

// Effacer l'organisation courante
export const clearCurrentOrganization = () => {
  currentOrganizationId = null;
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('currentOrganizationId');
  }
};

// Obtenir une collection avec contexte organisationnel
export const getOrgCollection = (collectionName) => {
  const orgId = getCurrentOrganization();
  if (!orgId) {
    console.warn('⚠️ Aucune organisation sélectionnée pour la collection:', collectionName);
    throw new Error('Aucune organisation sélectionnée');
  }
  
  const orgCollectionName = `${collectionName}_org_${orgId}`;
  console.log('📁 Accès à la collection organisationnelle:', orgCollectionName);
  
  return collection(db, orgCollectionName);
};

// Obtenir un document avec contexte organisationnel
export const getOrgDoc = (collectionName, docId) => {
  const orgId = getCurrentOrganization();
  if (!orgId) {
    throw new Error('Aucune organisation sélectionnée');
  }
  
  const orgCollectionName = `${collectionName}_org_${orgId}`;
  return doc(db, orgCollectionName, docId);
};

// Créer une nouvelle organisation
export const createOrganization = async (orgData, userId) => {
  console.log('🏢 Création d\'une nouvelle organisation:', orgData.name);
  
  try {
    // Créer l'ID de l'organisation
    const orgRef = doc(collection(db, 'organizations'));
    const orgId = orgRef.id;
    
    // Préparer les données de l'organisation
    const organizationData = {
      ...orgData,
      slug: orgData.slug || orgData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      ownerId: userId,
      members: {
        [userId]: {
          role: 'owner',
          joinedAt: serverTimestamp(),
          permissions: ['all']
        }
      },
      settings: {
        timezone: 'Europe/Paris',
        currency: 'EUR',
        ...orgData.settings
      },
      createdAt: serverTimestamp(),
      isActive: true
    };
    
    // Créer l'organisation
    await setDoc(orgRef, organizationData);
    
    // Ajouter l'organisation à l'index utilisateur
    const userOrgRef = doc(db, 'user_organizations', userId);
    await setDoc(userOrgRef, {
      organizations: {
        [orgId]: {
          role: 'owner',
          joinedAt: serverTimestamp()
        }
      },
      defaultOrganization: orgId
    }, { merge: true });
    
    console.log('✅ Organisation créée avec succès:', orgId);
    return orgId;
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'organisation:', error);
    throw error;
  }
};

// Obtenir les organisations d'un utilisateur
export const getUserOrganizations = async (userId) => {
  console.log('🔍 Récupération des organisations pour l\'utilisateur:', userId);
  
  try {
    const userOrgDoc = await getDoc(doc(db, 'user_organizations', userId));
    
    if (!userOrgDoc.exists()) {
      console.log('ℹ️ Aucune organisation trouvée pour cet utilisateur');
      return [];
    }
    
    const userData = userOrgDoc.data();
    const orgIds = Object.keys(userData.organizations || {});
    
    // Récupérer les détails de chaque organisation
    const orgPromises = orgIds.map(orgId => 
      getDoc(doc(db, 'organizations', orgId))
    );
    
    const orgDocs = await Promise.all(orgPromises);
    const organizations = orgDocs
      .filter(doc => doc.exists())
      .map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        userRole: userData.organizations[doc.id].role 
      }));
    
    console.log(`✅ ${organizations.length} organisation(s) trouvée(s)`);
    return { organizations, defaultOrganization: userData.defaultOrganization };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des organisations:', error);
    throw error;
  }
};

// Inviter un utilisateur dans une organisation
export const inviteUserToOrganization = async (orgId, email, role = 'member') => {
  console.log('📧 Invitation d\'un utilisateur:', email, 'dans l\'organisation:', orgId);
  
  try {
    // Ici, nous créerions normalement une invitation
    // Pour l'instant, nous allons créer une entrée dans une collection d'invitations
    const invitationRef = doc(collection(db, 'organization_invitations'));
    
    await setDoc(invitationRef, {
      organizationId: orgId,
      email: email,
      role: role,
      status: 'pending',
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 jours
    });
    
    console.log('✅ Invitation envoyée avec succès');
    return invitationRef.id;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'invitation:', error);
    throw error;
  }
};

// Mettre à jour les paramètres d'une organisation
export const updateOrganizationSettings = async (orgId, settings) => {
  console.log('⚙️ Mise à jour des paramètres de l\'organisation:', orgId);
  
  try {
    const orgRef = doc(db, 'organizations', orgId);
    await updateDoc(orgRef, {
      settings: settings,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Paramètres mis à jour avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des paramètres:', error);
    throw error;
  }
};