# Plan de migration des données Firebase

*Document créé le: 4 mai 2025*

Ce document définit la stratégie de migration des données Firebase pour passer au nouveau modèle de données standardisé défini dans `STANDARDISATION_MODELES.md`.

## Objectifs de la migration

1. **Transformation structurelle**: Convertir les données du format actuel vers le nouveau format standardisé
2. **Minimisation des temps d'arrêt**: Effectuer la migration avec un impact minimal sur les utilisateurs
3. **Préservation des données**: Garantir qu'aucune donnée n'est perdue durant la migration
4. **Réversibilité**: Prévoir une stratégie de restauration en cas de problème

## État actuel des données

Actuellement, les données dans Firebase présentent plusieurs incohérences:

- Les relations entre entités sont parfois stockées avec des ID et parfois avec des propriétés plates
- Les noms de propriétés ne suivent pas une convention cohérente
- Les champs dupliqués entre entités ne sont pas synchronisés

## Modèle de données cible

Notre objectif est d'adopter le modèle hybride avec:

1. Relations par ID pour la référence principale
2. Cache des données fréquemment utilisées dans les entités parentes

Exemple pour les programmateurs:
```javascript
{
  id: "prog123",
  nom: "Durand",
  prenom: "Jean",
  // Relation par ID
  structureId: "struct456",
  // Cache des données fréquemment utilisées
  structureCache: {
    raisonSociale: "Association Culturelle XYZ",
    type: "association",
    ville: "Paris"
  }
}
```

## Stratégie de migration progressive

### Phase 1: Préparation (Semaine 5)

1. **Sauvegarde complète**:
   - Export complet des données Firebase
   - Sauvegarde dans un bucket de stockage sécurisé

2. **Création d'un environnement de test**:
   - Déploiement d'une instance de test avec copie des données
   - Configuration d'un accès restreint à cette instance

3. **Scripts de transformation**:
   - Développer des scripts pour transformer les données
   - Tester les scripts sur l'environnement de test

### Phase 2: Migration des données (Semaine 6-7)

#### Approche 1: Migration par collection

Pour chaque collection (programmateurs, structures, etc.):

1. **Lecture des documents existants**:
   ```javascript
   const snapshot = await getDocs(collection(db, 'programmateurs'));
   ```

2. **Transformation selon le nouveau modèle**:
   ```javascript
   const transformedDocs = snapshot.docs.map(doc => {
     const data = doc.data();
     return {
       id: doc.id,
       // ... propriétés existantes
       // Création du cache de structure à partir des propriétés plates
       structureCache: {
         raisonSociale: data.structure || '',
         type: data.structureType || '',
         // ... autres propriétés
       }
     };
   });
   ```

3. **Écriture en lot**:
   ```javascript
   const batch = writeBatch(db);
   transformedDocs.forEach(doc => {
     const ref = doc(db, 'programmateurs', doc.id);
     batch.update(ref, doc);
   });
   await batch.commit();
   ```

#### Approche 2: Collections parallèles

Alternative pour minimiser les risques:

1. Créer des collections parallèles avec le nouveau format (ex: `programmateurs_v2`)
2. Populer ces collections à partir des données existantes
3. Lorsque tout est prêt, basculer l'application vers ces nouvelles collections
4. Garder les anciennes collections comme backup

### Phase 3: Validation et déploiement (Semaine 7-8)

1. **Tests de bout en bout**:
   - Valider que les données transformées sont correctes
   - Vérifier que toutes les fonctionnalités de l'application marchent

2. **Mise à jour des règles de sécurité**:
   - Adapter les règles de sécurité Firebase au nouveau modèle

3. **Déploiement progressif**:
   - Déployer d'abord pour un groupe restreint d'utilisateurs
   - Surveiller les erreurs et performances
   - Étendre progressivement à tous les utilisateurs

4. **Maintenance à long terme**:
   - Mettre en place des validateurs pour garantir que les nouvelles données respectent le format standard

## Synchronisation des données dupliquées

Un défi particulier concerne la maintenance des données dupliquées (cache). Deux stratégies sont envisagées:

### 1. Synchronisation via Cloud Functions

Utiliser des Cloud Functions pour maintenir la cohérence:

```javascript
// Exemple de Cloud Function pour synchroniser le cache de structure quand une structure est modifiée
exports.syncStructureCache = functions.firestore
  .document('structures/{structureId}')
  .onUpdate(async (change, context) => {
    const structureData = change.after.data();
    const structureId = context.params.structureId;
    
    // Récupérer tous les programmateurs liés à cette structure
    const programmateursSnapshot = await db.collection('programmateurs')
      .where('structureId', '==', structureId)
      .get();
    
    // Mettre à jour le cache pour chaque programmateur
    const batch = db.batch();
    programmateursSnapshot.forEach(doc => {
      batch.update(doc.ref, {
        structureCache: {
          raisonSociale: structureData.raisonSociale,
          type: structureData.type,
          ville: structureData.ville
        }
      });
    });
    
    return batch.commit();
  });
```

### 2. Synchronisation au niveau de l'application

Gérer la synchronisation dans les services de l'application:

```javascript
// Exemple dans un service de mise à jour de structure
const updateStructure = async (structureId, structureData) => {
  const batch = writeBatch(db);
  
  // Mettre à jour la structure
  const structureRef = doc(db, 'structures', structureId);
  batch.update(structureRef, structureData);
  
  // Mettre à jour le cache dans les programmateurs associés
  const programmateursSnapshot = await getDocs(
    query(collection(db, 'programmateurs'), where('structureId', '==', structureId))
  );
  
  programmateursSnapshot.forEach(doc => {
    batch.update(doc.ref, {
      structureCache: {
        raisonSociale: structureData.raisonSociale,
        type: structureData.type,
        ville: structureData.ville
      }
    });
  });
  
  await batch.commit();
};
```

### Choix recommandé

L'approche par Cloud Functions est recommandée car elle:
- Garantit la synchronisation même si des modifications sont faites en dehors de l'application
- Centralise la logique de synchronisation
- Réduit les risques d'oubli dans le code de l'application

## Risques et mitigation

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Perte de données | Élevé | Faible | Sauvegardes multiples, tests complets |
| Incohérences temporaires | Moyen | Moyen | Mise en place de mécanismes de détection et correction |
| Temps d'arrêt | Moyen | Faible | Migration en dehors des heures de pointe |
| Performances dégradées | Moyen | Moyen | Indexation préalable, migration par lots |

## Calendrier détaillé

| Semaine | Activité | Responsable |
|---------|----------|-------------|
| 5 | Sauvegarde et préparation | Équipe DevOps |
| 5-6 | Développement des scripts | Équipe Dev |
| 6 | Tests de migration | Équipe QA |
| 7 | Migration des données | Équipe DevOps + Dev |
| 7-8 | Validation et tests | Équipe QA |
| 8 | Déploiement progressif | Toutes les équipes |

## Métriques de réussite

- **Intégrité des données**: 100% des données correctement migrées
- **Temps d'arrêt**: < 2 heures
- **Performance**: Temps de requête équivalent ou meilleur après migration
- **Bugs**: 0 bug critique lié à la migration

---

*Ce document sera mis à jour au fur et à mesure de l'avancement du projet de migration.*