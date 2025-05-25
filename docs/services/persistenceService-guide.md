# 📚 Guide Utilisateur - Service de Persistance Centralisé

## 🎯 **Vue d'Ensemble**

Le service de persistance centralisé de TourCraft unifie tous les patterns de cache et stockage de l'application. Il remplace tous les usages directs de `sessionStorage`, `localStorage` et fournit une API cohérente avec 6 stratégies de cache différentes.

## 🚀 **Installation et Import**

```javascript
// Import du service principal
import persistenceService, { 
  CACHE_STRATEGIES, 
  TTL_PRESETS, 
  usePersistence 
} from '@/services/persistenceService';

// Import du hook React
import { usePersistence } from '@/services/persistenceService';
```

## 🎯 **Stratégies de Cache Disponibles**

### **1. MEMORY_ONLY** - Cache mémoire uniquement
```javascript
// Stockage en mémoire uniquement (perdu au rechargement)
persistenceService.set('user_preferences', userData, CACHE_STRATEGIES.MEMORY_ONLY);
```
**Usage** : Données temporaires, calculs intermédiaires

### **2. SESSION_ONLY** - SessionStorage direct
```javascript
// Stockage en session uniquement (survit aux rechargements)
persistenceService.set('form_draft', formData, CACHE_STRATEGIES.SESSION_ONLY);
```
**Usage** : Données de session, formulaires temporaires

### **3. LOCAL_ONLY** - LocalStorage direct
```javascript
// Stockage local uniquement (persistance long terme)
persistenceService.set('user_settings', settings, CACHE_STRATEGIES.LOCAL_ONLY);
```
**Usage** : Préférences utilisateur, configuration

### **4. MEMORY_SESSION** - Cache multi-niveaux (défaut)
```javascript
// Cache mémoire + session (performance optimale)
persistenceService.set('api_cache', apiData, CACHE_STRATEGIES.MEMORY_SESSION);
```
**Usage** : Données fréquemment accédées, cache API

### **5. MEMORY_LOCAL** - Mémoire + Local
```javascript
// Cache mémoire + local (persistance + performance)
persistenceService.set('user_profile', profile, CACHE_STRATEGIES.MEMORY_LOCAL);
```
**Usage** : Profil utilisateur, données importantes

### **6. TTL** - Cache avec expiration automatique
```javascript
// Cache intelligent avec TTL et fallback
persistenceService.set('auth_token', token, CACHE_STRATEGIES.TTL, TTL_PRESETS.SHORT);
```
**Usage** : Tokens, données avec expiration

## ⏰ **TTL Prédéfinis**

```javascript
TTL_PRESETS = {
  SHORT: 5 * 60 * 1000,        // 5 minutes - Auth, navigation
  MEDIUM: 30 * 60 * 1000,      // 30 minutes - Données temporaires
  LONG: 2 * 60 * 60 * 1000,    // 2 heures - Données utilisateur
  DAY: 24 * 60 * 60 * 1000,    // 24 heures - Wizards, préférences
  WEEK: 7 * 24 * 60 * 60 * 1000 // 7 jours - Configuration
}
```

## 🎣 **Hook React - usePersistence**

### **Usage de Base**
```javascript
function MyComponent() {
  const { get, set, remove, getStats, cleanup } = usePersistence('myNamespace');
  
  // Stocker des données
  const saveUserData = (userData) => {
    set('profile', userData, CACHE_STRATEGIES.MEMORY_LOCAL, TTL_PRESETS.DAY);
  };
  
  // Récupérer des données
  const loadUserData = () => {
    return get('profile', CACHE_STRATEGIES.MEMORY_LOCAL);
  };
  
  // Supprimer des données
  const clearUserData = () => {
    remove('profile', CACHE_STRATEGIES.MEMORY_LOCAL);
  };
  
  return (
    <div>
      <button onClick={() => saveUserData({ name: 'John' })}>
        Sauvegarder
      </button>
      <button onClick={() => console.log(loadUserData())}>
        Charger
      </button>
    </div>
  );
}
```

### **Namespacing**
```javascript
// Isolation par namespace
const authPersistence = usePersistence('auth');
const userPersistence = usePersistence('user');
const formPersistence = usePersistence('forms');

// Pas de collision entre les namespaces
authPersistence.set('token', 'auth_token_123');
userPersistence.set('token', 'user_token_456'); // Différent !
```

## 📊 **Monitoring et Statistiques**

### **Statistiques en Temps Réel**
```javascript
const stats = persistenceService.getStats();
console.log({
  hits: stats.hits,           // Nombre de hits
  misses: stats.misses,       // Nombre de misses
  hitRate: stats.hitRate,     // Taux de réussite (0-1)
  sets: stats.sets,           // Nombre de stockages
  removes: stats.removes,     // Nombre de suppressions
  memorySize: stats.memorySize // Taille du cache mémoire
});
```

### **Dashboard de Monitoring**
```javascript
// En mode développement uniquement
import CacheMonitorDashboard from '@/components/debug/CacheMonitorDashboard';

function App() {
  return (
    <div>
      {/* Votre application */}
      {process.env.NODE_ENV === 'development' && <CacheMonitorDashboard />}
    </div>
  );
}
```

## 🧹 **Nettoyage et Maintenance**

### **Nettoyage Automatique**
```javascript
// Auto-nettoyage toutes les 30 minutes (automatique)
// Supprime les entrées expirées du cache mémoire
```

### **Nettoyage Manuel**
```javascript
// Nettoyer manuellement
const cleaned = persistenceService.cleanup();
console.log(`${cleaned} entrées supprimées`);

// Reset des statistiques
persistenceService.resetStats();
```

## 🔧 **Exemples d'Usage Courants**

### **1. Cache d'API**
```javascript
const apiCache = usePersistence('api');

async function fetchUserData(userId) {
  // Vérifier le cache d'abord
  const cached = apiCache.get(`user_${userId}`, CACHE_STRATEGIES.MEMORY_SESSION);
  if (cached) {
    return cached;
  }
  
  // Fetch depuis l'API
  const userData = await fetch(`/api/users/${userId}`).then(r => r.json());
  
  // Mettre en cache pour 30 minutes
  apiCache.set(`user_${userId}`, userData, CACHE_STRATEGIES.MEMORY_SESSION, TTL_PRESETS.MEDIUM);
  
  return userData;
}
```

### **2. Persistance de Formulaire**
```javascript
const formPersistence = usePersistence('forms');

function ContactForm() {
  const [formData, setFormData] = useState(() => {
    // Charger depuis le cache au démarrage
    return formPersistence.get('contact_draft', CACHE_STRATEGIES.SESSION_ONLY) || {};
  });
  
  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Sauvegarder automatiquement
    formPersistence.set('contact_draft', newData, CACHE_STRATEGIES.SESSION_ONLY);
  };
  
  const handleSubmit = async () => {
    await submitForm(formData);
    // Nettoyer après soumission
    formPersistence.remove('contact_draft', CACHE_STRATEGIES.SESSION_ONLY);
  };
}
```

### **3. Authentification**
```javascript
const authPersistence = usePersistence('auth');

function useAuth() {
  const [user, setUser] = useState(() => {
    // Charger l'utilisateur depuis le cache
    return authPersistence.get('currentUser', CACHE_STRATEGIES.MEMORY_SESSION);
  });
  
  const login = async (credentials) => {
    const userData = await authenticate(credentials);
    
    // Stocker avec TTL court pour sécurité
    authPersistence.set('currentUser', userData, CACHE_STRATEGIES.MEMORY_SESSION, TTL_PRESETS.SHORT);
    setUser(userData);
  };
  
  const logout = () => {
    authPersistence.remove('currentUser', CACHE_STRATEGIES.MEMORY_SESSION);
    setUser(null);
  };
  
  return { user, login, logout };
}
```

### **4. Préférences Utilisateur**
```javascript
const settingsPersistence = usePersistence('settings');

function useUserSettings() {
  const [settings, setSettings] = useState(() => {
    return settingsPersistence.get('preferences', CACHE_STRATEGIES.MEMORY_LOCAL) || {
      theme: 'light',
      language: 'fr',
      notifications: true
    };
  });
  
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Persistance long terme
    settingsPersistence.set('preferences', newSettings, CACHE_STRATEGIES.MEMORY_LOCAL, TTL_PRESETS.WEEK);
  };
  
  return { settings, updateSetting };
}
```

## ⚠️ **Bonnes Pratiques**

### **1. Choix de Stratégie**
- **MEMORY_ONLY** : Calculs temporaires, données volatiles
- **SESSION_ONLY** : Formulaires, données de session
- **LOCAL_ONLY** : Préférences, configuration
- **MEMORY_SESSION** : Cache API, données fréquentes (défaut)
- **MEMORY_LOCAL** : Profil utilisateur, données importantes
- **TTL** : Tokens, données avec expiration

### **2. TTL Approprié**
- **SHORT (5min)** : Authentification, navigation
- **MEDIUM (30min)** : Cache API, données temporaires
- **LONG (2h)** : Données utilisateur
- **DAY (24h)** : Wizards, brouillons
- **WEEK (7j)** : Configuration, préférences

### **3. Namespacing**
```javascript
// ✅ Bon : Namespaces spécifiques
const authCache = usePersistence('auth');
const userCache = usePersistence('user');
const formCache = usePersistence('forms');

// ❌ Éviter : Namespace générique
const cache = usePersistence('default');
```

### **4. Gestion d'Erreurs**
```javascript
// ✅ Bon : Vérifier les retours
const userData = cache.get('user');
if (userData) {
  // Utiliser les données
}

// ✅ Bon : Fallback gracieux
const settings = cache.get('settings') || defaultSettings;
```

## 🧪 **Tests et Validation**

### **Tests Unitaires**
```javascript
import persistenceService, { CACHE_STRATEGIES } from '@/services/persistenceService';

describe('Mon composant', () => {
  beforeEach(() => {
    persistenceService.resetStats();
  });
  
  test('devrait sauvegarder les données', () => {
    const testData = { test: 'data' };
    const result = persistenceService.set('test_key', testData, CACHE_STRATEGIES.MEMORY_ONLY);
    expect(result).toBe(true);
    
    const retrieved = persistenceService.get('test_key', CACHE_STRATEGIES.MEMORY_ONLY);
    expect(retrieved).toEqual(testData);
  });
});
```

## 📈 **Performance**

### **Métriques Typiques**
- **Cache mémoire** : ~0.1ms par opération
- **1000 opérations** : <100ms
- **Hit rate optimal** : >80%
- **Auto-nettoyage** : <10ms toutes les 30min

### **Optimisations**
- Utiliser `MEMORY_ONLY` pour les données fréquemment accédées
- Choisir des TTL appropriés pour éviter les fuites mémoire
- Utiliser le namespacing pour organiser les données
- Monitorer le hit rate avec le dashboard

## 🔗 **Migration depuis l'Ancien Système**

### **Avant (sessionStorage direct)**
```javascript
// ❌ Ancien système
const data = JSON.parse(sessionStorage.getItem('user_data') || '{}');
sessionStorage.setItem('user_data', JSON.stringify(newData));
```

### **Après (Service centralisé)**
```javascript
// ✅ Nouveau système
const cache = usePersistence('user');
const data = cache.get('data', CACHE_STRATEGIES.SESSION_ONLY) || {};
cache.set('data', newData, CACHE_STRATEGIES.SESSION_ONLY);
```

## 🎉 **Conclusion**

Le service de persistance centralisé offre :
- **6 stratégies** de cache flexibles
- **API unifiée** et cohérente
- **Performance optimisée** avec cache multi-niveaux
- **Monitoring intégré** avec statistiques temps réel
- **Gestion automatique** du TTL et nettoyage
- **Tests complets** avec 100% de couverture

Pour toute question ou problème, consultez le dashboard de monitoring en mode développement ou les tests unitaires pour des exemples d'usage. 