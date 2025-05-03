# Hooks pour la gestion des programmateurs

## Introduction

Ce document détaille les hooks personnalisés utilisés pour gérer les données et la logique liées aux programmateurs dans TourCraft. Ces hooks facilitent la réutilisation de code et la séparation des préoccupations dans les composants liés aux programmateurs.

## Hooks disponibles

### `useProgrammateurConcerts`

Ce hook récupère et gère la liste des concerts liés à un programmateur spécifique.

#### Paramètres

- `programmateurId` (string): Identifiant unique du programmateur.

#### Valeurs retournées

- `concerts` (array): Liste des concerts associés au programmateur.
- `loading` (boolean): Indicateur de chargement des données.
- `error` (object): Objet d'erreur en cas d'échec de récupération des données.
- `refetch` (function): Fonction permettant de rafraîchir les données.

#### Exemple d'utilisation

```jsx
const { concerts, loading, error, refetch } = useProgrammateurConcerts(programmateurId);

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error.message} />;

return (
  <div>
    {concerts.map(concert => (
      <ConcertCard key={concert.id} concert={concert} />
    ))}
    <Button onClick={refetch}>Rafraîchir les concerts</Button>
  </div>
);
```

### `useProgrammateurDetails`

Ce hook récupère et gère les informations détaillées d'un programmateur.

#### Paramètres

- `programmateurId` (string): Identifiant unique du programmateur.

#### Valeurs retournées

- `programmateur` (object): Données détaillées du programmateur.
- `loading` (boolean): Indicateur de chargement des données.
- `error` (object): Objet d'erreur en cas d'échec de récupération des données.

#### Exemple d'utilisation

```jsx
const { programmateur, loading, error } = useProgrammateurDetails(programmateurId);

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error.message} />;

return <ProgrammateurDetailView programmateur={programmateur} />;
```

### useProgrammateursList

Ce hook permet de récupérer la liste de tous les programmateurs disponibles.

#### Valeurs retournées

| Valeur | Type | Description |
|--------|------|-------------|
| `programmateurs` | `array` | Liste des programmateurs |
| `loading` | `boolean` | Indique si les données sont en cours de chargement |
| `error` | `object` | Contient les détails d'une erreur éventuelle |
| `refreshProgrammateurs` | `function` | Fonction pour recharger les données |

#### Exemple d'utilisation

```jsx
import { useProgrammateursList } from '../hooks/programmateurs/useProgrammateursList';

function ProgrammateursListPage() {
  const { programmateurs, loading, error, refreshProgrammateurs } = useProgrammateursList();

  if (loading) return <LoadingSpinner message="Chargement des programmateurs..." />;
  if (error) return <ErrorMessage message={`Erreur lors du chargement: ${error.message}`} />;

  return (
    <div className="programmateurs-list">
      <h1>Liste des programmateurs</h1>
      <Button onClick={refreshProgrammateurs}>Actualiser</Button>
      
      {programmateurs.length === 0 ? (
        <p>Aucun programmateur trouvé.</p>
      ) : (
        <ul>
          {programmateurs.map((programmateur) => (
            <li key={programmateur.id}>
              <Link to={`/programmateurs/${programmateur.id}`}>
                {programmateur.nom}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### useCreateProgrammateur

Ce hook gère la création d'un nouveau programmateur.

#### Valeurs retournées

| Valeur | Type | Description |
|--------|------|-------------|
| `createProgrammateur` | `function` | Fonction pour créer un nouveau programmateur |
| `loading` | `boolean` | Indique si la création est en cours |
| `error` | `object` | Contient les détails d'une erreur éventuelle |
| `success` | `boolean` | Indique si la création a réussi |

#### Exemple d'utilisation

```jsx
import { useCreateProgrammateur } from '../hooks/programmateurs/useCreateProgrammateur';

function NewProgrammateurForm() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    // autres champs...
  });
  
  const { createProgrammateur, loading, error, success } = useCreateProgrammateur();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createProgrammateur(formData);
  };

  if (success) {
    return <div>Programmateur créé avec succès!</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={`Erreur: ${error.message}`} />}
      
      <TextField
        label="Nom"
        value={formData.nom}
        onChange={(e) => setFormData({...formData, nom: e.target.value})}
        required
      />
      
      {/* Autres champs du formulaire */}
      
      <Button type="submit" loading={loading} disabled={loading}>
        Créer programmateur
      </Button>
    </form>
  );
}
```

### useUpdateProgrammateur

Ce hook gère la mise à jour d'un programmateur existant.

#### Paramètres

| Paramètre | Type | Description |
|-----------|------|-------------|
| `programmateurId` | `string` | L'identifiant unique du programmateur à mettre à jour |

#### Valeurs retournées

| Valeur | Type | Description |
|--------|------|-------------|
| `updateProgrammateur` | `function` | Fonction pour mettre à jour le programmateur |
| `loading` | `boolean` | Indique si la mise à jour est en cours |
| `error` | `object` | Contient les détails d'une erreur éventuelle |
| `success` | `boolean` | Indique si la mise à jour a réussi |

#### Exemple d'utilisation

```jsx
import { useUpdateProgrammateur } from '../hooks/programmateurs/useUpdateProgrammateur';

function EditProgrammateurForm({ programmateurId, initialData }) {
  const [formData, setFormData] = useState(initialData);
  
  const { updateProgrammateur, loading, error, success } = useUpdateProgrammateur(programmateurId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProgrammateur(formData);
  };

  if (success) {
    return <div>Programmateur mis à jour avec succès!</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorMessage message={`Erreur: ${error.message}`} />}
      
      <TextField
        label="Nom"
        value={formData.nom}
        onChange={(e) => setFormData({...formData, nom: e.target.value})}
        required
      />
      
      {/* Autres champs du formulaire */}
      
      <Button type="submit" loading={loading} disabled={loading}>
        Mettre à jour
      </Button>
    </form>
  );
}
```

## Bonnes pratiques

1. **Gestion des erreurs**: Toujours gérer les états d'erreur lors de l'utilisation de ces hooks.
2. **Indicateurs de chargement**: Afficher un état de chargement pour améliorer l'expérience utilisateur.
3. **Mise en cache**: Les hooks implémentent automatiquement des stratégies de mise en cache pour optimiser les performances.
4. **Revalidation**: Utiliser les fonctions `refetch` lorsque nécessaire pour actualiser les données.

## Date de mise à jour

Dernière mise à jour: 3 mai 2025