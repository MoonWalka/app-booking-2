/**
 * 🛡️ Service CSRF - Protection contre les attaques Cross-Site Request Forgery
 * 
 * Ce service génère et valide les tokens CSRF pour protéger l'application
 * contre les attaques CSRF.
 */

class CSRFService {
  constructor() {
    this.token = null;
    this.storage = 'sessionStorage'; // ou 'localStorage' selon les besoins
    this.headerName = 'X-CSRF-Token';
    this.cookieName = 'csrf_token';
    
    // Initialiser le token au démarrage
    this.initializeToken();
  }

  /**
   * 🔧 Initialise le token CSRF
   */
  initializeToken() {
    // Essayer de récupérer un token existant
    const existingToken = this.getStoredToken();
    
    if (existingToken && this.isValidToken(existingToken)) {
      this.token = existingToken;
      console.log('🔒 Token CSRF existant récupéré');
    } else {
      // Générer un nouveau token
      this.generateToken();
      console.log('🔒 Nouveau token CSRF généré');
    }
  }

  /**
   * 🎲 Génère un nouveau token CSRF sécurisé
   */
  generateToken() {
    // Utiliser crypto.randomUUID si disponible, sinon fallback
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      this.token = crypto.randomUUID();
    } else {
      // Fallback pour les navigateurs plus anciens
      this.token = this.generateFallbackToken();
    }
    
    // Stocker le token
    this.storeToken(this.token);
    
    // Mettre à jour le timestamp de génération
    this.setTokenTimestamp();
    
    return this.token;
  }

  /**
   * 🔄 Génère un token fallback pour les navigateurs plus anciens
   */
  generateFallbackToken() {
    const array = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      // Ultimate fallback si crypto n'est pas disponible
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    
    // Convertir en hexadécimal
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 📥 Récupère le token CSRF actuel
   */
  getToken() {
    if (!this.token || this.isTokenExpired()) {
      this.generateToken();
    }
    return this.token;
  }

  /**
   * ✅ Valide un token CSRF
   */
  validateToken(providedToken) {
    if (!providedToken || !this.token) {
      console.warn('🚫 Validation CSRF échouée - Token manquant');
      return false;
    }

    // Vérifier que le token correspond
    const isValid = providedToken === this.token;
    
    // Vérifier que le token n'est pas expiré
    const isNotExpired = !this.isTokenExpired();
    
    if (!isValid) {
      console.warn('🚫 Validation CSRF échouée - Token invalide');
    }
    
    if (!isNotExpired) {
      console.warn('🚫 Validation CSRF échouée - Token expiré');
    }
    
    return isValid && isNotExpired;
  }

  /**
   * 🔄 Renouvelle le token CSRF
   */
  refreshToken() {
    console.log('🔄 Renouvellement du token CSRF');
    return this.generateToken();
  }

  /**
   * 🗑️ Supprime le token CSRF
   */
  clearToken() {
    this.token = null;
    this.removeStoredToken();
    console.log('🗑️ Token CSRF supprimé');
  }

  /**
   * 💾 Stocke le token dans le storage
   */
  storeToken(token) {
    try {
      if (this.storage === 'sessionStorage' && typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(this.cookieName, token);
      } else if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        localStorage.setItem(this.cookieName, token);
      }
    } catch (error) {
      console.warn('⚠️ Impossible de stocker le token CSRF:', error);
    }
  }

  /**
   * 📤 Récupère le token stocké
   */
  getStoredToken() {
    try {
      if (this.storage === 'sessionStorage' && typeof sessionStorage !== 'undefined') {
        return sessionStorage.getItem(this.cookieName);
      } else if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        return localStorage.getItem(this.cookieName);
      }
    } catch (error) {
      console.warn('⚠️ Impossible de récupérer le token CSRF:', error);
    }
    return null;
  }

  /**
   * 🗑️ Supprime le token stocké
   */
  removeStoredToken() {
    try {
      if (this.storage === 'sessionStorage' && typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(this.cookieName);
        sessionStorage.removeItem(`${this.cookieName}_timestamp`);
      } else if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.cookieName);
        localStorage.removeItem(`${this.cookieName}_timestamp`);
      }
    } catch (error) {
      console.warn('⚠️ Impossible de supprimer le token CSRF:', error);
    }
  }

  /**
   * ⏰ Définit le timestamp de génération du token
   */
  setTokenTimestamp() {
    const timestamp = Date.now().toString();
    try {
      if (this.storage === 'sessionStorage' && typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(`${this.cookieName}_timestamp`, timestamp);
      } else if (this.storage === 'localStorage' && typeof localStorage !== 'undefined') {
        localStorage.setItem(`${this.cookieName}_timestamp`, timestamp);
      }
    } catch (error) {
      console.warn('⚠️ Impossible de stocker le timestamp CSRF:', error);
    }
  }

  /**
   * ⏰ Vérifie si le token est expiré
   */
  isTokenExpired() {
    try {
      const timestampStr = this.storage === 'sessionStorage' && typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem(`${this.cookieName}_timestamp`)
        : typeof localStorage !== 'undefined'
        ? localStorage.getItem(`${this.cookieName}_timestamp`)
        : null;
      
      if (!timestampStr) return true;
      
      const timestamp = parseInt(timestampStr, 10);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
      
      return (now - timestamp) > maxAge;
    } catch (error) {
      console.warn('⚠️ Erreur lors de la vérification d\'expiration:', error);
      return true; // En cas d'erreur, considérer comme expiré
    }
  }

  /**
   * ✅ Vérifie si un token est valide (format)
   */
  isValidToken(token) {
    return token && 
           typeof token === 'string' && 
           token.length >= 32 && // Minimum 32 caractères
           /^[a-f0-9-]+$/i.test(token); // Seulement hexa et tirets
  }

  /**
   * 📊 Retourne des informations sur le token actuel
   */
  getTokenInfo() {
    return {
      hasToken: !!this.token,
      tokenLength: this.token ? this.token.length : 0,
      isExpired: this.isTokenExpired(),
      headerName: this.headerName,
      storage: this.storage
    };
  }

  /**
   * 🔧 Configure le service CSRF
   */
  configure(options = {}) {
    if (options.storage) {
      this.storage = options.storage;
    }
    if (options.headerName) {
      this.headerName = options.headerName;
    }
    if (options.cookieName) {
      this.cookieName = options.cookieName;
    }
    
    console.log('🔧 Service CSRF configuré:', {
      storage: this.storage,
      headerName: this.headerName,
      cookieName: this.cookieName
    });
  }
}

// Instance singleton du service CSRF
const csrfService = new CSRFService();

// 🛡️ Middleware pour Axios - Auto-injection du token CSRF
export const setupCSRFMiddleware = (axiosInstance) => {
  // Intercepteur de requête pour ajouter le token CSRF
  axiosInstance.interceptors.request.use(
    (config) => {
      // Ajouter le token CSRF pour les requêtes qui modifient des données
      const methodsRequiringCSRF = ['post', 'put', 'patch', 'delete'];
      
      if (methodsRequiringCSRF.includes(config.method?.toLowerCase())) {
        const token = csrfService.getToken();
        if (token) {
          config.headers[csrfService.headerName] = token;
          console.log('🔒 Token CSRF ajouté à la requête:', config.method?.toUpperCase(), config.url);
        }
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Intercepteur de réponse pour gérer les erreurs CSRF
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Si erreur 403 liée au CSRF, renouveler le token
      if (error.response?.status === 403 && 
          error.response?.data?.message?.includes('CSRF')) {
        console.warn('🔄 Erreur CSRF détectée, renouvellement du token');
        csrfService.refreshToken();
      }
      
      return Promise.reject(error);
    }
  );

  console.log('🛡️ Middleware CSRF configuré pour Axios');
};

export default csrfService; 