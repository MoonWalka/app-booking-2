import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut, IS_LOCAL_MODE, CURRENT_MODE } from '@/services/firebase-service';

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

// Provider du contexte d'authentification
export const AuthProvider = ({ children }) => {
  console.log('[TRACE-UNIQUE][AuthProvider] Provider exécuté ! Mode:', CURRENT_MODE, 'Local:', IS_LOCAL_MODE);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastAuthState = useRef(null); // Pour suivre le dernier état d'authentification
  const authCheckCount = useRef(0); // Pour limiter les vérifications d'authentification fréquentes

  useEffect(() => {
    // Pour éviter les vérifications d'authentification trop fréquentes
    const now = Date.now();
    const lastCheck = parseInt(sessionStorage.getItem('lastAuthCheck') || '0', 10);
    
    // Si une vérification a été effectuée dans les 5 dernières secondes, utiliser le dernier état connu
    if (now - lastCheck < 5000 && sessionStorage.getItem('cachedAuthState')) {
      try {
        const cachedUser = JSON.parse(sessionStorage.getItem('cachedAuthState'));
        setCurrentUser(cachedUser);
        setLoading(false);
        console.log('Utilisation de l\'état d\'authentification mis en cache');
        return;
      } catch (e) {
        console.error('Erreur lors de la lecture de l\'état d\'authentification mis en cache:', e);
        // Continuer avec la vérification normale si le cache échoue
      }
    }
    
    // Mode développement avec bypass d'authentification
    if (IS_LOCAL_MODE || process.env.REACT_APP_BYPASS_AUTH === 'true') {
      console.log('Mode développement local ou bypass d\'authentification activé');
      const devUser = { uid: 'dev-user', email: 'dev@example.com' };
      setCurrentUser(devUser);
      setLoading(false);
      // Mettre en cache l'état d'authentification
      sessionStorage.setItem('cachedAuthState', JSON.stringify(devUser));
      sessionStorage.setItem('lastAuthCheck', now.toString());
      return;
    }

    // Limiter le nombre de souscriptions aux changements d'authentification
    if (authCheckCount.current > 5) {
      console.warn('Trop de vérifications d\'authentification successives. Utilisation du dernier état connu.');
      setLoading(false);
      return;
    }

    authCheckCount.current += 1;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Vérifier si l'état d'authentification a changé
      const currentAuthState = user ? user.uid : null;
      const hasChanged = currentAuthState !== lastAuthState.current;
      
      if (hasChanged) {
        console.log('État d\'authentification modifié');
        lastAuthState.current = currentAuthState;
        setCurrentUser(user);
        
        // Mettre en cache l'état d'authentification
        if (user) {
          // Ne pas mettre l'objet user complet en cache, juste les informations essentielles
          const userCache = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          };
          sessionStorage.setItem('cachedAuthState', JSON.stringify(userCache));
        } else {
          sessionStorage.setItem('cachedAuthState', 'null');
        }
      }
      
      setLoading(false);
      sessionStorage.setItem('lastAuthCheck', now.toString());
      
      // Réinitialiser le compteur après une vérification réussie
      setTimeout(() => {
        authCheckCount.current = 0;
      }, 5000);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Fonction de connexion stabilisée
  const login = async (email, password) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Erreur de connexion:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion stabilisée
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      // Nettoyer le cache d'authentification
      sessionStorage.removeItem('cachedAuthState');
      sessionStorage.removeItem('lastAuthCheck');
      return true;
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
