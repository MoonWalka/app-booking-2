# Instructions pour la Migration Firebase concerts → dates

## Option 1: Migration via le navigateur (Recommandée)

### 1. Préparation
- **IMPORTANT**: Faites un backup complet de votre base de données Firebase
- Connectez-vous à votre application TourCraft

### 2. Exécution du test (DRY RUN)
1. Ouvrez la console du navigateur (F12)
2. Copiez tout le contenu du fichier `src/scripts/migration-concerts-dates-browser.js`
3. Collez-le dans la console et appuyez sur Entrée
4. Exécutez la commande : `executeMigration()`
5. Vérifiez le rapport affiché (aucune modification n'est faite)

### 3. Migration réelle
1. Dans le script, changez `const DRY_RUN = true;` en `const DRY_RUN = false;`
2. Recollez le script modifié dans la console
3. Exécutez : `executeMigration()`
4. Confirmez quand demandé
5. Attendez la fin de la migration

## Option 2: Migration via Node.js (Si vous avez les credentials admin)

### 1. Configuration
Placez votre fichier `serviceAccountKey.json` dans le dossier `config/` à la racine du projet

### 2. Installation des dépendances
```bash
npm install firebase-admin
```

### 3. Exécution
```bash
# Test (dry run)
node scripts/firebase-migrate-concerts-to-dates.js --dry-run

# Migration réelle
node scripts/firebase-migrate-concerts-to-dates.js
```

## Après la migration

### 1. Vérifications essentielles
- [ ] Tester la création d'une nouvelle date
- [ ] Vérifier l'affichage de la liste des dates
- [ ] Tester la génération d'un contrat
- [ ] Vérifier les associations (artistes, lieux, contacts)

### 2. Règles de sécurité Firebase
Mettez à jour vos règles dans la console Firebase :

```javascript
// Remplacer
match /concerts/{concertId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && hasOrganizationAccess();
}

// Par
match /dates/{dateId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && hasOrganizationAccess();
}
```

### 3. Nettoyage (après validation complète)
- Supprimer l'ancienne collection "concerts" dans Firebase
- Supprimer les scripts de migration

## En cas de problème

1. Les données originales sont toujours dans la collection "concerts"
2. Contactez le support technique
3. Les documents migrés ont un champ `_migratedFrom: 'concerts'` pour les identifier

## Statistiques attendues

La migration devrait traiter :
- Collection `concerts` → `dates`
- Champs `concertsIds` → `datesIds` dans artistes, lieux, structures, contacts
- Champs `concertsAssocies` → `datesAssociees` dans artistes et lieux