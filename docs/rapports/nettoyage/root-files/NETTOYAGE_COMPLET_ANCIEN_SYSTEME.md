# 🧹 Nettoyage Complet de l'Ancien Système
**Date : 10 juillet 2025**

## 📊 Résumé Global
- **200+ fichiers obsolètes** identifiés
- **380 références** à l'ancienne terminologie (319 "concert" + 61 "organization")
- **65+ fichiers CSS** orphelins ou obsolètes
- **Dossier complet supprimé** : `src/components/parametres/`

## 🔴 PHASE 1 : Suppression Immédiate (Sans Risque)

### 1. Fichiers CSS Orphelins (16 fichiers)
```bash
# CSS totalement inutilisés
rm src/components/common/EnvironmentBanner.css
rm src/components/common/ui/Card.css
rm src/components/contrats/editor-modal.css
rm src/styles/base/colors-harmonized.css
rm src/styles/base/typography.css
rm src/styles/components/alerts.css
rm src/styles/components/concerts-mobile.css
rm src/styles/components/concerts.css
rm src/styles/components/contrat-editor.css
rm src/styles/components/contrat-print.css
rm src/styles/components/lists.css
rm src/styles/components/structure-card.css
rm src/styles/components/tc-utilities.css
rm src/styles/formPublic.css
rm src/styles/layout.css
rm src/styles/mixins/breakpoints.css
```

### 2. Pages Obsolètes (4 fichiers + routes)
```bash
# Pages non accessibles
rm src/pages/LieuxPage.js
rm src/pages/FormResponsePage.js
rm src/pages/FormResponsePage.module.css
rm src/pages/PreContratFormResponsePage.js
```

### 3. Composants Lieux Obsolètes (12 fichiers)
```bash
# Tout le dossier lieux (remplacé par salles + festivals)
rm -rf src/components/lieux/
# Contient:
# - desktop/LieuView.js + .module.css
# - desktop/LieuxList.js + .module.css
# - desktop/sections/LieuxListSearchFilter.js + .module.css
# - desktop/sections/LieuxResultsTable.js + .module.css
# - desktop/sections/LieuxStatsCards.js + .module.css
# - mobile/LieuView.js + .module.css
# - mobile/LieuMobileForm.js + .module.css
# - mobile/LieuxList.js + .module.css
# - LieuxList.js

# CSS associé
rm src/styles/pages/lieux.css
```

### 4. Composants Non Utilisés (5 fichiers)
```bash
# Dates
rm src/components/dates/DatesList.js
rm src/components/dates/DatesList.module.css
rm src/components/dates/DateDetailsWithRoles.js
rm src/components/dates/DateInfoSection.js  # Racine, remplacé par sections/DateInfoSection.js

# Contacts
rm src/components/contacts/ContactsList.js  # Seulement dans tests
```

### 5. Backup et Scripts de Migration (2 éléments)
```bash
rm -rf backup-organizationId-20250708_212609/
rm migrate-concert-to-date-complete.sh
```

## 🟡 PHASE 2 : Migration Terminologie (123 fichiers)

### Concert → Date (108 fichiers restants)
- **73 fichiers JS/JSX** avec "concert"
- **35 fichiers CSS** avec "concert"

Fichiers prioritaires :
```
# Pages de contrats (impact fonctionnel)
src/pages/ContratGenerationPage.js
src/pages/PreContratGenerationPage.js
src/pages/ContratGenerationNewPage.js
src/pages/FactureDetailsPage.js

# Hooks critiques
src/hooks/contrats/useContratActions.js
src/hooks/contrats/usePdfPreview.js
src/hooks/forms/useFormValidationData.js

# Services
src/services/brevoTemplateService.js
src/services/templateVariables.js

# CSS à migrer
src/styles/pages/concerts.css → dates.css
src/styles/components/concerts.css → dates.css
src/styles/base/colors.css (variables --tc-color-concert)
```

### Organization → Entreprise (15 fichiers)
```
# Pages
src/pages/PreContratFormResponsePage.js

# Composants debug
src/components/debug/BrevoKeyRecovery.js
src/components/debug/EntrepriseContextDiagnostic.js

# CSS
src/components/layout/Sidebar.module.css (.organizationSelector)
src/styles/pages/contacts.css (.tc-contact-organization)
```

## 🔵 PHASE 3 : Nettoyage des Routes et Imports

### Dans App.js
```javascript
// Supprimer ces imports
import LieuxPage from '@/pages/LieuxPage';
import FormResponsePage from '@/pages/FormResponsePage';
import PreContratFormResponsePage from '@/pages/PreContratFormResponsePage';

// Supprimer ces routes
<Route path="/preview/lieux" ...>
<Route path="/lieux/*" ...>
<Route path="/formulaire/:dateId/:token" ...>
<Route path="/pre-contrat/:dateId/:token" ...>
```

### Dans DesktopLayout.js
```javascript
// Déjà commenté, à supprimer définitivement :
// case '/lieux':
//   openLieuxListTab();
//   break;
```

### Dans TabManagerProduction.js
```javascript
// Vérifier et supprimer les références à :
// - LieuxList
// - LieuView
// - openLieuxListTab
```

## 🟢 PHASE 4 : Composants Debug à Évaluer (30+ fichiers)

### Outils de Migration (peuvent être supprimés après validation)
```
src/components/debug/BidirectionalRelationsFixer.js
src/components/debug/DataStructureFixer.js
src/components/debug/ParametresMigration.js
src/components/debug/MigrateContractTemplates.js
src/components/debug/MigrateContractVariables.js
src/components/debug/RelationalMigrationFixer.js
```

### Outils de Diagnostic (garder temporairement)
```
src/components/debug/ArtisteFirestoreDiagnostic.js
src/components/debug/BrevoDiagnostic.js
src/components/debug/DateLieuDebug.js
src/components/debug/EntrepriseContextDiagnostic.js
```

## ⚠️ PHASE 5 : Vérifications Avant Suppression

### Composants à Usage Limité
- **ContactFacturesTable.js** : Vérifier si vraiment nécessaire
- **ContactFestivalsTable.js** : Vérifier si vraiment nécessaire
- **ContactsListFiltered.js** : Utilisé uniquement dans TabManagerProduction
- **Modal.js** vs **OptimizedModal.js** : Consolider

### Collections Firebase
- **`lieux`** : Garder pour compatibilité (système hybride lieu/libellé)
- **`concerts`** : Peut être supprimée après migration complète
- **`organizations`** : Peut être supprimée après migration complète

## 📋 Commandes de Vérification

```bash
# Avant suppression, vérifier les imports
grep -r "LieuxPage" src/
grep -r "FormResponsePage" src/
grep -r "from.*lieux" src/
grep -r "import.*Lieu" src/

# Vérifier les références concert/organization
grep -r "concert" src/ --exclude-dir=node_modules --exclude-dir=.git | wc -l
grep -r "organization" src/ --exclude-dir=node_modules --exclude-dir=.git | wc -l

# Lister tous les CSS potentiellement orphelins
find src/ -name "*.css" -type f | xargs grep -L "import"
```

## 🎯 Ordre de Priorité

1. **Immédiat** : Phase 1 (CSS orphelins, pages obsolètes)
2. **Urgent** : Phase 2 (migration terminologie)
3. **Important** : Phase 3 (nettoyage routes)
4. **Secondaire** : Phase 4 (debug tools)
5. **À évaluer** : Phase 5 (composants peu utilisés)

## 📊 Impact Estimé

- **Réduction taille projet** : ~30-40%
- **Fichiers supprimés** : 200+
- **Lignes de code** : -10,000+
- **Amélioration performance** : Significative
- **Maintenabilité** : Grandement améliorée