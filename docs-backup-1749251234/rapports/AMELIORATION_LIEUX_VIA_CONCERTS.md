# Amélioration : Récupération des lieux associés via les concerts

## Date : 06/01/2025

## Contexte

Le hook `useContactDetails` récupérait les lieux associés à un contact de deux façons :
1. Via les références directes (`lieuxIds` ou `lieuxAssocies`) dans le document contact
2. Via une recherche inverse (lieux qui ont ce contact dans leur champ `contacts` ou `contactId`)

Cependant, il manquait une troisième méthode importante : **récupérer les lieux via les concerts du contact**.

## Problème identifié

Un contact peut organiser des concerts dans différents lieux sans que ces lieux soient directement associés au contact. Cette relation indirecte (Contact → Concerts → Lieux) n'était pas exploitée, ce qui pouvait conduire à une vue incomplète des lieux associés à un contact.

## Solution implémentée

### Modification du hook `useContactDetails`

Ajout d'une troisième méthode de récupération des lieux dans la fonction `fetchLieuxAssocies` :

```javascript
// Méthode 3: Récupérer les lieux via les concerts du contact
if (concerts.length > 0) {
  const lieuxDesConcerts = [];
  
  // Parcourir tous les concerts pour récupérer leurs lieux
  for (const concert of concerts) {
    if (concert.lieuId) {
      lieuxDesConcerts.push(concert.lieuId);
    }
  }
  
  // Supprimer les doublons
  const uniqueLieuxIds = [...new Set(lieuxDesConcerts)];
  
  // Charger les lieux qui ne sont pas déjà dans la liste
  for (const lieuId of uniqueLieuxIds) {
    const existingLieu = lieuxLoaded.find(l => l.id === lieuId);
    if (!existingLieu) {
      const lieuDoc = await getDoc(doc(db, 'lieux', lieuId));
      if (lieuDoc.exists()) {
        const lieuData = { id: lieuDoc.id, ...lieuDoc.data() };
        lieuxLoaded.push(lieuData);
      }
    }
  }
}
```

### Points techniques importants

1. **Éviter les doublons** : Vérification que le lieu n'est pas déjà dans la liste avant de l'ajouter
2. **Gestion asynchrone** : Chargement des détails de chaque lieu trouvé
3. **Dépendance sur les concerts** : Ajout de `concerts` dans les dépendances du `useEffect`
4. **Variable de scope** : Déclaration de `lieuxLoaded` au niveau supérieur pour éviter les erreurs de référence

## Bénéfices

1. **Vue complète** : Les utilisateurs voient maintenant tous les lieux associés à un contact, y compris ceux liés indirectement via les concerts
2. **Cohérence** : Cette logique existait déjà dans `useStructureDetails` et est maintenant harmonisée
3. **Expérience utilisateur** : Meilleure compréhension des relations entre les entités

## Impact sur l'interface

L'interface n'a pas besoin d'être modifiée. Le composant `ContactView` affiche déjà la section "Lieux associés" qui bénéficiera automatiquement de cette amélioration.

## Tests recommandés

1. Créer un contact sans lieux directement associés
2. Créer des concerts pour ce contact dans différents lieux
3. Vérifier que ces lieux apparaissent bien dans la section "Lieux associés" du contact

## Fichiers modifiés

- `/src/hooks/contacts/useContactDetails.js` : Ajout de la logique de récupération des lieux via les concerts