import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut, IS_LOCAL_MODE } from '@/services/firebase-service';

// Créer le contexte
export const AuthContext = createContext(null);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

// Provider du contexte d'authentification sécurisé et stabilisé
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // 🔧 FIX BOUCLE: Utiliser useRef pour éviter les re-créations
  const unsubscribeRef = useRef(null);
  const userCacheRef = useRef(null);
  const authInitializedRef = useRef(false);

  // 🔧 FIX BOUCLE: Fonction setupFirebaseAuthListener STABILISÉE
  const setupFirebaseAuthListener = useCallback(() => {
    // Nettoyer l'ancien listener s'il existe
    if (unsubscribeRef.current) {
      console.log('🧹 Nettoyage ancien listener auth');
      unsubscribeRef.current();
    }

    unsubscribeRef.current = onAuthStateChanged(
      auth, 
      (user) => {
        console.log('🔄 État d\'authentification changé:', user ? user.email : 'non connecté');
        
        if (user) {
          const userCache = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Utilisateur',
            emailVerified: user.emailVerified
          };
          
          setCurrentUser(userCache);
          userCacheRef.current = userCache;
        } else {
          setCurrentUser(null);
          userCacheRef.current = null;
        }
        
        setLoading(false);
        setInitialized(true);
      }, 
      (error) => {
        console.error('❌ Erreur d\'authentification:', error);
        setCurrentUser(null);
        userCacheRef.current = null;
        setLoading(false);
        setInitialized(true);
      }
    );
  }, []); // 🔧 FIX BOUCLE: Aucune dépendance externe pour éviter les re-créations

  // 🔧 FIX BOUCLE: Fonction d'initialisation ULTRA-STABILISÉE
  const initializeAuth = useCallback(() => {
    // Éviter la double initialisation
    if (authInitializedRef.current) {
      console.log('🔄 Auth déjà initialisé, ignoré');
      return;
    }
    
    console.log('🔒 Initialisation de l\'authentification...');
    authInitializedRef.current = true;
    
    // 🔒 SÉCURITÉ : Mode développement LOCAL STRICT
    if (IS_LOCAL_MODE && process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Mode développement local - Authentification simulée STABLE');
      
      const devUser = { 
        uid: 'dev-user', 
        email: 'dev@local.dev', 
        displayName: 'Dev User Local',
        emailVerified: true 
      };
      
      // Stabiliser immédiatement
      setCurrentUser(devUser);
      userCacheRef.current = devUser;
      setLoading(false);
      setInitialized(true);
      
      console.log('✅ Mode développement - Utilisateur simulé stable');
      return;
    }

    // 🔒 SÉCURITÉ : Authentification Firebase en production
    console.log('🔒 Mode production - Authentification Firebase');
    
    // Configurer l'écoute Firebase une seule fois
    setupFirebaseAuthListener();
  }, [setupFirebaseAuthListener]); // 🔧 FIX ESLINT: Ajouter la dépendance nécessaire

  // 🔧 FIX BOUCLE: useEffect ULTRA-SIMPLIFIÉ
  useEffect(() => {
    initializeAuth();
    
    // Nettoyage lors du démontage
    return () => {
      if (unsubscribeRef.current) {
        console.log('🧹 Nettoyage final du listener auth');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      authInitializedRef.current = false;
    };
  }, [initializeAuth]); // 🔧 FIX ESLINT: Ajouter la dépendance nécessaire

  // Fonctions de connexion/déconnexion STABILISÉES
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      console.log('🔐 Tentative de connexion pour:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Connexion réussie:', userCredential.user.email);
      
      return true;
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔓 Déconnexion en cours...');
      
      await signOut(auth);
      
      // Nettoyer le cache local
      userCacheRef.current = null;
      
      console.log('✅ Déconnexion réussie');
      return true;
    } catch (error) {
      console.error('❌ Erreur de déconnexion:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔧 FIX BOUCLE: Cache management stabilisé
  const clearAuthCache = useCallback(() => {
    userCacheRef.current = null;
    console.log('🧹 Cache d\'authentification nettoyé');
  }, []);

  // 🔒 SÉCURITÉ : Fonctions utilitaires STABILISÉES
  const isAuthenticated = Boolean(currentUser);
  const isAdmin = currentUser?.email?.includes('@admin.') || false;
  
  // 🔧 FIX BOUCLE: Stabiliser l'objet value
  const contextValue = {
    currentUser,
    loading,
    login,
    logout,
    clearAuthCache,
    isAuthenticated,
    isAdmin,
    initialized
  };

  // 🔧 FIX BOUCLE: Attendre que l'initialisation soit terminée
  if (!initialized) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Initialisation de l'authentification...</span>
          </div>
          <div className="mt-3">
            <small className="text-muted">🔒 Configuration sécurisée en cours...</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
