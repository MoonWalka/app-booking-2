# Migration des données RIB - Janvier 2025

## Contexte

Les données RIB (IBAN, BIC, nom de la banque) étaient historiquement stockées dans les paramètres de facturation. Pour une meilleure cohérence, ces données doivent maintenant être stockées dans les informations d'entreprise.

## Problème résolu

- Les RIB n'apparaissaient pas sur les factures car le système cherchait les données dans `entreprise.iban/bic/banque` alors qu'elles étaient stockées dans `parametresFacture.iban/bic/nomBanque`

## Solution implémentée

### 1. Migration automatique

Une migration automatique s'exécute lors du chargement ou changement d'organisation :
- Vérifie si la migration a déjà été effectuée
- Copie les données RIB des paramètres de facturation vers les informations d'entreprise
- Marque la migration comme complétée pour éviter les doublons

### 2. Interface utilisateur

Les champs RIB sont maintenant disponibles dans :
- **Paramètres → Entreprise → Informations bancaires**
- Les utilisateurs peuvent modifier directement ces informations

### 3. Outil de débogage

Un outil de débogage est disponible dans **Outils de debug → Debug RIB** pour :
- Vérifier l'état actuel des données RIB
- Forcer une migration manuelle si nécessaire

## Instructions pour les développeurs

### Migration manuelle globale

Pour migrer toutes les organisations d'un coup :

```bash
# Mode test (voir ce qui sera migré)
npm run migrate:rib:test

# Migration réelle
npm run migrate:rib
```

### Réinitialiser une migration (pour tests)

```javascript
import { resetMigrationFlag } from '@/utils/autoMigrateRIB';
await resetMigrationFlag(entrepriseId);
```

## Détails techniques

### Mapping des données

| Ancien emplacement | Nouvel emplacement |
|-------------------|-------------------|
| `factureParameters.parameters.iban` | `entreprise.iban` |
| `factureParameters.parameters.bic` | `entreprise.bic` |
| `factureParameters.parameters.nomBanque` | `entreprise.banque` |

### Fichiers modifiés

- `/src/utils/autoMigrateRIB.js` - Logique de migration
- `/src/context/OrganizationContext.js` - Déclenchement automatique
- `/src/components/debug/RIBDebugger.js` - Outil de débogage
- `/src/utils/migrateRIBData.js` - Utilitaires de migration
- `/scripts/migrate-all-rib-data.js` - Script de migration globale

### Flag de migration

La migration crée un document dans `organizations/{orgId}/migrations/ribMigration` avec :
```json
{
  "completed": true,
  "completedAt": "2025-01-06T...",
  "version": "1.0"
}
```

## Résultat attendu

Après la migration :
1. Les RIB apparaissent correctement sur les factures
2. Les utilisateurs peuvent modifier les RIB dans Paramètres → Entreprise
3. Les nouvelles organisations n'ont pas besoin de migration