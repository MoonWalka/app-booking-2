# Audit des Fichiers Obsolètes - Branche nouvelle-interface
**Date : 9 juillet 2025**

## Contexte
Cet audit identifie les fichiers présents dans la branche `nouvelle-interface` qui sont potentiellement obsolètes ou qui utilisent l'ancien système. L'analyse compare les fichiers entre `main` et `nouvelle-interface` et vérifie leurs dépendances.

## 1. Fichiers Supprimés (Paramètres)

### Dossier complet supprimé : `src/components/parametres/`
Les fichiers suivants ont été complètement supprimés mais sont encore référencés :

- `ParametresApparence.js` et `.module.css`
- `ParametresEmail.js` et test associé
- `ParametresEntreprises.js` et `.module.css`
- `ParametresExport.js` et `.module.css`
- `ParametresFactures.js` et `.module.css`
- `ParametresGeneraux.js` et `.module.css`
- `ParametresNotifications.js` et `.module.css`
- `sync/SyncManager.js` et `.module.css`
- Tous les sous-dossiers `sections/`

**Références restantes à nettoyer :**
- `src/__tests__/integration/brevoEmailIntegration.test.js` : importe encore `ParametresEmail`
- `src/pages/ParametresPage.js` : page supprimée

## 2. Composants Non Utilisés

### Dans `src/components/dates/`
- **`DatesList.js` et `DatesList.module.css`** : Non importés nulle part
- **`DateDetailsWithRoles.js`** : Référence circulaire (s'importe lui-même)
- **`DateInfoSection.js`** (racine) : Remplacé par `sections/DateInfoSection.js`

### Dans `src/components/contacts/`
- **`ContactsList.js`** : Seulement importé dans les tests
- **`ContactsListFiltered.js`** : Utilisé uniquement dans TabManagerProduction
- **`ContactFacturesTable.js`** : Usage très limité
- **`ContactFestivalsTable.js`** : Usage très limité

### Modals peu utilisés
- **`Modal.js`** : Seulement 2 usages (TachesPage, HistoriqueEchanges)
- **`OptimizedModal.js`** : Seulement dans ModalContext
- **`ContactModalsContainer.js`** : Seulement dans DesktopLayout

## 3. Fichiers CSS Orphelins

### CSS totalement inutilisés
```
src/components/common/EnvironmentBanner.css
src/components/common/ui/Card.css
src/components/contrats/editor-modal.css
src/styles/base/colors-harmonized.css
src/styles/base/typography.css
src/styles/components/alerts.css
src/styles/components/concerts-mobile.css
src/styles/components/concerts.css
src/styles/components/contrat-editor.css
src/styles/components/contrat-print.css
src/styles/components/lists.css
src/styles/components/structure-card.css
src/styles/components/tc-utilities.css
src/styles/formPublic.css
src/styles/layout.css
src/styles/mixins/breakpoints.css
src/styles/pages/formPublic.css
```

## 4. Références à l'Ancien Système

### Terminologie "concert" → "date"
- **157 fichiers** contiennent encore des références à "concert"
- Principalement dans : hooks, services, styles CSS, composants de debug

### Terminologie "organisation" → "entreprise"
- **20+ fichiers** utilisent encore "organisation"
- Principalement dans : hooks de data fetching, templates, debug

## 5. Fichiers de Debug/Test Non Essentiels

### Dossier `src/components/debug/`
Nombreux fichiers de migration et diagnostic qui pourraient être supprimés après validation :
- `BidirectionalRelationsFixer.js`
- `DataStructureFixer.js`
- `ParametresMigration.js`
- `MigrateContractTemplates.js`
- `RelationalMigrationFixer.js`
- Etc.

### Scripts de backup
- Tout le dossier `backup-organizationId-20250708_212609/`
- Fichiers de migration : `migrate-concert-to-date-complete.sh`

## 6. Recommandations

### À supprimer immédiatement
1. Les fichiers CSS orphelins listés en section 3
2. `DatesList.js` et `DatesList.module.css`
3. `DateDetailsWithRoles.js` et son hook
4. `DateInfoSection.js` (racine)
5. Le dossier de backup `backup-organizationId-20250708_212609/`

### À évaluer pour suppression
1. Composants contacts peu utilisés (ContactFacturesTable, ContactFestivalsTable)
2. Modals peu utilisés (Modal.js vs OptimizedModal.js)
3. Fichiers de debug une fois les migrations validées

### À migrer progressivement
1. Références "concert" → "date" dans tout le code
2. Références "organisation" → "entreprise"
3. Mise à jour des tests qui référencent les anciens composants

### À documenter
1. Pourquoi certains composants ont été gardés malgré leur faible utilisation
2. Plan de migration pour la terminologie
3. Stratégie de consolidation des modals

## Conclusion

La branche `nouvelle-interface` contient environ **200+ fichiers potentiellement obsolètes**, dont une grande partie sont des fichiers de style CSS non utilisés et des composants de l'ancien système de paramètres. Une action de nettoyage permettrait de réduire significativement la taille du projet et d'améliorer sa maintenabilité.

**Prochaines étapes recommandées :**
1. Supprimer les fichiers clairement identifiés comme obsolètes
2. Créer un plan de migration pour la terminologie
3. Consolider les composants similaires (modals, listes)
4. Nettoyer les fichiers de debug/migration après validation