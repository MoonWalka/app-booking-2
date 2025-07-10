# 🧹 Plan de Nettoyage de l'Ancien Système
**Date : 10 juillet 2025**

## 📋 Analyse des Fichiers à Nettoyer

### 🔴 Fichiers OBSOLÈTES à supprimer

#### 1. Pages Lieux (non accessibles via le menu)
- `/pages/LieuxPage.js`
- Routes dans App.js :
  - `<Route path="/preview/lieux">`
  - `<Route path="/lieux/*">`
- Import dans App.js : `import LieuxPage`

#### 2. Formulaires publics obsolètes
- `/pages/FormResponsePage.js` (marqué `usedInNewVersion: false`)
- `/pages/PreContratFormResponsePage.js` (marqué `usedInNewVersion: false`)
- Routes associées :
  - `<Route path="/formulaire/:dateId/:token">`
  - `<Route path="/pre-contrat/:dateId/:token">`

#### 3. Composants UI lieux (si plus utilisés)
À vérifier avant suppression :
- `/components/lieux/desktop/LieuView.js`
- `/components/lieux/desktop/LieuxList.js`
- `/components/lieux/mobile/LieuView.js`
- `/components/lieux/mobile/LieuMobileForm.js`

#### 4. CSS associés
- `/styles/pages/lieux.css`
- Tous les `.module.css` dans `/components/lieux/`

### 🟡 Fichiers à CONSERVER (système hybride)

#### 1. Pour la compatibilité lieu/libellé
- `/components/dates/sections/LieuSearchSection.js` ✅
- `/hooks/lieux/useLieuSearch.js` (utilisé par les dates)
- Collection Firebase `lieux` (pour les dates existantes)

#### 2. Services encore utilisés
- Les parties du `searchService.js` qui cherchent dans 'lieux'
- Les hooks de recherche de lieux utilisés par les dates

### 🟢 Fichiers déjà migrés vers le nouveau système
- `/pages/SallesPage.js` ✅ (remplace LieuxPage pour les salles)
- `/pages/FestivalsDatesPage.js` ✅ (pour les festivals)
- Collection Firebase `salles` ✅

## 🎯 Plan de Nettoyage Progressif

### Phase 1 : Nettoyage immédiat (sans risque)
1. **Supprimer les routes obsolètes** dans App.js
   - Routes `/preview/lieux` et `/lieux/*`
   - Imports associés

2. **Supprimer les pages formulaires obsolètes**
   - FormResponsePage.js et PreContratFormResponsePage.js
   - Leurs routes et imports

3. **Nettoyer DesktopLayout.js**
   - Retirer `openLieuxListTab` du switch (ligne 107-109)
   - Retirer l'import si présent

### Phase 2 : Analyse approfondie
1. **Vérifier les dépendances** des composants lieux
   - Qui importe LieuView, LieuxList, etc. ?
   - Sont-ils vraiment utilisés ?

2. **Vérifier TabManagerProduction.js**
   - Retirer les imports et cases pour lieux

### Phase 3 : Migration des données (si nécessaire)
1. **Option A : Garder le système hybride**
   - Conserver la collection `lieux` pour compatibilité
   - Les nouvelles dates utilisent lieuNom (libellé)

2. **Option B : Migration complète**
   - Migrer les lieux existants vers salles/festivals
   - Mettre à jour tous les lieuId dans les dates

## ⚠️ Points d'Attention

1. **ContratGenerationNewPage** utilise encore `lieuId`
   - À mettre à jour pour utiliser le système hybride

2. **Les dates existantes** ont des `lieuId`
   - Ne pas casser les références existantes

3. **searchService.js** cherche dans 'lieux'
   - À adapter selon la stratégie choisie

## 📝 Commandes de Nettoyage

```bash
# 1. Rechercher toutes les références à supprimer
grep -r "LieuxPage" src/
grep -r "FormResponsePage" src/
grep -r "openLieuxListTab" src/

# 2. Vérifier les imports avant suppression
grep -r "from.*lieux" src/
grep -r "import.*Lieu" src/

# 3. Nettoyer les CSS inutilisés
find src/components/lieux -name "*.css" -type f
```

## ✅ Checklist de Nettoyage

### Phase 1 - Effectué (10 juillet 2025)
- [x] Commenter routes lieux dans App.js (lignes 249-256, 323-328)
- [x] Commenter imports LieuxPage (ligne 19)
- [x] Commenter FormResponsePage et routes (lignes 191-193)
- [x] Commenter PreContratFormResponsePage et routes (lignes 191-193)
- [x] Commenter imports FormResponsePage et PreContratFormResponsePage (lignes 24-25)
- [x] Nettoyer DesktopLayout (openLieuxListTab) (lignes 107-110)

### Phase 2 - À faire
- [ ] Nettoyer TabManagerProduction
- [ ] Supprimer les fichiers physiques une fois confirmé
- [ ] Supprimer CSS lieux obsolètes
- [ ] Mettre à jour la documentation