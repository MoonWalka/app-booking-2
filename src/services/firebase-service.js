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
  writeBatch as firestoreWriteBatch,
  deleteField as firestoreDeleteField
} from 'firebase/firestore';
import { 
  getAuth, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getRemoteConfig } from 'firebase/remote-config';
import { getFunctions } from 'firebase/functions';

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
let app, db, auth, storage, remoteConfig, functions;

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
  
  // En mode local, utiliser aussi Firebase Storage si disponible
  // Vérifier d'abord si on a une configuration Firebase valide
  if (firebaseConfig.storageBucket) {
    console.log('[Firebase Service] Utilisation de Firebase Storage en mode local');
    app = initializeApp(firebaseConfig);
    storage = getStorage(app);
  } else {
    console.log('[Firebase Service] Configuration Storage manquante, utilisation du mock');
    // Mock du stockage si pas de configuration
    storage = {
      // Mock minimal pour éviter les erreurs
    };
  }
  
  // Mock de remoteConfig
  remoteConfig = {
    // Implémenter au besoin
  };
  
  // Mock de functions
  functions = {
    // Implémenter au besoin pour le mode local
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
  functions = getFunctions(app);
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
  remoteConfig,
  functions
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
export const deleteField = IS_LOCAL_MODE ? getDirectMockFunction('deleteField') : firestoreDeleteField;

// Fonctions Auth
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged };

// Fonctions Storage - toujours utiliser Firebase Storage
export { storageRef as ref, uploadBytes, getDownloadURL };

// Indicateur de mode
export const MODE_LOCAL = IS_LOCAL_MODE;

// Exports supplémentaires pour maintenir la compatibilité
export const CURRENT_MODE = IS_LOCAL_MODE ? 'local' : 'production';
export { IS_LOCAL_MODE };

// =========================
// MULTI-ENTREPRISE
// =========================

// Variable pour stocker l'ID de l'entreprise courante
let currentEntrepriseId = null;

// Définir l'entreprise courante
export const setCurrentEntreprise = (entrepriseId) => {
  currentEntrepriseId = entrepriseId;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('currentEntrepriseId', entrepriseId);
  }
  console.log('🏢 Entreprise courante définie:', entrepriseId);
};

// Obtenir l'entreprise courante
export const getCurrentEntreprise = () => {
  if (!currentEntrepriseId && typeof localStorage !== 'undefined') {
    currentEntrepriseId = localStorage.getItem('currentEntrepriseId');
  }
  return currentEntrepriseId;
};

// Effacer l'entreprise courante
export const clearCurrentEntreprise = () => {
  currentEntrepriseId = null;
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('currentEntrepriseId');
  }
};

// Obtenir une collection avec contexte entreprise
export const getEntCollection = (collectionName) => {
  const entrepriseId = getCurrentEntreprise();
  if (!entrepriseId) {
    console.warn('⚠️ Aucune entreprise sélectionnée pour la collection:', collectionName);
    throw new Error('Aucune entreprise sélectionnée');
  }
  
  const entCollectionName = `${collectionName}_ent_${entrepriseId}`;
  console.log('📁 Accès à la collection entreprise:', entCollectionName);
  
  return collection(db, entCollectionName);
};

// Obtenir un document avec contexte entreprise
export const getEntDoc = (collectionName, docId) => {
  const entrepriseId = getCurrentEntreprise();
  if (!entrepriseId) {
    throw new Error('Aucune entreprise sélectionnée');
  }
  
  const entCollectionName = `${collectionName}_ent_${entrepriseId}`;
  return doc(db, entCollectionName, docId);
};

// Créer une nouvelle entreprise
export const createEntreprise = async (entrepriseData, userId, userData = null) => {
  console.log('🏢 Création d\'une nouvelle entreprise:', entrepriseData.name);
  
  try {
    // Créer l'ID de l'entreprise
    const entrepriseRef = doc(collection(db, 'entreprises'));
    const entrepriseId = entrepriseRef.id;
    
    // Préparer les données de l'entreprise
    const entrepriseDataToSave = {
      ...entrepriseData,
      slug: entrepriseData.slug || entrepriseData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
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
        ...entrepriseData.settings
      },
      createdAt: serverTimestamp(),
      isActive: true
    };
    
    // Créer l'entreprise
    await setDoc(entrepriseRef, entrepriseDataToSave);
    
    // Créer le groupe admin par défaut
    const adminGroupRef = doc(db, 'entreprises', entrepriseId, 'groupesPermissions', 'admin');
    await setDoc(adminGroupRef, {
      nom: 'Administrateur',
      description: 'Accès complet à toutes les fonctionnalités',
      permissions: {
        artistes: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
        contacts: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
        dates: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
        entreprises: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
        collaborateurs: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
        contrats: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
        factures: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
        devis: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
        projets: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
        taches: { creer: true, modifier: true, voir: true, supprimer: true, historique: true },
        parametrage: { modifier: true, voir: true },
        permissions: { modifier: true, voir: true }
      },
      collaborateurs: [],
      dateCreation: serverTimestamp(),
      derniereModification: serverTimestamp()
    });
    
    // Ajouter le créateur comme collaborateur admin
    // Générer les initiales à partir du nom et prénom si disponibles
    let initiales = 'AD';
    let nom = '';
    let prenom = '';
    let email = '';
    
    if (userData) {
      nom = userData.lastName || '';
      prenom = userData.firstName || '';
      email = userData.email || '';
      
      // Générer les initiales
      if (prenom && nom) {
        initiales = (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
      } else if (userData.displayName) {
        const parts = userData.displayName.split(' ');
        if (parts.length >= 2) {
          initiales = (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
        } else if (parts.length === 1) {
          initiales = parts[0].substring(0, 2).toUpperCase();
        }
      }
    }
    
    const collaborationConfigRef = doc(db, 'collaborationConfig', entrepriseId);
    await setDoc(collaborationConfigRef, {
      collaborateurs: [{
        id: userId,
        actif: true,
        nom: nom,
        prenom: prenom,
        email: email,
        initiales: initiales,
        identifiant: 'admin',
        groupes: ['admin'],
        entreprises: [],
        comptesMessagerie: [],
        artistes: [],
        partageEmails: {},
        partageCommentaires: {},
        partageNotes: {},
        statut: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }],
      entrepriseId: entrepriseId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Créer ou mettre à jour le document utilisateur dans la collection users
    const userDocRef = doc(db, 'users', userId);
    const userDocData = {
      uid: userId,
      email: email || '',
      displayName: userData?.displayName || `${prenom} ${nom}`.trim() || '',
      firstName: prenom,
      lastName: nom,
      entrepriseId: entrepriseId,
      role: 'admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Vérifier si le document existe déjà
    const userDocSnap = await firestoreGetDoc(userDocRef);
    if (!userDocSnap.exists()) {
      await firestoreSetDoc(userDocRef, userDocData);
    } else {
      // Mettre à jour avec les nouvelles données si nécessaire
      await firestoreUpdateDoc(userDocRef, {
        firstName: prenom || userDocSnap.data().firstName || '',
        lastName: nom || userDocSnap.data().lastName || '',
        displayName: userData?.displayName || userDocSnap.data().displayName || '',
        entrepriseId: entrepriseId,
        updatedAt: serverTimestamp()
      });
    }
    
    // Ajouter l'entreprise à l'index utilisateur
    const userEntRef = doc(db, 'user_entreprises', userId);
    await setDoc(userEntRef, {
      entreprises: {
        [entrepriseId]: {
          role: 'owner',
          joinedAt: serverTimestamp()
        }
      },
      defaultEntreprise: entrepriseId
    }, { merge: true });
    
    console.log('✅ Entreprise créée avec succès:', entrepriseId);
    console.log('✅ Groupe admin créé par défaut');
    return entrepriseId;
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'entreprise:', error);
    throw error;
  }
};

// Obtenir les entreprises d'un utilisateur
export const getUserEntreprises = async (userId) => {
  console.log('🔍 Récupération des entreprises pour l\'utilisateur:', userId);
  console.log('[DEBUG getUserEntreprises] Recherche dans user_entreprises/', userId);
  
  try {
    const userEntDoc = await getDoc(doc(db, 'user_entreprises', userId));
    console.log('[DEBUG getUserEntreprises] Document trouvé ?', userEntDoc.exists());
    
    if (!userEntDoc.exists()) {
      console.log('ℹ️ Aucune entreprise trouvée pour cet utilisateur');
      console.log('[DEBUG] Le document user_entreprises/', userId, 'n\'existe pas dans Firestore');
      return [];
    }
    
    const userData = userEntDoc.data();
    const entIds = Object.keys(userData.entreprises || {});
    
    // Récupérer les détails de chaque entreprise
    const entPromises = entIds.map(entId => 
      getDoc(doc(db, 'entreprises', entId))
    );
    
    const entDocs = await Promise.all(entPromises);
    const entreprises = entDocs
      .filter(doc => doc.exists())
      .map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        userRole: userData.entreprises[doc.id].role 
      }));
    
    console.log(`✅ ${entreprises.length} entreprise(s) trouvée(s)`);
    return { entreprises, defaultEntreprise: userData.defaultEntreprise };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des entreprises:', error);
    throw error;
  }
};

// Inviter un utilisateur dans une entreprise
export const inviteUserToEntreprise = async (entrepriseId, email, role = 'member') => {
  console.log('📧 Invitation d\'un utilisateur:', email, 'dans l\'entreprise:', entrepriseId);
  
  try {
    // Ici, nous créerions normalement une invitation
    // Pour l'instant, nous allons créer une entrée dans une collection d'invitations
    const invitationRef = doc(collection(db, 'entreprise_invitations'));
    
    await setDoc(invitationRef, {
      entrepriseId: entrepriseId,
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

// Mettre à jour les paramètres d'une entreprise
export const updateEntrepriseSettings = async (entrepriseId, settings) => {
  console.log('⚙️ Mise à jour des paramètres de l\'entreprise:', entrepriseId);
  
  try {
    const entRef = doc(db, 'entreprises', entrepriseId);
    await updateDoc(entRef, {
      settings: settings,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Paramètres mis à jour avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des paramètres:', error);
    throw error;
  }
};

// Générer un code d'invitation pour rejoindre une entreprise
export const generateInvitationCode = async (entrepriseId, role = 'member', expiresInDays = 7, maxUses = 10) => {
  console.log('🎫 Génération d\'un code d\'invitation pour l\'entreprise:', entrepriseId);
  
  try {
    // Générer un code unique de 8 caractères
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const invitationRef = doc(collection(db, 'entreprise_invitations'));
    
    const invitationData = {
      code: code,
      entrepriseId: entrepriseId,
      role: role,
      statut: 'active', // Utiliser 'statut' au lieu de 'status'
      maxUses: maxUses,
      usedBy: [],
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000))
    };
    
    await setDoc(invitationRef, invitationData);
    
    console.log('✅ Code d\'invitation généré:', code);
    
    // Retourner l'objet complet avec l'ID
    return {
      id: invitationRef.id,
      code: code,
      ...invitationData
    };
  } catch (error) {
    console.error('❌ Erreur lors de la génération du code d\'invitation:', error);
    throw error;
  }
};

// Rejoindre une entreprise avec un code d'invitation
export const joinEntreprise = async (invitationCode, userId) => {
  console.log('🔗 Tentative de rejoindre une entreprise avec le code:', invitationCode);
  
  try {
    // Rechercher l'invitation par code
    const invitationsQuery = query(
      collection(db, 'entreprise_invitations'),
      where('code', '==', invitationCode.toUpperCase()),
      where('statut', '==', 'active')
    );
    
    const invitationSnapshot = await getDocs(invitationsQuery);
    
    if (invitationSnapshot.empty) {
      throw new Error('Code d\'invitation invalide ou expiré');
    }
    
    const invitationDoc = invitationSnapshot.docs[0];
    const invitation = invitationDoc.data();
    
    // Vérifier si l'invitation n'est pas expirée
    if (invitation.expiresAt.toDate() < new Date()) {
      throw new Error('Ce code d\'invitation a expiré');
    }
    
    // Vérifier si l'utilisateur n'a pas déjà utilisé ce code
    if (invitation.usedBy && invitation.usedBy.includes(userId)) {
      throw new Error('Vous avez déjà utilisé ce code d\'invitation');
    }
    
    // Vérifier la limite d'utilisation
    if (invitation.usedBy && invitation.usedBy.length >= invitation.maxUses) {
      throw new Error('Ce code d\'invitation a atteint sa limite d\'utilisation');
    }
    
    const entId = invitation.entrepriseId;
    const role = invitation.role;
    
    // Vérifier que l'entreprise existe
    const entDoc = await getDoc(doc(db, 'entreprises', entId));
    if (!entDoc.exists()) {
      throw new Error('Entreprise introuvable');
    }
    
    // Vérifier que l'utilisateur n'est pas déjà membre de cette entreprise
    const userEntDoc = await getDoc(doc(db, 'user_entreprises', userId));
    if (userEntDoc.exists()) {
      const userData = userEntDoc.data();
      if (userData.entreprises && userData.entreprises[entId]) {
        throw new Error('Vous êtes déjà membre de cette entreprise');
      }
    }
    
    // Ajouter l'utilisateur à l'entreprise
    const entRef = doc(db, 'entreprises', entId);
    await updateDoc(entRef, {
      [`members.${userId}`]: {
        role: role,
        joinedAt: serverTimestamp(),
        permissions: role === 'admin' ? ['read', 'write', 'delete'] : ['read', 'write']
      },
      updatedAt: serverTimestamp()
    });
    
    // Ajouter l'entreprise à l'index utilisateur
    const userEntRef = doc(db, 'user_entreprises', userId);
    const userEntDocData = await getDoc(userEntRef);
    const currentUserData = userEntDocData.exists() ? userEntDocData.data() : {};
    
    // Si l'utilisateur n'a pas d'entreprise par défaut, définir celle-ci
    const updateData = {
      entreprises: {
        [entId]: {
          role: role,
          joinedAt: serverTimestamp()
        }
      }
    };
    
    if (!currentUserData.defaultEntreprise) {
      updateData.defaultEntreprise = entId;
    }
    
    await setDoc(userEntRef, updateData, { merge: true });
    
    // Toujours ajouter l'utilisateur à collaborationConfig lors de l'acceptation d'une invitation
    // Que ce soit une invitation de collaborateur ou une invitation générale
    {
      const configRef = doc(db, 'collaborationConfig', entId);
      const configDoc = await getDoc(configRef);
      const configData = configDoc.exists() ? configDoc.data() : { collaborateurs: [] };
      
      // Chercher le collaborateur en attente avec cette invitation
      const existingCollaborateurs = configData.collaborateurs || [];
      const collaborateurIndex = existingCollaborateurs.findIndex(
        c => c.invitationId === invitationDoc.id || c.invitationCode === invitation.code
      );
      
      if (collaborateurIndex >= 0) {
        // Mettre à jour le collaborateur existant
        existingCollaborateurs[collaborateurIndex] = {
          ...existingCollaborateurs[collaborateurIndex],
          id: userId,
          status: 'active',
          acceptedAt: new Date()
        };
      } else {
        // Créer un nouveau collaborateur
        // Récupérer les infos de l'utilisateur qui accepte l'invitation
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        // Récupérer aussi les infos depuis l'auth si disponibles
        const auth = getAuth();
        const currentAuthUser = auth.currentUser;
        
        const newCollaborateur = {
          id: userId,
          nom: invitation.nom || userData.displayName?.split(' ').slice(-1)[0] || currentAuthUser?.displayName?.split(' ').slice(-1)[0] || '',
          prenom: invitation.prenom || userData.displayName?.split(' ').slice(0, -1).join(' ') || currentAuthUser?.displayName?.split(' ').slice(0, -1).join(' ') || '',
          email: invitation.email || userData.email || currentAuthUser?.email || '',
          initiales: (invitation.isFromCollaborateur && invitation.collaborateurData?.initiales) || 
                     (userData.displayName || userData.email || currentAuthUser?.displayName || currentAuthUser?.email || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U',
          identifiant: (invitation.isFromCollaborateur && invitation.collaborateurData?.identifiant) || 
                       invitation.email || userData.email || currentAuthUser?.email || '',
          actif: invitation.isFromCollaborateur ? (invitation.collaborateurData?.actif !== false) : true,
          groupes: invitation.groupes && invitation.groupes.length > 0 ? invitation.groupes : ['utilisateur'],
          entreprises: invitation.entreprises || [],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          acceptedAt: new Date()
        };
        existingCollaborateurs.push(newCollaborateur);
      }
      
      await setDoc(configRef, {
        ...configData,
        collaborateurs: existingCollaborateurs,
        updatedAt: new Date()
      });
    }
    
    // Marquer l'invitation comme utilisée
    await updateDoc(invitationDoc.ref, {
      usedBy: arrayUnion(userId),
      lastUsedAt: serverTimestamp()
    });
    
    console.log('✅ Utilisateur ajouté à l\'entreprise avec succès');
    return {
      entrepriseId: entId,
      entrepriseName: entDoc.data().name,
      role: role
    };
  } catch (error) {
    console.error('❌ Erreur lors de la tentative de rejoindre l\'entreprise:', error);
    throw error;
  }
};

// Obtenir les membres d'une entreprise
export const getEntrepriseMembers = async (entrepriseId) => {
  console.log('👥 Récupération des membres de l\'entreprise:', entrepriseId);
  
  try {
    const entDoc = await getDoc(doc(db, 'entreprises', entrepriseId));
    
    if (!entDoc.exists()) {
      throw new Error('Entreprise introuvable');
    }
    
    const entData = entDoc.data();
    const members = entData.members || {};
    
    // Pour chaque membre, récupérer les informations utilisateur
    const memberIds = Object.keys(members);
    const memberPromises = memberIds.map(async (userId) => {
      try {
        // En mode local, retourner des données mock
        if (IS_LOCAL_MODE) {
          return {
            id: userId,
            email: `user-${userId}@example.com`,
            displayName: `User ${userId}`,
            role: members[userId].role,
            joinedAt: members[userId].joinedAt
          };
        }
        
        // En production, récupérer les vraies données utilisateur
        // Note: Firebase Auth ne permet pas de récupérer les infos utilisateur par UID
        // Il faudrait une collection 'users' séparée ou utiliser Firebase Admin SDK
        return {
          id: userId,
          email: 'Email non disponible',
          displayName: 'Nom non disponible',
          role: members[userId].role,
          joinedAt: members[userId].joinedAt
        };
      } catch (error) {
        console.warn('⚠️ Impossible de récupérer les infos pour l\'utilisateur:', userId);
        return {
          id: userId,
          email: 'Email non disponible',
          displayName: 'Nom non disponible',
          role: members[userId].role,
          joinedAt: members[userId].joinedAt
        };
      }
    });
    
    const membersData = await Promise.all(memberPromises);
    console.log(`✅ ${membersData.length} membre(s) trouvé(s)`);
    return membersData;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des membres:', error);
    throw error;
  }
};

// Quitter une entreprise
export const leaveEntreprise = async (entrepriseId, userId) => {
  console.log('🚪 Quitter l\'entreprise:', entrepriseId);
  
  try {
    // Vérifier que l'utilisateur est membre de l'entreprise
    const entDoc = await getDoc(doc(db, 'entreprises', entrepriseId));
    if (!entDoc.exists()) {
      throw new Error('Entreprise introuvable');
    }
    
    const entData = entDoc.data();
    if (!entData.members || !entData.members[userId]) {
      throw new Error('Vous n\'êtes pas membre de cette entreprise');
    }
    
    // Empêcher le propriétaire de quitter son entreprise
    if (entData.ownerId === userId) {
      throw new Error('Le propriétaire ne peut pas quitter son entreprise. Transférez d\'abord la propriété ou supprimez l\'entreprise.');
    }
    
    // Retirer l'utilisateur de l'entreprise
    const entRef = doc(db, 'entreprises', entrepriseId);
    await updateDoc(entRef, {
      [`members.${userId}`]: deleteField(),
      updatedAt: serverTimestamp()
    });
    
    // Retirer l'entreprise de l'index utilisateur
    const userEntRef = doc(db, 'user_entreprises', userId);
    await updateDoc(userEntRef, {
      [`entreprises.${entrepriseId}`]: deleteField()
    });
    
    console.log('✅ Entreprise quittée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la tentative de quitter l\'entreprise:', error);
    throw error;
  }
};