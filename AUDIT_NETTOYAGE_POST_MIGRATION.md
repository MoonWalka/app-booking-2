# AUDIT DE NETTOYAGE POST-MIGRATION PROGRAMMATEUR→CONTACT

## 📋 RÉSUMÉ EXÉCUTIF

**Date:** 05/06/2025
**Objectif:** Identifier et nettoyer les éléments obsolètes après la migration programmateur→contact

### 🎯 STATISTIQUES GÉNÉRALES
- **Fichiers programmateurs:** 10
- **Dossiers programmateurs:** 2
- **Doublons contacts:** 3 types
- **Fichiers debug/temporaires:** 22
- **Références programmateur:** 20
- **Variables obsolètes:** 6
- **Imports obsolètes:** 2

## 🗂️ SECTION 1: FICHIERS PROGRAMMATEURS À SUPPRIMER

### 📁 Fichiers avec "programmateur" dans le nom
- `./src/components/lieux/desktop/sections/LieuProgrammateurSection.module.css`
- `./src/components/lieux/desktop/sections/LieuProgrammateurSection.js`
- `./src/components/programmateurs/desktop/ProgrammateurFormMaquette.js`
- `./src/components/programmateurs/desktop/ProgrammateurFormMaquette.module.css`
- `./src/components/programmateurs/desktop/sections/ProgrammateurContactSection.js`
- `./src/components/programmateurs/desktop/sections/ProgrammateurHeader.js`
- `./src/components/debug/ProgrammateurReferencesDebug.js`
- `./src/components/debug/ProgrammateurMigrationButton.jsx`
- `./src/hooks/programmateurs/useProgrammateurForm.js`
- `./src/hooks/__tests__/useProgrammateurDetails.test.js`

### 📂 Dossiers programmateurs à supprimer
- `./src/components/programmateurs`
- `./src/hooks/programmateurs`

## 🔄 SECTION 2: DOUBLONS CONTACTS À ANALYSER

### ContactDetails
- `./src/components/contacts/ContactDetailsModern.js`
- `./src/components/contacts/mobile/ContactDetails.js`
- `./src/components/contacts/ContactDetails.js`
- `./src/hooks/contacts/useContactDetailsModern.js`
- `./src/hooks/contacts/useContactDetails.js`
**Action:** Vérifier quelle version est utilisée

### ContactView
- `./src/components/contacts/desktop/ContactViewModern.js`
- `./src/components/contacts/desktop/ContactViewV2.js`
- `./src/components/contacts/desktop/ContactView.js`
- `./src/components/contacts/mobile/ContactView.js`
**Action:** Vérifier quelle version est utilisée

### ContactForm
- `./src/components/forms/PublicContactForm.js`
- `./src/components/contacts/sections/ContactFormHeader.js`
- `./src/components/contacts/sections/ContactFormActions.js`
- `./src/components/contacts/desktop/ContactFormMaquette.js`
- `./src/components/contacts/desktop/ContactForm.js`
- `./src/components/contacts/mobile/ContactForm.js`
- `./src/components/contacts/ContactForm.js`
- `./src/hooks/contacts/useContactForm.js`
**Action:** Vérifier quelle version est utilisée


## 🧹 SECTION 3: FICHIERS DEBUG/TEMPORAIRES

- `./src/utils/diagnostic/debugDashboard.js`
- `./src/utils/test-helpers.js`
- `./src/utils/testMapFix.js`
- `./src/utils/debug`
- `./src/styles/base/colors-original-backup-20250531-151010.css`
- `./src/components/TestArtistesList.js`
- `./src/components/contacts/ContactsDebug.jsx`
- `./src/components/contrats/desktop/sections/ContratDebugPanel.module.css`
- `./src/components/contrats/desktop/sections/ContratDebugPanel.js`
- `./src/components/debug.js`
- `./src/components/debug`
- `./src/components/debug/UnifiedDebugDashboard.jsx`
- `./src/components/debug/ProgrammateurReferencesDebug.js`
- `./src/components/debug/TestNavigationButton.js`
- `./src/components/debug/AuthDebug.js`
- `./src/components/debug/ContactMigrationDebug.jsx`
- `./src/components/debug/LieuxMapDebug.js`
- `./src/components/debug/RefactoringTestButton.js`
- `./src/components/debug/LeafletMapTest.js`
- `./src/components/debug/StructuresAuditDebug.js`
- `./src/components/debug/StructureVariableTest.js`
- `./src/components/debug/ContactAssociationsDebug.jsx`

## 🔍 SECTION 4: RÉFÉRENCES "programmateur" DANS LE CODE

```
./src/styles/base/colors-harmonized.css:    --tc-color-contact: hsl(282, 36%, 45%);  /* #9162b1 - Violet programmateur */
```

```
./src/styles/base/colors-original-backup-20250531-151010.css:    --tc-color-programmateur: #6f42c1;     /* Violet programmateurs */
```

```
./src/styles/base/colors-original-backup-20250531-151010.css:    --tc-color-programmateur-light: #f0e6fa; /* Variante claire */
```

```
./src/styles/base/colors-original-backup-20250531-151010.css:    --tc-color-programmateur: #a855f7;     /* Violet programmateurs plus clair */
```

```
./src/styles/base/colors-original-backup-20250531-151010.css:    --tc-color-programmateur-light: #2d1b3d; /* Variante sombre */
```

```
./src/components/concerts/sections/ConcertActions.module.css:/* Bouton désactivé (pas de programmateur) */
```

```
./src/components/concerts/sections/ConcertActions.module.css:/* Bouton désactivé (pas de programmateur) */
```

```
./src/components/concerts/sections/ConcertsTable.module.css: * Harmonisation du tableau concerts avec les autres listes (programmateurs, lieux)
```

```
./src/components/concerts/sections/ContactSearchSection.module.css:/* Styles pour la liste des programmateurs */
```

```
./src/components/concerts/desktop/ConcertForm.module.css:/* Wrapper pour l'ensemble de la page - comme programmateur */
```

```
./src/components/concerts/desktop/ConcertForm.module.css:/* Container principal - comme programmateur */
```

```
./src/components/concerts/desktop/ConcertForm.module.css:.cardHeader.programmateur i {
```

```
./src/components/concerts/desktop/ConcertForm.module.css:/* Recherche de lieu/programmateur/artiste améliorée */
```

```
./src/components/concerts/desktop/ConcertForm.module.css:.programmateurSearchContainer,
```

```
./src/components/concerts/desktop/ConcertForm.module.css:.programmateurCard,
```

```
./src/components/concerts/desktop/ConcertForm.module.css:.programmateurInfo,
```

```
./src/components/concerts/desktop/ConcertForm.module.css:.programmateurName,
```

```
./src/components/concerts/desktop/ConcertForm.module.css:.programmateurStructure {
```

```
./src/components/concerts/desktop/ConcertForm.module.css:.programmateurContacts {
```

```
./src/components/concerts/desktop/ConcertForm.module.css:.programmateurContactItem {
```

## 📦 SECTION 5: VARIABLES OBSOLÈTES

```
./src/hooks/lieux/useLieuDetails.js:        programmateursAssocies: lieuData.programmateursAssocies,
```

```
./src/hooks/lieux/useLieuDetails.js:        // Méthode 2: programmateursAssocies array (compatibilité ancienne)
```

```
./src/hooks/lieux/useLieuDetails.js:        if (lieuData.programmateursAssocies && Array.isArray(lieuData.programmateursAssocies) && lieuData.programmateursAssocies.length > 0) {
```

```
./src/hooks/lieux/useLieuDetails.js:          const premierContactId = lieuData.programmateursAssocies[0];
```

```
./src/hooks/lieux/useLieuDetails.js:              console.log('[useLieuDetails] ✅ Contact trouvé via programmateursAssocies:', contact);
```

```
./src/hooks/lieux/useLieuDetails.js:      alternativeIdFields: ['programmateursAssocies'], // Champs alternatifs pour compatibilité
```

## 📥 SECTION 6: IMPORTS OBSOLÈTES

**./src/pages/ContactsPage.js:4**
```javascript
import ContactViewModern from '@/components/contacts/desktop/ContactViewModern';
```

**./src/pages/ContactsPage.js:14**
```javascript
<Route path="/:id" element={<ContactViewModern />} />
```

## 🚀 PLAN D'ACTION RECOMMANDÉ

### Phase 1: Suppression sécurisée des fichiers programmateurs
```bash
# 1. Supprimer les dossiers programmateurs
rm -rf "./src/components/programmateurs"
rm -rf "./src/hooks/programmateurs"

# 2. Supprimer les fichiers programmateurs isolés
rm "./src/components/lieux/desktop/sections/LieuProgrammateurSection.module.css"
rm "./src/components/lieux/desktop/sections/LieuProgrammateurSection.js"
rm "./src/components/debug/ProgrammateurReferencesDebug.js"
rm "./src/components/debug/ProgrammateurMigrationButton.jsx"
rm "./src/hooks/__tests__/useProgrammateurDetails.test.js"
```

### Phase 2: Mise à jour des imports
- Mettre à jour les imports dans les fichiers suivants:
  - ./src/pages/ContactsPage.js
  - ./src/pages/ContactsPage.js

### Phase 3: Nettoyage des variables obsolètes
- Remplacer programmateursAssocies par contactsAssocies dans les fichiers identifiés

### Phase 4: Résolution des doublons
- Analyser et consolider ContactDetails
- Analyser et consolider ContactView
- Analyser et consolider ContactForm

### Phase 5: Nettoyage des fichiers debug
- Supprimer les fichiers debug/temporaires après vérification

## ⚠️ AVERTISSEMENTS

1. **Toujours faire un backup avant suppression**
2. **Tester l'application après chaque phase**
3. **Vérifier les tests unitaires**
4. **Vérifier que les imports mis à jour pointent vers les bons composants**

## 📊 ESTIMATION

- **Temps estimé:** 2-3 heures
- **Risque:** Faible (si suivi méthodiquement)
- **Impact:** Amélioration significative de la propreté du code

---
*Rapport généré automatiquement le 05/06/2025 04:50:49*
