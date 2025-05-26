import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut, IS_LOCAL_MODE } from '@/services/firebase-service';
import useGenericCachedData from '@/hooks/generics/data/useGenericCachedData';

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

// Provider du contexte d'authentification simplifié
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // 🔧 FIX: Utiliser useRef pour éviter les re-créations
  const unsubscribeRef = useRef(null);

  // 🔧 FIX: Utilisation du cache générique avec configuration stable
  const cacheHook = useGenericCachedData('auth', {
    cacheKey: 'currentUser',
    strategy: 'ttl',
    ttl: 5 * 60 * 1000, // 5 minutes
    levels: ['memory', 'session'] // Cache en mémoire et session
  }, {
    enableStats: true,
    enableAutoCleanup: true
  });

  // 🔧 FIX: Utiliser des refs pour stabiliser l'accès aux fonctions du cache
  const cacheRef = useRef(cacheHook);
  cacheRef.current = cacheHook;

  // 🔧 FIX: Fonction d'initialisation mémorisée SANS dépendances instables
  const initializeAuth = useCallback(() => {
    if (initialized) return;
    
    // Vérifier d'abord le cache
    const cachedUser = cacheRef.current.getCacheData('currentUser');
    if (cachedUser && cachedUser !== 'null') {
      setCurrentUser(cachedUser);
      setLoading(false);
      setInitialized(true);
      
      // Vérifier en arrière-plan si l'état a changé (sans boucle)
      setTimeout(() => {
        if (!unsubscribeRef.current) {
          setupAuthListener();
        }
      }, 100);
      return;
    }

    // Pas de cache, configurer l'écoute immédiatement
    setupAuthListener();

    function setupAuthListener() {
      // Mode développement avec bypass d'authentification
      if (IS_LOCAL_MODE || process.env.REACT_APP_BYPASS_AUTH === 'true') {
        const devUser = { uid: 'dev-user', email: 'dev@example.com' };
        setCurrentUser(devUser);
        cacheRef.current.setCacheData('currentUser', devUser);
        setLoading(false);
        setInitialized(true);
        return;
      }

      // 🔧 FIX: Une seule souscription, nettoyage approprié
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      unsubscribeRef.current = onAuthStateChanged(auth, (user) => {
        if (user) {
          // Créer un objet utilisateur simplifié pour le cache
          const userCache = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          };
          setCurrentUser(userCache);
          cacheRef.current.setCacheData('currentUser', userCache);
        } else {
          setCurrentUser(null);
          cacheRef.current.setCacheData('currentUser', null);
        }
        
        setLoading(false);
        setInitialized(true);
      });
    }
  }, [initialized]); // 🔧 FIX: Seulement 'initialized' comme dépendance

  // 🔧 FIX: useEffect simplifié avec dépendances stables
  useEffect(() => {
    initializeAuth();
    
    // Nettoyage lors du démontage
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [initializeAuth]);

  // Fonctions de connexion/déconnexion simplifiées
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // Le cache sera mis à jour automatiquement par onAuthStateChanged
      return true;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await signOut(auth);
      // Nettoyer le cache d'authentification
      cacheRef.current.clearCache();
      return true;
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []); // 🔧 FIX: Pas de dépendances

  // 🔧 FIX: Fonction clearAuthCache pour compatibilité
  const clearAuthCache = useCallback(() => {
    cacheRef.current.clearCache();
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    logout,
    clearAuthCache
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
