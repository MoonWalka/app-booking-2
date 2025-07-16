# Rapport d'analyse : Éléments restants de l'ancien système de contacts

## Date : 2025-07-05

## Résumé exécutif

L'analyse du code a révélé plusieurs éléments de l'ancien système de contacts qui doivent être supprimés ou migrés. Le système actuel utilise principalement le modèle relationnel, mais des vestiges de l'ancien système persistent.

## 1. Services de compatibilité

### contactService.js
- **Statut** : Wrapper de compatibilité temporaire
- **Emplacement** : `/src/services/contactService.js`
- **Commentaire dans le code** : "À SUPPRIMER une fois tous les composants migrés"
- **Action requise** : Vérifier que tous les imports sont migrés vers `contactServiceRelational`, puis supprimer

## 2. Références à l'ancien format `.structure` (sans 's')

L'analyse a trouvé 175 fichiers contenant des références à `.structure` (singulier). Voici les principaux cas :

### Composants utilisant l'ancien format :
- `/src/components/contacts/ContactsList.js` - Utilise déjà le système relationnel mais contient des références legacy
- `/src/components/concerts/desktop/ConcertOrganizerSection.js` - Affiche `contact.structure` au lieu de `contact.structures`
- `/src/components/concerts/desktop/ConcertStructureSection.js` - Gère les structures mais utilise l'ancien format d'affichage

### Hooks et services :
- `/src/hooks/contrats/useContratGenerator.js`
- `/src/hooks/contrats/contractVariables.js`
- `/src/services/factureService.js`
- `/src/services/devisService.js`
- `/src/services/contratService.js`
- `/src/services/preContratService.js`

## 3. Références à `contacts_unified`

28 fichiers font référence à la collection `contacts_unified` :

### Hook de suppression :
- `/src/hooks/contacts/useDeleteContact.js` - Utilise encore `contacts_unified` dans la configuration

### Scripts et outils de migration :
- Nombreux scripts dans `/scripts-root/` qui semblent être des outils de migration ou d'audit

## 4. Création de contacts dans l'ancien format

### useEntitySearch.js
- **Problème** : Crée des structures avec `contactsIds` au lieu de gérer via le système de liaisons
- **Ligne 397** : `contactsIds: []` dans la création de structure

### UnifiedContactSelector.js
- Utilise la collection `contacts` directement au lieu du système relationnel
- **Ligne 74** : `getDoc(doc(db, 'contacts', contactId))`

## 5. Composants non migrés

### ConcertOrganizerSection.js
- Affiche `contact.structure` (singulier)
- Affiche `contact.structureNom`, `contact.structureAdresse`
- Ne gère pas le système de liaisons multiples

## 6. Recommandations d'actions

### Phase 1 - Nettoyage immédiat
1. Supprimer `contactService.js` après vérification des imports
2. Mettre à jour `useDeleteContact.js` pour utiliser le système relationnel

### Phase 2 - Migration des composants
1. Migrer `ConcertOrganizerSection.js` pour utiliser le système de liaisons
2. Migrer `UnifiedContactSelector.js` pour utiliser `contactServiceRelational`
3. Mettre à jour tous les hooks de contrats/factures/devis

### Phase 3 - Nettoyage final
1. Remplacer toutes les références `.structure` par `.structures`
2. Supprimer les scripts de migration obsolètes
3. Mettre à jour la création d'entités dans `useEntitySearch.js`

## 7. Patterns à rechercher et remplacer

### Ancien format :
```javascript
contact.structure
contact.structureNom
contact.structureAdresse
contactsIds: []
```

### Nouveau format :
```javascript
contact.structures // Array de liaisons
getStructureWithPersonnes(structureId)
liaisons // Collection séparée
```

## 8. Fichiers critiques à modifier en priorité

1. **useDeleteContact.js** - Change `contacts_unified` vers le système relationnel
2. **UnifiedContactSelector.js** - Utiliser `contactServiceRelational`
3. **ConcertOrganizerSection.js** - Gérer les liaisons multiples
4. **useEntitySearch.js** - Supprimer `contactsIds` de la création de structures

## Conclusion

Le système est en transition entre l'ancien modèle (contact unique avec structure) et le nouveau modèle relationnel (personnes/structures avec liaisons). Pour finaliser la migration, il faut :

1. Supprimer tous les wrappers de compatibilité
2. Migrer les composants restants
3. Nettoyer les références à l'ancien format
4. S'assurer que toute création/modification passe par le système relationnel