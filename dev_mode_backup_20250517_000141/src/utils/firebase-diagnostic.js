/**
 * Utilitaire de diagnostic pour détecter les problèmes de configuration Firebase
 * qui peuvent causer des erreurs CORS
 */

/**
 * Vérifie que les variables d'environnement Firebase essentielles sont définies
 */
export function checkFirebaseConfig() {
  const requiredVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => 
    !process.env[varName] || process.env[varName].trim() === ''
  );
  
  if (missingVars.length > 0) {
    console.error('%c⚠️ ERREUR Firebase: Variables d\'environnement manquantes', 
      'background: #FFF3CD; color: #856404; font-size: 16px; padding: 10px;');
    console.error(missingVars.join(', '));
    return false;
  }
  
  return true;
}

/**
 * Vérifie si l'erreur est liée à un problème CORS avec Firebase
 */
export function isCORSError(error) {
  if (!error) return false;
  
  // Vérifier les erreurs de type CORS
  const errorString = error.toString().toLowerCase();
  return (
    errorString.includes('cors') || 
    errorString.includes('cross-origin') || 
    errorString.includes('access control') ||
    errorString.includes('network error') ||
    errorString.includes('failed to fetch')
  );
}

/**
 * Génère un rapport de diagnostic pour les erreurs Firebase
 */
export function generateFirebaseErrorReport() {
  return {
    environment: process.env.NODE_ENV,
    corsProtection: {
      longPollingEnabled: true,
      fetchStreamsDisabled: true,
      timeoutExtended: true
    },
    configPresent: {
      apiKey: !!process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: !!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: !!process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: !!process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: !!process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: !!process.env.REACT_APP_FIREBASE_APP_ID
    },
    possibleSolutions: [
      'Vérifier que les variables d\'environnement sont définies dans .env',
      'S\'assurer que l\'origine de l\'app est autorisée dans la console Firebase',
      'Vérifier que le navigateur n\'a pas de restrictions CORS supplémentaires',
      'Essayer en mode navigation privée pour éliminer les problèmes d\'extensions'
    ]
  };
}

/**
 * Vérifie si les règles Firestore peuvent poser problème
 * @param {Object} error - L'erreur Firebase capturée
 * @returns {Object} - Analyse de l'erreur
 */
export function analyzeFirebaseError(error) {
  const analysis = {
    isCorsError: false,
    isAuthError: false,
    isRulesError: false,
    isQuotaError: false,
    message: ''
  };
  
  if (!error) return analysis;
  
  // Détection des erreurs CORS
  if (
    error.message?.includes('XMLHttpRequest') || 
    error.message?.includes('CORS') ||
    error.message?.includes('access control checks')
  ) {
    analysis.isCorsError = true;
    analysis.message = 'Erreur CORS: Problème d\'accès à Firebase';
  }
  
  // Détection des erreurs d'authentification
  else if (
    error.code === 'auth/unauthorized' || 
    error.code === 'permission-denied' ||
    error.message?.includes('permission')
  ) {
    analysis.isAuthError = true;
    analysis.message = 'Erreur d\'authentification: Accès refusé';
  }
  
  // Détection des erreurs de règles Firestore
  else if (
    error.code === 'permission-denied' || 
    error.message?.includes('rules')
  ) {
    analysis.isRulesError = true;
    analysis.message = 'Erreur de règles Firestore: Vérifiez vos règles de sécurité';
  }
  
  // Détection des erreurs de quota
  else if (
    error.code === 'resource-exhausted' ||
    error.message?.includes('quota')
  ) {
    analysis.isQuotaError = true;
    analysis.message = 'Erreur de quota: Limite d\'utilisation Firebase atteinte';
  }
  
  return analysis;
}

/**
 * Teste la connexion Firebase et retourne un diagnostic
 * @returns {Promise<Object>} - Résultat du test
 */
export async function testFirebaseConnection() {
  // Cette fonction pourrait être appelée depuis une interface de diagnostic
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({
        success: false,
        error: 'Timeout - La connexion Firebase prend trop de temps'
      });
    }, 10000); // 10 secondes de timeout
    
    // Charger l'état de connexion si disponible
    const connectionStatus = localStorage.getItem('firebaseConnectionStatus');
    if (connectionStatus) {
      try {
        const status = JSON.parse(connectionStatus);
        // Si le test a été fait récemment (moins de 5 minutes)
        if (status.timestamp && (Date.now() - status.timestamp < 5 * 60 * 1000)) {
          clearTimeout(timeout);
          return resolve(status);
        }
      } catch (e) {
        // Ignorer les erreurs de parsing
      }
    }
    
    // Ici, on pourrait implémenter un test plus avancé
    // Pour l'instant, on se base sur notre vérification de config
    const configValid = checkFirebaseConfig();
    
    const result = {
      success: configValid,
      timestamp: Date.now(),
      error: configValid ? null : 'Configuration Firebase invalide'
    };
    
    // Sauvegarder le résultat pour éviter de refaire le test trop souvent
    localStorage.setItem('firebaseConnectionStatus', JSON.stringify(result));
    
    clearTimeout(timeout);
    resolve(result);
  });
}