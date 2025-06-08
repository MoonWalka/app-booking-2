# Associations entre entités

## Introduction

L'application TourCraft maintient des relations bidirectionnelles entre plusieurs entités pour faciliter la navigation et assurer la cohérence des données. Ces relations sont particulièrement importantes dans la gestion des programmateurs, structures, lieux et concerts.

## Types d'associations

### Association Programmateurs - Structures

Les programmateurs peuvent être associés à une structure (salle, association, collectivité, etc.) selon les règles suivantes:

#### Modèle de données
- Un programmateur stocke l'ID de sa structure associée dans le champ `structureId`
- Une structure stocke les IDs des programmateurs associés dans un tableau `programmateurs`
- Cette relation bidirectionnelle permet une navigation facile entre les entités

#### Interface utilisateur
- Dans le formulaire de programmateur, l'utilisateur peut rechercher et sélectionner une structure existante ou créer une nouvelle structure
- Sur la page de détails d'un programmateur, la structure associée est visible dans l'onglet "Structure"
- Sur la page de détails d'une structure, les programmateurs associés sont listés dans l'onglet "Programmateurs"

#### Fonctionnement
- Lorsqu'un programmateur est créé ou modifié avec une structure associée, les références sont automatiquement mises à jour dans les deux entités
- Lorsqu'un programmateur est supprimé, la référence est retirée de la structure associée
- Lorsqu'une structure est supprimée, les programmateurs associés sont mis à jour en conséquence

#### Composants impliqués
- `ProgrammateurStructuresSection`: Affiche la structure associée à un programmateur
- `StructureInfoSection`: Permet la recherche et la sélection d'une structure existante
- `useProgrammateurDetails`: Gère la relation bidirectionnelle et les mises à jour des références

### Association Concerts - Artistes

Les concerts sont associés à des artistes avec les caractéristiques suivantes:

#### Modèle de données
- Un concert stocke l'ID de l'artiste principal dans le champ `artisteId`
- Un artiste stocke les IDs des concerts associés dans un tableau `concerts`
- Possibilité d'ajouter des artistes secondaires (première partie, invités)

#### Interface utilisateur
- Dans le formulaire de concert, l'utilisateur peut rechercher et sélectionner un artiste existant ou créer un nouvel artiste
- Sur la page de détails d'un concert, l'artiste associé est affiché dans la section "Artiste"
- Sur la page de détails d'un artiste, les concerts associés sont listés dans la section "Concerts"

#### Fonctionnement
- Lors de la création ou modification d'un concert, les références sont automatiquement mises à jour dans les deux entités
- Les concerts peuvent être filtrés par artiste
- La suppression d'un concert retire la référence dans l'entité artiste

### Association Concerts - Lieux

Les concerts sont associés à des lieux spécifiques:

#### Modèle de données
- Un concert stocke l'ID du lieu dans le champ `lieuId`
- Un lieu stocke les IDs des concerts qui s'y déroulent dans un tableau `concerts`

#### Interface utilisateur
- Dans le formulaire de concert, l'utilisateur peut rechercher et sélectionner un lieu existant ou créer un nouveau lieu
- Sur la page de détails d'un concert, le lieu est affiché avec ses informations
- Sur la page de détails d'un lieu, tous les concerts associés sont listés chronologiquement

#### Fonctionnement
- Mise à jour automatique des références croisées
- Possibilité de filtrer les concerts par lieu
- Gestion des disponibilités du lieu (éviter les doubles réservations)

### Association Concerts - Programmateurs

Les concerts sont associés à des programmateurs:

#### Modèle de données
- Un concert stocke l'ID du programmateur dans le champ `programmateurId`
- Un programmateur stocke les IDs des concerts qu'il a programmés dans un tableau `concerts`

#### Interface utilisateur
- Dans le formulaire de concert, l'utilisateur peut rechercher et sélectionner un programmateur existant ou créer un nouveau programmateur
- Sur la page de détails d'un concert, le programmateur est affiché avec ses coordonnées
- Sur la page de détails d'un programmateur, tous les concerts qu'il a programmés sont listés

#### Fonctionnement
- Mise à jour automatique des références croisées
- Possibilité de filtrer les concerts par programmateur
- Suivi des interactions avec un programmateur au fil du temps

## Gestion des associations

### Création d'associations

Les associations entre entités peuvent être créées de plusieurs façons:

1. **Lors de la création d'une entité**
   - Exemple: Création d'un concert avec sélection simultanée d'un artiste, d'un lieu et d'un programmateur

2. **Par modification d'une entité existante**
   - Exemple: Ajout d'un programmateur à un concert existant

3. **Par interface dédiée**
   - Exemple: Interface de gestion des structures associées à un programmateur

### Mise à jour des associations

Les associations sont mises à jour automatiquement grâce à des hooks spécifiques:

1. **useConcertAssociations**
   - Gère les associations bidirectionnelles entre concerts et autres entités
   - Assure la cohérence des références croisées

2. **useArtisteAssociations**
   - Gère les associations entre artistes et leurs concerts
   - Maintient la cohérence des données

3. **useProgrammateurStructureAssociations**
   - Gère la relation entre programmateurs et structures
   - Assure la mise à jour des références dans les deux entités

### Suppression d'associations

La suppression d'associations suit ces principes:

1. **Suppression d'une entité**
   - Lorsqu'une entité est supprimée, toutes ses associations sont nettoyées
   - Les références dans les entités associées sont supprimées

2. **Suppression d'une association spécifique**
   - Possibilité de dissocier des entités sans les supprimer
   - Mise à jour automatique des références dans les deux entités

## Avantages du système d'associations

1. **Navigation intuitive**
   - Possibilité de naviguer facilement entre les entités associées
   - Affichage contextuel des entités liées

2. **Intégrité des données**
   - Maintien de la cohérence des références entre entités
   - Prévention des références orphelines

3. **Flexibilité**
   - Possibilité d'ajouter, modifier ou supprimer des associations à tout moment
   - Support pour les associations multiples (un-à-plusieurs, plusieurs-à-plusieurs)

4. **Analyses et statistiques**
   - Possibilité de générer des statistiques basées sur les associations
   - Exemple: nombre de concerts par lieu, programmateur le plus actif, etc.

## Navigation
- [Retour à la documentation principale](../README.md)
- [Documentation des hooks](../hooks/HOOKS.md)
- [Documentation du workflow de concerts](./CONCERT_WORKFLOW.md)
- [Documentation du workflow des contrats](./CONTRAT_WORKFLOW.md)