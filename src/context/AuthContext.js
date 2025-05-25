import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut, IS_LOCAL_MODE, CURRENT_MODE } from '@/services/firebase-service';
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
  console.log('[TRACE-UNIQUE][AuthProvider] Provider exécuté ! Mode:', CURRENT_MODE, 'Local:', IS_LOCAL_MODE);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🚀 NOUVEAU : Utilisation du cache générique pour l'état d'authentification
  const { 
    setCacheData, 
    getCacheData, 
    invalidate: clearAuthCache 
  } = useGenericCachedData('auth', {
    cacheKey: 'currentUser',
    strategy: 'ttl',
    ttl: 5 * 60 * 1000, // 5 minutes
    levels: ['memory', 'session'], // Cache en mémoire et session
    onCacheHit: () => console.log('✅ État d\'authentification récupéré du cache'),
    onCacheMiss: () => console.log('❌ Cache d\'authentification manqué')
  }, {
    enableStats: true,
    enableAutoCleanup: true
  });

  useEffect(() => {
    // 🎯 SIMPLIFICATION : Vérifier d'abord le cache
    const cachedUser = getCacheData('currentUser');
    if (cachedUser && cachedUser !== 'null') {
      setCurrentUser(cachedUser);
      setLoading(false);
      console.log('✅ Utilisation de l\'état d\'authentification mis en cache');
      
      // Vérifier en arrière-plan si l'état a changé
      setTimeout(() => {
        checkAuthState();
      }, 100);
      return;
    }

    // Vérification immédiate si pas de cache
    checkAuthState();

    function checkAuthState() {
      // Mode développement avec bypass d'authentification
      if (IS_LOCAL_MODE || process.env.REACT_APP_BYPASS_AUTH === 'true') {
        console.log('🔧 Mode développement local ou bypass d\'authentification activé');
        const devUser = { uid: 'dev-user', email: 'dev@example.com' };
        setCurrentUser(devUser);
        setCacheData('currentUser', devUser);
        setLoading(false);
        return;
      }

      // 🎯 SIMPLIFICATION : Une seule souscription, sans compteurs ni timeouts
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('🔄 État d\'authentification modifié');
        
        if (user) {
          // Créer un objet utilisateur simplifié pour le cache
          const userCache = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          };
          setCurrentUser(userCache);
          setCacheData('currentUser', userCache);
        } else {
          setCurrentUser(null);
          setCacheData('currentUser', null);
        }
        
        setLoading(false);
      });

      return unsubscribe;
    }
  }, [getCacheData, setCacheData]);

  // 🎯 SIMPLIFICATION : Fonctions de connexion/déconnexion simplifiées
  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Le cache sera mis à jour automatiquement par onAuthStateChanged
      return true;
    } catch (error) {
      console.error("❌ Erreur de connexion:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      // Nettoyer le cache d'authentification
      clearAuthCache();
      return true;
    } catch (error) {
      console.error("❌ Erreur de déconnexion:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    // 🚀 NOUVEAU : Exposer la fonction de nettoyage du cache
    clearAuthCache
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
