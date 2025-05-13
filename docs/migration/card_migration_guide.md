# Guide de Migration des Composants Card

Ce document présente la stratégie et les bonnes pratiques pour migrer les 115 composants à haute confiance vers le nouveau composant Card standardisé.

## Pourquoi cette migration ?

La migration vers un composant Card standardisé offre plusieurs avantages :
- **Cohérence visuelle** à travers toute l'application
- **Maintenance simplifiée** grâce à une base de code centralisée
- **Développement accéléré** de nouveaux écrans et fonctionnalités
- **Accessibilité améliorée** avec des standards implémentés de manière cohérente

## Structure du composant Card standardisé

Le nouveau composant Card est composé de plusieurs sous-composants :

```jsx
<Card variant="default" elevation="medium">
  <Card.Header title="Titre de la carte" subtitle="Sous-titre optionnel" />
  <Card.Body>
    Contenu de la carte
  </Card.Body>
  <Card.Footer>
    Actions ou informations supplémentaires
  </Card.Footer>
</Card>
```

## Types de migration

### 1. Migration automatisée

Pour les composants à haute confiance (70-100%), nous avons développé un script de migration automatisé :

```bash
# Mode dry-run (sans appliquer les changements)
node scripts/migration/migrate_card_components.js --dry-run

# Migration d'un composant spécifique
node scripts/migration/migrate_card_components.js --component=NomDuComposant

# Migration par lot (10 composants à la fois)
node scripts/migration/migrate_card_components.js
```

### 2. Migration manuelle guidée

Pour les composants qui nécessitent une attention particulière :

1. **Identifier les structures de type carte**
   - Rechercher les classes CSS liées aux cartes (`card`, `cardHeader`, etc.)
   - Identifier les structures DOM typiques des cartes (en-têtes, corps, pieds de page)

2. **Remplacer par le composant Card**
   ```jsx
   // AVANT
   <div className={styles.formCard}>
     <div className={styles.cardHeader}>
       <h3>Titre</h3>
     </div>
     <div className={styles.cardBody}>
       Contenu
     </div>
   </div>
   
   // APRÈS
   <Card>
     <Card.Header title="Titre" />
     <Card.Body>
       Contenu
     </Card.Body>
   </Card>
   ```

3. **Migrer les styles spécifiques**
   - Utiliser les props du composant Card pour les styles standards (`variant`, `elevation`, etc.)
   - Conserver les classes spécifiques au métier via la prop `className`

## Bonnes pratiques

1. **Tester régulièrement** les composants migrés
2. **Vérifier l'apparence visuelle** après chaque migration
3. **Maintenir la compatibilité** avec les props existantes
4. **Documenter les spécificités** dans le rapport de migration

## Exemples de migration

### Exemple 1 : Carte simple

```jsx
// AVANT
<div className={styles.card}>
  <h3>Informations</h3>
  <p>Contenu de la carte</p>
</div>

// APRÈS
<Card>
  <Card.Header title="Informations" />
  <Card.Body>
    <p>Contenu de la carte</p>
  </Card.Body>
</Card>
```

### Exemple 2 : Carte avec actions

```jsx
// AVANT
<div className={styles.card}>
  <div className={styles.header}>
    <h3>Utilisateur</h3>
    <button onClick={handleEdit}>Modifier</button>
  </div>
  <div className={styles.content}>
    <p>Informations utilisateur</p>
  </div>
  <div className={styles.footer}>
    <button onClick={handleSave}>Sauvegarder</button>
  </div>
</div>

// APRÈS
<Card>
  <Card.Header 
    title="Utilisateur" 
    action={<button onClick={handleEdit}>Modifier</button>} 
  />
  <Card.Body>
    <p>Informations utilisateur</p>
  </Card.Body>
  <Card.Footer>
    <button onClick={handleSave}>Sauvegarder</button>
  </Card.Footer>
</Card>
```

## Gestion des cas particuliers

1. **Carte sans en-tête** : Utiliser simplement `<Card><Card.Body>...</Card.Body></Card>`
2. **Styles complexes** : Utiliser `style={{...}}` pour les propriétés CSS spécifiques
3. **Contenu dynamique** : Utiliser les props comme `title={dynamicTitle}`

## Suivi de la progression

Un rapport de progression est généré automatiquement à chaque exécution du script de migration dans le fichier `card_migration_report.md`. Il présente :

- Le nombre de composants migrés
- Les composants restants à migrer
- Les éventuelles erreurs rencontrées

## Composants prioritaires

Commencer par migrer ces types de composants à haute confiance :

1. Cards d'information simples avec titre et contenu
2. Sections de formulaire encadrées
3. Panneaux avec en-tête et contenu
4. Boîtes d'information avec bordures

## Contribuer à l'amélioration du processus

Si vous rencontrez des difficultés ou identifiez des améliorations possibles au processus de migration, veuillez ajouter vos commentaires dans un ticket dédié.

---

Document préparé par l'équipe TourCraft, mai 2025