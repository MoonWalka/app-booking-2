# Analyse des dépendances entre composants

*Document créé le: 4 mai 2025*

Ce document complète le plan de refactorisation en analysant les dépendances entre les différents composants du projet TourCraft. Cette analyse est essentielle pour planifier l'ordre des modifications et éviter des effets en cascade imprévus.

## Méthodologie d'analyse

Pour chaque composant à refactoriser, nous identifierons :
1. Les composants qui l'importent (dépendances entrantes)
2. Les composants qu'il importe (dépendances sortantes)
3. Les hooks dont il dépend
4. Les services qu'il utilise
5. Les contextes auxquels il accède

## Programmateur - Structure : Cartographie des dépendances

### Composants centraux

1. **ProgrammateurLegalSection.js**
   - **Dépendances entrantes** : `ProgrammateurForm.js`, `ProgrammateurDetails.js`
   - **Dépendances sortantes** : Components UI React Bootstrap
   - **Hooks** : Probablement aucun directement (reçoit des données via props)
   - **Services** : Aucun directement
   - **Impact de modification** : Moyen - La modification ne devrait affecter que la visualisation et l'édition des données, pas la logique métier

2. **ProgrammateurStructuresSection.js**
   - **Dépendances entrantes** : `ProgrammateurDetails.js`
   - **Dépendances sortantes** : `Link` (react-router-dom), Firebase/firestore
   - **Hooks** : Utilisation directe de hooks React (useState, useEffect)
   - **Services** : Accès direct à Firestore (db)
   - **Impact de modification** : Élevé - Ce composant gère le chargement et l'affichage des structures, donc modification des accès Firebase

3. **ProgrammateurForm.js**
   - **Dépendances entrantes** : Pages de création/édition de programmateurs
   - **Dépendances sortantes** : Composants de section, probablement des hooks de formulaire
   - **Hooks** : Potentiellement des hooks de formulaire et de validation
   - **Services** : Probablement des services d'accès aux données
   - **Impact de modification** : Élevé - Composant parent qui orchestre la manipulation des données

### Hooks associés

1. **useProgrammateur** (dans `/hooks/programmateurs/`)
   - **Utilisé par** : Pages et composants de détail des programmateurs
   - **Dépendances** : Services Firestore
   - **Impact de modification** : Élevé - Point central de transformation des données

2. **useStructure** (dans `/hooks/structures/`)
   - **Utilisé par** : Composants qui manipulent des structures
   - **Dépendances** : Services Firestore
   - **Impact de modification** : Élevé - Point central de transformation des données

### Chemins de migration recommandés

Basé sur cette analyse, voici l'ordre recommandé pour les modifications :

1. **Niveau 1**: Commencer par les hooks (`useProgrammateur`, `useStructure`)
   - Ajouter la transformation des données pour respecter le nouveau format
   - Ne pas modifier encore l'API externe des hooks

2. **Niveau 2**: Adapter les composants feuilles (`ProgrammateurLegalSection.js`)
   - Mettre à jour pour utiliser la nouvelle structure de données
   - Maintenir la compatibilité avec les données actuelles via des fallbacks

3. **Niveau 3**: Adapter les composants conteneurs (`ProgrammateurForm.js`, `ProgrammateurDetails.js`)
   - Mettre à jour pour utiliser et transmettre la nouvelle structure de données

4. **Niveau 4**: Mise à jour des services et de la persistance des données

## Structure - Artiste : Cartographie des dépendances

(Analyse similaire à effectuer pour les autres relations)

## Audit des chemins d'accès aux données

Un audit préliminaire montre que l'accès aux données relatives à d'autres entités suit plusieurs patterns :

1. **Accès direct à une propriété plate**:
   ```jsx
   programmateur.structure // Nom de la structure
   programmateur.structureType // Type de la structure
   ```

2. **Accès via objet imbriqué**:
   ```jsx
   formData.structure.raisonSociale
   formData.structure.type
   ```

3. **Utilisation d'ID pour charger depuis Firestore**:
   ```jsx
   // Dans ProgrammateurStructuresSection.js
   if (programmateur && programmateur.structureId) {
     const structureDoc = await getDoc(doc(db, 'structures', programmateur.structureId));
   }
   ```

Ces patterns incohérents devront être unifiés selon le modèle standard défini dans STANDARDISATION_MODELES.md.

## Gestion des erreurs et cas limites

Points à considérer lors de la refactorisation :

1. **Données manquantes**: Comment gérer les cas où les données structurées ne sont pas encore migrées?
2. **Compatibilité descendante**: Comment assurer que les anciennes versions de l'API continuent de fonctionner?
3. **État transitoire**: Comment gérer la période où certains composants utilisent la nouvelle structure et d'autres l'ancienne?

## Plan de tests

Pour chaque composant refactorisé, les tests suivants devraient être effectués :

1. **Tests unitaires**: Vérifier que le composant fonctionne avec la nouvelle structure de données
2. **Tests d'intégration**: Vérifier que le composant interagit correctement avec ses dépendances
3. **Tests de régression**: Vérifier que les fonctionnalités existantes continuent de fonctionner

## Impact sur les formulaires et la validation

La refactorisation aura un impact sur la façon dont les formulaires sont validés et soumis. Il faudra :

1. Mettre à jour les schémas de validation Yup pour refléter la nouvelle structure de données
2. Adapter les fonctions de transformation de données avant soumission
3. Revoir la logique de gestion des erreurs de validation

---

*Ce document doit être maintenu à jour au fur et à mesure que de nouvelles dépendances ou contraintes sont identifiées.*