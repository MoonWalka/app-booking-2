# 🏢 Système Multi-Organisation pour TourCraft

Ce document explique comment utiliser le nouveau système multi-organisation dans votre application TourCraft.

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Migration des données existantes](#migration-des-données-existantes)
3. [Utilisation dans les composants](#utilisation-dans-les-composants)
4. [Hooks disponibles](#hooks-disponibles)
5. [Sécurité et permissions](#sécurité-et-permissions)
6. [Exemples de code](#exemples-de-code)

## Vue d'ensemble

Le système multi-organisation permet à votre application de gérer plusieurs organisations (salles, festivals, agences) de manière isolée. Chaque organisation a ses propres données et utilisateurs.

### Concepts clés

- **Organisation** : Une entité (salle, festival, agence) avec ses propres données
- **Membres** : Utilisateurs appartenant à une organisation avec des rôles (owner, admin, member)
- **Collections organisationnelles** : Les données sont stockées dans des collections séparées par organisation

## Migration des données existantes

### Étape 1 : Exécuter la migration

1. Connectez-vous en tant qu'administrateur
2. Accédez à `/admin/migration`
3. Cliquez sur "Démarrer la migration"

La migration va :
- Créer une organisation par défaut
- Migrer toutes vos collections existantes
- Configurer les permissions

### Étape 2 : Vérifier la migration

Après la migration, vérifiez que :
- Vous pouvez sélectionner l'organisation dans la barre latérale
- Vos données sont accessibles
- Les nouveaux utilisateurs voient le flux d'onboarding

## Utilisation dans les composants

### 1. Accéder au contexte d'organisation

```javascript
import { useOrganization } from '@/context/OrganizationContext';

function MyComponent() {
  const { 
    currentOrg,      // Organisation actuelle
    userOrgs,        // Liste des organisations de l'utilisateur
    isAdmin,         // Si l'utilisateur est admin/owner
    switchOrganization // Changer d'organisation
  } = useOrganization();
  
  return (
    <div>
      <h1>Organisation : {currentOrg?.name}</h1>
    </div>
  );
}
```

### 2. Utiliser les hooks multi-organisation

#### Requêtes de données

```javascript
import { useMultiOrgQuery } from '@/hooks/useMultiOrgQuery';

function ConcertsList() {
  const { data: concerts, loading, error } = useMultiOrgQuery('concerts', {
    orderByField: 'date',
    orderDirection: 'desc',
    realtime: true // Écoute en temps réel
  });
  
  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;
  
  return (
    <ul>
      {concerts.map(concert => (
        <li key={concert.id}>{concert.titre}</li>
      ))}
    </ul>
  );
}
```

#### Mutations de données

```javascript
import { useMultiOrgMutation } from '@/hooks/useMultiOrgQuery';

function AddConcertForm() {
  const { create, loading } = useMultiOrgMutation('concerts');
  
  const handleSubmit = async (formData) => {
    try {
      const id = await create(formData);
      console.log('Concert créé avec l\'ID:', id);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Votre formulaire */}
    </form>
  );
}
```

## Hooks disponibles

### `useOrganization()`

Accès au contexte d'organisation.

**Retourne :**
- `currentOrg` - Organisation actuelle
- `userOrgs` - Liste des organisations
- `loading` - État de chargement
- `switchOrganization(orgId)` - Changer d'organisation
- `isAdmin()` - Vérifier si admin/owner
- `needsOnboarding` - Si l'utilisateur doit créer/rejoindre une organisation

### `useMultiOrgQuery(collection, options)`

Requêtes Firestore avec contexte organisationnel.

**Paramètres :**
- `collection` - Nom de la collection (sans préfixe org)
- `options` - Options de requête :
  - `filters` - Tableau de filtres
  - `orderByField` - Champ de tri
  - `orderDirection` - 'asc' ou 'desc'
  - `limitCount` - Limite de résultats
  - `realtime` - Écoute temps réel

### `useMultiOrgMutation(collection)`

Mutations Firestore avec contexte organisationnel.

**Retourne :**
- `create(data)` - Créer un document
- `update(id, data)` - Mettre à jour
- `remove(id)` - Supprimer
- `loading` - État de chargement
- `error` - Erreur éventuelle

## Sécurité et permissions

### Règles Firestore

Les règles de sécurité vérifient automatiquement :
- L'utilisateur est membre de l'organisation
- Les permissions selon le rôle (owner, admin, member)
- L'isolation des données entre organisations

### Rôles disponibles

- **Owner** : Propriétaire, tous les droits
- **Admin** : Administrateur, peut gérer les données et membres
- **Member** : Membre, peut lire et créer des données

## Exemples de code

### Migration d'un composant existant

**Avant (sans multi-org) :**

```javascript
import { collection, query, getDocs } from '@/services/firebase-service';

function OldComponent() {
  const [concerts, setConcerts] = useState([]);
  
  useEffect(() => {
    const fetchConcerts = async () => {
      const q = query(collection(db, 'concerts'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConcerts(data);
    };
    
    fetchConcerts();
  }, []);
  
  return <div>{/* Affichage */}</div>;
}
```

**Après (avec multi-org) :**

```javascript
import { useMultiOrgQuery } from '@/hooks/useMultiOrgQuery';

function NewComponent() {
  const { data: concerts, loading } = useMultiOrgQuery('concerts');
  
  if (loading) return <div>Chargement...</div>;
  
  return <div>{/* Affichage */}</div>;
}
```

### Créer une invitation

```javascript
import { inviteUserToOrganization } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';

function InviteForm() {
  const { currentOrg } = useOrganization();
  const [email, setEmail] = useState('');
  
  const handleInvite = async () => {
    try {
      await inviteUserToOrganization(currentOrg.id, email, 'member');
      alert('Invitation envoyée !');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };
  
  return (
    <div>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email de l'utilisateur"
      />
      <button onClick={handleInvite}>Inviter</button>
    </div>
  );
}
```

## Support

Pour toute question ou problème avec le système multi-organisation, consultez :
- La documentation technique dans `/docs/.ai-docs/multiOrganisation.md`
- Les exemples de code dans ce dossier
- Le support technique

---

*Dernière mise à jour : Décembre 2024* 