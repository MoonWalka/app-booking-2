# Hooks pour la gestion des artistes

## Introduction

Les hooks de gestion des artistes dans TourCraft permettent d'interagir avec les données des artistes, leur recherche, leur affichage et leur modification. Ces hooks fournissent un accès structuré aux données et aux fonctionnalités liées aux artistes.

## useArtistesList

**But :** Gérer la liste des artistes avec filtrage et pagination

**Paramètres :** 
- `options: object` (optionnel) - Options de configuration incluant:
  - `limit: number` - Nombre d'artistes par page (défaut: 10)
  - `initialSort: string` - Critère de tri initial (défaut: 'nom')
  - `initialOrder: 'asc'|'desc'` - Ordre de tri initial (défaut: 'asc')
  - `filters: object` - Filtres initiaux à appliquer

**Dépendances :**
- Firebase (collection, query, where, orderBy, limit, startAfter)
- React (useState, useEffect, useCallback)
- utils/formatters.js

**Fonctionnalités principales :**
- Chargement paginé de la liste des artistes
- Filtrage par genre, statut, disponibilité
- Tri par différents critères
- Recherche par nom ou alias
- Gestion du cache pour améliorer les performances

**Retourne :**
```javascript
{
  artistes,            // Tableau d'artistes
  loading,             // État de chargement
  error,               // Erreur éventuelle
  totalCount,          // Nombre total d'artistes (si disponible)
  hasMore,             // S'il y a plus d'artistes à charger
  loadMore,            // Fonction pour charger plus d'artistes
  refresh,             // Fonction pour rafraîchir la liste
  sort,                // État de tri actuel (champ)
  order,               // État d'ordre actuel ('asc' ou 'desc')
  handleSort,          // Fonction pour changer le tri
  handleSearch,        // Fonction de recherche
  filters,             // Filtres actuels
  applyFilters,        // Fonction pour appliquer des filtres
  resetFilters,        // Fonction pour réinitialiser les filtres
  selectedIds,         // IDs des artistes sélectionnés (si multiSelect)
  selectArtiste,       // Fonction pour sélectionner un artiste
  deselectArtiste,     // Fonction pour désélectionner un artiste
  selectAll,           // Fonction pour sélectionner tous les artistes
  deselectAll          // Fonction pour désélectionner tous les artistes
}
```

**Exemple d'utilisation :**

```jsx
import { useArtistesList } from '../hooks/artistes/useArtistesList';

function ArtistesListPage() {
  const {
    artistes,
    loading,
    error,
    hasMore,
    loadMore,
    handleSort,
    handleSearch,
    filters,
    applyFilters,
    resetFilters
  } = useArtistesList({
    limit: 20,
    initialSort: 'dateCreation',
    initialOrder: 'desc'
  });

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    handleSearch(searchTerm);
  };

  const handleFilterChange = (filterName, value) => {
    applyFilters({ ...filters, [filterName]: value });
  };

  return (
    <div className="artistes-list-page">
      <PageHeader 
        title="Artistes" 
        actions={
          <Button 
            variant="primary" 
            startIcon={<PlusIcon />}
            onClick={() => navigate('/artistes/nouveau')}
          >
            Nouvel artiste
          </Button>
        }
      />
      
      <div className="search-and-filters">
        <div className="search-bar">
          <TextField
            placeholder="Rechercher un artiste..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
          />
          <Button onClick={handleSearchSubmit}>
            Rechercher
          </Button>
        </div>
        
        <div className="filters">
          <Select
            label="Genre"
            value={filters.genre || ''}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            options={genreOptions}
          />
          <Select
            label="Statut"
            value={filters.statut || ''}
            onChange={(e) => handleFilterChange('statut', e.target.value)}
            options={statutOptions}
          />
          <Button 
            variant="text"
            onClick={resetFilters}
          >
            Réinitialiser
          </Button>
        </div>
      </div>
      
      {loading && artistes.length === 0 ? (
        <LoadingSpinner message="Chargement des artistes..." />
      ) : error ? (
        <AlertMessage type="error" message={error} />
      ) : artistes.length === 0 ? (
        <EmptyState
          title="Aucun artiste trouvé"
          message="Aucun artiste ne correspond à vos critères de recherche ou votre liste d'artistes est vide."
          action={
            <Button 
              onClick={() => navigate('/artistes/nouveau')}
              variant="primary"
            >
              Ajouter un artiste
            </Button>
          }
        />
      ) : (
        <>
          <div className="sort-controls">
            <span>Trier par:</span>
            <Button 
              variant="text"
              onClick={() => handleSort('nom')}
            >
              Nom {filters.sort === 'nom' && (filters.order === 'asc' ? '↑' : '↓')}
            </Button>
            <Button 
              variant="text"
              onClick={() => handleSort('dateCreation')}
            >
              Date {filters.sort === 'dateCreation' && (filters.order === 'asc' ? '↑' : '↓')}
            </Button>
          </div>
          
          <div className="artistes-grid">
            {artistes.map(artiste => (
              <ArtisteCard 
                key={artiste.id}
                artiste={artiste}
                onClick={() => navigate(`/artistes/${artiste.id}`)}
              />
            ))}
          </div>
          
          {hasMore && (
            <div className="load-more">
              <Button 
                variant="text"
                onClick={loadMore}
                loading={loading}
              >
                Charger plus
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

## useArtisteDetails

**But :** Gérer les détails d'un artiste spécifique

**Paramètres :** 
- `id: string` - ID de l'artiste à charger
- `options: object` (optionnel) - Options de configuration incluant:
  - `includeRelated: boolean` - Si les concerts et documents associés doivent être chargés (défaut: true)

**Dépendances :**
- Firebase (doc, getDoc, onSnapshot, collection, query, where)
- React (useState, useEffect, useCallback, useMemo)
- hooks/common/useDocumentListener.js

**Fonctionnalités principales :**
- Chargement des données détaillées de l'artiste
- Mise à jour en temps réel des données via onSnapshot
- Récupération des concerts associés
- Récupération des documents associés (riders, contrats, etc.)
- Gestion du mode édition

**Retourne :**
```javascript
{
  artiste,              // Données de l'artiste
  loading,              // État de chargement
  error,                // Erreur éventuelle
  concerts,             // Concerts associés
  documents,            // Documents associés
  concertsLoading,      // État de chargement des concerts
  documentsLoading,     // État de chargement des documents
  isEditMode,           // Si le mode édition est actif
  setEditMode,          // Fonction pour activer/désactiver le mode édition
  updateArtiste,        // Fonction pour mettre à jour les données
  deleteArtiste,        // Fonction pour supprimer l'artiste
  saveChanges,          // Fonction pour enregistrer les modifications en mode édition
  cancelEdit,           // Fonction pour annuler les modifications en mode édition
  addDocument,          // Fonction pour ajouter un document
  removeDocument,       // Fonction pour supprimer un document
  formState,            // État du formulaire en mode édition
  handleChange,         // Gestionnaire de changement pour le formulaire
  errors                // Erreurs de validation du formulaire
}
```

**Exemple d'utilisation :**

```jsx
import { useArtisteDetails } from '../hooks/artistes/useArtisteDetails';

function ArtisteDetailPage({ match }) {
  const artisteId = match.params.id;
  
  const {
    artiste,
    loading,
    error,
    concerts,
    documents,
    concertsLoading,
    isEditMode,
    setEditMode,
    deleteArtiste,
    saveChanges,
    cancelEdit,
    formState,
    handleChange,
    errors
  } = useArtisteDetails(artisteId);

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet artiste ?')) {
      deleteArtiste()
        .then(() => {
          navigate('/artistes');
        })
        .catch(error => {
          console.error('Erreur lors de la suppression:', error);
        });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement des détails de l'artiste..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!artiste) {
    return <NotFound message="L'artiste demandé n'a pas été trouvé." />;
  }

  return (
    <div className="artiste-detail-page">
      <PageHeader
        title={isEditMode ? `Modifier ${artiste.nom}` : artiste.nom}
        subtitle={artiste.genre}
        backLink={{ label: 'Artistes', path: '/artistes' }}
        actions={
          isEditMode ? (
            <>
              <Button onClick={cancelEdit} variant="text">
                Annuler
              </Button>
              <Button
                onClick={saveChanges}
                variant="primary"
                disabled={Object.keys(errors).length > 0}
              >
                Enregistrer
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setEditMode(true)}>
                Modifier
              </Button>
              <Button onClick={handleDelete} variant="danger">
                Supprimer
              </Button>
            </>
          )
        }
      />

      {isEditMode ? (
        <ArtisteForm
          formState={formState}
          handleChange={handleChange}
          errors={errors}
        />
      ) : (
        <div className="artiste-details">
          <Section title="Informations générales">
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Nom</span>
                <span className="value">{artiste.nom}</span>
              </div>
              <div className="info-item">
                <span className="label">Genre</span>
                <span className="value">{artiste.genre}</span>
              </div>
              {artiste.alias && (
                <div className="info-item">
                  <span className="label">Alias</span>
                  <span className="value">{artiste.alias}</span>
                </div>
              )}
              {artiste.biographie && (
                <div className="info-item full-width">
                  <span className="label">Biographie</span>
                  <span className="value">{artiste.biographie}</span>
                </div>
              )}
            </div>
          </Section>
          
          <Section title="Contacts">
            {artiste.contacts && artiste.contacts.length > 0 ? (
              <div className="contacts-list">
                {artiste.contacts.map((contact, index) => (
                  <ContactCard key={index} contact={contact} />
                ))}
              </div>
            ) : (
              <EmptyState
                message="Aucun contact renseigné pour cet artiste."
                variant="compact"
              />
            )}
          </Section>
          
          <Section 
            title={`Concerts (${concerts ? concerts.length : 0})`} 
            loading={concertsLoading}
          >
            {concerts && concerts.length > 0 ? (
              <ConcertsTable concerts={concerts} />
            ) : (
              <EmptyState
                message="Aucun concert programmé pour cet artiste."
                variant="compact"
                action={
                  <Button 
                    onClick={() => navigate('/concerts/nouveau', { state: { artisteId: artiste.id }})}
                    variant="primary"
                    size="small"
                  >
                    Programmer un concert
                  </Button>
                }
              />
            )}
          </Section>
          
          <Section title="Documents">
            {documents && documents.length > 0 ? (
              <DocumentsList documents={documents} />
            ) : (
              <EmptyState
                message="Aucun document associé à cet artiste."
                variant="compact"
              />
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
```

## useArtisteForm

**But :** Gérer le formulaire de création et d'édition d'un artiste

**Paramètres :** 
- `id: string` (optionnel) - ID de l'artiste à éditer (null pour une création)
- `options: object` (optionnel) - Options de configuration incluant:
  - `onSuccess: (id) => void` - Callback après sauvegarde réussie
  - `redirectToDetail: boolean` - Si l'utilisateur doit être redirigé vers la page de détail après sauvegarde (défaut: true)

**Dépendances :**
- Firebase (collection, doc, addDoc, updateDoc, serverTimestamp)
- React (useState, useEffect, useCallback)
- hooks/forms/useFormValidation.js
- hooks/common/useNotification.js

**Fonctionnalités principales :**
- Initialisation du formulaire avec valeurs par défaut ou données existantes
- Validation des champs du formulaire
- Gestion des contacts multiples
- Téléchargement et gestion des fichiers (photos, documents)
- Sauvegarde des données en base

**Retourne :**
```javascript
{
  formValues,           // Valeurs actuelles du formulaire
  handleChange,         // Fonction de gestion des changements de valeurs
  handleBlur,           // Fonction de gestion de perte de focus
  handleSubmit,         // Fonction de soumission du formulaire
  isSubmitting,         // Si le formulaire est en cours de soumission
  isLoading,            // Si les données initiales sont en cours de chargement
  errors,               // Erreurs de validation
  touched,              // Champs ayant perdu le focus
  isValid,              // Si le formulaire est valide
  addContact,           // Fonction pour ajouter un contact
  removeContact,        // Fonction pour supprimer un contact
  handleFileUpload,     // Fonction pour télécharger un fichier
  handleFileDelete,     // Fonction pour supprimer un fichier
  resetForm,            // Fonction pour réinitialiser le formulaire
  submissionError,      // Erreur de soumission éventuelle
  clearSubmissionError  // Fonction pour effacer l'erreur de soumission
}
```

**Exemple d'utilisation :**

```jsx
import { useArtisteForm } from '../hooks/artistes/useArtisteForm';

function ArtisteFormPage({ match, history }) {
  const artisteId = match.params.id;
  const isEditMode = !!artisteId;
  
  const {
    formValues,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    isLoading,
    errors,
    touched,
    addContact,
    removeContact,
    handleFileUpload,
    submissionError
  } = useArtisteForm(artisteId, {
    onSuccess: (id) => {
      history.push(`/artistes/${id}`);
    }
  });

  if (isLoading) {
    return <LoadingSpinner message="Chargement des données..." />;
  }

  return (
    <div className="artiste-form-page">
      <PageHeader 
        title={isEditMode ? "Modifier l'artiste" : "Nouvel artiste"}
        backLink={{ label: "Artistes", path: "/artistes" }}
      />
      
      <form onSubmit={handleSubmit} className="form-container">
        {submissionError && (
          <AlertMessage 
            type="error" 
            message={submissionError} 
          />
        )}
        
        <Section title="Informations générales">
          <FormRow>
            <TextField
              label="Nom *"
              name="nom"
              value={formValues.nom}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.nom && errors.nom}
              helperText={touched.nom && errors.nom}
              required
              fullWidth
            />
            
            <Select
              label="Genre musical *"
              name="genre"
              value={formValues.genre}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.genre && errors.genre}
              helperText={touched.genre && errors.genre}
              options={genresOptions}
              required
            />
          </FormRow>
          
          <FormRow>
            <TextField
              label="Alias / Autre nom"
              name="alias"
              value={formValues.alias}
              onChange={handleChange}
              fullWidth
            />
          </FormRow>
          
          <FormRow>
            <TextField
              label="Biographie"
              name="biographie"
              value={formValues.biographie}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />
          </FormRow>
        </Section>
        
        <Section 
          title="Contacts" 
          subtitle="Ajoutez les contacts pour cet artiste"
          actions={
            <Button 
              variant="text" 
              onClick={addContact}
              startIcon={<PlusIcon />}
            >
              Ajouter un contact
            </Button>
          }
        >
          {formValues.contacts && formValues.contacts.map((contact, index) => (
            <ContactForm
              key={index}
              contact={contact}
              index={index}
              onChange={handleChange}
              onBlur={handleBlur}
              onDelete={() => removeContact(index)}
              errors={errors}
              touched={touched}
            />
          ))}
          
          {(!formValues.contacts || formValues.contacts.length === 0) && (
            <EmptyState
              message="Aucun contact ajouté pour cet artiste."
              variant="compact"
            />
          )}
        </Section>
        
        <Section title="Documents et fichiers">
          <FileUploadSection
            files={formValues.documents}
            onUpload={handleFileUpload}
            onDelete={(index) => handleFileDelete('documents', index)}
            accept=".pdf,.doc,.docx"
            maxSize={10 * 1024 * 1024} // 10MB
          />
        </Section>
        
        <div className="form-actions">
          <Button 
            variant="text" 
            onClick={() => history.goBack()}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditMode ? "Enregistrer" : "Créer l'artiste"}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

## useArtisteSearch

**But :** Recherche spécialisée pour les artistes

**Paramètres :**
- `options: object` (optionnel) - Options de recherche incluant:
  - `limit: number` - Nombre maximum de résultats (défaut: 10)
  - `exclude: Array<string>` - IDs d'artistes à exclure
  - `onSelect: (artiste) => void` - Callback lors de la sélection
  - `allowCreate: boolean` - Si la création d'un nouvel artiste est permise (défaut: true)

**Dépendances :**
- Firebase (collection, query, where, orderBy, limit, getDocs)
- React (useState, useEffect, useRef)
- hooks/common/useDebounce.js

**Fonctionnalités principales :**
- Recherche d'artistes avec debounce pour limiter les appels
- Filtrage par genre
- Exclusion d'artistes spécifiques
- Création rapide d'un nouvel artiste
- Sélection d'artistes existants

**Retourne :**
```javascript
{
  searchTerm,           // Terme de recherche actuel
  setSearchTerm,        // Fonction pour définir le terme de recherche
  results,              // Résultats de la recherche
  loading,              // État de chargement
  selectedArtiste,      // Artiste sélectionné
  setSelectedArtiste,   // Fonction pour définir l'artiste sélectionné
  handleSelect,         // Fonction pour sélectionner un artiste
  handleRemove,         // Fonction pour supprimer la sélection
  handleCreate,         // Fonction pour créer un nouvel artiste
  showResults,          // Si les résultats doivent être affichés
  dropdownRef,          // Référence React pour le dropdown des résultats
  genreFilter,          // Filtre de genre actuel
  setGenreFilter,       // Fonction pour définir le filtre de genre
  genreOptions          // Options disponibles pour le filtre de genre
}
```

**Exemple d'utilisation :**

```jsx
import { useArtisteSearch } from '../hooks/artistes/useArtisteSearch';

function ArtisteSearchField({ onSelect, excludeIds }) {
  const {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    selectedArtiste,
    handleSelect,
    handleRemove,
    handleCreate,
    showResults,
    dropdownRef,
    genreFilter,
    setGenreFilter,
    genreOptions
  } = useArtisteSearch({
    limit: 5,
    exclude: excludeIds,
    onSelect: onSelect,
    allowCreate: true
  });

  return (
    <div className="artiste-search-field" ref={dropdownRef}>
      {!selectedArtiste ? (
        <>
          <div className="search-input-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un artiste..."
              className="search-input"
            />
            
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="genre-filter"
            >
              <option value="">Tous les genres</option>
              {genreOptions.map(genre => (
                <option key={genre.value} value={genre.value}>
                  {genre.label}
                </option>
              ))}
            </select>
          </div>
          
          {showResults && (
            <div className="search-results">
              {loading ? (
                <div className="search-loading">
                  Recherche...
                </div>
              ) : results.length > 0 ? (
                <ul className="results-list">
                  {results.map(artiste => (
                    <li
                      key={artiste.id}
                      onClick={() => handleSelect(artiste)}
                      className="result-item"
                    >
                      <span className="result-name">{artiste.nom}</span>
                      <span className="result-genre">{artiste.genre}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-results">
                  <p>Aucun résultat trouvé</p>
                  <button 
                    onClick={() => handleCreate(searchTerm)}
                    className="create-button"
                  >
                    Créer "{searchTerm}"
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="selected-artiste">
          <div className="selected-info">
            <span className="selected-name">{selectedArtiste.nom}</span>
            <span className="selected-genre">{selectedArtiste.genre}</span>
          </div>
          <button 
            onClick={handleRemove} 
            className="remove-button"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
```

## useArtisteConcerts

**But :** Gérer les concerts associés à un artiste

**Paramètres :**
- `artisteId: string` - ID de l'artiste
- `options: object` (optionnel) - Options de configuration incluant:
  - `limit: number` - Nombre de concerts à charger (défaut: 10)
  - `status: Array<string>` - Filtrer par statuts spécifiques
  - `sortBy: string` - Champ de tri (défaut: 'date')
  - `sortOrder: 'asc'|'desc'` - Ordre de tri (défaut: 'asc' pour dates futures, 'desc' pour dates passées)

**Dépendances :**
- Firebase (collection, query, where, orderBy, limit)
- React (useState, useEffect, useCallback)
- hooks/concerts/useConcertData.js

**Fonctionnalités principales :**
- Chargement des concerts associés à un artiste
- Filtrage par statut
- Tri par date ou autres critères
- Séparation des concerts passés et futurs
- Pagination et chargement de données supplémentaires

**Retourne :**
```javascript
{
  concerts,                // Tous les concerts chargés
  futureConcerts,          // Concerts à venir
  pastConcerts,            // Concerts passés
  loading,                 // État de chargement
  error,                   // Erreur éventuelle
  hasMore,                 // S'il y a plus de concerts à charger
  loadMore,                // Fonction pour charger plus de concerts
  refresh,                 // Fonction pour rafraîchir la liste
  filterByStatus,          // Fonction pour filtrer par statut
  currentFilters,          // Filtres actuellement appliqués
  clearFilters,            // Fonction pour effacer les filtres
  totalConcerts,           // Nombre total de concerts (estimé)
  loadingMore              // Si le chargement de données supplémentaires est en cours
}
```

**Exemple d'utilisation :**

```jsx
import { useArtisteConcerts } from '../hooks/artistes/useArtisteConcerts';

function ArtisteConcertsTab({ artisteId }) {
  const {
    futureConcerts,
    pastConcerts,
    loading,
    error,
    hasMore,
    loadMore,
    filterByStatus,
    currentFilters,
    clearFilters,
    loadingMore
  } = useArtisteConcerts(artisteId, { limit: 5 });

  const statusOptions = [
    { value: 'confirme', label: 'Confirmé' },
    { value: 'option', label: 'Option' },
    { value: 'annule', label: 'Annulé' }
  ];

  if (loading && !loadingMore) {
    return <LoadingSpinner message="Chargement des concerts..." />;
  }

  if (error) {
    return <AlertMessage type="error" message={error} />;
  }

  return (
    <div className="artiste-concerts">
      <div className="filters-bar">
        <div className="status-filters">
          {statusOptions.map(option => (
            <Chip
              key={option.value}
              label={option.label}
              onClick={() => filterByStatus(option.value)}
              active={currentFilters.status?.includes(option.value)}
              variant="filter"
            />
          ))}
          {Object.keys(currentFilters).length > 0 && (
            <Button 
              variant="text"
              onClick={clearFilters}
              size="small"
            >
              Effacer les filtres
            </Button>
          )}
        </div>
      </div>
      
      <Section title="Concerts à venir">
        {futureConcerts.length > 0 ? (
          <ConcertsTable concerts={futureConcerts} />
        ) : (
          <EmptyState
            message="Aucun concert à venir pour cet artiste."
            variant="compact"
            action={
              <Button 
                onClick={() => navigate('/concerts/nouveau', { state: { artisteId }})}
                variant="primary"
                size="small"
              >
                Programmer un concert
              </Button>
            }
          />
        )}
      </Section>
      
      {pastConcerts.length > 0 && (
        <Section title="Concerts passés">
          <ConcertsTable concerts={pastConcerts} />
        </Section>
      )}
      
      {hasMore && (
        <div className="load-more">
          <Button
            onClick={loadMore}
            variant="text"
            loading={loadingMore}
          >
            Voir plus de concerts
          </Button>
        </div>
      )}
    </div>
  );
}
```

## Navigation
- [Vue d'ensemble des hooks](HOOKS.md)
- [Hooks communs](COMMON_HOOKS.md)
- [Hooks pour les concerts](CONCERT_HOOKS.md)
- [Hooks pour les contrats](CONTRAT_HOOKS.md)
- [Retour à la documentation principale](../README.md)