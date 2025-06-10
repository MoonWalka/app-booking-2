# Guide : Relances automatiques sans boucles

## Vue d'ensemble

Les relances automatiques permettent de créer automatiquement des tâches de suivi pour les concerts. Cependant, mal configurées, elles peuvent créer des boucles infinies.

## Configuration recommandée

### 1. **Désactiver le watcher**

Dans `/src/config/relancesAutomatiquesConfig.js` :
```javascript
watcherEnabled: false, // IMPORTANT: Évite le double déclenchement
triggerStrategy: 'form-only' // Déclenche uniquement depuis les formulaires
```

### 2. **Paramètres de sécurité**

- **Cooldown** : 30 secondes minimum entre deux évaluations
- **Maximum** : 10 relances par concert
- **Pas de modification du concert** : Les relances ne modifient plus le concert

## Problèmes résolus

### ❌ Ancien fonctionnement (problématique)

1. Création/modification d'un concert → Évaluation des relances
2. Création de relance → Modification du concert (ajout ID relance)
3. Modification détectée par le watcher → Nouvelle évaluation
4. Boucle infinie !

### ✅ Nouveau fonctionnement

1. Création/modification d'un concert → Évaluation des relances
2. Création de relance → PAS de modification du concert
3. Watcher désactivé → Pas de réévaluation automatique
4. Pas de boucle !

## Points de déclenchement

Les relances sont évaluées uniquement dans ces cas :

1. **Création d'un concert** (`useConcertForm`)
2. **Modification manuelle d'un concert** (`useConcertForm`)
3. **Validation d'un formulaire public**
4. **Génération/envoi de contrat**

## Configuration dans l'interface

Aller dans **Paramètres** → **Relances automatiques** pour :
- Activer/désactiver globalement
- Choisir la stratégie de déclenchement
- Ajuster les délais
- Définir les limites

## Surveillance et débogage

### Outils disponibles

1. **Audit des relances** : `/debug-tools` → "Audit Relances"
2. **Logs détaillés** : Activer `debugMode` dans la config
3. **Correction d'urgence** : Bouton "Corriger le problème de boucle"

### Indicateurs de problème

- Plus de 50 relances créées en 1 heure
- Relances identiques créées rapidement
- Performance dégradée de l'application

## Bonnes pratiques

1. **Ne jamais** activer watcher ET formulaire en même temps
2. **Toujours** avoir un cooldown d'au moins 30 secondes
3. **Limiter** à 10-20 relances maximum par concert
4. **Surveiller** régulièrement avec l'outil d'audit

## En cas de problème

1. Aller dans l'outil d'audit
2. Cliquer "Corriger le problème de boucle"
3. Vérifier la configuration
4. Redémarrer l'application si nécessaire

## Code à éviter

```javascript
// ❌ NE PAS FAIRE
await updateDoc(concertRef, {
  relances: [...relances, newRelanceId] // Modifie le concert
});

// ✅ FAIRE
// Les relances ont déjà concertId, pas besoin de modifier le concert
```

## Migration des anciennes données

Les concerts existants peuvent avoir un tableau `relances`. Ce n'est plus utilisé mais reste pour la compatibilité. Les nouvelles relances utilisent uniquement le champ `concertId` dans la collection `relances`.