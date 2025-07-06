# Plan d'implémentation - Système de recherche multi-critères
**Date : 06/01/2025**
**Mise à jour après audit : 06/01/2025**

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

#### 1.1 Service de recherche principal
- [ ] Créer `services/searchService.js`
- [ ] Créer `config/searchFieldsMapping.js` pour le mapping UI → Firebase
- [ ] Implémenter les opérateurs de base :
  - `contient` : Recherche textuelle
  - `egal` : Correspondance exacte
  - `entre` : Plage de valeurs
  - `parmi` : Multi-sélection
  - `commence` / `termine` : Préfixe/suffixe
  - `non_renseigne` : Champs vides

#### 1.2 Intégration dans RechercheLayout
- [ ] Connecter le service de recherche
- [ ] Implémenter `executeSearch()` qui utilise les critères
- [ ] Gérer l'état des résultats
- [ ] Créer un composant de résultats

### Phase 2 : Sections sans modification de données (3-4 jours)

#### 2.1 Identification ✅
- [ ] Mapper : nom, prénom, email, téléphone, structure
- [ ] Implémenter la recherche textuelle

#### 2.2 Activités ✅
- [ ] Utiliser le champ `tags` existant
- [ ] Filtrer par hiérarchie TAGS_HIERARCHY
- [ ] Recherche dans contacts, artistes et projets

#### 2.3 Réseaux ✅
- [ ] Utiliser RESEAUX_HIERARCHY
- [ ] Recherche dans le champ `tags`

#### 2.4 Genres ✅
- [ ] Utiliser GENRES_HIERARCHY
- [ ] Recherche dans les festivals et contacts
- [ ] Recherche aussi dans la collection `artistes` (champ genre)

#### 2.5 Géolocalisation ✅
- [ ] Mapper : adresse, codePostal, ville, pays, région, département
- [ ] Implémenter la recherche géographique
- [ ] Compléter les champs vides (département/région) lors des sauvegardes

#### 2.6 Festivals ✅
- [ ] Mapper : nomFestival, periodeFestivalMois, bouclage
- [ ] Utiliser aussi la collection `festivals` séparée

#### 2.7 Salles ✅
- [ ] Mapper : salleJauge1/2/3, dimensions scène
- [ ] Recherche par plage de valeurs

#### 2.8 Dates ✅
- [ ] Utiliser la collection `dates`
- [ ] Implémenter les filtres complexes

### Phase 3 : Ajout de fonctionnalités (2-3 jours)

#### 3.1 Personnes - Ajout du champ priorité
- [ ] Ajouter `priorite` dans ContactForm
- [ ] Migration des contacts existants (priorité par défaut)
- [ ] Implémenter le filtre

#### 3.2 Mes sélections - Nouvelle fonctionnalité
- [ ] Créer collection `selections` dans Firebase
- [ ] Structure : `{nom, type, criteres, userId, shared, createdAt}`
- [ ] Service pour sauvegarder/charger les sélections
- [ ] UI pour gérer les sélections

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

1. **Semaine 1** : Phases 1 et 2 (sections existantes)
2. **Semaine 2** : Phase 3 (fonctionnalités simples)
3. **Semaine 3** : Phase 4 (fiche projet et sections complexes)
4. **Semaine 4** : Phases 5 et 6 (optimisation et tests)

## 💡 Décisions à prendre

1. **Historique** : Sous-collection ou collection globale ?
2. ~~**Infos artiste** : Dans contact ou collection séparée ?~~ ✅ Utiliser collection `artistes` existante
3. **Performance** : Limite de résultats par défaut ?
4. **Sécurité** : Qui peut voir quelles sélections partagées ?
5. **Fiche projet** : Réutiliser les composants de ContactView ou créer des composants dédiés ?

## 📊 Estimation totale : 17-20 jours (révisée avec fiche projet complète)

---
*Plan validé et prêt pour implémentation*