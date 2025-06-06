# 👨‍💻 GUIDE MIGRATION V2 - DÉVELOPPEUR

**Version :** 2.0  
**Public :** Équipe développement TourCraft  
**Prérequis :** Connaissance React, TourCraft V1

---

## 🎯 **INTRODUCTION**

Ce guide pratique vous accompagne dans l'utilisation de l'architecture V2 TourCraft au quotidien. Il contient tous les patterns, exemples et bonnes pratiques pour développer efficacement avec les nouvelles sections V2.

---

## 🚀 **DÉMARRAGE RAPIDE**

### **1. Structure des Sections V2**

```
src/components/common/sections/
├── ContactSectionV2/          # Contact unifié
├── EntityHeaderV2/            # En-têtes standardisés  
├── AddressSectionV2/          # Adresses avec géolocalisation
├── RelationsSectionV2/        # Relations génériques
├── NotesSectionV2/            # Notes avec auto-save
├── StatsSectionV2/            # Statistiques et métriques
└── ActionsSectionV2/          # Actions contextuelles
```

### **2. Import Pattern Standard**

```javascript
// ✅ RECOMMANDÉ - Import depuis l'index centralisé
import { 
  ContactSectionV2,
  EntityHeaderV2,
  RelationsSectionV2,
  NotesSectionV2,
  StatsSectionV2,
  ActionsSectionV2
} from '@/components/common/sections';

// Ou imports spécialisés
import ConcertNotesSectionV2 from '@/components/concerts/sections/ConcertNotesSectionV2';
import StructureStatsSectionV2 from '@/components/structures/sections/StructureStatsSectionV2';
```

---

## 📝 **PATTERNS COURANTS**

### **Pattern 1 : Affichage de Détails d'Entité**

```javascript
// Vue détaillée standard avec sections V2
import React from 'react';
import { 
  EntityHeaderV2, 
  ContactSectionV2, 
  NotesSectionV2, 
  ActionsSectionV2 
} from '@/components/common/sections';

const EntityView = ({ entity, isEditing, onEdit, onSave }) => {
  return (
    <div className="entity-view">
      {/* En-tête avec breadcrumb et badges */}
      <EntityHeaderV2
        entity={entity}
        entityType="concert"
        showBreadcrumb={true}
        showBadges={true}
        onEdit={onEdit}
      />

      {/* Informations de contact */}
      <ContactSectionV2
        entity={entity}
        entityType="concert"
        mode={isEditing ? 'edit' : 'detail'}
        onSave={onSave}
        showCardWrapper={true}
      />

      {/* Notes avec auto-save */}
      <NotesSectionV2
        entity={entity}
        entityType="concert"
        mode={isEditing ? 'edit' : 'detail'}
        autoSave={true}
        characterLimit={2000}
      />

      {/* Actions contextuelles */}
      <ActionsSectionV2
        entity={entity}
        entityType="concert"
        permissions={userPermissions}
        onAction={handleAction}
      />
    </div>
  );
};
```

### **Pattern 2 : Relations Entre Entités**

```javascript
// Affichage des relations avec actions personnalisées
import { RelationsSectionV2 } from '@/components/common/sections';

const StructureConcertsSection = ({ structure, concerts, onAction }) => {
  // 1. Transformer les données pour RelationsSectionV2
  const transformedConcerts = concerts.map(concert => ({
    ...concert,
    nom: concert.titre || 'Concert sans titre',
    type: formatDate(concert.date),
    ville: concert.lieu ? `${concert.lieu.nom} - ${concert.lieu.ville}` : 'Lieu non défini',
    displayInfo: {
      artiste: concert.artiste?.nom,
      montant: formatMontant(concert.montant),
      statut: concert.statut
    }
  }));

  // 2. Configurer les actions spécialisées
  const customActions = [
    {
      id: 'view',
      label: 'Voir détails',
      icon: 'bi-eye',
      onClick: (concert) => navigate(`/concerts/${concert.id}`)
    },
    {
      id: 'programmer',
      label: 'Programmer',
      icon: 'bi-calendar-plus',
      onClick: (concert) => navigate('/concerts/nouveau', { 
        state: { structureId: structure.id, lieuId: concert.lieuId }
      })
    },
    {
      id: 'contrat',
      label: 'Contrat',
      icon: 'bi-file-earmark-text',
      onClick: (concert) => generateContract(concert),
      disabled: (concert) => concert.statut === 'annule'
    }
  ];

  // 3. Retourner la section configurée
  return (
    <RelationsSectionV2
      sourceEntityType="structure"
      relatedEntityType="concert"
      relationshipType="oneToMany"
      data={transformedConcerts}
      actions={customActions}
      title="Concerts associés"
      emptyMessage="Aucun concert associé à cette structure"
      onAction={onAction}
      showSearch={true}
      showFilters={true}
    />
  );
};
```

### **Pattern 3 : Statistiques et Métriques**

```javascript
// Dashboard avec statistiques temps réel
import { StatsSectionV2 } from '@/components/common/sections';

const ConcertStatsSection = ({ concert, period = 'month' }) => {
  // 1. Préparer les métriques
  const metricsConfig = useMemo(() => ({
    kpis: [
      {
        id: 'audience',
        label: 'Audience prévue',
        value: concert.audiencePrevu || 0,
        format: 'number',
        trend: calculateTrend(concert.audiencePrevu, previousPeriod?.audiencePrevu),
        icon: 'bi-people'
      },
      {
        id: 'revenue',
        label: 'Revenus estimés',
        value: concert.revenusEstimes || 0,
        format: 'currency',
        trend: calculateTrend(concert.revenusEstimes, previousPeriod?.revenusEstimes),
        icon: 'bi-currency-euro'
      }
    ],
    charts: [
      {
        type: 'line',
        title: 'Évolution des ventes',
        data: salesEvolutionData,
        period: period
      }
    ]
  }), [concert, period]);

  // 2. Actions d'export et navigation
  const statsActions = [
    {
      id: 'export',
      label: 'Exporter',
      icon: 'bi-download',
      onClick: () => exportStats(concert.id, period)
    },
    {
      id: 'detailed',
      label: 'Analyse détaillée',
      icon: 'bi-graph-up',
      onClick: () => navigate(`/analytics/concerts/${concert.id}`)
    }
  ];

  return (
    <StatsSectionV2
      entityType="concert"
      metricsConfig={metricsConfig}
      period={period}
      actions={statsActions}
      showExport={true}
      realTimeUpdate={true}
      refreshInterval={300000} // 5 minutes
    />
  );
};
```

---

## 🔧 **HOOKS UTILITAIRES**

### **useGenericEntityDetails**

```javascript
// Hook pour gestion complète d'une entité
import { useGenericEntityDetails } from '@/hooks/common/useGenericEntityDetails';

const ConcertView = () => {
  const { id } = useParams();
  
  const {
    entity: concert,
    loading,
    error,
    isEditing,
    setIsEditing,
    handleSave,
    handleDelete,
    handleChange
  } = useGenericEntityDetails({
    entityType: 'concert',
    entityId: id,
    redirectAfterDelete: '/concerts'
  });

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <EntityHeaderV2 
        entity={concert}
        entityType="concert"
        onEdit={() => setIsEditing(true)}
      />
      
      {/* Autres sections... */}
    </div>
  );
};
```

### **useNotesSection**

```javascript
// Hook spécialisé pour les notes
import { useNotesSection } from '@/components/common/sections/NotesSectionV2';

const NotesExample = ({ entity, entityType }) => {
  const {
    notes,
    handleNotesChange,
    saveNotes,
    isSaving,
    charactersLeft,
    hasUnsavedChanges
  } = useNotesSection({
    entity,
    entityType,
    autoSave: true,
    autoSaveDelay: 2000,
    characterLimit: 2000
  });

  return (
    <div>
      <textarea
        value={notes}
        onChange={(e) => handleNotesChange(e.target.value)}
        placeholder="Ajoutez vos notes..."
      />
      <div className="notes-footer">
        <span>{charactersLeft} caractères restants</span>
        {isSaving && <span>Sauvegarde...</span>}
        {hasUnsavedChanges && <span>Modifications non sauvegardées</span>}
      </div>
    </div>
  );
};
```

### **useResponsive**

```javascript
// Hook pour design responsive
import { useResponsive } from '@/hooks/common/useResponsive';

const ResponsiveComponent = () => {
  const { isMobile, isTablet, isDesktop, screenSize } = useResponsive();

  return (
    <div>
      {isMobile && (
        <div className="mobile-layout">
          <MobileActionsSectionV2 {...props} />
        </div>
      )}
      
      {isDesktop && (
        <div className="desktop-layout">
          <ActionsSectionV2 {...props} />
        </div>
      )}
      
      <div className={`layout-${screenSize}`}>
        {/* Contenu adaptatif */}
      </div>
    </div>
  );
};
```

---

## 🎨 **STYLING ET CSS**

### **CSS Modules Pattern**

```css
/* ComponentV2.module.css */
.container {
  padding: var(--tc-spacing-md);
  border-radius: var(--tc-border-radius);
  background: var(--tc-background-card);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--tc-spacing-sm);
}

.content {
  color: var(--tc-text-primary);
  font-size: var(--tc-text-md);
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: var(--tc-spacing-sm);
  }
  
  .header {
    flex-direction: column;
    gap: var(--tc-spacing-xs);
  }
}
```

```javascript
// ComponentV2.js
import styles from './ComponentV2.module.css';

const ComponentV2 = () => (
  <div className={styles.container}>
    <div className={styles.header}>
      <h2>Titre</h2>
    </div>
    <div className={styles.content}>
      Contenu
    </div>
  </div>
);
```

### **Classes Utilitaires TourCraft**

```css
/* Classes disponibles */
.tc-card { /* Style carte standard */ }
.tc-btn-primary { /* Bouton principal */ }
.tc-btn-secondary { /* Bouton secondaire */ }
.tc-badge-success { /* Badge succès */ }
.tc-badge-warning { /* Badge attention */ }
.tc-text-muted { /* Texte atténué */ }
.tc-spacing-* { /* Espacements standardisés */ }
```

---

## 🧪 **TESTS ET DEBUGGING**

### **Tests de Composants V2**

```javascript
// ComponentV2.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ComponentV2 from '../ComponentV2';

// Mock des hooks
jest.mock('@/hooks/common/useGenericEntityDetails');

const mockEntity = {
  id: '1',
  nom: 'Test Entity',
  statut: 'actif'
};

const renderComponent = (props = {}) => {
  return render(
    <BrowserRouter>
      <ComponentV2 entity={mockEntity} {...props} />
    </BrowserRouter>
  );
};

describe('ComponentV2', () => {
  test('affiche les données correctement', () => {
    renderComponent();
    expect(screen.getByText('Test Entity')).toBeInTheDocument();
  });

  test('gère le mode édition', async () => {
    const onSave = jest.fn();
    renderComponent({ onSave });
    
    fireEvent.click(screen.getByRole('button', { name: /éditer/i }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Nouveau nom' } });
    fireEvent.click(screen.getByRole('button', { name: /sauvegarder/i }));
    
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({ ...mockEntity, nom: 'Nouveau nom' });
    });
  });

  test('gère les erreurs gracieusement', () => {
    const onError = jest.fn();
    renderComponent({ onError });
    
    // Simuler une erreur
    fireEvent.click(screen.getByRole('button', { name: /action dangereuse/i }));
    
    expect(onError).toHaveBeenCalled();
  });
});
```

### **Debug avec React DevTools**

```javascript
// Composant avec debug info
const ComponentV2 = (props) => {
  // En développement uniquement
  if (process.env.NODE_ENV === 'development') {
    console.log('ComponentV2 props:', props);
  }

  return (
    <div data-testid="component-v2" data-entity-type={props.entityType}>
      {/* Contenu */}
    </div>
  );
};

// Ajout de displayName pour DevTools
ComponentV2.displayName = 'ComponentV2';
```

---

## ⚡ **PERFORMANCE ET OPTIMISATION**

### **Lazy Loading des Sections**

```javascript
// Chargement différé des sections lourdes
import { lazy, Suspense } from 'react';
import Spinner from '@/components/ui/Spinner';

const StatsSectionV2 = lazy(() => 
  import('@/components/common/sections/StatsSectionV2')
);

const MyComponent = () => (
  <div>
    <h1>Mes données</h1>
    <Suspense fallback={<Spinner />}>
      <StatsSectionV2 {...statsProps} />
    </Suspense>
  </div>
);
```

### **Mémorisation avec useMemo et useCallback**

```javascript
const ComponentV2 = ({ data, onAction }) => {
  // Mémoriser les calculs coûteux
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      computed: expensiveCalculation(item)
    }));
  }, [data]);

  // Mémoriser les callbacks
  const handleAction = useCallback((actionType, item) => {
    onAction(actionType, item);
  }, [onAction]);

  // Mémoriser la configuration
  const actionConfig = useMemo(() => [
    { id: 'view', onClick: (item) => handleAction('view', item) },
    { id: 'edit', onClick: (item) => handleAction('edit', item) }
  ], [handleAction]);

  return (
    <RelationsSectionV2
      data={processedData}
      actions={actionConfig}
    />
  );
};
```

---

## 🚨 **ERREURS COURANTES ET SOLUTIONS**

### **1. Props non passées correctement**

```javascript
// ❌ ERREUR
<ContactSectionV2 entity={entity} />

// ✅ SOLUTION
<ContactSectionV2 
  entity={entity}
  entityType="concert"  // ← Obligatoire
  mode="detail"         // ← Obligatoire
/>
```

### **2. Transformation de données incorrecte**

```javascript
// ❌ ERREUR - Données non transformées
<RelationsSectionV2 data={rawConcerts} />

// ✅ SOLUTION - Transformation appropriée
const transformedConcerts = concerts.map(concert => ({
  ...concert,
  nom: concert.titre,           // ← Champ standardisé
  type: formatDate(concert.date), // ← Formatage
  displayInfo: buildDisplayInfo(concert) // ← Métadonnées
}));

<RelationsSectionV2 data={transformedConcerts} />
```

### **3. Actions non configurées**

```javascript
// ❌ ERREUR - Actions manquantes
<ActionsSectionV2 entity={entity} />

// ✅ SOLUTION - Actions définies
const actions = [
  { id: 'edit', icon: 'bi-pencil', onClick: handleEdit },
  { id: 'delete', icon: 'bi-trash', onClick: handleDelete }
];

<ActionsSectionV2 
  entity={entity}
  entityType="concert"
  actions={actions}
  onAction={handleAction}
/>
```

### **4. CSS Modules non importés**

```javascript
// ❌ ERREUR
const Component = () => <div className="container">Content</div>;

// ✅ SOLUTION
import styles from './Component.module.css';
const Component = () => <div className={styles.container}>Content</div>;
```

---

## 📋 **CHECKLIST DÉVELOPPEMENT**

### **Avant de Commencer**
- [ ] Identifier le type de section nécessaire (Contact, Relations, Stats, etc.)
- [ ] Vérifier qu'un composant V2 équivalent n'existe pas déjà
- [ ] Comprendre les données d'entrée et leur format

### **Développement**
- [ ] Utiliser l'architecture générique appropriée
- [ ] Transformer les données au format attendu
- [ ] Configurer les actions et callbacks
- [ ] Implémenter le responsive design
- [ ] Ajouter les PropTypes et documentation JSDoc

### **Tests**
- [ ] Tests unitaires (affichage, interactions, cas d'erreur)
- [ ] Tests d'intégration avec les hooks
- [ ] Tests de responsivité
- [ ] Validation des performances

### **Finalisation**
- [ ] Ajouter aux exports centralisés
- [ ] Intégrer dans les vues correspondantes
- [ ] Vérifier la compatibilité avec l'existant
- [ ] Documenter les spécificités métier

---

## 🎓 **BONNES PRATIQUES**

### **1. Nomenclature**
```javascript
// ✅ Noms explicites
const ConcertActionsSectionV2 = () => {};
const useStructureRelations = () => {};
const formatConcertDate = () => {};

// ❌ Noms génériques
const Section = () => {};
const useData = () => {};
const format = () => {};
```

### **2. Props et Types**
```javascript
// ✅ Props typées et documentées
import PropTypes from 'prop-types';

/**
 * Section d'affichage des concerts associés à une structure
 * @param {Object} entity - L'entité principale
 * @param {string} entityType - Type d'entité (structure, lieu, etc.)
 * @param {Array} relatedEntities - Entités liées à afficher
 * @param {Function} onAction - Callback pour les actions utilisateur
 */
const ComponentV2 = ({ entity, entityType, relatedEntities, onAction }) => {
  // ...
};

ComponentV2.propTypes = {
  entity: PropTypes.object.isRequired,
  entityType: PropTypes.oneOf(['concert', 'lieu', 'structure']).isRequired,
  relatedEntities: PropTypes.array,
  onAction: PropTypes.func
};

ComponentV2.defaultProps = {
  relatedEntities: [],
  onAction: () => {}
};
```

### **3. Gestion d'État**
```javascript
// ✅ État local minimal, hooks pour logique complexe
const ComponentV2 = ({ entity }) => {
  // État UI simple seulement
  const [showModal, setShowModal] = useState(false);
  
  // Logique métier dans des hooks
  const { data, loading, error, actions } = useEntityRelations(entity);
  
  return (
    <div>
      {loading && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {data && <RelationsSectionV2 data={data} actions={actions} />}
    </div>
  );
};
```

### **4. Performance**
```javascript
// ✅ Mémorisation appropriée
const ComponentV2 = ({ data, filters }) => {
  const filteredData = useMemo(() => {
    return data.filter(item => applyFilters(item, filters));
  }, [data, filters]);

  const handleAction = useCallback((type, item) => {
    // Logic sans dépendances externes
  }, []);

  return <SectionV2 data={filteredData} onAction={handleAction} />;
};
```

---

## 📞 **SUPPORT ET RESSOURCES**

### **Documentation**
- **Architecture V2** : `/docs/GUIDE_ARCHITECTURE_V2_COMPLET.md`
- **Composants UI** : `/docs/components/UI_COMPONENTS.md`
- **Hooks Guide** : `/docs/hooks/HOOKS_DOCUMENTATION.md`

### **Exemples Pratiques**
- **Sections V2** : `/src/components/common/sections/*/`
- **Tests Examples** : `/**/__tests__/*.test.js`
- **Intégrations** : `/src/components/*/desktop/*.js`

### **Outils**
```bash
# Génération de nouveaux composants
npm run generate:section

# Tests en mode watch
npm run test:watch

# Lint avec correction automatique
npm run lint:fix

# Analyse du bundle
npm run build:analyze
```

### **Aide et Questions**
- **Équipe Architecture** : Pour questions sur les patterns V2
- **Documentation interne** : Wiki équipe TourCraft
- **Code Review** : Checklist V2 obligatoire

---

**🎯 Avec ce guide, vous êtes prêt à développer efficacement avec l'architecture V2 TourCraft !**

---

**👨‍💻 GUIDE MIGRATION V2 - DÉVELOPPEUR ✅**

*Dernière mise à jour : 3 juin 2025*  
*Version : 2.0 - Pour Architecture V2 100% Déployée*