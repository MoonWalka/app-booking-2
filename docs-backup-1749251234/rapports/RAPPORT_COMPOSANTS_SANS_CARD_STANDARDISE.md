# Rapport : Composants utilisant des structures de carte sans le composant Card standardisé

Date : 06/01/2025

## Résumé

Ce rapport identifie tous les composants qui utilisent des structures de carte (classes comme `form-card`, `card-header`, `card-body`, etc.) mais n'utilisent PAS le composant Card standardisé de l'application.

## Composants identifiés

### 1. Pages de Concerts

#### Sections Desktop
- **ConcertGeneralInfo.js**
  - Classes utilisées : `form-card`, `card-header`, `card-body`
  - Contenu : Informations générales du concert (titre, date, montant, statut)
  - Aucun import de Card

- **ConcertArtistSection.js**
  - Classes utilisées : `form-card`, `card-header`, `card-body`
  - Contenu : Section artiste du concert
  - Aucun import de Card

- **ConcertLocationSection.js**
  - Classes utilisées : `form-card`, `card-header`, `card-body`
  - Contenu : Section lieu du concert
  - Aucun import de Card

- **ConcertLocationSectionFixed.js**
  - Classes utilisées : `form-card`, `card-header`, `card-body`
  - Contenu : Version corrigée de la section lieu
  - Aucun import de Card

- **ConcertLocationSectionDebug.js**
  - Classes utilisées : `form-card`, `card-header`, `card-body`
  - Contenu : Version debug de la section lieu
  - Aucun import de Card

- **ConcertOrganizerSection.js**
  - Classes utilisées : `form-card`, `card-header`, `card-body`
  - Contenu : Section programmateur du concert
  - Aucun import de Card

- **ConcertOrganizerSectionFixed.js**
  - Classes utilisées : `form-card`, `card-header`, `card-body`
  - Contenu : Version corrigée de la section programmateur
  - Aucun import de Card

- **ConcertStructureSection.js**
  - Classes utilisées : `form-card`, `card-header`, `card-body`
  - Contenu : Section structure du concert
  - Aucun import de Card

### 2. Pages de Programmateurs

- **ProgrammateurView.js**
  - Classes utilisées : `form-card`, `card-header`, `card-body`
  - Contenu : Vue détaillée d'un programmateur
  - Aucun import de Card

### 3. Pages de Structures

#### Sections Desktop
- **StructureLegalSection.js**
  - Classes utilisées : Classes card personnalisées dans le module CSS
  - Contenu : Informations légales de la structure
  - Aucun import de Card

- **StructureAddressSection.js**
  - Classes utilisées : `detailsCard`, `cardHeader`, `cardBody` (via module CSS)
  - Contenu : Section adresse de la structure
  - Aucun import de Card

- **StructureAssociationsSection.js**
  - Classes utilisées : Classes card personnalisées
  - Contenu : Associations de la structure
  - Aucun import de Card

- **StructureBillingSection.js**
  - Classes utilisées : Classes card personnalisées
  - Contenu : Informations de facturation
  - Aucun import de Card

- **StructureConcertsSection.js**
  - Classes utilisées : Classes card personnalisées
  - Contenu : Concerts associés à la structure
  - Aucun import de Card

- **StructureContactSection.js**
  - Classes utilisées : `detailsCard`, `cardHeader`, `cardBody` (via module CSS)
  - Contenu : Contact principal de la structure
  - Aucun import de Card

- **StructureNotesSection.js**
  - Classes utilisées : Classes card personnalisées
  - Contenu : Notes de la structure
  - Aucun import de Card

### 4. Pages de Formulaires

- **PublicProgrammateurForm.js**
  - Classes utilisées : Classes card personnalisées
  - Contenu : Formulaire public pour programmateurs
  - Aucun import de Card

- **FormResponsePage.js**
  - Classes utilisées : Références à `form-card` dans le code
  - Contenu : Page de réponse de formulaire
  - Aucun import de Card

### 5. Contrats

- **CollapsibleSection.js** (contrats/desktop/sections)
  - Classes utilisées : Classes card personnalisées
  - Contenu : Section pliable pour les contrats
  - Aucun import de Card

### 6. Pages Admin

- **MigrationPage.js**
  - Potentiellement utilise des classes card (à vérifier)
  - Contenu : Page de migration multi-organisation
  - Aucun import de Card

## Composants qui utilisent correctement Card

Pour comparaison, voici des exemples de composants qui utilisent correctement le composant Card standardisé :

- **LieuInfoSection.js** - Utilise `Card` avec props `title`, `icon`, `isEditing`
- **ProgrammateurGeneralInfo.js** - Importe et utilise `Card`
- **StructureGeneralInfo.js** - Importe `Card` depuis `@/components/ui/Card`
- **StructureIdentitySection.js** - Utilise le composant Card standardisé

## Actions recommandées

1. **Priorité haute** : Migrer tous les composants de concerts vers le composant Card standardisé
   - ConcertGeneralInfo.js
   - ConcertArtistSection.js
   - ConcertLocationSection.js (et ses variantes)
   - ConcertOrganizerSection.js (et ses variantes)
   - ConcertStructureSection.js

2. **Priorité moyenne** : Migrer les sections de structures
   - Toutes les sections dans `structures/desktop/sections/`
   - StructureLegalSection.js

3. **Priorité normale** : Migrer les autres composants
   - ProgrammateurView.js
   - PublicProgrammateurForm.js
   - FormResponsePage.js
   - CollapsibleSection.js

## Avantages de la migration

- **Cohérence visuelle** : Toutes les cartes auront le même style
- **Maintenance simplifiée** : Un seul composant à maintenir
- **Fonctionnalités avancées** : Le composant Card offre des props comme `collapsible`, `headerActions`, `variant`, etc.
- **Responsive** : Le composant Card est déjà optimisé pour mobile
- **Réduction du CSS** : Moins de classes CSS dupliquées

## Exemple de migration

Avant :
```jsx
<div className="form-card">
  <div className="card-header">
    <i className="bi bi-info-circle"></i>
    <h3>Informations générales</h3>
  </div>
  <div className="card-body">
    {/* Contenu */}
  </div>
</div>
```

Après :
```jsx
import Card from '@/components/ui/Card';

<Card
  title="Informations générales"
  icon={<i className="bi bi-info-circle"></i>}
  isEditing={isEditMode}
>
  {/* Contenu */}
</Card>
```