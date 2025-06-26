# Rapport d'analyse : Références des structures dans les concerts

## Résumé exécutif

L'analyse révèle une situation complexe avec plusieurs systèmes de référencement des structures dans les concerts :

1. **Système actuel** : Les concerts utilisent `structureId` qui pointe vers la collection `structures`
2. **Problème identifié** : Certains concerts utilisent des numéros SIRET comme `structureId` au lieu d'IDs de documents Firebase
3. **Collection contacts_unified** : Existe mais n'est pas utilisée par les concerts actuellement

## Détails de l'analyse

### 1. État actuel des concerts

Sur 6 concerts analysés :
- 3 utilisent `structureId` avec des numéros SIRET (14 chiffres)
- 1 utilise `structureId` avec un ID Firebase valide
- 2 n'ont pas de structure référencée

```
Concert con-1750021898959-gqswwq: structureId=75098528500022 (SIRET)
Concert con-1749569483128-xw9cfj: structureId=85011847200016 (SIRET)  
Concert con-1749310959330-h4iw3m: structureId=92939812100012 (SIRET)
Concert D7kwUS6UkfmU9ZtLoVAf: structureId=mLAdGFVZulp968x7qs8Z (ID Firebase)
```

### 2. Problème identifié : SIRET comme ID

L'analyse montre que :
- Une structure a été créée avec son SIRET comme ID de document : `92939812100012`
- Les autres SIRET utilisés comme `structureId` ne correspondent à aucun document

**Cause probable** : Le système de recherche/sélection de structure dans le formulaire de concert utilise parfois le SIRET au lieu de l'ID du document.

### 3. Code impliqué

#### Service concerts (`concertService.js`)
- Gère la rétrocompatibilité entre `structureId` et `organisateurId`
- Recherche les concerts par ID de structure ou par nom

#### Formulaire de concert (`ConcertForm.js`)
- Utilise `useEntitySearch` pour la recherche de structures
- Appelle `handleStructureChange` lors de la sélection

#### Hook `useConcertFormWithRelations.js`
- Gère la mise à jour du `structureId` et `structureNom` dans les données du concert
- Charge les structures depuis la collection `structures`

### 4. Collections Firebase

#### Collection `structures`
- Contient les organisations (festivals, salles, etc.)
- 7 entrées trouvées
- Certaines ont des IDs normaux, une a un SIRET comme ID

#### Collection `contacts_unified`
- Contient seulement 2 entrées de type "structure"
- N'est pas utilisée par les concerts actuellement

## Recommandations

### Court terme (corrections immédiates)

1. **Migrer les concerts avec SIRET comme structureId**
   ```javascript
   // Trouver la vraie structure par SIRET et mettre à jour le concert
   const realStructure = await findStructureBySiret(siret);
   await updateConcert(concertId, { structureId: realStructure.id });
   ```

2. **Corriger la logique de sélection**
   - S'assurer que `handleStructureChange` utilise toujours l'ID du document
   - Ne jamais utiliser le SIRET comme ID

### Moyen terme (amélioration du système)

1. **Normaliser le référencement**
   - Décider d'utiliser soit `structures` soit `contacts_unified`
   - Migrer toutes les références vers le système choisi

2. **Améliorer la validation**
   - Vérifier que `structureId` est un ID Firebase valide (pas un SIRET)
   - Ajouter des contraintes dans le schéma de validation

3. **Nettoyer les données**
   - Supprimer les structures dupliquées
   - Corriger la structure avec SIRET comme ID

## Conclusion

Le système utilise actuellement la collection `structures` pour les références dans les concerts, mais des incohérences dans la logique de sélection ont créé des références invalides utilisant des SIRET au lieu d'IDs. Une migration et une correction du code sont nécessaires pour résoudre ce problème.