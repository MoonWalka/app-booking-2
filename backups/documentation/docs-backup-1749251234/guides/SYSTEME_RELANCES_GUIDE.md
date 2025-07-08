# Guide du Système de Suivi de Relances TourCraft

## Vue d'ensemble

Le système de suivi de relances permet aux utilisateurs de TourCraft de créer, gérer et suivre des rappels et tâches associés à leurs concerts, contrats, contacts et autres entités.

## Architecture

### Composants principaux

1. **RelancesTracker** (`/src/components/relances/RelancesTracker.js`)
   - Composant principal pour la gestion complète des relances
   - Affiche les statistiques, filtres et liste des relances
   - Intégré dans le Dashboard

2. **RelancesWidget** (`/src/components/relances/RelancesWidget.js`)
   - Widget compact pour afficher les relances d'une entité spécifique
   - Peut être intégré dans n'importe quelle page de détails (concert, contact, etc.)

3. **RelancesNotification** (`/src/components/relances/RelancesNotification.js`)
   - Icône de notification dans la barre de navigation
   - Affiche le nombre de relances en retard et un dropdown avec les relances urgentes

### Hooks

1. **useRelances** (`/src/hooks/relances/useRelances.js`)
   - Gestion des données de relances en temps réel via Firebase
   - Fonctions CRUD : mise à jour du statut, suppression
   - Filtrage par statut, date, entité

2. **useRelanceForm** (`/src/hooks/relances/useRelanceForm.js`)
   - Gestion du formulaire de création/édition de relances
   - Validation des données
   - Sauvegarde dans Firebase

## Structure de données Firebase

### Collection : `relances`

```javascript
{
  id: "auto-generated",
  titre: "Confirmer la date avec l'artiste",
  description: "Appeler l'artiste pour confirmer sa disponibilité",
  dateEcheance: "2025-06-15",
  priorite: "high", // "low", "medium", "high"
  status: "pending", // "pending", "completed"
  entityType: "concert", // "concert", "contrat", "contact", "autre"
  entityId: "concert-id-123",
  entityName: "Concert du 15 juin",
  entrepriseId: "org-id-123",
  userId: "user-id-456",
  createdAt: "2025-06-05T10:00:00.000Z",
  updatedAt: "2025-06-05T10:00:00.000Z",
  completedAt: null // Date de complétion si status = "completed"
}
```

## Règles de sécurité Firestore

Les règles sont définies dans `/firestore.rules` :

- Lecture : membres de l'organisation uniquement
- Création : membres de l'organisation, userId doit correspondre à l'utilisateur authentifié
- Mise à jour : créateur ou admin de l'organisation
- Suppression : créateur ou admin de l'organisation

## Index Firestore

Les index optimisés sont définis dans `/firestore.indexes.json` :

1. `entrepriseId` + `dateEcheance` (tri par date)
2. `entrepriseId` + `status` + `dateEcheance` (filtrage par statut)
3. `entrepriseId` + `entityType` + `entityId` (relances par entité)

## Intégration

### 1. Dashboard

Le composant `RelancesTracker` est déjà intégré dans le Dashboard :

```jsx
// src/pages/DashboardPage.js
<div className="mt-4">
  <RelancesTracker />
</div>
```

### 2. Page de détails d'une entité

Exemple d'intégration dans une page de concert :

```jsx
import RelancesWidget from '@/components/relances/RelancesWidget';

// Dans le render
<RelancesWidget
  entityType="concert"
  entityId={concertId}
  entityName={concert.titre}
  showAddButton={true}
  onAddRelance={handleAddRelance}
/>
```

### 3. Barre de navigation

Le composant `RelancesNotification` est intégré dans la Navbar :

```jsx
// src/components/layout/Navbar.js
<div className={styles.dFlex}>
  <RelancesNotification />
  <span className={`${styles.navbarText} ${styles.me3} ${styles.ms3}`}>
    Utilisateur test
  </span>
  <Link className={styles.btnOutlineLight} to="/login">
    Déconnexion
  </Link>
</div>
```

## Utilisation

### Créer une relance

1. **Depuis le Dashboard** : Cliquer sur "Nouvelle relance"
2. **Depuis une entité** : Utiliser le bouton "Ajouter" dans le widget de relances

### Filtrer les relances

Le système propose 4 filtres :
- **Toutes** : Affiche toutes les relances
- **En attente** : Relances non complétées
- **En retard** : Relances dont la date d'échéance est passée
- **Complétées** : Relances marquées comme terminées

### Marquer comme complétée

Cliquer sur le bouton ✓ sur une relance pour la marquer comme complétée.

### Notifications

L'icône de notification dans la barre de navigation affiche :
- Un badge rouge avec le nombre de relances urgentes (en retard + aujourd'hui)
- Un dropdown avec les relances organisées par urgence

## Styles et personnalisation

Les styles sont modulaires et utilisent les variables CSS de TourCraft :

- `RelancesTracker.module.css` : Styles du composant principal
- `RelancesWidget.module.css` : Styles du widget
- `RelancesNotification.module.css` : Styles des notifications

### Variables CSS utilisées

```css
--spacing-* : Espacements
--color-* : Couleurs (danger pour urgent, primary pour normal)
--font-size-* : Tailles de police
--border-radius-* : Rayons de bordure
--shadow-* : Ombres
```

## Exemple complet : ConcertViewWithRelances

Le fichier `/src/components/concerts/desktop/ConcertViewWithRelances.js` montre un exemple complet d'intégration du système de relances dans une page existante avec :

- Widget de relances dans une colonne latérale
- Modal de création de relance pré-rempli avec les infos du concert
- Mise en page responsive

## Déploiement

1. **Déployer les règles Firestore** :
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Déployer les index** :
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. **Build et déploiement de l'application** :
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Points d'attention

1. **Performance** : Les relances sont chargées en temps réel via `onSnapshot`. Pour de grandes quantités, envisager la pagination.

2. **Offline** : Le système utilise Firebase Realtime listeners qui fonctionnent en mode offline avec synchronisation automatique.

3. **Permissions** : Les relances sont liées à l'organisation courante. S'assurer que `OrganizationContext` est correctement configuré.

4. **Dates** : Les dates sont stockées en format ISO string pour faciliter le tri et la comparaison.

## Évolutions futures possibles

1. **Notifications push** : Envoyer des notifications pour les relances urgentes
2. **Récurrence** : Créer des relances récurrentes (hebdomadaire, mensuelle)
3. **Assignation** : Assigner des relances à d'autres membres de l'organisation
4. **Templates** : Créer des modèles de relances réutilisables
5. **Intégration calendrier** : Export vers Google Calendar, Outlook, etc.
6. **Rappels par email** : Notifications email automatiques
7. **Statistiques avancées** : Tableau de bord avec graphiques de performance