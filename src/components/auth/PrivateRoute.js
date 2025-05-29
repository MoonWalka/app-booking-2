import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Alert from '@/components/ui/Alert';

/**
 * 🔒 Composant PrivateRoute - Protection des Routes Sensibles STABILISÉ
 * 
 * Ce composant protège les routes qui nécessitent une authentification.
 * Les utilisateurs non authentifiés sont redirigés vers la page de connexion.
 * 
 * 🔧 FIX BOUCLE: Stabilisé pour éviter les redirections infinies
 */
const PrivateRoute = ({ children, adminOnly = false, fallback = null }) => {
  const { currentUser, loading, isAuthenticated, isAdmin, initialized } = useAuth();
  const location = useLocation();

  // 🔧 FIX BOUCLE: Attendre que l'authentification soit COMPLÈTEMENT initialisée
  if (!initialized || loading) {
    console.log('🔄 PrivateRoute - En attente d\'initialisation auth:', { initialized, loading });
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Vérification sécurisée en cours...</span>
          </div>
          <div className="mt-3">
            <small className="text-muted">🔒 Validation des permissions sécurisées...</small>
          </div>
        </div>
      </div>
    );
  }

  // 🔧 FIX BOUCLE: Vérification STABLE de l'authentification
  const isUserAuthenticated = isAuthenticated && currentUser && currentUser.uid;
  
  console.log('🔍 PrivateRoute - État auth:', {
    path: location.pathname,
    isAuthenticated,
    hasCurrentUser: !!currentUser,
    userUid: currentUser?.uid,
    isUserAuthenticated,
    initialized
  });

  // 🔧 FIX BOUCLE: Éviter redirection si déjà sur /login
  if (!isUserAuthenticated) {
    // Si on est déjà sur la page de login, ne pas rediriger
    if (location.pathname === '/login') {
      console.log('🔄 Déjà sur /login, pas de redirection');
      return children;
    }
    
    console.warn('🚫 Accès refusé - Utilisateur non authentifié. Redirection vers /login depuis:', location.pathname);
    
    // Rediriger vers la page de connexion avec l'URL de retour
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location.pathname,
          message: 'Veuillez vous connecter pour accéder à cette page'
        }} 
        replace 
      />
    );
  }

  // 🔧 FIX BOUCLE: Vérification admin STABLE
  if (adminOnly && !isAdmin) {
    console.warn('🚫 Accès refusé - Privilèges administrateur requis pour:', location.pathname, 'User:', currentUser.email);
    
    // Afficher un message d'erreur ou un fallback personnalisé
    if (fallback) {
      return fallback;
    }
    
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <Alert variant="danger">
              <h5>🚫 Accès Refusé</h5>
              <p>
                Vous n'avez pas les privilèges administrateur nécessaires pour accéder à cette page.
              </p>
              <p>
                <strong>Utilisateur actuel :</strong> {currentUser.email}
              </p>
              <hr />
              <small className="text-muted">
                Si vous pensez qu'il s'agit d'une erreur, contactez votre administrateur système.
              </small>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Utilisateur authentifié avec les bonnes permissions
  console.log('✅ PrivateRoute - Accès autorisé pour:', currentUser.email, 'vers:', location.pathname);
  
  return children;
};

// 🔒 Composant spécialisé pour les routes admin STABILISÉ
export const AdminRoute = ({ children, fallback = null }) => {
  return (
    <PrivateRoute adminOnly={true} fallback={fallback}>
      {children}
    </PrivateRoute>
  );
};

// 🔒 Hook utilitaire pour vérifier les permissions STABILISÉ
export const useRouteProtection = () => {
  const { isAuthenticated, isAdmin, currentUser, initialized } = useAuth();
  
  return {
    isAuthenticated,
    isAdmin,
    currentUser,
    initialized,
    canAccess: (adminRequired = false) => {
      if (!initialized) return false;
      if (!isAuthenticated) return false;
      if (adminRequired && !isAdmin) return false;
      return true;
    },
    requireAuth: () => {
      if (!initialized) {
        throw new Error('Authentication not initialized');
      }
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }
    },
    requireAdmin: () => {
      if (!initialized) {
        throw new Error('Authentication not initialized');
      }
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }
      if (!isAdmin) {
        throw new Error('Admin privileges required');
      }
    }
  };
};

export default PrivateRoute; 