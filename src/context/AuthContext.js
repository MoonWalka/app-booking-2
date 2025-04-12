// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Création du contexte d'authentification
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Configuration pour le mode bypass d'authentification
// En développement, on force BYPASS_AUTH à true pour éviter les problèmes d'authentification
const BYPASS_AUTH = process.env.NODE_ENV === 'development' ? true : 
                   (process.env.REACT_APP_BYPASS_AUTH === 'false' ? false : true);

// Utilisateur de test pour le mode bypass
const TEST_USER = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Utilisateur Test',
  role: 'admin'
};

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
  // État pour stocker l'utilisateur actuel
  const [currentUser, setCurrentUser] = useState(BYPASS_AUTH ? TEST_USER : null);
  const [loading, setLoading] = useState(!BYPASS_AUTH);

  useEffect(() => {
    console.log('AuthContext - Mode bypass:', BYPASS_AUTH);
    
    // Si le mode bypass est activé, on utilise l'utilisateur de test
    if (BYPASS_AUTH) {
      console.log('AuthContext - Utilisation de l\'utilisateur de test:', TEST_USER);
      setCurrentUser(TEST_USER);
      setLoading(false);
      return;
    }

    // Sinon, on écoute les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Utilisateur connecté
        console.log('AuthContext - Utilisateur connecté:', user.email);
        setCurrentUser({
          id: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          role: 'admin' // Par défaut, tous les utilisateurs sont admin pour l'instant
        });
      } else {
        // Utilisateur déconnecté
        console.log('AuthContext - Utilisateur déconnecté');
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Nettoyage de l'effet
    return () => unsubscribe();
  }, []);

  // Valeur du contexte
  const value = {
    currentUser,
    loading,
    bypassEnabled: BYPASS_AUTH
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
