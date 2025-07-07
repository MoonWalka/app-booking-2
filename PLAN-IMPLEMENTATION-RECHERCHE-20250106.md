# Plan d'implémentation - Système de recherche multi-critères
**Date : 06/01/2025**
**Mise à jour après audit : 06/01/2025**
**Dernière mise à jour : 07/01/2025** - Phase 1 complète + Section Identification connectée

## 🎯 Objectif
Connecter l'interface de recherche multi-critères existante avec les données Firebase pour permettre des recherches fonctionnelles.

## ✅ Résumé de l'audit

### Sections prêtes (données existantes) ✅
- **Identification** : Tous les champs existent
- **Activités** : Système de tags complet  
- **Réseaux** : Via RESEAUX_HIERARCHY
- **Genres** : Via GENRES_HIERARCHY
- **Géolocalisation** : Champs d'adresse complets
- **Festivals** : Via ContactDiffusionSection
- **Salles** : Via ContactSalleSection
- **Dates** : Collection séparée fonctionnelle
- **Artistes** : Collection existante dans Booking > Paramétrage

### Sections à adapter 🔄
- **Personnes** : Manque le champ priorité
- **Mes sélections** : Nouvelle fonctionnalité à créer
- **Historique** : Pas de structure pour dossiers/notes
- **Infos artiste** : Collection existe mais manque des champs spécifiques
- **Projets** : Collection existe mais manque la vue détaillée (fiche projet)

## 📋 Plan d'implémentation révisé

### Phase 1 : Infrastructure de base (2-3 jours)

#### 1.1 Service de recherche principal ✅ COMPLÉTÉ (07/01/2025)
- [x] Créer `services/searchService.js`
- [x] Créer `config/searchFieldsMapping.js` pour le mapping UI → Firebase
- [x] Implémenter les opérateurs de base :
  - `contient` : Recherche textuelle
  - `egal` : Correspondance exacte
  - `entre` : Plage de valeurs
  - `parmi` : Multi-sélection
  - `commence` / `termine` : Préfixe/suffixe
  - `non_renseigne` : Champs vides
  - `different` : Non égal
  - `superieur` / `inferieur` : Comparaisons numériques
- [x] Gestion des critères Firestore vs locaux
- [x] Support de la pagination
- [x] Recherche multi-collections
- [x] Sauvegarde/chargement des recherches

#### 1.2 Intégration dans RechercheLayout ✅ COMPLÉTÉ (07/01/2025)
- [x] Connecter le service de recherche
- [x] Implémenter les fonctions pour les 3 boutons :
  - `handleCalculate()` : Compte les résultats
  - `handleDisplay()` : Affiche les résultats dans la zone centrale
  - `handleSave()` : Sauvegarde la recherche avec modal
- [x] Gérer l'état des résultats
- [x] Créer l'affichage des résultats (tableau avec navigation)
- [x] Modal de sauvegarde fonctionnelle
- [x] Indicateur de chargement et compteur de résultats

### Phase 2 : Sections sans modification de données (3-4 jours)

#### 2.1 Identification ✅ CONNECTÉ (07/01/2025)
- [x] Mapper les champs UI vers Firebase
- [x] Gérer les opérateurs de recherche (contient, égal, commence, termine, différent)
- [x] Gérer les plages de dates (entre, supérieur, inférieur)
- [x] Gérer les booléens (oui/non/indifférent)
- [x] Labels lisibles dans l'affichage des critères
- [x] Mise à jour dynamique des critères (ajout/modification/suppression)

#### 2.2 Activités ✅ CONNECTÉ (07/01/2025)
- [x] Utilisation de TAGS_HIERARCHY depuis la config
- [x] Mapping vers le champ `tags` Firebase
- [x] Support de la hiérarchie complète avec sous-catégories
- [x] Un seul critère pour toutes les activités sélectionnées
- [x] Affichage avec indentation pour les sous-catégories
- [x] Sélection/désélection par catégorie

#### 2.3 Réseaux ✅ CONNECTÉ (07/01/2025)
- [x] Utilisation de RESEAUX_HIERARCHY depuis la config
- [x] Mapping vers le champ `tags` Firebase
- [x] Recherche et filtrage des réseaux
- [x] Sélection multiple avec un seul critère
- [x] Compteur de sélection et affichage des labels

#### 2.4 Genres ✅ CONNECTÉ (07/01/2025)
- [x] Utilisation de GENRES_HIERARCHY depuis la config
- [x] Mapping vers le champ `tags` Firebase (comme activités)
- [x] Support de la hiérarchie complète avec accordéon
- [x] Sélection multiple avec un seul critère
- [x] Affichage avec indentation pour les sous-genres

#### 2.5 Géolocalisation ✅ CONNECTÉ (07/01/2025)
- [x] Mapping complet : codePostal, ville, pays, région, département
- [x] Opérateurs adaptés à chaque type de champ
- [x] Gestion des labels pour pays/région/département
- [x] Suppression des critères vides
- [ ] À faire plus tard : calcul auto département/région depuis code postal

#### 2.6 Festivals ✅ CONNECTÉ (07/01/2025)
- [x] Mapping complet : nomFestival, commentaires, bouclage, periodeFestivalComplete
- [x] Sélection multi-mois pour bouclage
- [x] Grille interactive pour périodes de diffusion
- [x] Conversion des semaines en description lisible
- [x] Tous les opérateurs de recherche supportés

#### 2.7 Salles ✅ CONNECTÉ (07/01/2025)
- [x] Mapping : salleJauge1/2/3, salleOuverture, salleHauteur, salleProfondeur
- [x] Recherche par plage de valeurs (min/max)
- [x] Opérateurs dynamiques : entre, superieur, inferieur
- [x] Unités d'affichage (places, mètres)
- [x] Informations contextuelles sur les critères

#### 2.8 Dates ✅ CONNECTÉ (07/01/2025)
- [x] Utilisation de la collection `dates`
- [x] Implémentation des filtres : niveau, statut, titre, période
- [x] Recherche par artiste et lieu associés
- [x] Recherche par montant (plage de valeurs)
- [x] Recherche dans les notes
- [x] Refonte du champ niveau : utilisation pour les états (Incomplète, Intérêt, Option, Confirmé, Annulé, Reporté)
- [x] Création du composant NiveauDisplay pour l'affichage visuel adapté (barres ou icônes)

### Phase 3 : Ajout de fonctionnalités (2-3 jours)

#### 3.3 PersonnesSection - Connexion au système de recherche
- [ ] Mapper les champs vers Firebase
- [ ] Implémenter tous les filtres existants
- [ ] Gérer les critères multiples

#### 3.1 Personnes - Ajout du champ priorité
- [ ] Ajouter `priorite` dans ContactForm
- [ ] Migration des contacts existants (priorité par défaut)
- [ ] Implémenter le filtre

#### 3.2 Mes sélections - Nouvelle fonctionnalité ✅ COMPLÉTÉ (07/01/2025)
- [x] Créer collection `selections` dans Firebase (utilise la collection existante)
- [x] Structure : `{nom, type, criteres, userId, organizationId, shared, createdAt, updatedAt}`
- [x] Service selectionsService.js pour sauvegarder/charger les sélections
- [x] UI MesSelectionsSection pour gérer les sélections
- [x] Intégration complète dans RechercheLayout avec onLoadSelection
- [x] Modal d'édition et de suppression
- [x] Support des sélections partagées avec l'équipe

### Phase 4 : Sections complexes (7-8 jours)

#### 4.1 Fiche Projet - Nouvelle vue détaillée
- [ ] Créer `ProjetView.js` similaire à `ContactView`
- [ ] Ajouter les nouveaux champs dans la collection projets :
  - [ ] `favori` (boolean)
  - [ ] `suivi` (string)
  - [ ] `estActif` (boolean)
  - [ ] `prixVente`, `frais`, `jaugePossible`, `disponibilites`
  - [ ] `contactsIds` (array) pour les contacts associés
  - [ ] `tags` (array)
  - [ ] `commentaires` (string étendu)
- [ ] Créer les routes `/projets/:id` pour la vue détaillée
- [ ] Créer les sections : En-tête, Infos principales, Contacts liés, Tags/Commentaires
- [ ] Implémenter les onglets de navigation :
  - [ ] `Documentation` - Gestion des documents du projet
  - [ ] `Suivi commercial` - Historique et suivi des échanges
  - [ ] `Gestion de projets` - Planning et tâches
  - [ ] `Devis` - Liste et création de devis
  - [ ] `Dates` - Tableau des dates (réutiliser composant existant)
  - [ ] `Équipe` - Membres de l'équipe projet
- [ ] Service pour gérer les relations bidirectionnelles projet-contact
- [ ] Composant `ProjetTabs` pour la navigation entre sections

#### 4.2 Historique - Structure à créer
- [ ] Option 1 : Sous-collection `historique` par contact
- [ ] Option 2 : Collection globale `historique` avec contactId
- [ ] Décider et implémenter

#### 4.3 Infos artiste - Extension de la fiche artiste existante ✅
- [ ] **Collection `artistes` existe déjà** dans Booking > Paramétrage
- [ ] Étendre ArtisteForm avec 4 nouvelles sections :
  - [ ] ArtisteExtendedInfoSection : formations, anneeCreation, manager, structureGestion, lieuRepetition
  - [ ] ArtisteDisqueSection : label, editeurPhono, environnementDisque, supportAudio, discographie, nombreConcerts
  - [ ] ArtisteSceneSection : environnementScene, referencesScene, tourneur
  - [ ] ArtisteMediaSection : attachePresse, supportVideo, webmaster, environnementMedia, referencesMedia
- [ ] Migration douce : valeurs par défaut pour artistes existants
- [ ] Indexation des nouveaux champs pour la recherche

### Phase 5 : Optimisation (2 jours)

#### 5.1 Index Firebase
- [ ] Créer les index composites nécessaires
- [ ] Documenter dans `firestore.indexes.json`

#### 5.2 Performance
- [ ] Pagination des résultats
- [ ] Cache des requêtes fréquentes
- [ ] Debounce sur les champs texte

### Phase 6 : Tests et documentation (2 jours)

#### 6.1 Tests
- [ ] Tests unitaires searchService
- [ ] Tests d'intégration par section
- [ ] Tests de performance avec volume

#### 6.2 Documentation
- [ ] Guide utilisateur
- [ ] Documentation technique
- [ ] Exemples de requêtes

## 🚀 Ordre de priorité recommandé

1. **Jour 1** : ~~Phase 1 complète~~ ✅ + ~~Phase 2 complète~~ ✅
2. **Semaine 1** : Phase 3 (fonctionnalités simples)
3. **Semaine 2** : Phase 4 (sections complexes)
4. **Semaine 3** : Phase 5 (optimisation) + Phase 6 (tests)
5. **Si temps disponible** : Améliorations et fonctionnalités avancées

## 💡 Décisions à prendre

1. **Historique** : Sous-collection ou collection globale ?
2. ~~**Infos artiste** : Dans contact ou collection séparée ?~~ ✅ Utiliser collection `artistes` existante
3. **Performance** : Limite de résultats par défaut ?
4. **Sécurité** : Qui peut voir quelles sélections partagées ?
5. **Fiche projet** : Réutiliser les composants de ContactView ou créer des composants dédiés ?

## 📊 Estimation totale : 17-20 jours (révisée avec fiche projet complète)

## 📈 Progression actuelle

### ✅ Complété (07/01/2025)

#### Infrastructure (Phase 1) ✅
- **Phase 1.1** : Service de recherche et mapping des champs
  - `searchService.js` avec tous les opérateurs
  - `searchFieldsMapping.js` pour 6 collections
  - Support multi-critères et multi-collections
  - Gestion intelligente Firestore vs filtrage local
- **Phase 1.2** : Intégration dans RechercheLayout
  - Boutons Calculer, Afficher, Enregistrer fonctionnels
  - Affichage des résultats dans la zone centrale
  - Modal de sauvegarde
  - Navigation entre critères et résultats

#### Sections connectées (Phase 2 complétée) ✅
- **2.1 Identification** ✅
  - Mapping complet des champs
  - Tous les opérateurs fonctionnels
  - Gestion des dates et booléens
  - Labels lisibles et mise à jour dynamique
- **2.2 Activités** ✅
  - Utilisation de la vraie hiérarchie TAGS_HIERARCHY
  - Mapping vers le champ `tags` Firebase
  - Support des sous-catégories avec indentation
  - Sélection multiple avec un seul critère
- **2.4 Genres** ✅
  - Hiérarchie complète depuis GENRES_HIERARCHY
  - Interface accordéon par catégorie
  - Mapping vers `tags` comme les activités
- **2.5 Géolocalisation** ✅
  - Tous les champs géographiques mappés
  - Opérateurs spécifiques par type
  - Labels lisibles pour les sélections
- **2.3 Réseaux** ✅
  - Utilisation de RESEAUX_HIERARCHY (53 réseaux)
  - Mapping vers le champ `tags` Firebase
  - Recherche et filtrage interactif
  - Sélection multiple avec compteur
- **2.6 Festivals** ✅
  - Mapping complet : nomFestival, commentaires, bouclage
  - Sélection multi-mois pour bouclage
  - Grille interactive pour périodes de diffusion
  - Conversion des semaines en description lisible
- **2.7 Salles** ✅
  - Mapping des critères techniques (jauge, dimensions)
  - Recherche par plage de valeurs (min/max)
  - Opérateurs dynamiques adaptés
  - Unités d'affichage contextuelles
- **2.8 Dates** ✅
  - Refonte du champ niveau avec 6 états
  - Composant NiveauDisplay pour affichage visuel
  - Recherche par titre, période, montant
  - Relations avec artistes et lieux

### 🚧 Prochaines étapes immédiates
1. ~~**Phase 2.1** : Connecter la section Identification~~ ✅
2. ~~**Phase 2.2** : Connecter la section Activités~~ ✅
3. ~~**Phase 2.3** : Connecter la section Réseaux~~ ✅
4. ~~**Phase 2.4** : Connecter la section Genres~~ ✅
5. ~~**Phase 2.5** : Connecter la section Géolocalisation~~ ✅
6. ~~**Phase 2.6** : Connecter la section Festivals~~ ✅
7. ~~**Phase 2.7** : Connecter la section Salles~~ ✅
8. ~~**Phase 2.8** : Connecter la section Dates~~ ✅
9. ~~**Phase 3.2** : Mes sélections~~ ✅
10. **Phase 3.3** : Connecter PersonnesSection au système de recherche
11. **Phase 4** : Sections complexes (Fiche projet, Historique, Infos artiste)

### 📊 Métriques de progression
- **Infrastructure** : 100% ✅ (service créé et intégré)
- **Phase 1** : 100% ✅ (infrastructure complète)
- **Phase 2** : 100% ✅ (8/8 sections connectées)
- **Phase 3** : 33% (1/3 fonctionnalités - Mes sélections ✅)
- **Global** : ~45% du projet complet

### 🎯 Accomplissements du jour 1
- ✅ Infrastructure complète de recherche (Phase 1)
- ✅ Service de recherche avec tous les opérateurs
- ✅ Intégration UI avec boutons fonctionnels
- ✅ 8 sections connectées (Phase 2 complète)
- ✅ Système de recherche multi-critères opérationnel
- ✅ Refonte du champ niveau pour les dates avec affichage visuel adapté
- ✅ Implémentation complète de "Mes sélections" (Phase 3.2)
- ✅ Service selectionsService.js pour gérer les recherches sauvegardées
- ✅ Intégration dans RechercheLayout avec chargement des sélections

### 📅 Planning révisé
- **Aujourd'hui** : 10 tâches majeures accomplies (infrastructure + 8 sections + Mes sélections)
- **Estimation** : Phase 2 COMPLÉTÉE ✅ + Phase 3 en cours (33%)
- **Gain de temps** : ~2 semaines d'avance sur le planning initial
- **Rythme actuel** : 3x plus rapide que prévu

---
*Plan mis à jour le 07/01/2025 - Phase 2 COMPLÉTÉE + Phase 3.2 (Mes sélections) COMPLÉTÉE*