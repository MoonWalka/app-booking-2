# Plan de Nettoyage et Harmonisation - TourCraft Booking App
*Date : Mai 2025*

## 🎯 Objectifs
1. **Nettoyer** le code après les simplifications récentes
2. **Harmoniser** les styles de toutes les pages
3. **Vérifier** que toutes les fonctionnalités sont opérationnelles
4. **Optimiser** l'architecture pour la maintenabilité

## 📋 Phase 1 : Nettoyage immédiat (1-2 jours)

### 1.1 Suppression des fichiers de test/debug
```bash
# Script de nettoyage à exécuter
rm -f src/pages/TestDiagnostic.js
rm -f src/pages/TestParametresVersions.js
rm -f src/pages/TestContractError.js
rm -f src/pages/test/StyleTestPage.js
rm -f src/components/TestArtistesList.js
rm -rf src/components/debug/
rm -f src/**/*.original.js
rm -f src/**/*.new
```

### 1.2 Nettoyage des imports inutilisés
- [ ] Exécuter ESLint avec règle `no-unused-vars`
- [ ] Supprimer tous les imports commentés
- [ ] Nettoyer les console.log de debug

### 1.3 Suppression des composants obsolètes
- [ ] Versions multiples de formulaires (Simple, Robuste, etc.)
- [ ] Fichiers backup (.original)
- [ ] Composants non référencés

## 📐 Phase 2 : Harmonisation des styles (3-4 jours)

### 2.1 Création d'un système de design unifié
```css
/* src/styles/design-tokens.css */
:root {
  /* Couleurs primaires */
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-info: #17a2b8;
  
  /* Espacements */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typographie */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Breakpoints */
  --breakpoint-mobile: 768px;
  --breakpoint-tablet: 1024px;
  --breakpoint-desktop: 1280px;
}
```

### 2.2 Migration progressive de Bootstrap
- [ ] Identifier les composants utilisant Bootstrap
- [ ] Créer des classes CSS modules équivalentes
- [ ] Migrer page par page

### 2.3 Unification des composants UI
- [ ] Créer un guide de composants standardisés
- [ ] Utiliser partout les mêmes boutons (Button.js)
- [ ] Standardiser les modales (Modal.js)
- [ ] Uniformiser les cards (Card.js)

## 🔧 Phase 3 : Consolidation architecture (5-7 jours)

### 3.1 Fusion desktop/mobile
Stratégie : Un composant responsive au lieu de deux versions

```javascript
// Avant : ArtistesList.js
return isMobile ? <MobileList /> : <DesktopList />;

// Après : ArtistesList.js
return (
  <div className={styles.container}>
    <div className={styles.responsive}>
      {/* Un seul composant avec CSS responsive */}
    </div>
  </div>
);
```

### 3.2 Standardisation des listes
- [ ] Migrer toutes les listes vers `ListWithFilters`
- [ ] StructuresList ✅ (déjà fait)
- [ ] ArtistesList
- [ ] LieuxList
- [ ] ProgrammateursList

### 3.3 Simplification des hooks
- [ ] Créer des hooks génériques réutilisables
- [ ] `useEntityList` pour toutes les listes
- [ ] `useEntityDetails` pour tous les détails
- [ ] `useEntityForm` pour tous les formulaires

## ✅ Phase 4 : Vérification des fonctionnalités (2-3 jours)

### 4.1 Tests des workflows critiques
- [ ] **Onboarding**
  - Création d'organisation
  - Rejoindre une organisation (à implémenter)
  - Changement d'organisation

- [ ] **Gestion des entités**
  - CRUD complet pour chaque module
  - Relations entre entités (tokens)
  - Recherche et filtres

- [ ] **Formulaires programmateurs**
  - Génération du formulaire
  - Envoi par email
  - Soumission par le programmateur
  - Validation et mise à jour des entités

- [ ] **Génération de contrats**
  - Sélection du template
  - Remplacement des variables
  - Génération PDF
  - Sauvegarde et envoi

### 4.2 Tests de responsive
- [ ] Navigation mobile
- [ ] Formulaires sur mobile
- [ ] Tables responsives
- [ ] Modales sur petit écran

### 4.3 Tests multi-organisation
- [ ] Isolation des données par organisation
- [ ] Changement d'organisation
- [ ] Permissions et accès

## 📊 Métriques de succès

### Avant nettoyage
- 74,051 lignes de code
- 30+ composants dupliqués desktop/mobile
- 3 systèmes de style différents
- 106 fichiers de test/debug

### Objectifs après nettoyage
- < 50,000 lignes de code (-30%)
- 0 composant dupliqué
- 1 système de style unifié
- 0 fichier de test en production

## 🛠️ Scripts utiles

### Script de nettoyage global
```bash
#!/bin/bash
# cleanup.sh

# Supprimer fichiers de test
find src -name "*test*.js" -not -path "*/node_modules/*" -delete
find src -name "*Test*.js" -not -path "*/node_modules/*" -delete
find src -name "*.original.js" -delete
find src -name "*.new" -delete

# Nettoyer les console.log
find src -name "*.js" -exec sed -i '' '/console\.(log|time|timeEnd)/d' {} \;

# Linter pour les imports inutilisés
npm run lint -- --fix
```

### Script d'audit des styles
```bash
#!/bin/bash
# audit-styles.sh

echo "=== Audit des systèmes de style ==="
echo "Bootstrap classes:"
grep -r "className.*btn-\|col-\|row\|container" src --include="*.js" | wc -l

echo "CSS Modules:"
find src -name "*.module.css" | wc -l

echo "Inline styles:"
grep -r "style={{" src --include="*.js" | wc -l
```

## 📅 Planning suggéré

| Phase | Durée | Priorité | Responsable |
|-------|-------|----------|-------------|
| Phase 1 - Nettoyage | 1-2 jours | Haute | Dev team |
| Phase 2 - Styles | 3-4 jours | Haute | UI/UX + Dev |
| Phase 3 - Architecture | 5-7 jours | Moyenne | Senior Dev |
| Phase 4 - Tests | 2-3 jours | Haute | QA + Dev |

**Total estimé : 11-16 jours**

## 🎯 Prochaines étapes immédiates

1. **Exécuter le script de nettoyage** pour supprimer les fichiers inutiles
2. **Créer le fichier design-tokens.css** avec les variables unifiées
3. **Commencer par migrer une page simple** (ex: Dashboard) comme proof of concept
4. **Documenter les patterns** au fur et à mesure

Ce plan permettra d'avoir une application plus maintenable, plus performante et avec une expérience utilisateur cohérente.