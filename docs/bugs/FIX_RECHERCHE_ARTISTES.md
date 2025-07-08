# Correction du problème de recherche d'artistes

## Problème

La fonction de recherche d'artistes dans le formulaire d'édition de concert ne fonctionne pas. Les utilisateurs ne peuvent pas trouver les artistes existants et créent des doublons.

## Cause

Le système de recherche multi-organisation filtre les résultats par `entrepriseId`. Si les artistes n'ont pas ce champ ou s'il ne correspond pas à l'organisation actuelle, ils ne seront pas trouvés.

## Diagnostic

### 1. Utiliser l'outil de debug

1. Allez dans `/debug`
2. Cliquez sur l'onglet "Debug Recherche Artistes"
3. Tapez le nom d'un artiste existant
4. Observez les résultats et les messages d'erreur

### 2. Exécuter le script de diagnostic

```bash
# Analyser la structure des artistes
node scripts/fix-artistes-search.js

# Voir les détails des premiers artistes
node scripts/fix-artistes-search.js | head -50
```

## Solutions

### Solution 1 : Ajouter entrepriseId aux artistes existants

Si vos artistes n'ont pas d'entrepriseId :

```bash
# Remplacez YOUR_ORG_ID par votre ID d'organisation
node scripts/fix-artistes-search.js --fix --org=YOUR_ORG_ID
```

Pour trouver votre organization ID :
1. Connectez-vous à l'application
2. Ouvrez la console du navigateur
3. Tapez : `JSON.parse(localStorage.getItem('currentOrganization')).id`

### Solution 2 : Fusionner les doublons

Le script détecte automatiquement les doublons et propose des recommandations. Pour les fusionner manuellement :

1. Identifiez l'artiste principal (le plus ancien avec le plus de données)
2. Mettez à jour tous les concerts pour pointer vers cet artiste
3. Supprimez les doublons

### Solution 3 : Vérifier la structure des données

Les artistes doivent avoir cette structure minimale :

```javascript
{
  nom: "Nom de l'artiste",
  entrepriseId: "ID_DE_VOTRE_ORGANISATION",
  createdAt: Timestamp,
  // Optionnel mais recommandé :
  style: "Genre musical",
  description: "Description"
}
```

## Prévention

### 1. Lors de la création d'artistes

Assurez-vous que le hook `useArtisteForm` ajoute bien l'entrepriseId :

```javascript
const newArtiste = {
  ...formData,
  entrepriseId: currentOrganization.id, // Important !
  createdAt: serverTimestamp()
};
```

### 2. Validation des données

Ajoutez une validation dans le formulaire pour s'assurer que les champs requis sont présents.

### 3. Migration automatique

Pour les nouvelles installations, exécutez le script de migration lors du setup initial.

## Vérification

Après correction, testez la recherche :

1. Éditez un concert
2. Dans le champ artiste, tapez les premières lettres
3. Les artistes existants doivent apparaître dans la liste
4. Sélectionnez un artiste existant au lieu d'en créer un nouveau

## Scripts utiles

```bash
# Voir tous les artistes sans entrepriseId
node scripts/fix-artistes-search.js | grep "Sans entrepriseId" -A 20

# Compter les doublons
node scripts/fix-artistes-search.js | grep "Doublons détectés"

# Appliquer la correction à tous les artistes
node scripts/fix-artistes-search.js --fix --org=YOUR_ORG_ID
```