# Debug Page Détails Contrat - Données Manquantes

## Date : 28 décembre 2024

## Problèmes identifiés

### 1. Badge de statut redondant ✅ CORRIGÉ
- **Problème** : Badge "Généré" affiché dans le header ET dans la card d'information
- **Solution** : Suppression du badge dans `ContratHeader.js`
- **Fichier modifié** : `src/components/contrats/sections/ContratHeader.js`

### 2. Données manquantes dans la card d'information ❓ EN DIAGNOSTIC
- **Problème** : Programmateur, dates, montant, lieu ne s'affichent pas
- **Hypothèses** :
  - Les customQueries ne sont pas exécutées
  - Les données du concert ne sont pas récupérées
  - Les entités liées ne sont pas chargées

## Modifications apportées pour le diagnostic

### 1. Logs de debug ajoutés dans `useContratDetails.js`
- Trace l'exécution des customQueries pour programmateur, lieu, artiste
- Affiche les données du contrat récupéré
- Logs avec préfixe `[DEBUG]`

### 2. Logs de debug ajoutés dans `ContratInfoCard.js`
- Affiche toutes les props reçues par le composant
- Trace le calcul de chaque donnée (montant, date, lieu, programmateur)
- Logs avec préfixe `[DEBUG ContratInfoCard]`

### 3. Logs de debug ajoutés dans `ContratDetailsPage.js`
- Affiche les données récupérées par le hook `useContratDetails`
- Logs avec préfixe `[DEBUG ContratDetailsPage]`

### 4. Logs de debug ajoutés dans `useGenericEntityDetails.js`
- Trace l'exécution de `loadRelatedEntity`
- Affiche si les customQueries sont appelées
- Logs avec préfixe `[DEBUG loadRelatedEntity]`

### 5. Amélioration de l'affichage du programmateur
- Gestion du nom complet (prénom + nom)
- Gestion de la structure (structureCache.raisonSociale, structure.nom, etc.)
- Fallback sur les données du concert

## Comment diagnostiquer

### 1. Ouvrir la console du navigateur
- Ouvrir la page de détails d'un contrat
- Ouvrir les DevTools (F12)
- Aller dans l'onglet Console

### 2. Analyser les logs dans l'ordre
1. **`[DEBUG ContratDetailsPage]`** : Voir si les données sont récupérées par le hook principal
2. **`[DEBUG] Chargement [entité] pour contrat`** : Voir si les customQueries sont appelées
3. **`[DEBUG loadRelatedEntity]`** : Voir si le hook générique exécute les customQueries
4. **`[DEBUG ContratInfoCard]`** : Voir quelles données arrivent au composant d'affichage

### 3. Points de contrôle
- ✅ Le contrat est-il chargé ? (doit avoir un ID et des données de base)
- ✅ Les customQueries sont-elles définies ? (doit afficher les clés : programmateur, lieu, artiste)
- ✅ Les customQueries sont-elles appelées ? (logs avec les données du contrat)
- ✅ Le concert est-il récupéré ? (doit avoir concertId, titre, date, montant)
- ✅ Les entités liées sont-elles récupérées ? (programmateur, lieu, artiste)

## Corrections possibles selon le diagnostic

### Si le contrat n'est pas chargé
- Vérifier l'ID du contrat dans l'URL
- Vérifier que le contrat existe en base
- Vérifier les permissions Firestore

### Si les customQueries ne sont pas appelées
- Vérifier la configuration dans `useContratDetails.js`
- Vérifier que `autoLoadRelated` est activé
- Vérifier que le hook générique reçoit bien les customQueries

### Si le concert n'est pas récupéré
- Vérifier que le contrat a un `concertId`
- Vérifier que le concert existe en base
- Vérifier la customQuery standard pour le concert

### Si les entités liées ne sont pas récupérées
- Vérifier que le concert a bien les IDs des entités liées (programmateurId, lieuId, artisteId)
- Vérifier que ces entités existent en base
- Vérifier les customQueries spécifiques

## Prochaines étapes après diagnostic

1. **Analyser les logs** pour identifier le point de rupture
2. **Corriger le problème identifié** (configuration, données manquantes, etc.)
3. **Supprimer les logs de debug** une fois le problème résolu
4. **Tester sur plusieurs contrats** pour s'assurer de la robustesse

## Commandes utiles

```bash
# Voir les logs en temps réel dans la console
# Filtrer par [DEBUG] pour ne voir que nos logs

# Tester avec différents contrats
# http://localhost:3001/contrats/[ID_CONTRAT]

# Vérifier la base de données Firestore
# Collections : contrats, concerts, programmateurs, lieux, artistes
```

## Notes importantes

- Les logs sont temporaires et doivent être supprimés après diagnostic
- Tester avec plusieurs contrats pour identifier si le problème est spécifique
- Vérifier que les données existent bien en base de données Firestore
- S'assurer que les permissions Firestore permettent la lecture des collections liées 