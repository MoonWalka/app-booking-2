# Résolution du problème de boucle des relances automatiques

## Problème identifié

Les relances automatiques se créaient en boucle infinie, générant des centaines/milliers de relances identiques.

### Causes de la boucle

1. **Double déclenchement** :
   - `useConcertForm` déclenche les relances lors de la création/mise à jour d'un concert
   - `useConcertWatcher` écoute les changements et déclenche AUSSI les relances
   - Résultat : chaque modification déclenche 2x les relances

2. **Modification en cascade** :
   - Le service de relances modifie le concert (ajoute l'ID de relance dans `concert.relances`)
   - Cette modification déclenche `useConcertWatcher`
   - Qui déclenche à nouveau l'évaluation des relances
   - Etc...

3. **Absence de protection** :
   - Pas de vérification des doublons
   - Pas de délai minimum entre les évaluations
   - Pas de détection des mises à jour automatiques

## Solution implémentée

### 1. Protection dans le service (relancesAutomatiquesService.js)

```javascript
// Vérification si désactivé temporairement
if (areAutomaticRelancesDisabled(organizationId)) {
  return;
}

// Protection contre appels rapprochés (5 secondes minimum)
if (lastEvaluation && (now - lastEvaluation) < 5000) {
  return;
}

// Ignorer les mises à jour automatiques
if (concert._lastUpdateType === 'relance_auto_added') {
  return;
}
```

### 2. Outil de correction (RelancesAuditTool)

L'outil permet de :
- **Auditer** : Analyser les relances existantes et détecter les problèmes
- **Nettoyer** : Supprimer les doublons
- **Corriger** : Appliquer une correction complète du problème

### 3. Fonction de correction d'urgence (fixRelancesLoop)

Actions effectuées :
1. Désactive temporairement les relances automatiques (5 minutes)
2. Supprime tous les doublons
3. Marque les concerts comme traités pour éviter de nouvelles boucles

## Utilisation

### Pour les utilisateurs

1. Aller dans **Outils de debug** → **Audit Relances**
2. Cliquer sur **Lancer l'audit** pour analyser
3. Si problème détecté, cliquer sur **Corriger le problème de boucle**

### Pour les développeurs

```javascript
import { fixRelancesLoop } from '@/utils/fixRelancesLoop';

// Corriger pour une organisation
await fixRelancesLoop(organizationId);

// Vérifier si désactivé
if (areAutomaticRelancesDisabled(organizationId)) {
  // Les relances sont temporairement désactivées
}
```

## Prévention future

### 1. Architecture recommandée

- **Un seul point de déclenchement** : Éviter les déclenchements multiples
- **Protection dans le service** : Toujours vérifier les doublons et les appels rapprochés
- **Flags de mise à jour** : Utiliser `_lastUpdateType` pour identifier les mises à jour automatiques

### 2. Bonnes pratiques

- Ne pas modifier les entités depuis le service de relances
- Utiliser des relations séparées plutôt que d'ajouter des IDs dans l'entité principale
- Implémenter un système de queue pour les évaluations

### 3. Monitoring

- Surveiller régulièrement le nombre de relances créées
- Alerter si plus de X relances créées par minute
- Logger les évaluations pour détecter les patterns anormaux

## Tests

Pour tester la correction :
1. Créer un nouveau concert
2. Vérifier qu'une seule relance "Envoyer le formulaire" est créée
3. Modifier le concert
4. Vérifier qu'aucune relance dupliquée n'est créée
5. Attendre 5 secondes et modifier à nouveau
6. Vérifier que l'évaluation fonctionne normalement