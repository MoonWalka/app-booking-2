# Guide de Migration - Ajout d'organizationId aux Documents Existants

## Contexte

Les résultats du test d'isolation multi-organisation montrent que certains documents n'ont pas d'`organizationId`. Ces documents ont été créés **avant** l'implémentation du système multi-organisation et doivent être migrés.

## État Actuel (Exemple)

```
Score de Sécurité: 46%
- Documents totaux: 13
- Documents de l'organisation: 6
- Documents exposés: 7
- Sans organizationId: 7

Collections affectées:
- contacts: 4 documents sans organizationId
- artistes: 1 document sans organizationId
- lieux: 2 documents sans organizationId
```

## Solution : Script de Migration

Un script de migration a été créé pour ajouter l'`organizationId` aux documents existants.

### 1. Installation des Dépendances

```bash
cd scripts
npm install firebase-admin
```

### 2. Configuration Firebase Admin

Assurez-vous d'avoir le fichier de clé de service Firebase Admin :
- `app-booking-26571-firebase-adminsdk.json`

Ce fichier doit être placé à la racine du projet (niveau parent du dossier `code`).

### 3. Utilisation du Script

#### Étape 1 : Analyser l'état actuel

```bash
node scripts/migrate-missing-organizationid.js
```

Cette commande va :
- Lister tous les documents sans organizationId
- Afficher les organisations disponibles
- Donner les instructions d'utilisation

#### Étape 2 : Lancer la migration

```bash
node scripts/migrate-missing-organizationid.js tTvA6fzQpi6u3kx8wZO8
```

Remplacez `tTvA6fzQpi6u3kx8wZO8` par l'ID de votre organisation.

Le script va :
1. Faire un aperçu (dry run) des documents à migrer
2. Demander confirmation
3. Migrer les documents vers l'organisation spécifiée

### 4. Vérification

Après la migration, relancez le test d'isolation dans le Debug Dashboard :
1. Ouvrir le Dashboard de Debug
2. Aller dans l'onglet "🔒 Multi-Org"
3. Cliquer sur "🔒 Lancer le test d'isolation"

Vous devriez maintenant voir un score de sécurité de **100%**.

## Alternative : Migration Manuelle

Si vous préférez migrer manuellement via la console Firebase :

### Pour chaque collection affectée :

1. Aller dans Firestore Console
2. Sélectionner la collection (ex: `contacts`)
3. Pour chaque document sans organizationId :
   - Cliquer sur le document
   - Ajouter le champ : `organizationId: "tTvA6fzQpi6u3kx8wZO8"`
   - Sauvegarder

## Bonnes Pratiques Post-Migration

1. **Vérifier régulièrement** avec le test d'isolation
2. **Former l'équipe** sur l'importance de l'organizationId
3. **Documenter** quelle organisation possède quelles données
4. **Sauvegarder** avant toute migration importante

## Support

En cas de problème :
1. Vérifier les logs du script
2. S'assurer que l'organisation existe bien
3. Vérifier les permissions Firebase Admin
4. Contacter l'équipe technique si nécessaire