# Audit des Composants Similaires

*Document créé le: 4 mai 2025*
*Mis à jour le: 5 mai 2025*

## Objectif

Ce document vise à identifier les composants et sous-composants qui ont une fonctionnalité similaire mais des noms différents dans le projet TourCraft. L'objectif est de préparer une refactorisation pour réduire la duplication de code, améliorer la maintenabilité et assurer une expérience utilisateur cohérente dans toute l'application.

## Méthodologie

L'audit a été effectué selon la méthodologie suivante :

1. **Identification des patterns de nommage** : Analyse des modèles de nommage utilisés dans le projet
2. **Regroupement fonctionnel** : Regroupement des composants par fonction principale 
3. **Analyse comparative** : Comparaison de la structure et du comportement des composants similaires
4. **Recommandations** : Propositions d'actions pour fusionner ou standardiser les composants similaires

## Résultats de l'analyse approfondie

Une analyse approfondie du code source a révélé un nombre bien plus important de composants et hooks similaires que ce que notre audit initial avait identifié :

- **48 composants** de type "Section" ont été identifiés dans le projet
- **76 hooks** différents ont été trouvés, avec plusieurs cas de similarité et de duplication

## Composants génériques existants

L'analyse du projet a révélé l'existence de plusieurs composants réutilisables dans les dossiers `/components/common/` et `/components/ui/` :

### Composants dans /components/common/ (11)

- `ActionButton.js` - Bouton d'action général
- `Layout.js`, `MobileLayout.js`, `DesktopLayout.js` - Composants de mise en page
- `Modal.js` - Modal réutilisable
- `PublicFormLayout.js` - Layout pour formulaires publics
- `Spinner.js` - Indicateur de chargement
- `StatusWithInfo.js` - Affichage de statut avec informations
- `UnderConstruction.js` - Page en construction
- `steps/StepNavigation.js` et `steps/StepProgress.js` - Navigation par étapes

### Composants dans /components/ui/ (12)

- `Badge.js` - Badge général
- `StatutBadge.js` - Badge de statut (actuellement un placeholder)
- `ContactDisplay.js` - Affichage d'informations de contact (avec variantes)
- `AddressInput.js` et `AddressDisplay.js` - Gestion d'adresses
- `EntitySearchField.js` - Champ de recherche générique
- `LoadingSpinner.js` et `ErrorMessage.js` - Affichage d'états
- `ActionButton.js` et `Button.js` - Boutons 
- `SectionTitle.js` - Titre de section
- `Card.js` - Carte générique

Certains de ces composants répondent déjà partiellement à nos besoins de standardisation :

#### ContactDisplay.js
Ce composant bien conçu permet déjà l'affichage des informations de contact avec :
- Gestion du nom, prénom, fonction, email, téléphone
- Plusieurs variantes d'affichage ('default', 'compact', 'inline')
- Gestion des valeurs manquantes
- Liens cliquables pour email et téléphone

#### StatutBadge.js
Ce composant existe mais est simplement un placeholder :
```javascript
const StatutBadge = (props) => {
  return <div className={styles.container}>StatutBadge Placeholder</div>;
};
```
Il pourrait être étendu avec notre proposition de `StatusBadge` générique.

## Architecture responsive actuelle

Suite à l'analyse du code, nous avons identifié un pattern d'architecture responsive basé sur des composants façades :

1. **Composant façade** : Situé à la racine du dossier d'entité (ex: `/programmateurs/ProgrammateurForm.js`)
   - Utilise le hook `useResponsive`
   - Charge dynamiquement la version desktop ou mobile du composant selon l'appareil

2. **Composant d'implémentation** : Situé dans un sous-dossier spécifique (ex: `/programmateurs/desktop/ProgrammateurForm.js`)
   - Contient l'implémentation réelle du composant
   - Version spécifique pour desktop ou mobile

Exemple d'un composant façade :
```javascript
// src/components/programmateurs/ProgrammateurForm.js
import React from 'react';
import { useResponsive } from '@/hooks/common/useResponsive';

function ProgrammateurForm(props) {
  const responsive = useResponsive();
  
  const ResponsiveComponent = responsive.getResponsiveComponent({
    desktopPath: 'programmateurs/desktop/ProgrammateurForm',
    mobilePath: 'programmateurs/mobile/ProgrammateurForm'
  });
  
  return <ResponsiveComponent {...props} />;
}
```

Cette architecture n'est pas un problème en soi et est même une bonne pratique pour gérer le responsive. **Ces composants ne sont donc pas redondants** mais font partie d'une architecture délibérée.

## Patterns de nommage identifiés

Les patterns de nommage suivants ont été identifiés dans le projet :

- **EntityForm** : Formulaire de création/édition d'une entité (ex: `ProgrammateurForm`, `LieuForm`)
- **EntityList** : Liste des entités avec fonctionnalités de filtrage (ex: `ProgrammateursList`, `LieuxList`)
- **EntityDetails** : Affichage détaillé d'une entité (ex: `ProgrammateurDetails`, `LieuDetails`)
- **EntitySection** : Sous-section d'un formulaire ou d'une page de détails (ex: `ProgrammateurLegalSection`, `EntrepriseLegalSection`)
- **EntityInfoSection** : Affichage d'informations relatives à une entité (ex: `StructureInfoSection`, `LieuInfoSection`)

## Groupes de composants similaires après analyse approfondie

### 1. Sections légales

| Composant | Chemin | Structure des données | Mode(s) |
|-----------|--------|------------------------|---------|
| ProgrammateurLegalSection | src/components/programmateurs/desktop/ProgrammateurLegalSection.js | - Mode édition : `formData.structure.raisonSociale`<br>- Mode visualisation : `programmateur.structure` | Édition + Visualisation |
| EntrepriseLegalSection | src/components/parametres/sections/EntrepriseLegalSection.js | - Accès direct : `formData.siret` | Édition uniquement |

### 2. Sections d'information de contact

| Composant | Chemin | Structure des données | Fonctionnalité |
|-----------|--------|------------------------|----------------|
| ContactInfoSection | src/components/programmateurs/sections/ContactInfoSection.js | `formData.contact.*` | Informations de contact d'un programmateur |
| ProgrammateurContactSection | src/components/programmateurs/desktop/ProgrammateurContactSection.js | Accès direct aux propriétés | Affichage des informations de contact |

### 3. Sections de localisation et géographie

| Composant | Chemin | Structure des données | Fonctionnalité |
|-----------|--------|------------------------|----------------|
| ConcertLocationSection | src/components/concerts/desktop/ConcertLocationSection.js | Système de recherche + sélection | Lieu d'un concert avec carte |
| ProgrammateurLieuxSection | src/components/programmateurs/desktop/ProgrammateurLieuxSection.js | Liste de lieux associés | Lieux associés à un programmateur |
| LieuInfoSection | src/components/programmateurs/sections/LieuInfoSection.js | Interface de recherche | Sélection d'un lieu |

### 4. Sections d'association d'entités

| Composant | Chemin | Fonctionnalité |
|-----------|--------|----------------|
| ProgrammateurStructuresSection | src/components/programmateurs/desktop/ProgrammateurStructuresSection.js | Association programmateur-structure |
| ConcertArtistSection | src/components/concerts/desktop/ConcertArtistSection.js | Association concert-artiste |
| ConcertOrganizerSection | src/components/concerts/desktop/ConcertOrganizerSection.js | Association concert-organisateur |

### 5. Indicateurs de statut

| Composant | Statuts affichés |
|-----------|-----------------|
| ConcertStatutBadge | 'en_negociation', 'confirme', 'annule', 'termine' |
| ContratStatutBadge | 'brouillon', 'envoyé', 'signé', 'annulé' |
| PaiementStatutIndicator | 'payé', 'partiel', 'en_attente', 'retard' |

## Hooks similaires et dupliqués

Suite à notre analyse approfondie, nous avons identifié plusieurs types de hooks similaires :

### 1. Hooks de formulaire (6 hooks identifiés)

| Hook | Chemin | Fonctionnalités |
|------|--------|----------------|
| useStructureForm | src/hooks/structures/useStructureForm.js | Gestion complète de formulaire avec validation, Firebase |
| useEntrepriseForm | src/hooks/parametres/useEntrepriseForm.js | Gestion de formulaire similaire |
| useConcertForm | src/hooks/forms/useConcertForm.js | **DUPLIQUÉ** avec src/hooks/concerts/useConcertForm.js |
| useProgrammateurForm | src/hooks/programmateurs/useProgrammateurForm.js | Template vide ou en développement |
| useLieuForm | src/hooks/lieux/useLieuForm.js | Gestion de formulaire de lieu |

**Duplication confirmée** : `useConcertForm.js` existe à deux emplacements différents.

### 2. Hooks de détails d'entité

| Hook | Chemin | Fonctionnalités |
|------|--------|----------------|
| useProgrammateurDetails | src/hooks/programmateurs/useProgrammateurDetails.js | Récupération et gestion des détails d'un programmateur |
| useContratDetails | src/hooks/contrats/useContratDetails.js | Récupération et gestion des détails d'un contrat |

Ces hooks partagent une logique similaire :
- Récupération de données depuis Firebase
- Transformation des données
- Gestion des états (chargement, erreur)
- Gestion de l'édition et de la suppression

### 3. Hooks de gestion des recherches

| Hook | Chemin | Fonctionnalités |
|------|--------|----------------|
| useArtisteSearch | src/hooks/artistes/useArtisteSearch.js | Recherche d'artistes |
| useCompanySearch | src/hooks/common/useCompanySearch.js | Recherche d'entreprises |
| useCompanySearch | src/hooks/programmateurs/useCompanySearch.js | **DUPLIQUÉ** - même nom, différent dossier |

## Problèmes d'incohérence structurelle

### 1. Accès aux données imbriquées vs plates

Un problème récurrent est l'incohérence dans l'accès aux données :

- Certains composants accèdent aux données via des chemins imbriqués (`formData.structure.raisonSociale`)
- D'autres utilisent un accès plat (`programmateur.structureType`)
- Certains composants mélangent les deux approches selon le mode (édition vs visualisation)

### 2. Modes multiples vs composants spécialisés

Certains composants comme `ProgrammateurLegalSection` gèrent à la fois un mode édition et un mode visualisation via la prop `isEditing`. D'autres ont des composants distincts pour chaque mode (ex: `ProgrammateurForm` vs `ProgrammateurDetails`).

### 3. Gestion des champs imbriqués

Code presque identique répété dans plusieurs hooks :

```javascript
// Code dupliqué dans plusieurs hooks
if (name.includes('.')) {
  const [parent, child] = name.split('.');
  setFormData(prev => ({
    ...prev,
    [parent]: {
      ...prev[parent],
      [child]: value
    }
  }));
}
```

## Opportunités de refactorisation

### 1. Créer un composant générique `LegalInfoSection`

```jsx
// Proposition de composant générique
function LegalInfoSection({
  data,
  onChange,
  isEditing = false,
  formatValue = val => val,
  fieldMapping = {
    companyName: 'raisonSociale',
    type: 'type',
    siret: 'siret',
    vat: 'tva',
    address: 'adresse',
    zipCode: 'codePostal',
    city: 'ville',
    country: 'pays'
  }
}) {
  // Le composant utiliserait fieldMapping pour accéder aux données
  // indépendamment de leur structure dans l'objet source
  // ...
}
```

Ce composant pourrait remplacer à la fois `ProgrammateurLegalSection` et `EntrepriseLegalSection`.

### 2. Standardiser les composants de statut

```jsx
// Proposition de composant générique
function StatusBadge({
  status,
  type = 'default', // concert, contrat, paiement, etc.
  size = 'md'
}) {
  const statusMappings = {
    concert: {
      en_negociation: { label: 'En négociation', color: 'warning' },
      confirme: { label: 'Confirmé', color: 'success' },
      // ...
    },
    contrat: {
      brouillon: { label: 'Brouillon', color: 'secondary' },
      // ...
    }
    // autres types...
  };
  
  const { label, color } = statusMappings[type][status] || 
    { label: status, color: 'secondary' };
  
  return <Badge bg={color}>{label}</Badge>;
}
```

### 3. Standardiser l'accès aux données avec des adaptateurs

Plutôt que de modifier directement tous les composants, créer des adaptateurs qui normalisent l'accès aux données :

```jsx
// Exemple d'adaptateur
function withStandardizedData(Component) {
  return function WrappedComponent(props) {
    // Transformer les données de props au format standardisé
    const standardizedProps = transformData(props);
    return <Component {...standardizedProps} />;
  }
}
```

### 4. Hook générique pour les formulaires

Création d'un hook générique pour remplacer les hooks de formulaire similaires :

```javascript
function useGenericForm({
  entityType,
  entityId, 
  initialData, 
  schema,
  collection,
  onSuccess,
  transformers = {}
}) {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(!!entityId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Logique commune de chargement des données
  // Gestion des champs imbriqués
  // Validation et soumission
  // ...

  return {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    loading,
    error,
    // ...
  };
}
```

### 5. Fusionner les hooks dupliqués

Identifier et consolider les hooks dupliqués comme `useConcertForm.js` et `useCompanySearch.js` qui apparaissent dans plusieurs dossiers.

## Plan d'action recommandé

Sur la base de notre analyse des composants existants, nous recommandons l'approche suivante pour la refactorisation:

1. **Réutiliser les composants génériques existants** :
   - Utiliser `ContactDisplay.js` pour l'affichage des informations de contact
   - Étendre le composant placeholder `StatutBadge.js` avec notre logique générique

2. **Créer des nouveaux composants génériques uniquement si nécessaire** :
   - Implémenter `LegalInfoSection` car aucun composant similaire n'existe
   - Placer les nouveaux composants dans `/components/ui/` pour une meilleure organisation

3. **Standardiser la structure des données** :
   - Adopter l'approche définie dans `STANDARDISATION_MODELES.md`
   - Créer des adaptateurs pour la transition

4. **Priorité aux hooks** :
   - Résoudre immédiatement les duplications de hooks (useConcertForm.js, useCompanySearch.js)
   - Créer `useGenericForm` pour standardiser les hooks de formulaire

5. **Documentation et guides d'utilisation** :
   - Documenter les composants et hooks génériques
   - Fournir des exemples d'utilisation

## Matrice de priorité de mise en œuvre

| Tâche | Impact | Difficulté | Priorité | Statut |
|-------|--------|------------|----------|--------|
| Résoudre les duplications de hooks | Élevé | Faible | 1 | ✅ Terminé |
| Étendre le composant StatutBadge existant | Moyen | Faible | 2 | ✅ Terminé |
| Créer le hook useGenericEntityForm | Élevé | Moyenne | 3 | ✅ Terminé |
| Implémenter LegalInfoSection | Élevé | Moyenne | 4 | ✅ Terminé |
| Créer des adaptateurs pour la standardisation des données | Élevé | Élevée | 5 | ⚠️ En cours |

## Progrès réalisés

Depuis la création de cet audit le 4 mai 2025, des progrès significatifs ont été accomplis dans la refactorisation des composants similaires. Voici un récapitulatif des principales réalisations:

### 1. Résolution des duplications de hooks (✅ Terminé)

* La duplication du hook `useConcertForm.js` a été résolue en consolidant les deux versions en une seule implémentation.
* Le hook a été réimplémenté en utilisant le nouveau hook générique `useGenericEntityForm`.
* Les imports ont été mis à jour dans tous les fichiers concernés pour pointer vers la nouvelle version unique.

### 2. Extension du composant StatutBadge (✅ Terminé)

* Le composant placeholder `StatutBadge.js` a été complètement implémenté avec le support de différents types d'entités.
* Un système configurable de statuts a été mis en place, avec les mappings suivants:
  - Statuts de concerts: 'en_negociation', 'confirme', 'annule', 'termine'
  - Statuts de contrats: 'brouillon', 'envoyé', 'signé', 'annulé'
  - Statuts de factures: 'brouillon', 'envoyee', 'payee', 'retard', 'annulee'
* Des icônes et codes couleur cohérents sont appliqués automatiquement.

### 3. Création du hook useGenericEntityForm (✅ Terminé)

* Le hook générique `useGenericEntityForm` a été implémenté et documenté dans `/docs/hooks/COMMON_HOOKS.md`.
* Ce hook centralise la logique commune des formulaires d'entités:
  - Chargement et sauvegarde des données
  - Gestion des champs imbriqués
  - Gestion des erreurs et validation
  - Association d'entités reliées
* Le hook `useConcertForm` a été migré pour utiliser cette implémentation générique.

### 4. Implémentation de LegalInfoSection (✅ Terminé)

* Le composant générique `LegalInfoSection` a été créé et implémenté.
* Les composants `ProgrammateurLegalSection` et `EntrepriseLegalSection` ont été migrés pour utiliser ce composant générique.
* Le nouveau composant supporte à la fois le mode visualisation et le mode édition.

### 5. Standardisation de l'architecture des hooks (✅ Terminé)

* Une nouvelle organisation des hooks a été mise en place avec une structure par domaine fonctionnel.
* Les hooks sont désormais organisés dans `/hooks/[entité]/` (ex: `/hooks/lieux/`, `/hooks/common/`).
* Une documentation claire et des exemples d'utilisation ont été fournis pour chaque hook.
* Le hook déprécié `useResponsiveComponent` a été remplacé par `useResponsive().getResponsiveComponent()`.

### 6. Standardisation de l'accès aux données (⚠️ En cours)

* L'approche des adaptateurs a été partiellement implémentée via le hook `useGenericEntityForm`.
* Travail en cours pour normaliser la structure des données à travers l'application.
* Des transformers standardisés pour les formulaires ont été mis en place.

## Conclusion

L'audit des composants similaires a servi de feuille de route efficace pour la refactorisation du projet TourCraft. En date du 5 mai 2025, la majorité des recommandations prioritaires ont été mises en œuvre avec succès :

1. ✅ Les duplications de hooks ont été éliminées
2. ✅ Le composant `StatutBadge` a été entièrement implémenté et étendu
3. ✅ Le hook générique `useGenericEntityForm` a été créé et adopté
4. ✅ Le composant `LegalInfoSection` a été implémenté et intégré

Le principal travail restant concerne la standardisation complète de l'accès aux données via l'approche des adaptateurs. Si ce travail est presque terminé au niveau des hooks avec `useGenericEntityForm`, la standardisation complète au niveau des composants nécessite encore du travail.

### Prochaines étapes recommandées

1. **Finaliser les migrations restantes** :
   - Compléter la migration des hooks `useLieuForm` et `useProgrammateurForm` vers `useGenericEntityForm`
   - Migrer les composants `ContratStatusBadge` et `FactureStatusBadge` vers le composant générique `StatutBadge`

2. **Terminer la standardisation de l'accès aux données** :
   - Implémenter la dernière partie des adaptateurs pour standardiser complètement l'accès aux données
   - Finaliser les transformers pour tous les types d'entités

3. **Tests et validation** :
   - Réaliser des tests unitaires et d'intégration pour valider les composants refactorisés
   - Vérifier particulièrement les associations entre entités qui pourraient avoir été affectées

4. **Finalisation de la documentation** :
   - Documenter les adaptateurs et transformers mis en place
   - Mettre à jour les guides d'utilisation avec les dernières modifications

La refactorisation progresse de manière significative et apporte déjà des améliorations notables en termes de maintenabilité et de cohérence du code.

---

*Ce document a été mis à jour le 5 mai 2025 pour refléter les avancées significatives dans la refactorisation des composants similaires.*