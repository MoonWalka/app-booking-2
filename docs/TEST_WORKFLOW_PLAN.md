# Plan du Workflow de Test Complet - TourCraft

## 🎯 Objectif
Créer un système de test exhaustif qui valide l'intégralité du workflow de l'application, depuis la création des entités jusqu'à la génération des contrats.

## 📊 Architecture du Système de Test

### 1. Points d'Entrée
- **Outil Debug** (page dédiée) : Point central pour lancer tous les tests
- **Boutons de test contextuels** : Sur chaque formulaire pour tester spécifiquement

### 2. Scénarios de Test

#### Scénario A : Workflow Complet (de zéro)
1. Créer un artiste complet
2. Créer une structure organisatrice avec contacts
3. Créer un lieu avec toutes les infos techniques
4. Créer un concert liant toutes ces entités
5. Envoyer et remplir le formulaire public de contact
6. Envoyer et remplir le pré-contrat
7. Générer le contrat final
8. Vérifier toutes les relations

#### Scénario B : Workflow avec Entités Existantes
1. Sélectionner un artiste existant
2. Sélectionner une structure existante
3. Créer un nouveau concert
4. Tester le workflow de formulaires
5. Vérifier l'enrichissement des données

#### Scénario C : Test des Formulaires Publics
1. Simuler la réception d'un lien de formulaire
2. Remplir automatiquement PublicContactForm
3. Remplir automatiquement PreContratFormPublic
4. Vérifier la sauvegarde dans formSubmissions

### 3. Points de Vérification

#### Vérifications Immédiates
- ✅ Entité créée avec tous les champs
- ✅ Relations bidirectionnelles établies
- ✅ Présence dans les listes appropriées
- ✅ Filtrage par organisation correct

#### Vérifications de Workflow
- ✅ Concert visible dans la liste des dates
- ✅ Concert visible dans la fiche contact associée
- ✅ Artiste visible dans les artistes
- ✅ Structure visible dans les contacts
- ✅ Lieu visible dans les lieux

#### Vérifications de Données
- ✅ Tous les champs obligatoires remplis
- ✅ Formats de données corrects (dates, emails, téléphones)
- ✅ Relations cohérentes entre entités
- ✅ Flag isTest présent pour le nettoyage

### 4. Structure des Données de Test

```javascript
{
  // Artiste
  artiste: {
    nom: "[TEST] Les Rockeurs Fantastiques",
    genre: "Rock",
    projets: [{
      nom: "Tournée 2025",
      description: "Grande tournée nationale"
    }],
    contactNom: "Manager Test",
    contactEmail: "manager@test.com",
    contactTelephone: "06 12 34 56 78"
  },
  
  // Structure
  structure: {
    type: "structure",
    structureRaisonSociale: "[TEST] Association CultureLive",
    structureAdresse: "123 rue de la Culture",
    structureCodePostal: "75001",
    structureVille: "Paris",
    structureSiret: "12345678901234",
    personnes: [{
      nom: "Dupont",
      prenom: "Jean",
      fonction: "Directeur",
      email: "jean.dupont@test.com",
      telephone: "01 23 45 67 89"
    }]
  },
  
  // Lieu
  lieu: {
    nom: "[TEST] Salle des Fêtes Municipale",
    adresse: "Place de la Mairie",
    codePostal: "75002",
    ville: "Paris",
    capacite: 500,
    dimensionsScene: {
      largeur: 10,
      profondeur: 8,
      hauteur: 5
    }
  },
  
  // Concert
  concert: {
    date: "2025-03-15",
    heure: "20:30",
    libelle: "[TEST] Concert Rock Printemps",
    statut: "En cours",
    cachetBrut: 3000,
    notes: "Concert de test automatisé"
  }
}
```

### 5. Outputs du Test

#### Rapport JSON
```javascript
{
  "testId": "test_2025_01_15_143025",
  "timestamp": "2025-01-15T14:30:25.123Z",
  "entrepriseId": "9LjkCJG04pEzbABdHkSf",
  "entitiesCreated": {
    "artiste": { id: "...", nom: "..." },
    "structure": { id: "...", nom: "..." },
    "lieu": { id: "...", nom: "..." },
    "concert": { id: "...", date: "..." }
  },
  "verificationsPassees": {
    "artisteVisible": true,
    "structureVisible": true,
    "lieuVisible": true,
    "concertVisible": true,
    "relationsEtablies": true,
    "formulairesRemplis": true
  },
  "erreurs": [],
  "dureeTest": "2.5s"
}
```

#### Logs Console
- 🧪 Début du test workflow complet
- ✅ Artiste créé: ID xxx
- ✅ Structure créée: ID xxx
- ✅ Lieu créé: ID xxx
- ✅ Concert créé: ID xxx
- ✅ Relations vérifiées
- ✅ Présence dans les listes confirmée
- 📊 Rapport de test généré

### 6. Nettoyage
- Toutes les entités créées ont `isTest: true`
- Un bouton "Nettoyer tous les tests" supprime tout
- Possibilité de nettoyer par type d'entité

## 🚀 Implémentation

### Phase 1 : Page Debug Tools
- Créer `/debug` avec tous les outils de test
- Interface claire avec boutons pour chaque scénario
- Affichage en temps réel des résultats

### Phase 2 : Tests Unitaires
- Test de création de chaque entité
- Test de chaque formulaire individuellement
- Validation des champs et formats

### Phase 3 : Tests d'Intégration
- Test du workflow complet
- Test des relations entre entités
- Test des formulaires publics

### Phase 4 : Rapport et Monitoring
- Génération automatique du rapport JSON
- Sauvegarde des rapports de test
- Dashboard de suivi des tests