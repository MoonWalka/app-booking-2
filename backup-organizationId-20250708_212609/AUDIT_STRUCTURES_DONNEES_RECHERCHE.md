# Audit Complet des Structures de Données pour le Système de Recherche

## 1. ContactForm - Structure des données contacts

### Champs principaux (personne)
- **prenom** : Prénom du contact
- **nom** : Nom du contact
- **prenomNom** : Concaténation prénom + nom
- **email** / **mailDirect** : Email principal
- **telephone** / **telDirect** : Téléphone principal
- **mobile** : Téléphone mobile
- **fonction** : Fonction/poste occupé
- **civilite** : Civilité (M., Mme, etc.)

### Champs d'adresse personnelle
- **adresse** : Adresse postale
- **suiteAdresse** : Complément d'adresse
- **codePostal** : Code postal
- **ville** : Ville
- **departement** : Département
- **region** : Région
- **pays** : Pays (défaut: "France")

### Champs structure associée
- **structureId** : ID de la structure liée
- **structureRaisonSociale** : Raison sociale
- **structureType** : Type de structure
- **structureSiret** : N° SIRET
- **structureAdresse** : Adresse de la structure
- **structureCodePostal** : Code postal structure
- **structureVille** : Ville structure
- **structureTva** : N° TVA
- **structureNumeroIntracommunautaire** : N° intracommunautaire
- **structureSiteWeb** : Site web

### Champs diffusion/festival
- **nomFestival** : Nom du festival
- **periodeFestivalMois** : Mois du festival
- **periodeFestivalComplete** : Période complète
- **bouclage** : Informations de bouclage
- **diffusionCommentaires1/2/3** : Commentaires diffusion

### Champs qualification
- **tags** : Tags/activités (array)
- **client** : Est client (boolean)
- **source** : Source du contact

### Champs salle
- **salleNom** : Nom de la salle
- **salleAdresse** : Adresse salle
- **salleCodePostal** : Code postal salle
- **salleVille** : Ville salle
- **salleJauge1/2/3** : Jauges de la salle
- **salleOuverture** : Ouverture scène
- **salleProfondeur** : Profondeur scène
- **salleHauteur** : Hauteur sous plafond

### Associations
- **lieuxIds** : Array d'IDs de lieux associés
- **datesIds** : Array d'IDs de dates associées

### Métadonnées
- **notes** : Notes/commentaires libres
- **createdAt** : Date de création
- **updatedAt** : Date de mise à jour
- **entrepriseId** : ID de l'organisation
- **migrationVersion** : Version de migration ("unified-v1")

### Support multi-personnes
- Personne 2 : Tous les champs dupliqués avec suffixe "2"
- Personne 3 : Tous les champs dupliqués avec suffixe "3"

## 2. Tags et Activités

### Tags principaux (CONTACT_TAGS)
1. **organisme-institution** : Organismes publics, institutions culturelles
2. **disque** : Labels, distributeurs, producteurs musicaux
3. **ressource-formation** : Centres de formation, ressources pédagogiques
4. **media** : Presse, radio, télévision, médias en ligne
5. **artiste** : Musiciens, groupes, artistes indépendants
6. **public** : Spectateurs, fans, public général
7. **adherent** : Membres adhérents, abonnés
8. **personnel** : Employés, collaborateurs internes
9. **diffuseur** : Salles de spectacle, festivals, lieux de diffusion
10. **agent-entrepreneur** : Agents artistiques, entrepreneurs de spectacles
11. **prestataire** : Fournisseurs de services, prestataires techniques

### Hiérarchie des tags (TAGS_HIERARCHY)
Structure arborescente avec sous-catégories détaillées pour chaque tag principal.

### Genres musicaux (GENRES_HIERARCHY)
- **musique** : Classique, Musiques actuelles (avec sous-genres)
- **arts-vivants** : Arts de rue, Cirque, Danse, Théâtre, etc.
- **pluridisciplinaire**
- **arts-plastiques**
- **cinema**
- **expositions**
- **video-arts-numeriques**
- **jeune-public**

### Réseaux (RESEAUX_HIERARCHY)
Liste de 53 réseaux professionnels (Fedelima, SMAC, etc.)

### Mots-clés personnalisés (MOTS_CLES_HIERARCHY)
Gérés par l'utilisateur

## 3. Lieux - Structure des données

### Champs principaux
- **nom** : Nom du lieu (requis)
- **type** : Type de lieu (bar, festival, salle, plateau, autre)
- **capacite** : Capacité maximale en personnes

### Adresse
- **adresse** : Adresse complète
- **codePostal** : Code postal
- **ville** : Ville
- **pays** : Pays

### Associations
- **contactIds** : Array d'IDs de contacts associés

### Métadonnées
- **entrepriseId** : ID de l'organisation
- **createdAt** : Date de création
- **updatedAt** : Date de mise à jour

## 4. Dates - Structure des données

### Champs principaux
- **titre** : Titre de la date (requis)
- **date** : Date de l'événement (requis)
- **montant** : Montant en euros (requis)
- **statut** : Statut (En attente, Confirmé, Annulé, Terminé)

### Associations
- **lieuId** : ID du lieu
- **contactIds** : Array d'IDs de contacts (organisateurs)
- **artisteId** : ID de l'artiste
- **structureId** : ID de la structure

### Métadonnées
- **notes** : Notes/commentaires
- **entrepriseId** : ID de l'organisation
- **createdAt** : Date de création
- **updatedAt** : Date de mise à jour

## 5. Structures - Structure des données

### Champs principaux
- **nom** : Nom de la structure
- **raisonSociale** : Raison sociale
- **type** : Type de structure
- **siret** : N° SIRET
- **tva** : N° TVA intracommunautaire
- **numeroIntracommunautaire** : N° intracommunautaire

### Contact
- **telephone** : Téléphone
- **email** : Email
- **siteWeb** : Site web

### Adresse de facturation
- **adresseFacturation** : Adresse
- **codePostalFacturation** : Code postal
- **villeFacturation** : Ville
- **paysFacturation** : Pays

### Adresse du lieu
- **adresse** : Adresse physique
- **codePostal** : Code postal
- **ville** : Ville
- **pays** : Pays

### Signataire du contrat
- **signataire.prenom** : Prénom
- **signataire.nom** : Nom
- **signataire.fonction** : Fonction
- **signataire.email** : Email
- **signataire.telephone** : Téléphone

### Associations
- **contactIds** : Array d'IDs de contacts
- **concertsIds** : Array d'IDs de concerts/dates
- **lieuxIds** : Array d'IDs de lieux

### Qualification (partagée avec contacts)
- **tags** : Tags/activités
- **source** : Source
- **nomFestival** : Festival associé
- **periodeFestivalMois** : Période festival
- **periodeFestivalComplete** : Période complète
- **bouclage** : Informations bouclage

### Métadonnées
- **notes** : Notes/commentaires
- **entrepriseId** : ID de l'organisation
- **createdAt** : Date de création
- **updatedAt** : Date de mise à jour

## 6. Correspondance avec les critères de recherche

### Critères géographiques
- ✅ Ville : Présent dans contacts, lieux, structures
- ✅ Code postal : Présent dans contacts, lieux, structures
- ✅ Département : Présent dans contacts (calculable depuis code postal)
- ✅ Région : Présent dans contacts (calculable depuis département)
- ✅ Pays : Présent dans toutes les entités

### Critères d'activité
- ✅ Tags/Activités : Système complet avec hiérarchie
- ✅ Type de structure : Présent dans structures
- ✅ Type de lieu : Présent dans lieux

### Critères temporels
- ✅ Date de création : Présent partout (createdAt)
- ✅ Date de mise à jour : Présent partout (updatedAt)
- ✅ Période festival : Présent dans contacts et structures

### Critères techniques (lieux)
- ✅ Capacité/Jauge : Présent dans lieux et contacts (salleJauge)
- ✅ Type de lieu : Présent dans lieux

### Critères relationnels
- ✅ Associations contact-lieu
- ✅ Associations contact-structure
- ✅ Associations contact-date
- ✅ Associations lieu-date
- ✅ Associations structure-date

## 7. Recommandations pour l'implémentation

### Indexation Firebase
Créer des index composites pour :
- `entrepriseId` + `ville`
- `entrepriseId` + `codePostal`
- `entrepriseId` + `tags` (array-contains)
- `entrepriseId` + `createdAt`

### Recherche géographique
1. Implémenter une fonction de calcul département/région depuis code postal
2. Créer une table de correspondance codes postaux → départements → régions
3. Gérer les recherches par proximité géographique

### Recherche par tags
1. Utiliser `array-contains-any` pour rechercher plusieurs tags
2. Implémenter la recherche dans la hiérarchie (parent/enfant)
3. Gérer les synonymes et variations

### Optimisations
1. Dénormaliser certaines données pour éviter les jointures
2. Utiliser la pagination pour les résultats nombreux
3. Mettre en cache les résultats fréquents
4. Implémenter une recherche full-text avec Algolia ou ElasticSearch pour les cas complexes