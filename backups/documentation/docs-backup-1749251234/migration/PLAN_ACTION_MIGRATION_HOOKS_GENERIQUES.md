# Plan d'Action pour la Migration vers les Hooks Génériques

*Document créé le: 9 mai 2025*  
*Dernière mise à jour: 9 mai 2025*

Ce document définit un plan d'action structuré pour l'adoption des hooks génériques dans le projet TourCraft, conformément au plan de dépréciation progressive des hooks spécifiques.

## 1. Préparation et Communication

### 1.1 Documentation et Formation

- **Partager le guide d'utilisation** (`GUIDE_UTILISATION_HOOKS_GENERIQUES.md`) avec toute l'équipe
- **Organiser une session de formation** (30-45 minutes) pour présenter l'approche et les avantages
- **Créer un canal de communication dédié** pour les questions sur la migration

### 1.2 Améliorer les outils de détection

```bash
# Ajouter le script dans les commandes npm pour faciliter l'exécution
npm set-script detect-hooks "node scripts/detect_deprecated_hooks.js --verbose"
```

### 1.3 Établir un tableau de bord de progression

- [x] Créer un document partagé listant tous les composants à migrer, avec leur statut
- [ ] Définir des jalons hebdomadaires pour suivre la progression

## 2. Nouveaux Développements

### 2.1 Standardisation des modèles

- [x] **Créer des templates** pour les nouveaux hooks basés sur les génériques :
  ```bash
  mkdir -p src/templates/hooks
  ```

- [x] **Développer des snippets VSCode** pour accélérer l'implémentation des hooks génériques et les stocker dans `docs/migration/SNIPPETS_VSCODE_HOOKS.md`

### 2.2 Règles pour les pull requests

- [x] Ajouter une checklist à respecter pour toute nouvelle PR, définie dans `docs/workflows/PR_CHECKLIST.md` :
  - Utilisation directe des hooks génériques
  - Documentation des hooks personnalisés
  - Tests unitaires pour les hooks personnalisés

### 2.3 Implémentation des exemples dans les fonctionnalités clés

- [x] Créer des exemples d'utilisation pour chacun des 4 hooks génériques dans les différents modules (concerts, artistes, etc.)

## 3. Migration Progressive des Composants Existants

### 3.1 Priorisation des composants

1. **Haute priorité** (Semaines 1-2)
   - [x] Composants avec hooks dépréciés marqués comme HIGH severity
   - [x] Composants fréquemment modifiés (selon l'historique git)

2. **Priorité moyenne** (Semaines 3-6)
   - [x] Composants avec hooks dépréciés marqués comme MEDIUM severity
   - [ ] Composants de formulaires complexes bénéficiant des fonctionnalités avancées

3. **Priorité basse** (Semaines 7-10)
   - [ ] Autres composants avec hooks dépréciés
   - [ ] Composants rarement modifiés

### 3.2 Stratégie de refactoring

Pour chaque module du projet (lieux, concerts, artistes, etc.) :

1. [x] **Créer un hook optimisé** basé sur le hook générique approprié
2. [x] **Tester le hook** avec des cas d'utilisation variés
3. [x] **Mettre à jour le fichier d'index** pour exposer le hook optimisé
4. [x] **Migrer les composants** pour utiliser le nouveau hook
5. [x] **Vérifier les erreurs et la couverture de tests**

### 3.3 Planification des sprints de migration

- **Sprint 1 (2 semaines)** : Hooks de formulaires (`useLieuForm`, `useConcertForm`, etc.)
- **Sprint 2 (2 semaines)** : Hooks de détails (`useArtisteDetails`, etc.)
- **Sprint 3 (2 semaines)** : Hooks de recherche (`useLieuSearch`, etc.)
- **Sprint 4 (2 semaines)** : Hooks de liste (`useArtistesList`, etc.)
- **Sprint 5 (2 semaines)** : Revue, tests et corrections

## 4. Outils et Automatisation

### 4.1 Script d'analyse hebdomadaire

Créer un script qui s'exécute automatiquement chaque semaine pour surveiller l'avancement :

```javascript
// scripts/monitor_hooks_migration.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Exécuter le script de détection
const result = execSync('node scripts/detect_deprecated_hooks.js --csv').toString();

// Analyser les résultats et générer un rapport
// ...

// Enregistrer l'historique pour suivre la progression
const date = new Date().toISOString().split('T')[0];
fs.writeFileSync(
  path.join('docs', 'migration', `hooks_migration_progress_${date}.json`),
  JSON.stringify(stats)
);

console.log('Rapport de progression généré avec succès !');
```

### 4.2 Automatisation des tests

Pour chaque hook migré, ajouter des tests automatisés :

```javascript
// Exemple de test pour un hook optimisé
describe('useLieuFormOptimized', () => {
  it('devrait initialiser correctement les données par défaut', () => {
    // ...
  });
  
  it('devrait valider correctement les données du formulaire', () => {
    // ...
  });
  
  it('devrait transformer correctement les données avant sauvegarde', () => {
    // ...
  });
});
```

## 5. Transition et Support

### 5.1 Phase de coexistence

Durant la transition (jusqu'au 15 octobre 2025) :
- Maintenir les hooks dépréciés comme wrappers
- Ajouter progressivement des avertissements plus visibles
- Supporter les deux approches dans la documentation

### 5.2 Support aux développeurs

- Désigner un "champion" de la migration par équipe
- Allouer du temps lors des réunions pour discuter des défis
- Créer une FAQ basée sur les questions fréquentes

### 5.3 Revue de code ciblée

Mettre en place des revues de code spécifiques pour la migration :
- Sessions de pair programming pour les migrations complexes
- Revues spécifiques pour valider l'utilisation correcte des hooks génériques

## 6. Suivi et Ajustement

### 6.1 Métriques de suivi

Définir des indicateurs clés à suivre :
- Pourcentage de hooks migrés par catégorie
- Nombre de nouveaux composants utilisant directement les hooks génériques
- Réduction des avertissements dans la console
- Feedback des développeurs sur la nouvelle approche

### 6.2 Réunions d'avancement

Planifier des réunions bihebdomadaires pour :
- Présenter l'avancement de la migration
- Discuter des obstacles rencontrés
- Ajuster la stratégie si nécessaire

### 6.3 Ajustement du calendrier

Prévoir une marge de sécurité pour respecter l'échéance de novembre 2025 :
- Fixer la fin de migration complète pour octobre 2025
- Prévoir une période de stabilisation de 2 semaines
- Réserver novembre pour le nettoyage final et la suppression des hooks dépréciés

## 7. Calendrier Global

| Phase | Période | Objectif |
|-------|---------|----------|
| Préparation | Mai 2025 | Documentation, formation, outillage |
| Migration prioritaire | Juin 2025 | Hooks HIGH severity (formulaires) |
| Migration intermédiaire | Juillet-Août 2025 | Hooks MEDIUM severity (détails, recherche) |
| Migration finale | Septembre 2025 | Hooks restants et vérification |
| Stabilisation | Octobre 2025 | Tests, corrections et finalisation |
| Suppression | Novembre 2025 | Retrait des hooks dépréciés |

## 8. Exemples de Référence

### 8.1 Création d'un hook optimisé

Nous avons déjà implémenté un exemple de hook optimisé pour les formulaires de lieux qui peut servir de référence :

```javascript
// Voir src/hooks/lieux/useLieuFormOptimized.js pour l'exemple complet
```

### 8.2 Utilisation d'un hook optimisé dans un composant

```javascript
// Voir src/components/lieux/desktop/LieuFormOptimized.js pour l'exemple complet
```

## 9. Responsables et contacts

- **Responsable principal de la migration** : Alice (@alice)
- **Contact pour les questions techniques** : Bob (@bob)
- **Documentation et guides** : Eve (@eve)

---

Ce plan a été approuvé le 9 mai 2025 et sera révisé mensuellement pour s'assurer de son bon déroulement.

Pour plus d'informations sur l'utilisation des hooks génériques, consultez le [Guide d'Utilisation des Hooks Génériques](/docs/hooks/GUIDE_UTILISATION_HOOKS_GENERIQUES.md).