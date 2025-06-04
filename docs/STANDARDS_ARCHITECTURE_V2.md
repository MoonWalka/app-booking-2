# 📐 STANDARDS ARCHITECTURE V2 - RÉFÉRENTIEL TECHNIQUE

**Version :** 2.0  
**Public :** Lead Developers, Architectes  
**Statut :** Standards Officiels TourCraft

---

## 🎯 **VISION ARCHITECTURALE**

L'architecture V2 TourCraft repose sur le principe **"Une architecture générique = Toutes les entités"**. Cette approche garantit :

- **Cohérence** : Interface unifiée à travers toute l'application
- **Maintenabilité** : Code centralisé et réutilisable
- **Évolutivité** : Patterns extensibles pour futures fonctionnalités
- **Performance** : Optimisations centralisées et partagées

---

## 🏗️ **PRINCIPES FONDAMENTAUX**

### **1. Generic-First Architecture**

```javascript
// ✅ PRINCIPE - Architecture générique configurée
<RelationsSectionV2
  sourceEntityType="structure"
  relatedEntityType="concert"
  relationshipType="oneToMany"
  data={transformedData}
  actions={customActions}
/>

// ❌ ANTI-PATTERN - Composant spécialisé non-réutilisable
<StructureConcertsOnlySection concerts={concerts} />
```

### **2. Configuration Over Code**

```javascript
// ✅ PRINCIPE - Configuration déclarative
const metricsConfig = {
  kpis: [
    { id: 'total', label: 'Total', value: data.length, trend: '+5%' }
  ],
  charts: [
    { type: 'line', data: evolutionData, title: 'Évolution' }
  ]
};

// ❌ ANTI-PATTERN - Logique hard-codée
const renderMetrics = () => {
  if (entityType === 'concert') return <ConcertMetrics />;
  if (entityType === 'structure') return <StructureMetrics />;
  // ...
};
```

### **3. Data Transformation Pattern**

```javascript
// ✅ PRINCIPE - Transformation vers format standard
const transformedData = rawData.map(item => ({
  ...item,
  nom: item.title || item.nom || item.name,           // → Standard
  type: formatDisplayType(item.type),                 // → Affiché
  ville: buildLocationString(item.lieu),              // → Contextuel
  displayInfo: buildMetadata(item)                    // → Métadonnées
}));

// ❌ ANTI-PATTERN - Gestion des formats dans le composant
<SectionV2 
  data={rawData}
  formatTitle={(item) => item.title || item.nom}
  formatLocation={(item) => `${item.lieu?.nom} - ${item.lieu?.ville}`}
/>
```

---

## 📋 **STANDARDS DE NOMENCLATURE**

### **Composants V2**

```javascript
// Format : [Entity][Purpose]SectionV2
ConcertNotesSectionV2       // ✅ Correct
StructureActionsSectionV2   // ✅ Correct
LieuStatsSectionV2         // ✅ Correct

// Architectures génériques
ContactSectionV2           // ✅ Architecture de base
RelationsSectionV2         // ✅ Architecture de base
```

### **Hooks**

```javascript
// Format : use[Purpose][Entity/Generic]
useGenericEntityDetails    // ✅ Hook générique
useNotesSection           // ✅ Hook spécialisé section
useConcertRelations       // ✅ Hook métier spécifique
```

### **Fichiers et Dossiers**

```
src/components/
├── common/sections/           # Architectures génériques
│   ├── ContactSectionV2/
│   ├── RelationsSectionV2/
│   └── ...
├── [entity]/desktop/sections/ # Implémentations spécialisées
│   ├── EntityActionsSectionV2.js
│   ├── EntityNotesSectionV2.js
│   └── ...
```

---

## 🔧 **PATTERNS OBLIGATOIRES**

### **1. Props Interface Standard**

```javascript
// Interface obligatoire pour toutes les sections V2
const SectionV2Interface = {
  // Props de base (obligatoires)
  entity: PropTypes.object.isRequired,
  entityType: PropTypes.string.isRequired,
  
  // Props de comportement (optionnelles)
  mode: PropTypes.oneOf(['detail', 'edit']),
  isEditing: PropTypes.bool,
  showCardWrapper: PropTypes.bool,
  
  // Props de callbacks (optionnelles)
  onSave: PropTypes.func,
  onEdit: PropTypes.func,
  onAction: PropTypes.func,
  
  // Props de configuration (optionnelles)
  variant: PropTypes.string,
  permissions: PropTypes.object,
  customConfig: PropTypes.object
};
```

### **2. Error Boundaries Obligatoires**

```javascript
// Chaque section V2 doit être protégée
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

const EntityView = () => (
  <div>
    <ErrorBoundary fallback={<SectionErrorFallback />}>
      <ContactSectionV2 {...props} />
    </ErrorBoundary>
    
    <ErrorBoundary fallback={<SectionErrorFallback />}>
      <RelationsSectionV2 {...props} />
    </ErrorBoundary>
  </div>
);
```

### **3. Loading States Standard**

```javascript
// États de chargement unifiés
const SectionV2 = ({ loading, error, data, ...props }) => {
  if (loading) return <SectionSkeleton />;
  if (error) return <SectionError error={error} />;
  if (!data || data.length === 0) return <SectionEmpty {...props} />;
  
  return <SectionContent data={data} {...props} />;
};
```

---

## 🎨 **STANDARDS CSS ET STYLING**

### **CSS Modules Obligatoires**

```css
/* SectionV2.module.css */
.container {
  /* Variables CSS obligatoires */
  padding: var(--tc-spacing-md);
  border-radius: var(--tc-border-radius);
  background: var(--tc-background-card);
  border: 1px solid var(--tc-border-light);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--tc-spacing-sm);
  padding-bottom: var(--tc-spacing-xs);
  border-bottom: 1px solid var(--tc-border-light);
}

.content {
  color: var(--tc-text-primary);
  font-size: var(--tc-text-md);
  line-height: var(--tc-line-height-normal);
}

/* Responsive obligatoire */
@media (max-width: 768px) {
  .container {
    padding: var(--tc-spacing-sm);
  }
}
```

### **Variables CSS Standards**

```css
/* Obligatoires dans toute nouvelle section */
:root {
  /* Espacements */
  --tc-spacing-xs: 0.25rem;
  --tc-spacing-sm: 0.5rem;
  --tc-spacing-md: 1rem;
  --tc-spacing-lg: 1.5rem;
  --tc-spacing-xl: 2rem;
  
  /* Couleurs */
  --tc-primary: #007bff;
  --tc-secondary: #6c757d;
  --tc-success: #28a745;
  --tc-warning: #ffc107;
  --tc-danger: #dc3545;
  
  /* Typographie */
  --tc-text-xs: 0.75rem;
  --tc-text-sm: 0.875rem;
  --tc-text-md: 1rem;
  --tc-text-lg: 1.125rem;
  --tc-text-xl: 1.25rem;
  
  /* Layout */
  --tc-border-radius: 0.375rem;
  --tc-border-light: #dee2e6;
  --tc-background-card: #ffffff;
  --tc-line-height-normal: 1.5;
}
```

---

## 🧪 **STANDARDS DE TESTS**

### **Structure de Tests Obligatoire**

```
src/components/common/sections/SectionV2/
├── SectionV2.js
├── SectionV2.module.css
├── __tests__/
│   ├── SectionV2.test.js           # Tests unitaires
│   ├── SectionV2.integration.test.js # Tests d'intégration
│   ├── SectionV2.accessibility.test.js # Tests a11y
│   └── __snapshots__/
└── hooks/
    ├── useSectionHook.js
    └── __tests__/
        └── useSectionHook.test.js
```

### **Tests Minimums Obligatoires**

```javascript
// Tests obligatoires pour chaque section V2
describe('SectionV2', () => {
  // 1. Rendu avec données valides
  test('renders with valid data', () => {
    render(<SectionV2 {...validProps} />);
    expect(screen.getByTestId('section-v2')).toBeInTheDocument();
  });

  // 2. Gestion des états vides
  test('handles empty data gracefully', () => {
    render(<SectionV2 {...emptyProps} />);
    expect(screen.getByText(/aucun élément/i)).toBeInTheDocument();
  });

  // 3. Gestion des erreurs
  test('displays error state correctly', () => {
    render(<SectionV2 {...errorProps} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  // 4. Interactions utilisateur
  test('handles user interactions', () => {
    const onAction = jest.fn();
    render(<SectionV2 {...validProps} onAction={onAction} />);
    fireEvent.click(screen.getByRole('button', { name: /action/i }));
    expect(onAction).toHaveBeenCalled();
  });

  // 5. Accessibilité
  test('meets accessibility requirements', async () => {
    const { container } = render(<SectionV2 {...validProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### **Coverage Minimums**

```javascript
// Configuration Jest obligatoire
module.exports = {
  collectCoverageFrom: [
    'src/components/common/sections/**/*.{js,jsx}',
    '!src/components/common/sections/**/*.test.{js,jsx}',
    '!src/components/common/sections/**/index.js'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};
```

---

## 📊 **STANDARDS DE PERFORMANCE**

### **Métriques Obligatoires**

```javascript
// Métriques à respecter pour chaque section V2
const PerformanceStandards = {
  bundleSize: '< 50kb par section (gzipped)',
  renderTime: '< 100ms pour 100 éléments',
  memoryLeak: 'Aucune fuite mémoire détectable',
  reRenders: '< 3 re-renders pour une action utilisateur'
};
```

### **Optimisations Obligatoires**

```javascript
// 1. Mémorisation des calculs coûteux
const SectionV2 = ({ data, filters }) => {
  const processedData = useMemo(() => {
    return data.filter(item => applyComplexFilters(item, filters));
  }, [data, filters]);

  return <SectionContent data={processedData} />;
};

// 2. Callbacks mémorisés
const handleAction = useCallback((type, item) => {
  onAction(type, item);
}, [onAction]);

// 3. Lazy loading pour sections lourdes
const HeavySectionV2 = lazy(() => import('./HeavySectionV2'));

// 4. Virtualization pour grandes listes
import { FixedSizeList as List } from 'react-window';

const LargeListSection = ({ items }) => (
  <List
    height={600}
    itemCount={items.length}
    itemSize={50}
    itemData={items}
  >
    {ListItem}
  </List>
);
```

---

## 🔐 **STANDARDS DE SÉCURITÉ**

### **Validation des Props Obligatoire**

```javascript
// Validation stricte avec PropTypes
import PropTypes from 'prop-types';

const SectionV2 = ({ entity, entityType, permissions }) => {
  // Validation runtime en développement
  if (process.env.NODE_ENV === 'development') {
    if (!entity || !entity.id) {
      console.error('SectionV2: entity.id est obligatoire');
    }
    if (!VALID_ENTITY_TYPES.includes(entityType)) {
      console.error(`SectionV2: entityType "${entityType}" non valide`);
    }
  }

  return <div>{/* Contenu */}</div>;
};

SectionV2.propTypes = {
  entity: PropTypes.shape({
    id: PropTypes.string.isRequired,
    nom: PropTypes.string
  }).isRequired,
  entityType: PropTypes.oneOf(VALID_ENTITY_TYPES).isRequired,
  permissions: PropTypes.object
};
```

### **Sanitization des Données**

```javascript
// Sanitization obligatoire des données utilisateur
import DOMPurify from 'dompurify';

const sanitizeUserContent = (content) => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};

const NotesSection = ({ notes }) => (
  <div 
    dangerouslySetInnerHTML={{ 
      __html: sanitizeUserContent(notes) 
    }} 
  />
);
```

### **Permissions et Autorisation**

```javascript
// Vérification des permissions obligatoire
const ActionsSectionV2 = ({ entity, permissions, onAction }) => {
  const visibleActions = useMemo(() => {
    return allActions.filter(action => 
      hasPermission(permissions, action.requiredPermission)
    );
  }, [permissions]);

  const handleAction = (actionId, item) => {
    // Double vérification côté client
    if (!hasPermission(permissions, actionId)) {
      console.warn(`Action ${actionId} non autorisée`);
      return;
    }
    onAction(actionId, item);
  };

  return <ActionsMenu actions={visibleActions} onAction={handleAction} />;
};
```

---

## 📱 **STANDARDS RESPONSIVE**

### **Breakpoints Obligatoires**

```css
/* Breakpoints standards TourCraft */
:root {
  --breakpoint-xs: 0px;      /* Mobile portrait */
  --breakpoint-sm: 576px;    /* Mobile landscape */
  --breakpoint-md: 768px;    /* Tablet */
  --breakpoint-lg: 992px;    /* Desktop */
  --breakpoint-xl: 1200px;   /* Large desktop */
  --breakpoint-xxl: 1400px;  /* Extra large */
}

/* Media queries obligatoires */
@media (max-width: 575.98px) { /* Mobile */ }
@media (min-width: 576px) and (max-width: 767.98px) { /* Mobile landscape */ }
@media (min-width: 768px) and (max-width: 991.98px) { /* Tablet */ }
@media (min-width: 992px) { /* Desktop+ */ }
```

### **Layout Responsive Pattern**

```javascript
// Pattern responsive obligatoire
import { useResponsive } from '@/hooks/common/useResponsive';

const SectionV2 = ({ data, ...props }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  // Configuration adaptative
  const layoutConfig = useMemo(() => {
    if (isMobile) return { columns: 1, showActions: 'dropdown' };
    if (isTablet) return { columns: 2, showActions: 'inline' };
    return { columns: 3, showActions: 'full' };
  }, [isMobile, isTablet]);

  return (
    <div className={`section-${layoutConfig.columns}-cols`}>
      {/* Contenu adaptatif */}
    </div>
  );
};
```

---

## 🔄 **STANDARDS DE MIGRATION**

### **Checklist Migration V1 → V2**

```javascript
// ✅ ÉTAPES OBLIGATOIRES

// 1. Analyse du composant V1
const analyzeV1Component = (componentPath) => {
  // - Identifier le type de section (Contact, Relations, etc.)
  // - Comprendre les props et données d'entrée
  // - Répertorier la logique métier spécifique
  // - Identifier les dépendances externes
};

// 2. Choix de l'architecture V2
const selectV2Architecture = (componentType) => {
  const architectureMap = {
    'contact': 'ContactSectionV2',
    'relations': 'RelationsSectionV2',
    'statistics': 'StatsSectionV2',
    'actions': 'ActionsSectionV2',
    'notes': 'NotesSectionV2',
    'address': 'AddressSectionV2',
    'header': 'EntityHeaderV2'
  };
  return architectureMap[componentType];
};

// 3. Transformation des données
const transformDataForV2 = (v1Data, targetArchitecture) => {
  // Transformer vers le format standard V2
  return v1Data.map(item => ({
    ...item,
    nom: standardizeTitle(item),
    type: standardizeType(item),
    displayInfo: buildDisplayInfo(item)
  }));
};

// 4. Migration des actions
const migrateActions = (v1Actions) => {
  return v1Actions.map(action => ({
    id: action.id,
    label: action.label,
    icon: `bi-${action.icon}`,
    onClick: action.handler,
    disabled: action.isDisabled,
    permissions: action.requiredRoles
  }));
};
```

### **Standards de Rétrocompatibilité**

```javascript
// Période de transition obligatoire : 2 sprints minimum
const LegacyCompatibleSection = (props) => {
  // Support props V1 avec avertissement
  if (props.legacyProp) {
    console.warn('DEPRECATED: legacyProp sera supprimé dans la v2.1');
  }

  // Transformation automatique V1 → V2
  const v2Props = transformLegacyProps(props);
  
  return <SectionV2 {...v2Props} />;
};

// Feature flag pour activation progressive
const SectionWrapper = (props) => {
  const useV2 = useFeatureFlag('sections-v2-enabled');
  
  return useV2 ? 
    <SectionV2 {...props} /> : 
    <LegacySectionV1 {...props} />;
};
```

---

## 📈 **STANDARDS DE MONITORING**

### **Métriques Obligatoires**

```javascript
// Monitoring des performances V2
import { trackPerformance, trackError, trackUsage } from '@/utils/analytics';

const SectionV2 = (props) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      trackPerformance('section-v2-render', renderTime, {
        sectionType: props.entityType,
        dataSize: props.data?.length || 0
      });
    };
  }, []);

  const handleError = (error) => {
    trackError('section-v2-error', error, {
      sectionType: props.entityType,
      props: JSON.stringify(props)
    });
  };

  const handleAction = (actionId) => {
    trackUsage('section-v2-action', {
      sectionType: props.entityType,
      actionId,
      timestamp: Date.now()
    });
    props.onAction(actionId);
  };

  return (
    <ErrorBoundary onError={handleError}>
      {/* Contenu */}
    </ErrorBoundary>
  );
};
```

### **Alertes Performance**

```javascript
// Seuils d'alerte automatiques
const PerformanceMonitor = {
  renderTime: {
    warning: 100, // ms
    critical: 500 // ms
  },
  memoryUsage: {
    warning: 50, // MB
    critical: 100 // MB
  },
  reRenders: {
    warning: 5,
    critical: 10
  }
};
```

---

## 🎯 **VALIDATION ET COMPLIANCE**

### **Audit Automatique**

```bash
# Scripts d'audit obligatoires
npm run audit:architecture-v2  # Vérification conformité
npm run audit:performance     # Métriques performance
npm run audit:accessibility   # Tests a11y automatiques
npm run audit:security       # Analyse sécurité
```

### **Code Review Checklist**

```markdown
## Checklist Review V2 (Obligatoire)

### Architecture
- [ ] Utilise une architecture générique V2 appropriée
- [ ] Props interface respecte les standards
- [ ] Transformation des données correcte
- [ ] Actions configurées selon les standards

### Performance
- [ ] useMemo/useCallback appropriés
- [ ] Pas de re-renders inutiles
- [ ] Bundle size acceptable (< 50kb)
- [ ] Lazy loading si nécessaire

### Tests
- [ ] Tests unitaires (coverage > 85%)
- [ ] Tests d'accessibilité
- [ ] Tests d'intégration
- [ ] Tests de performance

### Sécurité
- [ ] Validation des props
- [ ] Sanitization des données utilisateur
- [ ] Vérification des permissions
- [ ] Pas de failles XSS/injection

### CSS et Responsive
- [ ] CSS Modules utilisés
- [ ] Variables CSS standards
- [ ] Responsive sur tous breakpoints
- [ ] Pas de styles globaux non-préfixés
```

---

## 🏆 **CERTIFICATIONS QUALITÉ**

### **Niveaux de Conformité**

```javascript
// Badge de qualité V2
const QualityBadge = {
  BRONZE: {
    tests: '>= 70%',
    performance: 'Acceptable',
    accessibility: 'AA partiel'
  },
  SILVER: {
    tests: '>= 85%',
    performance: 'Optimisé',
    accessibility: 'AA complet'
  },
  GOLD: {
    tests: '>= 95%',
    performance: 'Excellent',
    accessibility: 'AAA',
    documentation: 'Complète'
  }
};
```

### **Process de Certification**

1. **Auto-évaluation** : Scripts d'audit automatiques
2. **Peer Review** : Review par un autre développeur
3. **Architecture Review** : Validation par lead technique
4. **QA Testing** : Tests fonctionnels complets
5. **Performance Testing** : Validation métriques production

---

## 🎊 **CONCLUSION**

### **Architecture V2 : Excellence par Design**

Ces standards garantissent que l'architecture V2 TourCraft maintient son niveau d'excellence technique et continue d'évoluer de manière cohérente et performante.

### **Conformité Obligatoire**

**Tous les nouveaux développements doivent respecter ces standards.** Les écarts doivent être justifiés et approuvés par l'équipe architecture.

### **Évolution Continue**

Ces standards évoluent avec l'architecture. Toute proposition d'amélioration doit suivre le processus RFC (Request for Comments) interne.

---

**📐 STANDARDS ARCHITECTURE V2 - RÉFÉRENTIEL OFFICIEL ✅**

*Version : 2.0*  
*Statut : Standards Officiels TourCraft*  
*Prochaine révision : Septembre 2025*