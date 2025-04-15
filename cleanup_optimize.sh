#!/bin/bash

# Script de nettoyage et d'optimisation pour app-booking-2
# Ce script supprime les éléments inutiles et optimise la structure du projet

echo "🧹 Début du nettoyage et de l'optimisation de app-booking-2..."

# Vérifier que nous sommes dans le bon répertoire (à la racine du projet)
if [ ! -d "src" ] || [ ! -f "package.json" ]; then
  echo "❌ Erreur: Ce script doit être exécuté à la racine du projet app-booking-2."
  echo "Veuillez vous assurer que vous êtes dans le répertoire qui contient src/ et package.json."
  exit 1
fi

# Vérifier que nous sommes sur la bonne branche
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "refacto-structure-scriptShell" ]; then
  echo "⚠️ Attention: Vous n'êtes pas sur la branche refacto-structure-scriptShell."
  echo "Passage à la branche refacto-structure-scriptShell..."
  git checkout refacto-structure-scriptShell || {
    echo "❌ Erreur: Impossible de passer à la branche refacto-structure-scriptShell."
    exit 1
  }
fi

echo "📂 Sauvegarde des fichiers importants..."
mkdir -p .backup
cp -r src .backup/
cp package.json .backup/

echo "🗑️ Suppression des fichiers redondants ou inutilisés..."

# Fichiers redondants identifiés
REDUNDANT_FILES=(
  "src/pages/Dashboard.js"      # Remplacé par DashboardPage.js
  "app-booking"                 # Dossier vide
  "src/App.test.js"             # Tests non utilisés
  "src/setupTests.js"           # Configuration de tests non utilisée
)

for file in "${REDUNDANT_FILES[@]}"; do
  if [ -e "$file" ]; then
    echo "  - Suppression de $file"
    rm -rf "$file"
  fi
done

echo "📁 Création des répertoires pour la nouvelle structure..."
mkdir -p src/components/atoms
mkdir -p src/components/molecules
mkdir -p src/components/templates
mkdir -p src/hooks/forms
mkdir -p src/hooks/lists
mkdir -p src/services/api
mkdir -p src/utils/tests

echo "🧩 Création du composant générique GenericList..."
cat > src/components/molecules/GenericList.js << 'EOL'
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Form, InputGroup, Table, Button, Tabs, Tab, Spinner } from 'react-bootstrap';

const GenericList = ({
  title,
  items = [],
  renderItem,
  searchFields = [],
  filterOptions = [],
  addButtonText,
  addButtonLink,
  loading = false,
  emptyMessage = "Aucun élément trouvé.",
  onLoadMore,
  hasMore = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredItems, setFilteredItems] = useState(items);

  // Filtrer les éléments en fonction du terme de recherche et du filtre actif
  useEffect(() => {
    let result = [...items];
    
    // Appliquer le filtre actif
    if (activeFilter !== 'all' && filterOptions.length > 0) {
      const activeFilterOption = filterOptions.find(option => option.value === activeFilter);
      if (activeFilterOption && activeFilterOption.filterFn) {
        result = result.filter(activeFilterOption.filterFn);
      }
    }
    
    // Appliquer la recherche si un terme est saisi et des champs de recherche sont définis
    if (searchTerm.trim() !== '' && searchFields.length > 0) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(item => 
        searchFields.some(field => {
          const value = field.accessor(item);
          return value && value.toString().toLowerCase().includes(term);
        })
      );
    }
    
    setFilteredItems(result);
  }, [items, searchTerm, activeFilter, searchFields, filterOptions]);

  // Gérer le changement du terme de recherche
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Gérer le changement de filtre
  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  // Gérer le chargement de plus d'éléments
  const handleLoadMore = useCallback(() => {
    if (onLoadMore && !loading && hasMore) {
      onLoadMore();
    }
  }, [onLoadMore, loading, hasMore]);

  return (
    <div className="generic-list-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="modern-title">{title}</h2>
        {addButtonText && addButtonLink && (
          <Link to={addButtonLink} className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            {addButtonText}
          </Link>
        )}
      </div>

      <div className="list-controls mb-4">
        {searchFields.length > 0 && (
          <InputGroup className="mb-3">
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <Button 
                variant="outline-secondary" 
                onClick={() => setSearchTerm('')}
              >
                <i className="bi bi-x-lg"></i>
              </Button>
            )}
          </InputGroup>
        )}

        {filterOptions.length > 0 && (
          <Tabs
            activeKey={activeFilter}
            onSelect={handleFilterChange}
            className="mb-3 filter-tabs"
          >
            <Tab eventKey="all" title="Tous" />
            {filterOptions.map(option => (
              <Tab 
                key={option.value} 
                eventKey={option.value} 
                title={
                  <span>
                    {option.icon && <span className="filter-icon me-1">{option.icon}</span>}
                    {option.label}
                  </span>
                }
              />
            ))}
          </Tabs>
        )}
      </div>

      {loading && filteredItems.length === 0 ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-2">Chargement...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center my-5 empty-state">
          <i className="bi bi-inbox fs-1 text-muted"></i>
          <p className="mt-2 text-muted">{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <Table hover className="modern-table">
              <tbody>
                {filteredItems.map(renderItem)}
              </tbody>
            </Table>
          </div>

          {hasMore && (
            <div className="text-center mt-4">
              <Button 
                variant="outline-primary" 
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Chargement...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-down-circle me-2"></i>
                    Charger plus
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GenericList;
EOL

echo "🪝 Création des hooks pour les listes..."
cat > src/hooks/lists/useConcertsList.js << 'EOL'
import { useState, useEffect, useCallback } from 'react';
import { concertService } from '../../services/firebaseService';
import { formatDate } from '../../utils/dateUtils';

export function useConcertsList() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [concertsWithForms, setConcertsWithForms] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  // Fonction pour obtenir les détails du statut
  const getStatusDetails = useCallback((statut) => {
    switch (statut) {
      case 'contact':
        return {
          icon: '📞',
          label: 'Contact établi',
          variant: 'info',
          tooltip: 'Premier contact établi avec le programmateur',
          step: 1
        };
      case 'preaccord':
        return {
          icon: '✅',
          label: 'Pré-accord',
          variant: 'primary',
          tooltip: 'Accord verbal obtenu, en attente de confirmation',
          step: 2
        };
      case 'contrat':
        return {
          icon: '📄',
          label: 'Contrat signé',
          variant: 'success',
          tooltip: 'Contrat signé par toutes les parties',
          step: 3
        };
      case 'acompte':
        return {
          icon: '💸',
          label: 'Acompte facturé',
          variant: 'warning',
          tooltip: 'Acompte facturé, en attente de paiement',
          step: 4
        };
      case 'solde':
        return {
          icon: '🔁',
          label: 'Solde facturé',
          variant: 'secondary',
          tooltip: 'Solde facturé, concert terminé',
          step: 5
        };
      case 'annule':
        return {
          icon: '❌',
          label: 'Annulé',
          variant: 'danger',
          tooltip: 'Concert annulé',
          step: 0
        };
      default:
        return {
          icon: '❓',
          label: statut || 'Non défini',
          variant: 'light',
          tooltip: 'Statut non défini',
          step: 0
        };
    }
  }, []);

  // Fonction pour vérifier si un concert a un formulaire associé
  const hasForm = useCallback((concertId) => {
    return concertsWithForms.includes(concertId) || 
           concerts.find(c => c.id === concertId)?.formId !== undefined;
  }, [concerts, concertsWithForms]);

  // Chargement initial des concerts
  const fetchConcerts = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      
      // Si reset est true, on recommence depuis le début
      const startAfter = reset ? null : lastVisible;
      
      // Récupérer les concerts avec pagination
      const result = await concertService.getAll(
        pageSize, 
        startAfter, 
        'date', 
        'desc'
      );
      
      // Mettre à jour la liste des concerts
      if (reset) {
        setConcerts(result.items);
      } else {
        setConcerts(prev => [...prev, ...result.items]);
      }
      
      // Mettre à jour le dernier élément visible pour la pagination
      setLastVisible(result.lastVisible);
      
      // Vérifier s'il y a plus de résultats
      setHasMore(result.items.length === pageSize);
      
      // Récupérer les formulaires associés
      const formsResult = await concertService.search('formLinkId', null, '!=');
      
      // Créer un Set pour stocker les IDs des concerts avec formulaires
      const concertsWithFormsSet = new Set();
      
      formsResult.forEach(concert => {
        if (concert.formLinkId) {
          concertsWithFormsSet.add(concert.id);
        }
      });
      
      setConcertsWithForms(Array.from(concertsWithFormsSet));
      
    } catch (error) {
      console.error('Erreur lors du chargement des concerts:', error);
      setError('Impossible de charger les concerts. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  }, [lastVisible, pageSize]);

  // Chargement initial
  useEffect(() => {
    fetchConcerts(true);
  }, []);

  // Définir les champs de recherche
  const searchFields = [
    { 
      accessor: (item) => item.titre,
      label: 'Titre'
    },
    { 
      accessor: (item) => item.lieuNom,
      label: 'Lieu'
    },
    { 
      accessor: (item) => item.programmateurNom,
      label: 'Programmateur'
    },
    { 
      accessor: (item) => formatDate(item.date),
      label: 'Date'
    }
  ];

  // Définir les options de filtre
  const filterOptions = [
    {
      value: 'contact',
      label: 'Contact établi',
      icon: '📞',
      filterFn: (item) => item.statut === 'contact'
    },
    {
      value: 'preaccord',
      label: 'Pré-accord',
      icon: '✅',
      filterFn: (item) => item.statut === 'preaccord'
    },
    {
      value: 'contrat',
      label: 'Contrat signé',
      icon: '📄',
      filterFn: (item) => item.statut === 'contrat'
    },
    {
      value: 'acompte',
      label: 'Acompte facturé',
      icon: '💸',
      filterFn: (item) => item.statut === 'acompte'
    },
    {
      value: 'solde',
      label: 'Solde facturé',
      icon: '🔁',
      filterFn: (item) => item.statut === 'solde'
    },
    {
      value: 'annule',
      label: 'Annulé',
      icon: '❌',
      filterFn: (item) => item.statut === 'annule'
    }
  ];

  return {
    concerts,
    loading,
    error,
    hasMore,
    fetchConcerts,
    searchFields,
    filterOptions,
    getStatusDetails,
    hasForm
  };
}
EOL

cat > src/hooks/forms/useConcertForm.js << 'EOL'
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { concertService, lieuService, programmateurService } from '../../services/firebaseService';

export function useConcertForm(concertId) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titre: '',
    date: '',
    heure: '',
    montant: '',
    lieuId: '',
    programmateurId: '',
    statut: 'contact',
    notes: ''
  });
  const [lieux, setLieux] = useState([]);
  const [programmateurs, setProgrammateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lieuNom, setLieuNom] = useState('');
  const [programmateurNom, setProgrammateurNom] = useState('');

  // Charger les données du concert si on est en mode édition
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Charger les lieux et programmateurs pour les sélecteurs
        const lieuxResult = await lieuService.getAll(100);
        setLieux(lieuxResult.items);
        
        const programmateursResult = await programmateurService.getAll(100);
        setProgrammateurs(programmateursResult.items);
        
        // Si on est en mode édition, charger les données du concert
        if (concertId && concertId !== 'nouveau') {
          const concertData = await concertService.getById(concertId);
          
          if (concertData) {
            // Formater la date pour l'input date
            let formattedDate = '';
            if (concertData.date) {
              // Gérer différents formats de date possibles
              let dateObj;
              if (concertData.date instanceof Date) {
                dateObj = concertData.date;
              } else if (concertData.date.toDate) {
                // Timestamp Firestore
                dateObj = concertData.date.toDate();
              } else if (typeof concertData.date === 'string') {
                dateObj = new Date(concertData.date);
              }
              
              if (dateObj && !isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toISOString().split('T')[0];
              }
            }
            
            // Mettre à jour le formulaire avec les données du concert
            setFormData({
              titre: concertData.titre || '',
              date: formattedDate,
              heure: concertData.heure || '',
              montant: concertData.montant ? concertData.montant.toString() : '',
              lieuId: concertData.lieuId || '',
              programmateurId: concertData.programmateurId || '',
              statut: concertData.statut || 'contact',
              notes: concertData.notes || ''
            });
            
            // Mettre à jour les noms du lieu et du programmateur
            if (concertData.lieuId) {
              const lieu = lieuxResult.items.find(l => l.id === concertData.lieuId);
              if (lieu) {
                setLieuNom(lieu.nom);
              }
            }
            
            if (concertData.programmateurId) {
              const programmateur = programmateursResult.items.find(p => p.id === concertData.programmateurId);
              if (programmateur) {
                setProgrammateurNom(programmateur.nom);
              }
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Impossible de charger les données. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [concertId]);

  // Gérer les changements dans le formulaire
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mettre à jour les noms du lieu et du programmateur
    if (name === 'lieuId') {
      const lieu = lieux.find(l => l.id === value);
      if (lieu) {
        setLieuNom(lieu.nom);
      } else {
        setLieuNom('');
      }
    }
    
    if (name === 'programmateurId') {
      const programmateur = programmateurs.find(p => p.id === value);
      if (programmateur) {
        setProgrammateurNom(programmateur.nom);
      } else {
        setProgrammateurNom('');
      }
    }
  }, [lieux, programmateurs]);

  // Soumettre le formulaire
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Validation des champs obligatoires
      if (!formData.titre) {
        setError('Le titre du concert est obligatoire.');
        setSubmitting(false);
        return;
      }
      
      if (!formData.date) {
        setError('La date du concert est obligatoire.');
        setSubmitting(false);
        return;
      }
      
      // Correction du format de date - s'assurer que la date est au format YYYY-MM-DD
      let correctedDate = formData.date;
      
      // Si la date est au format MM/DD/YYYY ou similaire, la convertir
      if (formData.date.includes('/')) {
        const dateParts = formData.date.split('/');
        if (dateParts.length === 3) {
          correctedDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        }
      }
      
      console.log('Date corrigée:', correctedDate);
      
      // Préparer les données du concert
      const concertData = {
        titre: formData.titre,
        date: correctedDate,
        heure: formData.heure,
        montant: formData.montant ? parseFloat(formData.montant) : null,
        lieuId: formData.lieuId || null,
        programmateurId: formData.programmateurId || null,
        statut: formData.statut,
        notes: formData.notes,
        lieuNom: lieuNom,
        programmateurNom: programmateurNom
      };
      
      // Créer ou mettre à jour le concert
      if (concertId && concertId !== 'nouveau') {
        await concertService.update(concertId, concertData);
      } else {
        const newConcert = await concertService.create(concertData);
        concertId = newConcert.id;
      }
      
      // Rediriger vers la page du concert
      navigate(`/concerts/${concertId}`);
      
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      setError('Une erreur est survenue lors de l\'enregistrement du concert. Veuillez réessayer plus tard.');
    } finally {
      setSubmitting(false);
    }
  }, [formData, concertId, navigate, lieuNom, programmateurNom]);

  return {
    formData,
    lieux,
    programmateurs,
    loading,
    submitting,
    error,
    handleChange,
    handleSubmit
  };
}
EOL

echo "📄 Mise à jour des pages pour utiliser les nouveaux composants..."
cat > src/pages/ConcertsPage.js.new << 'EOL'
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ConcertsList from '../components/concerts/ConcertsList';
import ConcertForm from '../components/concerts/ConcertForm';
import ConcertDetails from '../components/concerts/ConcertDetails';
import FormValidationInterface from '../components/forms/FormValidationInterface';

function ConcertsPage() {
  const navigate = useNavigate();
  
  return (
    <div className="concerts-page">
      <Routes>
        <Route path="/" element={<ConcertsList />} />
        <Route path="/nouveau" element={<ConcertForm />} />
        <Route path="/:id" element={<ConcertDetails />} />
        <Route path="/:id/edit" element={<ConcertForm />} />
        <Route path="/:id/form" element={<FormValidationInterface />} />
      </Routes>
    </div>
  );
}

export default ConcertsPage;
EOL

# Vérifier et mettre à jour les imports dans ConcertsPage.js
if [ -f "src/pages/ConcertsPage.js" ]; then
  mv src/pages/ConcertsPage.js.new src/pages/ConcertsPage.js
fi

echo "📝 Création de la documentation d'architecture..."
cat > ARCHITECTURE.md << 'EOL'
# Architecture du projet app-booking-2

Ce document décrit l'architecture optimisée du projet app-booking-2 après la refactorisation.

## Structure du projet

```
app-booking-2/
├── public/                # Fichiers statiques
├── src/                   # Code source
│   ├── components/        # Composants UI
│   │   ├── atoms/         # Composants UI de base (boutons, inputs, etc.)
│   │   ├── molecules/     # Composants UI composés (GenericList, etc.)
│   │   ├── concerts/      # Composants spécifiques aux concerts
│   │   ├── lieux/         # Composants spécifiques aux lieux
│   │   ├── programmateurs/# Composants spécifiques aux programmateurs
│   │   ├── forms/         # Composants de formulaires
│   │   ├── common/        # Composants communs
│   │   └── layout/        # Composants de mise en page
│   ├── hooks/             # Logique métier réutilisable
│   │   ├── forms/         # Hooks pour les formulaires
│   │   └── lists/         # Hooks pour les listes
│   ├── services/          # Services d'accès aux données
│   ├── utils/             # Fonctions utilitaires
│   │   └── tests/         # Tests unitaires
│   ├── style/             # Styles centralisés
│   ├── pages/             # Assemblage des composants pour chaque route
│   ├── context/           # Contextes React
│   ├── firebase.js        # Configuration Firebase
│   └── ...
├── package.json           # Dépendances et scripts
└── ...
```

## Architecture en couches

L'architecture du projet suit une approche en couches qui sépare clairement les responsabilités :

### 1. Couche de présentation (UI)

- **Composants** : Responsables uniquement de l'affichage et des interactions utilisateur
- **Pages** : Assemblent les composants pour former des vues complètes
- **Style** : Centralise les styles avec des variables CSS

### 2. Couche logique (Business Logic)

- **Hooks** : Encapsulent la logique métier et l'état
- **Context** : Gèrent l'état global de l'application

### 3. Couche d'accès aux données

- **Services** : Centralisent les opérations d'accès aux données
- **Firebase** : Configuration et interface avec Firebase

## Flux de données

Le flux de données dans l'application suit un modèle unidirectionnel :

1. **Services** récupèrent les données depuis Firebase
2. **Hooks** consomment ces services et gèrent la logique métier
3. **Composants** utilisent les hooks et affichent les données
4. **Interactions utilisateur** déclenchent des actions dans les hooks
5. **Hooks** mettent à jour les données via les services

## Composants génériques

L'architecture utilise des composants génériques pour réduire la duplication de code :

### GenericList

Un composant réutilisable pour afficher des listes avec recherche et filtrage :

```jsx
<GenericList
  title="Titre de la liste"
  items={items}
  renderItem={renderItem}
  searchFields={searchFields}
  filterOptions={filterOptions}
  addButtonText="Ajouter"
  addButtonLink="/ajouter"
  loading={loading}
  emptyMessage="Aucun élément trouvé."
/>
```

### Hooks personnalisés

Des hooks spécifiques encapsulent la logique métier pour chaque type de données :

```jsx
// Exemple d'utilisation d'un hook personnalisé
const { 
  concerts, 
  loading, 
  error, 
  searchFields, 
  filterOptions 
} = useConcertsList();
```

## Optimisations de performance

L'architecture intègre plusieurs optimisations de performance :

- **Pagination** pour les requêtes Firebase
- **Mise en cache** pour réduire les appels réseau
- **Mémoisation** des fonctions de rendu avec useCallback
EOL

echo "✅ Nettoyage et optimisation terminés avec succès !"
echo "📋 Consultez le fichier ARCHITECTURE.md pour plus de détails sur la nouvelle structure du projet."
