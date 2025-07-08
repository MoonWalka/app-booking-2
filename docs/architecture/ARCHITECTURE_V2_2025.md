# 🏗️ Architecture V2 TourCraft - 2025

## 📋 Vue d'ensemble

L'architecture V2 de TourCraft représente une évolution majeure vers une architecture modulaire, générique et scalable. Cette refonte complète a été mise en place entre mai et juin 2025 pour résoudre les problèmes de maintenabilité et de performance de la V1.

### 🎯 Objectifs de l'Architecture V2
- **Généricité** : Composants et hooks réutilisables pour toutes les entités
- **Performance** : Système de cache multicouche et optimisations React
- **Maintenabilité** : Code DRY, configuration centralisée
- **Scalabilité** : Support multi-organisation natif
- **Modernité** : React 18.2, hooks, contextes, Firebase 10.9

## 🛠️ Stack Technique

### Frontend
```json
{
  "react": "^18.2.0",
  "firebase": "^10.9.0",
  "react-bootstrap": "^2.10.9",
  "react-router-dom": "^6.11.2",
  "formik": "^2.4.6",
  "@react-pdf/renderer": "^3.4.5"
}
```

### Outils de Build
- **CRACO** : Configuration personnalisée de Create React App
- **Alias @** : Import simplifiés (`@/components`, `@/hooks`)
- **Mode local** : Émulateurs Firebase pour le développement

## 📁 Structure des Dossiers

```
src/
├── components/
│   ├── common/         # Composants partagés (Layout, Navigation)
│   ├── generics/       # Composants génériques V2
│   │   ├── GenericDetailView.js
│   │   ├── GenericList.js
│   │   ├── GenericFormWrapper.js
│   │   └── ContactSectionV2.js
│   ├── ui/            # Composants UI réutilisables
│   │   ├── Card.js
│   │   ├── Badge.js
│   │   └── FormField.js
│   └── [entity]/      # Composants spécifiques par entité
│       ├── desktop/   # Version desktop
│       ├── mobile/    # Version mobile
│       └── sections/  # Sections de page
│
├── hooks/
│   ├── generics/      # Hooks génériques V2
│   │   ├── useGenericEntityDetails.js
│   │   ├── useGenericEntityList.js
│   │   ├── useGenericEntityForm.js
│   │   └── useGenericSearch.js
│   ├── common/        # Hooks utilitaires
│   │   ├── useDebounce.js
│   │   ├── useResponsive.js
│   │   └── useMultiOrganization.js
│   └── [entity]/      # Hooks spécifiques
│       └── use[Entity]Details.js
│
├── services/
│   ├── firebase-service.js      # Service Firebase centralisé
│   ├── genericEntityService.js  # CRUD générique
│   ├── contactService.js        # Service contacts unifié
│   └── cacheService.js          # Gestion du cache
│
├── context/
│   ├── AuthContext.js           # Authentification
│   └── OrganizationContext.js   # Multi-organisation
│
├── config/
│   ├── entityConfigurations.js  # Configuration des entités
│   └── firebaseCollections.js   # Mapping des collections
│
└── pages/
    └── [Entity]Page.js          # Pages principales
```

## 🔄 Flux de Données

### 1. Architecture Générique
```javascript
// Configuration centralisée
entityConfigurations.js → GenericDetailView → useGenericEntityDetails → genericEntityService → Firebase

// Exemple d'utilisation
<GenericDetailView 
  entityType="contact"
  entityId={contactId}
  config={entityConfigurations.contacts}
/>
```

### 2. Système de Cache Multicouche
```javascript
// Cache en mémoire (TTL: 5 minutes)
useGenericEntityDetails → EntityCache → MemoryCache → Firebase

// Invalidation automatique sur mutations
update() → invalidateCache() → refetch()
```

### 3. Relations Bidirectionnelles
```javascript
// Gestion automatique des relations
ContactService.createRelation(contactId, lieuId)
  → Update contact.lieux[]
  → Update lieu.contacts[]
  → Emit relation event
```

## 🏛️ Patterns Architecturaux

### 1. Hooks Génériques avec Wrapper
```javascript
// Hook générique de base
const useGenericEntityDetails = (entityType, entityId, options) => {
  // Logique générique partagée
}

// Wrapper spécifique
const useContactDetails = (contactId) => {
  return useGenericEntityDetails('contacts', contactId, {
    includeRelations: true,
    realTime: true
  });
}
```

### 2. Configuration par Entité
```javascript
// entityConfigurations.js
export const entityConfigurations = {
  contacts: {
    collectionName: 'contacts',
    fields: [...],
    relations: {
      lieux: { type: 'many-to-many', target: 'lieux' },
      concerts: { type: 'one-to-many', target: 'concerts' }
    },
    cache: { ttl: 300000, enabled: true }
  }
}
```

### 3. Composants Responsive
```javascript
// Utilisation du hook useResponsive
const ContactDetails = () => {
  const { isMobile } = useResponsive();
  
  return isMobile 
    ? <ContactDetailsMobile />
    : <ContactDetailsDesktop />;
}
```

## 🔐 Gestion Multi-Organisation

### Context Provider
```javascript
<OrganizationProvider>
  <App />
</OrganizationProvider>
```

### Isolation des Données
```javascript
// Toutes les requêtes incluent automatiquement entrepriseId
where('entrepriseId', '==', currentOrganization.id)
```

### Migration des Données
- Migration automatique des RIB lors du changement d'organisation
- Scripts de migration pour les données legacy

## 🚀 Optimisations de Performance

### 1. Lazy Loading
```javascript
const ContactDetailsDesktop = lazy(() => 
  import('./components/contacts/desktop/ContactDetails')
);
```

### 2. Memoization
```javascript
const MemoizedContactCard = React.memo(ContactCard, (prev, next) => 
  prev.contact.id === next.contact.id && 
  prev.contact.updatedAt === next.contact.updatedAt
);
```

### 3. Debounce & Throttle
```javascript
const debouncedSearch = useDebounce(searchTerm, 300);
```

## 🔄 Migration V1 → V2

### Changements Majeurs
1. **Terminologie** : `programmateurs` → `contacts` avec système de rôles
2. **Hooks** : Hooks spécifiques → Hooks génériques
3. **Relations** : Manuelles → Automatiques bidirectionnelles
4. **Cache** : Basique → Multicouche avec TTL
5. **Multi-org** : Ajouté dans V2

### Guide de Migration
```javascript
// V1
const programmateur = useProgrammateurDetails(id);

// V2
const contact = useContactDetails(id);
// ou générique
const contact = useGenericEntityDetails('contacts', id);
```

## 📝 Conventions de Code

### Imports
```javascript
// Utiliser les alias
import { useContactDetails } from '@/hooks/contacts';
import Card from '@/components/ui/Card';

// Pas de chemins relatifs profonds
// ❌ import Card from '../../../components/ui/Card';
```

### Nommage
- Composants : `PascalCase`
- Hooks : `camelCase` avec préfixe `use`
- Services : `camelCase` avec suffixe `Service`
- Constantes : `UPPER_SNAKE_CASE`

### Structure des Composants
```javascript
// 1. Imports
// 2. Constantes
// 3. Composant principal
// 4. Sous-composants
// 5. Styles (si module CSS)
// 6. PropTypes/Export
```

## 🔮 Évolutions Futures

### Court Terme
- Migration complète des derniers composants V1
- Amélioration du système de cache
- Tests unitaires des hooks génériques

### Moyen Terme
- TypeScript pour une meilleure type safety
- GraphQL pour optimiser les requêtes
- Server-Side Rendering avec Next.js

### Long Terme
- Micro-frontends pour la scalabilité
- Architecture événementielle
- IA pour suggestions intelligentes

## 📚 Documentation Complémentaire

- [Guide des Hooks Génériques](/docs/hooks/GUIDE_UTILISATION_HOOKS_GENERIQUES.md)
- [Sécurité et Bonnes Pratiques](/docs/architecture/SECURITE.md)
- [Configuration des Entités](/docs/standards/STANDARDISATION_MODELES.md)
- [Guide de Migration V2](/docs/guides/GUIDE_MIGRATION_V2_DEVELOPPER.md)

---

*Document maintenu par l'équipe TourCraft*  
*Dernière mise à jour : 30 juin 2025*  
*Version : 2.0*